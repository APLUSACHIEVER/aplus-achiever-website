/**
 * KING OF PSLE VOCABULARY — GitHub JSON leaderboard bridge
 * Deploy this project as a Google Apps Script Web App.
 * Store GITHUB_TOKEN in Script Properties (never in the website).
 */
const OWNER = 'APLUSACHIEVER';
const REPO = 'aplus-achiever-website';
const BRANCH = 'main';
const FILE_PATH = 'data/leaderboard.json';
const API_URL = 'https://api.github.com/repos/' + OWNER + '/' + REPO + '/contents/' + FILE_PATH;

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.parameter && e.parameter.payload) || '{}');
    const nickname = cleanNickname(payload.nickname);
    const coins = Number(payload.coins);
    const score = Number(payload.score);
    const accuracy = Number(payload.accuracy);
    const answered = Number(payload.answered);

    if (!nickname) return page('Please enter a nickname.');
    if (!Number.isInteger(score) || score < 0 || score > 30 ||
        !Number.isInteger(coins) || coins !== score * 5 ||
        !Number.isFinite(accuracy) || accuracy < 0 || accuracy > 100 ||
        !Number.isInteger(answered) || answered < score || answered > 30) {
      return page('Invalid score data.');
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
      if (!token) throw new Error('Missing GITHUB_TOKEN in Script Properties.');
      const headers = { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
      let current = { sha: null, data: { updatedAt: null, attempts: [] } };
      const getResp = UrlFetchApp.fetch(API_URL, { method: 'get', headers: headers, muteHttpExceptions: true });
      if (getResp.getResponseCode() === 200) {
        const file = JSON.parse(getResp.getContentText());
        current.sha = file.sha;
        current.data = JSON.parse(Utilities.newBlob(Utilities.base64Decode(file.content.replace(/\n/g, ''))).getDataAsString('UTF-8'));
      } else if (getResp.getResponseCode() !== 404) {
        throw new Error('GitHub read failed: ' + getResp.getResponseCode());
      }
      if (!Array.isArray(current.data.attempts)) current.data.attempts = [];
      current.data.attempts.push({
        nickname: nickname,
        coins: coins,
        score: score,
        accuracy: Math.round(accuracy),
        answered: answered,
        completedAt: new Date().toISOString()
      });
      current.data.updatedAt = new Date().toISOString();
      const encoded = Utilities.base64Encode(Utilities.newBlob(JSON.stringify(current.data, null, 2) + '\n').getBytes());
      const body = { message: 'Update KING OF PSLE VOCABULARY leaderboard', content: encoded, branch: BRANCH };
      if (current.sha) body.sha = current.sha;
      const putResp = UrlFetchApp.fetch(API_URL, {
        method: 'put', contentType: 'application/json', headers: headers,
        payload: JSON.stringify(body), muteHttpExceptions: true
      });
      const code = putResp.getResponseCode();
      if (code < 200 || code >= 300) throw new Error('GitHub write failed: ' + code + ' ' + putResp.getContentText());
    } finally {
      lock.releaseLock();
    }
    return page('Score submitted! You can return to the game.');
  } catch (err) {
    return page('Submission failed. Please try again later.');
  }
}

function cleanNickname(value) {
  return String(value || '').replace(/[<>\u0000-\u001F]/g, '').trim().replace(/\s+/g, ' ').slice(0, 20);
}

function page(message) {
  return HtmlService.createHtmlOutput('<!doctype html><html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font:16px Arial,sans-serif;padding:24px;color:#193c31">' + message + '</body></html>');
}
