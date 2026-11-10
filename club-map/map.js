/* AJV club map: Leaflet + OpenStreetMap, data from clubs.json. No third-party map service needed. */
(function () {
  'use strict';

  // Base map. OSM is the default; swisstopo's free grey map is a good alternative for a Swiss site.
  var TILES = {
    osm: {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      options: { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }
    },
    swisstopo: {
      url: 'https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg',
      options: { maxZoom: 18, attribution: '&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>' }
    }
  };
  var params = new URLSearchParams(location.search);
  var base = TILES[params.get('tiles')] || TILES.osm;

  var map = L.map('map', { scrollWheelZoom: false, minZoom: 8 });
  L.tileLayer(base.url, base.options).addTo(map);
  map.setView([47.39, 8.15], 10);

  // Only zoom with the mouse wheel once the user has clicked into the map (avoids hijacking page scroll in the iframe).
  map.on('click', function () { map.scrollWheelZoom.enable(); });
  map.on('mouseout', function () { map.scrollWheelZoom.disable(); });

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function safeUrl(u) {
    return /^(https?:|mailto:|tel:)/i.test(u || '') ? u : null;
  }

  function popupHtml(c) {
    var h = '<div class="club-popup">';
    if (safeUrl(c.logo)) h += '<img src="' + esc(c.logo) + '" alt="">';
    h += '<h3>' + esc(c.name) + '</h3>';
    if (c.address) h += '<p>' + esc(c.address) + '</p>';
    if (c.description) h += '<p>' + esc(c.description) + '</p>';
    if (c.email) h += '<p><a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a></p>';
    if (safeUrl(c.website)) h += '<a class="club-link" href="' + esc(c.website) + '" target="_blank" rel="noopener">Zur Website</a>';
    return h + '</div>';
  }

  function pinIcon(c) {
    return L.divIcon({
      className: '',
      html: '<div class="club-pin"' + (c.color ? ' style="--pin:' + esc(c.color) + '"' : '') + '><span>' + esc(c.label || '') + '</span></div>',
      iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -26]
    });
  }

  function getJson(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(url + ': ' + r.status);
      return r.json();
    });
  }

  // Canton outline, plus a soft mask that dims everything outside Aargau.
  getJson('aargau.geojson').then(function (gj) {
    var ring = gj.features[0].geometry.coordinates[0].map(function (p) { return [p[1], p[0]]; });
    var world = [[90, -180], [90, 180], [-90, 180], [-90, -180]];
    L.polygon([world, ring], { stroke: false, fillColor: '#fff', fillOpacity: 0.55, interactive: false }).addTo(map);
    var outline = L.polygon(ring, { color: '#c8102e', weight: 2, fill: false, interactive: false }).addTo(map);
    map.fitBounds(outline.getBounds(), { padding: [10, 10] });
    map.setMaxBounds(outline.getBounds().pad(0.6));
  }).catch(function (e) { console.error(e); });

  getJson('clubs.json').then(function (clubs) {
    clubs.forEach(function (c) {
      if (typeof c.lat !== 'number' || typeof c.lng !== 'number') return;
      L.marker([c.lat, c.lng], { icon: pinIcon(c), title: c.name, alt: c.name })
        .bindPopup(popupHtml(c), { maxWidth: 260 })
        .addTo(map);
    });
  }).catch(function (e) { console.error(e); });
})();
