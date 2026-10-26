const maps = [
  { name: 'Customs', code: 'CSTM // 001', type: 'beginner', tag: 'MOST PLAYED', difficulty: 'Moderate', best: 'First raids', blurb: 'An industrial map split by the river, with Dorms, the Stronghold, and long crossings between them.', poi: ['Big Red', 'Dorms', 'New Gas Station', 'Stronghold', 'ZB-1011'], extracts: ['Crossroads', 'Trailer Park', 'ZB-013 (switch and key)', 'Old Gas Station (conditional)', 'ZB-1011', 'Dorms V-Ex (paid)', 'Railroad Passage (flare)', 'Railway to Reserve'], source: 'https://tarkov.help/en/map/customs/extractions', art: 'customs' },
  { name: 'Shoreline', code: 'SHRL // 002', type: 'pvp', tag: 'LONG SIGHTLINES', difficulty: 'Hard', best: 'Long range', blurb: 'A broad coastal map built around the Health Resort, with exposed routes between its outer landmarks.', poi: ['Health Resort', 'Pier', 'Weather Station', 'Power Station', 'Village'], extracts: ['Path to Lighthouse', 'Road to Customs', 'Railway Bridge', 'Pier Boat (conditional)', 'Tunnel', 'Road to North V-Ex (paid)', "Climber's Trail (gear requirement)"], source: 'https://tarkov.help/en/map/shoreline/extractions', art: 'shoreline' },
  { name: 'Factory', code: 'FCTY // 003', type: 'pvp', tag: 'CLOSE QUARTERS', difficulty: 'Hard', best: 'Fast raids', blurb: 'A compact industrial maze. Expect contact near the offices, forklifts, and central corridors.', poi: ['Office', 'Forklifts', 'Glass Hallway', 'Medical Tent', 'Gate 3'], extracts: ['Cellars (key required)', 'Gate 3', 'Gate 0 (key required)', 'Med Tent Gates (key required)', 'Courtyard Gate (conditional)'], source: 'https://tarkov.help/en/map/factory/extractions', art: 'factory' },
  { name: 'Woods', code: 'WDS // 004', type: 'beginner', tag: 'OPEN TERRAIN', difficulty: 'Moderate', best: 'Scav runs', blurb: 'A forest map with long sightlines around the lake, Sawmill, and central ridgeline.', poi: ['Sawmill', 'USEC Camp', 'Scav Village', 'Military Camp', 'Sniper Rock'], extracts: ['Bridge V-Ex (paid)', 'Northern UN Roadblock', 'ZB-016 (conditional)', 'Outskirts', 'UN Roadblock', 'RUAF Gate', 'ZB-014 (key required)', 'Power Line Passage (flare)'], source: 'https://tarkov.help/en/map/woods/extractions', art: 'woods' },
  { name: 'Reserve', code: 'RSRV // 005', type: 'pvp', tag: 'BUNKER NETWORK', difficulty: 'Hard', best: 'Experienced', blurb: 'A military base with a dense underground bunker network, exposed courtyards, and a timed train.', poi: ['Dome', 'Queen', 'King', 'Bunker', 'Armored Train'], extracts: ['Cliff Descent (no armor and required item)', 'Sewer Manhole (no backpack)', 'Armored Train (timed)', 'Bunker Hermetic Door (switch)', 'D-2'], source: 'https://tarkov.help/en/map/reserve/extractions', art: 'reserve' },
  { name: 'Ground Zero', code: 'GRND // 006', type: 'beginner', tag: 'START HERE', difficulty: 'Easy', best: 'New players', blurb: 'A compact city center with the TerraGroup offices, an underground parking area, and close street fights.', poi: ['TerraGroup HQ', 'Concordia', 'Emercom Station', 'Nakatani Basement', 'Pinewood'], extracts: ['Police Cordon V-Ex (paid)', 'Emercom Checkpoint', 'Mira Ave (flare)', 'Nakatani Basement Stairs'], source: 'https://tarkov.help/en/map/ground-zero/extractions', art: 'ground-zero' }
];

const grid = document.querySelector('#mapGrid');
const empty = document.querySelector('#emptyState');
const search = document.querySelector('#search');
const difficultyFilter = document.querySelector('#difficultyFilter');
const modal = document.querySelector('#mapModal');
const mapCanvas = document.querySelector('#mapCanvas');
const mapViewport = document.querySelector('#interactiveMap');
let returnFocus = null;

function render(filter = 'all', query = '') {
  const term = query.trim().toLowerCase();
  const difficulty = difficultyFilter.value;
  const shown = maps.filter(map => {
    const searchable = [map.name, map.blurb, map.tag, map.best, ...map.poi, ...map.extracts].join(' ').toLowerCase();
    return (filter === 'all' || map.type === filter) &&
      (difficulty === 'all' || map.difficulty === difficulty) &&
      (!term || searchable.includes(term));
  });

  grid.innerHTML = shown.map(map => `<button class="map-card" type="button" data-map="${map.art}" data-name="${map.name}">
    <span class="card-map"><span class="card-tag">${map.tag}</span><span class="card-code">${map.code}</span><span class="card-area">${map.poi.slice(0, 3).join(' · ')}</span></span>
    <span class="card-body"><span class="card-title">${map.name}</span><span class="card-description">${map.blurb}</span><span class="card-meta"><span>${map.extracts.length} PMC EXTRACTS LISTED</span><b>OPEN FIELD INTEL ↗</b></span></span>
  </button>`).join('');
  empty.style.display = shown.length ? 'none' : 'block';
  grid.querySelectorAll('.map-card').forEach(card => card.addEventListener('click', () => openModal(maps.find(map => map.name === card.dataset.name), card)));
}

function openModal(map, trigger) {
  if (!map) return;
  returnFocus = trigger;
  document.querySelector('#modalTitle').textContent = map.name;
  document.querySelector('#modalBlurb').textContent = map.blurb;
  document.querySelector('#modalCode').textContent = map.code;
  document.querySelector('#modalDifficulty').textContent = map.difficulty;
  document.querySelector('#modalBest').textContent = map.best;
  document.querySelector('#modalExtracts').textContent = map.extracts.length;
  mapCanvas.dataset.map = map.art;
  mapCanvas.innerHTML = `<div class="schematic-label schematic-one">${map.poi[0]}</div><div class="schematic-label schematic-two">${map.poi[1]}</div><div class="schematic-label schematic-three">${map.poi[2]}</div><div class="schematic-stamp">${map.code}</div>`;
  document.querySelector('#mapIntel').innerHTML = `<h3>Key locations</h3><ul>${map.poi.map(point => `<li>${point}</li>`).join('')}</ul><h3>PMC extracts</h3><ul>${map.extracts.map(point => `<li>${point}</li>`).join('')}</ul><a href="${map.source}" target="_blank" rel="noreferrer">Check current extract details ↗</a>`;
  resetMap();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.querySelector('#closeModal').focus();
}

function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  if (returnFocus?.isConnected) returnFocus.focus();
}

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  const previous = document.querySelector('.filter.active');
  previous?.classList.remove('active');
  previous?.setAttribute('aria-pressed', 'false');
  button.classList.add('active');
  button.setAttribute('aria-pressed', 'true');
  render(button.dataset.filter, search.value);
}));
search.addEventListener('input', () => render(document.querySelector('.filter.active').dataset.filter, search.value));
difficultyFilter.addEventListener('change', () => render(document.querySelector('.filter.active').dataset.filter, search.value));
document.querySelector('#closeModal').addEventListener('click', closeModal);
modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', event => {
  if (!modal.classList.contains('open')) return;
  if (event.key === 'Escape') closeModal();
  if (event.key === 'Tab') {
    const focusable = [...modal.querySelectorAll('a[href], button:not([disabled]), [tabindex="0"]')];
    const first = focusable[0]; const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

let scale = 1;
function updateMap() {
  mapCanvas.style.transform = `scale(${scale})`;
  document.querySelector('#zoomReadout').textContent = `${Math.round(scale * 100)}%`;
}
function resetMap() { scale = 1; updateMap(); }
function zoom(delta) { scale = Math.min(1.8, Math.max(.8, scale + delta)); updateMap(); }
document.querySelector('#zoomIn').addEventListener('click', () => zoom(.2));
document.querySelector('#zoomOut').addEventListener('click', () => zoom(-.2));
document.querySelector('#resetZoom').addEventListener('click', resetMap);
mapViewport.addEventListener('wheel', event => { event.preventDefault(); zoom(event.deltaY > 0 ? -.1 : .1); }, { passive: false });

const menuToggle = document.querySelector('#menuToggle');
const primaryNav = document.querySelector('#primaryNav');
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  primaryNav.classList.toggle('open', open);
});
primaryNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open navigation');
  primaryNav.classList.remove('open');
}));

const prepChecks = [...document.querySelectorAll('[data-prep]')];
try {
  const saved = JSON.parse(localStorage.getItem('raidline-prep') || '{}');
  prepChecks.forEach(check => { check.checked = Boolean(saved[check.dataset.prep]); });
} catch { /* Storage may be disabled; checklist still works for this visit. */ }
prepChecks.forEach(check => check.addEventListener('change', () => {
  const state = Object.fromEntries(prepChecks.map(item => [item.dataset.prep, item.checked]));
  try { localStorage.setItem('raidline-prep', JSON.stringify(state)); } catch { /* Keep the interaction usable without storage. */ }
}));

render();
