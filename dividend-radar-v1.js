/*
 * APLUS Dividend Radar V1
 * New standalone module. Does not modify existing site files.
 *
 * Live quote source: Tencent Finance public quote endpoint.
 * The endpoint returns ~-separated fields; field 3 is latest price,
 * 31 is change, 32 is change %, and 30 is quote timestamp.
 */

const STOCKS = [
  { name: "三一重工", ticker: "600031", market: "sh", dividend: 0.49 },
  { name: "海螺水泥", ticker: "600585", market: "sh", dividend: 0.90 },
  { name: "方大特钢", ticker: "600507", market: "sh", dividend: 0.20 },
  { name: "包钢股份", ticker: "600010", market: "sh", dividend: 0.00 },
  { name: "山东高速", ticker: "600350", market: "sh", dividend: 0.42 },
  { name: "中国联通", ticker: "600050", market: "sh", dividend: 0.1635 }
];

const REFRESH_MS = 10000;
let loading = false;

function money(v) {
  return Number.isFinite(v) ? v.toFixed(2) : "—";
}

function pct(v) {
  return Number.isFinite(v) ? v.toFixed(2) + "%" : "—";
}

function targetPrice(dividend, targetYield) {
  if (!dividend || dividend <= 0) return null;
  return dividend / targetYield;
}

function quoteStatus() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const weekday = now.getDay();
  const mins = h * 60 + m;
  const tradingDay = weekday >= 1 && weekday <= 5;
  return tradingDay && mins >= 570 && mins <= 900;
}

function parseQuote(raw) {
  const match = raw && raw.match(/="([^"]*)"/);
  if (!match) return null;
  const f = match[1].split("~");
  const price = Number(f[3]);
  const yesterday = Number(f[4]);
  return {
    name: f[1],
    ticker: f[2],
    price,
    yesterday,
    change: Number(f[31]),
    changePct: Number(f[32]),
    timestamp: f[30] || ""
  };
}

function loadTencentQuotes() {
  return new Promise((resolve, reject) => {
    const callback = "__aplusradar_" + Date.now();
    const codes = STOCKS.map(s => s.market + s.ticker).join(",");
    const script = document.createElement("script");
    script.src = "https://qt.gtimg.cn/q=" + codes + "&_=" + Date.now();
    script.charset = "gbk";

    const values = {};
    const oldGlobals = {};

    STOCKS.forEach(stock => {
      const key = "v_" + stock.market + stock.ticker;
      oldGlobals[key] = window[key];
    });

    script.onload = () => {
      STOCKS.forEach(stock => {
        const key = "v_" + stock.market + stock.ticker;
        values[stock.ticker] = parseQuote(window[key] || "");
        try { window[key] = oldGlobals[key]; } catch (_) {}
      });
      script.remove();
      resolve(values);
    };

    script.onerror = () => {
      script.remove();
      reject(new Error("行情接口连接失败"));
    };

    document.head.appendChild(script);
  });
}

function render(quotes) {
  const body = document.getElementById("radarBody");
  const cards = document.getElementById("summaryCards");
  let rows = "";
  let data = [];

  STOCKS.forEach(stock => {
    const q = quotes[stock.ticker];
    const yieldRate = q && q.price > 0 && stock.dividend > 0
      ? stock.dividend / q.price * 100
      : null;

    data.push({ stock, q, yieldRate });

    const changeClass = q && q.change > 0 ? "up" : q && q.change < 0 ? "down" : "";
    const status = q ? '<span class="badge live">LIVE</span>' : '<span class="badge">无行情</span>';

    rows += '<tr>' +
      '<td><span class="stock-name">' + stock.name + '</span><span class="ticker">' + stock.ticker + '</span></td>' +
      '<td class="price">' + (q ? money(q.price) : "—") + '</td>' +
      '<td class="' + changeClass + '">' + (q ? money(q.change) + ' (' + pct(q.changePct) + ')' : "—") + '</td>' +
      '<td>' + money(stock.dividend) + '</td>' +
      '<td class="yield">' + pct(yieldRate) + '</td>' +
      '<td class="target">' + (targetPrice(stock.dividend, .045) ? money(targetPrice(stock.dividend, .045)) : "—") + '</td>' +
      '<td class="target">' + (targetPrice(stock.dividend, .05) ? money(targetPrice(stock.dividend, .05)) : "—") + '</td>' +
      '<td class="target">' + (targetPrice(stock.dividend, .06) ? money(targetPrice(stock.dividend, .06)) : "—") + '</td>' +
      '<td>' + status + '</td>' +
      '</tr>';
  });

  body.innerHTML = rows;

  const valid = data.filter(x => Number.isFinite(x.yieldRate));
  const highest = valid.length ? valid.reduce((a,b) => a.yieldRate > b.yieldRate ? a : b) : null;
  const fivePct = valid.filter(x => x.yieldRate >= 5).length;

  cards.innerHTML =
    '<div class="card"><div class="card-label">当前最高股息率</div><div class="card-value">' +
    (highest ? highest.stock.name + ' ' + pct(highest.yieldRate) : "—") +
    '</div><div class="card-note">按当前实时价格自动计算</div></div>' +
    '<div class="card"><div class="card-label">达到5%股息率</div><div class="card-value">' +
    fivePct + ' / ' + STOCKS.length +
    '</div><div class="card-note">仅按设定年度股息计算</div></div>' +
    '<div class="card"><div class="card-label">刷新频率</div><div class="card-value">10 秒</div><div class="card-note">交易时段自动更新</div></div>';
}

async function refresh() {
  if (loading) return;
  loading = true;
  const status = document.getElementById("marketStatus");
  const updated = document.getElementById("lastUpdated");
  try {
    const quotes = await loadTencentQuotes();
    render(quotes);
    status.textContent = quoteStatus() ? "🟢 实时行情" : "⚪ 最近行情";
    updated.textContent = "更新：" + new Date().toLocaleTimeString("zh-CN", { hour12:false });
  } catch (error) {
    status.textContent = "🔴 行情连接失败";
    updated.textContent = error.message;
  } finally {
    loading = false;
  }
}

refresh();
setInterval(refresh, REFRESH_MS);
