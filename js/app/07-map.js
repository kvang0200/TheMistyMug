"use strict";
/* =====================================================================
   THE MAP OF BAROVIA (coordinates on a 2000 x 1364 map, see data.js)
   ===================================================================== */
let mapMode = "map",
  mapReady = false,
  mapRAF = 0,
  lastInv = "",
  mapFull = false;
const MAP_SMALL = "img/barovia-map-1000.webp",
  MAP_FULL = "img/barovia-map.webp";
const mapState = { s: 1, x: 0, y: 0, min: 0.2, max: 2.2 };
function buildMap() {
  $("#stage").insertAdjacentHTML(
    "beforeend",
    `
    <svg class="trail" viewBox="0 0 ${MAP_W} ${MAP_H}" aria-hidden="true">
      <defs><mask id="trailMask" maskUnits="userSpaceOnUse" x="0" y="0" width="${MAP_W}" height="${MAP_H}">
        <path d="${esc(TRAIL_MAIN)}" pathLength="1"/><path d="${esc(TRAIL_SIDE)}" pathLength="1"/><path d="${esc(TRAIL_LAKE)}" pathLength="1"/>
      </mask></defs>
      <g mask="url(#trailMask)">${[TRAIL_MAIN, TRAIL_SIDE, TRAIL_LAKE].map((p) => `<path class="shadow" d="${esc(p)}"/><path class="ink" d="${esc(p)}"/>`).join("")}</g>
    </svg>
    <div class="here" style="left:842px;top:462px"><i></i><i></i><b>You are here</b></div>
    ${PINS.map((p, i) => `<button type="button" class="pin ${p.town ? "town" : ""} ${p.side ? "side-" + esc(p.side) : ""}" style="left:${+p.x || 0}px;top:${+p.y || 0}px;--pd:${i * 80}ms" data-place="${esc(p.key)}" aria-label="${esc(p.label || p.key)}"><span class="pi"><span class="seal"></span><span class="lb">${esc(p.label || p.key)}</span></span></button>`).join("")}`
  );
}
function applyMap() {
  const st = mapState,
    box = $("#mapbox"),
    W = box.clientWidth,
    H = box.clientHeight,
    sw = MAP_W * st.s,
    sh = MAP_H * st.s;
  st.x = sw <= W ? (W - sw) / 2 : Math.min(0, Math.max(W - sw, st.x));
  st.y = sh <= H ? (H - sh) / 2 : Math.min(0, Math.max(H - sh, st.y));
  if (mapRAF) return;
  mapRAF = requestAnimationFrame(() => {
    mapRAF = 0;
    const stg = $("#stage");
    stg.style.transform = `translate(${mapState.x}px,${mapState.y}px) scale(${mapState.s})`;
    const inv = (1 / mapState.s).toFixed(3);
    if (inv !== lastInv) {
      lastInv = inv;
      stg.style.setProperty("--inv", inv);
    }
    if (!mapFull && mapState.s * (devicePixelRatio || 1) > 0.55) loadMapFull();
  });
}
function loadMapFull() {
  if (mapFull) return;
  mapFull = true;
  const im = new Image();
  im.src = MAP_FULL;
  const swap = () => {
    $("#mapImg").src = MAP_FULL;
  };
  im.decode ? im.decode().then(swap, swap) : (im.onload = swap);
}
function zoomAt(f, cx, cy) {
  const st = mapState,
    ns = Math.min(st.max, Math.max(st.min, st.s * f));
  st.x = cx - (cx - st.x) * (ns / st.s);
  st.y = cy - (cy - st.y) * (ns / st.s);
  st.s = ns;
  applyMap();
}
function resetMap() {
  const box = $("#mapbox"),
    W = box.clientWidth,
    H = box.clientHeight;
  mapState.min = Math.min(W / MAP_W, H / MAP_H);
  const x0 = 200,
    x1 = 1960,
    y0 = 300,
    y1 = 960,
    s = Math.max(mapState.min, Math.min(W / (x1 - x0), H / (y1 - y0)));
  const f =
    W < 700 ? { x: 1000, y: 620, s: Math.max(s, 0.42) } : { x: (x0 + x1) / 2, y: (y0 + y1) / 2, s };
  mapState.s = f.s;
  mapState.x = W / 2 - f.x * f.s;
  mapState.y = H / 2 - f.y * f.s;
  applyMap();
}
function initMapInput() {
  const box = $("#mapbox"),
    pts = new Map();
  let start = null,
    moved = 0,
    pinch = null;
  const local = (e) => {
    const r = box.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  box.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".map-ctrl")) return;
    box.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, local(e));
    moved = 0;
    if (pts.size === 1) {
      start = { ...local(e), ox: mapState.x, oy: mapState.y, target: e.target.closest(".pin") };
      box.classList.add("drag");
    }
    if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      pinch = {
        d: Math.hypot(a.x - b.x, a.y - b.y),
        s: mapState.s,
        cx: (a.x + b.x) / 2,
        cy: (a.y + b.y) / 2,
        ox: mapState.x,
        oy: mapState.y,
      };
    }
  });
  box.addEventListener("pointermove", (e) => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, local(e));
    if (pts.size === 2 && pinch) {
      const [a, b] = [...pts.values()],
        dd = Math.hypot(a.x - b.x, a.y - b.y),
        cx = (a.x + b.x) / 2,
        cy = (a.y + b.y) / 2;
      const ns = Math.min(mapState.max, Math.max(mapState.min, (pinch.s * dd) / pinch.d));
      mapState.x = cx - (pinch.cx - pinch.ox) * (ns / pinch.s);
      mapState.y = cy - (pinch.cy - pinch.oy) * (ns / pinch.s);
      mapState.s = ns;
      moved = 99;
      applyMap();
      return;
    }
    if (pts.size === 1 && start) {
      const p = local(e),
        dx = p.x - start.x,
        dy = p.y - start.y;
      moved = Math.max(moved, Math.hypot(dx, dy));
      mapState.x = start.ox + dx;
      mapState.y = start.oy + dy;
      applyMap();
    }
  });
  const up = (e) => {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch = null;
    if (pts.size === 1) {
      const [p] = [...pts.values()];
      start = { ...p, ox: mapState.x, oy: mapState.y, target: null };
    }
    if (pts.size === 0) {
      box.classList.remove("drag");
      if (start && start.target && moved < 8) {
        Sound.tick();
        openPlace(start.target.dataset.place);
      }
      start = null;
    }
  };
  box.addEventListener("pointerup", up);
  box.addEventListener("pointercancel", up);
  box.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const p = local(e);
      zoomAt(Math.exp(-e.deltaY * 0.0015), p.x, p.y);
    },
    { passive: false }
  );
  box.addEventListener("keydown", (e) => {
    const pin = e.target.closest(".pin");
    if (pin && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openPlace(pin.dataset.place);
    }
  });
  $("#zIn").addEventListener("click", () => {
    zoomAt(1.35, box.clientWidth / 2, box.clientHeight / 2);
    Sound.tick();
  });
  $("#zOut").addEventListener("click", () => {
    zoomAt(1 / 1.35, box.clientWidth / 2, box.clientHeight / 2);
    Sound.tick();
  });
  $("#zReset").addEventListener("click", () => {
    resetMap();
    Sound.slash();
  });
  addEventListener("resize", () => {
    if (current === "locations" && mapMode === "map") resetMap();
  });
}
function enterMap() {
  if (!mapReady) {
    const img = $("#mapImg");
    if (!img.getAttribute("src")) img.src = MAP_SMALL;
    buildMap();
    initMapInput();
    mapReady = true;
  }
  requestAnimationFrame(() => {
    resetMap();
    const w = $("#mapWrap");
    if (!w.classList.contains("drawn")) {
      $$(".pin").forEach((p) => p.classList.add("drop"));
      setTimeout(() => w.classList.add("drawn"), reduced ? 0 : 400);
    }
  });
}
$("#mv").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  mapMode = b.dataset.mv;
  $$("#mv button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  $("#mapWrap").hidden = mapMode !== "map";
  $("#locList").hidden = mapMode !== "list";
  Sound.tick();
  SX.scan();
  if (mapMode === "map") enterMap();
});
