/* APLUS P6 Prelim — Visual Text Module V2
   Converts the generated visual-text stimulus into a PSLE-style multimodal flyer/poster.
   APLUS-original practice material; not an official SEAB paper.
*/
(function(){'use strict';
const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
function parse(text){
 const lines=String(text||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 const title=(lines[1]||'VISUAL TEXT').replace(/^\s+/, '').trim();
 const org=(lines.find(x=>/^organised by /i.test(x))||'').replace(/^organised by /i,'').trim();
 const intro=(lines.find(x=>!/^DATE\s+/i.test(x)&&!/^VENUE\s+/i.test(x)&&!/^TIME\s+/i.test(x)&&!/^organised by /i.test(x)&&x!==title&&!/^━/.test(x)&&!/^┌/.test(x)&&!/^├/.test(x)&&!/^│/.test(x))||'').trim();
 const date=((lines.find(x=>/^DATE\s+/i.test(x))||'').replace(/^DATE\s+/i,'')).trim();
 const venue=((lines.find(x=>/^VENUE\s+/i.test(x))||'').replace(/^VENUE\s+/i,'')).trim();
 const time=((lines.find(x=>/^TIME\s+/i.test(x))||'').replace(/^TIME\s+/i,'')).trim();
 const cards=[];let cur=null;
 for(const raw of lines){const x=raw.replace(/^│\s?/,'').trim();
   if(raw.startsWith('┌')){cur={title:'',body:[]};continue}
   if(cur&&raw.startsWith('│')&&x&&!x.startsWith('•')){if(!cur.title)cur.title=x;continue}
   if(cur&&raw.startsWith('│')&&x.startsWith('•')){cur.body.push(x.replace(/^•\s*/,''));continue}
   if(cur&&raw.startsWith('└')){cards.push(cur);cur=null}
 }
 return {title,org,intro,date,venue,time,cards};
}
function icon(kind){const icons={
 event:'★',school:'▣',eco:'♻',science:'⚗',art:'✦',family:'♥',book:'▤',clock:'◷',place:'⌖',info:'i'
 };return icons[kind]||icons.info}
function cardIcon(i){return [icon('family'),icon('science'),icon('eco')][i%3]}
function render(v){
 const d=parse(v.text||'');
 const cards=d.cards.length?d.cards:[{title:'ACTIVITY INFORMATION',body:[d.intro||'Please read the information carefully.']}];
 const meta=[['DATE',d.date,icon('event')],['VENUE',d.venue,icon('place')],['TIME',d.time,icon('clock')]].filter(x=>x[1]);
 return `<article class="aplus-vt-poster">
   <div class="aplus-vt-side-label">CREATIVE CAMPUS</div>
   <header class="aplus-vt-head">
     <div class="aplus-vt-heading"><div class="aplus-vt-kicker">${esc(d.org||'SCHOOL / COMMUNITY PROGRAMME')}</div><h3>${esc(d.title)}</h3><p>${esc(d.intro||'Please read the information below carefully.')}</p></div>
     <div class="aplus-vt-mark" aria-hidden="true"><span>♻</span><b>JOIN<br>US!</b></div>
   </header>
   <div class="aplus-vt-meta">${meta.map(x=>`<div><span class="aplus-vt-meta-icon">${x[2]}</span><small>${esc(x[0])}</small><strong>${esc(x[1])}</strong></div>`).join('')}</div>
   <div class="aplus-vt-grid">${cards.map((c,i)=>`<section class="aplus-vt-card ${i===cards.length-1?'aplus-vt-card-wide':''}">
      <div class="aplus-vt-card-title"><span>${cardIcon(i)}</span><b>${esc(c.title)}</b></div>
      <ul>${c.body.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>
   </section>`).join('')}</div>
   <div class="aplus-vt-footer"><div class="aplus-vt-quote">“Small actions can make a big difference.”</div><div class="aplus-vt-note">PLEASE CHECK THE DETAILS BEFORE YOU SIGN UP.</div></div>
 </article>`;
}
function css(){if(document.getElementById('aplus-vt-v2-style'))return;const s=document.createElement('style');s.id='aplus-vt-v2-style';s.textContent=`
.visual-box{margin:0 0 28px!important;border:0!important;background:transparent!important;padding:0!important;box-shadow:none!important}
.visual-box>h3{display:none!important}.visual-box>pre{display:none!important}
.aplus-vt-poster{position:relative;max-width:760px;margin:0 auto;background:#fff;border:1px solid #9aa49f;padding:28px 30px 24px;box-shadow:0 3px 12px rgba(20,40,30,.08);overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#18231f}
.aplus-vt-side-label{position:absolute;left:-40px;top:170px;transform:rotate(-90deg);font-size:10px;font-weight:800;letter-spacing:2px;color:#dfe5e1}
.aplus-vt-head{display:grid;grid-template-columns:1fr 100px;gap:20px;align-items:center;border-bottom:2px solid #202d27;padding-bottom:18px}
.aplus-vt-kicker{text-transform:uppercase;font-size:11px;font-weight:800;letter-spacing:1.5px;color:#5b7167;margin-bottom:7px}
.aplus-vt-heading h3{font-size:31px;line-height:1.05;margin:0 0 10px;letter-spacing:.2px}.aplus-vt-heading p{font-size:14px;line-height:1.5;margin:0;max-width:580px}
.aplus-vt-mark{height:88px;border-radius:50%;border:3px solid #202d27;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;transform:rotate(3deg);font-size:11px;line-height:1.05}.aplus-vt-mark span{font-size:38px;line-height:34px}.aplus-vt-mark b{letter-spacing:1px}
.aplus-vt-meta{display:grid;grid-template-columns:1fr 1.3fr 1fr;border-bottom:1px solid #bcc6c1;margin:18px 0;padding-bottom:15px;gap:12px}.aplus-vt-meta>div{display:grid;grid-template-columns:25px 1fr;grid-template-rows:auto auto;column-gap:7px}.aplus-vt-meta-icon{grid-row:1/3;font-size:20px;font-weight:700;align-self:center}.aplus-vt-meta small{font-size:9px;font-weight:800;letter-spacing:1px;color:#65746d}.aplus-vt-meta strong{font-size:12px;line-height:1.3}
.aplus-vt-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.aplus-vt-card{border:1px solid #9da8a2;padding:14px 15px;background:#fff;min-height:150px}.aplus-vt-card-wide{grid-column:1/-1}.aplus-vt-card-title{display:flex;align-items:center;gap:9px;border-bottom:1px solid #d4dbd7;padding-bottom:8px;margin-bottom:9px}.aplus-vt-card-title span{width:30px;height:30px;border:1.5px solid #303d37;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:800}.aplus-vt-card-title b{font-size:14px;letter-spacing:.3px}.aplus-vt-card ul{padding-left:20px;margin:0}.aplus-vt-card li{font-size:12.5px;line-height:1.45;margin:5px 0}
.aplus-vt-footer{display:grid;grid-template-columns:1.2fr 1fr;gap:14px;margin-top:15px;align-items:center}.aplus-vt-quote{border:2px solid #303d37;border-radius:18px;padding:12px 15px;font-family:Georgia,serif;font-size:14px;text-align:center}.aplus-vt-note{text-align:center;font-size:10px;font-weight:800;letter-spacing:1px;line-height:1.5;color:#53635b}
@media(max-width:760px){.aplus-vt-poster{padding:22px 18px 20px}.aplus-vt-head{grid-template-columns:1fr 70px}.aplus-vt-heading h3{font-size:24px}.aplus-vt-mark{height:68px}.aplus-vt-mark span{font-size:28px}.aplus-vt-meta{grid-template-columns:1fr;gap:9px}.aplus-vt-grid{grid-template-columns:1fr}.aplus-vt-card-wide{grid-column:auto}.aplus-vt-footer{grid-template-columns:1fr}.aplus-vt-side-label{display:none}}
`;document.head.appendChild(s)}
function mount(){css();const card=document.getElementById('questionCard');if(!card)return;const obs=new MutationObserver(()=>{const box=card.querySelector('.visual-box');if(!box||box.dataset.vtRendered==='1')return;const pre=box.querySelector('pre');if(!pre)return;box.dataset.vtRendered='1';box.insertAdjacentHTML('beforeend',render({text:pre.textContent||''}));});obs.observe(card,{childList:true,subtree:true});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
window.APLUS_VISUAL_TEXT_MODULE_V2={version:'2.0',render,parse};
})();
