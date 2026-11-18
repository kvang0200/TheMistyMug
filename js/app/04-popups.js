"use strict";
/* =====================================================================
   POP-UP SHEETS
   ===================================================================== */
const modal = $("#modal");
let lastFocus = null,
  stampTimer = null,
  closeT = 0;
function nameLines(name) {
  const w = String(name).split(" ");
  const last = w.length > 1 ? w.pop() : "";
  return `<span class="ln">${letters(w.join(" "), 0.85, 0.05)}</span>${last ? `<span class="ln it">${letters(last, 1.05, 0.05)}</span>` : ""}`;
}
/* ---------- pop-up entrances, one per kind of file ----------
   npc: a Tarokka card flips and bursts into the file · pc: a "roll for initiative" cut-in
   place: a portcullis slams down and lifts. (The character sheet slides in through shards.) */
const toRoman = (n) => {
  const t = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let r = "";
  for (const [v, c] of t)
    while (n >= v) {
      r += c;
      n -= v;
    }
  return r;
};
let fxTimers = [];
function fxLayer(kind, name, o) {
  const initial = String(name || "")
    .replace(/^(the|lady|father|madam|sir|headmistress|baron|baroness)\s+/i, "")
    .trim()
    .charAt(0);
  if (kind === "init")
    return `<div class="fx" aria-hidden="true"><i class="fx-lines"></i>
    <div class="fx-band"><span class="fx-die">${CSI.d20}</span><span class="fx-txt"><span class="fx-nm">${esc(name)}</span><span class="fx-tag">Roll for initiative${o.tag ? ` · ${esc(o.tag)}` : ""}</span></span></div><i class="fx-flash"></i></div>`;
  if (kind === "gate")
    return `<div class="fx" aria-hidden="true"><div class="fx-gate">${Array.from({ length: 9 }, (_, k) => `<i class="bar" style="--k:${k}"></i>`).join("")}<i class="cross c1"></i><i class="cross c2"></i></div><i class="fx-dust"></i></div>`;
  return `<div class="fx" aria-hidden="true"><i class="fx-bandt"></i><i class="fx-bandb"></i>
    <div class="fx-tk"><div class="fx-tkin">
      <div class="tk-back"><span class="rn">${o.no ? toRoman(Math.min(o.no, 39)) : ""}</span><svg viewBox="0 0 40 40"><path d="M27 6a15 15 0 1 0 0 28A12 12 0 1 1 27 6z"/><circle cx="20" cy="20" r="18.5"/></svg><span class="nm">Tarokka</span></div>
      <div class="tk-front"><span class="rn">${o.no ? toRoman(Math.min(o.no, 39)) : ""}</span><span class="ini">${esc(initial)}</span><span class="nm">${esc(name)}</span>${o.tag ? `<span class="tk-tag">${esc(o.tag)}</span>` : ""}</div>
    </div></div></div>`;
}
function fxSounds(kind) {
  fxTimers.forEach(clearTimeout);
  fxTimers = [];
  if (reduced) return;
  const at = (ms, f) => fxTimers.push(setTimeout(f, ms));
  if (kind === "init") {
    Sound.slash();
    at(200, () => Sound.dice());
    at(720, () => Sound.drum());
  } else if (kind === "gate") {
    Sound.chains();
    at(380, () => Sound.clang());
    at(640, () => Sound.winch());
  } else {
    at(90, () => Sound.cardRiffle());
    at(470, () => Sound.cardSnap());
    at(860, () => Sound.cardBurst());
  }
}
function openSheet({ tab, photo, kicker, name, epi, body, stamp, fx }) {
  lastFocus = document.activeElement;
  clearTimeout(closeT);
  modal.classList.remove("out");
  const kind = (fx && fx.kind) || "card";
  modal.dataset.fx = kind;
  modal.innerHTML = `${fxLayer(kind, name, fx || {})}<div class="mist" aria-hidden="true"></div>
  <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetName"><div class="shade"></div><div class="parch" aria-hidden="true"></div>
    <span class="label tab" style="color:var(--ink-muted)">${tab}</span>
    <div class="photo"><span class="tape" aria-hidden="true"></span><div class="frame">${photo}</div></div>
    <div class="body">
      <button type="button" class="close" data-close aria-label="Close">${ICON.close}</button>
      <span class="label dot kicker snap" style="animation-delay:.8s">${kicker}</span>
      <h2 id="sheetName" aria-label="${esc(name)}">${nameLines(name)}</h2>
      ${epi ? `<p class="epi snap" style="animation-delay:1.35s">${esc(epi)}</p>` : ""}
      ${body}
      ${stamp ? `<span class="stamp ${stamp.tone} stamp-now" aria-hidden="true" style="animation-delay:1.5s">${stamp.text}</span>` : ""}
    </div>
  </div>`;
  modal.classList.add("on");
  modal.setAttribute("aria-hidden", "false");
  document.documentElement.style.overflow = "hidden";
  Sound.open();
  fxSounds(kind);
  clearTimeout(stampTimer);
  if (stamp && !reduced) stampTimer = setTimeout(() => Sound.stamp(), 1550);
  const c = modal.querySelector("[data-close]");
  if (c) c.focus({ preventScroll: true });
}
/* the Persona-style exit: two bands slash across and shards fly (see EXITS in css/07-popup-effects.css) */
const EXIT_FX = `<div class="fx-out" aria-hidden="true"><i class="o-line"></i><i class="o-red"></i><i class="o-blk"></i><i class="o-sh" style="--x:-34vw;--y:-30vh;--r:-200deg"></i><i class="o-sh s2" style="--x:30vw;--y:-22vh;--r:160deg"></i><i class="o-sh s3" style="--x:22vw;--y:30vh;--r:-120deg"></i></div>`;
function closeSheet() {
  if (!modal.classList.contains("on") || modal.classList.contains("out")) return;
  closeCS(true);
  clearTimeout(stampTimer);
  fxTimers.forEach(clearTimeout);
  fxTimers = [];
  modal.setAttribute("aria-hidden", "true");
  /* the file drops out of frame before it's cleared; opening another one cancels this */
  const done = () => {
    modal.classList.remove("on", "out");
    modal.innerHTML = "";
  };
  if (reduced) done();
  else {
    modal.insertAdjacentHTML("beforeend", EXIT_FX);
    modal.classList.add("out");
    clearTimeout(closeT);
    closeT = setTimeout(done, 720);
    fxTimers.push(setTimeout(() => Sound.slash(0.26), 110));
    if (modal.dataset.fx === "gate") {
      Sound.chains(0.22, 0.7);
      fxTimers.push(setTimeout(() => Sound.clang(), 250));
    }
  }
  document.documentElement.style.overflow = "";
  Sound.close();
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
}
const factList = (items, start = 1.7) =>
  `<ol>${items.map((t, i) => `<li class="snap" style="animation-delay:${(start + i * 0.08).toFixed(2)}s"><span class="n">${i + 1}</span><span>${esc(t)}</span></li>`).join("")}</ol>`;
const sessionChips = (list) =>
  list.length
    ? `<div class="chips-row snap" style="animation-delay:2.2s"><span class="label" style="color:var(--ink-muted);margin-right:calc(6 * var(--u))">Appears in sessions</span>${list.map((s) => `<button type="button" class="chip" data-session="${esc(s.n)}">Session ${esc(s.n)}</button>`).join("")}</div>`
    : "";
const portraitFrame = (n) =>
  `${sil(n)}<div class="glowdot glow" aria-hidden="true"></div><span class="label cap">Portrait</span>`;
/* ---------- NPC character sheet (laid out like the D&D 2024 character sheet) ----------
   Filled from an NPC's `sheet` in data.js. Modifiers, saves, skills, initiative and passive
   Perception are worked out from the ability scores, so only scores and proficiencies are entered.
   Anything left out shows a dash. */
const ABIL = [
  ["str", "Strength", ["Athletics"]],
  ["dex", "Dexterity", ["Acrobatics", "Sleight of Hand", "Stealth"]],
  ["con", "Constitution", []],
  ["int", "Intelligence", ["Arcana", "History", "Investigation", "Nature", "Religion"]],
  ["wis", "Wisdom", ["Animal Handling", "Insight", "Medicine", "Perception", "Survival"]],
  ["cha", "Charisma", ["Deception", "Intimidation", "Performance", "Persuasion"]],
];
/* small line icons for the sheet, so each stat reads at a glance */
const CSI = (() => {
  const g = (b) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${b}</svg>`;
  return {
    ac: g('<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8 7.5 9.5 4.3-1.5 7.5-4.9 7.5-9.5V6z"/>'),
    hp: g(
      '<path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z"/>'
    ),
    init: g('<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6z"/>'),
    speed: g('<path d="M5 6l6 6-6 6M12 6l6 6-6 6"/>'),
    pb: g('<path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>'),
    pp: g(
      '<path d="M2.5 12C6 6.5 18 6.5 21.5 12 18 17.5 6 17.5 2.5 12z"/><circle cx="12" cy="12" r="3"/>'
    ),
    str: g('<path d="M6.5 7.5v9M3.5 9.5v5M17.5 7.5v9M20.5 9.5v5M6.5 12h11"/>'),
    dex: g(
      '<path d="M19.5 4.5C12 4.5 6.5 9 5.5 18.5L4 20"/><path d="M19.5 4.5c0 7-4.5 12-11.5 13M9 11.5h6M7.5 15h4.5"/>'
    ),
    con: g(
      '<path d="M12 21c-4 0-6.5-2.6-6.5-6 0-4 3.5-5.5 4-10 2.5 1.5 3.5 4 3 6.5 1-1 1.7-2.2 2-3.5 2 2 4 4.2 4 7 0 3.4-2.5 6-6.5 6z"/>'
    ),
    int: g(
      '<path d="M12 6.5C10 5 6.5 4.5 3.5 5v13c3-.5 6.5 0 8.5 1.5 2-1.5 5.5-2 8.5-1.5V5c-3-.5-6.5 0-8.5 1.5zM12 6.5v13"/>'
    ),
    wis: g('<path d="M19 14.5A8 8 0 0 1 9.5 5a8 8 0 1 0 9.5 9.5z"/><path d="M16.5 3.5v3M15 5h3"/>'),
    cha: g('<path d="M3.5 8.5 7 15.5h10l3.5-7-5 3L12 5l-3.5 6.5z"/><path d="M7 18.5h10"/>'),
    sword: g('<path d="M14.5 4.5h5v5L10 19l-5-5z"/><path d="m3.5 15.5 5 5M5 20l-1.5 1.5"/>'),
    fire: g(
      '<path d="M12 21.5c-4 0-6.5-2.5-6.5-6 0-3.8 3.4-5.6 4-10 2.4 1.6 3.6 4 3.1 6.6 1-.9 1.8-2.1 2.1-3.4 2.1 1.8 3.8 4.3 3.8 6.8 0 3.5-2.5 6-6.5 6z"/><path d="M12 21.5c-1.7 0-2.8-1.1-2.8-2.6 0-1.7 1.4-2.4 1.7-4.3 1.7 1 2.7 2.4 2.7 4 0 1.6-.9 2.9-1.6 2.9z"/>'
    ),
    hand: g(
      '<path d="M8 12.5V5.5a1.5 1.5 0 0 1 3 0v6M11 11V4a1.5 1.5 0 0 1 3 0v7M14 11V5.5a1.5 1.5 0 0 1 3 0V13M8 12.5 6.6 11a1.6 1.6 0 0 0-2.4 2.1L8 18.5c1.2 1.6 2.8 2.5 5 2.5 2.4 0 4-1.8 4-4.5V13"/>'
    ),
    smite: g(
      '<circle cx="12" cy="12" r="3.5"/><path d="M12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4M5.3 5.3l2.8 2.8M15.9 15.9l2.8 2.8M18.7 5.3l-2.8 2.8M8.1 15.9l-2.8 2.8"/>'
    ),
    d20: g(
      '<path d="M12 2.5 20.5 7.5v9L12 21.5 3.5 16.5v-9z"/><path d="M12 2.5 7.5 9.5h9zM7.5 9.5 3.5 16.5M16.5 9.5l4 7M7.5 9.5 12 21.5l4.5-12M3.5 7.5l4 2M20.5 7.5l-4 2"/>'
    ),
    shieldup: g(
      '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8 7.5 9.5 4.3-1.5 7.5-4.9 7.5-9.5V6z"/><path d="m9 12 2 2 4-4"/>'
    ),
  };
})();
const ABIL_TAG = {
  str: "Power",
  dex: "Agility",
  con: "Endurance",
  int: "Reasoning",
  wis: "Awareness",
  cha: "Presence",
};
const sgn = (n) => (n == null || isNaN(n) ? "—" : (n >= 0 ? "+" : "−") + Math.abs(n));
function npcSheet(n, t0 = 1.75) {
  const S = n.sheet;
  if (!S) return "";
  const A = S.abil || {},
    has = (v) => v != null && v !== "";
  const mod = (k) => (has(A[k]) ? Math.floor((+A[k] - 10) / 2) : null);
  const pb = has(S.pb) ? +S.pb : has(S.lvl) ? 2 + Math.floor((+S.lvl - 1) / 4) : null;
  const lower = (a) => (a || []).map((x) => String(x).toLowerCase());
  const saves = lower(S.saves),
    skills = lower(S.skills),
    expert = lower(S.expert);
  const bonus = (m, prof, ex) => (m == null ? null : m + (prof ? (pb || 0) * (ex ? 2 : 1) : 0));
  const skill = (name) => {
    const k = name.toLowerCase(),
      ab = ABIL.find((a) => a[2].includes(name))[0];
    return {
      p: skills.includes(k) || expert.includes(k),
      e: expert.includes(k),
      v: bonus(mod(ab), skills.includes(k) || expert.includes(k), expert.includes(k)),
    };
  };
  const per = skill("Perception");
  const pp = has(S.pp) ? S.pp : per.v == null ? null : 10 + per.v;
  const init = has(S.init) ? S.init : sgn(mod("dex"));
  const rb = (label, b, inner) =>
    b == null
      ? inner
      : `<button type="button" class="cs-roll" data-roll="chk" data-label="${esc(label)}" data-b="${b}" aria-label="Roll ${esc(label)} (${sgn(b)})">${inner}</button>`;
  const initB = has(S.init) ? parseInt(String(S.init).replace("−", "-"), 10) : mod("dex");
  const dot = (on, ex) =>
    `<i class="pdot${on ? " on" : ""}${ex ? " ex" : ""}" aria-hidden="true"></i>`;
  const box = (k, v, ic, cls, i) => {
    const roll = ic === "init" && initB != null && !isNaN(initB),
      tag = roll ? "button" : "div";
    return `<${tag}${roll ? ` type="button" data-roll="chk" data-label="Initiative" data-b="${initB}" aria-label="Roll initiative (${sgn(initB)})"` : ""} class="cs-box ${cls || ""}${roll ? " rollable" : ""}" style="--i:${i}"><span class="ic">${CSI[ic]}</span><span class="v">${esc(has(v) ? v : "—")}</span><span class="k">${k}</span>${roll ? `<span class="rolltag">${CSI.d20}</span>` : ""}</${tag}>`;
  };
  const line = [S.sp, S.cl ? S.cl + (has(S.lvl) ? " " + S.lvl : "") : null, S.size]
    .filter(Boolean)
    .map(esc)
    .join(" · ");
  const abil = ABIL.map(([k, name, sk]) => {
    const m = mod(k),
      sv = bonus(m, saves.includes(k));
    return `<div class="cs-ab ab-${k}${has(A[k]) && +A[k] >= 15 ? " hi" : ""}" style="--i:${ABIL.findIndex((a) => a[0] === k)};--fill:${has(A[k]) ? Math.max(0, Math.min(1, +A[k] / 20)) : 0}"><span class="ab-ic">${CSI[k]}</span><span class="nm">${name}<small>${ABIL_TAG[k]}</small></span><span class="md">${sgn(m)}</span><span class="sc">${has(A[k]) ? esc(A[k]) : "—"}</span><span class="meter" aria-hidden="true"><i></i></span>
      ${(() => {
        const pr = saves.includes(k),
          inner = `<span class="si">${CSI.ac}</span><span class="st">Saving throw${pr ? `<i>Proficient</i>` : ""}</span><span class="sb">${sgn(sv)}</span>`;
        return sv == null
          ? `<div class="cs-save${pr ? " prof" : ""}">${inner}</div>`
          : `<button type="button" class="cs-save${pr ? " prof" : ""}" data-roll="chk" data-label="${esc(name)} saving throw" data-b="${sv}" aria-label="Roll ${esc(name)} saving throw (${sgn(sv)})">${inner}</button>`;
      })()}
      ${
        sk.length
          ? `<ul>${sk
              .map((s) => {
                const x = skill(s);
                return `<li>${rb(`${s} check`, x.v, `${dot(x.p, x.e)}<span>${sgn(x.v)}</span>${s}`)}</li>`;
              })
              .join("")}</ul>`
          : ""
      }</div>`;
  }).join("");
  const list = (title, items, fn) =>
    items && items.length
      ? `<div class="cs-sec cs-in" style="--d:6"><h4>${title}</h4>${items.map(fn).join("")}</div>`
      : "";
  const atk = (S.attacks || []).length
    ? `<div class="cs-sec cs-in" style="--d:5"><h4>Weapons &amp; Damage Cantrips</h4><table class="cs-atk"><thead><tr><th>Name</th><th>Atk / DC</th><th>Damage &amp; Type</th><th>Notes</th></tr></thead><tbody>${S.attacks.map((a) => `<tr><td>${esc(a.n)}</td><td>${esc(a.hit || "—")}</td><td>${esc(a.dmg || "—")}</td><td>${esc(a.note || "")}</td></tr>`).join("")}</tbody></table></div>`
    : "";
  const sp = S.spells,
    spell =
      sp && (sp.list || []).length
        ? `<div class="cs-sec cs-in" style="--d:7"><h4>Spellcasting${sp.ability ? ` · ${esc(sp.ability)}` : ""}${sp.dc ? ` · Save DC ${esc(sp.dc)}` : ""}${sp.atk ? ` · Attack ${esc(sp.atk)}` : ""}</h4>${sp.list.map((l) => `<p class="cs-p"><b>${esc(l.lvl)}.</b> ${esc((l.s || []).join(", ") || "—")}</p>`).join("")}</div>`
        : "";
  const ACT = {
    action: ["Action", "Pick one on her turn"],
    bonus: ["Bonus Action", "Can add one on top"],
    reaction: ["Reaction", "On someone else's turn"],
  };
  const acts = S.actions || [];
  const battle = acts.length
    ? `<div class="cs-battle cs-in" style="--d:2"><h4>In battle · on her turn</h4>${Object.keys(ACT)
        .filter((t) => acts.some((a) => a.t === t))
        .map(
          (t) =>
            `<div class="cs-acts t-${t}"><div class="cs-acthead"><span class="tag">${ACT[t][0]}</span><span class="hint">${ACT[t][1]}</span></div><div class="cs-actrow">${acts
              .filter((a) => a.t === t)
              .map((a, i) => {
                const r = !!(a.hit || a.dmg),
                  tag = r ? "button" : "div";
                return `<${tag}${r ? ` type="button" data-roll="act" data-i="${acts.indexOf(a)}" aria-label="Roll ${esc(a.n)}"` : ""} class="cs-act${r ? " rollable" : ""}" style="--i:${i}">
      <span class="ai">${CSI[a.ic] || CSI.sword}</span>
      <div class="ab"><span class="an">${esc(a.n)}</span>
        <span class="chips2">${[
          a.hit ? `<b>${esc(a.hit)}</b> to hit` : "",
          a.dmg ? `<b>${esc(a.dmg)}</b>` : "",
          a.range ? esc(a.range) : "",
          a.uses ? `<i class="uses">${esc(a.uses)}</i>` : "",
        ]
          .filter(Boolean)
          .map((x) => `<span>${x}</span>`)
          .join("")}</span>
        ${a.p ? `<span class="ap">${esc(a.p)}</span>` : ""}${a.from ? `<span class="af">${esc(a.from)}</span>` : ""}${r ? `<span class="rollhint">${CSI.d20}<span>${a.hit ? "Roll attack" : "Roll damage"}</span></span>` : ""}</div></${tag}>`;
              })
              .join("")}</div></div>`
        )
        .join("")}</div>`
    : "";
  const L = S.lessons || [],
    learned = L.filter((l) => !l.sealed).length;
  const lessons = L.length
    ? `<div class="cs-sec cs-in" style="--d:7"><h4>Lessons · ${learned} of ${L.length} learned</h4><div class="cs-lessons">${L.map(
        (l, i) =>
          l.sealed
            ? `<div class="cs-lesson sealed" style="--i:${i}">${wax("key", 46)}<span class="label">Lesson · Sealed</span></div>`
            : `<div class="cs-lesson" style="--i:${i}"><span class="label">Taught by ${esc(l.from)}</span><span class="t">${esc(l.n)}</span><p>${esc(l.p)}</p></div>`
      ).join("")}</div></div>`
    : "";
  const tops = [
    ["Armor Class", S.ac, "ac", "shield"],
    ["Hit Points", S.hp, "hp", "heart"],
    ["Initiative", init, "init"],
    ["Speed", S.speed, "speed"],
    ["Prof. Bonus", pb == null ? null : sgn(pb), "pb"],
    ["Passive Perception", pp, "pp"],
  ];
  return `${line ? `<p class="cs-line cs-in" style="--d:0">${line}</p>` : ""}
    <div class="cs-top">${tops.map(([k, v, ic, c], i) => box(k, v, ic, c, i)).join("")}</div>
    ${battle}
    <p class="cs-legend cs-in" style="--d:3"><span><i class="pdot on"></i>Proficient</span><span><i class="pdot ex"></i>Expertise</span><span><i class="meter-key"></i>Score out of 20</span><span class="tap">${CSI.d20}Tap a bonus or card to roll</span></p>
    <div class="cs-abils">${abil}</div>
    ${S.senses || (S.langs || []).length ? `<dl class="dl cs-dl cs-in" style="--d:5">${S.senses ? `<dt>Senses</dt><dd>${esc(S.senses)}</dd>` : ""}${(S.langs || []).length ? `<dt>Languages</dt><dd>${esc(S.langs.join(", "))}</dd>` : ""}</dl>` : ""}
    ${atk}
    ${list("Features &amp; Traits", S.traits, (f) => `<p class="cs-p">${f.n ? `<b>${esc(f.n)}.</b> ` : ""}${esc(f.p || "")}</p>`)}
    ${lessons}
    ${spell}
    ${list("Equipment", S.gear, (g) => `<p class="cs-p">${esc(g)}</p>`)}`;
}
function openNpc(id) {
  const n = npcById[id];
  if (!n) return;
  const st = standing(n);
  openSheet({
    fx: { kind: "card", no: D.npcs.indexOf(n) + 1, tag: standing(n).label },
    tab: `NPC · ${esc(n.name.toUpperCase())}`,
    photo: portraitFrame(n),
    kicker: `${esc(st.label.toUpperCase())} · ${n.met && n.met !== "—" ? "FIRST MET IN " + esc(metLabel(n.met).toUpperCase()) : "NOT YET MET"}`,
    name: n.name,
    epi: n.epi,
    stamp: { text: st.stamp, tone: st.tone },
    body: `${n.d ? `<p class="lede snap" style="animation-delay:1.4s">${esc(n.d)}</p>` : ""}<dl class="dl snap" style="animation-delay:1.45s"><dt>Status</dt><dd>${statusWord(n)}</dd><dt>Last seen</dt><dd>${esc(where(n))}</dd></dl>
      ${n.sheet ? `<div class="snap" style="animation-delay:1.5s"><button type="button" class="btn dark cs-open" data-sheet="${esc(n.id)}"><span>Character sheet</span>${ICON.arrow}</button></div>` : ""}
      ${n.facts && n.facts.length ? `<h3 class="snap" style="animation-delay:1.6s">WHAT THE PARTY KNOWS</h3>${factList(n.facts)}` : ""}
      ${sessionChips(sessionsWith(n.id))}`,
  });
}
function openPc(id) {
  const p = pcById[id];
  if (!p) return;
  const v = visionFor(p.n);
  const row = (k, x) => (x == null || x === "" ? "" : `<dt>${k}</dt><dd>${esc(x)}</dd>`);
  openSheet({
    fx: { kind: "init", tag: `${p.cl} · Level ${D.level}` },
    tab: `PLAYER CHARACTER · LEVEL ${esc(D.level)}`,
    photo: portraitFrame({ ...p, name: p.n }),
    kicker: `${esc(p.sp.toUpperCase())} · ${esc(p.cl.toUpperCase())}`,
    name: p.n,
    epi: "",
    stamp: { text: "THE PARTY", tone: "ink" },
    body: `${p.d ? `<p class="lede snap" style="animation-delay:1.4s">${esc(p.d)}</p>` : ""}<dl class="dl snap" style="animation-delay:1.45s">${row("Armor Class", p.ac + (p.acx ? ` (${p.acx})` : ""))}${row("Hit Points", p.hp)}${row("Passive Perception", p.pp)}${row("Passive Insight", p.pi)}${row("Save DC", p.dc)}${row("Languages", (p.langs || []).join(", "))}</dl>
      ${p.notes && p.notes.length ? `<h3 class="snap" style="animation-delay:1.6s">NOTES</h3>${factList(p.notes)}` : ""}
      ${v ? `<h3 class="snap" style="animation-delay:2.1s">PERSONAL FORTUNE</h3><div class="snap" style="animation-delay:2.2s">${sealBox("f-" + slug(p.n), p.n, fortuneText(v))}</div>` : ""}`,
  });
}
function pinFor(p) {
  return PINS.find((x) => x.key === p.n) || PINS.find((x) => (x.places || []).includes(p.n));
}
function openPlace(name) {
  const p = placeByName[name];
  if (!p) return;
  const pin = pinFor(p),
    visited = p.s && p.s !== "—";
  const photo = pin
    ? `<div class="mapcrop" role="img" aria-label="Map around ${esc(p.n)}" style="background-image:url(img/barovia-map-1000.webp);background-size:calc(1000 * var(--u)) auto;background-position:calc(50% - ${(+pin.x * 0.5 - 500).toFixed(0)} * var(--u)) calc(50% - ${(+pin.y * 0.5 - 341).toFixed(0)} * var(--u))"></div><span class="label cap" style="color:var(--s);background:var(--p);padding:calc(3 * var(--u)) calc(8 * var(--u))">On the map</span>`
    : `${sil({ name: p.n })}<span class="label cap">Not on the map yet</span>`;
  const inside =
    pin && pin.key === p.n && pin.places
      ? pin.places.map((n) => placeByName[n]).filter(Boolean)
      : [];
  openSheet({
    fx: { kind: "gate" },
    tab: `LOCATION · ${esc(p.r.toUpperCase())}`,
    photo,
    kicker: visited
      ? `VISITED · ${esc(metLabel(p.s).toUpperCase())}`
      : "HEARD OF · NOT VISITED YET",
    name: p.n,
    epi: p.r,
    stamp: { text: visited ? "VISITED" : "NOT VISITED", tone: visited ? "ink" : "red" },
    body: `<h3 class="snap" style="animation-delay:1.5s">WHAT WE KNOW</h3><p class="text snap" style="animation-delay:1.6s">${esc(p.p)}</p>
      ${inside.length ? `<h3 class="snap" style="animation-delay:1.8s">PLACES HERE</h3><div class="chips snap" style="margin-top:calc(10 * var(--u));animation-delay:1.9s">${inside.map((q) => `<button type="button" class="chip" data-place="${esc(q.n)}">${esc(q.n)}</button>`).join("")}</div>` : ""}
      ${visited ? `<div class="chips-row snap" style="animation-delay:2.1s"><span class="label" style="color:var(--ink-muted);margin-right:calc(6 * var(--u))">First visited</span><button type="button" class="chip" data-session="${esc(p.s)}">Session ${esc(p.s)}</button></div>` : ""}`,
  });
}
/* ---------- the character sheet pop-up: stacks over the NPC pop-up with a Persona-style slam ---------- */
const csModal = $("#csModal");
let csFrom = null,
  csTimer = null,
  csNpc = null;
const csOn = () => csModal.classList.contains("on");
function openCS(id) {
  const n = npcById[id];
  if (!n || !n.sheet) return;
  clearTimeout(csTimer);
  csFrom = document.activeElement;
  csNpc = n;
  csModal.innerHTML = `<div class="cs-shards" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
  <div class="cs-card" role="dialog" aria-modal="true" aria-labelledby="csName">
    <div class="cs-ink" aria-hidden="true"></div><div class="cs-red" aria-hidden="true"></div><div class="cs-paper parch" aria-hidden="true"></div>
    <div class="cs-head">
      <span class="label cs-kick">Character sheet · ${esc(standing(n).label)}</span>
      <h2 id="csName" aria-label="${esc(n.name)}">${nameLines(n.name)}</h2>
      <button type="button" class="close" data-csclose aria-label="Close the character sheet">${ICON.close}</button>
    </div>
    <div class="cs-scroll">${npcSheet(n)}</div>
  </div>`;
  csModal.classList.remove("out");
  csModal.classList.add("on");
  csModal.setAttribute("aria-hidden", "false");
  modal.classList.add("behind");
  $(".sheet", modal)?.setAttribute("aria-hidden", "true");
  Sound.slash();
  if (!reduced) setTimeout(() => Sound.stamp(), 380);
  csModal.querySelector("[data-csclose]").focus({ preventScroll: true });
}
function closeCS(instant) {
  if (!csOn()) return;
  closeDice(true);
  clearTimeout(csTimer);
  const done = () => {
    csModal.classList.remove("on", "out");
    csModal.innerHTML = "";
    csModal.setAttribute("aria-hidden", "true");
  };
  modal.classList.remove("behind");
  $(".sheet", modal)?.removeAttribute("aria-hidden");
  if (instant || reduced) done();
  else {
    csModal.classList.add("out");
    csTimer = setTimeout(done, 420);
    Sound.close();
  }
  if (!instant && csFrom && document.contains(csFrom)) csFrom.focus({ preventScroll: true });
}
csModal.addEventListener("click", (e) => {
  const r = e.target.closest("[data-roll]");
  if (r) {
    rollFrom(r);
    return;
  }
  if (e.target === csModal || e.target.closest(".cs-shards") || e.target.closest("[data-csclose]"))
    closeCS();
});
