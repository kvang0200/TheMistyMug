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
| `css/style.css` | All styling and animation. **The three site colors are at the top** | Rarely |
| `js/app.js` | Builds every tab and pop-up from `data.js`; seals, stamps, search, map | Rarely |
| `js/sound.js` | Sound effects made in the browser: wax cracking, paper turning, stamps, slashes (no sound files) | Rarely |
| `sw.js` | Offline cache (service worker) | Bump `VERSION` when anything except `data.js` changes |
| `fonts/` | Self-hosted Bodoni Moda, Inter and IBM Plex Mono, subset to Latin; OFL licences included | No |
| `img/` | Map (`barovia-map.webp` 2000px + `barovia-map-1000.webp` preview), fog layers, grain texture, app icons, portraits | When adding art or fog changes |

## How the page works

- **Tabs:** Home, Sessions, NPCs, Locations (interactive map + list), Quests.
- **Home** is the players' landing page: title card, then the players (tap a card for their file), then the latest session.
- **Scroll motion:** pinned scenes (the Home title card holds while the page slides up over it;), sticky filter bars on NPCs and Quests, cards rising into place, and a reading bar under the header. The Tarokka and personal fortune cards are dealt onto the table when Quests opens. Hovering a player card flips their portrait over in front of it. A small scroll engine in `app.js` (SX) drives it in every browser and only measures what is on screen.
- **Screen sizes:** every size in `css/style.css` is written in design pixels (`var(--u)`). Up to 1920×1080 one design pixel is one pixel; on bigger screens (1440p, 4K) it grows, so the whole page keeps the same proportions instead of sitting small in the middle.
- **Colors:** primary (ink black), secondary (parchment beige) and accent (blood red) are
  `--p`, `--s` and `--a` at the top of `css/style.css`. Change those three to restyle everything.
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

**Caching:** players' devices keep a copy of the site so it opens instantly and works offline.
`index.html` and `js/data.js` are always fetched fresh when online, so normal session updates
show up right away. If you change anything else (CSS, `app.js`, `sound.js`, images, fonts), also
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

Give an NPC a `sheet` in `js/data.js` and its pop-up gets a character sheet laid out like the
D&D 2024 sheet: AC, HP, initiative, speed, proficiency bonus, passive Perception, the six
abilities with their saves and skills, weapons, features, spells and equipment. Enter the scores
and proficiencies; the modifiers and bonuses are worked out for you. Anything left out shows a dash.
The field list is at the top of `data.js`. Sheets are public like everything else, so keep
🔒 abilities off them.

## Portraits

Each NPC/PC in `data.js` has an `img` field (`null` shows the silhouette). It takes a path
in `img/` or a full image URL. Only use art we have permission to use, and credit the artist.

## Credits

- Map: free fan resource shared on Reddit.
- Fonts: Bodoni Moda, Inter, IBM Plex Mono (SIL Open Font License; self-hosted in `fonts/`).
