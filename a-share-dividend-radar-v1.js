const DATA_URL="./data/a-share-dividend-radar.json";
const state={rows:[],filtered:[]};
const $=id=>document.getElementById(id);
const n=v=>Number.isFinite(Number(v))?Number(v):null;
const money=v=>n(v)==null?"—":n(v).toFixed(2);
const pct=v=>n(v)==null?"—":n(v).toFixed(2)+"%";
const pe=v=>n(v)==null?"—":n(v).toFixed(2);
const target=(d,y)=>d>0?d/y:null;

function filterRows(){
  const q=$("stockSearch").value.trim().toLowerCase();
  const min=Number($("yieldFilter").value)||0;
  const sort=$("sortBy").value;
  let rows=state.rows.filter(r=>{
    const match=!q||String(r.code).includes(q)||String(r.name||"").toLowerCase().includes(q);
    return match&&(r.yield==null?min===0:r.yield>=min);
  });
  rows.sort((a,b)=>{
    if(sort==="yield") return (b.yield??-1)-(a.yield??-1);
    if(sort==="price") return (a.price??Infinity)-(b.price??Infinity);
    if(sort==="change") return (b.changePct??-Infinity)-(a.changePct??-Infinity);
    if(sort==="code") return String(a.code).localeCompare(String(b.code));
    return String(a.name).localeCompare(String(b.name),"zh-CN");
  });
  // 默认状态只展示股息率最高的 50 支；一旦搜索股票代码/名称，则在全 A 股数据中查找，不受 50 支限制。
  const displayRows = q ? rows : rows.slice(0,50);
  state.filtered=displayRows; render(displayRows);
}

function render(rows){
  $("resultCount").textContent = $("stockSearch").value.trim()
  ? "搜索结果 "+rows.length+" / 全 A 股 "+state.rows.length+" 只"
  : "默认显示股息率最高 50 / 全 A 股 "+state.rows.length+" 只";
  if(!rows.length){
    $("radarBody").innerHTML="<tr><td colspan='8' class='empty'>没有找到符合条件的股票</td></tr>";
    return;
  }
  $("radarBody").innerHTML=rows.map(r=>{
    const cls=r.change>0?"up":r.change<0?"down":"";
    const t45=target(r.dividendTTM,.045), t50=target(r.dividendTTM,.05), t60=target(r.dividendTTM,.06);
    return "<tr><td><span class='stock-name'>"+r.name+"</span><span class='ticker'>"+r.code+"</span></td>"+
      "<td class='price'>"+money(r.price)+"</td>"+
      "<td class='"+cls+"'>"+(r.change==null?"—":money(r.change)+" ("+pct(r.changePct)+")")+"</td>"+
      "<td class='yield'>"+pct(r.yield)+"</td>"+
      "<td>"+pe(r.pe)+"</td>"+
      "<td class='target'>"+(t45?money(t45):"—")+"</td>"+
      "<td class='target'>"+(t50?money(t50):"—")+"</td>"+
      "<td class='target'>"+(t60?money(t60):"—")+"</td></tr>";
  }).join("");
}

function renderStats(payload){
  const rows=state.rows.filter(r=>r.price!=null), valid=rows.filter(r=>r.yield!=null);
  const highest=valid.reduce((a,b)=>!a||b.yield>a.yield?b:a,null);
  const five=valid.filter(r=>r.yield>=5).length;
  const avg=valid.length?valid.reduce((s,r)=>s+r.yield,0)/valid.length:null;
  $("stats").innerHTML="<div class='stat'><div class='stat-label'>A股覆盖</div><div class='stat-value'>"+state.rows.length.toLocaleString()+"</div><div class='stat-note'>沪深京股票，不限制100只</div></div>"+
    "<div class='stat'><div class='stat-label'>最高股息率</div><div class='stat-value'>"+(highest?highest.name+" "+pct(highest.yield):"—")+"</div><div class='stat-note'>按当前价格自动计算</div></div>"+
    "<div class='stat'><div class='stat-label'>≥5%股息率</div><div class='stat-value'>"+five+"</div><div class='stat-note'>有TTM现金分红数据</div></div>"+
    "<div class='stat'><div class='stat-label'>市场平均</div><div class='stat-value'>"+pct(avg)+"</div><div class='stat-note'>简单平均</div></div>";
  const dt=payload.generatedAt?new Date(payload.generatedAt):null;
  $("lastUpdated").textContent=dt?"数据更新："+dt.toLocaleString("zh-CN",{hour12:false}):"等待数据";
  $("marketStatus").textContent=valid.length?"🟢 数据已连接":"🟡 等待后台数据";
}

async function load(){
  try{
    const r=await fetch(DATA_URL+"?t="+Date.now(),{cache:"no-store"}); if(!r.ok)throw Error("data");
    const payload=await r.json(); state.rows=Array.isArray(payload.rows)?payload.rows:[]; renderStats(payload); filterRows();
  }catch(e){
    $("marketStatus").textContent="🟠 等待后台更新";
    $("lastUpdated").textContent="数据文件暂不可用";
    $("radarBody").innerHTML="<tr><td colspan='8' class='loading'>后台正在建立全市场数据，请稍候刷新</td></tr>";
  }
}
["stockSearch","yieldFilter","sortBy"].forEach(id=>$(id).addEventListener(id==="stockSearch"?"input":"change",filterRows));
load();setInterval(load,30000);