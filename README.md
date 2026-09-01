# casino-move-library

A webpage hosting a list of links to casino moves

A static, searchable/filterable library of Rueda de Casino dance moves, with English translations and links to demo videos. Built with plain HTML/CSS/JS so it can be published directly via GitHub Pages — no build step required.

Live site: https://agile-heresy.github.io/casino-move-library/

## Features

- Two tabs:
  - **Current Library** ([data/sections](data/sections)) — actively maintained moves, split into section files such as [data/sections/rueda-moves.json](data/sections/rueda-moves.json) and [data/sections/rueda-structures.json](data/sections/rueda-structures.json).
  - **Tumblr Archive** ([data/archive.json](data/archive.json)) — an older move list and video links exported from the [Azucar GMU Tumblr](https://azucar-gmu.tumblr.com/), organized by level (Beginner, Intermediate, Intermediate II, Structures).
- Search plus move-type/family dropdown filters on each tab.
- English translations shown under each move name, with alt names ("Also known as") and variants each carrying their own translation.
- Light/dark theme toggle (persisted in `localStorage`, defaults to OS preference).
- English/Spanish interface toggle using Cuban and U.S. flags (persisted in `localStorage`); it translates page copy, controls, and move-type/level labels without changing the JSON-backed move data.

## Structure

- `index.html` — page markup, tabs, header
- `assets/css/style.css` — styling (theme variables, card layout)
- `assets/js/main.js` — loads both JSON files, renders cards, and handles search/filtering, theme, and language toggles
- `data/sections/*.json` — current library, split by section and sorted alphabetically within family and move name
- `data/archive.json` — historical Tumblr archive (edit if you find corrections to old entries)

## Data schema

Each file in `data/sections/` is a JSON array of move objects. Each move looks like:

```json
{
  "name": "Enchufla",
  "section": "Rueda Moves",
  "category": "Enchufla",
  "video": "https://www.youtube.com/watch?v=VIDEO_ID",
  "translation": "Plug In / Connect",
  "altNames": [{ "name": "Alt Name", "translation": "English Gloss" }],
  "variants": [{ "name": "Doble", "translation": "Double" }],
  "note": "Optional choreography note"
}
```

- `section` / `category` power the move-type and family filters (generated automatically from whatever values appear in the data).
- `altNames` — alternate names for the same move.
- `variants` — named variations or versions of the move.
- `translation` / each alt name's / each variant's `translation` should always be filled in — for already-English words (proper nouns, loanwords), just repeat the word itself.
- `note` is optional and used only when a move needs extra choreography context.

`data/archive.json` has the same per-move shape, but wraps moves in `{ "sectionNotes": {...}, "moves": [...] }` and uses `videos: [{ "label": "Leader's video", "url": "..." }]` (an array, since Tumblr often listed multiple videos per move) instead of a single `video` string.

> **Note:** Some entries still have an empty `video`/`videos` field — fill them in with real YouTube links as you find/record them. Cards without a video show "No video yet" instead of a link.

## Running locally

Because the page fetches the JSON files via `fetch()`, open it through a local server rather than double-clicking the file (browsers block `fetch` on `file://` URLs):

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.
