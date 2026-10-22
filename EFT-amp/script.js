const maps = [
  {name:'Customs', code:'CSTM // 001', type:'beginner', tag:'MOST PLAYED', extracts:12, difficulty:'Moderate', best:'First raids', blurb:'An industrial sprawl with long sightlines, tight dorms, and more than one way to cross the river.'},
  {name:'Shoreline', code:'SHRL // 002', type:'pvp', tag:'PVP HEAVY', extracts:14, difficulty:'Hard', best:'Long range', blurb:'A wide coastal map where patience pays off. Learn the resort approaches before you chase the loot.'},
  {name:'Factory', code:'FCTY // 003', type:'pvp', tag:'CLOSE QUARTERS', extracts:5, difficulty:'Hard', best:'Fast XP', blurb:'Small, loud, and immediate. Bring a plan for the first thirty seconds — then adapt.'},
  {name:'Woods', code:'WDS // 004', type:'beginner', tag:'LOW PROFILE', extracts:16, difficulty:'Moderate', best:'Scav runs', blurb:'A forest of hidden angles and open fields. Compass discipline is your best teammate.'},
  {name:'Reserve', code:'RSRV // 005', type:'pvp', tag:'HIGH VALUE', extracts:13, difficulty:'Hard', best:'Experienced', blurb:'Underground bunkers, raiders, and a one-way train. Reserve rewards players who know their exits.'},
  {name:'Ground Zero', code:'GRND // 006', type:'beginner', tag:'START HERE', extracts:9, difficulty:'Easy', best:'New players', blurb:'A compact city map made for learning the rhythm of a raid without getting lost.'}
];
const grid = document.querySelector('#mapGrid');
const empty = document.querySelector('#emptyState');
function render(filter = 'all', query = '') {
  const shown = maps.filter(map => (filter === 'all' || map.type === filter) && map.name.toLowerCase().includes(query.toLowerCase()));
  grid.innerHTML = shown.map(map => `<article class="map-card" data-map="${map.name.toLowerCase()}" data-name="${map.name}"><div class="card-map"><span class="card-tag">${map.tag}</span><span class="card-code">${map.code}</span></div><div class="card-body"><h3>${map.name}</h3><p>${map.blurb}</p><div class="card-meta"><span>${map.extracts} EXTRACTS</span><b>OPEN GUIDE ↗</b></div></div></article>`).join('');
  empty.style.display = shown.length ? 'none' : 'block';
  document.querySelectorAll('.map-card').forEach(card => card.addEventListener('click', () => openModal(maps.find(map => map.name === card.dataset.name))));
}
const modal = document.querySelector('#mapModal');
function openModal(map) {
  document.querySelector('#modalTitle').textContent = map.name;
  document.querySelector('#modalBlurb').textContent = map.blurb;
  document.querySelector('#modalExtracts').textContent = map.extracts;
  document.querySelector('#modalDifficulty').textContent = map.difficulty;
  document.querySelector('#modalBest').textContent = map.best;
  document.querySelector('#modalCode').textContent = map.code;
  document.querySelector('#markerInfo').innerHTML = '<span>CLICK A MARKER</span><strong>Explore the map</strong><p>Select an extract, loot spot, or danger marker for field notes.</p>';
  resetMap();
  modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false');
}
function closeModal(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); }
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => { document.querySelector('.filter.active').classList.remove('active'); button.classList.add('active'); render(button.dataset.filter, document.querySelector('#search').value); }));
document.querySelector('#search').addEventListener('input', event => render(document.querySelector('.filter.active').dataset.filter, event.target.value));
document.querySelector('#closeModal').addEventListener('click', closeModal);
modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });
const mapCanvas = document.querySelector('#mapCanvas');
const mapViewport = document.querySelector('#interactiveMap');
let scale = 1; let panX = 0; let panY = 0; let dragging = false; let startX = 0; let startY = 0;
function updateMap(){ mapCanvas.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`; document.querySelector('#zoomReadout').textContent = `${Math.round(scale * 100)}%`; }
function resetMap(){ scale = 1; panX = 0; panY = 0; updateMap(); }
function zoom(delta){ scale = Math.min(2.2, Math.max(.75, scale + delta)); updateMap(); }
document.querySelector('#zoomIn').addEventListener('click', () => zoom(.2));
document.querySelector('#zoomOut').addEventListener('click', () => zoom(-.2));
document.querySelector('#resetZoom').addEventListener('click', resetMap);
mapViewport.addEventListener('wheel', event => { event.preventDefault(); zoom(event.deltaY > 0 ? -.1 : .1); }, {passive:false});
mapViewport.addEventListener('pointerdown', event => { dragging = true; startX = event.clientX - panX; startY = event.clientY - panY; mapViewport.setPointerCapture(event.pointerId); mapViewport.classList.add('dragging'); });
mapViewport.addEventListener('pointermove', event => { if (!dragging) return; panX = event.clientX - startX; panY = event.clientY - startY; updateMap(); });
mapViewport.addEventListener('pointerup', () => { dragging = false; mapViewport.classList.remove('dragging'); });
document.querySelectorAll('.marker').forEach(marker => marker.addEventListener('click', event => { event.stopPropagation(); document.querySelector('#markerInfo').innerHTML = `<span>${marker.classList[1].toUpperCase()} INTEL</span><strong>${marker.dataset.title}</strong><p>${marker.dataset.info}</p>`; }));
document.querySelectorAll('.layer-toggle').forEach(toggle => toggle.addEventListener('change', () => { document.querySelectorAll(`.marker.${toggle.dataset.layer}`).forEach(marker => marker.style.display = toggle.checked ? 'grid' : 'none'); }));
render();
