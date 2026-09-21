const DATA_URL="./data/a-share-dividend-radar.json";
const QUOTE_URL="https://push2.eastmoney.com/api/qt/clist/get";
const DIV_URL="https://datacenter-web.eastmoney.com/api/data/v1/get";
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
    if(sort==="yield")return(b.yield??-1)-(a.yield??-1);
    if(sort==="price")return(a.price??Infinity)-(b.price??Infinity);
    if(sort==="change")return(b.changePct??-Infinity)-(a.changePct??-Infinity);
    if(sort==="code")return String(a.code).localeCompare(String(b.code));
    return String(a.name).localeCompare(String(b.name),"zh-CN");
  });
  const displayRows=q?rows:rows.slice(0,50);
  state.filtered=displayRows;render(displayRows);
}
function render(rows){
  $("resultCount").textContent=$("stockSearch").value.trim()?"搜索结果 "+rows.length+" / 全 A 股 "+state.rows.length+" 只":"默认显示股息率最高 50 / 全 A 股 "+state.rows.length+" 只";
  if(!rows.length){$("radarBody").innerHTML="<tr><td colspan='8' class='empty'>没有找到符合条件的股票</td></tr>";return;}
  $("radarBody").innerHTML=rows.map(r=>{
    const cls=r.change>0?"up":r.change<0?"down":"";
    const t45=target(r.dividendTTM,.045),t50=target(r.dividendTTM,.05),t60=target(r.dividendTTM,.06);
    return "<tr><td><span class='stock-name'>"+r.name+"</span><span class='ticker'>"+r.code+"</span></td><td class='price'>"+money(r.price)+"</td><td class='"+cls+"'>"+(r.change==null?"—":money(r.change)+" ("+pct(r.changePct)+")")+"</td><td class='yield'>"+pct(r.yield)+"</td><td>"+pe(r.pe)+"</td><td class='target'>"+(t45?money(t45):"—")+"</td><td class='target'>"+(t50?money(t50):"—")+"</td><td class='target'>"+(t60?money(t60):"—")+"</td></tr>";
  }).join("");
}
function renderStats(payload){
  const rows=state.rows.filter(r=>r.price!=null),valid=rows.filter(r=>r.yield!=null);
  const highest=valid.reduce((a,b)=>!a||b.yield>a.yield?b:a,null),five=valid.filter(r=>r.yield>=5).length,avg=valid.length?valid.reduce((s,r)=>s+r.yield,0)/valid.length:null;
  $("stats").innerHTML="<div class='stat'><div class='stat-label'>A股覆盖</div><div class='stat-value'>"+state.rows.length.toLocaleString()+"</div><div class='stat-note'>沪深京股票，全市场搜索</div></div><div class='stat'><div class='stat-label'>最高股息率</div><div class='stat-value'>"+(highest?highest.name+" "+pct(highest.yield):"—")+"</div><div class='stat-note'>按当前价格自动计算</div></div><div class='stat'><div class='stat-label'>≥5%股息率</div><div class='stat-value'>"+five+"</div><div class='stat-note'>有TTM现金分红数据</div></div><div class='stat'><div class='stat-label'>市场平均</div><div class='stat-value'>"+pct(avg)+"</div><div class='stat-note'>简单平均</div></div>";
  const dt=payload.generatedAt?new Date(payload.generatedAt):null;
  $("lastUpdated").textContent=dt?"数据更新："+dt.toLocaleString("zh-CN",{hour12:false}):"数据更新：刚刚";
  $("marketStatus").textContent=valid.length?"🟢 全A股数据已连接":"🟡 等待数据";
}
function jsonp(url,params={},timeout=20000,callbackParam="cb"){
  return new Promise((resolve,reject)=>{
    const cb="__aShareRadar_"+Date.now()+"_"+Math.random().toString(36).slice(2);
    const s=document.createElement("script"),u=new URL(url);
    Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));
    u.searchParams.set(callbackParam,cb);
    let done=false;
    const cleanup=()=>{if(s.parentNode)s.parentNode.removeChild(s);try{delete window[cb]}catch{}};
    const timer=setTimeout(()=>{if(done)return;done=true;cleanup();reject(new Error("JSONP timeout"))},timeout);
    window[cb]=data=>{if(done)return;done=true;clearTimeout(timer);cleanup();resolve(data)};
    s.onerror=()=>{if(done)return;done=true;clearTimeout(timer);cleanup();reject(new Error("JSONP network error"))};
    s.src=u.toString();document.head.appendChild(s);
  });
}
async function getQuoteJson(url,params){return jsonp(url,params,20000,"cb");}
async function getDivJson(url,params){return jsonp(url,params,20000,"callback");}
async function loadLive(){
  const fs="m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23,m:0+t:81+s:2048";
  const base={pz:100,po:1,np:1,fltt:2,invt:2,fid:"f12",fs,fields:"f2,f3,f4,f9,f12,f13,f14",ut:"bd1d9ddb04089700cf9c27f6f7426281"};
  const probe=await getQuoteJson(QUOTE_URL,{...base,pn:1}),total=Number(probe?.data?.total||0),pageSize=100;
  if(total<=100)throw new Error("全A股接口返回异常 total="+total);
  const pages=Math.ceil(total/pageSize),chunks=[];
  for(let start=1;start<=pages;start+=8){
    const batch=[];for(let pn=start;pn<Math.min(start+8,pages+1);pn++)batch.push(getQuoteJson(QUOTE_URL,{...base,pn}));
    const results=await Promise.all(batch);results.forEach(x=>(x?.data?.diff||[]).forEach(v=>chunks.push(v)));
    $("marketStatus").textContent="🟢 正在读取全A股行情 "+Math.min(start+7,pages)+"/"+pages;
  }
  const rowsMap=new Map();
  chunks.forEach(x=>{const code=String(x.f12||""),name=String(x.f14||"");if(code&&name)rowsMap.set(code,{code,name,price:x.f2,change:x.f4,changePct:x.f3,pe:x.f9,market:x.f13});});
  if(rowsMap.size<total)throw new Error("全A股分页不完整 "+rowsMap.size+"/"+total);
  const cutoff=new Date(Date.now()-365*86400000).toISOString().slice(0,10),div=new Map();
  for(let pn=1;pn<=30;pn++){
    const x=await getDivJson(DIV_URL,{reportName:"RPT_SHAREBONUS_DET",columns:"SECURITY_CODE,SECURITY_NAME_ABBR,PRETAX_BONUS_RMB,EX_DIVIDEND_DATE,ASSIGN_PROGRESS",filter:"(EX_DIVIDEND_DATE>='"+cutoff+"')",pageNumber:pn,pageSize:500,sortColumns:"EX_DIVIDEND_DATE",sortTypes:"-1",source:"WEB",client:"WEB"});
    const data=x?.result?.data||[];if(!data.length)break;
    data.forEach(v=>{const code=String(v.SECURITY_CODE||""),date=String(v.EX_DIVIDEND_DATE||"").slice(0,10),progress=String(v.ASSIGN_PROGRESS||""),cash=Number(v.PRETAX_BONUS_RMB||0)/10;if(code&&date>=cutoff&&progress.includes("实施")&&cash>0)div.set(code,(div.get(code)||0)+cash);});
    $("marketStatus").textContent="🟢 正在读取近12个月分红 "+pn+"/30";if(data.length<500)break;
  }
  const out=[...rowsMap.entries()].map(([code,r])=>{const price=Number(r.price)>0?Number(r.price):null,d=Math.round((div.get(code)||0)*10000)/10000;return{...r,price,change:n(r.change),changePct:n(r.changePct),pe:n(r.pe),dividendTTM:d,yield:price&&d>0?Math.round(d/price*1000000)/10000:null};});
  return{generatedAt:new Date().toISOString(),source:"Eastmoney public market/dividend data (browser live)",cutoff,count:out.length,rows:out};
}
async function load(){
  try{
    $("marketStatus").textContent="🟡 正在连接全A股实时数据…";
    const payload=await loadLive();state.rows=payload.rows;renderStats(payload);filterRows();
  }catch(e){
    console.warn("Live A-share radar failed, using repository snapshot:",e);
    try{
      const r=await fetch(DATA_URL+"?t="+Date.now(),{cache:"no-store"});if(!r.ok)throw Error("snapshot HTTP "+r.status);
      const payload=await r.json();state.rows=Array.isArray(payload.rows)?payload.rows:[];renderStats(payload);filterRows();
      $("marketStatus").textContent="🟠 全A股实时接口暂不可用，当前显示后台快照";
    }catch(e2){
      $("marketStatus").textContent="🔴 数据连接失败";$("lastUpdated").textContent="请稍后刷新";$("radarBody").innerHTML="<tr><td colspan='8' class='loading'>全A股数据暂时无法连接，请稍后刷新</td></tr>";
    }
  }
}
["stockSearch","yieldFilter","sortBy"].forEach(id=>$(id).addEventListener(id==="stockSearch"?"input":"change",filterRows));
load();setInterval(load,60000);