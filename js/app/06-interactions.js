"use strict";
/* =====================================================================
   CLICKS: seals, covers, chips, filters
   ===================================================================== */
const twins = (el) => $$(`[data-seal="${CSS.escape(el.dataset.seal)}"]`).filter((x) => x !== el);
function syncTwins(el, open) {
  twins(el).forEach((x) => {
    x.classList.remove("rewax");
    if (x.classList.contains("sealbox")) paintBox(x, open, true);
    else {
      clearTimeout(x._wideT);
      x.classList.toggle("is-open", open);
      x.classList.toggle("instant", open);
      x.classList.toggle("wide", open);
      faces(x, open);
      stampLater(x, open, false);
    }
  });
}
function faces(card, open) {
  const f = card.querySelector(".face.front"),
    b = card.querySelector(".face.back");
  if (f) f.inert = open;
  if (b) b.inert = !open;
}
function stampLater(card, show, animate) {
  const later = card.querySelector("[data-later]");
  if (!later) return;
  later.hidden = !show;
  later.classList.toggle("stamp-now", show && animate);
  later.style.animationDelay = show && animate ? "1.45s" : "";
}
/* phones: an opened card spans the whole row (.wide in css). The size change waits
   until the wax has cracked, and the cards around it glide to their new places
   instead of jumping (record where everything was, change, animate from there) */
function reflow(card, wide) {
  if (card.classList.contains("wide") === wide) return;
  const kids = card.parentElement ? [...card.parentElement.children] : [card];
  const before = kids.map((k) => k.getBoundingClientRect());
  card.classList.toggle("wide", wide);
  if (reduced) return;
  kids.forEach((k, i) => {
    const a = before[i],
      b = k.getBoundingClientRect();
    if (!b.width || !b.height || !a.width) return;
    const dx = a.left - b.left,
      dy = a.top - b.top,
      sx = a.width / b.width,
      sy = a.height / b.height;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01)
      return;
    k.animate(
      [
        { transformOrigin: "0 0", transform: `translate(${dx}px,${dy}px) scale(${sx},${sy})` },
        { transformOrigin: "0 0", transform: "none" },
      ],
      { duration: 560, easing: "cubic-bezier(.2,.9,.25,1)" }
    );
  });
}
function crackSeal(card) {
  if (!card || card.classList.contains("is-open")) return;
  clearTimeout(card._wideT);
  card._wideT = setTimeout(() => reflow(card, true), reduced ? 0 : 600);
  const w = card.querySelector(".wax"),
    hadFocus = card.contains(document.activeElement);
  card.classList.remove("rewax");
  card.classList.add("is-open");
  faces(card, true);
  remember(card.dataset.seal);
  if (hadFocus) {
    const r = card.querySelector("[data-reseal]");
    if (r) r.focus({ preventScroll: true });
  }
  Sound.crack();
  setTimeout(() => Sound.flip(), reduced ? 0 : 620);
  if (card.querySelector("[data-later]")) {
    stampLater(card, true, true);
    if (!reduced) setTimeout(() => Sound.stamp(), 1500);
  }
  if (w) FX.sealBreak(w, card.querySelector(".inner"), card.querySelector(".shade"));
  syncTwins(card, true);
}
function resealCard(card) {
  if (!card || !card.classList.contains("is-open")) return;
  forget(card.dataset.seal);
  /* stay full width while it turns back and the fresh wax lands, then shrink */
  clearTimeout(card._wideT);
  card._wideT = setTimeout(() => reflow(card, false), reduced ? 0 : 1050);
  card.classList.remove("is-open", "instant");
  card.classList.add("rewax");
  faces(card, false);
  stampLater(card, false, false);
  const btn = card.querySelector("[data-crack]");
  if (btn) btn.focus({ preventScroll: true });
  syncTwins(card, false);
  const land = reduced ? 0 : 720;
  setTimeout(() => {
    Sound.reseal();
    const w = card.querySelector(".wax");
    if (w) FX.rewax(w);
  }, land);
  setTimeout(() => card.classList.remove("rewax"), 1600);
}
function paintBox(box, open, instant) {
  box.classList.toggle("is-open", open);
  box.classList.toggle("instant", open && instant);
  const row = box.querySelector("[data-break]"),
    body = box.querySelector(".seal-body"),
    first = row.querySelector(".seal-sub").textContent.replace(/^For | only$/g, "");
  body.hidden = !open;
  row.setAttribute("aria-expanded", String(open));
  row.querySelector(".seal-title").textContent = open ? "Seal it again" : "Break the seal";
  row.setAttribute(
    "aria-label",
    open ? `Seal ${first}'s fortune again` : `Break the seal on ${first}'s fortune`
  );
}
function breakBox(box) {
  if (box.classList.contains("is-open")) return resealBox(box);
  const w = box.querySelector(".wax");
  box.classList.remove("rewax");
  paintBox(box, true, false);
  remember(box.dataset.seal);
  Sound.crack();
  if (w) FX.sealBreak(w, null, box.querySelector(".seal-body"));
  syncTwins(box, true);
}
function resealBox(box) {
  forget(box.dataset.seal);
  paintBox(box, false, false);
  box.classList.add("rewax");
  syncTwins(box, false);
  setTimeout(
    () => {
      Sound.reseal();
      const w = box.querySelector(".wax");
      if (w) FX.rewax(w);
    },
    reduced ? 0 : 720
  );
  setTimeout(() => box.classList.remove("rewax"), 1600);
}
/* jump to the Tarokka reading, the quest board or the loose ends on the Quests tab */
function jumpTo(id) {
  closeSheet();
  go("quests", () => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  });
}
function gotoSession(n) {
  closeSheet();
  if (String(n) === LAST) {
    go("sessions");
    return;
  }
  go("sessions", () => {
    const c = $(`#v-sessions [data-seal="s${CSS.escape(String(n))}"]`);
    if (!c) return;
    c.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    setTimeout(() => crackSeal(c), reduced ? 0 : 550);
  });
}
document.addEventListener("click", (e) => {
  const t = e.target;
  const crack = t.closest("[data-crack]");
  if (crack) {
    crackSeal(crack.closest("[data-seal]"));
    return;
  }
  const brk = t.closest("[data-break]");
  if (brk) {
    breakBox(brk.closest(".sealbox"));
    return;
  }
  const rs = t.closest("[data-reseal]");
  if (rs) {
    const box = rs.closest("[data-seal]");
    resealCard(box);
    return;
  }
  const jp = t.closest("[data-jump]");
  if (jp) {
    e.preventDefault();
    const el = document.getElementById(jp.dataset.jump);
    if (el) el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    return;
  }
  const pcd = t.closest("[data-pcard]");
  if (pcd && !t.closest(".sealbox,button,a")) {
    openPc(pcd.dataset.pcard);
    return;
  }
  const fl = t.closest("[data-fortune]");
  if (fl) {
    e.preventDefault();
    const f = fl.dataset.fortune;
    jumpTo(["tarokka", "loose", "list"].includes(f) ? f : "list");
    return;
  }
  const dec = t.closest("[data-declass]");
  if (dec) {
    const p = dec.closest(".latest").querySelector(".summary");
    const on = p.classList.toggle("declassified");
    dec.setAttribute("aria-pressed", String(on));
    dec.querySelector("span").textContent = on ? "Hide the details" : "Reveal the details";
    Sound.slash();
    return;
  }
  const npc = t.closest("[data-npc]");
  if (npc) {
    e.preventDefault();
    if (modal.classList.contains("on")) closeSheet();
    openNpc(npc.dataset.npc);
    return;
  }
  const pc = t.closest("[data-pc]");
  if (pc) {
    openPc(pc.dataset.pc);
    return;
  }
  const pl = t.closest("[data-place]:not(.pin)");
  if (pl) {
    e.preventDefault();
    if (modal.classList.contains("on")) closeSheet();
    openPlace(pl.dataset.place);
    return;
  }
  const ss = t.closest("[data-session]");
  if (ss) {
    gotoSession(ss.dataset.session);
    return;
  }
  const qn = t.closest("[data-qnote]");
  if (qn) {
    const li = qn.closest(".qnote"),
      on = li.classList.toggle("open");
    qn.setAttribute("aria-expanded", String(on));
    Sound.tick();
    return;
  }
  const nf = t.closest("[data-nf]");
  if (nf) {
    npcFilter = nf.dataset.nf;
    renderNpcs();
    Sound.tick();
    $("#v-npcs [data-nf='" + npcFilter + "']").focus();
    return;
  }
  const qf = t.closest("[data-qf]");
  if (qf) {
    questFilter = qf.dataset.qf;
    renderQuestList();
    Sound.tick();
    $("#v-quests [data-qf='" + questFilter + "']").focus();
    return;
  }
});

/* =====================================================================
   NAVIGATION
   ===================================================================== */
const VIEWS = ["home", "sessions", "npcs", "locations", "quests"];
const OLD = { chronicle: "sessions", souls: "npcs", places: "locations", fortunes: "quests" };
let current = null;
function go(v, after) {
  if (location.hash === "#" + v) {
    show(v, true, after);
  } else {
    pendingAfter = after || null;
    location.hash = v;
  }
}
let pendingAfter = null;
function show(v, fx = true, after) {
  v = OLD[v] || v;
  if (!VIEWS.includes(v)) v = "home";
  const changed = v !== current;
  if (changed) {
    current = v;
    VIEWS.forEach((k) => $("#v-" + k).classList.toggle("on", k === v));
    $$("#nav a").forEach((a) =>
      a.toggleAttribute("aria-current", a.getAttribute("href") === "#" + v)
    );
    $$("#nav a[aria-current]").forEach((a) => a.setAttribute("aria-current", "page"));
    if (fx && !reduced) {
      const c = $("#cut");
      c.classList.remove("go");
      void c.offsetWidth;
      c.classList.add("go");
    }
    if (fx) Sound.page();
    /* the new page's first section rises and inks in, like the landing page */
    if (fx && !reduced && v !== "home") {
      $$(".entering").forEach((x) => x.classList.remove("entering"));
      const view = $("#v-" + v),
        first = view.querySelector(".section");
      if (first) {
        const mark = [first];
        const nx = first.nextElementSibling;
        if (first.offsetHeight < innerHeight * 0.6 && nx && nx.classList.contains("section"))
          mark.push(nx);
        mark.forEach((x, i) => {
          x.style.setProperty("--ed", (i * 0.18).toFixed(2) + "s");
          x.classList.add("entering");
        });
        setTimeout(() => mark.forEach((x) => x.classList.remove("entering")), 1800);
      }
    }
    scrollTo({ top: 0, behavior: "auto" });
    if (v === "locations" && mapMode === "map") enterMap();
  }
  requestAnimationFrame(() => {
    SX.scan();
    if (changed) Deal.prep();
    if (v === "home") fitPhotos();
  });
  if (after) requestAnimationFrame(() => requestAnimationFrame(after));
}
addEventListener("hashchange", () => {
  const a = pendingAfter;
  pendingAfter = null;
  show(location.hash.slice(1) || "home", true, a);
});
const toTop = $("#toTop");
addEventListener(
  "scroll",
  () => {
    toTop.classList.toggle("on", scrollY > 900);
  },
  { passive: true }
);
toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }));
