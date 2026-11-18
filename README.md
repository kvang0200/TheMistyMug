# The Barovian Archive

A player-facing wiki for our Curse of Strahd campaign, styled as the party's dossier on
Barovia: editorial noir look, Persona-style motion, wax seals and stamps.

**Player-safe only.** Everything in this repo is public. Never add DM secrets, 🔒 content,
unmet NPCs, or quests the party hasn't started.

## Files

| Path | What it is | Changes after a session? |
|---|---|---|
| `js/data.js` | All campaign content: sessions, NPCs, places, Tarokka, fortunes, quests, party, plus map pins and the travel trail | **Yes** (usually the only file) |
| `index.html` | Page skeleton: intro, header, the five tabs, the map | Rarely |
| `css/` | All styling and animation, split into 7 files that load in order (later files win). **The three site colors are at the top of `01-base.css`** | Rarely |
| `js/app/` | Builds every tab and pop-up from `data.js`; seals, stamps, search, map. Split into 8 files that share one scope and load in order | Rarely |
| `js/sound.js` | Sound effects made in the browser: wax cracking, paper turning, stamps, slashes (no sound files) | Rarely |
| `sw.js` | Offline cache (service worker) | Bump `VERSION` when anything except `data.js` changes |
| `fonts/` | Self-hosted Bodoni Moda, Inter and IBM Plex Mono, subset to Latin; OFL licences included | No |
| `img/` | Map (`barovia-map.webp` 2000px + `barovia-map-1000.webp` preview), fog layers, grain texture, app icons, portraits | When adding art or fog changes |

## How the page works

- **Tabs:** Home, Sessions, NPCs, Locations (interactive map + list), Quests.
- **Home** is the players' landing page: title card, then the players (tap a card for their file), then the latest session.
- **Scroll motion:** pinned scenes (the Home title card holds while the page slides up over it;), sticky filter bars on NPCs and Quests, cards rising into place, and a reading bar under the header. The Tarokka and personal fortune cards are dealt onto the table when Quests opens. Hovering a player card flips their portrait over in front of it. A small scroll engine in `app.js` (SX) drives it in every browser and only measures what is on screen.
- **Screen sizes:** every size in `css/` is written in design pixels (`var(--u)`). Up to 1920×1080 one design pixel is one pixel; on bigger screens (1440p, 4K) it grows, so the whole page keeps the same proportions instead of sitting small in the middle.
- **Colors:** primary (ink black), secondary (parchment beige) and accent (blood red) are
  `--p`, `--s` and `--a` at the top of `css/01-base.css`. Change those three to restyle everything.
- **Wax seals:** the latest session is always open; every older session is sealed until a
  player breaks it. The Tarokka cards (on the Quests tab) are sealed too. An opened card has a
  Reseal button that turns it back over. Each device remembers which seals it has broken, so a
  player on a new device sees them sealed again.
- **Sealed fortunes:** each player's personal fortune (from `visions`) sits under a
  wax seal in the player's pop-up file and on the Quests tab (breaking one breaks both). Tap the seal again to reseal it.
- **Loose ends** (`threads` in `data.js`) are pinned on the Quests tab, under the quest list.
- **Stamps** come from fields you already fill in: NPC `side` / `fate` (ALLY, UNCERTAIN, HOSTILE,
  DECEASED, MISSING), place `s` (VISITED · SESSION 11 or NOT VISITED) and quest `st` (COMPLETED).
- **Redactions:** in the latest session's summary, wrap words in `[[double brackets]]` to black
  them out until a player taps "Reveal the details".
- **Sound** is on by default and starts at a player's first tap (browsers block sound before
  that). The speaker button turns it off, and each device remembers the choice.
- **Phones** get a minimal layout: cards show only the essentials (name, class, stamp) and the full details are one tap away in the pop-up file. Sealed cards sit two across and spread to full width once broken; ongoing quests open on tap. Section intros and meta lines are hidden.
- **Motion** is turned off automatically for anyone whose device asks for reduced motion.

No build step. Edit a file, commit, and Pages republishes in a minute or two.

### Code layout

| `css/` file | What's in it |
|---|---|
| `01-base.css` | Colors, fonts, design pixels, motion keyframes, header, shared pieces (cards, stamps, wax seals, flip cards) |
| `02-pages.css` | Home, Locations map, pop-up sheet, Quests, small-screen basics |
| `03-motion.css` | Reduced motion, scroll motion, pinned scenes, dealt cards, player portraits |
| `04-title-card.css` | The Home title card and the page transitions |
| `05-phone-and-fixes.css` | Later phone and visual fixes (Nov 2026) layered over the files above |
| `06-character-sheet.css` | NPC character sheets and the dice tray |
| `07-popup-effects.css` | Pop-up entrances and exits (Tarokka card, initiative, portcullis, Persona-style exit) |

| `js/app/` file | What's in it |
|---|---|
| `01-core.js` | Helpers, saved seals, wax seal art, particle effects |
| `02-motion.js` | Scroll motion engine (SX), pinned scenes, dealt cards |
| `03-views.js` | Builds the Home, Sessions, NPCs, Locations and Quests tabs |
| `04-popups.js` | NPC, player and location pop-ups and the character sheet |
| `05-dice.js` | The 3D d20 and the dice tray |
| `06-interactions.js` | Clicks (seals, chips, filters) and tab navigation |
| `07-map.js` | The map of Barovia |
| `08-start.js` | Search, sound toggle, and starting everything up |

Code is formatted with Prettier (`.prettierrc.json`). The `js/app/` files are plain scripts, not
modules: they share one scope, so a file can use anything defined in a file before it.

**Caching:** players' devices keep a copy of the site so it opens instantly and works offline.
`index.html` and `js/data.js` are always fetched fresh when online, so normal session updates
show up right away. If you change anything else (CSS, `js/app/`, `sound.js`, images, fonts), also
change `VERSION` at the top of `sw.js` (today's date is fine) so devices drop their old copies.

**Security policy:** `index.html` has a Content-Security-Policy tag that only lets the site run
its own scripts, styles and fonts. Portrait images can still come from any `https://` address.
If you ever add something from another site (a script, a font, an embed), it will be blocked
until you add that site to the policy.

**Map files:** if you edit the map art, export both sizes: `barovia-map.webp` at 2000×1364 and
`barovia-map-1000.webp` at 1000×682. The small one shows first; the big one loads when someone zooms in.

## After each session

1. In `js/data.js`:
   - Bump `lastSession`, update `flavor`, `location`, and `level` if the party leveled.
   - Add the session to `sessions` (summary written from what happened, not prep notes).
   - Add or update NPCs (`met` = session first met; `side` = ally / unsure / foe; `fate`).
     Anything whose `met` or `s` equals `lastSession` gets a **New** badge automatically.
   - Optional: wrap a few words of the new summary in `[[ ]]` to redact them.
   - Add places (`s` = session first visited) and update quests (`st` = ongoing / done).
   - Map: add a pin to `PINS` and extend `TRAIL_MAIN` / `TRAIL_SIDE` for new travel.
2. If the party explored new ground, re-cut the holes in `img/fog.webp` and `img/fog2.webp`
   (same holes in both; coordinates are on the 2000×1364 map).
3. Check for spoilers, commit, push.

## NPC character sheets

Give an NPC a `sheet` in `js/data.js` and its pop-up gets a **Character sheet** button. It opens a
second pop-up that slams in over the NPC's file, laid out like the D&D 2024 sheet: AC, HP, initiative, speed, proficiency bonus, passive Perception, the six
abilities with their saves and skills, weapons, features, lessons, spells and equipment.
An **In battle** panel (`actions` in `data.js`) shows what the NPC can do on their turn as cards,
sorted into Action, Bonus Action and Reaction.
**Dice:** tapping an attack card throws a 3D d20 (attack roll, then damage, doubled dice on a natural 20);
a damage-only card (like a smite) rolls its damage; every save, skill and Initiative rolls d20 + its bonus.
The die is built from 20 CSS triangles in `js/app/05-dice.js`, so there's no dice library or image to load.
**Lessons** (Ireena) list what she has learned and from whom; unlearned ones show only a wax seal
(`{sealed:true}`, no name, so players can't read ahead in the code). Enter the scores
and proficiencies; the modifiers and bonuses are worked out for you. Anything left out shows a dash.
The field list is at the top of `data.js`. Sheets are public like everything else, so keep
🔒 abilities off them.

## Portraits

Each NPC/PC in `data.js` has an `img` field (`null` shows the silhouette). It takes a path
in `img/` or a full image URL. Only use art we have permission to use, and credit the artist.

## Credits

- Map: free fan resource shared on Reddit.
- Fonts: Bodoni Moda, Inter, IBM Plex Mono (SIL Open Font License; self-hosted in `fonts/`).
