const STOCKS = [
  { name: "三一重工", ticker: "600031", dividend: 0.49 },
  { name: "海螺水泥", ticker: "600585", dividend: 0.90 },
  { name: "方大特钢", ticker: "600507", dividend: 0.20 },
  { name: "包钢股份", ticker: "600010", dividend: 0 },
  { name: "山东高速", ticker: "600350", dividend: 0.42 },
  { name: "中国联通", ticker: "600050", dividend: 0.1635 }
];

const DATA_URL = "./data/dividend-radar-quotes.json";
const REFRESH_MS = 30000;

const money = v => v == null ? "—" : Number(v).toFixed(2);
const pct = v => v == null ? "—" : Number(v).toFixed(2) + "%";
const target = (d, y) => d > 0 ? d / y : null;

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

  for (const s of STOCKS) {
    const q = quotes[s.ticker];
    const y = q && s.dividend > 0 ? s.dividend / q.price * 100 : null;
    if (y != null) valid.push({ s, y });

    const cls = q ? (q.change > 0 ? "up" : q.change < 0 ? "down" : "") : "";
    rows += "<tr>" +
      "<td><span class='stock-name'>" + s.name + "</span><span class='ticker'>" + s.ticker + "</span></td>" +
      "<td class='price'>" + (q ? money(q.price) : "—") + "</td>" +
      "<td class='" + cls + "'>" + (q ? money(q.change) + " (" + pct(q.changePct) + ")" : "—") + "</td>" +
      "<td>" + money(s.dividend) + "</td>" +
      "<td class='yield'>" + pct(y) + "</td>" +
      "<td class='target'>" + (target(s.dividend, .045) ? money(target(s.dividend, .045)) : "—") + "</td>" +
      "<td class='target'>" + (target(s.dividend, .05) ? money(target(s.dividend, .05)) : "—") + "</td>" +
      "<td class='target'>" + (target(s.dividend, .06) ? money(target(s.dividend, .06)) : "—") + "</td>" +
      "<td>" + (q ? "<span class='badge live'>LIVE</span>" : "<span class='badge'>无行情</span>") + "</td>" +
      "</tr>";
  }

  document.getElementById("radarBody").innerHTML = rows;

  const highest = valid.length ? valid.reduce((a,b) => a.y > b.y ? a : b) : null;
  const five = valid.filter(x => x.y >= 5).length;
  const count = Object.values(quotes).filter(Boolean).length;
  const generated = payload && payload.generatedAt ? new Date(payload.generatedAt) : null;

  document.getElementById("summaryCards").innerHTML =
    "<div class='card'><div class='card-label'>当前最高股息率</div><div class='card-value'>" +
      (highest ? highest.s.name + " " + pct(highest.y) : "—") +
    "</div><div class='card-note'>按最新抓取股价自动计算</div></div>" +
    "<div class='card'><div class='card-label'>达到5%股息率</div><div class='card-value'>" +
      five + " / " + STOCKS.length +
    "</div><div class='card-note'>按设定年度现金分红</div></div>" +
    "<div class='card'><div class='card-label'>行情连接</div><div class='card-value'>" +
      count + " / " + STOCKS.length +
    "</div><div class='card-note'>后台每5分钟更新；页面每30秒检查</div></div>";

  const status = document.getElementById("marketStatus");
  status.textContent = count === STOCKS.length ? "🟢 行情已连接" : "🟡 行情部分可用";
  document.getElementById("lastUpdated").textContent =
    generated ? "行情抓取：" + generated.toLocaleString("zh-CN", { hour12:false }) : "等待首次抓取";

  const notice = document.querySelector(".notice span");
  if (notice) {
    notice.textContent = tradingLabel()
      ? "交易时段：后台行情自动更新；股息率 = 年度现金分红 ÷ 最新股价。"
      : "非交易时段：显示最近一次抓取数据；交易时段后台自动更新。";
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
