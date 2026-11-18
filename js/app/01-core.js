/* =====================================================================
   THE BAROVIAN ARCHIVE — "Hunter and Hunted"
   Everything on the page is built from js/data.js. You should not need
   to edit this file to update the site after a session.
   ===================================================================== */
"use strict";
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const esc = (s) =>
  String(s == null ? "" : s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
const store = {
  get(k) {
    try {
      return localStorage.getItem(k);
    } catch (e) {
      return null;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch (e) {}
  },
};
const reduced = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
const D = DATA,
  LAST = String(D.lastSession);
const npcById = Object.fromEntries(D.npcs.map((n) => [n.id, n]));
const placeByName = Object.fromEntries(D.places.map((p) => [p.n, p]));
const slug = (t) =>
  String(t)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const PCS = D.party.map((p, i) => ({ ...p, i, id: "pc-" + slug(p.n), name: p.n }));
const pcById = Object.fromEntries(PCS.map((p) => [p.id, p]));
const visionFor = (name) =>
  (D.visions || []).find((v) => v.who === name.split(" ")[0] || v.who === name);
const sessionsWith = (id) => D.sessions.filter((s) => (s.who || []).includes(id));
const latest = D.sessions[D.sessions.length - 1];
const earlier = D.sessions.slice(0, -1).reverse();
function isNew(x) {
  if (!x) return false;
  if (x.new === true) return true;
  const s = x.met !== undefined ? x.met : x.s;
  return String(s) === LAST;
}
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
const tilt = (i) => [-1.5, 1, -0.6, 1.4, -1.1, 0.8, -1.8][i % 7];

const ICON = {
  search:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  close:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  soundOn:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>',
  soundOff:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="m17 10 4 4M21 10l-4 4"/></svg>',
  arrow:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 12h16M14 6l6 6-6 6"/></svg>',
  eye: '<svg viewBox="0 0 38 22" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2 11C8 3 30 3 36 11C30 19 8 19 2 11Z"/><circle cx="19" cy="11" r="5"/></svg>',
};

/* ---------- small builders ---------- */
/* letter-by-letter reveal; each word is kept in a no-wrap group so a long name can only break between words, never mid-word ("Refor / mation") */
const letters = (word, start, step = 0.06) => {
  let i = 0;
  return String(word)
    .split(" ")
    .map(
      (w) =>
        `<span class="lw">${[...w].map((ch) => `<span class="mask" aria-hidden="true"><span style="animation-delay:calc(var(--base,0s) + ${(start + i++ * step).toFixed(2)}s)">${esc(ch)}</span></span>`).join("")}</span>` +
        (i++, "")
    )
    .join(" ");
};
const d = (t) => `style="animation-delay:calc(var(--base,0s) + ${t}s)"`;
function sil(n) {
  const dead = n.fate === "dead";
  if (n.img)
    return `<div class="sil${dead ? " dead" : ""}"><img src="${esc(n.img)}" alt="Portrait of ${esc(n.name)}" loading="lazy"></div>`;
  return `<div class="sil${dead ? " dead" : ""}"><svg viewBox="0 0 120 150" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><ellipse cx="60" cy="60" rx="22" ry="27" fill="var(--p)" stroke="color-mix(in srgb, var(--s) 35%, transparent)"/><path d="M50 84h20v14H50z" fill="var(--p)"/><path d="M10 150C14 118 36 100 60 98C84 100 106 118 110 150Z" fill="var(--p)" stroke="color-mix(in srgb, var(--s) 25%, transparent)"/></svg></div>`;
}
function standing(n) {
  if (n.fate === "dead") return { stamp: "DECEASED", tone: "ink", label: "Fallen" };
  if (n.fate === "unknown") return { stamp: "MISSING", tone: "red", label: "Missing" };
  if (n.side === "ally") return { stamp: "ALLY", tone: "ink", label: "Ally" };
  if (n.side === "foe") return { stamp: "HOSTILE", tone: "red", label: "Foe" };
  return { stamp: "UNCERTAIN", tone: "red", label: "Uncertain" };
}
const statusWord = (n) => (n.fate === "dead" ? "Dead" : n.fate === "unknown" ? "Unknown" : "Alive");
const where = (n) => (n.where && n.where !== "—" ? n.where : "Unknown");
const metLabel = (m) =>
  !m || m === "—" ? "Not yet met" : /[–-]/.test(m) ? "Sessions " + m : "Session " + m;
const head = (kick, title, aside = "") =>
  `<div class="head in"><div><span class="kick">${kick}</span><h2>${title}</h2></div>${aside}</div>`;
/* [[words]] in a session summary are blacked out until revealed */
function redacted(text) {
  let i = 0;
  return esc(text).replace(
    /\[\[(.+?)\]\]/g,
    (m, w) => `<span class="redact" style="--d:${(i++ * 0.08).toFixed(2)}s">${w}</span>`
  );
}
const plain = (text) => String(text).replace(/\[\[(.+?)\]\]/g, "$1");

/* ---------- seals: remembered on this device ---------- */
const SEALS = (() => {
  try {
    return JSON.parse(store.get("bv-seals") || "{}") || {};
  } catch (e) {
    return {};
  }
})();
const isOpen = (k) => !!SEALS[k];
function remember(k) {
  SEALS[k] = 1;
  store.set("bv-seals", JSON.stringify(SEALS));
}
function forget(k) {
  delete SEALS[k];
  store.set("bv-seals", JSON.stringify(SEALS));
}
const resealBtn = (what) =>
  `<button type="button" class="reseal" data-reseal aria-label="Seal ${esc(what)} again"><span>Reseal</span><i aria-hidden="true"></i></button>`;
const BLOB =
  "M24 2C30 2 33 6 38 7C44 8 46 13 45 19C44 25 47 28 44 34C41 40 36 41 31 44C26 47 21 46 16 44C10 42 6 39 4 33C2 27 5 23 4 17C3 11 8 7 13 6C18 5 20 2 24 2Z";
const EMBLEM = {
  key: '<circle cx="24" cy="21.5" r="3.6" fill="rgba(22,17,14,.72)"/><path d="M22.4 24.5H25.6L26.8 33H21.2Z" fill="rgba(22,17,14,.72)"/>',
  eye: '<path d="M14.5 24C17.5 19.6 30.5 19.6 33.5 24C30.5 28.4 17.5 28.4 14.5 24Z" fill="none" stroke="rgba(22,17,14,.75)" stroke-width="1.6"/><circle cx="24" cy="24" r="2.6" fill="rgba(22,17,14,.75)"/>',
};
function sealArt(kind) {
  return `<svg viewBox="0 0 48 48"><path d="${BLOB}" transform="translate(.8 1.6)" fill="rgba(0,0,0,.38)"/><path d="${BLOB}" fill="var(--a)"/><path d="${BLOB}" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="1"/><ellipse cx="17" cy="14" rx="9" ry="5.5" fill="#fff" opacity=".13"/><circle cx="24" cy="24" r="14" fill="rgba(0,0,0,.08)" stroke="color-mix(in srgb,var(--s) 50%,transparent)" stroke-width="1.2"/>${EMBLEM[kind] || EMBLEM.key}</svg>`;
}
function wax(kind = "key", w = 78) {
  const art = sealArt(kind);
  return `<span class="wax" style="--w:calc(${w} * var(--u))" aria-hidden="true"><span class="disc whole">${art}</span><span class="disc l">${art}</span><span class="disc r">${art}</span><svg class="crackline" viewBox="0 0 100 100"><polyline pathLength="1" points="53,-4 44,22 58,41 45,60 55,79 47,104" fill="none" stroke="var(--p)" stroke-width="3" stroke-linejoin="round"/></svg><span class="shard" style="left:46%;top:30%;width:calc(9 * var(--u));height:calc(7 * var(--u));clip-path:polygon(0 0,100% 30%,40% 100%);--x:calc(-38 * var(--u));--y:calc(-26 * var(--u));--r:-140deg"></span><span class="shard" style="left:52%;top:55%;width:calc(7 * var(--u));height:calc(9 * var(--u));clip-path:polygon(0 20%,100% 0,70% 100%);--x:calc(40 * var(--u));--y:calc(-18 * var(--u));--r:160deg"></span><span class="shard" style="left:48%;top:78%;width:calc(6 * var(--u));height:calc(6 * var(--u));clip-path:polygon(50% 0,100% 100%,0 80%);--x:calc(10 * var(--u));--y:calc(44 * var(--u));--r:90deg"></span></span>`;
}
function flipCard({
  key,
  cls = "",
  i = 0,
  front,
  back,
  frontParch = true,
  id = "",
  still = false,
}) {
  const open = isOpen(key);
  return `<div class="flip in ${cls}${open ? " is-open instant wide" : ""}" data-seal="${esc(key)}"${id ? ` id="${esc(id)}"` : ""} style="--tilt:${tilt(i)}deg;--i:${i}"><div class="shade"></div><div class="inner"><div class="face front${frontParch ? " parch" : ""}"${open ? " inert" : ""}>${front}</div><div class="face back parch"${open ? "" : " inert"}>${back}${resealBtn("this card")}</div></div></div>`;
}
/* a wax-sealed note (personal fortunes): tap the seal to crack it, tap again to reseal */
function sealBox(key, name, inner) {
  const open = isOpen(key),
    first = name.split(" ")[0];
  return `<div class="sealbox${open ? " is-open instant" : ""}" data-seal="${esc(key)}">
    <button type="button" class="seal-row" data-break aria-expanded="${open}" aria-label="${open ? "Seal " + esc(first) + "'s fortune again" : "Break the seal on " + esc(first) + "'s fortune"}">${wax("key", 62)}<span class="seal-txt"><span class="seal-title">${open ? "Seal it again" : "Break the seal"}</span><span class="seal-sub">For ${esc(first)} only</span></span></button>
    <div class="seal-body"${open ? "" : " hidden"}>${inner}</div>
  </div>`;
}
const fortuneText = (v) =>
  `<p>${esc(v.p)}</p><span class="label" style="color:var(--ink-muted)">From Madam Eva · Session 5</span>`;

/* =====================================================================
   EFFECTS: wax shards and embers when a seal breaks, a red glow on the
   opened card, crumbs when a seal is pressed back on. Drawn on one
   full-screen canvas that only runs while particles are in the air.
   ===================================================================== */
const FX = (() => {
  let cv = null,
    cx = null,
    parts = [],
    raf = 0,
    dpr = 1;
  const ok = () => !reduced && !!Element.prototype.animate;
  function size() {
    dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(innerWidth * dpr);
    cv.height = Math.round(innerHeight * dpr);
  }
  function canvas() {
    if (cv) return;
    cv = document.createElement("canvas");
    cv.className = "fx-canvas";
    cv.setAttribute("aria-hidden", "true");
    document.body.appendChild(cv);
    cx = cv.getContext("2d");
    size();
    addEventListener("resize", size);
  }
  const mid = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width };
  };
  function burst(x, y, o = {}) {
    canvas();
    const n = o.count || 30,
      cols = o.colors;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2,
        sp = (o.speed || 5) * (0.35 + Math.random());
      parts.push({
        x: x + (Math.random() - 0.5) * (o.jitter || 0),
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - (o.lift || 0),
        life: 0,
        max: (o.life || 60) * (0.6 + Math.random() * 0.7),
        r: (o.size || 2.4) * (0.5 + Math.random()),
        c: cols[i % cols.length],
        g: o.gravity != null ? o.gravity : 0.08,
        shard: !!o.shard,
        rot: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * 0.35,
        drag: o.drag || 0.97,
      });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function tick() {
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      if (++p.life > p.max) {
        parts.splice(i, 1);
        continue;
      }
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      const t = 1 - p.life / p.max;
      cx.globalAlpha = Math.max(0, Math.min(1, t * 1.4));
      if (p.shard) {
        cx.globalCompositeOperation = "source-over";
        cx.save();
        cx.translate(p.x, p.y);
        cx.rotate(p.rot);
        cx.fillStyle = p.c;
        cx.beginPath();
        cx.moveTo(-p.r * 1.7, -p.r * 0.5);
        cx.lineTo(p.r * 1.3, -p.r * 1.1);
        cx.lineTo(p.r * 0.9, p.r * 1.3);
        cx.closePath();
        cx.fill();
        cx.fillStyle = "rgba(255,255,255,.18)";
        cx.beginPath();
        cx.moveTo(-p.r * 1.2, -p.r * 0.4);
        cx.lineTo(p.r * 0.6, -p.r * 0.8);
        cx.lineTo(0, 0);
        cx.closePath();
        cx.fill();
        cx.restore();
      } else {
        cx.globalCompositeOperation = "lighter";
        const rr = p.r * (2.2 + t),
          g = cx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rr);
        g.addColorStop(0, p.c);
        g.addColorStop(0.35, p.c);
        g.addColorStop(1, "rgba(0,0,0,0)");
        cx.fillStyle = g;
        cx.beginPath();
        cx.arc(p.x, p.y, rr, 0, 6.2832);
        cx.fill();
      }
    }
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = "source-over";
    if (parts.length) raf = requestAnimationFrame(tick);
    else {
      raf = 0;
      cx.clearRect(0, 0, innerWidth, innerHeight);
    }
  }
  const WAX = ["#b3131c", "#8f0f17", "#d22a33", "#5e0a0f", "#c41e27"],
    EMBER = ["#ffd27a", "#ff9a4a", "#ff5a3a"];
  function glow(el, delay) {
    if (el)
      el.animate(
        [
          { boxShadow: "0 0 0 0 rgba(179,19,28,0)" },
          { boxShadow: "0 0 60px 6px rgba(179,19,28,.55)", offset: 0.35 },
          { boxShadow: "0 0 0 0 rgba(179,19,28,0)" },
        ],
        { duration: 1600, delay, easing: "cubic-bezier(.16,1,.3,1)" }
      );
  }
  return {
    /* the seal shudders, bursts into shards and sparks, the card jolts, then glows red once it has turned */
    sealBreak(wax, inner, shade) {
      if (!ok()) return;
      const c = mid(wax),
        k = Math.max(0.7, c.w / 80);
      burst(c.x, c.y, {
        count: 34,
        colors: WAX,
        shard: true,
        speed: 7 * k,
        gravity: 0.3,
        life: 80,
        size: 3.6 * k,
        lift: 3,
        drag: 0.985,
      });
      burst(c.x, c.y, { count: 18, colors: EMBER, speed: 3.5 * k, life: 45, size: 1.8 });
      if (inner)
        inner.animate(
          [
            { translate: "0 0" },
            { translate: "-6px 0" },
            { translate: "5px 0" },
            { translate: "-2px 0" },
            { translate: "0 0" },
          ],
          { duration: 380, easing: "cubic-bezier(.65,0,.35,1)" }
        );
      glow(shade, 900);
    },
    /* a fresh blob of wax lands: a few crumbs fly */
    rewax(el) {
      if (!ok() || !el) return;
      const c = mid(el);
      burst(c.x, c.y, {
        count: 14,
        colors: WAX.slice(0, 2),
        speed: 2.5,
        life: 35,
        size: 2.2,
        shard: true,
        gravity: 0.15,
      });
    },
  };
})();
