/* =====================================================================
   SOUND: short effects made in the browser (Web Audio), no sound files.
   Wax seals crack, paper turns, stamps thud, blades slash.
   Sound is off until the player turns it on, and the audio engine is
   suspended whenever sound is off or the page is hidden.
   ===================================================================== */
const Sound=(()=>{
  let ctx=null, master=null, verb=null, noise=null, on=false, started=false, suspendT=null;

  function init(){
    if(started) return true;
    const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return false;
    try{ ctx=new AC(); }catch(e){ return false; }
    master=ctx.createGain(); master.gain.value=.0001;
    const comp=ctx.createDynamicsCompressor(); comp.threshold.value=-14; comp.ratio.value=4;
    master.connect(comp).connect(ctx.destination);
    /* a small dark room: generated reverb tail */
    const len=Math.floor(ctx.sampleRate*1.4), ir=ctx.createBuffer(2,len,ctx.sampleRate);
    for(let c=0;c<2;c++){ const d=ir.getChannelData(c); for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.2); }
    verb=ctx.createConvolver(); verb.buffer=ir; const vg=ctx.createGain(); vg.gain.value=.5; verb.connect(vg).connect(master);
    noise=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate); const nd=noise.getChannelData(0); for(let i=0;i<nd.length;i++) nd[i]=Math.random()*2-1;
    started=true; return true;
  }
  function out(node,{pan=0,pan1=null,wet=.2,t}){
    const p=ctx.createStereoPanner(); p.pan.setValueAtTime(pan,t); if(pan1!==null) p.pan.linearRampToValueAtTime(pan1,t+.3);
    node.connect(p); p.connect(master);
    if(wet>0){ const w=ctx.createGain(); w.gain.value=wet; p.connect(w).connect(verb); }
  }
  /* filtered noise burst, with an optional frequency sweep */
  function hiss(dur,{type="bandpass",f0=1000,f1=f0,Q=1,gain=.3,attack=.005,delay=0,pan=0,pan1=null,wet=.2,flutter=false}={}){
    const t=ctx.currentTime+delay, src=ctx.createBufferSource(); src.buffer=noise; src.loop=true;
    const f=ctx.createBiquadFilter(); f.type=type; f.Q.value=Q; f.frequency.setValueAtTime(f0,t); f.frequency.exponentialRampToValueAtTime(Math.max(40,f1),t+dur);
    const g=ctx.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(gain,t+attack);
    if(flutter){ for(let x=attack;x<dur;x+=.014) g.gain.setValueAtTime(gain*(.25+Math.random()*.75),t+x); }
    g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    src.connect(f).connect(g); out(g,{pan,pan1,wet,t}); src.start(t,Math.random()*.5); src.stop(t+dur+.05);
  }
  /* a pitched hit that slides from one note to another */
  function tone(fr0,fr1,dur,{type="sine",gain=.3,delay=0,wet=.2,pan=0}={}){
    const t=ctx.currentTime+delay, o=ctx.createOscillator(); o.type=type;
    o.frequency.setValueAtTime(fr0,t); o.frequency.exponentialRampToValueAtTime(Math.max(20,fr1),t+dur);
    const g=ctx.createGain(); g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(gain,t+.006); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(g); out(g,{pan,wet,t}); o.start(t); o.stop(t+dur+.05);
  }
  const play=fn=>(...a)=>{ if(on&&ctx&&ctx.state==="running") fn(...a); };

  /* ---- the effects ---- */
  const tick=play(()=>{ hiss(.03,{type:"highpass",f0:3200,gain:.18,attack:.001,wet:.05}); tone(1700,1150,.035,{type:"triangle",gain:.05,wet:.05}); });
  const slash=play((g=.45)=>{ hiss(.32,{f0:650,f1:5200,Q:1.3,gain:g,attack:.04,pan:-.7,pan1:.7,wet:.25}); });
  const page=play(()=>{ slash(.3); tone(92,48,.45,{gain:.22,wet:.3}); });
  const open=play(()=>{ slash(.42); tone(68,38,1,{gain:.3,wet:.55}); hiss(.9,{type:"lowpass",f0:260,f1:180,gain:.14,attack:.25,wet:.5}); });
  const close=play(()=>{ hiss(.22,{f0:4200,f1:800,Q:1.2,gain:.25,attack:.02,pan:.5,pan1:-.5,wet:.15}); });
  const crack=play(()=>{
    hiss(.016,{type:"highpass",f0:6000,gain:.28,attack:.001,wet:.1});
    [0,.034,.078].forEach((dl,i)=>hiss(.05,{f0:2500-i*250,f1:1700,Q:3,gain:.55-i*.14,attack:.002,delay:dl,wet:.25,pan:(i-1)*.25}));
    tone(160,62,.14,{gain:.35,delay:.01,wet:.3});
  });
  const flip=play(()=>{ hiss(.26,{f0:1600,f1:650,Q:.8,gain:.32,attack:.03,wet:.2,pan:-.2,pan1:.2}); hiss(.18,{f0:2600,f1:1200,Q:.9,gain:.16,attack:.02,delay:.12,wet:.2}); });
  const stamp=play(()=>{ tone(115,46,.24,{gain:.7,wet:.35}); hiss(.07,{type:"lowpass",f0:700,f1:300,gain:.45,attack:.002,wet:.3}); tone(250,205,.05,{type:"triangle",gain:.12,wet:.2}); });
  const tear=play(()=>{ hiss(.42,{type:"highpass",f0:1300,f1:3200,gain:.42,attack:.01,flutter:true,wet:.2,pan:-.4,pan1:.4}); slash(.3); });

  function setOn(v){
    if(v&&!init()) return false;
    on=v; if(!ctx) return v;
    clearTimeout(suspendT);
    if(v&&ctx.state==="suspended") ctx.resume();
    const t=ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(Math.max(master.gain.value,.0001),t);
    master.gain.exponentialRampToValueAtTime(v?.8:.0001,t+(v?.15:.3));
    if(!v) suspendT=setTimeout(()=>{ if(!on&&ctx.state==="running") ctx.suspend(); },500);
    return v;
  }
  document.addEventListener("visibilitychange",()=>{ if(!ctx||!on) return; document.hidden?ctx.suspend():ctx.resume(); });
  return {setOn,isOn:()=>on,tick,slash,page,open,close,crack,flip,stamp,tear};
})();
