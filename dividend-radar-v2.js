/* APLUS Dividend Radar V2 — isolated quote engine.
 * Uses Eastmoney JSONP so GitHub Pages can receive browser-side quote data
 * without requiring a server-side API key. This file only serves dividend-radar.html.
 */
const STOCKS = [
  { name:"三一重工", ticker:"600031", secid:"1.600031", dividend:0.49 },
  { name:"海螺水泥", ticker:"600585", secid:"1.600585", dividend:0.90 },
  { name:"方大特钢", ticker:"600507", secid:"1.600507", dividend:0.20 },
  { name:"包钢股份", ticker:"600010", secid:"1.600010", dividend:0.00 },
  { name:"山东高速", ticker:"600350", secid:"1.600350", dividend:0.42 },
  { name:"中国联通", ticker:"600050", secid:"1.600050", dividend:0.1635 }
];
const REFRESH_MS = 10000;
let loading = false;

function money(v){ return Number.isFinite(v) ? v.toFixed(2) : "—"; }
function pct(v){ return Number.isFinite(v) ? v.toFixed(2)+"%" : "—"; }
function targetPrice(d,y){ return d > 0 ? d/y : null; }

function loadQuote(stock){
  return new Promise((resolve,reject)=>{
    const cb = "__aplusradar_" + stock.ticker + "_" + Date.now();
    const timer = setTimeout(()=>{ cleanup(); reject(new Error("行情超时")); },8000);
    function cleanup(){
      clearTimeout(timer);
      const s=document.getElementById(cb+"_script");
      if(s) s.remove();
      try{ delete window[cb]; }catch(_){}
    }
    window[cb] = function(resp){
      try{
        const d = resp && resp.data;
        if(!d || !Number.isFinite(Number(d.f43))) throw new Error("无有效行情");
        resolve({
          name:d.f58 || stock.name,
          ticker:d.f57 || stock.ticker,
          price:Number(d.f43)/100,
          change:Number(d.f169)/100,
          changePct:Number(d.f170)/100,
          yesterday:Number(d.f60)/100
        });
      }catch(e){ reject(e); }
      finally{ cleanup(); }
    };
    const s=document.createElement("script");
    s.id=cb+"_script";
    s.src="https://push2.eastmoney.com/api/qt/stock/get?secid="+encodeURIComponent(stock.secid)+"&fields=f57,f58,f43,f169,f170,f60&cb="+cb+"&_="+Date.now();
    s.onerror=()=>{ cleanup(); reject(new Error("行情接口连接失败")); };
    document.head.appendChild(s);
  });
}

function isTradingTime(){
  const n=new Date(), day=n.getDay(), mins=n.getHours()*60+n.getMinutes();
  return day>=1 && day<=5 && ((mins>=570&&mins<=690)||(mins>=780&&mins<=900));
}

async function refresh(){
  if(loading) return;
  loading=true;
  const status=document.getElementById("marketStatus");
  const updated=document.getElementById("lastUpdated");
  try{
    const results=await Promise.all(STOCKS.map(async s=>{
      try{return [s.ticker,await loadQuote(s)];}catch(e){return [s.ticker,null];}
    }));
    const quotes=Object.fromEntries(results);
    let rows="", data=[];
    STOCKS.forEach(stock=>{
      const q=quotes[stock.ticker];
      const y=q && q.price>0 && stock.dividend>0 ? stock.dividend/q.price*100 : null;
      data.push({stock,q,y});
      const cls=q ? (q.change>0?"up":q.change<0?"down":"") : "";
      const st=q ? '<span class="badge live">LIVE</span>' : '<span class="badge">无行情</span>';
      rows += '<tr>'+
        '<td><span class="stock-name">'+stock.name+'</span><span class="ticker">'+stock.ticker+'</span></td>'+
        '<td class="price">'+(q?money(q.price):"—")+'</td>'+
        '<td class="'+cls+'">'+(q?money(q.change)+' ('+pct(q.changePct)+')':"—")+'</td>'+
        '<td>'+money(stock.dividend)+'</td>'+
        '<td class="yield">'+pct(y)+'</td>'+
        '<td class="target">'+(targetPrice(stock.dividend,.045)?money(targetPrice(stock.dividend,.045)):"—")+'</td>'+
        '<td class="target">'+(targetPrice(stock.dividend,.05)?money(targetPrice(stock.dividend,.05)):"—")+'</td>'+
        '<td class="target">'+(targetPrice(stock.dividend,.06)?money(targetPrice(stock.dividend,.06)):"—")+'</td>'+
        '<td>'+st+'</td></tr>';
    });
    document.getElementById("radarBody").innerHTML=rows;
    const valid=data.filter(x=>Number.isFinite(x.y));
    const highest=valid.length?valid.reduce((a,b)=>a.y>b.y?a:b):null;
    const five=valid.filter(x=>x.y>=5).length;
    document.getElementById("summaryCards").innerHTML=
      '<div class="card"><div class="card-label">当前最高股息率</div><div class="card-value">'+(highest?highest.stock.name+" "+pct(highest.y):"—")+'</div><div class="card-note">按当前行情自动计算</div></div>'+
      '<div class="card"><div class="card-label">达到5%股息率</div><div class="card-value">'+five+" / "+STOCKS.length+'</div><div class="card-note">按设定年度现金分红计算</div></div>'+
      '<div class="card"><div class="card-label">刷新频率</div><div class="card-value">10 秒</div><div class="card-note">页面保持打开时自动更新</div></div>';
    const live=valid.length;
    status.textContent=isTradingTime()&&live?"🟢 实时行情":"⚪ 最近行情";
    updated.textContent="更新："+new Date().toLocaleTimeString("zh-CN",{hour12:false})+" · "+live+"/"+STOCKS.length+"只";
  }catch(e){
    status.textContent="🔴 行情连接失败";
    updated.textContent=e.message;
  }finally{ loading=false; }
}
refresh();
setInterval(refresh,REFRESH_MS);
