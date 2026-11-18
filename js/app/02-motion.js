"use strict";
/* =====================================================================
   SCROLL MOTION (SX)
   Writes how far each element has scrolled into view onto it as CSS
   variables (--sxe, --sxp, --sxq; see css/03-motion.css). Only
   elements on or near the screen are measured, once per frame, and
   only while the page is actually scrolling. Works in every browser.
   ===================================================================== */
const SX = (() => {
  const SEL = ".in,.mist,.thread-host,.mapframe";
  const live = new Set(),
    rootEl = document.documentElement;
  let raf = 0,
    io = null;
  const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const wide = window.matchMedia ? matchMedia("(min-width:1100px)") : { matches: true };
  function set(el, k, v) {
    const t = v.toFixed(3);
    if (el["_" + k] !== t) {
      el["_" + k] = t;
      el.style.setProperty(k, t);
    }
  }
  function px(el, k, v) {
    v = Math.round(v);
    if (el["_" + k] !== v) {
      el["_" + k] = v;
      el.style.setProperty(k, v + "px");
    }
  }
  /* read every position first, then write every variable, so the browser lays out once per frame */
  function read(el, vh) {
    const r = el.getBoundingClientRect();
    if (!r.height && !r.width) return null;
    const e = clamp((vh - r.top) / (vh * 0.55));
    const ee = 1 - Math.pow(1 - e, 3);
    /* snap the last sliver to exactly 1 so nothing is left at 99.9% scale (soft text on phones) */
    return [
      el,
      ee > 0.99 ? 1 : ee,
      clamp((vh - r.top) / (vh + r.height)),
      clamp((vh * 0.75 - r.top) / Math.max(1, r.height)),
    ];
  }
  function write(m) {
    if (!m) return;
    set(m[0], "--sxe", m[1]);
    set(m[0], "--sxp", m[2]);
    set(m[0], "--sxq", m[3]);
  }
  const measure = (el, vh) => write(read(el, vh));

  /* PINS: a wrapper [data-pin] holds a .stage that sticks to the screen while you
     scroll through the wrapper. The wrapper is made tall enough for the scene:
       cover  the title card holds still while it settles, then the next part of
              the page slides up over it
     --pt is the scene's progress (0 to 1), --pu how far the next part has covered it. */
  let pins = [];
  const ro = "ResizeObserver" in window ? new ResizeObserver(() => kick()) : null;
  function findPins() {
    pins.forEach((p) => {
      if (!p.isConnected || !p.closest(".view.on")) off(p);
    });
    pins = $$(".view.on [data-pin]");
    pins.forEach((p) => {
      if (ro && !p._ro) {
        p._ro = 1;
        ro.observe(p.querySelector(".sstage"));
      }
    });
  }
  function off(p) {
    if (!p.classList.contains("on")) return;
    p.classList.remove("on");
    p.style.height = "";
    p._h = null;
    p._ov = null;
    const nx = p.nextElementSibling;
    if (nx && nx.classList.contains("after-pin")) nx.style.marginTop = "";
  }
  function pinRead(p, vh, hdr) {
    const type = p.dataset.pin,
      active = !reduced && wide.matches;
    if (!active) return { p, active };
    const stage = p.querySelector(".sstage"),
      sh = stage.offsetHeight,
      room = vh - hdr;
    const stick = sh > room ? vh - sh : hdr + (type === "cover" ? 0 : (room - sh) / 2);
    const L = type === "cover" ? vh * 0.55 : 0,
      O = type === "cover" ? vh : 0;
    return { p, active, type, stage, sh, stick, L, O, top: p.getBoundingClientRect().top };
  }
  function pinWrite(r) {
    const p = r.p;
    if (!r.active) {
      off(p);
      return;
    }
    if (!p.classList.contains("on")) p.classList.add("on");
    px(p, "--stick", r.stick);
    const h = Math.round(r.sh + r.L + r.O);
    if (p._h !== h) {
      p._h = h;
      p.style.height = h + "px";
    }
    const nx = p.nextElementSibling;
    if (nx && nx.classList.contains("after-pin") && p._ov !== r.O) {
      p._ov = r.O;
      nx.style.marginTop = -r.O + "px";
    }
    const d = r.stick - r.top,
      t = r.L ? clamp(d / r.L) : 0;
    set(p, "--pt", t);
    set(p, "--pu", r.O ? clamp((d - r.L) / r.O) : 0);
  }

  function frame() {
    raf = 0;
    const vh = innerHeight,
      y = scrollY,
      H = rootEl.scrollHeight - vh,
      hdr = $("#hdr").offsetHeight;
    const pr = pins.map((p) => pinRead(p, vh, hdr));
    const els = [];
    live.forEach((el) => {
      if (!el.isConnected) live.delete(el);
      else els.push(read(el, vh));
    });
    px(rootEl, "--hdr", hdr);
    set(rootEl, "--sp", H > 0 ? clamp(y / H) : 0);
    pr.forEach(pinWrite);
    els.forEach(write);
  }
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  function scan() {
    if (!io && !reduced)
      io = new IntersectionObserver(
        (list) => {
          list.forEach((x) => {
            if (x.isIntersecting) live.add(x.target);
            else {
              live.delete(x.target);
              measure(x.target, innerHeight);
            }
          });
          kick();
        },
        { rootMargin: "30% 0px 30% 0px" }
      );
    findPins();
    if (!reduced) {
      const vh = innerHeight;
      $$(SEL).forEach((el) => {
        if (!el._sx) {
          el._sx = 1;
          io.observe(el);
        }
        if (el.offsetParent !== null) measure(el, vh);
      });
    }
    kick();
  }
  addEventListener("resize", kick);
  if (wide.addEventListener) wide.addEventListener("change", kick);
  if (!reduced) {
    rootEl.classList.add("sx");
    addEventListener("scroll", kick, { passive: true });
  }
  return { scan, kick };
})();
/* DEAL: the Tarokka and fortune cards are dealt from a deck above the table
   the first time their row comes into view (again each time Quests opens) */
const Deal = (() => {
  let io = null;
  function run(g) {
    const gr = g.getBoundingClientRect(),
      x0 = gr.left + gr.width / 2,
      y0 = gr.top - 160;
    [...g.children].forEach((c, i) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty("--dx", Math.round(x0 - (r.left + r.width / 2)) + "px");
      c.style.setProperty("--dy", Math.round(y0 - (r.top + r.height / 2)) + "px");
      c.style.setProperty("--dr", (i % 2 ? 1 : -1) * (8 + i * 2) + "deg");
      c.style.setProperty("--dd", (i * 0.17).toFixed(2) + "s");
      setTimeout(() => Sound.tick(), i * 170 + 430);
    });
    g.classList.remove("undealt");
    g.classList.add("dealt");
  }
  function prep() {
    if (reduced) return;
    if (!io)
      io = new IntersectionObserver(
        (list) =>
          list.forEach((x) => {
            if (x.isIntersecting) {
              io.unobserve(x.target);
              run(x.target);
            }
          }),
        { threshold: 0, rootMargin: "0px 0px -12% 0px" }
      );
    $$(".view.on .deal").forEach((g) => {
      g.classList.remove("dealt");
      g.classList.add("undealt");
      io.observe(g);
    });
  }
  return { prep };
})();
/* numbers in the campaign strip count up the first time they come into view */
function countUp(scope) {
  if (reduced || !("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver(
    (list) =>
      list.forEach((x) => {
        if (!x.isIntersecting) return;
        io.unobserve(x.target);
        const el = x.target,
          full = el.textContent,
          m = full.match(/^(\d+)(.*)$/);
        if (!m) return;
        const to = +m[1],
          t0 = performance.now();
        const step = (now) => {
          const k = Math.min(1, (now - t0) / 1100),
            v = Math.round(to * (1 - Math.pow(1 - k, 3)));
          el.textContent = v + m[2];
          if (k < 1) requestAnimationFrame(step);
          else el.textContent = full;
        };
        el.textContent = "0" + m[2];
        requestAnimationFrame(step);
      }),
    { threshold: 0.6 }
  );
  scope.querySelectorAll(".tally .n").forEach((n) => io.observe(n));
}
