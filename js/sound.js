/* =====================================================================
   SOUND: short effects made in the browser (Web Audio), no sound files.
   Wax seals crack, paper turns, stamps thud, blades slash.
   Sound is on by default and starts at the player's first tap (browsers
   don't allow sound before that). The speaker button turns it off, and
   the choice is remembered. The audio engine is suspended whenever sound
   is off or the page is hidden.
   ===================================================================== */
const Sound = (() => {
  let ctx = null,
    master = null,
    verb = null,
    noise = null,
    on = true,
    started = false,
    suspendT = null;
  try {
    on = localStorage.getItem("bv-sound") !== "0";
  } catch (e) {}

  function init() {
    if (started) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    try {
      ctx = new AC();
    } catch (e) {
      return false;
    }
    master = ctx.createGain();
    master.gain.value = on ? 0.8 : 0.0001;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    master.connect(comp).connect(ctx.destination);
    /* a small dark room: generated reverb tail */
    const len = Math.floor(ctx.sampleRate * 1.4),
      ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    verb = ctx.createConvolver();
    verb.buffer = ir;
    const vg = ctx.createGain();
    vg.gain.value = 0.5;
    verb.connect(vg).connect(master);
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const nd = noise.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    started = true;
    return true;
  }
  function out(node, { pan = 0, pan1 = null, wet = 0.2, t }) {
    const p = ctx.createStereoPanner ? ctx.createStereoPanner() : ctx.createGain();
    if (p.pan) {
      p.pan.setValueAtTime(pan, t);
      if (pan1 !== null) p.pan.linearRampToValueAtTime(pan1, t + 0.3);
    }
    node.connect(p);
    p.connect(master);
    if (wet > 0) {
      const w = ctx.createGain();
      w.gain.value = wet;
      p.connect(w).connect(verb);
    }
  }
  /* filtered noise burst, with an optional frequency sweep */
  function hiss(
    dur,
    {
      type = "bandpass",
      f0 = 1000,
      f1 = f0,
      Q = 1,
      gain = 0.3,
      attack = 0.005,
      delay = 0,
      pan = 0,
      pan1 = null,
      wet = 0.2,
      flutter = false,
    } = {}
  ) {
    const t = ctx.currentTime + delay,
      src = ctx.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.Q.value = Q;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + attack);
    if (flutter) {
      for (let x = attack; x < dur; x += 0.014)
        g.gain.setValueAtTime(gain * (0.25 + Math.random() * 0.75), t + x);
    }
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g);
    out(g, { pan, pan1, wet, t });
    src.start(t, Math.random() * 0.5);
    src.stop(t + dur + 0.05);
  }
  /* a pitched hit that slides from one note to another */
  function tone(fr0, fr1, dur, { type = "sine", gain = 0.3, delay = 0, wet = 0.2, pan = 0 } = {}) {
    const t = ctx.currentTime + delay,
      o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(fr0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, fr1), t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    out(g, { pan, wet, t });
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  /* iPhone/iPad: let sound play even when the silent switch is on (Safari 17+) */
  function session(v) {
    try {
      if (navigator.audioSession) navigator.audioSession.type = v ? "playback" : "auto";
    } catch (e) {}
  }
  /* if the engine is still waking up, play as soon as it's ready instead of dropping the sound */
  const play =
    (fn) =>
    (...a) => {
      if (!on || !ctx) return;
      if (ctx.state === "running") {
        try {
          fn(...a);
        } catch (e) {}
        return;
      }
      ctx.resume().then(
        () => {
          if (on)
            try {
              fn(...a);
            } catch (e) {}
        },
        () => {}
      );
    };
  function chord(notes, { delay = 0, gain = 0.05, dur = 2.2, wet = 0.85 } = {}) {
    notes.forEach((f, i) => {
      const t = ctx.currentTime + delay + i * 0.03,
        o = ctx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = f;
      o.detune.value = i % 2 ? 7 : -7;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 900;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain, t + 0.35);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(lp).connect(g);
      out(g, { wet, t });
      o.start(t);
      o.stop(t + dur + 0.05);
    });
  }

  /* ---- the effects ---- */
  const tick = play(() => {
    hiss(0.03, { type: "highpass", f0: 3200, gain: 0.18, attack: 0.001, wet: 0.05 });
    tone(1700, 1150, 0.035, { type: "triangle", gain: 0.05, wet: 0.05 });
  });
  const slash = play((g = 0.45) => {
    hiss(0.32, {
      f0: 650,
      f1: 5200,
      Q: 1.3,
      gain: g,
      attack: 0.04,
      pan: -0.7,
      pan1: 0.7,
      wet: 0.25,
    });
  });
  const page = play(() => {
    slash(0.3);
    tone(92, 48, 0.45, { gain: 0.22, wet: 0.3 });
  });
  const open = play(() => {
    slash(0.42);
    tone(68, 38, 1, { gain: 0.3, wet: 0.55 });
    hiss(0.9, { type: "lowpass", f0: 260, f1: 180, gain: 0.14, attack: 0.25, wet: 0.5 });
  });
  const close = play(() => {
    hiss(0.22, {
      f0: 4200,
      f1: 800,
      Q: 1.2,
      gain: 0.25,
      attack: 0.02,
      pan: 0.5,
      pan1: -0.5,
      wet: 0.15,
    });
  });
  const crack = play(() => {
    hiss(0.016, { type: "highpass", f0: 6000, gain: 0.28, attack: 0.001, wet: 0.1 });
    [0, 0.034, 0.078].forEach((dl, i) =>
      hiss(0.05, {
        f0: 2500 - i * 250,
        f1: 1700,
        Q: 3,
        gain: 0.55 - i * 0.14,
        attack: 0.002,
        delay: dl,
        wet: 0.25,
        pan: (i - 1) * 0.25,
      })
    );
    tone(160, 62, 0.14, { gain: 0.35, delay: 0.01, wet: 0.3 });
    tone(72, 40, 0.34, { gain: 0.45, delay: 0.01, wet: 0.35 });
    for (let i = 0; i < 12; i++)
      hiss(0.008 + Math.random() * 0.01, {
        type: "highpass",
        f0: 1800 + Math.random() * 3000,
        gain: 0.08 + Math.random() * 0.1,
        attack: 0.001,
        delay: 0.03 + Math.random() * 0.45,
        wet: 0.15,
        pan: Math.random() - 0.5,
      });
    chord([146.83, 174.61, 220, 233.08], { delay: 0.12, gain: 0.045 });
    tone(55, 55, 2.4, { type: "triangle", gain: 0.1, delay: 0.1, wet: 0.6 });
  });
  /* pressing a fresh seal back on: a soft thud and a little squish of warm wax */
  const reseal = play(() => {
    tone(150, 85, 0.16, { gain: 0.35, wet: 0.3 });
    hiss(0.08, { type: "lowpass", f0: 600, f1: 400, gain: 0.3, attack: 0.002, wet: 0.2 });
    hiss(0.22, { f0: 1200, f1: 500, gain: 0.08, attack: 0.03, delay: 0.05, wet: 0.3 });
  });
  /* the classified cover sliding back down */
  const shutter = play(() => {
    hiss(0.3, { f0: 3200, f1: 700, Q: 1, gain: 0.3, attack: 0.02, pan: 0.4, pan1: -0.4, wet: 0.2 });
    tone(110, 60, 0.2, { gain: 0.3, delay: 0.26, wet: 0.3 });
  });
  const flip = play(() => {
    hiss(0.26, {
      f0: 1600,
      f1: 650,
      Q: 0.8,
      gain: 0.32,
      attack: 0.03,
      wet: 0.2,
      pan: -0.2,
      pan1: 0.2,
    });
    hiss(0.18, { f0: 2600, f1: 1200, Q: 0.9, gain: 0.16, attack: 0.02, delay: 0.12, wet: 0.2 });
  });
  const stamp = play(() => {
    tone(115, 46, 0.24, { gain: 0.7, wet: 0.35 });
    hiss(0.07, { type: "lowpass", f0: 700, f1: 300, gain: 0.45, attack: 0.002, wet: 0.3 });
    tone(250, 205, 0.05, { type: "triangle", gain: 0.12, wet: 0.2 });
  });
  const tear = play(() => {
    hiss(0.42, {
      type: "highpass",
      f0: 1300,
      f1: 3200,
      gain: 0.42,
      attack: 0.01,
      flutter: true,
      wet: 0.2,
      pan: -0.4,
      pan1: 0.4,
    });
    slash(0.3);
  });

  /* ---- the D&D pop-up entrances ---- */
  /* a Tarokka card snapping over */
  /* a Tarokka card: a crunchy riffle as it spins in, a thick crackling snap as it flips, a crumple as it bursts.
     Grains of filtered noise kept in the low-mid range so it's crunchy, not shrill */
  const grains = (
    n,
    span,
    {
      f = 700,
      fr = 1300,
      Q = 2.2,
      g = 0.2,
      gr = 0.14,
      delay = 0,
      len = 0.014,
      lr = 0.022,
      wet = 0.18,
    } = {}
  ) => {
    for (let i = 0; i < n; i++)
      hiss(len + Math.random() * lr, {
        f0: f + Math.random() * fr,
        Q,
        gain: g + Math.random() * gr,
        attack: 0.001,
        delay: delay + Math.random() * span,
        wet,
        pan: Math.random() * 0.8 - 0.4,
      });
  };
  const cardRiffle = play(() => {
    for (let i = 0; i < 9; i++) {
      const dl = i * 0.032;
      hiss(0.02, {
        f0: 850 + i * 55,
        Q: 2.2,
        gain: 0.44 - i * 0.025,
        attack: 0.001,
        delay: dl,
        wet: 0.12,
        pan: -0.3 + i * 0.07,
      });
    }
    grains(12, 0.28, { g: 0.2, gr: 0.14, f: 600, fr: 900 });
  });
  const cardSnap = play(() => {
    tone(150, 70, 0.12, { gain: 0.34, wet: 0.25 });
    hiss(0.035, { f0: 1500, Q: 1.6, gain: 0.5, attack: 0.001, wet: 0.12 });
    hiss(0.09, { type: "lowpass", f0: 1200, f1: 400, gain: 0.32, attack: 0.002, wet: 0.2 });
    grains(22, 0.1, { g: 0.3, gr: 0.24 });
  });
  /* one soft, muffled crunch as the card becomes the file */
  const cardBurst = play(() => {
    hiss(0.17, { f0: 900, f1: 520, Q: 0.9, gain: 0.2, attack: 0.012, flutter: true, wet: 0.3 });
    tone(120, 70, 0.16, { gain: 0.16, wet: 0.3 });
  });
  /* a quest notice unfolding: a soft, crunchy rustle of paper, then a low pat as it falls flat */
  const unfold = play(() => {
    grains(14, 0.22, { f: 500, fr: 700, g: 0.12, gr: 0.08, len: 0.012, lr: 0.02, wet: 0.2 });
    hiss(0.2, { type: "lowpass", f0: 1400, f1: 500, gain: 0.1, attack: 0.03, flutter: true, wet: 0.25 });
    tone(110, 72, 0.1, { gain: 0.1, delay: 0.24, wet: 0.25 });
  });
  /* folding it back up: a shorter rustle */
  const fold = play(() => {
    grains(8, 0.12, { f: 600, fr: 600, g: 0.1, gr: 0.06, wet: 0.15 });
    tone(130, 95, 0.06, { gain: 0.07, delay: 0.12, wet: 0.2 });
  });
  /* a die on a table: hard little knocks, closer together as it settles */
  const dieHit = play((g = 1, dl = 0) => {
    const f = 1500 + Math.random() * 900;
    hiss(0.022, {
      f0: f,
      Q: 3.5,
      gain: 0.3 * g,
      attack: 0.001,
      delay: dl,
      wet: 0.12,
      pan: Math.random() * 0.6 - 0.3,
    });
    tone(f * 0.62, f * 0.5, 0.03, { type: "triangle", gain: 0.06 * g, delay: dl, wet: 0.1 });
    tone(230, 190, 0.05, { gain: 0.12 * g, delay: dl, wet: 0.15 });
  });
  const dice = play(() => {
    [0, 0.11, 0.2, 0.27, 0.32, 0.36, 0.39, 0.41].forEach((dl, i) =>
      dieHit(Math.max(0.28, 1 - i * 0.11), dl)
    );
  });
  /* a war drum on the initiative flash */
  const drum = play(() => {
    tone(96, 44, 0.42, { gain: 0.62, wet: 0.4 });
    hiss(0.09, { type: "lowpass", f0: 900, f1: 250, gain: 0.35, attack: 0.002, wet: 0.3 });
    tone(190, 150, 0.06, { type: "triangle", gain: 0.08, wet: 0.2 });
  });
  /* portcullis: crunchy, low and short, never a long metal ring or squeal */
  const chains = play((len = 0.42, g = 1) => {
    for (let i = 0; i < 22; i++) {
      const dl = Math.random() * len;
      hiss(0.018 + Math.random() * 0.03, {
        f0: 500 + Math.random() * 1100,
        Q: 2.4,
        gain: (0.24 + Math.random() * 0.2) * g,
        attack: 0.001,
        delay: dl,
        wet: 0.18,
        pan: Math.random() * 0.8 - 0.4,
      });
    }
    for (let i = 0; i < 5; i++) {
      const dl = Math.random() * len;
      tone(420 + Math.random() * 160, 380, 0.05, {
        type: "triangle",
        gain: 0.06 * g,
        delay: dl,
        wet: 0.25,
      });
    }
  });
  const clang = play(() => {
    tone(78, 50, 0.55, { gain: 0.68, wet: 0.45 });
    tone(150, 128, 0.22, { type: "triangle", gain: 0.1, wet: 0.3 });
    tone(312, 296, 0.13, { type: "triangle", gain: 0.13, wet: 0.35 });
    tone(468, 445, 0.09, { type: "triangle", gain: 0.07, wet: 0.35 });
    hiss(0.14, { type: "lowpass", f0: 1100, f1: 280, gain: 0.5, attack: 0.002, wet: 0.3 });
    for (let i = 0; i < 9; i++)
      hiss(0.012 + Math.random() * 0.02, {
        f0: 700 + Math.random() * 900,
        Q: 2,
        gain: 0.2 + Math.random() * 0.12,
        attack: 0.001,
        delay: 0.01 + Math.random() * 0.16,
        wet: 0.2,
        pan: Math.random() * 0.6 - 0.3,
      });
  });
  const winch = play(() => {
    hiss(0.6, { type: "lowpass", f0: 340, f1: 220, gain: 0.13, attack: 0.06, wet: 0.3 });
    for (let i = 0; i < 9; i++) {
      const dl = 0.03 + i * 0.058;
      hiss(0.02, { f0: 850 - i * 20, Q: 2.2, gain: 0.15, attack: 0.001, delay: dl, wet: 0.15 });
      tone(150, 128, 0.035, { gain: 0.1, delay: dl, wet: 0.15 });
    }
  });

  function setOn(v) {
    if (v && !init()) return false;
    on = v;
    session(v);
    if (!ctx) return v;
    clearTimeout(suspendT);
    if (v && ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t);
    master.gain.exponentialRampToValueAtTime(v ? 0.8 : 0.0001, t + (v ? 0.15 : 0.3));
    if (!v)
      suspendT = setTimeout(() => {
        if (!on && ctx.state === "running") ctx.suspend();
      }, 500);
    return v;
  }
  document.addEventListener("visibilitychange", () => {
    if (!ctx || !on) return;
    document.hidden ? ctx.suspend() : ctx.resume();
  });
  /* Browsers only start audio inside a real tap, click or key press (not a touch "pointerdown").
     Each one wakes the engine if sound is on and it isn't running yet. Capture phase, so the
     engine is ready before the click that triggered it asks for a sound. */
  const wake = () => {
    if (!on) return;
    if (!started) {
      setOn(true);
      return;
    }
    if (ctx.state !== "running") ctx.resume();
  };
  ["click", "touchend", "keydown"].forEach((ev) =>
    addEventListener(ev, wake, { capture: true, passive: true })
  );
  return {
    setOn,
    isOn: () => on,
    tick,
    slash,
    page,
    open,
    close,
    crack,
    flip,
    stamp,
    tear,
    reseal,
    shutter,
    cardRiffle,
    cardSnap,
    cardBurst,
    unfold,
    fold,
    dieHit,
    dice,
    drum,
    chains,
    clang,
    winch,
  };
})();
