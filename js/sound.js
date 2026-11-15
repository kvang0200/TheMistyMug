/* =====================================================================
   AUDIO ENGINE — everything is synthesized, no files
   ===================================================================== */
const Sound = (() => {
  /* No background drone and no thunder: the only sounds are short effects tied to clicks,
     plus an occasional distant howl or bell. The audio engine is suspended whenever sound
     is muted or the page is hidden, so it uses no CPU or battery in the background. */
  let ctx=null, master=null, verb=null, on=false, started=false, randomTimer=null, noiseBuf=null, suspendT=null;
  function makeVerb(){
    const len = ctx.sampleRate*4, b = ctx.createBuffer(2,len,ctx.sampleRate);
    for(let c=0;c<2;c++){const d=b.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6);}
    const cv = ctx.createConvolver(); cv.buffer=b; return cv;
  }
  function noise(){ if(noiseBuf) return noiseBuf; const len=ctx.sampleRate*2; noiseBuf=ctx.createBuffer(1,len,ctx.sampleRate); const d=noiseBuf.getChannelData(0); for(let i=0;i<len;i++)d[i]=Math.random()*2-1; return noiseBuf; }
  function env(g,t,a,peak,d){ g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(peak,t+a); g.gain.exponentialRampToValueAtTime(0.0001,t+a+d); }
  function out(node,wet=.5){ const dry=ctx.createGain(); dry.gain.value=1-wet*.5; const w=ctx.createGain(); w.gain.value=wet; node.connect(dry).connect(master); node.connect(w).connect(verb); }

  function init(){
    if(started) return true;
    const AC = window.AudioContext||window.webkitAudioContext; if(!AC) return false;
    try{ ctx=new AC(); }catch(e){ return false; }
    master=ctx.createGain(); master.gain.value=0.0001; master.connect(ctx.destination);
    verb=makeVerb(); const vg=ctx.createGain(); vg.gain.value=.55; verb.connect(vg).connect(master);
    started=true; return true;
  }
  function setOn(v){
    if(v && !init()) return false;
    on=v; if(!ctx) return v;
    clearTimeout(suspendT);
    if(v && ctx.state==="suspended") ctx.resume();
    const t=ctx.currentTime;
    master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(Math.max(master.gain.value,.0001),t);
    master.gain.exponentialRampToValueAtTime(v?.75:.0001, t+(v?.4:.5));
    clearTimeout(randomTimer);
    if(v){ if(!document.hidden) scheduleRandom(); }
    else suspendT=setTimeout(()=>{ if(!on && ctx.state==="running") ctx.suspend(); },700);
    return v;
  }
  /* page hidden: stop the engine; page back: pick up where we left off */
  document.addEventListener("visibilitychange",()=>{
    if(!ctx||!on) return;
    if(document.hidden){ clearTimeout(randomTimer); ctx.suspend(); }
    else { ctx.resume(); scheduleRandom(); }
  });
  function mood(){ /* the per-section drone was removed; kept so older calls are harmless */ }
  function scheduleRandom(){
    clearTimeout(randomTimer);
    randomTimer=setTimeout(()=>{ if(!on||document.hidden) return; if(Math.random()<.55) howl(); else bell(.5);
      scheduleRandom(); }, 38000+Math.random()*50000);
  }
  // ----- effects -----
  function bell(vol=1){ if(!on) return; const t=ctx.currentTime, f=98;
    [[1,1],[2,.5],[2.4,.4],[3,.25],[4.2,.2],[5.4,.12]].forEach(([m,a])=>{ const o=ctx.createOscillator(); o.frequency.value=f*m; const g=ctx.createGain(); env(g,t,.01,.18*a*vol,6/m+1.5); o.connect(g); out(g,.8); o.start(t); o.stop(t+9); }); }
  function heartbeat(){ if(!on) return; const t=ctx.currentTime; [0,.28,1.1,1.38].forEach((d,i)=>{ const o=ctx.createOscillator(); o.frequency.setValueAtTime(70,t+d); o.frequency.exponentialRampToValueAtTime(38,t+d+.15); const g=ctx.createGain(); env(g,t+d,.01,i%2?.28:.4,.22); o.connect(g); out(g,.2); o.start(t+d); o.stop(t+d+.5); }); }
  function flip(){ if(!on) return; const t=ctx.currentTime; const s=ctx.createBufferSource(); s.buffer=noise(); const hp=ctx.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=1800; const g=ctx.createGain(); env(g,t,.005,.25,.07); s.connect(hp).connect(g); out(g,.2); s.start(t); s.stop(t+.2);
    [1318.5,1975.5].forEach((f,i)=>{ const o=ctx.createOscillator(); o.type="sine"; o.frequency.value=f; const cg=ctx.createGain(); env(cg,t+.08+i*.07,.01,.06,1.2); o.connect(cg); out(cg,.8); o.start(t); o.stop(t+2); }); }
  function whoosh(){ if(!on) return; const t=ctx.currentTime; const s=ctx.createBufferSource(); s.buffer=noise(); const bp=ctx.createBiquadFilter(); bp.type="bandpass"; bp.Q.value=1.2; bp.frequency.setValueAtTime(250,t); bp.frequency.exponentialRampToValueAtTime(2600,t+.45); const g=ctx.createGain(); env(g,t,.15,.22,.45); s.connect(bp).connect(g); out(g,.5); s.start(t); s.stop(t+.8);
    // wing flutter
    const s2=ctx.createBufferSource(); s2.buffer=noise(); const lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=900; const g2=ctx.createGain(); g2.gain.value=0; const am=ctx.createOscillator(); am.frequency.value=13; const amg=ctx.createGain(); amg.gain.value=.06; am.connect(amg).connect(g2.gain); s2.connect(lp).connect(g2); out(g2,.3); s2.start(t+.1); am.start(t+.1); s2.stop(t+.7); am.stop(t+.7); }
  function scratch(){ if(!on) return; const t=ctx.currentTime; const s=ctx.createBufferSource(); s.buffer=noise(); const hp=ctx.createBiquadFilter(); hp.type="bandpass"; hp.frequency.value=3200+Math.random()*1800; hp.Q.value=2; const g=ctx.createGain(); env(g,t,.004,.035,.03+Math.random()*.03); s.connect(hp).connect(g).connect(master); s.start(t,Math.random()); s.stop(t+.1); }
  function growl(){ if(!on) return; const t=ctx.currentTime; const o=ctx.createOscillator(); o.type="sawtooth"; o.frequency.setValueAtTime(62,t); o.frequency.linearRampToValueAtTime(48,t+1.1); const lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=340; const g=ctx.createGain(); env(g,t,.15,.22,1); const tr=ctx.createOscillator(); tr.frequency.value=24; const trg=ctx.createGain(); trg.gain.value=.12; tr.connect(trg).connect(g.gain); o.connect(lp).connect(g); out(g,.5); o.start(t); tr.start(t); o.stop(t+1.4); tr.stop(t+1.4);
    // whispered laugh
    const s=ctx.createBufferSource(); s.buffer=noise(); const bp=ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=2300; bp.Q.value=5; const g2=ctx.createGain(); g2.gain.value=0; [0,.18,.36,.54].forEach((d,i)=>{ g2.gain.setValueAtTime(0,t+.6+d); g2.gain.linearRampToValueAtTime(.09-i*.015,t+.64+d); g2.gain.linearRampToValueAtTime(0,t+.75+d); }); s.connect(bp).connect(g2); out(g2,.9); s.start(t+.5); s.stop(t+1.6); }
  function gasp(){ if(!on) return; const t=ctx.currentTime; const s=ctx.createBufferSource(); s.buffer=noise(); const bp=ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.setValueAtTime(700,t); bp.frequency.linearRampToValueAtTime(1400,t+.5); bp.Q.value=1.4; const g=ctx.createGain(); env(g,t,.2,.12,.5); s.connect(bp).connect(g); out(g,.7); s.start(t); s.stop(t+1); }
  function musicBox(){ if(!on) return; const notes=[659.25,0,587.33,659.25,0,783.99,698.46,0,659.25,587.33,0,523.25,587.33,0,659.25,493.88]; const t0=ctx.currentTime;
    notes.forEach((f,i)=>{ if(!f) return; const t=t0+i*.32; [1,2,3.01].forEach((m,j)=>{ const o=ctx.createOscillator(); o.type=j?"sine":"triangle"; o.frequency.value=f*m; const g=ctx.createGain(); env(g,t,.003,.05/(j+1),1.4); o.connect(g); out(g,.85); o.start(t); o.stop(t+1.6); }); }); }
  function howl(){ if(!on) return; const t=ctx.currentTime; const o=ctx.createOscillator(); o.type="sawtooth"; o.frequency.setValueAtTime(330,t); o.frequency.linearRampToValueAtTime(560,t+.9); o.frequency.linearRampToValueAtTime(520,t+2.2); o.frequency.linearRampToValueAtTime(380,t+3.2);
    const v=ctx.createOscillator(); v.frequency.value=5.5; const vg=ctx.createGain(); vg.gain.value=9; v.connect(vg).connect(o.frequency);
    const bp=ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=900; bp.Q.value=3; const g=ctx.createGain(); env(g,t,.6,.05,2.6); o.connect(bp).connect(g); out(g,.95); o.start(t); v.start(t); o.stop(t+3.6); v.stop(t+3.6); }
  function summon(stars=3){ if(!on) return; const t=ctx.currentTime;
    const s=ctx.createBufferSource(); s.buffer=noise(); s.loop=true; const bp=ctx.createBiquadFilter(); bp.type="bandpass"; bp.Q.value=2; bp.frequency.setValueAtTime(200,t); bp.frequency.exponentialRampToValueAtTime(5000,t+1.05); const g=ctx.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(.28,t+1); g.gain.exponentialRampToValueAtTime(.0001,t+1.12); s.connect(bp).connect(g); out(g,.5); s.start(t); s.stop(t+1.2);
    const o=ctx.createOscillator(); o.type="sawtooth"; o.frequency.setValueAtTime(80,t); o.frequency.exponentialRampToValueAtTime(stars>=5?880:660,t+1.05); const lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=1800; const og=ctx.createGain(); og.gain.setValueAtTime(.0001,t); og.gain.exponentialRampToValueAtTime(.08,t+.9); og.gain.exponentialRampToValueAtTime(.0001,t+1.1); o.connect(lp).connect(og); out(og,.6); o.start(t); o.stop(t+1.2); }
  function reveal(stars=3, foe=false){ if(!on) return; const t=ctx.currentTime;
    const b=ctx.createOscillator(); b.frequency.setValueAtTime(120,t); b.frequency.exponentialRampToValueAtTime(30,t+.6); const bg=ctx.createGain(); env(bg,t,.005,.7,.9); b.connect(bg); out(bg,.5); b.start(t); b.stop(t+1.2);
    const s=ctx.createBufferSource(); s.buffer=noise(); const lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=2400; const sg=ctx.createGain(); env(sg,t,.003,.35,.5); s.connect(lp).connect(sg); out(sg,.7); s.start(t); s.stop(t+.8);
    const scale=foe?[261.63,311.13,369.99,415.3,523.25,622.25,739.99]:[261.63,329.63,392,493.88,523.25,659.25,783.99,987.77];
    const n=3+stars; for(let i=0;i<n;i++){ const f=scale[i%scale.length]*(i>=scale.length?2:1)*2; const tt=t+.25+i*.075; [1,2].forEach((m,j)=>{ const o=ctx.createOscillator(); o.type=j?"sine":"triangle"; o.frequency.value=f*m; const g=ctx.createGain(); env(g,tt,.004,.07/(j+1),1.6); o.connect(g); out(g,.85); o.start(tt); o.stop(tt+2); }); }
    setTimeout(()=>bell(.6),250); if(foe) setTimeout(growl,900); }
  function crack(){ if(!on) return; const t=ctx.currentTime;
    const s=ctx.createBufferSource(); s.buffer=noise(); const hp=ctx.createBiquadFilter(); hp.type="bandpass"; hp.frequency.value=2600; hp.Q.value=.9; const g=ctx.createGain(); env(g,t,.002,.55,.09); s.connect(hp).connect(g); out(g,.35); s.start(t); s.stop(t+.2);
    const o=ctx.createOscillator(); o.frequency.setValueAtTime(180,t); o.frequency.exponentialRampToValueAtTime(60,t+.18); const og=ctx.createGain(); env(og,t,.003,.35,.25); o.connect(og); out(og,.3); o.start(t); o.stop(t+.4); }
  function rustle(d=.5){ if(!on) return; const t=ctx.currentTime; const s=ctx.createBufferSource(); s.buffer=noise(); s.loop=true; const bp=ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=3200; bp.Q.value=.7; const g=ctx.createGain(); g.gain.value=0;
    const steps=Math.max(4,Math.round(d*22)); for(let i=0;i<steps;i++){ const tt=t+i*(d/steps); g.gain.setValueAtTime(.02+Math.random()*.09,tt); g.gain.linearRampToValueAtTime(.005,tt+d/steps*.9); }
    g.gain.setValueAtTime(0,t+d+.02); s.connect(bp).connect(g); out(g,.25); s.start(t,Math.random()); s.stop(t+d+.05); }
  function chime(stars=3,foe=false){ if(!on) return; const t=ctx.currentTime;
    const scale=foe?[261.63,311.13,369.99,415.3,523.25,622.25,739.99]:[261.63,329.63,392,493.88,523.25,659.25,783.99,987.77];
    const n=2+stars; for(let i=0;i<n;i++){ const f=scale[i%scale.length]*2, tt=t+.35+i*.11; [1,2].forEach((m,j)=>{ const o=ctx.createOscillator(); o.type=j?"sine":"triangle"; o.frequency.value=f*m; const g=ctx.createGain(); env(g,tt,.004,.05/(j+1),1.8); o.connect(g); out(g,.85); o.start(tt); o.stop(tt+2.2); }); }
    if(stars>=5) setTimeout(()=>bell(.5),300); if(foe) setTimeout(growl,1100); }
  function crunch(){ if(!on) return; const t=ctx.currentTime;
    for(let i=0;i<16;i++){ const tt=t+Math.random()*.24, s=ctx.createBufferSource(); s.buffer=noise(); const bp=ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=700+Math.random()*3200; bp.Q.value=1.4; const g=ctx.createGain(); env(g,tt,.001,.1+Math.random()*.28,.012+Math.random()*.035); s.connect(bp).connect(g); out(g,.12); s.start(tt,Math.random()*1.5); s.stop(tt+.08); }
    const o=ctx.createOscillator(); o.frequency.setValueAtTime(110,t); o.frequency.exponentialRampToValueAtTime(48,t+.16); const og=ctx.createGain(); env(og,t,.002,.32,.2); o.connect(og); out(og,.2); o.start(t); o.stop(t+.35); }
  function cardFlip(){ if(!on) return; const t=ctx.currentTime;
    const s=ctx.createBufferSource(); s.buffer=noise(); const bp=ctx.createBiquadFilter(); bp.type="bandpass"; bp.Q.value=.9; bp.frequency.setValueAtTime(5200,t); bp.frequency.exponentialRampToValueAtTime(1600,t+.09); const g=ctx.createGain(); env(g,t,.006,.32,.08); s.connect(bp).connect(g); out(g,.15); s.start(t,Math.random()); s.stop(t+.16);
    const s2=ctx.createBufferSource(); s2.buffer=noise(); const hp=ctx.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=1400; const g2=ctx.createGain(); env(g2,t+.085,.001,.42,.022); s2.connect(hp).connect(g2); out(g2,.1); s2.start(t+.085,Math.random()); s2.stop(t+.14);
    const o=ctx.createOscillator(); o.type="triangle"; o.frequency.value=260; const og=ctx.createGain(); env(og,t+.085,.001,.06,.04); o.connect(og); out(og,.1); o.start(t+.08); o.stop(t+.16); }
  return {init,setOn,isOn:()=>on,mood,bell,heartbeat,flip,whoosh,scratch,growl,gasp,musicBox,howl,summon,reveal,crack,rustle,chime,crunch,cardFlip};
})();
