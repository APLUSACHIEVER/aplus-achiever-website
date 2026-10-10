# KING OF PSLE VOCABULARY — shared leaderboard setup

This uses a JSON file in GitHub as the shared score file. No traditional database is used.

## One-time setup

1. Open [Google Apps Script](https://script.google.com/) and create a new project.
2. Copy the contents of `Code.gs` in this folder into the Apps Script editor.
3. In GitHub, create a fine-grained personal access token limited to this repository, with **Contents: Read and write**. Do not put this token in the website or commit it into any file.
4. In Apps Script, open **Project Settings → Script Properties** and add:
   - Property: `GITHUB_TOKEN`
   - Value: your GitHub token
5. Deploy → **New deployment** → type **Web app**. Execute as **Me**. Set access to **Anyone** so students can submit without signing in. Deploy and copy the Web App URL.
6. In `king-of-psle-vocabulary.html`, set `LEADERBOARD_SUBMIT_URL` to the deployed Web App URL.
7. Test a submission, then confirm that `data/leaderboard.json` contains the attempt and the public page shows the updated top 10.

## Data and ranking rules

- `data/leaderboard.json` stores every accepted challenge attempt.
- The public leaderboard groups attempts by normalized nickname and shows each nickname's best result only.
- Sort by K币 descending, then accuracy descending. Remaining ties are ordered by earlier completion time.
- Nicknames are public. Do not enter real names, phone numbers, or other personal information.

## Important limitation

This lightweight version checks score ranges and that K币 equals score × 5, but the client can still be manipulated. It is suitable for a friendly classroom leaderboard, not a prize contest or a tamper-proof competition. Public write access may also be abused; review the file and revoke the Apps Script deployment/token if needed.
