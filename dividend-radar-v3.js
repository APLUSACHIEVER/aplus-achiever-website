/* APLUS Dividend Radar V3 — isolated. No other site files are used. */
const STOCKS=[
 {name:"三一重工",ticker:"600031",secid:"1.600031",dividend:.49},
 {name:"海螺水泥",ticker:"600585",secid:"1.600585",dividend:.90},
 {name:"方大特钢",ticker:"600507",secid:"1.600507",dividend:.20},
 {name:"包钢股份",ticker:"600010",secid:"1.600010",dividend:0},
 {name:"山东高速",ticker:"600350",secid:"1.600350",dividend:.42},
 {name:"中国联通",ticker:"600050",secid:"1.600050",dividend:.1635}
];
const REFRESH_MS=10000;
let busy=false;

function n(v){const x=Number(v);return Number.isFinite(x)?x:null}
function money(v){return v==null?"—":v.toFixed(2)}
function pct(v){return v==null?"—":v.toFixed(2)+"%"}
function target(d,y){return d>0?d/y:null}

function getQuote(stock){
 return new Promise((resolve,reject)=>{
  const cb="aplusradarV3_"+stock.ticker+"_"+Date.now();
  const script=document.createElement("script");
  script.id=cb;
  let done=false;
  const finish=(fn,val)=>{if(done)return;done=true;clearTimeout(timer);delete window[cb];script.remove();fn(val)};
  const timer=setTimeout(()=>finish(reject,new Error("行情超时")),7000);
  window[cb]=json=>{
   try{
    const d=json&&json.data;
    if(!d) throw new Error("接口没有返回数据");
    // Eastmoney quote fields: f43 latest, f169 change, f170 change %.
    // Some endpoints return prices in yuan, older variants in cents.
    let price=n(d.f43), change=n(d.f169), changePct=n(d.f170);
    if(price!=null && price>1000) price/=100;
    if(change!=null && Math.abs(change)>100) change/=100;
    if(changePct!=null && Math.abs(changePct)>50) changePct/=100;
    if(price==null || price<=0) throw new Error("无有效价格");
    finish(resolve,{price,change,changePct,name:d.f58||stock.name});
   }catch(e){finish(reject,e)}
  };
  script.src="https://push2.eastmoney.com/api/qt/stock/get?secid="+stock.secid+
   "&fields=f57,f58,f43,f169,f170,f60&invt=2&fltt=2&ut=bd1d9ddb04089700cf9c27f6f7426281&cb="+cb+"&_="+Date.now();
  script.onerror=()=>finish(reject,new Error("行情接口被浏览器拦截"));
  document.head.appendChild(script);
 });
}

async function refresh(){
 if(busy)return; busy=true;
 const status=document.getElementById("marketStatus"),updated=document.getElementById("lastUpdated");
 try{
  // One request at a time avoids public-endpoint rate limiting.
  const quotes={};
  for(const s of STOCKS){
   try{quotes[s.ticker]=await getQuote(s)}catch(_){quotes[s.ticker]=null}
   await new Promise(r=>setTimeout(r,250));
  }
  let rows="",valid=[];
  for(const s of STOCKS){
   const q=quotes[s.ticker], y=q&&s.dividend>0?s.dividend/q.price*100:null;
   if(y!=null)valid.push({s,y});
   const cls=q?(q.change>0?"up":q.change<0?"down":""):"";
   rows+="<tr><td><span class='stock-name'>"+s.name+"</span><span class='ticker'>"+s.ticker+"</span></td>"+
    "<td class='price'>"+(q?money(q.price):"—")+"</td>"+
    "<td class='"+cls+"'>"+(q?money(q.change)+" ("+pct(q.changePct)+")":"—")+"</td>"+
    "<td>"+money(s.dividend)+"</td><td class='yield'>"+pct(y)+"</td>"+
    "<td class='target'>"+(target(s.dividend,.045)?money(target(s.dividend,.045)):"—")+"</td>"+
    "<td class='target'>"+(target(s.dividend,.05)?money(target(s.dividend,.05)):"—")+"</td>"+
    "<td class='target'>"+(target(s.dividend,.06)?money(target(s.dividend,.06)):"—")+"</td>"+
    "<td>"+(q?"<span class='badge live'>LIVE</span>":"<span class='badge'>无行情</span>")+"</td></tr>";
  }
  document.getElementById("radarBody").innerHTML=rows;
  const highest=valid.length?valid.reduce((a,b)=>a.y>b.y?a:b):null;
  const five=valid.filter(x=>x.y>=5).length;
  document.getElementById("summaryCards").innerHTML=
   "<div class='card'><div class='card-label'>当前最高股息率</div><div class='card-value'>"+(highest?highest.s.name+" "+pct(highest.y):"—")+"</div><div class='card-note'>按当前行情自动计算</div></div>"+
   "<div class='card'><div class='card-label'>达到5%股息率</div><div class='card-value'>"+five+" / "+STOCKS.length+"</div><div class='card-note'>按设定年度现金分红</div></div>"+
   "<div class='card'><div class='card-label'>行情连接</div><div class='card-value'>"+Object.values(quotes).filter(Boolean).length+" / "+STOCKS.length+"</div><div class='card-note'>每10秒自动刷新</div></div>";
  status.textContent=Object.values(quotes).some(Boolean)?"🟢 行情已连接":"🔴 行情接口未连接";
  updated.textContent="更新："+new Date().toLocaleTimeString("zh-CN",{hour12:false});
 }finally{busy=false}
}
refresh(); setInterval(refresh,REFRESH_MS);