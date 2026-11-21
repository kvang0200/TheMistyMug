"use strict";
/* =====================================================================
   SEARCH
   ===================================================================== */
const INDEX = [
  ...D.npcs.map((n) => ({
    k: "NPC",
    t: n.name,
    d: n.epi || n.where,
    txt: [n.name, n.epi, n.where, ...(n.facts || [])].join(" "),
    go: () => openNpc(n.id),
  })),
  ...PCS.map((p) => ({
    k: "Player",
    t: p.n,
    d: p.cl,
    txt: [p.n, p.sp, p.cl, ...(p.notes || [])].join(" "),
    go: () => openPc(p.id),
  })),
  ...D.places.map((p) => ({
    k: "Location",
    t: p.n,
    d: p.r,
    txt: [p.n, p.r, p.p].join(" "),
    go: () => openPlace(p.n),
  })),
  ...D.quests.map((q) => ({
    k: "Quest",
    t: q.n,
    d: q.p,
    txt: [q.n, q.p, q.t].join(" "),
    go: () => {
      questFilter = q.st === "done" ? "done" : "ongoing";
      renderQuestList();
      jumpTo("list");
    },
  })),
  ...D.tarokka.map((c) => ({
    k: "Tarokka",
    t: c.n,
    d: "Madam Eva's reading",
    txt: [c.n, c.p].join(" "),
    go: () => jumpTo("tarokka"),
  })),
  ...D.sessions.map((s) => ({
    k: "Session " + s.n,
    t: s.t,
    d: plain(s.s).slice(0, 80) + "…",
    txt: [s.t, plain(s.s)].join(" "),
    go: () => gotoSession(s.n),
  })),
];
const q = $("#q"),
  res = $("#results"),
  hdr = $("#hdr"),
  sBtn = $("#searchBtn");
sBtn.innerHTML = ICON.search;
sBtn.addEventListener("click", () => {
  const on = hdr.classList.toggle("searching");
  sBtn.innerHTML = on ? ICON.close : ICON.search;
  sBtn.setAttribute("aria-expanded", String(on));
  Sound.tick();
  if (on) setTimeout(() => q.focus(), 50);
  else {
    res.classList.remove("on");
    q.value = "";
  }
});
q.addEventListener("input", () => {
  const v = q.value.trim().toLowerCase();
  if (v.length < 2) {
    res.classList.remove("on");
    return;
  }
  const hits = INDEX.map((it) => {
    const t = it.t.toLowerCase(),
      x = it.txt.toLowerCase();
    return { it, s: t.startsWith(v) ? 3 : t.includes(v) ? 2 : x.includes(v) ? 1 : 0 };
  })
    .filter((h) => h.s)
    .sort((a, b) => b.s - a.s)
    .slice(0, 12);
  res.innerHTML = hits.length
    ? hits
        .map(
          (h) =>
            `<button type="button" data-i="${INDEX.indexOf(h.it)}"><b>${esc(h.it.t)}</b><small>${esc(h.it.k)} · ${esc(h.it.d || "")}</small></button>`
        )
        .join("")
    : `<div class="none">Nothing in the archive matches.</div>`;
  res.classList.add("on");
});
res.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  e.stopPropagation();
  const it = INDEX[+b.dataset.i];
  res.classList.remove("on");
  q.value = "";
  if (hdr.classList.contains("searching")) sBtn.click();
  it.go();
});
q.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const b = res.querySelector("button");
    if (b) b.click();
  }
  if (e.key === "Escape") sBtn.click();
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search") && e.target !== sBtn && !sBtn.contains(e.target))
    res.classList.remove("on");
});

/* =====================================================================
   SOUND TOGGLE
   ===================================================================== */
const soundBtn = $("#soundBtn");
function paintSound() {
  const on = Sound.isOn();
  soundBtn.innerHTML = on ? ICON.soundOn : ICON.soundOff;
  soundBtn.setAttribute("aria-pressed", String(on));
  soundBtn.setAttribute("aria-label", on ? "Sound effects on" : "Sound effects off");
}
soundBtn.addEventListener("click", () => {
  const want = !Sound.isOn();
  Sound.setOn(want);
  store.set("bv-sound", want ? "1" : "0");
  paintSound();
  if (want) Sound.tick();
});
/* sound is on by default; it starts at the first tap (see js/sound.js) */
paintSound();

/* =====================================================================
   START
   ===================================================================== */
renderHome();
renderSessions();
renderNpcs();
renderLocList();
renderQuests();
/* the flipped portrait covers each player card from the stats down, so the name and class always stay visible */
/* the dice fill the space under Strahd's card, whatever the screen size */
/* the size of one design pixel (--u), which grows on very large screens */
function unitPx() {
  const d = document.createElement("div");
  d.style.cssText = "position:absolute;visibility:hidden;width:calc(100 * var(--u))";
  document.body.appendChild(d);
  const u = d.offsetWidth / 100;
  d.remove();
  return u || 1;
}
function fitDice() {
  const dc = $(".dice");
  if (!dc || !dc.offsetParent) return;
  const v = dc.parentElement,
    card = v.querySelector(".card");
  if (!card) return;
  const below =
    v.clientHeight - (card.parentElement.offsetTop + card.offsetTop + card.offsetHeight);
  dc.style.setProperty(
    "--dsz",
    Math.round(
      Math.max(220 * unitPx(), Math.min(1000 * unitPx(), below * 0.92, innerWidth * 0.3))
    ) + "px"
  );
}
/* title card: the headline grows to fill spare height, and a stacked layout (Strahd's card below the text) gets the straight red band */
function fitCover() {
  const cv = $(".cover.sstage");
  if (!cv || !cv.offsetParent) return;
  const copy = cv.querySelector(".cover-copy"),
    vil = cv.querySelector(".villain"),
    hl = cv.querySelector(".headline");
  /* measure in the normal layout: clear the previous result first, or a stacked layout would keep itself stacked */
  cv.classList.remove("stacked");
  if (hl) hl.style.fontSize = "";
  cv.classList.toggle("stacked", !!(vil && copy && vil.offsetTop > copy.offsetTop + 40));
  if (!hl) return;
  /* only grow on laptop-sized screens; large monitors keep the normal headline */
  if (innerWidth <= 760 || cv.classList.contains("stacked") || innerWidth / unitPx() > 1600) return;
  const room = innerHeight - $("#hdr").offsetHeight;
  if (cv.offsetHeight > room) return;
  const base = parseFloat(getComputedStyle(hl).fontSize);
  let lo = base,
    hi = Math.min(base * 1.35, innerHeight * 0.12);
  for (let k = 0; k < 7; k++) {
    const mid = (lo + hi) / 2;
    hl.style.fontSize = mid + "px";
    if (cv.offsetHeight <= room && hl.scrollWidth <= hl.clientWidth + 2) lo = mid;
    else hi = mid;
  }
  hl.style.fontSize = lo + "px";
}
function fitPhotos() {
  fitCover();
  fitDice();
  $$(".pslot").forEach((sl) => {
    let el = sl.querySelector(".stats"),
      y = 0;
    if (!el || !el.offsetParent) return;
    while (el && el !== sl) {
      y += el.offsetTop;
      el = el.offsetParent;
    }
    sl.style.setProperty("--ptop", y - 6 + "px");
  });
}
$("#v-home").addEventListener(
  "pointermove",
  (e) => {
    const sl = e.target.closest(".pslot");
    if (!sl) return;
    const r = sl.getBoundingClientRect();
    sl.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 100).toFixed(1) + "%");
    sl.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 100).toFixed(1) + "%");
  },
  { passive: true }
);
fitPhotos();
addEventListener("resize", () => requestAnimationFrame(fitPhotos));
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitPhotos);
/* touch screens: mark whatever is being pressed so it can sink in and spring back.
   (Phone browsers, Safari especially, don't reliably apply :active to a tap.) */
(() => {
  const PRESS =
    "a.card,button.card,.notice,.scrap,.seal-row,.chips>*,.filters button,.btn,.nav a,.sealed-btn";
  let held = null,
    t = 0,
    lastTouch = 0;
  /* letting go: the card wobbles back like jelly (.boing in css/10-cute.css) */
  const boing = (el) => {
    if (reduced || !el) return;
    el.classList.remove("boing");
    void el.offsetWidth;
    el.classList.add("boing");
    el.addEventListener("animationend", () => el.classList.remove("boing"), { once: true });
  };
  const up = (release) => {
    clearTimeout(t);
    if (held) {
      held.classList.remove("pressing");
      if (release === true) boing(held);
      held = null;
    }
  };
  addEventListener(
    "mouseup",
    (e) => {
      /* phones fire a mouseup after every tap; the touch handler already boings those */
      if (e.button === 0 && Date.now() - lastTouch > 800)
        boing(e.target.closest && e.target.closest(PRESS));
    },
    { passive: true }
  );
  addEventListener(
    "touchstart",
    (e) => {
      up();
      lastTouch = Date.now();
      const el = e.target.closest && e.target.closest(PRESS);
      if (el) {
        held = el;
        el.classList.add("pressing");
      }
    },
    { passive: true }
  );
  /* keep a quick tap pressed for a moment so the sink is actually visible */
  addEventListener(
    "touchend",
    () => {
      clearTimeout(t);
      t = setTimeout(() => up(true), 140);
    },
    { passive: true }
  );
  addEventListener("touchcancel", () => up(), { passive: true });
  addEventListener("touchmove", () => up(), { passive: true });
})();
$("#footNote").textContent = "Kept for the players · Updated after Session " + LAST;
let introSeen = false;
try {
  introSeen = sessionStorage.getItem("bv-intro") === "1";
  sessionStorage.setItem("bv-intro", "1");
} catch (e) {
  introSeen = true;
}
if (!introSeen && !reduced) {
  $("#introN").textContent = LAST;
  $("#intro").classList.remove("gone");
  $("#v-home").style.setProperty("--base", ".6s");
  setTimeout(() => {
    $("#intro").classList.add("gone");
  }, 950);
} else $("#v-home").style.setProperty("--base", "0s");
/* Strahd's HOSTILE stamp lands with a thud (if sound has already been woken by a tap) */
setTimeout(
  () => {
    if (current === "home") Sound.stamp();
  },
  (introSeen ? 0 : 600) + 1800
);
show(location.hash.slice(1) || "home", false);

/* once the page is idle, fetch the small map and fog so Locations opens without a stall */
function whenIdle(fn) {
  "requestIdleCallback" in window
    ? requestIdleCallback(fn, { timeout: 5000 })
    : setTimeout(fn, 2500);
}
addEventListener("load", () =>
  whenIdle(() => {
    [MAP_SMALL, "img/fog.webp", "img/fog2.webp"].forEach((src) => {
      const im = new Image();
      im.src = src;
      im.decode && im.decode().catch(() => {});
    });
  })
);
/* offline cache + instant repeat visits */
if (
  "serviceWorker" in navigator &&
  (location.protocol === "https:" || location.hostname === "localhost")
)
  addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
