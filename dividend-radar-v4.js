// APLUS Dividend Radar — isolated high-dividend × low-PE engine
// Core dividend yield = latest completed fiscal-year cash dividend / latest price.
// PE = Eastmoney dynamic PE (f162). Negative / zero PE is treated as unavailable.
const STOCKS = Object.entries(DIVIDEND_DATA).map(([ticker, d]) => ({ ticker, ...d }));

const DATA_URL = "./data/dividend-radar-quotes.json";
const REFRESH_MS = 30000;
const MAX_REASONABLE_YIELD = 15; // abnormal-data warning threshold; never silently cap the yield
const STABILITY_YEARS = 5;

const money = v => v == null || !Number.isFinite(Number(v)) ? "—" : Number(v).toFixed(2);
const pct = v => v == null || !Number.isFinite(Number(v)) ? "—" : Number(v).toFixed(2) + "%";
const target = (d, y) => d > 0 && y > 0 ? d / y : null;

function dividendScore(y) {
  if (!Number.isFinite(y) || y < 0) return null;
  // 6% completed-year cash yield = 100 points; no silent capping of the displayed yield.
  return Math.min(100, y / 6 * 100);
}

function peScore(pe) {
  if (!Number.isFinite(pe) || pe <= 0) return null;
  // Lower positive dynamic PE gets a higher score; 8x = 100 points.
  return Math.max(0, Math.min(100, 8 / pe * 100));
}

function stabilityScore(history) {
  if (!history || !Array.isArray(history.years) || history.years.length !== STABILITY_YEARS) return null;
  const vals = history.years.map(Number);
  const paid = vals.filter(v => Number.isFinite(v) && v > 0).length;
  const continuity = paid / STABILITY_YEARS * 100;
  const recent = vals.slice(-3);
  const recentConsistency = recent.filter(v => v > 0).length / 3 * 100;
  const avg = vals.reduce((a,b) => a + (Number.isFinite(b) ? b : 0), 0) / STABILITY_YEARS;
  const latest = vals[vals.length - 1];
  const trend = avg > 0 ? Math.max(0, Math.min(100, latest / avg * 100)) : 0;
  return continuity * 0.5 + recentConsistency * 0.3 + trend * 0.2;
}

function radarScore(y, pe, stability) {
  const ds = dividendScore(y);
  const ps = peScore(pe);
  if (ds == null || ps == null) return null;
  if (stability == null) return ds * 0.6 + ps * 0.4;
  return ds * 0.45 + ps * 0.30 + stability * 0.25;
}

function tradingLabel() {
  const now = new Date();
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();
  return day >= 1 && day <= 5 && mins >= 570 && mins < 900;
}

async function loadQuotes() {
  const r = await fetch(DATA_URL + "?t=" + Date.now(), { cache: "no-store" });
  if (!r.ok) throw new Error("行情数据文件暂不可用");
  return await r.json();
}

function render(payload) {
  const quotes = payload && payload.quotes ? payload.quotes : {};
  let rows = "";
  const valid = [];
  let abnormal = 0;

  for (const s of STOCKS) {
    const q = quotes[s.ticker];
    const price = q ? Number(q.price) : null;
    const y = q && s.dividend > 0 && price > 0 ? s.dividend / price * 100 : null;
    const pe = q && Number.isFinite(Number(q.pe)) ? Number(q.pe) : null;
    const isAbnormal = y != null && y > MAX_REASONABLE_YIELD;
    const stability = stabilityScore(DIVIDEND_HISTORY[s.ticker]);
    const score = !isAbnormal ? radarScore(y, pe, stability) : null;
    if (isAbnormal) abnormal++;
    if (score != null) valid.push({ s, y, pe, score });

    const cls = q ? (q.change > 0 ? "up" : q.change < 0 ? "down" : "") : "";
    const yieldDisplay = isAbnormal ? "异常 " + pct(y) : pct(y);
    const peDisplay = pe != null && pe > 0 ? money(pe) + "x" : "—";
    const scoreDisplay = score != null ? score.toFixed(0) : "—";
    const stabilityDisplay = stability != null ? stability.toFixed(0) : "—";
    const status = isAbnormal ? "<span class='badge'>异常数据</span>" :
      (q ? "<span class='badge live'>LIVE</span>" : "<span class='badge'>无行情</span>");

    rows += "<tr>" +
      "<td><span class='stock-name'>" + s.name + "</span><span class='ticker'>" + s.ticker + "</span></td>" +
      "<td class='price'>" + (q ? money(q.price) : "—") + "</td>" +
      "<td class='" + cls + "'>" + (q ? money(q.change) + " (" + pct(q.changePct) + ")" : "—") + "</td>" +
      "<td>" + money(s.dividend) + "</td>" +
      "<td class='yield'>" + yieldDisplay + "</td>" +
      "<td>" + peDisplay + "</td>" +
      "<td>" + scoreDisplay + "</td>" +
      "<td>" + stabilityDisplay + "</td>" +
      "<td class='target'>" + (target(s.dividend, .045) ? money(target(s.dividend, .045)) : "—") + "</td>" +
      "<td class='target'>" + (target(s.dividend, .05) ? money(target(s.dividend, .05)) : "—") + "</td>" +
      "<td class='target'>" + (target(s.dividend, .06) ? money(target(s.dividend, .06)) : "—") + "</td>" +
      "<td>" + status + "</td>" +
      "</tr>";
  }

  document.getElementById("radarBody").innerHTML = rows;

  const highest = valid.length ? valid.reduce((a,b) => a.y > b.y ? a : b) : null;
  const bestRadar = valid.length ? valid.reduce((a,b) => a.score > b.score ? a : b) : null;
  const five = valid.filter(x => x.y >= 5).length;
  const lowPE = valid.filter(x => x.pe <= 12).length;
  const stable = valid.filter(x => stabilityScore(DIVIDEND_HISTORY[x.s.ticker]) >= 80).length;
  const count = Object.values(quotes).filter(Boolean).length;
  const generated = payload && payload.generatedAt ? new Date(payload.generatedAt) : null;

  document.getElementById("summaryCards").innerHTML =
    "<div class='card'><div class='card-label'>当前最高有效股息率</div><div class='card-value'>" +
      (highest ? highest.s.name + " " + pct(highest.y) : "—") +
    "</div><div class='card-note'>年度现金分红 ÷ 最新股价；异常值不参与综合分</div></div>" +
    "<div class='card'><div class='card-label'>高股息 × 低PE</div><div class='card-value'>" +
      (bestRadar ? bestRadar.s.name + " " + bestRadar.score.toFixed(0) : "—") +
    "</div><div class='card-note'>股息率45% + 动态PE30% + 分红稳定性25%</div></div>" +
    "<div class='card'><div class='card-label'>达到5%股息率</div><div class='card-value'>" +
      five + " / " + STOCKS.length +
    "</div><div class='card-note'>当前有效数据中；低PE≤12x：" + lowPE + "只；稳定性≥80：" + stable + "只</div></div>" +
    "<div class='card'><div class='card-label'>数据状态</div><div class='card-value'>" +
      count + " / " + STOCKS.length +
    "</div><div class='card-note'>PE来自东方财富动态PE；异常值：" + abnormal + "</div></div>";

  const status = document.getElementById("marketStatus");
  status.textContent = count === STOCKS.length ? "🟢 行情已连接" : "🟡 行情部分可用";
  document.getElementById("lastUpdated").textContent =
    generated ? "行情抓取：" + generated.toLocaleString("zh-CN", { hour12:false }) : "等待首次抓取";

  const notice = document.querySelector(".notice span");
  if (notice) {
    notice.textContent = tradingLabel()
      ? "交易时段：后台自动更新；股息率 = 已完成年度现金分红 ÷ 最新股价；动态PE用于低估值交叉分析。"
      : "非交易时段：显示最近一次抓取数据；股息率采用已完成年度现金分红，动态PE用于低估值交叉分析。";
  }
}

async function refresh() {
  try {
    render(await loadQuotes());
  } catch (e) {
    document.getElementById("marketStatus").textContent = "🟠 等待行情数据";
    document.getElementById("lastUpdated").textContent = "后台首次更新可能需要几分钟";
  }
}

refresh();
setInterval(refresh, REFRESH_MS);
