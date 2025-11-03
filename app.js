/* Lagekarte – Starter (Leaflet + MarkerCluster)
   Autor: Madleen 2.0 (für Marco)
   Hinweise:
   - Datenquelle: ./data/incidents.json (Demo)
   - Filter: Deliktart + Zeitraum
*/

// --- Hilfsfunktionen ---
function daysAgoToISO(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString();
}

function withinTimeRange(isoStr, rangeKey) {
  if (rangeKey === "ALL") return true;
  const ts = new Date(isoStr).toISOString();
  const now = new Date().toISOString();
  if (rangeKey === "24H") {
    return ts >= daysAgoToISO(1);
  }
  if (rangeKey === "7D") {
    return ts >= daysAgoToISO(7);
  }
  if (rangeKey === "30D") {
    return ts >= daysAgoToISO(30);
  }
  return true;
}

function iconForType(type) {
  // einfache farbliche Unterscheidung über Leaflet divIcon
  let bg = "#2563eb"; // blau default
  if (type === "Diebstahl") bg = "#10b981";      // grün
  if (type === "Verkehrsunfall") bg = "#f59e0b"; // gelb
  if (type === "Körperverletzung") bg = "#ef4444"; // rot
  if (type === "Ruhestörung") bg = "#8b5cf6";    // violett
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background:${bg};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,.2)"></div>`,
    iconSize: [16,16],
    iconAnchor: [8,8]
  });
}

// --- Karte initialisieren ---
const map = L.map('map', {
  minZoom: 5,
  worldCopyJump: true
}).setView([51.5, 7.4], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>-Mitwirkende'
}).addTo(map);

// Layer-Gruppen
const clusterGroup = L.markerClusterGroup();
const plainGroup = L.layerGroup(); // falls du ohne Cluster umschalten willst

// Control: Legende
const legend = L.control({position: 'bottomright'});
legend.onAdd = function() {
  const div = L.DomUtil.create('div', 'legend');
  div.innerHTML = `
    <div class="item"><span class="dot" style="background:#10b981"></span>Diebstahl</div>
    <div class="item"><span class="dot" style="background:#f59e0b"></span>Verkehrsunfall</div>
    <div class="item"><span class="dot" style="background:#ef4444"></span>Körperverletzung</div>
    <div class="item"><span class="dot" style="background:#8b5cf6"></span>Ruhestörung</div>
  `;
  return div;
};
legend.addTo(map);

// Datenzustand
let allIncidents = [];
let currentMarkers = [];

// Filterelemente
const filterTypeEl = document.getElementById('filterType');
const filterTimeEl = document.getElementById('filterTime');
const resetBtn = document.getElementById('resetBtn');

// Daten laden
fetch('./data/incidents.json')
  .then(r => r.json())
  .then(data => {
    allIncidents = data;
    renderMarkers();
  })
  .catch(err => {
    console.error('Fehler beim Laden der Daten:', err);
  });

function clearMarkers() {
  currentMarkers.forEach(m => {
    clusterGroup.removeLayer(m);
    plainGroup.removeLayer(m);
  });
  currentMarkers = [];
}

function renderMarkers() {
  clearMarkers();
  const typeFilter = filterTypeEl.value;
  const timeFilter = filterTimeEl.value;

  const filtered = allIncidents.filter(inc => {
    const matchesType = (typeFilter === "ALL") ? true : (inc.type === typeFilter);
    const matchesTime = withinTimeRange(inc.timestamp, timeFilter);
    return matchesType && matchesTime;
  });

  filtered.forEach(inc => {
    const marker = L.marker([inc.lat, inc.lng], { icon: iconForType(inc.type) });
    const html = `
      <div class="marker-popup">
        <h3>${inc.title}</h3>
        <p><strong>ID:</strong> ${inc.id}</p>
        <p><strong>Delikt:</strong> ${inc.type}</p>
        <p><strong>Zeit:</strong> ${new Date(inc.timestamp).toLocaleString()}</p>
        <p>${inc.desc || ""}</p>
      </div>
    `;
    marker.bindPopup(html);
    clusterGroup.addLayer(marker);
    currentMarkers.push(marker);
  });

  if (!map.hasLayer(clusterGroup)) {
    map.addLayer(clusterGroup);
  }

  // Karte passend zoomen
  if (currentMarkers.length > 0) {
    const group = L.featureGroup(currentMarkers);
    map.fitBounds(group.getBounds().pad(0.2));
  }
}

// Events
filterTypeEl.addEventListener('change', renderMarkers);
filterTimeEl.addEventListener('change', renderMarkers);
resetBtn.addEventListener('click', () => {
  filterTypeEl.value = "ALL";
  filterTimeEl.value = "ALL";
  renderMarkers();
});

// Optional: Tastenkürzel (r = reset)
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'r') {
    resetBtn.click();
  }
});
