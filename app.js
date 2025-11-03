// Map settings for Ochtrup (Latitude: 52.100, Longitude: 7.575)
const map = L.map('map', { minZoom: 12, maxZoom: 19 }).setView([52.100, 7.575], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>-Mitwirkende'
}).addTo(map);

// Marker cluster group
const clusterGroup = L.markerClusterGroup();

// Sample data: fictional incidents around Ochtrup
const incidents = [
  { id: "OCH-001", type: "Diebstahl", title: "Diebstahl im Supermarkt", description: "Ein Diebstahl von Lebensmittel im Wert von ca. 50 Euro.", lat: 52.105, lng: 7.580, timestamp: "2025-10-30T10:00:00Z" },
  { id: "OCH-002", type: "Verkehrsunfall", title: "Unfall an der Kreuzung", description: "Zwei Fahrzeuge kollidierten an der Kreuzung. Keine Verletzten.", lat: 52.107, lng: 7.573, timestamp: "2025-10-29T15:30:00Z" },
  { id: "OCH-003", type: "Körperverletzung", title: "Auseinandersetzung im Park", description: "Streit eskalierte zu einer Schlägerei, leicht verletzt.", lat: 52.102, lng: 7.569, timestamp: "2025-10-28T20:15:00Z" },
  { id: "OCH-004", type: "Ruhestörung", title: "Laute Musik nachts", description: "Mehrere Anwohner beschwerten sich über laute Musik aus einer Wohnung.", lat: 52.101, lng: 7.571, timestamp: "2025-10-27T23:45:00Z" }
];

// Function to create custom marker icons
function iconForType(type) {
  let color = "#2563eb"; // Default: Blue
  if (type === "Diebstahl") color = "#10b981";
  if (type === "Verkehrsunfall") color = "#f59e0b";
  if (type === "Körperverletzung") color = "#ef4444";
  if (type === "Ruhestörung") color = "#8b5cf6";
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;"></div>`,
    iconSize: [16,16],
    iconAnchor: [8,8]
  });
}

// Add markers to the map
incidents.forEach(incident => {
  const marker = L.marker([incident.lat, incident.lng], { icon: iconForType(incident.type) });
  const popupContent = `
    <h3>${incident.title}</h3>
    <p><strong>Delikt:</strong> ${incident.type}</p>
    <p><strong>Zeit:</strong> ${new Date(incident.timestamp).toLocaleString()}</p>
    <p>${incident.description}</p>
  `;
  marker.bindPopup(popupContent);
  clusterGroup.addLayer(marker);
});

map.addLayer(clusterGroup);

// Filter setup
const filterTypeEl = document.getElementById('filterType');
const resetBtn = document.getElementById('resetBtn');

// Render filtered markers
filterTypeEl.addEventListener('change', () => {
  const selectedType = filterTypeEl.value;
  const filteredIncidents = incidents.filter(incident => selectedType === "ALL" || incident.type === selectedType);
  clusterGroup.clearLayers();
  filteredIncidents.forEach(incident => {
    const marker = L.marker([incident.lat, incident.lng], { icon: iconForType(incident.type) });
    const popupContent = `
      <h3>${incident.title}</h3>
      <p><strong>Delikt:</strong> ${incident.type}</p>
      <p><strong>Zeit:</strong> ${new Date(incident.timestamp).toLocaleString()}</p>
      <p>${incident.description}</p>
    `;
    marker.bindPopup(popupContent);
    clusterGroup.addLayer(marker);
  });
});

// Reset button
resetBtn.addEventListener('click', () => {
  filterTypeEl.value = "ALL";
  filterTypeEl.dispatchEvent(new Event('change'));
});
