# AJV Clubkarte

Self-hosted replacement for the Atlist map. Leaflet + OpenStreetMap tiles, no subscription,
no API key. Everything (Leaflet, canton outline) is in this folder; only the map tiles load
from openstreetmap.org.

## Embed

Upload this folder to the web space (e.g. `/club-map/`) and replace the Atlist `<iframe>` with:

```html
<iframe src="/club-map/" title="AJV Clubkarte" style="width:100%;height:520px;border:0" loading="lazy"></iframe>
```

Add `?tiles=swisstopo` to the URL for the grey swisstopo base map instead of OSM.

## Edit clubs

All clubs live in `clubs.json`. One entry per club:

| Field         | Required | Notes                                        |
|---------------|----------|----------------------------------------------|
| `name`        | yes      | Shown as popup title and marker tooltip      |
| `lat`, `lng`  | yes      | Coordinates, e.g. right-click in Google Maps |
| `address`     | no       |                                              |
| `description` | no       | e.g. training times                          |
| `website`     | no       | Shows a "Zur Website" button                 |
| `email`       | no       |                                              |
| `logo`        | no       | Image URL shown at the top of the popup      |
| `label`       | no       | Short text inside the pin (e.g. "JC")        |
| `color`       | no       | Pin colour, e.g. `#0055a4`                   |

Test locally with `python3 -m http.server` inside this folder (opening the file directly
won't load the JSON).

## Sources

- Leaflet 1.9.4 (BSD-2), `vendor/leaflet/`
- Canton outline: `swiss-maps` 4.7.0 (swisstopo boundaries 2024), `aargau.geojson`
