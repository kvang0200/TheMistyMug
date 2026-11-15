# The Barovian Archive

A player-facing wiki for our Curse of Strahd campaign.

**Player-safe only.** Everything in this repo is public. Never add DM secrets, 🔒 content,
unmet NPCs, or quests the party hasn't started.

## Files

| Path | What it is | Changes after a session? |
|---|---|---|
| `js/data.js` | All campaign content: sessions, NPCs, places, Tarokka, fortunes, quests, party, plus map pins and the travel trail | **Yes** (usually the only file) |
| `index.html` | Page skeleton: gate, header, tab sections, pop-up markup | Rarely |
| `css/style.css` | All styling and animation | Rarely |
| `js/app.js` | Tabs, cards, pop-ups, search, map, effects | Rarely |
| `js/sound.js` | Synthesized click/card effects plus an occasional distant howl or bell (Web Audio, no sound files) | Rarely |
| `sw.js` | Offline cache (service worker) | Bump `VERSION` when anything except `data.js` changes |
| `fonts/` | Self-hosted Cinzel, Cinzel Decorative (700) and Cormorant Garamond, subset to Latin; OFL licences included | No |
| `img/` | Map (`barovia-map.webp` 2000px + `barovia-map-1000.webp` preview), fog layers, grain/ink textures, app icons, portraits | When adding art or fog changes |

No build step. Edit a file, commit, and Pages republishes in a minute or two.

**Caching:** players' devices keep a copy of the site so it opens instantly and works offline.
`index.html` and `js/data.js` are always fetched fresh when online, so normal session updates
show up right away. If you change anything else (CSS, `app.js`, `sound.js`, images, fonts), also
change `VERSION` at the top of `sw.js` (today's date is fine) so devices drop their old copies.

**Map files:** if you edit the map art, export both sizes: `barovia-map.webp` at 2000×1364 and
`barovia-map-1000.webp` at 1000×682. The small one shows first; the big one loads when someone zooms in.

## After each session

1. In `js/data.js`:
   - Bump `lastSession`, update `flavor`, `location`, and `level` if the party leveled.
   - Add the session to `sessions` (summary written from what happened, not prep notes).
   - Add or update NPCs (`met` = session first met; `side` = ally / unsure / foe; `fate`).
     Anything whose `met` or `s` equals `lastSession` gets a **New** badge automatically.
   - Add places (`s` = session first visited) and update quests (`st` = ongoing / done).
   - Map: add a pin to `PINS` and extend `TRAIL_MAIN` / `TRAIL_SIDE` for new travel.
2. If the party explored new ground, re-cut the holes in `img/fog.webp` and `img/fog2.webp`
   (same holes in both; coordinates are on the 2000×1364 map).
3. Check for spoilers, commit, push.

## Portraits

Each NPC/PC in `data.js` has an `img` field (`null` shows the silhouette). It takes a path
in `img/` or a full image URL. Only use art we have permission to use, and credit the artist.

## Credits

- Map: free fan resource shared on Reddit.
- Fonts: Cinzel, Cinzel Decorative, Cormorant Garamond (SIL Open Font License; self-hosted in `fonts/`).
