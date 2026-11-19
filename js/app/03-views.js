"use strict";
/* =====================================================================
   HOME
   ===================================================================== */
/* big lists stay still (no sway) so scrolling stays smooth on tablets */
function sessionCard(s, i, still = false) {
  const people = (s.who || []).filter((id) => npcById[id]);
  return flipCard({
    key: "s" + s.n,
    i,
    id: "s-" + slug(s.n),
    cls: "sess",
    still,
    front: `<button type="button" class="sealed-btn" data-crack aria-label="Break the seal on Session ${esc(s.n)}: ${esc(s.t)}"><span class="label" style="color:var(--ink-muted)">Session ${esc(s.n)}</span><span class="t" style="font-family:var(--serif);font-style:italic;font-size:calc(26 * var(--u));line-height:1.1">${esc(s.t)}</span>${wax("key", 84)}<span class="label">Break the seal</span></button>`,
    back: `<div class="sess-back"><span class="label dot">Session ${esc(s.n)}</span><span class="t">${esc(s.t)}</span><p>${esc(plain(s.s))}</p>${people.length ? `<div class="chips">${people.map((id) => `<button type="button" class="chip" data-npc="${esc(id)}">${esc(npcById[id].name)}</button>`).join("")}</div>` : ""}</div>`,
  });
}
function latestBlock(onSessions = false) {
  const people = (latest.who || []).filter((id) => npcById[id]);
  const places = D.places.filter((p) => String(p.s) === LAST);
  const hasRedactions = /\[\[.+?\]\]/.test(latest.s);
  return `<div class="latest">
    <div class="left in">
      <span class="kick">The latest session</span>
      <h2 class="h2">Session ${esc(latest.n)}:<br><i>${esc(latest.t)}</i></h2>
      <dl class="dl">
        ${people.length ? `<dt>People</dt><dd>${people.map((id) => esc(npcById[id].name)).join(", ")}</dd>` : ""}
        ${places.length ? `<dt>Places</dt><dd>${places.map((p) => esc(p.n)).join(", ")}</dd>` : ""}
        <dt>Party level</dt><dd>${esc(D.level)}</dd>
      </dl>
    </div>
    <div class="right in">
      <p class="summary" id="latestText">${redacted(latest.s)}</p>
      ${people.length ? `<div class="chips">${people.map((id) => `<button type="button" class="chip" data-npc="${esc(id)}">${esc(npcById[id].name)}</button>`).join("")}</div>` : ""}
      <div style="display:flex;flex-wrap:wrap;gap:calc(12 * var(--u))">
        ${hasRedactions ? `<button type="button" class="btn dark" data-declass aria-pressed="false"><span>Reveal the details</span>${ICON.arrow}</button>` : ""}
        ${onSessions ? `<a class="btn ghost" href="#sessions" data-jump="sesslist">Previous sessions ↓</a>` : `<a class="btn ghost" href="#sessions">All sessions</a>`}
      </div>
    </div>
  </div>`;
}
function playerCard(p) {
  const v = visionFor(p.n);
  const stats = [
    ["AC", p.ac],
    ["HP", p.hp],
    ["PER", p.pp],
    ["DC", p.dc],
  ]
    .map(([k, x]) => `<div><dt>${k}</dt><dd>${esc(x == null ? "—" : x)}</dd></div>`)
    .join("");
  /* the portrait is tucked behind the card, its back peeking over the top; hovering flips it over in front of the card, below the name */
  return `<div class="pslot in" data-pcard="${esc(p.id)}">
  <div class="card player" style="--tilt:${tilt(p.i + 1)}deg"><div class="shade"></div><article class="parch">
    <span class="topline"><span class="label" style="color:var(--ink-muted)">Level ${esc(D.level)}</span><span class="open-hint" aria-hidden="true">Open file ${ICON.arrow}</span></span>
    <button type="button" class="open-sheet" data-pc="${esc(p.id)}" aria-label="Open ${esc(p.n)}'s character sheet"><span class="who name" style="display:inline-block">${esc(p.n)}</span></button>
    <span class="cls">${esc(p.sp)} · ${esc(p.cl.replace(/ \d+$/, ""))}</span>
    <dl class="stats">${stats}</dl>
    ${(p.langs || []).length ? `<p class="pc-line"><span class="label">Languages</span> ${esc(p.langs.join(", "))}</p>` : ""}
    ${p.d ? `<p class="pc-note">${esc(p.d)}</p>` : ""}
    <span class="pc-foot">${v ? `<span class="label"><i class="seal-dot" aria-hidden="true"></i>Sealed fortune inside</span>` : ""}</span>
  </article></div>
  <div class="pphoto" aria-hidden="true"><div class="pp-in" style="--r:${[7, -6, 8, -7, 6][p.i % 5]}deg"><div class="pp-face pp-back"><i class="seal-dot"></i></div><div class="pp-face pp-front"><span class="tape"></span>${sil({ ...p, name: p.n })}<span class="cap">${esc(p.n)}</span></div></div></div>
</div>`;
}
function tarotCard(c, i) {
  const done = c.st === "done";
  return flipCard({
    key: "t" + i,
    i,
    cls: "tarot",
    frontParch: false,
    still: true,
    front: `<button type="button" class="sealed-btn" data-crack aria-label="Break the seal on Tarokka card ${ROMAN[i]}"><span class="roman">${ROMAN[i]}</span>${wax("eye", 90)}<span class="label">Break the seal</span></button>`,
    back: `<span class="label">Card ${ROMAN[i]}</span><span class="t">${esc(c.n)}</span><p>${esc(c.p)}</p>${done ? `<span class="stamp red"${isOpen("t" + i) ? "" : " data-later hidden"}>FULFILLED</span>` : ""}`,
  });
}
function renderHome() {
  const strahd = npcById.strahd;
  const seen = strahd ? sessionsWith("strahd").pop() : null;
  const ongoing = D.quests.filter((q) => q.st !== "done").length;
  const fulfilled = D.tarokka.filter((t) => t.st === "done").length;
  $("#v-home").innerHTML = `
  <div class="scene" data-pin="cover"><section class="cover sstage"><div class="cfog" aria-hidden="true"><i></i><i></i></div><div class="mist" style="top:calc(200 * var(--u))" aria-hidden="true"></div><div class="wrap">
    <div class="metaline"><span class="snap" ${d(0.0)}>Updated after Session ${esc(LAST)}</span><span class="snap" ${d(0.1)}>Curse of Strahd · Party level ${esc(D.level)}</span></div>
    <h1 class="mast" aria-label="Barovia"><span class="bar rule-draw" aria-hidden="true" ${d(-0.1)}></span>${letters("BAROVIA", 0.1)}</h1>
    <div class="rule-draw" style="height:calc(1 * var(--u));background:var(--s);opacity:.35;margin-top:calc(18 * var(--u));animation-delay:calc(var(--base,0s) + .5s)"></div>
    <div class="cfile snap" ${d(0.55)} role="group" aria-label="The campaign at a glance">
          <span class="label">Campaign</span>
          <span class="t"><b>${esc(LAST)}</b>Sessions</span>
          <span class="t"><b>${esc(D.party.length)}</b>Players · Lv ${esc(D.level)}</span>
          <span class="t"><b>${esc(ongoing)}</b>Quests</span>
          <span class="t"><b>${fulfilled}/${D.tarokka.length}</b>Tarokka</span>
        </div>
    <div class="cover-row">
      <div class="cover-copy">
        <span class="tag snap" ${d(0.6)}><span>Where we stand</span></span>
        <h2 class="headline snap" ${d(0.7)}>We hunt him. <span class="underslash"><i>He watches.</i></span></h2>
        <p class="flavor snap" ${d(0.8)}>${esc(D.flavor)}</p>
        <div class="teaser snap" ${d(0.95)}>
          <span class="label dot">Last session · Session ${esc(latest.n)}</span>
          <span class="tz-t">${esc(latest.t)}</span>
          <p class="tz-s">${redacted((latest.s.match(/^.*?[.!?](\s|$)/) || [latest.s])[0].trim())}</p>
          <a class="btn" href="#home" data-jump="latest">Read the latest session ${ICON.arrow}</a>
        </div>
      </div>
      ${
        strahd
          ? `<div class="villain">
        <div class="redpanel rule-draw" aria-hidden="true" ${d(1.0)}></div>
        <div class="dice" aria-hidden="true"><span class="roll r1"><span class="d20 big"><svg viewBox="0 0 100 100" aria-hidden="true"><polygon class="f0" points="50,4 90,27 90,73 50,96 10,73 10,27"/><polygon class="f1" points="50,4 90,27 50,22"/><polygon class="f1" points="50,4 10,27 50,22"/><polygon class="f2" points="90,27 90,73 78,66"/><polygon class="f2" points="10,27 10,73 22,66"/><polygon class="f1" points="90,73 50,96 78,66"/><polygon class="f1" points="10,73 50,96 22,66"/><polygon class="f3" points="50,22 78,66 22,66"/><g class="ln"><polyline points="50,22 78,66 22,66 50,22"/><line x1="50" y1="22" x2="50" y2="4"/><line x1="50" y1="22" x2="90" y2="27"/><line x1="50" y1="22" x2="10" y2="27"/><line x1="78" y1="66" x2="90" y2="27"/><line x1="78" y1="66" x2="90" y2="73"/><line x1="78" y1="66" x2="50" y2="96"/><line x1="22" y1="66" x2="10" y2="27"/><line x1="22" y1="66" x2="10" y2="73"/><line x1="22" y1="66" x2="50" y2="96"/></g><text x="50" y="57" text-anchor="middle">20</text></svg></span></span><span class="roll r2"><span class="d20 small"><svg viewBox="0 0 100 100" aria-hidden="true"><polygon class="f0" points="50,4 90,27 90,73 50,96 10,73 10,27"/><polygon class="f1" points="50,4 90,27 50,22"/><polygon class="f1" points="50,4 10,27 50,22"/><polygon class="f2" points="90,27 90,73 78,66"/><polygon class="f2" points="10,27 10,73 22,66"/><polygon class="f1" points="90,73 50,96 78,66"/><polygon class="f1" points="10,73 50,96 22,66"/><polygon class="f3" points="50,22 78,66 22,66"/><g class="ln"><polyline points="50,22 78,66 22,66 50,22"/><line x1="50" y1="22" x2="50" y2="4"/><line x1="50" y1="22" x2="90" y2="27"/><line x1="50" y1="22" x2="10" y2="27"/><line x1="78" y1="66" x2="90" y2="27"/><line x1="78" y1="66" x2="90" y2="73"/><line x1="78" y1="66" x2="50" y2="96"/><line x1="22" y1="66" x2="10" y2="27"/><line x1="22" y1="66" x2="10" y2="73"/><line x1="22" y1="66" x2="50" y2="96"/></g><text x="50" y="57" text-anchor="middle">13</text></svg></span></span></div>
        <div class="snap" style="position:relative;animation-delay:calc(var(--base,0s) + 1.15s)">
          <a href="#npcs" class="card" data-npc="strahd" aria-label="Open ${esc(strahd.name)}'s card"><div class="shade"></div><article class="parch">
            <span class="label" style="display:block;margin-bottom:calc(14 * var(--u));color:var(--ink-muted)">NPC</span>
            <div style="display:flex;gap:calc(18 * var(--u))">
              <div style="position:relative;flex:0 0 calc(120 * var(--u));height:calc(150 * var(--u))">${sil(strahd)}<div class="glow watch" aria-hidden="true" style="position:absolute;left:50%;top:30%;width:calc(120 * var(--u));height:calc(120 * var(--u));margin:calc(-60 * var(--u)) 0 0 calc(-60 * var(--u));border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--a) 55%,transparent),transparent 66%)"></div></div>
              <div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:calc(6 * var(--u))">
                <span class="label dot">Main villain</span>
                <span class="name" style="font-size:calc(30 * var(--u));line-height:1">${esc(strahd.name)}</span>
                <span style="font-family:var(--serif);font-style:italic;font-size:calc(16 * var(--u));color:var(--ink-muted)">${esc(strahd.epi)}</span>
              </div>
            </div>
            <dl class="dl"><dt>Status</dt><dd>${statusWord(strahd)}</dd><dt>Location</dt><dd>${esc(where(strahd))}</dd>${seen ? `<dt>Last seen</dt><dd>Session ${esc(seen.n)} · ${esc(seen.t)}</dd>` : ""}<dt>Weakness</dt><dd><span style="display:inline-block;width:calc(120 * var(--u));height:calc(14 * var(--u));background:var(--p);vertical-align:middle"></span> <span style="font-size:calc(11 * var(--u));color:var(--ink-muted)">unknown</span></dd></dl>
            <span class="stamp red stamp-now" aria-hidden="true" style="right:calc(18 * var(--u));bottom:calc(18 * var(--u));font-size:calc(16 * var(--u));animation-delay:calc(var(--base,0s) + 1.75s)">HOSTILE</span>
          </article></a>
        </div>
      </div>`
          : ""
      }
    </div>
  <a class="peek" href="#home" data-jump="players" aria-label="Meet the players"><span class="peek-in">${PCS.map((p, i) => `<span class="pk" style="--r:${[-5, 4, -3, 5, -4][i % 5]}deg;--y:${[6, 0, 10, 2, 8][i % 5]}px"><i class="seal-dot"></i><em>${esc(p.n.split(" ")[0])}</em></span>`).join("")}</span><span class="peek-l label">The players ↓</span></a>
  </div>
  </section></div>

  <div class="after-pin">


  <section class="section players-sec" id="players"><div class="mist" style="top:0" aria-hidden="true"></div><div class="wrap" style="position:relative">
    ${head("01 — The party", `The <i>players</i>`, `<p>${matchMedia("(hover:hover) and (min-width:761px)").matches ? "Hover a player to flip their portrait over, and tap to open their file." : "Tap a player to open their file."} Each personal fortune is sealed inside it.</p>`)}
    <div class="ptrack">${PCS.map(playerCard).join("")}</div>
  </div></section>

  <section class="section light" id="latest"><div class="wrap">
    ${latestBlock()}
    <div class="subhead in"><h3>Earlier sessions, <i>under seal</i></h3><a class="link" href="#sessions">All sessions →</a></div>
    <div class="grid g-240" style="margin-top:calc(40 * var(--u))">${earlier.slice(0, 4).map(sessionCard).join("")}</div>
  </div></section>
  </div>`;
}

/* =====================================================================
   SESSIONS
   ===================================================================== */
function renderSessions() {
  /* three bands of colour: the page title on black, the latest session on parchment, the sealed sessions on black */
  $("#v-sessions").innerHTML = `
  <section class="section sess-top"><div class="mist" style="top:calc(-120 * var(--u))" aria-hidden="true"></div><div class="wrap" style="position:relative">
    ${head("Sessions", `The <i>chronicle</i>`, `<p>The latest session is open. Break a seal to read an older one.</p>`)}
  </div></section>
  <section class="section light sess-mid"><div class="wrap">
    ${latestBlock(true).replace('id="latestText"', 'id="latestText2"')}
  </div></section>
  <section class="section sess-list" id="sesslist"><div class="mist red" style="top:0" aria-hidden="true"></div><div class="wrap" style="position:relative">
    <div class="subhead in stickyhead" style="margin-top:0"><h3>Every session, <i>under seal</i></h3><span class="label" style="color:var(--muted)">Newest first</span></div>
    <div class="grid g-240 thread-host" style="margin-top:calc(40 * var(--u))">${earlier.map((s, i) => sessionCard(s, i, true)).join("")}</div>
  </div></section>
`;
}

/* =====================================================================
   NPCS
   ===================================================================== */
const NPC_FILTERS = [
  ["all", "All"],
  ["ally", "Allies"],
  ["unsure", "Uncertain"],
  ["foe", "Foes"],
  ["fallen", "Fallen"],
];
let npcFilter = "all";
function npcCard(n, i) {
  const st = standing(n);
  return `<a href="#npcs" class="card npc in" data-npc="${esc(n.id)}" style="--tilt:${tilt(i)}deg" aria-label="Open ${esc(n.name)}">${isNew(n) ? `<span class="new">NEW</span>` : ""}<div class="shade"></div><article class="parch">
    <span class="label npc-kick">NPC</span>
    <div class="npc-top">
      <div class="npc-ph">${sil(n)}</div>
      <div class="npc-id"><span class="name">${esc(n.name)}</span><span class="npc-epi">${esc(n.epi || "")}</span></div>
    </div>
    ${n.d ? `<p class="npc-desc">${esc(n.d)}</p>` : ""}
    <dl class="dl"><dt>Status</dt><dd>${statusWord(n)}</dd><dt>First met</dt><dd>${esc(metLabel(n.met))}</dd><dt>Last seen</dt><dd>${esc(where(n))}</dd></dl>
    <span class="stamp ${st.tone} stamp-view" aria-hidden="true">${st.stamp}</span>
  </article></a>`;
}
const inGroup = (n, k) =>
  k === "all" || (k === "fallen" ? n.fate === "dead" : n.side === k && n.fate !== "dead");
function renderNpcs() {
  const list = D.npcs.filter((n) => inGroup(n, npcFilter));
  /* "All" is split into labelled groups (allies, uncertain, foes, fallen) so the long list is easy to scan */
  const groups =
    npcFilter === "all"
      ? NPC_FILTERS.slice(1)
          .map(([k, l]) => [l, D.npcs.filter((n) => inGroup(n, k))])
          .filter(([, g]) => g.length)
      : [[null, list]];
  const body = list.length
    ? groups
        .map(
          ([l, g]) =>
            `${l ? `<h3 class="npc-group"><span>${l}</span><span class="label muted">${g.length}</span></h3>` : ""}<div class="grid g-240 npc-grid">${g.map(npcCard).join("")}</div>`
        )
        .join("")
    : `<p class="empty">No one here yet.</p>`;
  $("#v-npcs").innerHTML = `
  <div class="mist" style="top:calc(160 * var(--u))" aria-hidden="true"></div>
  <section class="section"><div class="wrap" style="position:relative">
    ${head("NPCs", `Friends, foes, <i>and the fallen</i>`, `<p>Each card is stamped with where they stand with the party.</p>`)}
    <div class="stickybar"><div class="filters" role="group" aria-label="Show">${NPC_FILTERS.map(([k, l]) => `<button type="button" data-nf="${k}" aria-pressed="${k === npcFilter}">${l}</button>`).join("")}</div><span class="label muted">${list.length} ${list.length === 1 ? "NPC" : "NPCs"}</span></div>
    ${body}
  </div></section>`;
  SX.scan();
}

/* =====================================================================
   LOCATIONS (list; the map is built further down)
   ===================================================================== */
function placeCard(p, i) {
  const visited = p.s && p.s !== "—";
  return `<a href="#locations" class="card place in" data-place="${esc(p.n)}" style="--tilt:${tilt(i + 1)}deg" aria-label="Open ${esc(p.n)}">${isNew(p) ? `<span class="new">NEW</span>` : ""}<div class="shade"></div><article class="parch">
    <span class="label" style="color:var(--ink-muted)">${esc(p.r)}</span><span class="t name">${esc(p.n)}</span><p>${esc(p.p)}</p>
    <span class="stamp ${visited ? "ink" : "red"} stamp-view" aria-hidden="true">${visited ? "VISITED · SESSION " + esc(p.s) : "NOT VISITED"}</span>
  </article></a>`;
}
function renderLocList() {
  const regions = [...new Set(D.places.map((p) => p.r))];
  $("#locList").innerHTML = regions
    .map(
      (r) =>
        `<h3 class="region">${esc(r)}</h3><div class="grid g-260">${D.places
          .filter((p) => p.r === r)
          .map(placeCard)
          .join("")}</div>`
    )
    .join("");
  SX.scan();
}

/* =====================================================================
   QUESTS
   ===================================================================== */
const Q_FILTERS = [
  ["ongoing", "Ongoing"],
  ["done", "Completed"],
  ["all", "All"],
];
let questFilter = "ongoing";
const PIN_AT = [50, 34, 62, 44, 56, 38, 66]; /* notices hang straight; only where the pin went in varies */
function renderQuests() {
  $("#v-quests").innerHTML = `
  <section class="section" id="tarokka"><div class="mist red" style="top:0" aria-hidden="true"></div><div class="wrap" style="position:relative">
    ${head("Quests · The reading", `The Tarokka <i>reading</i>`, `<p>Madam Eva's reading from Session 5. Break a seal to turn a card, and tap Reseal to turn it back.</p>`)}
    <p class="jumps"><a class="link" href="#quests" data-fortune="list">Quest board ↓</a><a class="link" href="#quests" data-fortune="loose">Loose ends ↓</a></p>
    <div class="grid g-210 deal${reduced ? "" : " undealt"}">${D.tarokka.map(tarotCard).join("")}</div>
  </div></section>
  <div id="questList"></div>`;
  renderQuestList();
}
/* one notice pinned to the board */
function questNotice(q, i, done) {
  const no = String(D.quests.indexOf(q) + 1).padStart(2, "0");
  const kind = /main/i.test(q.t) ? "main" : /side/i.test(q.t) ? "side" : "town";
  return `<li class="qnote notice ${kind}${done ? " done" : ""} in" style="--pin:${PIN_AT[i % 7]}%">
    <div class="np parch">
      <span class="np-top"><span class="label np-kind">${esc(q.t)}${kind === "town" ? " notice" : " quest"}</span><span class="label np-no">Nº ${no}</span></span>
      <button type="button" class="qn" data-qnote aria-expanded="false"><span class="qt">${esc(q.n)}</span></button>
      <div class="qd-fold"><div class="qd-in"><p class="qd">${esc(q.p)}</p></div></div>
      ${done ? `<span class="stamp red stamp-view">COMPLETED</span>` : `<span class="np-foot label"><i class="np-dot" aria-hidden="true"></i>Open</span>`}
    </div>
  </li>`;
}
function renderQuestList() {
  const on = D.quests.filter((q) => q.st !== "done"),
    done = D.quests.filter((q) => q.st === "done");
  const showOn = questFilter !== "done",
    showDone = questFilter !== "ongoing";
  const notices = (list, isDone) =>
    `<ol class="qb-grid${isDone ? " qb-done" : ""}">${list.map((q, i) => questNotice(q, i, isDone)).join("")}</ol>`;
  $("#questList").innerHTML = `
  <section class="section light qboard-sec" id="list"><div class="wrap">
    ${head("Quests · The board", `The quest <i>board</i>`, `<p>Every job the party has taken on. ${matchMedia("(max-width:760px)").matches ? "Tap a notice to read it." : "Finished work is stamped and struck off."}</p>`)}
    <div class="stickybar light-bar"><div class="filters" role="group" aria-label="Show">${Q_FILTERS.map(([k, l]) => `<button type="button" data-qf="${k}" aria-pressed="${k === questFilter}">${l}</button>`).join("")}</div></div>
    <div class="qboard">
      <span class="qb-nail" aria-hidden="true"></span><span class="qb-nail" aria-hidden="true"></span><span class="qb-nail" aria-hidden="true"></span><span class="qb-nail" aria-hidden="true"></span>
      <header class="qb-plaque">
        <span class="label qb-where">Posted for the party · after Session ${esc(LAST)}</span>
        <span class="qb-tally"><span><b>${on.length}</b>Open</span><span><b>${done.length}</b>Done</span></span>
      </header>
      ${showOn ? (on.length ? notices(on, false) : `<p class="empty">Nothing open. Enjoy it while it lasts.</p>`) : ""}
      ${showOn && showDone ? `<h3 class="qb-sub"><span>Struck off</span></h3>` : ""}
      ${showDone ? (done.length ? notices(done, true) : `<p class="empty">Nothing finished yet.</p>`) : ""}
      <div class="qb-loose" id="loose">
        <h3 class="qb-sub"><span>Loose ends</span><span class="label">Unresolved. Some may become quests.</span></h3>
        <div class="board"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline class="string" pathLength="1" points="12,18 38,30 64,16 88,32 74,74 46,66 20,78 38,30" fill="none" stroke="var(--a)" stroke-width="1.4" vector-effect="non-scaling-stroke"/></svg>
          <ol class="grid g-240">${D.threads.map((t, i) => `<li class="scrap in" style="--pin:${PIN_AT[(i + 3) % 7]}%"><div class="sp"><span class="label">Loose end ${i + 1}</span><p>${esc(t)}</p></div></li>`).join("")}</ol>
        </div>
      </div>
    </div>
  </div></section>`;
  SX.scan();
}
