/* =====================================================================
   PAGE
   ===================================================================== */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const reduced = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
let quiet = store.get("bv-quiet")==="1" || (reduced && store.get("bv-quiet")!=="0");
const isPhone=()=>innerWidth<700;

const ICONS={
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 11 12 3l9 8"/><path d="M5 10v10h5v-6a2 2 0 0 1 4 0v6h5V10"/><path d="M12 3V1"/></svg>',
  chronicle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6"/><path d="M6 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2"/><path d="M9 8h7M9 12h7M9 16h4"/></svg>',
  souls:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3c-3.5 0-6 2.7-6 6.5 0 2.6 1.2 4.4 2.5 5.5L7 21h10l-1.5-6c1.3-1.1 2.5-2.9 2.5-5.5C18 5.7 15.5 3 12 3Z"/><circle cx="9.7" cy="10" r="1" fill="currentColor"/><circle cx="14.3" cy="10" r="1" fill="currentColor"/></svg>',
  places:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21h18"/><path d="M5 21V10l3-4 3 4v11"/><path d="M11 21v-7l4-5 4 5v7"/><path d="M8 6V2"/><path d="M15 9V5"/></svg>',
  fortunes:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="5" width="10" height="15" rx="1.5" transform="rotate(-8 9 12)"/><rect x="10" y="4" width="10" height="15" rx="1.5" transform="rotate(8 15 11)"/><path d="m15 9 1 2 2 .3-1.5 1.4.4 2.1L15 13.8l-1.9 1 .4-2.1L12 11.3l2-.3Z"/></svg>',
  party:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6Z"/><path d="M9 12l2 2 4-4"/></svg>',
  soundOn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 9v6h4l5 4V5L8 9Z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>',
  soundOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 9v6h4l5 4V5L8 9Z"/><path d="m17 9 5 6M22 9l-5 6"/></svg>',
  candle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2c1.5 2 2 3.2 2 4.3A2 2 0 0 1 12 8.5a2 2 0 0 1-2-2.2C10 5.2 10.5 4 12 2Z"/><rect x="9" y="10" width="6" height="11" rx="1"/></svg>',
  candleOut:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 8c0-2 1-2.5 0-5M12 8c0-1.5-1.2-2-.6-3.4" opacity=".5"/><rect x="9" y="10" width="6" height="11" rx="1"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  chev:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>'
};
const GLYPHS={
  house:'<path d="M10 50 50 14l40 36v40H10Z"/><path d="M40 90V62a10 10 0 0 1 20 0v28"/>',
  gate:'<path d="M14 90V36a36 36 0 0 1 72 0v54"/><path d="M30 90V40M50 90V30M70 90V40"/>',
  star:'<path d="m50 8 11 30h32L67 57l10 33-27-20-27 20 10-33L7 38h32Z"/>',
  cup:'<path d="M28 12h44l-6 38a16 16 0 0 1-32 0Z"/><path d="M50 66v20M34 90h32"/>',
  cross:'<path d="M42 8h16v26h22v16H58v42H42V50H20V34h22Z"/>',
  moon:'<path d="M66 12a40 40 0 1 0 22 52A32 32 0 1 1 66 12Z"/>',
  road:'<path d="M30 92 44 8M70 92 56 8M50 20v8M50 40v10M50 62v12"/>',
  mill:'<path d="M50 50 20 20M50 50 80 20M50 50 80 80M50 50 20 80"/><path d="M38 92 44 50h12l6 42Z"/>',
  scroll:'<path d="M22 16h50a8 8 0 0 1 8 8v60a8 8 0 0 1-8 8H30a8 8 0 0 1-8-8Z"/><path d="M34 34h34M34 48h34M34 62h22"/>',
  skull:'<path d="M50 10c-20 0-34 14-34 32 0 12 6 20 14 24v14h40V66c8-4 14-12 14-24 0-18-14-32-34-32Z"/><circle cx="37" cy="44" r="7"/><circle cx="63" cy="44" r="7"/>'
};
const glyph=(k,cls="glyph")=>`<svg class="${cls}" viewBox="0 0 100 100" fill="none" stroke="var(--gold)" stroke-width="3">${GLYPHS[k]||GLYPHS.star}</svg>`;
const cornerSvg=cls=>`<svg class="cn ${cls}" aria-hidden="true"><use href="#corner"/></svg>`;
function vine(){ return `<svg class="vine" viewBox="0 0 300 22" preserveAspectRatio="none" fill="none" aria-hidden="true">
  <path pathLength="1" d="M0 11 C40 3 60 19 100 11 S160 3 200 11 S260 19 286 11" stroke="rgba(201,164,94,.55)" stroke-width="1" vector-effect="non-scaling-stroke"/>
  <path pathLength="1" d="M40 8l-4-5M80 15l3 5M130 7l-3-5M175 14l4 5M225 8l-4-5M262 15l3 4" stroke="rgba(201,164,94,.45)" stroke-width="1" vector-effect="non-scaling-stroke"/>
  <g class="rose"><circle cx="291" cy="11" r="6" fill="#8c2a26"/><path d="M291 7c3 0 4 3 2 4s-4-1-2-3M287 11c0-3 3-4 4-2" stroke="#d4645a" stroke-width=".8"/></g></svg>`; }

/* ---------- rarity ---------- */
const TIER={hero:{s:5,label:"Legendary",rc:"214,172,92"},nemesis:{s:5,label:"Nemesis",rc:"190,64,54"},epic:{s:4,label:"Epic",rc:"156,126,196"},rare:{s:3,label:"Rare",rc:"104,156,140"},fallen:{s:3,label:"Fallen",rc:"170,160,150"}};
const NEMESIS=new Set(["strahd","rahadin"]);
const EPIC=new Set(["ireena","ismark","arabelle","eva","ezmerelda","kasimir","fiona","rictavio","victor","captain","escher","izek","lancelot"]);
function tierOf(n){ if(n.pc) return "hero"; if(n.fate==="dead") return "fallen"; if(NEMESIS.has(n.id)) return "nemesis"; if(EPIC.has(n.id)) return "epic"; return "rare"; }

/* ---------- painterly placeholder portrait ---------- */
function hash(s){let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))|0;return Math.abs(h)}
let portraitSeq=0;  /* every portrait gets its own gradient ids; a repeated id would point at a copy in a hidden view */
function placeholder(n){
  const h=hash(n.id), t=TIER[tierOf(n)], rc=t.rc, id="p"+h+"_"+(portraitSeq++);
  const eye={ally:"#c7ecdf",unsure:"#ffd07a",foe:"#ff4b38",hero:"#ffe6a8"}[n.side]||"#ffd07a";
  const shoulders=["M8 133 Q16 98 50 91 Q84 98 92 133Z","M4 133 Q14 94 50 89 Q86 94 96 133Z","M12 133 Q20 100 50 94 Q80 100 88 133Z"][h%3];
  const headR=14+(h%4);
  const hood=(h%5===0)?`<path d="M27 76 Q29 34 50 30 Q71 34 73 76 Q63 64 50 64 Q37 64 27 76Z" fill="#0b0706" stroke="rgba(${rc},.35)" stroke-width=".7"/>`:"";
  const hair=(h%5!==0 && h%3===1)?`<path d="M${50-headR} 62 Q${50-headR-4} 90 ${50-headR-8} 104 Q${50-headR+2} 92 ${50-headR+3} 74Z M${50+headR} 62 Q${50+headR+4} 90 ${50+headR+8} 104 Q${50+headR-2} 92 ${50+headR-3} 74Z" fill="#0b0706"/>`:"";
  const eyes = n.fate==="dead"
    ? `<path d="M43 61l4 4M47 61l-4 4M53 61l4 4M57 61l-4 4" stroke="#7d7268" stroke-width="1.3"/>`
    : `<g class="eyes-glow" style="animation-delay:${(h%40)/10}s"><ellipse cx="44" cy="63" rx="2.6" ry="1.3" fill="${eye}"/><ellipse cx="56" cy="63" rx="2.6" ry="1.3" fill="${eye}"/><ellipse cx="44" cy="63" rx="7" ry="3.8" fill="${eye}" opacity=".2"/><ellipse cx="56" cy="63" rx="7" ry="3.8" fill="${eye}" opacity=".2"/></g>`;
  return `<svg viewBox="0 0 100 133" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><radialGradient id="${id}g" cx="50%" cy="36%" r="72%"><stop offset="0" stop-color="rgb(${rc})" stop-opacity=".55"/><stop offset=".45" stop-color="#3a2a20"/><stop offset="1" stop-color="#120c0b"/></radialGradient>
    <radialGradient id="${id}c" cx="50%" cy="30%" r="45%"><stop offset="0" stop-color="#ffbf73" stop-opacity=".25"/><stop offset="1" stop-color="#ffbf73" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}a"><stop offset="0" stop-color="#8c2a26" stop-opacity=".35"/><stop offset=".35" stop-color="#8c2a26" stop-opacity=".32"/><stop offset=".6" stop-color="#8c2a26" stop-opacity=".17"/><stop offset=".82" stop-color="#8c2a26" stop-opacity=".05"/><stop offset="1" stop-color="#8c2a26" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}b"><stop offset="0" stop-color="rgb(${rc})" stop-opacity=".35"/><stop offset=".4" stop-color="rgb(${rc})" stop-opacity=".32"/><stop offset=".62" stop-color="rgb(${rc})" stop-opacity=".17"/><stop offset=".83" stop-color="rgb(${rc})" stop-opacity=".05"/><stop offset="1" stop-color="rgb(${rc})" stop-opacity="0"/></radialGradient></defs>
    <rect width="100" height="133" fill="url(#${id}g)"/><rect width="100" height="133" fill="url(#${id}c)"/>
    <circle cx="${18+h%30}" cy="${20+h%25}" r="34" fill="url(#${id}a)"/><circle cx="${72+h%18}" cy="${96+h%20}" r="40" fill="url(#${id}b)"/>
    <g stroke="rgba(${rc},.45)" stroke-width=".7">
      <path d="${shoulders}" fill="#0d0907"/>
      <rect x="44" y="74" width="12" height="20" fill="#0d0907" stroke="none"/>
      <ellipse cx="50" cy="62" rx="${headR}" ry="${headR+3}" fill="#0d0907"/>
    </g>
    ${hair}${hood}${eyes}
  </svg>`;
}
function portrait(n){ return n.img ? `<img src="${esc(n.img)}" alt="Portrait of ${esc(n.name)}" loading="lazy">` : placeholder(n); }
const SIDE_LABEL={ally:"Ally",unsure:"Uncertain",foe:"Foe"};
function sidePill(n){ if(n.fate==="dead") return `<span class="pill fallen">Fallen</span>`; return `<span class="pill ${esc(n.side)}">${esc(SIDE_LABEL[n.side]||"")}</span>`; }
const npcById=Object.fromEntries(DATA.npcs.map(n=>[n.id,n]));
/* "New" = first appeared in the most recent session (or flagged new:true in DATA) */
function isNew(x){ if(!x||x.pc) return false; if(x.new===true) return true; const s=x.met!==undefined?x.met:x.s; return String(s)===String(DATA.lastSession); }
const slug=t=>t.toLowerCase().replace(/[^a-z]+/g,"-");
const PCS=DATA.party.map(p=>({...p,id:"pc-"+slug(p.n),pc:true,name:p.n,side:"hero",fate:"alive",epi:p.sp+" · "+p.cl}));
const pcById=Object.fromEntries(PCS.map(p=>[p.id,p]));

/* =====================================================================
   FX: petals, embers, ink, tilt
   ===================================================================== */
const fxLayer=$("#fx");
function burst(x,y,opts={}){
  if(quiet) return;
  const n=opts.n||(isPhone()?9:13), petals=opts.petals??.55;
  for(let i=0;i<n;i++){
    const isPetal=Math.random()<petals, e=document.createElement("i");
    e.className=isPetal?"petal":"ember"; e.style.left=x+"px"; e.style.top=y+"px"; fxLayer.appendChild(e);
    const a=Math.random()*Math.PI*2, sp=(isPetal?40:30)+Math.random()*(opts.spread||70);
    const dx=Math.cos(a)*sp, dy=Math.sin(a)*sp-(isPetal?20:40), rot=(Math.random()-.5)*720, dur=isPetal?1300+Math.random()*700:700+Math.random()*500;
    const anim=e.animate([
      {transform:"translate(-50%,-50%) scale(.4) rotate(0deg)",opacity:1},
      {transform:`translate(calc(-50% + ${dx*.7}px),calc(-50% + ${dy*.7}px)) scale(1) rotate(${rot*.5}deg)`,opacity:1,offset:.35},
      {transform:`translate(calc(-50% + ${dx}px),calc(-50% + ${dy+(isPetal?90:30)}px)) scale(.7) rotate(${rot}deg)`,opacity:0}
    ],{duration:dur,easing:"cubic-bezier(.2,.7,.4,1)"});
    anim.onfinish=()=>e.remove();
  }
}
function inkRipple(x,y,size=160){
  if(quiet) return;
  const e=document.createElement("i"), d=size*1.25; e.className="ink"; e.style.left=(x-d/2)+"px"; e.style.top=(y-d/2)+"px"; e.style.width=e.style.height=d+"px"; fxLayer.appendChild(e);
  e.animate([{transform:"scale(.1) rotate(0deg)",opacity:.95},{transform:"scale(1.6) rotate(25deg)",opacity:0}],{duration:900,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=()=>e.remove();
}
document.addEventListener("pointerdown",e=>{
  const t=e.target.closest("button,a,.soul,.card,.place");
  if(!t || t.closest(".tab") || t.closest("#gacha") || t.closest(".card")) return;
  burst(e.clientX,e.clientY,{n:t.classList.contains("btn-enter")?20:undefined});
},{passive:true});
function attachTilt(root){
  if(quiet || matchMedia("(hover: none)").matches) return;
  root.querySelectorAll(".soul .frame, .place").forEach(el=>{
    const host=el.classList.contains("frame")?el.parentElement:el;
    if(host.dataset.tilt) return; host.dataset.tilt=1;
    host.addEventListener("pointermove",ev=>{ const r=host.getBoundingClientRect(); const px=(ev.clientX-r.left)/r.width-.5, py=(ev.clientY-r.top)/r.height-.5; el.style.setProperty("--ry",(px*14)+"deg"); el.style.setProperty("--rx",(-py*12)+"deg"); });
    host.addEventListener("pointerleave",()=>{ el.style.setProperty("--ry","0deg"); el.style.setProperty("--rx","0deg"); });
  });
}

/* ---------- ornament + reveal helpers ---------- */
function ornament(root=document){
  root.querySelectorAll(".ornate:not([data-orn])").forEach(el=>{
    el.dataset.orn=1;
    el.insertAdjacentHTML("afterbegin",`<svg class="draw" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><rect x="0" y="0" width="100" height="100" rx="2" pathLength="1"/></svg>${cornerSvg("tl")}${cornerSvg("tr")}${cornerSvg("br")}${cornerSvg("bl")}`);
  });
  root.querySelectorAll(".section-title:not([data-orn])").forEach(el=>{ el.dataset.orn=1; el.insertAdjacentHTML("beforeend",vine()); });
  root.querySelectorAll(".words:not([data-orn])").forEach(el=>{ el.dataset.orn=1; let i=0; el.innerHTML=el.textContent.trim().split(/\s+/).map(w=>`<span class="w" style="--i:${i++}">${esc(w)}</span>`).join(" "); });
}
let io=null;
const REVEAL_SEL=".reveal,.deal,.ornate,.words,.gild,.section-title";
function observeReveals(){
  const els=$$(".view.on :is("+REVEAL_SEL+"):not(.in)");
  if(quiet || !("IntersectionObserver" in window)){ els.forEach(e=>e.classList.add("in")); return; }
  if(!io) io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target);} }),{threshold:.06,rootMargin:"0px 0px -4% 0px"});
  els.forEach(e=>io.observe(e));
}
document.addEventListener("animationend",e=>{ if(e.animationName==="deal") e.target.classList.remove("deal"); if(e.animationName==="bleed") e.target.classList.remove("bleed"); });
function dealIn(container){ [...container.children].forEach((c,i)=>{ c.classList.add("deal"); c.style.setProperty("--dl",Math.min(i,14)*70+"ms"); }); }

/* =====================================================================
   NAVIGATION
   ===================================================================== */
const VIEWS=[["home","Home"],["chronicle","Sessions"],["souls","Souls"],["places","Locations"],["fortunes","Quests"]];
const tabHTML=VIEWS.map(([k,l])=>`<a class="tab" href="#${k}" data-v="${k}" aria-label="${l}">${ICONS[k]}<span class="lbl">${l}</span></a>`).join("")+`<span class="marker" aria-hidden="true"></span>`;
$("#tabs").innerHTML=tabHTML; $("#railNav").innerHTML=tabHTML;
$("#searchBtn").innerHTML=ICONS.search;
$$(".lastSess").forEach(e=>e.textContent=DATA.lastSession);
$$("[data-go]").forEach(e=>e.addEventListener("click",()=>{ location.hash="home"; }));

function placeMarkers(){
  const v=current||"home";
  const top=$("#tabs"), tt=top.querySelector(`[data-v="${v}"]`), tm=top.querySelector(".marker");
  if(tt && top.offsetParent){ const w=tt.offsetWidth*.62; tm.style.width=w+"px"; tm.style.transform=`translateX(${tt.offsetLeft+(tt.offsetWidth-w)/2}px)`; }
  const rail=$("#railNav"), rt=rail.querySelector(`[data-v="${v}"]`), rm=rail.querySelector(".marker");
  if(rt && rail.offsetParent){ const hgt=rt.offsetHeight*.6; rm.style.height=hgt+"px"; rm.style.width=""; rm.style.transform=`translateY(${rt.offsetTop+(rt.offsetHeight-hgt)/2}px)`; }
}
addEventListener("resize",()=>placeMarkers());

document.addEventListener("click",e=>{
  const t=e.target.closest(".tab"); if(!t) return;
  e.preventDefault();
  const r=t.getBoundingClientRect(); inkRipple(e.clientX||r.left+r.width/2, e.clientY||r.top+r.height/2, Math.max(r.width,r.height)*2.2);
  t.classList.remove("flare"); void t.offsetWidth; t.classList.add("flare");
  if(location.hash.slice(1)!==t.dataset.v) location.hash=t.dataset.v; else window.scrollTo({top:0,behavior:quiet?"auto":"smooth"});
});

let current=null, inkDone=false;
function show(v, fx=true){
  if(!VIEWS.some(([k])=>k===v)) v="home";
  if(v===current) return;
  const first=current===null; current=v;
  const swap=()=>{
    $$(".view").forEach(s=>{ const on=s.id==="v-"+v; s.classList.toggle("on",on); s.classList.remove("bleed"); if(on && fx && !first && !quiet){ void s.offsetWidth; s.classList.add("bleed"); } });
    window.scrollTo({top:0,behavior:"instant"});
    document.body.classList.remove("compact");
    observeReveals(); attachTilt($("#v-"+v));
    if(v==="home") startInk();
    document.body.classList.toggle("on-map", v==="places" && !$(".places-wrap").classList.contains("list"));
    if(v==="places" && !$(".places-wrap").classList.contains("list")){ fog.stop(); enterMap(); } else if(!quiet) fog.start();
  };
  $$(".tab").forEach(a=>{ const on=a.dataset.v===v; a.classList.toggle("on",on); if(on) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
  placeMarkers();
  if(fx && !first && !quiet){ Sound.whoosh(); swap(); }
  else swap();
}
addEventListener("hashchange",()=>show(location.hash.slice(1)));

/* compact header + back-to-top */
let lastY=0, lockUntil=0; const toTop=$("#toTop");
/* pause decorative loops while scrolling: frees the phone to just scroll */
let scrollT=null;
addEventListener("scroll",()=>{ if(!scrollT) document.body.classList.add("scrolling"); clearTimeout(scrollT); scrollT=setTimeout(()=>{ document.body.classList.remove("scrolling"); scrollT=null; },160); },{passive:true});
addEventListener("scroll",()=>{
  const y=scrollY, d=y-lastY;
  if(isPhone() && performance.now()>lockUntil){
    const c=document.body.classList.contains("compact");
    if(!c && y>110 && d>6){ document.body.classList.add("compact"); lockUntil=performance.now()+550; }
    else if(c && (d<-14 || y<60)){ document.body.classList.remove("compact"); lockUntil=performance.now()+550; }
  }
  toTop.classList.toggle("on",y>700);
  lastY=y;
},{passive:true});
toTop.addEventListener("click",()=>{ window.scrollTo({top:0,behavior:quiet?"auto":"smooth"}); Sound.whoosh(); });

/* swipe between sections */
let sx=0, sy=0, st=0, swipeOK=false;
addEventListener("touchstart",e=>{
  const t=e.touches[0]; sx=t.clientX; sy=t.clientY; st=Date.now();
  swipeOK=!e.target.closest(".filters,#gacha,input,#results,.g-wrap,.mapbox") && !$("#gacha").classList.contains("on");
},{passive:true});
addEventListener("touchend",e=>{
  if(!swipeOK) return; const t=e.changedTouches[0], dx=t.clientX-sx, dy=t.clientY-sy;
  if(Math.abs(dx)>70 && Math.abs(dy)<45 && Date.now()-st<600){
    const i=VIEWS.findIndex(([k])=>k===current), j=i+(dx<0?1:-1);
    if(j>=0 && j<VIEWS.length){ inkRipple(dx<0?innerWidth-40:40, t.clientY, 220); location.hash=VIEWS[j][0]; }
  }
},{passive:true});

/* =====================================================================
   HOME
   ===================================================================== */
$("#homeFlavor").textContent=DATA.flavor;
const shortName=n=>{ const w=n.name.split(" "); return /^(Sir|Lady|Father|Madam|The|Headmistress)$/.test(w[0])?n.name:w[0]; };
const HOME_ALLIES=["ireena","lancelot","sirloin","arabelle","scarlet","ezmerelda","kasimir"];
function pcard(n,i){ const t=TIER[tierOf(n)]; return `
  <button class="pcard ${n.pc?"hero":""}" data-flip="${n.pc?"pc":"npc"}:${esc(n.id)}" aria-label="Open ${esc(n.name)}">
    <div class="flip">
      <div class="face front"><div class="art">${portrait(n)}</div><div class="plate"><div class="nm">${esc(shortName(n))}</div></div></div>
      <div class="face back">${tarokkaBack("h"+i,{label:n.pc?"HERO":"ALLY",violet:!n.pc})}</div>
    </div>
    <div class="sub">${esc(n.pc?n.cl.replace(/ \d+$/,""):n.epi||"")}</div>
  </button>`; }
$("#homeLoc").innerHTML=`<span>Currently in <b>Vallaki</b> — the Blue Water Inn, after Session ${esc(DATA.lastSession)}</span>`;
$("#homeParty").innerHTML=PCS.map(pcard).join(""); dealIn($("#homeParty"));
$("#homeAllies").innerHTML=HOME_ALLIES.map(id=>npcById[id]).filter(Boolean).map((n,i)=>pcard(n,i+10)).join(""); dealIn($("#homeAllies"));
/* What's new strip on Home */
(function(){
  const nn=DATA.npcs.filter(isNew), pp=DATA.places.filter(isNew);
  const box=$("#homeNew"); if(!box||(!nn.length&&!pp.length)) return;
  const chips=[...nn.map(n=>`<button class="newchip" data-k="npc" data-id="${esc(n.id)}">${esc(n.name)}</button>`),
               ...pp.map(p=>`<button class="newchip loc" data-k="place" data-id="${esc(p.n)}">${esc(p.n)}</button>`)].join("");
  box.innerHTML=`<div class="newhead">New in Session ${esc(DATA.lastSession)}</div><div class="newchips">${chips}</div>`;
  box.hidden=false;
  box.addEventListener("click",e=>{ const b=e.target.closest(".newchip"); if(!b) return; Sound.chime&&Sound.chime(); b.dataset.k==="npc"?openNpc(b.dataset.id):openPlace(b.dataset.id); });
})();
document.addEventListener("click",e=>{
  const c=e.target.closest(".pcard"); if(!c) return;
  const [kind,id]=c.dataset.flip.split(":");
  c.classList.add("flipped"); Sound.cardFlip();
  setTimeout(()=>{ kind==="pc"?openPc(id):openNpc(id); }, quiet?0:520);
});
const latest=DATA.sessions[DATA.sessions.length-1];
$("#latestTitle").textContent=`Session ${latest.n}: ${latest.t}`;
$("#latestMeta").textContent="Recorded in the party's chronicle";
let inkTimer=null;
function startInk(){
  const el=$("#latestInk");
  if(inkDone || quiet){ el.textContent=latest.s; inkDone=true; return; }
  clearInterval(inkTimer); el.innerHTML=""; let i=0; const txt=latest.s;
  const span=document.createElement("span"), caret=document.createElement("span"); caret.className="caret"; el.append(span,caret);
  setTimeout(()=>{ inkTimer=setInterval(()=>{
    if(current!=="home"){ clearInterval(inkTimer); span.textContent=txt; caret.remove(); inkDone=true; return; }
    i+=2; span.textContent=txt.slice(0,i); if(i%4===0) Sound.scratch();
    if(i>=txt.length){ clearInterval(inkTimer); caret.remove(); inkDone=true; }
  },isPhone()?14:18); },900);
}
$("#latest").addEventListener("click",()=>{ if(!inkDone){ clearInterval(inkTimer); $("#latestInk").textContent=latest.s; inkDone=true; }});

/* =====================================================================
   CHRONICLE
   ===================================================================== */
$("#timeline").innerHTML=[...DATA.sessions].reverse().map((s,i)=>`
  <div class="entry ${i===0?"open":""}">
    <button class="head" aria-expanded="${i===0}"><span class="num">Session ${esc(s.n)}</span><span class="ttl">${esc(s.t)}</span><span class="chev">${ICONS.chev}</span></button>
    <div class="body"><div><p>${esc(s.s)}</p>
    ${s.who&&s.who.length?`<div class="faces">${s.who.filter(id=>npcById[id]).map(id=>`<button class="chip" data-npc="${esc(id)}">${esc(npcById[id].name)}</button>`).join("")}</div>`:""}
    </div></div>
  </div>`).join("");
dealIn($("#timeline"));
$("#timeline").addEventListener("click",e=>{ const h=e.target.closest(".head"); if(!h) return; const en=h.parentElement; const o=en.classList.toggle("open"); h.setAttribute("aria-expanded",o); if(o) Sound.scratch(); });

/* =====================================================================
   SOULS
   ===================================================================== */
const SOUL_FILTERS=[["all","All"],["ally","Allies"],["unsure","Uncertain"],["foe","Foes"],["fallen","Fallen"]];
let soulFilter="all";
$("#soulFilters").innerHTML=SOUL_FILTERS.map(([k,l])=>`<button data-f="${k}" class="${k==="all"?"on":""}">${l}</button>`).join("");
function soulClass(n){ return n.fate==="dead"?"fallen":n.side; }
function soulTile(n,i){ const t=TIER[tierOf(n)]; return `
  <button class="soul ${n.pc?"hero":esc(soulClass(n))}" ${n.pc?`data-pc="${esc(n.id)}"`:`data-npc="${esc(n.id)}"`} aria-label="Summon ${esc(n.name)}">
    ${isNew(n)?'<span class="newtag">New</span>':""}<div class="frame"><div class="inner">${portrait(n)}${n.fate==="dead"?'<div class="cross">✝ fallen ✝</div>':""}</div></div>
    <div class="name">${esc(n.name)}</div>${n.epi?`<div class="epi">${esc(n.pc?n.sp+" "+n.cl.replace(/ \d+$/,""):n.epi)}</div>`:""}
  </button>`; }
function renderSouls(){
  const list=DATA.npcs.filter(n=> soulFilter==="all" || (soulFilter==="fallen"? n.fate==="dead" : (n.side===soulFilter && n.fate!=="dead")));
  const box=$("#souls"); box.innerHTML=list.map(soulTile).join(""); dealIn(box);
  if(current==="souls"){ observeReveals(); attachTilt(box); }
}
$("#soulFilters").addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; soulFilter=b.dataset.f; $$("#soulFilters button").forEach(x=>x.classList.toggle("on",x===b)); Sound.scratch(); renderSouls(); });
renderSouls();

/* =====================================================================
   PLACES
   ===================================================================== */
const regions=["All",...new Set(DATA.places.map(p=>p.r))];
let placeFilter="All";
$("#placeFilters").innerHTML=regions.map(r=>`<button data-f="${esc(r)}" class="${r==="All"?"on":""}">${esc(r)}</button>`).join("");
function renderPlaces(){
  const box=$("#places");
  box.innerHTML=DATA.places.filter(p=>placeFilter==="All"||p.r===placeFilter).map(p=>`
    <div class="place ornate" data-place="${esc(p.n)}" style="cursor:pointer">${isNew(p)?'<span class="newtag">New</span>':""}${glyph(p.g)}<div class="region">${esc(p.r)}</div><h3>${esc(p.n)}</h3><p>${esc(p.p)}</p>
    <div class="when">${p.s!=="—"?`First visited: Session ${esc(p.s)}`:"Not yet visited"}</div></div>`).join("");
  ornament(box); dealIn(box);
  if(current==="places"){ observeReveals(); attachTilt(box); }
}
$("#placeFilters").addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; placeFilter=b.dataset.f; $$("#placeFilters button").forEach(x=>x.classList.toggle("on",x===b)); Sound.scratch(); renderPlaces(); });
renderPlaces();

/* =====================================================================
   FORTUNES
   ===================================================================== */
function tarokkaBack(i,o={}){
  const label=o.label||"TAROKKA", v=o.violet;
  const c1=v?"#2c1d3d":"#3a1512", c2=v?"#1c1229":"#26100d", glow=v?"#9b7ac9":"#c4483c";
  return `<svg viewBox="0 0 100 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs>
      <pattern id="tp${label}${i}" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="${c1}"/><rect width="3.5" height="7" fill="${c2}"/></pattern>
      <radialGradient id="tg${label}${i}"><stop offset="0" stop-color="${glow}" stop-opacity=".6"/><stop offset=".6" stop-color="${glow}" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient>
    </defs>
    <rect width="100" height="160" fill="url(#tp${label}${i})"/><rect width="100" height="160" fill="url(#tg${label}${i})"/>
    <rect x="5" y="5" width="90" height="150" rx="4" fill="none" stroke="#c9a45e" stroke-width="1.1"/>
    <rect x="8.5" y="8.5" width="83" height="143" rx="3" fill="none" stroke="#c9a45e" stroke-width=".45" stroke-dasharray="2 1.6"/>
    <g fill="#c9a45e"><path d="M12 12l3-3 3 3-3 3z"/><path d="M82 12l3-3 3 3-3 3z"/><path d="M12 148l3-3 3 3-3 3z"/><path d="M82 148l3-3 3 3-3 3z"/></g>
    <text x="50" y="25" text-anchor="middle" font-family="Cinzel, serif" font-size="7" letter-spacing="2.5" fill="#d9b874">${label}</text>
    <g fill="none" stroke="#d9b874" stroke-width=".9">
      <circle cx="50" cy="${o.name?74:80}" r="28"/><circle cx="50" cy="${o.name?74:80}" r="21" stroke-dasharray="1.5 2.5"/>
      ${v?`<path d="M58 56a19 19 0 1 0 6 26 15 15 0 1 1-6-26Z" stroke-width="1.2"/><path d="m40 66 1.6 3.6 3.9.4-2.9 2.6.8 3.8-3.4-2-3.4 2 .8-3.8-2.9-2.6 3.9-.4Z"/>`
         :`<g transform="translate(27 57) scale(.46)"><path d="m50 4 11 30h32L67 53l10 33-27-20-27 20 10-33L7 34h32Z" stroke-width="1.8"/></g>`}
    </g>
    ${v?"":`<circle cx="50" cy="80" r="4.2" fill="#c4483c" stroke="#f3d993" stroke-width=".6"/>`}
    ${o.name?`<path d="M14 112h72l-5 7 5 7H14l5-7Z" fill="#7a1f1a" stroke="#d9b874" stroke-width=".7"/><text x="50" y="121.6" text-anchor="middle" font-family="Cinzel, serif" font-weight="600" font-size="${o.name.length>7?6.2:7.2}" letter-spacing="1.6" fill="#f3e6c4">${esc(o.name)}</text>`:""}
  </svg>`;
}
$("#deck").innerHTML=DATA.tarokka.map((c,i)=>`
  <button class="card" aria-label="Reveal fortune: ${esc(c.n)}">
    <div class="flip">
      <div class="face back">${tarokkaBack(i)}<div class="hint">tap to reveal</div></div>
      <div class="face front"><div class="suit">Tarokka · ${i+1} of 5</div><h4>${esc(c.n)}</h4><p>${esc(c.p)}</p><div class="st"><span class="pill ${esc(c.st)}">${c.st==="done"?"Fulfilled":"Unresolved"}</span></div></div>
    </div>
  </button>`).join("");
dealIn($("#deck"));
$("#visions").innerHTML=DATA.visions.map((v,i)=>`
  <button class="card vcard" aria-label="Reveal ${esc(v.who)}'s fortune">
    <div class="flip">
      <div class="face back">${tarokkaBack(i,{label:"FORTUNE",violet:true,name:v.who.toUpperCase()})}<div class="hint">tap to reveal</div></div>
      <div class="face front"><div class="suit">Madam Eva's vision for</div><h4>${esc(v.who)}</h4><p>${esc(v.p)}</p></div>
    </div>
  </button>`).join("");
dealIn($("#visions"));
document.addEventListener("click",e=>{ const c=e.target.closest(".card"); if(!c || !c.closest("#deck,#visions")) return; c.classList.toggle("flipped"); Sound.cardFlip(); });
let questFilter="ongoing";
$("#questFilters").innerHTML=[["ongoing","Ongoing"],["done","Completed"],["all","All"]].map(([k,l])=>`<button data-f="${k}" class="${k===questFilter?"on":""}">${l}</button>`).join("");
function renderQuests(){
  const box=$("#quests");
  const list=DATA.quests.filter(q=>questFilter==="all"||q.st===questFilter);
  box.innerHTML=list.length?list.map((q,i)=>{ const r=((hash(q.n)%7)-3)*.9; const pin=q.t==="Side"?"#4f7d6f":q.t==="Main"?"#b8963f":"#8c2a26";
    return `<div class="note ${esc(q.st)}"><span class="pin" style="--pin:${pin}"></span><div class="npaper" style="--r:${r}deg"><div class="type">${esc(q.t==="Vallaki"?"Vallaki":q.t+" Quest")}</div><h4>${esc(q.n)}</h4><p>${esc(q.p)}</p>${q.st==="done"?'<span class="stamp">Done</span>':""}</div></div>`; }).join("")
    :`<div class="empty">No notices pinned here.</div>`;
  dealIn(box); if(current==="fortunes") observeReveals();
}
$("#questFilters").addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; questFilter=b.dataset.f; $$("#questFilters button").forEach(x=>x.classList.toggle("on",x===b)); Sound.scratch(); renderQuests(); });
renderQuests();

/* =====================================================================
   PARTY
   ===================================================================== */

ornament();

/* =====================================================================
   CHARACTER CARD POP-UPS (a card flips onto the screen)
   ===================================================================== */
const rowBar=(k,v,max)=>`<div class="l-stat fx"><span class="k">${k}</span><span class="bar"><i style="--v:${Math.max(6,Math.min(100,Math.round((+v||0)/max*100)))}%"></i></span><span class="v">${esc(v??"—")}</span></div>`;
const rowText=(k,v,w)=>`<div class="l-stat text fx"><span class="k">${k}</span><span class="v${w?" wbw":""}">${esc(v)}</span></div>`;
const inkRule=()=>`<svg class="l-rule fx" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true"><path d="M0 10 C60 2 90 18 150 10 S240 2 300 10" fill="none" stroke="rgba(90,56,32,.55)" stroke-width="1" vector-effect="non-scaling-stroke"/><path d="M146 10l4-4 4 4-4 4z" fill="rgba(110,28,20,.75)"/></svg>`;
const nameLetters=t=>{ let i=0; return String(t).split(/(\s+)/).map(w=>/^\s+$/.test(w)?" ":`<span style="white-space:nowrap;display:inline-block">${[...w].map(c=>`<span class="ch" style="--i:${i++}">${esc(c)}</span>`).join("")}</span>`).join(""); };
function infoHTML(n,t){
  const L=[];
  L.push(`<div class="l-dateline fx">From the Archive of Barovia · Session ${esc(DATA.lastSession)}</div>`);
  L.push(`<div class="l-head">
      <div class="l-portrait fx"><div>${portrait(n)}</div></div>
      <div>
        <div class="l-stars fx" aria-hidden="true">◆</div>
        <h2 class="l-name" id="gName" aria-label="${esc(n.name)}">${nameLetters(n.name)}</h2>
        ${n.epi?`<div class="l-epi wbw">${esc(n.epi)}</div>`:""}
        <div class="l-tags fx">${n.pc?`<span class="l-tag">Player Character</span><span class="l-tag">Level ${esc(DATA.level)}</span>`:`<span class="l-tag ${n.fate==="dead"?"fallen":esc(n.side)}">${n.fate==="dead"?"Fallen":esc(SIDE_LABEL[n.side]||"")}</span>`}</div>
      </div>
    </div>`);
  L.push(inkRule());
  if(n.pc){
    const v=DATA.visions.find(x=>x.who===n.fortune);
    L.push(`<div class="l-stats">${rowBar("Armor",n.ac,22)}${n.hp?rowBar("Hit Points",n.hp,60):""}${rowBar("Perception",n.pp,20)}${rowBar("Insight",n.pi,20)}${n.dc?rowBar("Save DC",n.dc,20):""}${n.acx?rowText("Armor+",n.acx):""}</div>`);
    L.push(inkRule());
    L.push(`<div class="l-sec"><h4 class="fx">Languages</h4><div class="l-chips fx">${n.langs.map(l=>`<span class="l-chip">${esc(l)}</span>`).join("")}</div></div>`);
    L.push(inkRule());
    L.push(`<div class="l-sec"><h4 class="fx">Profile</h4><ul>${n.notes.map(x=>`<li class="wbw">${esc(x)}</li>`).join("")}</ul></div>`);
    if(v){ L.push(inkRule()); L.push(`<div class="l-sec"><h4 class="fx">Madam Eva's Vision</h4><div class="vision-text wbw">${esc(v.p)}</div></div>`); }
  } else {
    const appear=DATA.sessions.filter(s=>s.who&&s.who.includes(n.id)).map(s=>s.n);
    L.push(`<div class="l-stats">${rowText("Status",n.fate==="dead"?"Dead":n.fate==="unknown"?"Unknown":"Alive")}${n.met&&n.met!=="—"?rowText("First met","Session "+n.met):""}${n.where&&n.where!=="—"?rowText("Whereabouts",n.where,true):""}</div>`);
    L.push(inkRule());
    L.push(`<div class="l-sec"><h4 class="fx">What We Know</h4>${n.facts.length?`<ul>${n.facts.map(f=>`<li class="wbw">${esc(f)}</li>`).join("")}</ul>`:`<div class="wbw" style="font-style:italic;color:#6b4a2b">The archive holds little on this one yet.</div>`}</div>`);
    if(appear.length){ L.push(inkRule()); L.push(`<div class="l-sec"><h4 class="fx">Appears In</h4><div class="l-chips fx">${appear.map(s=>`<button class="l-chip" data-sess="${esc(s)}">Session ${esc(s)}</button>`).join("")}</div></div>`); }
  }
  L.push(`<button class="l-fold fx" data-close>Close</button>`);
  return L.join("");
}
function prepWords(root){
  let d=0; const step=isPhone()?24:28;
  root.querySelectorAll(".wbw").forEach(el=>{ el.innerHTML=el.textContent.trim().split(/\s+/).map(w=>`<span class="w2" style="--d:${(d++)*step}">${esc(w)}</span>`).join(" "); });
  let i=0; root.querySelectorAll(".fx").forEach(el=>el.style.setProperty("--i",i++));
}
let gTimers=[], gLastFocus=null;
function finishSummon(){ gTimers.forEach(clearTimeout); gTimers=[]; $("#gacha").classList.add("on","c1","c2","c3","skip","done"); }
function showCard(o){
  const g=$("#gacha");
  gTimers.forEach(clearTimeout); gTimers=[]; gLastFocus=document.activeElement;
  g.style.setProperty("--rc",o.rc); g.className="on";
  $("#cback").innerHTML=`<div class="cb-art">${o.back}</div>`;
  $("#gInfo").innerHTML=o.html; prepWords($("#gInfo"));
  $("#gWrap").scrollTop=0; $("#gClose").innerHTML=ICONS.close;
  document.body.style.overflow="hidden";
  Sound.crunch();
  if(quiet){ g.classList.add("c1","c2","c3","skip","done"); $("#gClose").focus(); return; }
  void g.offsetWidth; g.classList.add("c1");
  gTimers.push(setTimeout(()=>Sound.whoosh(),120));
  gTimers.push(setTimeout(()=>Sound.cardFlip(),620));
  gTimers.push(setTimeout(()=>{ g.classList.add("c2"); Sound.chime(o.stars,o.foe); },1300));
  gTimers.push(setTimeout(()=>{ g.classList.add("c3"); },1800));
  gTimers.push(setTimeout(()=>{ g.classList.add("done"); $("#gClose").focus({preventScroll:true}); },1950));
}
function summon(n){
  if(!n) return;
  const t=TIER[tierOf(n)];
  showCard({rc:t.rc, back:tarokkaBack(hash(n.id)%9,{label:"BAROVIA",violet:n.side==="foe"||n.pc?false:t.label==="Epic"}), html:infoHTML(n,t), stars:t.s, foe:n.side==="foe" && n.fate!=="dead"});
}
function closeGacha(){
  const g=$("#gacha"); gTimers.forEach(clearTimeout); gTimers=[];
  const end=()=>{ g.className=""; document.body.style.overflow=""; setTimeout(()=>$$(".pcard.flipped").forEach(c=>{ c.classList.remove("flipped"); }),120); if(gLastFocus&&gLastFocus.focus) try{gLastFocus.focus({preventScroll:true})}catch(e){} };
  if(quiet){ end(); return; }
  g.classList.remove("skip"); g.classList.add("closing"); Sound.cardFlip(); setTimeout(end,500);
}
function openNpc(id){ summon(npcById[id]); }
function openPc(id){ summon(pcById[id]); }
$("#gacha").addEventListener("click",e=>{
  const g=$("#gacha");
  if(!g.classList.contains("done")){ finishSummon(); return; }
  if(e.target.closest("#gClose,[data-close]")) return closeGacha();
  const s=e.target.closest("[data-sess]"); if(s){ closeGacha(); setTimeout(()=>gotoSession(s.dataset.sess),510); }
  const pl=e.target.closest("[data-place]"); if(pl){ const nm=pl.dataset.place; closeGacha(); setTimeout(()=>openPlace(nm),520); }
});
let gy=0; $("#gWrap").addEventListener("touchstart",e=>{ gy=e.touches[0].clientY; },{passive:true});
$("#gWrap").addEventListener("touchend",e=>{ const dy=e.changedTouches[0].clientY-gy; if(dy>110 && $("#gWrap").scrollTop<=0 && $("#gacha").classList.contains("done")) closeGacha(); },{passive:true});
document.addEventListener("keydown",e=>{ if(e.key==="Escape" && $("#gacha").classList.contains("on")) closeGacha(); });
document.addEventListener("click",e=>{
  if(e.target.closest("#gacha")) return;
  const b=e.target.closest("[data-npc]"); if(b) return openNpc(b.dataset.npc);
  const p=e.target.closest("[data-pc]"); if(p) return openPc(p.dataset.pc);
  const pl=e.target.closest("#listView [data-place]"); if(pl) return openPlace(pl.dataset.place);
});
function gotoSession(n){
  location.hash="chronicle";
  setTimeout(()=>{ const en=$$(".entry").find(x=>x.querySelector(".num").textContent==="Session "+n); if(en){ en.classList.add("open","in"); en.scrollIntoView({behavior:quiet?"auto":"smooth",block:"center"}); } },700);
}

/* =====================================================================
   INTERACTIVE MAP OF BAROVIA
   ===================================================================== */
const placeByName=Object.fromEntries(DATA.places.map(p=>[p.n,p]));
const MARK=c=>`<svg class="mk" viewBox="0 0 30 38" aria-hidden="true"><path d="M15 37C15 37 2 22 2 13.5A13 13 0 0 1 28 13.5C28 22 15 37 15 37Z" fill="${c}" stroke="#f3d993" stroke-width="1.6"/><circle cx="15" cy="13.5" r="5.5" fill="#f3e6c4" stroke="#5a3a1a" stroke-width="1"/></svg>`;
function buildMap(){
  const stage=$("#stage");
  stage.insertAdjacentHTML("beforeend",`
    <svg class="trail" viewBox="0 0 ${MAP_W} ${MAP_H}" aria-hidden="true">
      <defs><mask id="trailMask" maskUnits="userSpaceOnUse" x="0" y="0" width="${MAP_W}" height="${MAP_H}">
        <path d="${esc(TRAIL_MAIN)}" pathLength="1"/><path d="${esc(TRAIL_SIDE)}" pathLength="1"/><path d="${esc(TRAIL_LAKE)}" pathLength="1"/>
      </mask></defs>
      <g mask="url(#trailMask)">${[TRAIL_MAIN,TRAIL_SIDE,TRAIL_LAKE].map(d=>`<path class="shadow" d="${esc(d)}"/><path class="ink" d="${esc(d)}"/>`).join("")}</g>
    </svg>
    <div class="here" style="left:842px;top:462px"><i></i><i></i><b>You are here</b></div>
    ${PINS.map((p,i)=>`<button class="pin ${p.town?"town":""} ${p.side?"side-"+esc(p.side):""}" style="left:${+p.x||0}px;top:${+p.y||0}px;--pd:${i*90}ms" data-place="${esc(p.key)}" aria-label="${esc(p.label||p.key)}"><span class="pi">${MARK(p.town?"#8c1f17":"#6e4a1e")}<span class="lb">${esc(p.label||p.key)}</span></span></button>`).join("")}`);
}
const mapState={s:1,x:0,y:0,min:.2,max:2.2};
function applyMap(){
  const st=mapState, box=$("#mapbox"), W=box.clientWidth, H=box.clientHeight, sw=MAP_W*st.s, sh=MAP_H*st.s;
  st.x = sw<=W ? (W-sw)/2 : Math.min(0,Math.max(W-sw,st.x));
  st.y = sh<=H ? (H-sh)/2 : Math.min(0,Math.max(H-sh,st.y));
  if(mapRAF) return;
  mapRAF=requestAnimationFrame(()=>{ mapRAF=0; const stg=$("#stage"); stg.style.transform=`translate(${mapState.x}px,${mapState.y}px) scale(${mapState.s})`;
    const inv=(1/mapState.s).toFixed(3); if(inv!==lastInv){ lastInv=inv; stg.style.setProperty("--inv",inv); }
    if(!mapFull && mapState.s*(devicePixelRatio||1)>.55) loadMapFull(); });
}
let mapRAF=0, lastInv="";
const MAP_SMALL="img/barovia-map-1000.webp", MAP_FULL="img/barovia-map.webp";
let mapFull=false;
function loadMapFull(){
  if(mapFull) return; mapFull=true;
  const im=new Image(); im.src=MAP_FULL;
  const swap=()=>{ $("#mapImg").src=MAP_FULL; };
  im.decode ? im.decode().then(swap,swap) : (im.onload=swap);
}
function zoomAt(f,cx,cy){
  const st=mapState, ns=Math.min(st.max,Math.max(st.min,st.s*f));
  st.x=cx-(cx-st.x)*(ns/st.s); st.y=cy-(cy-st.y)*(ns/st.s); st.s=ns; applyMap();
}
function resetMap(){
  const box=$("#mapbox"), W=box.clientWidth, H=box.clientHeight;
  mapState.min=Math.min(W/MAP_W,H/MAP_H);
  // frame the explored region: winery to the Gates
  const x0=200,x1=1960,y0=300,y1=960;
  const s=Math.max(mapState.min,Math.min(W/(x1-x0),H/(y1-y0)));
  const focus = W<700 ? {x:1000,y:620,s:Math.max(s,.42)} : {x:(x0+x1)/2,y:(y0+y1)/2,s};
  mapState.s=focus.s; mapState.x=W/2-focus.x*focus.s; mapState.y=H/2-focus.y*focus.s; applyMap();
}
function initMapInput(){
  const box=$("#mapbox"), pts=new Map(); let start=null, moved=0, pinch=null;
  const local=e=>{ const r=box.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; };
  box.addEventListener("pointerdown",e=>{
    if(e.target.closest(".map-ctrl")) return;
    box.setPointerCapture(e.pointerId); pts.set(e.pointerId,local(e)); moved=0;
    if(pts.size===1){ start={...local(e),ox:mapState.x,oy:mapState.y,target:e.target.closest(".pin")}; box.classList.add("drag"); }
    if(pts.size===2){ const [a,b]=[...pts.values()]; pinch={d:Math.hypot(a.x-b.x,a.y-b.y),s:mapState.s,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2,ox:mapState.x,oy:mapState.y}; }
  });
  box.addEventListener("pointermove",e=>{
    if(!pts.has(e.pointerId)) return; pts.set(e.pointerId,local(e));
    if(pts.size===2 && pinch){ const [a,b]=[...pts.values()], d=Math.hypot(a.x-b.x,a.y-b.y), cx=(a.x+b.x)/2, cy=(a.y+b.y)/2;
      const ns=Math.min(mapState.max,Math.max(mapState.min,pinch.s*d/pinch.d));
      mapState.x=cx-(pinch.cx-pinch.ox)*(ns/pinch.s); mapState.y=cy-(pinch.cy-pinch.oy)*(ns/pinch.s); mapState.s=ns; moved=99; applyMap(); return; }
    if(pts.size===1 && start){ const p=local(e); const dx=p.x-start.x, dy=p.y-start.y; moved=Math.max(moved,Math.hypot(dx,dy)); mapState.x=start.ox+dx; mapState.y=start.oy+dy; applyMap(); }
  });
  const up=e=>{
    if(!pts.has(e.pointerId)) return; pts.delete(e.pointerId);
    if(pts.size<2) pinch=null;
    if(pts.size===1){ const [p]=[...pts.values()]; start={...p,ox:mapState.x,oy:mapState.y,target:null}; }
    if(pts.size===0){ box.classList.remove("drag"); if(start&&start.target&&moved<8){ openPlace(start.target.dataset.place); } start=null; }
  };
  box.addEventListener("pointerup",up); box.addEventListener("pointercancel",up);
  box.addEventListener("wheel",e=>{ e.preventDefault(); const p=local(e); zoomAt(Math.exp(-e.deltaY*.0015),p.x,p.y); },{passive:false});
  box.addEventListener("keydown",e=>{ const pin=e.target.closest(".pin"); if(pin&&(e.key==="Enter"||e.key===" ")){ e.preventDefault(); openPlace(pin.dataset.place); } });
  $("#zIn").addEventListener("click",()=>{ const b=$("#mapbox"); zoomAt(1.35,b.clientWidth/2,b.clientHeight/2); Sound.scratch(); });
  $("#zOut").addEventListener("click",()=>{ const b=$("#mapbox"); zoomAt(1/1.35,b.clientWidth/2,b.clientHeight/2); Sound.scratch(); });
  $("#zReset").addEventListener("click",()=>{ resetMap(); Sound.whoosh(); });
  addEventListener("resize",()=>{ if(current==="places") resetMap(); });
}
let mapReady=false;
function enterMap(){
  if(!mapReady){ const img=$("#mapImg"); if(!img.getAttribute("src")) img.src=MAP_SMALL; buildMap(); initMapInput(); mapReady=true; }
  requestAnimationFrame(()=>{ resetMap(); const w=$(".places-wrap");
    if(!w.classList.contains("drawn")){ $$(".pin").forEach(p=>p.classList.add("drop")); setTimeout(()=>w.classList.add("drawn"),quiet?0:400); } });
}
$("#mvToggle").addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return;
  $$("#mvToggle button").forEach(x=>x.classList.toggle("on",x===b)); $(".places-wrap").classList.toggle("list",b.dataset.mv==="list"); Sound.scratch();
  document.body.classList.toggle("on-map", b.dataset.mv==="map");
  if(b.dataset.mv==="map"){ fog.stop(); enterMap(); } else { if(!quiet) fog.start(); observeReveals(); attachTilt($("#places")); } });

/* place cards (same flip-in card as characters) */
function placeHTML(p,pin){
  const L=[];
  L.push(`<div class="l-dateline fx">${esc(p.r)} · ${p.s!=="—"?"First visited in Session "+esc(p.s):"Heard of, not yet visited"}</div>`);
  L.push(`<div style="text-align:center"><div class="l-stars fx" style="font-size:18px">${p.s!=="—"?"◆":"?"}</div><div class="l-tier fx">${pin&&pin.town?"Town":"Location"}</div><h2 class="l-name" id="gName" aria-label="${esc(p.n)}">${nameLetters(p.n)}</h2></div>`);
  L.push(inkRule());
  L.push(`<div class="l-sec"><h4 class="fx">What We Know</h4><p class="wbw" style="margin:0">${esc(p.p)}</p></div>`);
  if(pin&&pin.places){ L.push(inkRule()); L.push(`<div class="l-sec"><h4 class="fx">Places in ${esc(p.n)}</h4><div class="l-places fx">${pin.places.map(n=>placeByName[n]).filter(Boolean).map(q=>`<button class="l-place" data-place="${esc(q.n)}"><b>${esc(q.n)}</b><small>${q.s!=="—"?"Session "+esc(q.s):"heard of"}</small></button>`).join("")}</div></div>`); }
  if(p.s && p.s!=="—"){ L.push(inkRule()); L.push(`<div class="l-sec"><h4 class="fx">First Visited</h4><div class="l-chips fx"><button class="l-chip" data-sess="${esc(p.s)}">Session ${esc(p.s)}</button></div></div>`); }
  L.push(`<button class="l-fold fx" data-close>Close</button>`);
  return L.join("");
}
function openPlace(name){
  const p=placeByName[name]; if(!p) return;
  const pin=PINS.find(x=>x.key===name);
  showCard({rc:pin&&pin.town?"190,64,54":"214,172,92", back:tarokkaBack(hash(name)%9,{label:"LOCATION"}), html:placeHTML(p,pin), stars:3, foe:false});
}

/* =====================================================================
   SEARCH
   ===================================================================== */
const INDEX=[
  ...DATA.npcs.map(n=>({k:"Soul",t:n.name,d:n.epi||n.where,txt:[n.name,n.epi,n.where,...n.facts].join(" "),go:()=>openNpc(n.id)})),
  ...DATA.places.map(p=>({k:"Location",t:p.n,d:p.r,txt:[p.n,p.r,p.p].join(" "),go:()=>openPlace(p.n)})),
  ...DATA.quests.map(q=>({k:"Quest",t:q.n,d:q.p,txt:[q.n,q.p,q.t].join(" "),go:()=>{questFilter="all";$$("#questFilters button").forEach(x=>x.classList.toggle("on",x.dataset.f==="all"));renderQuests();location.hash="fortunes";}})),
  ...DATA.tarokka.map(c=>({k:"Quests · Tarokka",t:c.n,d:"Tarokka reading",txt:[c.n,c.p].join(" "),go:()=>{location.hash="fortunes";}})),
  ...DATA.sessions.map(s=>({k:"Session "+s.n,t:s.t,d:s.s.slice(0,80)+"…",txt:[s.t,s.s].join(" "),go:()=>gotoSession(s.n)})),
  ...PCS.map(p=>({k:"Party",t:p.n,d:p.cl,txt:[p.n,p.sp,p.cl,...p.notes].join(" "),go:()=>openPc(p.id)}))
];
const q=$("#q"), res=$("#results");
$("#searchBtn").addEventListener("click",()=>{ const h=$("#hdr"); const on=h.classList.toggle("searching"); $("#searchBtn").innerHTML=on?ICONS.close:ICONS.search; if(on){ document.body.classList.remove("compact"); setTimeout(()=>q.focus(),50);} else { res.classList.remove("on"); q.value=""; } });
q.addEventListener("input",()=>{
  const v=q.value.trim().toLowerCase(); if(v.length<2){ res.classList.remove("on"); return; }
  const hits=INDEX.map(it=>{const t=it.t.toLowerCase(), x=it.txt.toLowerCase(); const s=t.startsWith(v)?3:t.includes(v)?2:x.includes(v)?1:0; return {it,s};}).filter(h=>h.s).sort((a,b)=>b.s-a.s).slice(0,12);
  res.innerHTML=hits.length?hits.map(h=>`<button data-i="${INDEX.indexOf(h.it)}"><b>${esc(h.it.t)}</b><small>${esc(h.it.k)} · ${esc(h.it.d||"")}</small></button>`).join(""):`<div class="none">Nothing in the archive matches. The mists keep their secrets.</div>`;
  res.classList.add("on");
});
res.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; INDEX[+b.dataset.i].go(); res.classList.remove("on"); q.value=""; q.blur(); if($("#hdr").classList.contains("searching")) $("#searchBtn").click(); });
document.addEventListener("click",e=>{ if(!e.target.closest(".search")) res.classList.remove("on"); });
q.addEventListener("keydown",e=>{ if(e.key==="Enter"){ const b=res.querySelector("button"); if(b) b.click(); } });

/* =====================================================================
   INK-WASH CLOUDS (canvas)
   ===================================================================== */
const fog=(()=>{
  /* Clouds are painted ONCE into a small canvas (twice as wide as the screen, seamlessly tiled),
     then drifted with a GPU-only CSS transform. No per-frame repainting. */
  const cv=$("#fog"), cx=cv.getContext("2d"); let painted=false, rt=null;
  const tints=["236,226,204","200,170,150","150,130,170","170,120,110"];
  function paint(){
    const k=.35, vw=innerWidth, vh=innerHeight;          // low-res: clouds are soft anyway
    const W=Math.round(vw*k), H=Math.round(vh*k);
    cv.width=W*2; cv.height=H; cx.clearRect(0,0,W*2,H);
    const n=isPhone()?12:20;
    for(let i=0;i<n;i++){
      const x=Math.random()*W, y=H*(.25+Math.random()*.8), r=(isPhone()?240:400)*k*(.6+Math.random()), a=.03+Math.random()*.045, c=tints[i%tints.length];
      for(const off of [-W,0,W,2*W]){ const X=x+off; if(X<-r||X>2*W+r) continue;
        const g=cx.createRadialGradient(X,y,0,X,y,r); g.addColorStop(0,`rgba(${c},${a})`); g.addColorStop(.6,`rgba(${c},${a*.4})`); g.addColorStop(1,`rgba(${c},0)`);
        cx.fillStyle=g; cx.beginPath(); cx.arc(X,y,r,0,6.283); cx.fill(); }
    }
    painted=true;
  }
  function start(){ if(!painted) paint(); cv.classList.add("run"); }
  function stop(){ cv.classList.remove("run"); }
  addEventListener("resize",()=>{ clearTimeout(rt); rt=setTimeout(()=>{ painted=false; if(cv.classList.contains("run")) paint(); },250); });
  return {start,stop};
})();

/* ---------- bats ---------- */
let batTimer=null;
function spawnBats(){
  if(quiet) return;
  const n=1+Math.floor(Math.random()*3), y0=10+Math.random()*40, ltr=Math.random()<.5;
  for(let i=0;i<n;i++){
    const b=document.createElement("div"); b.className="bat";
    b.innerHTML='<svg viewBox="0 0 64 32"><path fill="#140c0a" d="M32 12c-2-4-4-5-6-5 1 2 1 4 0 5-4-5-10-8-18-7 4 2 6 6 6 10-3-2-7-2-12 0 6 2 11 6 14 13 3-4 8-6 12-5 1 2 3 4 4 4s3-2 4-4c4-1 9 1 12 5 3-7 8-11 14-13-5-2-9-2-12 0 0-4 2-8 6-10-8-1-14 2-18 7-1-1-1-3 0-5-2 0-4 1-6 5Z"/></svg>';
    document.body.appendChild(b);
    const dur=5200+Math.random()*2600, delay=i*260, sx0=ltr?-80:innerWidth+80, ex=ltr?innerWidth+80:-80, y=innerHeight*(y0/100)+i*28, amp=30+Math.random()*50, sc=.6+Math.random()*.7;
    /* path is sampled once into keyframes; the browser animates it without a per-frame script */
    const frames=[]; for(let k=0;k<=24;k++){ const f=k/24, x=sx0+(ex-sx0)*f, yy=y+Math.sin(f*12)*amp*.35-Math.sin(f*3.14)*amp; frames.push({transform:`translate(${x}px,${yy}px) scale(${ltr?sc:-sc},${sc})`}); }
    b.style.transform=frames[0].transform;
    b.animate(frames,{duration:dur,delay,easing:"linear",fill:"backwards"}).onfinish=()=>b.remove();
  }
  if(Sound.isOn()) Sound.whoosh();
}
function batLoop(){ clearTimeout(batTimer); batTimer=setTimeout(()=>{ spawnBats(); batLoop(); }, 24000+Math.random()*30000); }
/* pause the bats while the page is hidden */
document.addEventListener("visibilitychange",()=>{ if(document.hidden) clearTimeout(batTimer); else if(!quiet && document.body.classList.contains("entered")) batLoop(); });

/* ---------- controls ---------- */
function paintControls(){
  const s=Sound.isOn();
  $$(".btn-sound").forEach(b=>{ b.innerHTML=s?ICONS.soundOn:ICONS.soundOff; b.setAttribute("aria-pressed",s); b.title=s?"Mute":"Unmute"; });
  $$(".btn-quiet").forEach(b=>{ b.innerHTML=quiet?ICONS.candleOut:ICONS.candle; b.setAttribute("aria-pressed",quiet); b.title=quiet?"Turn effects back on":"Quiet mode (no effects or sound)"; });
}
function applyQuiet(){
  document.body.classList.toggle("quiet",quiet);
  if(quiet){ fog.stop(); clearTimeout(batTimer); $$(".bat").forEach(b=>b.remove()); }
  else { fog.start(); batLoop(); }
  observeReveals(); paintControls();
}
$$(".btn-sound").forEach(b=>b.addEventListener("click",()=>{ const want=!Sound.isOn(); if(want && quiet){ quiet=false; store.set("bv-quiet","0"); applyQuiet(); } Sound.setOn(want); store.set("bv-sound",want?"1":"0"); paintControls(); }));
$$(".btn-quiet").forEach(b=>b.addEventListener("click",()=>{ quiet=!quiet; store.set("bv-quiet",quiet?"1":"0"); if(quiet) Sound.setOn(false); applyQuiet(); }));

/* ---------- gate ---------- */
function enter(withSound){
  document.body.classList.add("entered");
  if(withSound){ quiet=false; store.set("bv-quiet","0"); Sound.setOn(true); store.set("bv-sound","1"); setTimeout(()=>Sound.bell(1),150); setTimeout(()=>Sound.heartbeat(),1700); }
  applyQuiet();
  if(!quiet){ const m=$("#mistPart"); m.classList.add("go"); setTimeout(()=>m.classList.remove("go"),2600); }
  $("#gate").classList.add("gone"); setTimeout(()=>$("#gate").classList.add("done"),1600);
  try{ sessionStorage.setItem("bv-entered","1"); }catch(e){}
  show(location.hash.slice(1)||"home", false);
  if(!quiet) setTimeout(spawnBats,3500);
}
$("#enterBtn").addEventListener("click",()=>enter(true));
$("#enterQuiet").addEventListener("click",()=>enter(false));
let entered=false; try{ entered=sessionStorage.getItem("bv-entered")==="1"; }catch(e){}
if(entered){ document.body.classList.add("entered"); $("#gate").classList.add("gone"); setTimeout(()=>$("#gate").classList.add("done"),1600); applyQuiet(); show(location.hash.slice(1)||"home",false); }
else { paintControls(); if(!quiet) fog.start(); }
document.fonts && document.fonts.ready.then(placeMarkers);

/* once the page is idle, quietly fetch the small map and fog so the Locations tab opens without a stall */
function whenIdle(fn){ ("requestIdleCallback" in window) ? requestIdleCallback(fn,{timeout:5000}) : setTimeout(fn,2500); }
addEventListener("load",()=>whenIdle(()=>{
  ["img/barovia-map-1000.webp","img/fog.webp","img/fog2.webp"].forEach(src=>{ const im=new Image(); im.src=src; im.decode&&im.decode().catch(()=>{}); });
}));

/* offline cache + instant repeat visits */
if("serviceWorker" in navigator && (location.protocol==="https:"||location.hostname==="localhost")) addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
