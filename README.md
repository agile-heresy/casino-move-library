# casino-move-library
A webpage hosting a list of links to casino moves

A static, searchable/filterable library of Rueda de Casino dance moves, organized by section (Individual Couple Moves, Rueda Structures) and category (Musicality, Enchufla, Caminala, etc.), each linking to a demo video. Built with plain HTML/CSS/JS so it can be published directly via GitHub Pages — no build step required.

## Structure

- `index.html` — page markup
- `assets/css/style.css` — styling
- `assets/js/main.js` — loads `data/moves.json`, renders cards, handles search/filtering
- `data/moves.json` — the list of moves (edit this to add/update entries)

## Adding a move

Add an object to `data/moves.json`:

```json
{
  "name": "Move Name",
  "section": "Individual Couple Moves",
  "category": "Enchufla",
  "video": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

Section and category filters are generated automatically from whatever values appear in the data.

> **Note:** Most entries currently have an empty `video` field — fill them in with real YouTube links as you find/record them. Cards without a video show "No video yet" instead of a link.

## Running locally

Because the page fetches `data/moves.json` via `fetch()`, open it through a local server rather than double-clicking the file (browsers block `fetch` on `file://` URLs):

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publishing to GitHub Pages

1. Push this repo to GitHub.
2. In the repo settings, go to **Pages**.
3. Set the source to the `main` branch, root folder.
4. Your site will be published at `https://<username>.github.io/casino-move-library/`.
