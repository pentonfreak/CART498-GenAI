# RAIDLINE

RAIDLINE is a static Escape from Tarkov field guide with searchable map cards,
map-specific location and PMC extract summaries, raid preparation notes, and a
Gunsmith task index. Extract information was checked in October 2026. The map
art is a decorative schematic and is not to scale.

## Run the app

No install or build step is needed. Open `index.html` in a browser.

To serve it locally, open a terminal in this folder and run:

```bash
python -m http.server 8000
```

Then visit <http://localhost:8000>. On Windows, use `py -m http.server 8000`
if `python` is unavailable.

## Project files

- `index.html` — app entry point and page structure.
- `style.css` — layout, responsive styling, and map viewer presentation.
- `script.js` — map data, search, filters, modal viewer, and map controls.
- `gunsmith.html` — searchable Gunsmith task index with links to current build
  guides.

The map search includes landmarks and extract names. Play-style and difficulty
filters can be combined with search. Raid-prep checkbox selections are saved in
the browser when local storage is available.

Game data can change with patches. The Gunsmith page records the patch used for
its task index and links to sources for current parts and requirements. Confirm
the final build against the in-game task before handing it in.

Google Fonts are loaded from the network; system sans-serif and monospace
fonts are used as fallbacks.
