# casino-move-library

A webpage hosting a list of links to casino moves

A static, searchable/filterable library of Rueda de Casino dance moves, with English translations and links to demo videos. Built with plain HTML/CSS/JS so it can be published directly via GitHub Pages — no build step required.

Live site: https://agile-heresy.github.io/casino-move-library/

## Features

- Two tabs:
  - **Current Library** ([data/moves.json](data/moves.json)) — actively maintained moves, organized by move type (e.g. Rueda Moves, Partnerwork, Rueda Structures) and family (e.g. Enchufla, Vacila, Caminala).
  - **Tumblr Archive** ([data/archive.json](data/archive.json)) — an older move list and video links exported from the [Azucar GMU Tumblr](https://azucar-gmu.tumblr.com/), organized by level (Beginner, Intermediate, Intermediate II, Structures).
- Search plus move-type/family dropdown filters on each tab.
- English translations shown under each move name, with alt names ("Also known as") and variants each carrying their own translation.
- Light/dark theme toggle (persisted in `localStorage`, defaults to OS preference).

## Structure

- `index.html` — page markup, tabs, header
- `assets/css/style.css` — styling (theme variables, card layout)
- `assets/js/main.js` — loads both JSON files, renders cards, handles search/filtering/theme toggle
- `data/moves.json` — current move list (edit this to add/update entries)
- `data/archive.json` — historical Tumblr archive (edit if you find corrections to old entries)

## Data schema

Each move in `data/moves.json` looks like:

```json
{
  "name": "Enchufla",
  "section": "Rueda Moves",
  "category": "Enchufla",
  "video": "https://www.youtube.com/watch?v=VIDEO_ID",
  "translation": "Plug In / Connect",
  "altNames": [{ "name": "Alt Name", "translation": "English Gloss" }],
  "variants": [{ "name": "Doble", "translation": "Double" }]
}
```

- `section` / `category` power the move-type and family filters (generated automatically from whatever values appear in the data).
- `altNames` — names in the original text separated by `/` (different names for the same move).
- `variants` — text that was in parentheses in the original name (variations on how the move is performed).
- `translation` / each alt name's / each variant's `translation` should always be filled in — for already-English words (proper nouns, loanwords), just repeat the word itself.

`data/archive.json` has the same per-move shape, but wraps moves in `{ "sectionNotes": {...}, "moves": [...] }` and uses `videos: [{ "label": "Leader's video", "url": "..." }]` (an array, since Tumblr often listed multiple videos per move) instead of a single `video` string. `note` is an optional free-text field for choreography descriptions that didn't have a video.

> **Note:** Some entries still have an empty `video`/`videos` field — fill them in with real YouTube links as you find/record them. Cards without a video show "No video yet" instead of a link.

## Running locally

Because the page fetches the JSON files via `fetch()`, open it through a local server rather than double-clicking the file (browsers block `fetch` on `file://` URLs):

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.
