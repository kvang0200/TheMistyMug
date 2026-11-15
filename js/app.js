/* =====================================================================
   THE BAROVIAN ARCHIVE — "Hunter and Hunted"
   Everything on the page is built from js/data.js. You should not need
   to edit this file to update the site after a session.
   ===================================================================== */
"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
const reduced=!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
const D=DATA, LAST=String(D.lastSession);
const npcById=Object.fromEntries(D.npcs.map(n=>[n.id,n]));
const placeByName=Object.fromEntries(D.places.map(p=>[p.n,p]));
const slug=t=>String(t).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const PCS=D.party.map((p,i)=>({...p,i,id:"pc-"+slug(p.n),name:p.n}));
const pcById=Object.fromEntries(PCS.map(p=>[p.id,p]));
const visionFor=name=>(D.visions||[]).find(v=>v.who===name.split(" ")[0]||v.who===name);
const sessionsWith=id=>D.sessions.filter(s=>(s.who||[]).includes(id));
const latest=D.sessions[D.sessions.length-1];
const earlier=D.sessions.slice(0,-1).reverse();
function isNew(x){ if(!x) return false; if(x.new===true) return true; const s=x.met!==undefined?x.met:x.s; return String(s)===LAST; }
const ROMAN=["I","II","III","IV","V","VI","VII","VIII","IX","X"];
const tilt=i=>[-1.5,1,-.6,1.4,-1.1,.8,-1.8][i%7];

const ICON={
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  soundOn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>',
  soundOff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="m17 10 4 4M21 10l-4 4"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg>',
  eye:'<svg viewBox="0 0 38 22" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2 11C8 3 30 3 36 11C30 19 8 19 2 11Z"/><circle cx="19" cy="11" r="5"/></svg>'
};

/* ---------- small builders ---------- */
const letters=(word,start,step=.06)=>[...String(word)].map((ch,i)=>ch===" "?" ":`<span class="mask" aria-hidden="true"><span style="animation-delay:calc(var(--base,0s) + ${(start+i*step).toFixed(2)}s)">${esc(ch)}</span></span>`).join("");
const d=(t)=>`style="animation-delay:calc(var(--base,0s) + ${t}s)"`;
function sil(n){
  const dead=n.fate==="dead";
  if(n.img) return `<div class="sil${dead?" dead":""}"><img src="${esc(n.img)}" alt="Portrait of ${esc(n.name)}" loading="lazy"></div>`;
  return `<div class="sil${dead?" dead":""}"><svg viewBox="0 0 120 150" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><ellipse cx="60" cy="60" rx="22" ry="27" fill="var(--p)" stroke="color-mix(in srgb, var(--s) 35%, transparent)"/><path d="M50 84h20v14H50z" fill="var(--p)"/><path d="M10 150C14 118 36 100 60 98C84 100 106 118 110 150Z" fill="var(--p)" stroke="color-mix(in srgb, var(--s) 25%, transparent)"/></svg></div>`;
}
function standing(n){
  if(n.fate==="dead") return {stamp:"DECEASED",tone:"ink",label:"Fallen"};
  if(n.fate==="unknown") return {stamp:"MISSING",tone:"red",label:"Missing"};
  if(n.side==="ally") return {stamp:"ALLY",tone:"ink",label:"Ally"};
  if(n.side==="foe") return {stamp:"HOSTILE",tone:"red",label:"Foe"};
  return {stamp:"UNCERTAIN",tone:"red",label:"Uncertain"};
}
const statusWord=n=>n.fate==="dead"?"Dead":n.fate==="unknown"?"Unknown":"Alive";
const where=n=>n.where&&n.where!=="—"?n.where:"Unknown";
const metLabel=m=>!m||m==="—"?"Not yet met":/[–-]/.test(m)?"Sessions "+m:"Session "+m;
const head=(kick,title,aside="")=>`<div class="head in"><div><span class="kick">${kick}</span><h2>${title}</h2></div>${aside}</div>`;
/* [[words]] in a session summary are blacked out until revealed */
function redacted(text){ let i=0; return esc(text).replace(/\[\[(.+?)\]\]/g,(m,w)=>`<span class="redact" style="--d:${(i++*.08).toFixed(2)}s">${w}</span>`); }
const plain=text=>String(text).replace(/\[\[(.+?)\]\]/g,"$1");

/* ---------- seals: remembered on this device ---------- */
const SEALS=(()=>{ try{ return JSON.parse(store.get("bv-seals")||"{}")||{}; }catch(e){ return {}; } })();
const isOpen=k=>!!SEALS[k];
function remember(k){ SEALS[k]=1; store.set("bv-seals",JSON.stringify(SEALS)); }
function forget(k){ delete SEALS[k]; store.set("bv-seals",JSON.stringify(SEALS)); }
const resealBtn=what=>`<button type="button" class="reseal" data-reseal aria-label="Seal ${esc(what)} again"><span>Reseal</span><i aria-hidden="true"></i></button>`;
const BLOB="M24 2C30 2 33 6 38 7C44 8 46 13 45 19C44 25 47 28 44 34C41 40 36 41 31 44C26 47 21 46 16 44C10 42 6 39 4 33C2 27 5 23 4 17C3 11 8 7 13 6C18 5 20 2 24 2Z";
const EMBLEM={
  key:'<circle cx="24" cy="21.5" r="3.6" fill="rgba(22,17,14,.72)"/><path d="M22.4 24.5H25.6L26.8 33H21.2Z" fill="rgba(22,17,14,.72)"/>',
  eye:'<path d="M14.5 24C17.5 19.6 30.5 19.6 33.5 24C30.5 28.4 17.5 28.4 14.5 24Z" fill="none" stroke="rgba(22,17,14,.75)" stroke-width="1.6"/><circle cx="24" cy="24" r="2.6" fill="rgba(22,17,14,.75)"/>'
};
function sealArt(kind){
  return `<svg viewBox="0 0 48 48"><path d="${BLOB}" transform="translate(.8 1.6)" fill="rgba(0,0,0,.38)"/><path d="${BLOB}" fill="var(--a)"/><path d="${BLOB}" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="1"/><ellipse cx="17" cy="14" rx="9" ry="5.5" fill="#fff" opacity=".13"/><circle cx="24" cy="24" r="14" fill="rgba(0,0,0,.08)" stroke="color-mix(in srgb,var(--s) 50%,transparent)" stroke-width="1.2"/>${EMBLEM[kind]||EMBLEM.key}</svg>`;
}
function wax(kind="key",w=78){
  const art=sealArt(kind);
  return `<span class="wax" style="--w:${w}px" aria-hidden="true"><span class="disc whole">${art}</span><span class="disc l">${art}</span><span class="disc r">${art}</span><svg class="crackline" viewBox="0 0 100 100"><polyline pathLength="1" points="53,-4 44,22 58,41 45,60 55,79 47,104" fill="none" stroke="var(--p)" stroke-width="3" stroke-linejoin="round"/></svg><span class="shard" style="left:46%;top:30%;width:9px;height:7px;clip-path:polygon(0 0,100% 30%,40% 100%);--x:-38px;--y:-26px;--r:-140deg"></span><span class="shard" style="left:52%;top:55%;width:7px;height:9px;clip-path:polygon(0 20%,100% 0,70% 100%);--x:40px;--y:-18px;--r:160deg"></span><span class="shard" style="left:48%;top:78%;width:6px;height:6px;clip-path:polygon(50% 0,100% 100%,0 80%);--x:10px;--y:44px;--r:90deg"></span></span>`;
}
function flipCard({key,cls="",i=0,front,back,frontParch=true,id="",still=false}){
  const open=isOpen(key);
  return `<div class="flip${still?"":" sway"} in ${cls}${open?" is-open instant":""}" data-seal="${esc(key)}"${id?` id="${esc(id)}"`:""} style="--tilt:${tilt(i)}deg;--i:${i}"><div class="shade"></div><div class="inner"><div class="face front${frontParch?" parch":""}"${open?" inert":""}>${front}</div><div class="face back parch"${open?"":" inert"}>${back}${resealBtn("this card")}</div></div></div>`;
}
/* a wax-sealed note (personal fortunes): tap the seal to crack it, tap again to reseal */
function sealBox(key,name,inner){
  const open=isOpen(key), first=name.split(" ")[0];
  return `<div class="sealbox${open?" is-open instant":""}" data-seal="${esc(key)}">
    <button type="button" class="seal-row" data-break aria-expanded="${open}" aria-label="${open?"Seal "+esc(first)+"'s fortune again":"Break the seal on "+esc(first)+"'s fortune"}">${wax("key",62)}<span class="seal-txt"><span class="seal-title">${open?"Seal it again":"Break the seal"}</span><span class="seal-sub">For ${esc(first)} only</span></span></button>
    <div class="seal-body"${open?"":" hidden"}>${inner}</div>
  </div>`;
}
const fortuneText=v=>`<p>${esc(v.p)}</p><span class="label" style="color:var(--ink-muted)">From Madam Eva · Session 5</span>`;

/* =====================================================================
   EFFECTS: wax shards and embers when a seal breaks, a red glow on the
   opened card, crumbs when a seal is pressed back on. Drawn on one
   full-screen canvas that only runs while particles are in the air.
   ===================================================================== */
const FX=(()=>{
  let cv=null,cx=null,parts=[],raf=0,dpr=1;
  const ok=()=>!reduced&&!!Element.prototype.animate;
  function size(){ dpr=Math.min(2,devicePixelRatio||1); cv.width=Math.round(innerWidth*dpr); cv.height=Math.round(innerHeight*dpr); }
  function canvas(){ if(cv) return; cv=document.createElement("canvas"); cv.className="fx-canvas"; cv.setAttribute("aria-hidden","true"); document.body.appendChild(cv); cx=cv.getContext("2d"); size(); addEventListener("resize",size); }
  const mid=el=>{ const r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,w:r.width}; };
  function burst(x,y,o={}){
    canvas();
    const n=o.count||30, cols=o.colors;
    for(let i=0;i<n;i++){
      const a=Math.random()*Math.PI*2, sp=(o.speed||5)*(.35+Math.random());
      parts.push({x:x+(Math.random()-.5)*(o.jitter||0),y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-(o.lift||0),life:0,max:(o.life||60)*(.6+Math.random()*.7),
        r:(o.size||2.4)*(.5+Math.random()),c:cols[i%cols.length],g:o.gravity!=null?o.gravity:.08,shard:!!o.shard,rot:Math.random()*6.28,vr:(Math.random()-.5)*.35,drag:o.drag||.97});
    }
    if(!raf) raf=requestAnimationFrame(tick);
  }
  function tick(){
    cx.setTransform(dpr,0,0,dpr,0,0); cx.clearRect(0,0,innerWidth,innerHeight);
    for(let i=parts.length-1;i>=0;i--){
      const p=parts[i]; if(++p.life>p.max){ parts.splice(i,1); continue; }
      p.vx*=p.drag; p.vy=p.vy*p.drag+p.g; p.x+=p.vx; p.y+=p.vy; p.rot+=p.vr;
      const t=1-p.life/p.max; cx.globalAlpha=Math.max(0,Math.min(1,t*1.4));
      if(p.shard){
        cx.globalCompositeOperation="source-over"; cx.save(); cx.translate(p.x,p.y); cx.rotate(p.rot); cx.fillStyle=p.c;
        cx.beginPath(); cx.moveTo(-p.r*1.7,-p.r*.5); cx.lineTo(p.r*1.3,-p.r*1.1); cx.lineTo(p.r*.9,p.r*1.3); cx.closePath(); cx.fill();
        cx.fillStyle="rgba(255,255,255,.18)"; cx.beginPath(); cx.moveTo(-p.r*1.2,-p.r*.4); cx.lineTo(p.r*.6,-p.r*.8); cx.lineTo(0,0); cx.closePath(); cx.fill(); cx.restore();
      }else{
        cx.globalCompositeOperation="lighter"; const rr=p.r*(2.2+t), g=cx.createRadialGradient(p.x,p.y,0,p.x,p.y,rr);
        g.addColorStop(0,p.c); g.addColorStop(.35,p.c); g.addColorStop(1,"rgba(0,0,0,0)"); cx.fillStyle=g; cx.beginPath(); cx.arc(p.x,p.y,rr,0,6.2832); cx.fill();
      }
    }
    cx.globalAlpha=1; cx.globalCompositeOperation="source-over";
    if(parts.length) raf=requestAnimationFrame(tick); else { raf=0; cx.clearRect(0,0,innerWidth,innerHeight); }
  }
  const WAX=["#b3131c","#8f0f17","#d22a33","#5e0a0f","#c41e27"], EMBER=["#ffd27a","#ff9a4a","#ff5a3a"];
  function glow(el,delay){ if(el) el.animate([{boxShadow:"0 0 0 0 rgba(179,19,28,0)"},{boxShadow:"0 0 60px 6px rgba(179,19,28,.55)",offset:.35},{boxShadow:"0 0 0 0 rgba(179,19,28,0)"}],{duration:1600,delay,easing:"cubic-bezier(.16,1,.3,1)"}); }
  return {
    /* the seal shudders, bursts into shards and sparks, the card jolts, then glows red once it has turned */
    sealBreak(wax,inner,shade){
      if(!ok()) return;
      const c=mid(wax), k=Math.max(.7,c.w/80);
      burst(c.x,c.y,{count:34,colors:WAX,shard:true,speed:7*k,gravity:.3,life:80,size:3.6*k,lift:3,drag:.985});
      burst(c.x,c.y,{count:18,colors:EMBER,speed:3.5*k,life:45,size:1.8});
      if(inner) inner.animate([{translate:"0 0"},{translate:"-6px 0"},{translate:"5px 0"},{translate:"-2px 0"},{translate:"0 0"}],{duration:380,easing:"cubic-bezier(.65,0,.35,1)"});
      glow(shade,900);
    },
    /* a fresh blob of wax lands: a few crumbs fly */
    rewax(el){
      if(!ok()||!el) return; const c=mid(el);
      burst(c.x,c.y,{count:14,colors:WAX.slice(0,2),speed:2.5,life:35,size:2.2,shard:true,gravity:.15});
    },
  };
})();

/* =====================================================================
   SCROLL MOTION (SX)
   Writes how far each element has scrolled into view onto it as CSS
   variables (--sxe, --sxp, --sxq; see the end of css/style.css). Only
   elements on or near the screen are measured, once per frame, and
   only while the page is actually scrolling. Works in every browser.
   ===================================================================== */
const SX=(()=>{
  const SEL=".in,.mist,.ribbon,.bgword,.thread-host,.mapframe";
  const live=new Set(), rootEl=document.documentElement; let raf=0, io=null;
  const clamp=v=>v<0?0:v>1?1:v;
  function set(el,k,v){ const t=v.toFixed(3); if(el["_"+k]!==t){ el["_"+k]=t; el.style.setProperty(k,t); } }
  function measure(el,vh){
    const r=el.getBoundingClientRect(); if(!r.height&&!r.width) return;
    const e=clamp((vh-r.top)/(vh*.55));
    set(el,"--sxe",1-Math.pow(1-e,3));
    set(el,"--sxp",clamp((vh-r.top)/(vh+r.height)));
    set(el,"--sxq",clamp((vh*.75-r.top)/Math.max(1,r.height)));
  }
  function frame(){
    raf=0; const vh=innerHeight, y=scrollY, H=rootEl.scrollHeight-vh;
    set(rootEl,"--sy",clamp(y/vh)); set(rootEl,"--sp",H>0?clamp(y/H):0);
    live.forEach(el=>{ if(!el.isConnected) live.delete(el); else measure(el,vh); });
  }
  const kick=()=>{ if(!raf) raf=requestAnimationFrame(frame); };
  function scan(){
    if(reduced) return;
    if(!io) io=new IntersectionObserver(list=>{ list.forEach(x=>{ if(x.isIntersecting) live.add(x.target); else { live.delete(x.target); measure(x.target,innerHeight); } }); kick(); },{rootMargin:"30% 0px 30% 0px"});
    const vh=innerHeight;
    $$(SEL).forEach(el=>{ if(!el._sx){ el._sx=1; io.observe(el); } if(el.offsetParent!==null) measure(el,vh); });
    kick();
  }
  if(!reduced){ addEventListener("scroll",kick,{passive:true}); addEventListener("resize",kick); }
  return {scan,kick};
})();
/* numbers in the campaign strip count up the first time they come into view */
function countUp(scope){
  if(reduced||!("IntersectionObserver" in window)) return;
  const io=new IntersectionObserver(list=>list.forEach(x=>{ if(!x.isIntersecting) return; io.unobserve(x.target);
    const el=x.target, full=el.textContent, m=full.match(/^(\d+)(.*)$/); if(!m) return; const to=+m[1], t0=performance.now();
    const step=now=>{ const k=Math.min(1,(now-t0)/1100), v=Math.round(to*(1-Math.pow(1-k,3))); el.textContent=v+m[2]; if(k<1) requestAnimationFrame(step); else el.textContent=full; };
    el.textContent="0"+m[2]; requestAnimationFrame(step); }),{threshold:.6});
  scope.querySelectorAll(".tally .n").forEach(n=>io.observe(n));
}
const ribbon=(a,b)=>`<div class="ribbon" aria-hidden="true"><span class="r1">${(esc(a)+" · ").repeat(6)}</span><span class="r2">${(esc(b)+" · ").repeat(6)}</span></div>`;
const toRoman=n=>{ n=parseInt(n,10)||0; let o=""; [[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]].forEach(([v,r])=>{ while(n>=v){ o+=r; n-=v; } }); return o; };

/* =====================================================================
   HOME
   ===================================================================== */
/* big lists stay still (no sway) so scrolling stays smooth on tablets */
function sessionCard(s,i,still=false){
  const people=(s.who||[]).filter(id=>npcById[id]);
  return flipCard({key:"s"+s.n,i,id:"s-"+slug(s.n),cls:"sess",still,
    front:`<button type="button" class="sealed-btn" data-crack aria-label="Break the seal on Session ${esc(s.n)}: ${esc(s.t)}"><span class="label" style="color:var(--ink-muted)">Session ${esc(s.n)}</span><span class="t" style="font-family:var(--serif);font-style:italic;font-size:26px;line-height:1.1">${esc(s.t)}</span>${wax("key",84)}<span class="label">Break the seal</span></button>`,
    back:`<div class="sess-back"><span class="label dot">Session ${esc(s.n)}</span><span class="t">${esc(s.t)}</span><p>${esc(plain(s.s))}</p>${people.length?`<div class="chips">${people.map(id=>`<button type="button" class="chip" data-npc="${esc(id)}">${esc(npcById[id].name)}</button>`).join("")}</div>`:""}</div>`});
}
function latestBlock(){
  const people=(latest.who||[]).filter(id=>npcById[id]);
  const places=D.places.filter(p=>String(p.s)===LAST);
  const hasRedactions=/\[\[.+?\]\]/.test(latest.s);
  return `<div class="latest">
    <div class="left in">
      <span class="kick">The latest session</span>
      <h2 class="h2">Session ${esc(latest.n)}:<br><i>${esc(latest.t)}</i></h2>
      <dl class="dl">
        ${people.length?`<dt>People</dt><dd>${people.map(id=>esc(npcById[id].name)).join(", ")}</dd>`:""}
        ${places.length?`<dt>Places</dt><dd>${places.map(p=>esc(p.n)).join(", ")}</dd>`:""}
        <dt>Party level</dt><dd>${esc(D.level)}</dd>
      </dl>
    </div>
    <div class="right in">
      <p class="summary" id="latestText">${redacted(latest.s)}</p>
      ${people.length?`<div class="chips">${people.map(id=>`<button type="button" class="chip" data-npc="${esc(id)}">${esc(npcById[id].name)}</button>`).join("")}</div>`:""}
      <div style="display:flex;flex-wrap:wrap;gap:12px">
        ${hasRedactions?`<button type="button" class="btn dark" data-declass aria-pressed="false"><span>Reveal the details</span>${ICON.arrow}</button>`:""}
        <a class="btn ghost" href="#sessions">All ${esc(D.sessions.length)} sessions</a>
      </div>
    </div>
  </div>`;
}
function playerCard(p){
  const v=visionFor(p.n);
  const stats=[["AC",p.ac],["HP",p.hp],["PER",p.pp],["DC",p.dc]].map(([k,x])=>`<div><dt>${k}</dt><dd>${esc(x==null?"—":x)}</dd></div>`).join("");
  return `<div class="card player sway in" data-pcard="${esc(p.id)}" style="--tilt:${tilt(p.i+1)}deg"><div class="shade"></div><article class="parch">
    <span class="topline"><span class="label" style="color:var(--ink-muted)">Level ${esc(D.level)}</span><span class="open-hint" aria-hidden="true">Open file ${ICON.arrow}</span></span>
    <button type="button" class="open-sheet" data-pc="${esc(p.id)}" aria-label="Open ${esc(p.n)}'s character sheet"><span class="who name" style="display:inline-block">${esc(p.n)}</span></button>
    <span class="cls">${esc(p.sp)} · ${esc(p.cl.replace(/ \d+$/,""))}</span>
    <dl class="stats">${stats}</dl>
    ${(p.langs||[]).length?`<p class="pc-line"><span class="label">Languages</span> ${esc(p.langs.join(", "))}</p>`:""}
    ${(p.notes||[]).length?`<p class="pc-note">${esc(p.notes[0])}</p>`:""}
    <span class="pc-foot">${v?`<span class="label"><i class="seal-dot" aria-hidden="true"></i>Sealed fortune inside</span>`:""}</span>
  </article></div>`;
}
/* the same fortunes again on the Quests tab; opening one opens both */
function fortuneCard(p,i){
  const v=visionFor(p.n); if(!v) return "";
  return `<div class="card player fortune in" id="fortune-${esc(p.id)}" style="--tilt:${tilt(p.i+1)}deg"><div class="shade"></div><article class="parch">
    <span class="label" style="color:var(--ink-muted)">Personal fortune</span>
    <button type="button" class="open-sheet" data-pc="${esc(p.id)}" aria-label="Open ${esc(p.n)}'s file"><span class="who name" style="display:inline-block">${esc(p.n)}</span></button>
    <span class="cls">${esc(p.sp)} · ${esc(p.cl.replace(/ \d+$/,""))}</span>
    ${sealBox("f-"+slug(p.n),p.n,fortuneText(v))}
  </article></div>`;
}
function tarotCard(c,i){
  const done=c.st==="done";
  return flipCard({key:"t"+i,i,cls:"tarot",frontParch:false,still:true,
    front:`<button type="button" class="sealed-btn" data-crack aria-label="Break the seal on Tarokka card ${ROMAN[i]}"><span class="roman">${ROMAN[i]}</span>${wax("eye",90)}<span class="label">Break the seal</span></button>`,
    back:`<span class="label">Card ${ROMAN[i]}</span><span class="t">${esc(c.n)}</span><p>${esc(c.p)}</p>${done?`<span class="stamp red"${isOpen("t"+i)?"":" data-later hidden"}>FULFILLED</span>`:""}`});
}
function renderHome(){
  const strahd=npcById.strahd;
  const seen=strahd?sessionsWith("strahd").pop():null;
  const ongoing=D.quests.filter(q=>q.st!=="done").length;
  const fulfilled=D.tarokka.filter(t=>t.st==="done").length;
  $("#v-home").innerHTML=`
  <div class="mist" style="top:200px" aria-hidden="true"></div>
  <section class="cover"><div class="wrap">
    <div class="metaline"><span class="snap" ${d(.0)}>Updated after Session ${esc(LAST)}</span><span class="snap" ${d(.1)}>Curse of Strahd · Party level ${esc(D.level)}</span></div>
    <h1 class="mast" aria-label="Barovia"><span class="bar rule-draw" aria-hidden="true" ${d(-.1)}></span>${letters("BAROVIA",.1)}</h1>
    <div class="rule-draw" style="height:1px;background:var(--s);opacity:.35;margin-top:18px;animation-delay:calc(var(--base,0s) + .5s)"></div>
    <div class="cover-row">
      <div class="cover-copy">
        <span class="tag snap" ${d(.6)}><span>Where we stand</span></span>
        <h2 class="headline snap" ${d(.7)}>We hunt him. <span class="underslash"><i>He watches.</i></span></h2>
        <p class="flavor snap" ${d(.8)}>${esc(D.flavor)}</p>
        <div class="snap" ${d(.9)}><a class="btn" href="#home" data-jump="latest">Read the latest session ${ICON.arrow}</a></div>
      </div>
      ${strahd?`<div class="villain">
        <div class="redpanel rule-draw" aria-hidden="true" ${d(.3)}></div>
        <div class="snap" style="position:relative;animation-delay:calc(var(--base,0s) + .9s)">
          <a href="#npcs" class="card sway" data-npc="strahd" aria-label="Open ${esc(strahd.name)}'s card"><div class="shade"></div><article class="parch">
            <span class="label" style="display:block;margin-bottom:14px;color:var(--ink-muted)">NPC</span>
            <div style="display:flex;gap:18px">
              <div style="position:relative;flex:0 0 120px;height:150px">${sil(strahd)}<div class="glow" aria-hidden="true" style="position:absolute;left:50%;top:30%;width:120px;height:120px;margin:-60px 0 0 -60px;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--a) 55%,transparent),transparent 66%)"></div></div>
              <div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:6px">
                <span class="label dot">Main villain</span>
                <span class="name" style="font-size:30px;line-height:1">${esc(strahd.name)}</span>
                <span style="font-family:var(--serif);font-style:italic;font-size:16px;color:var(--ink-muted)">${esc(strahd.epi)}</span>
              </div>
            </div>
            <dl class="dl"><dt>Status</dt><dd>${statusWord(strahd)}</dd><dt>Location</dt><dd>${esc(where(strahd))}</dd>${seen?`<dt>Last seen</dt><dd>Session ${esc(seen.n)} · ${esc(seen.t)}</dd>`:""}<dt>Weakness</dt><dd><span style="display:inline-block;width:120px;height:14px;background:var(--p);vertical-align:middle"></span> <span style="font-size:11px;color:var(--ink-muted)">unknown</span></dd></dl>
            <span class="stamp red stamp-now" aria-hidden="true" style="right:18px;bottom:18px;font-size:16px;animation-delay:calc(var(--base,0s) + 1.3s)">HOSTILE</span>
          </article></a>
        </div>
      </div>`:""}
    </div>
  </div></section>

  <section class="tally" aria-label="The campaign at a glance"><div class="wrap">
    <div class="t snap" ${d(1.0)}><span class="n">${esc(LAST)}</span><span class="l">SESSIONS\nPLAYED</span></div>
    <div class="t snap" ${d(1.08)}><span class="n">${esc(D.party.length)}</span><span class="l">PLAYERS\nAT LEVEL ${esc(D.level)}</span></div>
    <div class="t snap" ${d(1.16)}><span class="n">${esc(ongoing)}</span><span class="l">ONGOING\nQUESTS</span></div>
    <div class="t snap" ${d(1.24)}><span class="n">${fulfilled}/${D.tarokka.length}</span><span class="l">TAROKKA CARDS\nFULFILLED</span></div>
  </div></section>
  ${ribbon("We hunt him · He watches","Barovia · Session "+LAST)}

  <section class="section players-sec" id="players"><div class="bgword" aria-hidden="true">PARTY</div><div class="mist" style="top:0" aria-hidden="true"></div><div class="wrap" style="position:relative">
    ${head("01 — The party",`The <i>players</i>`,`<p>Tap a player to open their file. Each personal fortune is sealed inside it.</p>`)}
    <div class="grid g-240">${PCS.map(playerCard).join("")}</div>
  </div></section>

  <section class="section light" id="latest"><div class="bgword" aria-hidden="true">${toRoman(LAST)}</div><div class="wrap">
    ${latestBlock()}
    <div class="subhead in"><h3>Earlier sessions, <i>under seal</i></h3><a class="link" href="#sessions">All sessions →</a></div>
    <div class="grid g-240" style="margin-top:40px">${earlier.slice(0,4).map(sessionCard).join("")}</div>
  </div></section>`;
}

/* =====================================================================
   SESSIONS
   ===================================================================== */
function renderSessions(){
  $("#v-sessions").innerHTML=`
  <section class="section light"><div class="bgword" aria-hidden="true">${toRoman(LAST)}</div><div class="wrap">
    ${head("Sessions",`The <i>chronicle</i>`,`<p>The latest session is open. Break a seal to read an older one.</p>`)}
    ${latestBlock().replace('id="latestText"','id="latestText2"')}
    <div class="subhead in"><h3>Every session, <i>under seal</i></h3><span class="label" style="color:var(--ink-muted)">Newest first</span></div>
    <div class="grid g-240 thread-host" style="margin-top:40px">${earlier.map((s,i)=>sessionCard(s,i,true)).join("")}</div>
  </div></section>
  <section class="section" style="padding:0"><div class="mist red" style="top:-200px" aria-hidden="true"></div>${ribbon("The chronicle · "+D.sessions.length+" sessions","Every seal holds a session")}</section>`;
}

/* =====================================================================
   NPCS
   ===================================================================== */
const NPC_FILTERS=[["all","All"],["ally","Allies"],["unsure","Uncertain"],["foe","Foes"],["fallen","Fallen"]];
let npcFilter="all";
function npcCard(n,i){
  const st=standing(n);
  return `<a href="#npcs" class="card in" data-npc="${esc(n.id)}" style="--tilt:${tilt(i)}deg" aria-label="Open ${esc(n.name)}">${isNew(n)?`<span class="new">NEW</span>`:""}<div class="shade"></div><article class="parch" style="display:flex;flex-direction:column;padding-bottom:62px">
    <span class="label" style="display:block;margin-bottom:14px;color:var(--ink-muted)">NPC</span>
    <div style="display:flex;gap:14px;align-items:flex-start">
      <div style="position:relative;flex:0 0 72px;height:90px">${sil(n)}</div>
      <div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:4px"><span class="name">${esc(n.name)}</span><span style="font-family:var(--serif);font-style:italic;font-size:15px;color:var(--ink-muted)">${esc(n.epi||"")}</span></div>
    </div>
    <dl class="dl"><dt>Status</dt><dd>${statusWord(n)}</dd><dt>First met</dt><dd>${esc(metLabel(n.met))}</dd><dt>Last seen</dt><dd>${esc(where(n))}</dd></dl>
    <span class="stamp ${st.tone} stamp-view" aria-hidden="true" style="right:14px;bottom:16px">${st.stamp}</span>
  </article></a>`;
}
function renderNpcs(){
  const list=D.npcs.filter(n=>npcFilter==="all"||(npcFilter==="fallen"?n.fate==="dead":(n.side===npcFilter&&n.fate!=="dead")));
  $("#v-npcs").innerHTML=`
  <div class="mist" style="top:160px" aria-hidden="true"></div>
  <section class="section"><div class="bgword" aria-hidden="true">WHO</div><div class="wrap" style="position:relative">
    ${head("NPCs",`Friends, foes, <i>and the fallen</i>`,`<div class="filters" role="group" aria-label="Show">${NPC_FILTERS.map(([k,l])=>`<button type="button" data-nf="${k}" aria-pressed="${k===npcFilter}">${l}</button>`).join("")}</div>`)}
    <p class="label muted" style="margin:-28px 0 32px">${list.length} ${list.length===1?"NPC":"NPCs"} · each card is stamped with where they stand with the party</p>
    <div class="grid g-240">${list.map(npcCard).join("")||`<p class="empty">No one here yet.</p>`}</div>
  </div></section>
  ${ribbon("Friends · Foes · The fallen","Who can you trust in Barovia")}`;
  SX.scan();
}

/* =====================================================================
   LOCATIONS (list; the map is built further down)
   ===================================================================== */
function placeCard(p,i){
  const visited=p.s&&p.s!=="—";
  return `<a href="#locations" class="card place in" data-place="${esc(p.n)}" style="--tilt:${tilt(i+1)}deg" aria-label="Open ${esc(p.n)}">${isNew(p)?`<span class="new">NEW</span>`:""}<div class="shade"></div><article class="parch">
    <span class="label" style="color:var(--ink-muted)">${esc(p.r)}</span><span class="t name">${esc(p.n)}</span><p>${esc(p.p)}</p>
    <span class="stamp ${visited?"ink":"red"} stamp-view" aria-hidden="true">${visited?"VISITED · SESSION "+esc(p.s):"NOT VISITED"}</span>
  </article></a>`;
}
function renderLocList(){
  const regions=[...new Set(D.places.map(p=>p.r))];
  $("#locList").innerHTML=regions.map(r=>`<h3 class="region">${esc(r)}</h3><div class="grid g-260">${D.places.filter(p=>p.r===r).map(placeCard).join("")}</div>`).join("");
  SX.scan();
}

/* =====================================================================
   QUESTS
   ===================================================================== */
const Q_FILTERS=[["ongoing","Ongoing"],["done","Completed"],["all","All"]];
let questFilter="ongoing";
function renderQuests(){
  $("#v-quests").innerHTML=`
  <section class="section" id="tarokka"><div class="bgword" aria-hidden="true">FATE</div><div class="mist red" style="top:0" aria-hidden="true"></div><div class="wrap" style="position:relative">
    ${head("Quests · The reading",`The Tarokka <i>reading</i>`,`<p>Madam Eva's reading from Session 5. Break a seal to turn a card, and tap Reseal to turn it back.</p>`)}
    <p class="jumps"><a class="link" href="#quests" data-fortune="">Personal fortunes ↓</a><a class="link" href="#quests" data-fortune="list">Quests ↓</a><a class="link" href="#quests" data-fortune="loose">Loose ends ↓</a></p>
    <div class="grid g-210 fan">${D.tarokka.map(tarotCard).join("")}</div>
    <div class="subhead in" id="fortunes"><h3>Personal <i>fortunes</i></h3></div>
    <p class="fortune-note">Madam Eva gave each player a personal fortune in Session 5. Each one stays under wax until its player breaks the seal.</p>
    <div class="grid g-240">${PCS.map(fortuneCard).join("")}</div>
  </div></section>
  ${ribbon("The cards have spoken","Fate · Fortune · Unfinished business")}
  <div id="questList"></div>
  <section class="section light"><div class="wrap">
    <div class="subhead in" id="loose" style="margin-top:0"><h3>Loose <i>ends</i></h3></div>
    <p class="fortune-note" style="color:var(--ink-muted)">Things the party left unresolved. Some may turn into quests.</p>
    <div class="board"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline class="string" pathLength="1" points="12,18 38,30 64,16 88,32 74,74 46,66 20,78 38,30" fill="none" stroke="var(--a)" stroke-width="1.4" vector-effect="non-scaling-stroke"/></svg>
      <ol class="grid g-240">${D.threads.map((t,i)=>`<li class="note sway in" style="--tilt:${[-2,1.5,-1,2,-1.5,1,-2.5][i%7]}deg"><span class="label">Loose end ${i+1}</span><p>${esc(t)}</p></li>`).join("")}</ol>
    </div>
  </div></section>`;
  renderQuestList();
}
function renderQuestList(){
  const on=D.quests.filter(q=>q.st!=="done"), done=D.quests.filter(q=>q.st==="done");
  const showOn=questFilter!=="done", showDone=questFilter!=="ongoing";
  $("#questList").innerHTML=`
  <section class="section light" id="list"><div class="wrap">
    ${head("Quests",`${questFilter==="done"?"Completed":"Ongoing"} <i>quests</i>`,`<div class="filters" role="group" aria-label="Show">${Q_FILTERS.map(([k,l])=>`<button type="button" data-qf="${k}" aria-pressed="${k===questFilter}">${l}</button>`).join("")}</div>`)}
    <p class="label" style="margin:-28px 0 40px;color:var(--ink-muted)">${on.length} ongoing · ${done.length} completed</p>
    ${showOn?`<ol class="grid g-240" style="margin:0;padding:0;gap:40px 28px">${on.map((q,i)=>`<li class="note sway in" style="--tilt:${[-2,1.5,-1,2,-1.5,1,-2.5][i%7]}deg"><span class="label">Ongoing · ${esc(q.t)}</span><p style="font-size:22px;line-height:1.15">${esc(q.n)}</p><p style="font-size:16px;color:color-mix(in srgb,var(--s) 82%,transparent)">${esc(q.p)}</p></li>`).join("")||`<p class="empty">Nothing ongoing.</p>`}</ol>`:""}
    ${showOn&&showDone?`<div class="subhead in"><h3>Completed <i>quests</i></h3></div>`:""}
    ${showDone?`<div class="grid g-210" style="margin-top:${showOn?40:0}px">${done.map((q,i)=>`<div class="card quest sway in" style="--tilt:${tilt(i+3)}deg"><div class="shade"></div><article class="parch"><span class="label" style="color:var(--ink-muted)">${esc(q.t)} quest</span><span class="t">${esc(q.n)}</span><p>${esc(q.p)}</p><span class="stamp red stamp-view" aria-hidden="true">COMPLETED</span></article></div>`).join("")}</div>`:""}
  </div></section>`;
  SX.scan();
}

/* =====================================================================
   POP-UP SHEETS
   ===================================================================== */
const modal=$("#modal");
let lastFocus=null, stampTimer=null;
function nameLines(name){ const w=String(name).split(" "); const last=w.length>1?w.pop():""; return `<span class="ln">${letters(w.join(" "),.85,.05)}</span>${last?`<span class="ln it">${letters(last,1.05,.05)}</span>`:""}`; }
function openSheet({tab,photo,kicker,name,epi,body,stamp}){
  lastFocus=document.activeElement;
  modal.innerHTML=`<div class="pass" aria-hidden="true"></div><div class="mist" aria-hidden="true"></div>
  <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetName"><div class="shade"></div><div class="parch" aria-hidden="true"></div>
    <span class="label tab" style="color:var(--ink-muted)">${tab}</span>
    <div class="photo"><span class="tape" aria-hidden="true"></span><div class="frame">${photo}</div></div>
    <div class="body">
      <button type="button" class="close" data-close aria-label="Close">${ICON.close}</button>
      <span class="label dot kicker snap" style="animation-delay:.8s">${kicker}</span>
      <h2 id="sheetName" aria-label="${esc(name)}">${nameLines(name)}</h2>
      ${epi?`<p class="epi snap" style="animation-delay:1.35s">${esc(epi)}</p>`:""}
      ${body}
      ${stamp?`<span class="stamp ${stamp.tone} stamp-now" aria-hidden="true" style="animation-delay:1.5s">${stamp.text}</span>`:""}
    </div>
  </div>`;
  modal.classList.add("on"); modal.setAttribute("aria-hidden","false");
  document.documentElement.style.overflow="hidden";
  Sound.open(); clearTimeout(stampTimer); if(stamp&&!reduced) stampTimer=setTimeout(()=>Sound.stamp(),1550);
  const c=modal.querySelector("[data-close]"); if(c) c.focus({preventScroll:true});
}
function closeSheet(){
  if(!modal.classList.contains("on")) return;
  clearTimeout(stampTimer);
  modal.classList.remove("on"); modal.setAttribute("aria-hidden","true"); modal.innerHTML="";
  document.documentElement.style.overflow="";
  Sound.close();
  if(lastFocus&&document.contains(lastFocus)) lastFocus.focus({preventScroll:true});
}
const factList=(items,start=1.7)=>`<ol>${items.map((t,i)=>`<li class="snap" style="animation-delay:${(start+i*.08).toFixed(2)}s"><span class="n">${i+1}</span><span>${esc(t)}</span></li>`).join("")}</ol>`;
const sessionChips=list=>list.length?`<div class="chips-row snap" style="animation-delay:2.2s"><span class="label" style="color:var(--ink-muted);margin-right:6px">Appears in sessions</span>${list.map(s=>`<button type="button" class="chip" data-session="${esc(s.n)}">Session ${esc(s.n)}</button>`).join("")}</div>`:"";
const portraitFrame=n=>`${sil(n)}<div class="glowdot glow" aria-hidden="true"></div><span class="label cap">Portrait</span>`;
function openNpc(id){
  const n=npcById[id]; if(!n) return;
  const st=standing(n);
  openSheet({tab:`NPC · ${esc(n.name.toUpperCase())}`,photo:portraitFrame(n),
    kicker:`${esc(st.label.toUpperCase())} · ${n.met&&n.met!=="—"?"FIRST MET IN "+esc(metLabel(n.met).toUpperCase()):"NOT YET MET"}`,
    name:n.name,epi:n.epi,stamp:{text:st.stamp,tone:st.tone},
    body:`<dl class="dl snap" style="animation-delay:1.45s"><dt>Status</dt><dd>${statusWord(n)}</dd><dt>Last seen</dt><dd>${esc(where(n))}</dd></dl>
      ${n.facts&&n.facts.length?`<h3 class="snap" style="animation-delay:1.6s">WHAT THE PARTY KNOWS</h3>${factList(n.facts)}`:""}
      ${sessionChips(sessionsWith(n.id))}`});
}
function openPc(id){
  const p=pcById[id]; if(!p) return;
  const v=visionFor(p.n);
  const row=(k,x)=>x==null||x===""?"":`<dt>${k}</dt><dd>${esc(x)}</dd>`;
  openSheet({tab:`PLAYER CHARACTER · LEVEL ${esc(D.level)}`,photo:portraitFrame({...p,name:p.n}),
    kicker:`${esc(p.sp.toUpperCase())} · ${esc(p.cl.toUpperCase())}`,name:p.n,epi:"",stamp:{text:"THE PARTY",tone:"ink"},
    body:`<dl class="dl snap" style="animation-delay:1.45s">${row("Armor Class",p.ac+(p.acx?` (${p.acx})`:""))}${row("Hit Points",p.hp)}${row("Passive Perception",p.pp)}${row("Passive Insight",p.pi)}${row("Save DC",p.dc)}${row("Languages",(p.langs||[]).join(", "))}</dl>
      ${p.notes&&p.notes.length?`<h3 class="snap" style="animation-delay:1.6s">NOTES</h3>${factList(p.notes)}`:""}
      ${v?`<h3 class="snap" style="animation-delay:2.1s">PERSONAL FORTUNE</h3><div class="snap" style="animation-delay:2.2s">${sealBox("f-"+slug(p.n),p.n,fortuneText(v))}</div>`:""}`});
}
function pinFor(p){ return PINS.find(x=>x.key===p.n)||PINS.find(x=>(x.places||[]).includes(p.n)); }
function openPlace(name){
  const p=placeByName[name]; if(!p) return;
  const pin=pinFor(p), visited=p.s&&p.s!=="—";
  const photo=pin?`<div class="mapcrop" role="img" aria-label="Map around ${esc(p.n)}" style="background-image:url(img/barovia-map-1000.webp);background-size:1000px auto;background-position:calc(50% - ${(+pin.x*.5-500).toFixed(0)}px) calc(50% - ${(+pin.y*.5-341).toFixed(0)}px)"></div><span class="label cap" style="color:var(--s);background:var(--p);padding:3px 8px">On the map</span>`
    :`${sil({name:p.n})}<span class="label cap">Not on the map yet</span>`;
  const inside=pin&&pin.key===p.n&&pin.places?pin.places.map(n=>placeByName[n]).filter(Boolean):[];
  openSheet({tab:`LOCATION · ${esc(p.r.toUpperCase())}`,photo,
    kicker:visited?`VISITED · ${esc(metLabel(p.s).toUpperCase())}`:"HEARD OF · NOT VISITED YET",
    name:p.n,epi:p.r,stamp:{text:visited?"VISITED":"NOT VISITED",tone:visited?"ink":"red"},
    body:`<h3 class="snap" style="animation-delay:1.5s">WHAT WE KNOW</h3><p class="text snap" style="animation-delay:1.6s">${esc(p.p)}</p>
      ${inside.length?`<h3 class="snap" style="animation-delay:1.8s">PLACES HERE</h3><div class="chips snap" style="margin-top:10px;animation-delay:1.9s">${inside.map(q=>`<button type="button" class="chip" data-place="${esc(q.n)}">${esc(q.n)}</button>`).join("")}</div>`:""}
      ${visited?`<div class="chips-row snap" style="animation-delay:2.1s"><span class="label" style="color:var(--ink-muted);margin-right:6px">First visited</span><button type="button" class="chip" data-session="${esc(p.s)}">Session ${esc(p.s)}</button></div>`:""}`});
}
modal.addEventListener("click",e=>{ if(e.target===modal||e.target.closest("[data-close]")) closeSheet(); });
addEventListener("keydown",e=>{
  if(!modal.classList.contains("on")) return;
  if(e.key==="Escape"){ closeSheet(); return; }
  if(e.key==="Tab"){ const f=[...modal.querySelectorAll("button,[href]")].filter(x=>!x.disabled&&x.offsetParent!==null); if(!f.length) return;
    if(e.shiftKey&&document.activeElement===f[0]){ e.preventDefault(); f[f.length-1].focus(); } else if(!e.shiftKey&&document.activeElement===f[f.length-1]){ e.preventDefault(); f[0].focus(); } }
});

/* =====================================================================
   CLICKS: seals, covers, chips, filters
   ===================================================================== */
const twins=el=>$$(`[data-seal="${CSS.escape(el.dataset.seal)}"]`).filter(x=>x!==el);
function faces(card,open){ const f=card.querySelector(".face.front"), b=card.querySelector(".face.back"); if(f) f.inert=open; if(b) b.inert=!open; }
function stampLater(card,show,animate){
  const later=card.querySelector("[data-later]"); if(!later) return;
  later.hidden=!show; later.classList.toggle("stamp-now",show&&animate); later.style.animationDelay=show&&animate?"1.45s":"";
}
function crackSeal(card){
  if(!card||card.classList.contains("is-open")) return;
  const w=card.querySelector(".wax"), hadFocus=card.contains(document.activeElement);
  card.classList.remove("rewax"); card.classList.add("is-open"); faces(card,true); remember(card.dataset.seal);
  if(hadFocus){ const r=card.querySelector("[data-reseal]"); if(r) r.focus({preventScroll:true}); }
  Sound.crack(); setTimeout(()=>Sound.flip(),reduced?0:620);
  if(card.querySelector("[data-later]")){ stampLater(card,true,true); if(!reduced) setTimeout(()=>Sound.stamp(),1500); }
  if(w) FX.sealBreak(w,card.querySelector(".inner"),card.querySelector(".shade"));
  twins(card).forEach(x=>{ x.classList.add("is-open","instant"); faces(x,true); stampLater(x,true,false); });
}
function resealCard(card){
  if(!card||!card.classList.contains("is-open")) return;
  forget(card.dataset.seal);
  card.classList.remove("is-open","instant"); card.classList.add("rewax"); faces(card,false); stampLater(card,false,false);
  const btn=card.querySelector("[data-crack]"); if(btn) btn.focus({preventScroll:true});
  twins(card).forEach(x=>{ x.classList.remove("is-open","instant","rewax"); faces(x,false); stampLater(x,false,false); });
  const land=reduced?0:720;
  setTimeout(()=>{ Sound.reseal(); const w=card.querySelector(".wax"); if(w) FX.rewax(w); },land);
  setTimeout(()=>card.classList.remove("rewax"),1600);
}
function paintBox(box,open,instant){
  box.classList.toggle("is-open",open); box.classList.toggle("instant",open&&instant);
  const row=box.querySelector("[data-break]"), body=box.querySelector(".seal-body"), first=row.querySelector(".seal-sub").textContent.replace(/^For | only$/g,"");
  body.hidden=!open; row.setAttribute("aria-expanded",String(open));
  row.querySelector(".seal-title").textContent=open?"Seal it again":"Break the seal";
  row.setAttribute("aria-label",open?`Seal ${first}'s fortune again`:`Break the seal on ${first}'s fortune`);
}
function breakBox(box){
  if(box.classList.contains("is-open")) return resealBox(box);
  const w=box.querySelector(".wax");
  box.classList.remove("rewax"); paintBox(box,true,false); remember(box.dataset.seal);
  Sound.crack(); if(w) FX.sealBreak(w,null,box.querySelector(".seal-body"));
  twins(box).forEach(x=>{ x.classList.remove("rewax"); paintBox(x,true,true); });
}
function resealBox(box){
  forget(box.dataset.seal); paintBox(box,false,false); box.classList.add("rewax");
  twins(box).forEach(x=>{ x.classList.remove("rewax"); paintBox(x,false,false); });
  setTimeout(()=>{ Sound.reseal(); const w=box.querySelector(".wax"); if(w) FX.rewax(w); },reduced?0:720);
  setTimeout(()=>box.classList.remove("rewax"),1600);
}
/* jump to the Tarokka reading or a player's fortune on the Quests tab */
function jumpTo(id){
  closeSheet();
  go("quests",()=>{ const el=document.getElementById(id); if(!el) return; el.scrollIntoView({behavior:reduced?"auto":"smooth",block:id.startsWith("fortune-")?"center":"start"}); });
}
function gotoSession(n){
  closeSheet();
  if(String(n)===LAST){ go("sessions"); return; }
  go("sessions",()=>{ const c=$(`#v-sessions [data-seal="s${CSS.escape(String(n))}"]`); if(!c) return;
    c.scrollIntoView({behavior:reduced?"auto":"smooth",block:"center"}); setTimeout(()=>crackSeal(c),reduced?0:550); });
}
document.addEventListener("click",e=>{
  const t=e.target;
  const crack=t.closest("[data-crack]"); if(crack){ crackSeal(crack.closest("[data-seal]")); return; }
  const brk=t.closest("[data-break]"); if(brk){ breakBox(brk.closest(".sealbox")); return; }
  const rs=t.closest("[data-reseal]"); if(rs){ const box=rs.closest("[data-seal]"); resealCard(box); return; }
  const jp=t.closest("[data-jump]"); if(jp){ e.preventDefault(); const el=document.getElementById(jp.dataset.jump); if(el) el.scrollIntoView({behavior:reduced?"auto":"smooth"}); return; }
  const pcd=t.closest("[data-pcard]"); if(pcd&&!t.closest(".sealbox,button,a")){ openPc(pcd.dataset.pcard); return; }
  const fl=t.closest("[data-fortune]"); if(fl){ e.preventDefault(); const f=fl.dataset.fortune; jumpTo(["tarokka","loose","list"].includes(f)?f:f?"fortune-"+f:"fortunes"); return; }
  const dec=t.closest("[data-declass]");
  if(dec){ const p=dec.closest(".latest").querySelector(".summary"); const on=p.classList.toggle("declassified"); dec.setAttribute("aria-pressed",String(on)); dec.querySelector("span").textContent=on?"Hide the details":"Reveal the details"; Sound.slash(); return; }
  const npc=t.closest("[data-npc]"); if(npc){ e.preventDefault(); if(modal.classList.contains("on")) closeSheet(); openNpc(npc.dataset.npc); return; }
  const pc=t.closest("[data-pc]"); if(pc){ openPc(pc.dataset.pc); return; }
  const pl=t.closest("[data-place]:not(.pin)"); if(pl){ e.preventDefault(); if(modal.classList.contains("on")) closeSheet(); openPlace(pl.dataset.place); return; }
  const ss=t.closest("[data-session]"); if(ss){ gotoSession(ss.dataset.session); return; }
  const nf=t.closest("[data-nf]"); if(nf){ npcFilter=nf.dataset.nf; renderNpcs(); Sound.tick(); $("#v-npcs [data-nf='"+npcFilter+"']").focus(); return; }
  const qf=t.closest("[data-qf]"); if(qf){ questFilter=qf.dataset.qf; renderQuestList(); Sound.tick(); $("#v-quests [data-qf='"+questFilter+"']").focus(); return; }
});

/* =====================================================================
   NAVIGATION
   ===================================================================== */
const VIEWS=["home","sessions","npcs","locations","quests"];
const OLD={chronicle:"sessions",souls:"npcs",places:"locations",fortunes:"quests"};
let current=null;
function go(v,after){ if(location.hash==="#"+v){ show(v,true,after); } else { pendingAfter=after||null; location.hash=v; } }
let pendingAfter=null;
function show(v,fx=true,after){
  v=OLD[v]||v; if(!VIEWS.includes(v)) v="home";
  const changed=v!==current;
  if(changed){
    current=v;
    VIEWS.forEach(k=>$("#v-"+k).classList.toggle("on",k===v));
    $$("#nav a").forEach(a=>a.toggleAttribute("aria-current",a.getAttribute("href")==="#"+v)); $$("#nav a[aria-current]").forEach(a=>a.setAttribute("aria-current","page"));
    if(fx&&!reduced){ const c=$("#cut"); c.classList.remove("go"); void c.offsetWidth; c.classList.add("go"); }
    if(fx) Sound.page();
    scrollTo({top:0,behavior:"auto"});
    if(v==="locations"&&mapMode==="map") enterMap();
  }
  requestAnimationFrame(()=>SX.scan());
  if(after) requestAnimationFrame(()=>requestAnimationFrame(after));
}
addEventListener("hashchange",()=>{ const a=pendingAfter; pendingAfter=null; show(location.hash.slice(1)||"home",true,a); });
const toTop=$("#toTop");
addEventListener("scroll",()=>{ toTop.classList.toggle("on",scrollY>900); },{passive:true});
toTop.addEventListener("click",()=>scrollTo({top:0,behavior:reduced?"auto":"smooth"}));

/* =====================================================================
   THE MAP OF BAROVIA (coordinates on a 2000 x 1364 map, see data.js)
   ===================================================================== */
let mapMode="map", mapReady=false, mapRAF=0, lastInv="", mapFull=false;
const MAP_SMALL="img/barovia-map-1000.webp", MAP_FULL="img/barovia-map.webp";
const mapState={s:1,x:0,y:0,min:.2,max:2.2};
function buildMap(){
  $("#stage").insertAdjacentHTML("beforeend",`
    <svg class="trail" viewBox="0 0 ${MAP_W} ${MAP_H}" aria-hidden="true">
      <defs><mask id="trailMask" maskUnits="userSpaceOnUse" x="0" y="0" width="${MAP_W}" height="${MAP_H}">
        <path d="${esc(TRAIL_MAIN)}" pathLength="1"/><path d="${esc(TRAIL_SIDE)}" pathLength="1"/><path d="${esc(TRAIL_LAKE)}" pathLength="1"/>
      </mask></defs>
      <g mask="url(#trailMask)">${[TRAIL_MAIN,TRAIL_SIDE,TRAIL_LAKE].map(p=>`<path class="shadow" d="${esc(p)}"/><path class="ink" d="${esc(p)}"/>`).join("")}</g>
    </svg>
    <div class="here" style="left:842px;top:462px"><i></i><i></i><b>You are here</b></div>
    ${PINS.map((p,i)=>`<button type="button" class="pin ${p.town?"town":""} ${p.side?"side-"+esc(p.side):""}" style="left:${+p.x||0}px;top:${+p.y||0}px;--pd:${i*80}ms" data-place="${esc(p.key)}" aria-label="${esc(p.label||p.key)}"><span class="pi"><span class="seal"></span><span class="lb">${esc(p.label||p.key)}</span></span></button>`).join("")}`);
}
function applyMap(){
  const st=mapState, box=$("#mapbox"), W=box.clientWidth, H=box.clientHeight, sw=MAP_W*st.s, sh=MAP_H*st.s;
  st.x=sw<=W?(W-sw)/2:Math.min(0,Math.max(W-sw,st.x));
  st.y=sh<=H?(H-sh)/2:Math.min(0,Math.max(H-sh,st.y));
  if(mapRAF) return;
  mapRAF=requestAnimationFrame(()=>{ mapRAF=0; const stg=$("#stage"); stg.style.transform=`translate(${mapState.x}px,${mapState.y}px) scale(${mapState.s})`;
    const inv=(1/mapState.s).toFixed(3); if(inv!==lastInv){ lastInv=inv; stg.style.setProperty("--inv",inv); }
    if(!mapFull&&mapState.s*(devicePixelRatio||1)>.55) loadMapFull(); });
}
function loadMapFull(){ if(mapFull) return; mapFull=true; const im=new Image(); im.src=MAP_FULL; const swap=()=>{ $("#mapImg").src=MAP_FULL; }; im.decode?im.decode().then(swap,swap):(im.onload=swap); }
function zoomAt(f,cx,cy){ const st=mapState, ns=Math.min(st.max,Math.max(st.min,st.s*f)); st.x=cx-(cx-st.x)*(ns/st.s); st.y=cy-(cy-st.y)*(ns/st.s); st.s=ns; applyMap(); }
function resetMap(){
  const box=$("#mapbox"), W=box.clientWidth, H=box.clientHeight;
  mapState.min=Math.min(W/MAP_W,H/MAP_H);
  const x0=200,x1=1960,y0=300,y1=960, s=Math.max(mapState.min,Math.min(W/(x1-x0),H/(y1-y0)));
  const f=W<700?{x:1000,y:620,s:Math.max(s,.42)}:{x:(x0+x1)/2,y:(y0+y1)/2,s};
  mapState.s=f.s; mapState.x=W/2-f.x*f.s; mapState.y=H/2-f.y*f.s; applyMap();
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
    if(pts.size===2&&pinch){ const [a,b]=[...pts.values()], dd=Math.hypot(a.x-b.x,a.y-b.y), cx=(a.x+b.x)/2, cy=(a.y+b.y)/2;
      const ns=Math.min(mapState.max,Math.max(mapState.min,pinch.s*dd/pinch.d));
      mapState.x=cx-(pinch.cx-pinch.ox)*(ns/pinch.s); mapState.y=cy-(pinch.cy-pinch.oy)*(ns/pinch.s); mapState.s=ns; moved=99; applyMap(); return; }
    if(pts.size===1&&start){ const p=local(e), dx=p.x-start.x, dy=p.y-start.y; moved=Math.max(moved,Math.hypot(dx,dy)); mapState.x=start.ox+dx; mapState.y=start.oy+dy; applyMap(); }
  });
  const up=e=>{
    if(!pts.has(e.pointerId)) return; pts.delete(e.pointerId);
    if(pts.size<2) pinch=null;
    if(pts.size===1){ const [p]=[...pts.values()]; start={...p,ox:mapState.x,oy:mapState.y,target:null}; }
    if(pts.size===0){ box.classList.remove("drag"); if(start&&start.target&&moved<8){ Sound.tick(); openPlace(start.target.dataset.place); } start=null; }
  };
  box.addEventListener("pointerup",up); box.addEventListener("pointercancel",up);
  box.addEventListener("wheel",e=>{ e.preventDefault(); const p=local(e); zoomAt(Math.exp(-e.deltaY*.0015),p.x,p.y); },{passive:false});
  box.addEventListener("keydown",e=>{ const pin=e.target.closest(".pin"); if(pin&&(e.key==="Enter"||e.key===" ")){ e.preventDefault(); openPlace(pin.dataset.place); } });
  $("#zIn").addEventListener("click",()=>{ zoomAt(1.35,box.clientWidth/2,box.clientHeight/2); Sound.tick(); });
  $("#zOut").addEventListener("click",()=>{ zoomAt(1/1.35,box.clientWidth/2,box.clientHeight/2); Sound.tick(); });
  $("#zReset").addEventListener("click",()=>{ resetMap(); Sound.slash(); });
  addEventListener("resize",()=>{ if(current==="locations"&&mapMode==="map") resetMap(); });
}
function enterMap(){
  if(!mapReady){ const img=$("#mapImg"); if(!img.getAttribute("src")) img.src=MAP_SMALL; buildMap(); initMapInput(); mapReady=true; }
  requestAnimationFrame(()=>{ resetMap(); const w=$("#mapWrap");
    if(!w.classList.contains("drawn")){ $$(".pin").forEach(p=>p.classList.add("drop")); setTimeout(()=>w.classList.add("drawn"),reduced?0:400); } });
}
$("#mv").addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return;
  mapMode=b.dataset.mv; $$("#mv button").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));
  $("#mapWrap").hidden=mapMode!=="map"; $("#locList").hidden=mapMode!=="list"; Sound.tick(); SX.scan();
  if(mapMode==="map") enterMap(); });

/* =====================================================================
   SEARCH
   ===================================================================== */
const INDEX=[
  ...D.npcs.map(n=>({k:"NPC",t:n.name,d:n.epi||n.where,txt:[n.name,n.epi,n.where,...(n.facts||[])].join(" "),go:()=>openNpc(n.id)})),
  ...PCS.map(p=>({k:"Player",t:p.n,d:p.cl,txt:[p.n,p.sp,p.cl,...(p.notes||[])].join(" "),go:()=>openPc(p.id)})),
  ...D.places.map(p=>({k:"Location",t:p.n,d:p.r,txt:[p.n,p.r,p.p].join(" "),go:()=>openPlace(p.n)})),
  ...D.quests.map(q=>({k:"Quest",t:q.n,d:q.p,txt:[q.n,q.p,q.t].join(" "),go:()=>{ questFilter=q.st==="done"?"done":"ongoing"; renderQuestList(); jumpTo("list"); }})),
  ...D.tarokka.map(c=>({k:"Tarokka",t:c.n,d:"Madam Eva's reading",txt:[c.n,c.p].join(" "),go:()=>jumpTo("tarokka")})),
  ...D.sessions.map(s=>({k:"Session "+s.n,t:s.t,d:plain(s.s).slice(0,80)+"…",txt:[s.t,plain(s.s)].join(" "),go:()=>gotoSession(s.n)}))
];
const q=$("#q"), res=$("#results"), hdr=$("#hdr"), sBtn=$("#searchBtn");
sBtn.innerHTML=ICON.search;
sBtn.addEventListener("click",()=>{ const on=hdr.classList.toggle("searching"); sBtn.innerHTML=on?ICON.close:ICON.search; sBtn.setAttribute("aria-expanded",String(on)); Sound.tick();
  if(on) setTimeout(()=>q.focus(),50); else { res.classList.remove("on"); q.value=""; } });
q.addEventListener("input",()=>{
  const v=q.value.trim().toLowerCase(); if(v.length<2){ res.classList.remove("on"); return; }
  const hits=INDEX.map(it=>{ const t=it.t.toLowerCase(), x=it.txt.toLowerCase(); return {it,s:t.startsWith(v)?3:t.includes(v)?2:x.includes(v)?1:0}; }).filter(h=>h.s).sort((a,b)=>b.s-a.s).slice(0,12);
  res.innerHTML=hits.length?hits.map(h=>`<button type="button" data-i="${INDEX.indexOf(h.it)}"><b>${esc(h.it.t)}</b><small>${esc(h.it.k)} · ${esc(h.it.d||"")}</small></button>`).join(""):`<div class="none">Nothing in the archive matches.</div>`;
  res.classList.add("on");
});
res.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; e.stopPropagation(); const it=INDEX[+b.dataset.i]; res.classList.remove("on"); q.value=""; if(hdr.classList.contains("searching")) sBtn.click(); it.go(); });
q.addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); const b=res.querySelector("button"); if(b) b.click(); } if(e.key==="Escape") sBtn.click(); });
document.addEventListener("click",e=>{ if(!e.target.closest(".search")&&e.target!==sBtn&&!sBtn.contains(e.target)) res.classList.remove("on"); });

/* =====================================================================
   SOUND TOGGLE
   ===================================================================== */
const soundBtn=$("#soundBtn");
function paintSound(){ const on=Sound.isOn(); soundBtn.innerHTML=on?ICON.soundOn:ICON.soundOff; soundBtn.setAttribute("aria-pressed",String(on)); soundBtn.setAttribute("aria-label",on?"Sound effects on":"Sound effects off"); }
soundBtn.addEventListener("click",()=>{ const want=!Sound.isOn(); Sound.setOn(want); store.set("bv-sound",want?"1":"0"); paintSound(); if(want) Sound.tick(); });
/* sound is on by default; it starts at the first tap (see js/sound.js) */
paintSound();

/* =====================================================================
   START
   ===================================================================== */
renderHome(); renderSessions(); renderNpcs(); renderLocList(); renderQuests(); countUp($("#v-home"));
$("#footNote").textContent="Kept for the players · Updated after Session "+LAST;
let introSeen=false; try{ introSeen=sessionStorage.getItem("bv-intro")==="1"; sessionStorage.setItem("bv-intro","1"); }catch(e){ introSeen=true; }
if(!introSeen&&!reduced){ $("#introN").textContent=LAST; $("#intro").classList.remove("gone"); $("#v-home").style.setProperty("--base","1.4s"); setTimeout(()=>{ $("#intro").classList.add("gone"); },1900); }
else $("#v-home").style.setProperty("--base","0s");
show(location.hash.slice(1)||"home",false);

/* once the page is idle, fetch the small map and fog so Locations opens without a stall */
function whenIdle(fn){ ("requestIdleCallback" in window)?requestIdleCallback(fn,{timeout:5000}):setTimeout(fn,2500); }
addEventListener("load",()=>whenIdle(()=>{ [MAP_SMALL,"img/fog.webp","img/fog2.webp"].forEach(src=>{ const im=new Image(); im.src=src; im.decode&&im.decode().catch(()=>{}); }); }));
/* offline cache + instant repeat visits */
if("serviceWorker" in navigator&&(location.protocol==="https:"||location.hostname==="localhost")) addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
