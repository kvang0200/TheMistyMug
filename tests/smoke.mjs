// Smoke test for the Barovian Archive.
// Serves the site locally, then at phone, small-tablet and desktop size it opens every tab,
// every kind of pop-up, a character sheet with a dice roll, a wax seal and search, and fails
// on any script error, a page wider than the phone screen, or a piece that doesn't show up.
// Run: npm test   (screenshots land in test-results/)
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = path.join(ROOT, "test-results");
fs.mkdirSync(OUT, { recursive: true });

const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json",
  ".webmanifest": "application/manifest+json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg",
  ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": TYPES[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const BASE = `http://127.0.0.1:${server.address().port}/`;

const VIEWPORTS = [
  { name: "phone", width: 390, height: 844, mobile: true },
  { name: "small-tablet", width: 740, height: 1000, mobile: true },
  { name: "desktop", width: 1280, height: 800, mobile: false },
];
const TABS = ["home", "sessions", "npcs", "locations", "quests"];

const failures = [];
let checks = 0;
const check = (ok, what) => { checks++; if (!ok) failures.push(what); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.mobile,
    hasTouch: vp.mobile, serviceWorkers: "block" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(`script error: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") errors.push(`console error: ${m.text()}`); });
  page.on("requestfailed", (r) => errors.push(`failed to load: ${r.url()}`));
  page.on("response", (r) => { if (r.status() >= 400) errors.push(`HTTP ${r.status()}: ${r.url()}`); });
  const at = (s) => `[${vp.name}] ${s}`;
  const shot = (s) => page.screenshot({ path: path.join(OUT, `${vp.name}-${s}.png`) });
  const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);

  await page.goto(BASE + "#home");
  await wait(2500); // intro + entrance animations

  // every tab, through the header links
  for (const tab of TABS) {
    await page.click(`#nav a[href="#${tab}"]`);
    await wait(1200);
    const shown = await page.evaluate((t) => {
      const v = document.getElementById("v-" + t);
      return !!v && v.offsetHeight > 200 && v.textContent.trim().length > 50;
    }, tab);
    check(shown, at(`${tab} tab shows its content`));
    for (const y of [0, 0.5, 1]) {
      await page.evaluate((f) => scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), y);
      await wait(400);
      if (vp.mobile) check((await overflow()) <= 1, at(`${tab} tab fits the screen width (scrolled ${y * 100}%)`));
    }
    await page.evaluate(() => scrollTo(0, 0));
    await shot(`tab-${tab}`);
  }

  // pop-ups: NPC, player and place, each opened by tapping the real thing on the page
  const popups = [
    { kind: "npc", tab: "npcs", sel: "#v-npcs a.card.npc" },
    { kind: "player", tab: "home", sel: "#v-home [data-pcard]" },
    { kind: "place", tab: "locations", sel: null }, // map pins need a drag-free tap; opened directly below
  ];
  for (const p of popups) {
    await page.click(`#nav a[href="#${p.tab}"]`);
    await wait(1000);
    if (p.sel) {
      const el = page.locator(p.sel).first();
      await el.scrollIntoViewIfNeeded();
      await wait(600);
      await el.click({ position: { x: 20, y: 20 } });
    } else {
      await page.evaluate(() => openPlace(Object.keys(placeByName)[0]));
    }
    await wait(400);
    // scroll the pop-up during its entrance: the effects must stay pinned to the screen
    if (vp.mobile) {
      await page.evaluate(() => (document.getElementById("modal").scrollTop = 300));
      const fx = await page.evaluate(() => {
        const f = document.querySelector("#modal .fx");
        return f ? [getComputedStyle(f).position, Math.round(f.getBoundingClientRect().top)] : null;
      });
      check(fx && fx[0] === "fixed" && Math.abs(fx[1]) <= 1, at(`${p.kind} pop-up entrance stays on screen while scrolling`));
    }
    await wait(2200);
    const open = await page.evaluate(() => {
      const m = document.getElementById("modal"), s = m.querySelector(".sheet");
      if (!m.classList.contains("on") || !s) return null;
      const r = s.getBoundingClientRect();
      return { w: r.width, h: r.height, left: r.left, right: r.right, vw: innerWidth };
    });
    check(!!open && open.h > 200, at(`${p.kind} pop-up opens`));
    if (open) check(open.left >= -2 && open.right <= open.vw + 2, at(`${p.kind} pop-up fits the screen width`));
    await page.evaluate(() => (document.getElementById("modal").scrollTop = 0));
    await shot(`popup-${p.kind}`);
    await page.click("#modal [data-close]");
    await wait(1000);
    check(await page.evaluate(() => !document.getElementById("modal").classList.contains("on")),
      at(`${p.kind} pop-up closes`));
  }

  // character sheet + a dice roll
  await page.evaluate(() => openNpc(D.npcs.find((n) => n.sheet).id));
  await wait(2400);
  await page.click("#modal .cs-open");
  await wait(1200);
  check(await page.evaluate(() => document.getElementById("csModal").classList.contains("on")), at("character sheet opens"));
  await shot("character-sheet");
  const roll = page.locator("#csModal [data-roll]").first();
  await roll.scrollIntoViewIfNeeded();
  await roll.click();
  await wait(2600);
  check(await page.evaluate(() => { const t = document.querySelector(".dice-tray"); return !!t && t.offsetHeight > 0; }),
    at("dice tray rolls"));
  await shot("dice");
  await page.keyboard.press("Escape"); await wait(600);
  await page.keyboard.press("Escape"); await wait(600);
  await page.keyboard.press("Escape"); await wait(800);

  // a wax seal on the Tarokka reading: break it, then reseal it
  await page.click('#nav a[href="#quests"]');
  await wait(1500);
  const card = page.locator('#tarokka [data-seal="t1"]');
  await card.scrollIntoViewIfNeeded();
  await wait(800);
  await card.locator("[data-crack]").click();
  await wait(1700);
  check(await card.evaluate((c) => c.classList.contains("is-open") && c.querySelector(".back").offsetHeight > 0),
    at("Tarokka seal breaks and the card turns"));
  if (vp.mobile) check((await overflow()) <= 1, at("opened card fits the screen width"));
  await shot("seal-open");
  await card.locator("[data-reseal]").click();
  await wait(1800);
  check(await card.evaluate((c) => !c.classList.contains("is-open") && !c.classList.contains("wide")),
    at("Tarokka card reseals"));

  // search
  await page.evaluate(() => scrollTo(0, 0));
  const input = page.locator("#q");
  if (!(await input.isVisible())) await page.click("#searchBtn");
  await wait(300);
  await input.fill("Strahd");
  await wait(600);
  check(await page.evaluate(() => document.querySelectorAll(".results.on button, .results.on a").length > 0),
    at("search finds Strahd"));
  await shot("search");

  for (const e of [...new Set(errors)]) failures.push(at(e));
  await ctx.close();
}
await browser.close();
server.close();

console.log(`${checks} checks, ${failures.length} problems`);
for (const f of failures) console.log("  ✗ " + f);
process.exit(failures.length ? 1 : 0);
