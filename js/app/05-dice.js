"use strict";
/* =====================================================================
   DICE: a real 3D d20 (twenty CSS triangles placed with matrix3d), thrown
   with a tumble that settles on the rolled face. Damage dice show as tokens.
   ===================================================================== */
const tray = document.createElement("div");
tray.className = "dice-tray";
tray.id = "diceTray";
tray.setAttribute("aria-hidden", "true");
document.body.appendChild(tray);
const diceOn = () => tray.classList.contains("on");
let diceFrom = null,
  diceRAF = 0,
  diceT = 0,
  lastRoll = null;
const rnd = (n) => {
  try {
    const a = new Uint32Array(1),
      lim = Math.floor(4294967296 / n) * n;
    do {
      crypto.getRandomValues(a);
    } while (a[0] >= lim);
    return 1 + (a[0] % n);
  } catch (e) {
    return 1 + Math.floor(Math.random() * n);
  }
};
const D20 = (() => {
  const P = (1 + Math.sqrt(5)) / 2;
  const V = [
    [-1, P, 0],
    [1, P, 0],
    [-1, -P, 0],
    [1, -P, 0],
    [0, -1, P],
    [0, 1, P],
    [0, -1, -P],
    [0, 1, -P],
    [P, 0, -1],
    [P, 0, 1],
    [-P, 0, -1],
    [-P, 0, 1],
  ];
  const sub = (a, b) => a.map((x, i) => x - b[i]),
    add = (a, b) => a.map((x, i) => x + b[i]),
    mul = (a, k) => a.map((x) => x * k);
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
    len = (a) => Math.sqrt(dot(a, a)),
    norm = (a) => mul(a, 1 / len(a));
  const cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
  const F = [];
  for (let i = 0; i < 12; i++)
    for (let j = i + 1; j < 12; j++)
      for (let k = j + 1; k < 12; k++)
        if (
          Math.abs(len(sub(V[i], V[j])) - 2) < 1e-6 &&
          Math.abs(len(sub(V[i], V[k])) - 2) < 1e-6 &&
          Math.abs(len(sub(V[j], V[k])) - 2) < 1e-6
        ) {
          let v0 = V[i],
            v1 = V[j],
            v2 = V[k];
          const c = mul(add(add(v0, v1), v2), 1 / 3),
            n = norm(c);
          let A = norm(sub(v2, v1)),
            B = norm(sub(mul(add(v1, v2), 0.5), v0));
          if (dot(cross(A, B), n) < 0) {
            [v1, v2] = [v2, v1];
            A = norm(sub(v2, v1));
          }
          F.push({ v0, v1, v2, c, n, A, B });
        }
  /* opposite faces add up to 21, like a real d20 */
  let next = 1;
  F.forEach((f) => {
    if (f.num) return;
    const o = F.find((g) => !g.num && g !== f && dot(g.n, f.n) < -0.999);
    f.num = next;
    if (o) o.num = 21 - next;
    next++;
  });
  const rot = (ax, t) => {
    const [x, y, z] = ax,
      c = Math.cos(t),
      s = Math.sin(t),
      C = 1 - c;
    return [
      [c + x * x * C, x * y * C - z * s, x * z * C + y * s],
      [y * x * C + z * s, c + y * y * C, y * z * C - x * s],
      [z * x * C - y * s, z * y * C + x * s, c + z * z * C],
    ];
  };
  const mm = (a, b) =>
    a.map((r, i) => [0, 1, 2].map((j) => r[0] * b[0][j] + r[1] * b[1][j] + r[2] * b[2][j]));
  const mv = (m, v) => m.map((r) => r[0] * v[0] + r[1] * v[1] + r[2] * v[2]);
  const css = (m) =>
    `matrix3d(${m[0][0]},${m[1][0]},${m[2][0]},0,${m[0][1]},${m[1][1]},${m[2][1]},0,${m[0][2]},${m[1][2]},${m[2][2]},0,0,0,0,1)`;
  return { F, rot, mm, mv, css, norm };
})();
function d20Html(size) {
  const W = size,
    H = (size * Math.sqrt(3)) / 2,
    k = size / 2;
  return `<div class="d20" style="--ds:${W}px">${D20.F.map((f, i) => {
    const T = f.v0.map((x, j) => x * k - (f.A[j] * W) / 2);
    return `<div class="d20f" data-f="${i}" style="width:${W}px;height:${H.toFixed(2)}px;transform:matrix3d(${f.A.join(",")},0,${f.B.join(",")},0,${f.n.join(",")},0,${T.join(",")},1)"><b class="${f.num === 6 || f.num === 9 ? "u" : ""}">${f.num}</b></div>`;
  }).join("")}</div>`;
}
function parseDice(str) {
  const m = /(\d+)\s*d\s*(\d+)(?:\s*([+\-−])\s*(\d+))?/i.exec(String(str || ""));
  if (!m) return null;
  return {
    n: +m[1],
    d: +m[2],
    mod: m[3] ? (m[3] === "+" ? 1 : -1) * +m[4] : 0,
    type: String(str)
      .replace(m[0], "")
      .replace(/^[\s+]+/, "")
      .trim(),
  };
}
function rollDamage(spec, crit) {
  const p = parseDice(spec);
  if (!p) return null;
  const rolls = Array.from({ length: p.n * (crit ? 2 : 1) }, () => rnd(p.d));
  return { ...p, rolls, total: Math.max(0, rolls.reduce((a, b) => a + b, 0) + p.mod) };
}
function rollFrom(btn) {
  const n = csNpc;
  if (!n) return;
  if (btn.dataset.roll === "chk")
    return throwDice({ kind: "check", label: btn.dataset.label, b: +btn.dataset.b, who: n.name });
  const a = (n.sheet.actions || [])[+btn.dataset.i];
  if (!a) return;
  if (a.hit)
    return throwDice({
      kind: "attack",
      label: a.n,
      b: parseInt(String(a.hit).replace("−", "-"), 10),
      dmg: a.dmg,
      who: n.name,
      note: a.p,
    });
  return throwDice({
    kind: "damage",
    label: a.n,
    dmg: a.dmg,
    alt: a.dmgAlt,
    who: n.name,
    note: a.p,
  });
}
function closeDice(instant) {
  if (!diceOn()) return;
  cancelAnimationFrame(diceRAF);
  clearTimeout(diceT);
  const done = () => {
    tray.classList.remove("on", "out");
    tray.innerHTML = "";
    tray.setAttribute("aria-hidden", "true");
  };
  if (instant || reduced) done();
  else {
    tray.classList.add("out");
    diceT = setTimeout(done, 300);
  }
  csModal.querySelector(".cs-card")?.removeAttribute("aria-hidden");
  if (!instant && diceFrom && document.contains(diceFrom)) diceFrom.focus({ preventScroll: true });
}
tray.addEventListener("click", (e) => {
  if (
    e.target.closest("[data-dclose]") ||
    e.target === tray ||
    e.target.classList.contains("dt-back")
  ) {
    closeDice();
    return;
  }
  if (e.target.closest("[data-reroll]") && lastRoll) {
    throwDice(lastRoll, true);
    return;
  }
  const alt = e.target.closest("[data-alt]");
  if (alt && lastRoll) {
    throwDice({ ...lastRoll, useAlt: alt.dataset.alt === "1" }, true);
  }
});
function throwDice(r, again) {
  lastRoll = r;
  if (!again) diceFrom = document.activeElement;
  cancelAnimationFrame(diceRAF);
  clearTimeout(diceT);
  const size = Math.round(Math.max(64, Math.min(130, Math.min(innerWidth, innerHeight) * 0.15)));
  const d20 = r.kind !== "damage" ? rnd(20) : null;
  const nat20 = d20 === 20,
    nat1 = d20 === 1,
    atk = r.kind === "attack";
  const crit = atk && nat20,
    fumble = atk && nat1;
  const total = d20 != null ? d20 + (r.b || 0) : null;
  const dspec = r.kind === "damage" && r.useAlt && r.alt ? r.alt.dmg : r.dmg;
  const dmg =
    r.kind !== "check" && dspec && !(r.kind === "attack" && fumble)
      ? rollDamage(dspec, crit)
      : null;
  const kick =
    r.kind === "check"
      ? /saving/i.test(r.label)
        ? "Saving throw"
        : r.label === "Initiative"
          ? "Initiative"
          : "Ability check"
      : r.kind === "attack"
        ? "Attack roll"
        : "Damage roll";
  const signed = (b) => (b >= 0 ? `+ ${b}` : `− ${Math.abs(b)}`);
  const brk = dmg
    ? `${dmg.rolls.map((v) => `d${dmg.d}: ${v}`).join(" + ")}${dmg.mod ? ` ${signed(dmg.mod)}` : ""}`
    : "";
  const big = dmg
    ? `<div class="dt-dmgbig${crit ? " crit" : ""}"><span class="n" data-count="${dmg.total}">${dmg.total}</span><span class="ty">${esc(dmg.type || "damage")}</span></div>`
    : "";
  const tokens =
    dmg && r.kind !== "damage"
      ? `<div class="dt-dmg"><span class="label">${crit ? "Critical damage" : "Damage, if it hits"}</span>${big}<span class="dt-break">${brk}</span></div>`
      : "";
  const altBtns =
    r.kind === "damage" && r.alt
      ? `<div class="dt-alt"><button type="button" class="chip${r.useAlt ? "" : " on"}" data-alt="0" aria-pressed="${!r.useAlt}">Normal · ${esc(parseDice(r.dmg)?.n + "d" + parseDice(r.dmg)?.d)}</button><button type="button" class="chip${r.useAlt ? " on" : ""}" data-alt="1" aria-pressed="${!!r.useAlt}">${esc(r.alt.label)} · ${esc(parseDice(r.alt.dmg)?.n + "d" + parseDice(r.alt.dmg)?.d)}</button></div>`
      : "";
  /* attacks get the big stamps; checks and saves just get a "natural" tag, since a 20 or 1 has no special rule there */
  const head = crit
    ? `<span class="stamp red dt-stamp">CRITICAL HIT</span>`
    : fumble
      ? `<span class="stamp ink dt-stamp">AUTOMATIC MISS</span>`
      : nat20
        ? `<span class="dt-nat n20">Natural 20</span>`
        : nat1
          ? `<span class="dt-nat n1">Natural 1</span>`
          : "";
  const sayRes =
    d20 != null
      ? (crit
          ? `${r.label}: natural 20, critical hit.`
          : fumble
            ? `${r.label}: natural 1, automatic miss.`
            : `${r.label}: rolled ${d20}, total ${total}.${nat20 ? " Natural 20." : nat1 ? " Natural 1." : ""}`) +
        (dmg ? ` Damage ${dmg.total} ${dmg.type}.` : "")
      : `${r.label}: ${dmg ? dmg.total + " " + (dmg.type || "damage") : ""} damage.`;
  tray.innerHTML = `<div class="dt-back" aria-hidden="true"><i></i><i></i></div>
  <div class="dt-panel" role="dialog" aria-modal="true" aria-label="${esc(r.label)} roll">
    <button type="button" class="close" data-dclose aria-label="Close the dice">${ICON.close}</button>
    <span class="label dt-kick">${kick} · ${esc(r.who)}</span>
    <span class="dt-name">${esc(r.label)}</span>
    ${d20 != null ? `<div class="dt-stage" style="--ds:${size}px"><div class="dt-throw">${d20Html(size)}</div><div class="dt-shadow"></div>${r.b ? `<span class="dt-bonus" aria-hidden="true">${r.b > 0 ? "+" : "−"}${Math.abs(r.b)}<small>${r.kind === "attack" ? "to hit" : r.label === "Initiative" ? "initiative" : "bonus"}</small></span>` : ""}</div>` : `<div class="dt-stage dmg-only"><div class="dt-spin">${(dmg ? dmg.rolls : []).map((v, i) => `<span class="tok big" style="--i:${i}"><small>d${dmg.d}</small><b>${v}</b></span>`).join("")}</div><div class="dt-gathered">${big}<span class="dt-break">${brk}</span></div></div>`}
    <div class="dt-out${d20 != null ? " wait" : ""}">${head}${tokens}${altBtns}
      ${crit ? `<p class="dt-note">A natural 20 always hits.</p>` : fumble ? `<p class="dt-note">A natural 1 always misses.</p>` : r.kind === "attack" ? `<p class="dt-note">Compare the total to the target's AC.</p>` : r.label === "Initiative" ? `<p class="dt-note">Highest total acts first.</p>` : r.kind === "check" ? `<p class="dt-note">Compare the total to the DC.</p>` : ""}
      <div class="dt-btns"><button type="button" class="btn dark" data-reroll><span>Roll again</span>${CSI.d20}</button></div>
    </div>
    <p class="sr" aria-live="polite" id="diceSay"></p>
  </div>`;
  tray.classList.remove("out");
  tray.classList.add("on");
  tray.setAttribute("aria-hidden", "false");
  csModal.querySelector(".cs-card")?.setAttribute("aria-hidden", "true");
  const countUp = (el) => {
    if (!el) return;
    const to = +el.dataset.count;
    if (reduced || !to) {
      el.textContent = to;
      return;
    }
    const t0 = performance.now(),
      dur = Math.min(600, 200 + to * 25);
    const f = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(to * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(f);
      else {
        el.classList.add("bump");
        Sound.tick && Sound.tick();
      }
    };
    el.textContent = "0";
    requestAnimationFrame(f);
  };
  const reveal = () => {
    const o = tray.querySelector(".dt-out");
    if (o) o.classList.remove("wait");
    if (o) countUp(o.querySelector("[data-count]"));
    const say = $("#diceSay");
    if (say) say.textContent = sayRes;
    if (crit) Sound.stamp();
  };
  /* BG3-style: the die lands on its natural roll, the bonus flies into it, and the face counts up to the total */
  const finish = () => {
    if (d20 == null) {
      reveal();
      return;
    }
    const stage = tray.querySelector(".dt-stage"),
      fe = tray.querySelectorAll(".d20f")[D20.F.findIndex((f) => f.num === d20)],
      num = fe && fe.querySelector("b"),
      chip = tray.querySelector(".dt-bonus");
    if (fe) fe.classList.add("lit");
    let wait = 220;
    if (nat20) {
      stage.classList.add("nat20");
      tray.querySelector(".dt-panel").classList.add("shake");
      Sound.slash && Sound.slash();
      if (!reduced)
        stage.insertAdjacentHTML(
          "beforeend",
          `<div class="dt-sparks" aria-hidden="true">${Array.from({ length: 16 }, (_, i) => `<i style="--ang:${(i * 22.5 + Math.random() * 12).toFixed(1)}deg;--d:${(0.75 + Math.random() * 0.5).toFixed(2)};--w:${(4 + Math.random() * 5).toFixed(1)}"></i>`).join("")}</div>`
        );
      wait = 700;
    }
    if (nat1) {
      stage.classList.add("nat1");
      Sound.crack && Sound.crack();
      stage.insertAdjacentHTML(
        "beforeend",
        `<svg class="dt-crack" viewBox="0 0 100 100" aria-hidden="true"><polyline pathLength="1" points="38,8 50,30 42,44 58,58 47,74 56,94"/><polyline pathLength="1" points="50,30 66,26 74,34"/><polyline pathLength="1" points="58,58 30,62 24,72"/></svg>`
      );
      wait = 700;
    }
    /* an attack that rolled a natural 20 or 1 is decided by the die alone, so it keeps showing that 20 or 1 */
    if (!chip || crit || fumble) {
      if (num && !crit && !fumble) num.textContent = total;
      diceT = setTimeout(reveal, reduced ? 0 : wait);
      return;
    }
    if (reduced) {
      if (num) num.textContent = total;
      reveal();
      return;
    }
    diceT = setTimeout(() => {
      chip.classList.add("pop");
      Sound.tick && Sound.tick();
      diceT = setTimeout(() => {
        chip.classList.remove("pop");
        chip.classList.add("fly");
        diceT = setTimeout(() => {
          let v = d20;
          const dir = total > d20 ? 1 : -1,
            steps = Math.abs(total - d20),
            gap = Math.max(35, Math.min(90, 420 / steps));
          stage.classList.add("merge");
          const tick = () => {
            v += dir;
            if (num) {
              num.textContent = v;
              num.classList.remove("bump");
              void num.offsetWidth;
              num.classList.add("bump");
            }
            Sound.tick && Sound.tick();
            if (v !== total) diceT = setTimeout(tick, gap);
            else diceT = setTimeout(reveal, 260);
          };
          tick();
        }, 360);
      }, 650);
    }, wait);
  };
  tray.querySelector("[data-reroll]").focus({ preventScroll: true });
  Sound.shutter && Sound.shutter();
  if (d20 == null) {
    const gather = () => {
      const st = tray.querySelector(".dt-stage"),
        toks = [...tray.querySelectorAll(".dt-spin .tok")],
        g = tray.querySelector(".dt-gathered");
      if (!st || !g) {
        reveal();
        return;
      }
      const sr = st.getBoundingClientRect();
      toks.forEach((t) => {
        const b = t.getBoundingClientRect();
        t.style.setProperty(
          "--gx",
          (sr.left + sr.width / 2 - (b.left + b.width / 2)).toFixed(1) + "px"
        );
      });
      st.classList.add("gather");
      if (!reduced) Sound.tick && Sound.tick();
      diceT = setTimeout(
        () => {
          st.classList.add("gathered");
          countUp(g.querySelector("[data-count]"));
          reveal();
        },
        reduced ? 0 : 330
      );
    };
    diceT = setTimeout(gather, reduced ? 0 : 900);
    return;
  }
  /* the throw: tumble about a random axis that unwinds to zero, so the die lands on its rolled face */
  const face = D20.F.find((f) => f.num === d20),
    R = [face.A, face.B, face.n];
  const die = tray.querySelector(".d20"),
    thr = tray.querySelector(".dt-throw"),
    sh = tray.querySelector(".dt-shadow"),
    faces = [...die.children];
  const ax = D20.norm([Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5]),
    spin = (4 + Math.random() * 2) * Math.PI;
  const L = D20.norm([-0.35, -0.55, 0.76]),
    from = Math.random() < 0.5 ? -1 : 1;
  const paint = (m) => {
    die.style.transform = D20.css(m);
    D20.F.forEach((f, i) => {
      const z = D20.mv(m, f.n);
      faces[i].style.filter =
        `brightness(${(0.45 + 0.75 * Math.max(0, z[0] * L[0] + z[1] * L[1] + z[2] * L[2])).toFixed(3)})`;
    });
  };
  if (reduced) {
    paint(R);
    finish();
    return;
  }
  const dur = 1500,
    t0 = performance.now(),
    bounces = [0.42, 0.7, 0.88];
  const step = (now) => {
    const t = Math.min(1, (now - t0) / dur),
      e = 1 - Math.pow(1 - t, 3);
    paint(D20.mm(D20.rot(ax, spin * (1 - e)), R));
    const x = from * (1 - e) * Math.min(innerWidth * 0.4, size * 2.4),
      hop = Math.abs(Math.sin(t * Math.PI * 3.2)) * Math.pow(1 - t, 1.6) * size * 1.6;
    thr.style.transform = `translate(${x.toFixed(1)}px,${(-hop).toFixed(1)}px) scale(${(0.55 + 0.45 * Math.min(1, t * 2.2)).toFixed(3)})`;
    sh.style.transform = `translateX(${x.toFixed(1)}px) scale(${(1 - hop / (size * 3)).toFixed(3)})`;
    sh.style.opacity = (0.55 - hop / (size * 5)).toFixed(3);
    if (bounces.length && t >= bounces[0]) {
      bounces.shift();
      Sound.dieHit(0.9 - (3 - bounces.length) * 0.2);
    }
    if (t < 1) diceRAF = requestAnimationFrame(step);
    else finish();
  };
  diceRAF = requestAnimationFrame(step);
}
modal.addEventListener("click", (e) => {
  const b = e.target.closest("[data-sheet]");
  if (b) {
    openCS(b.dataset.sheet);
    return;
  }
  if (e.target === modal || e.target.closest("[data-close]")) closeSheet();
});
addEventListener("keydown", (e) => {
  if (!modal.classList.contains("on")) return;
  const top = diceOn() ? tray : csOn() ? csModal : modal;
  if (e.key === "Escape") {
    if (top === tray) closeDice();
    else if (top === csModal) closeCS();
    else closeSheet();
    return;
  }
  if (e.key === "Tab") {
    const f = [...top.querySelectorAll("button,[href]")].filter(
      (x) => !x.disabled && x.offsetParent !== null
    );
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) {
      e.preventDefault();
      f[f.length - 1].focus();
    } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) {
      e.preventDefault();
      f[0].focus();
    }
  }
});
