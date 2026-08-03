"""Génère les tracés SVG de la carte d'Afrique utilisés par la page Factbook.

    python3 scripts/build_africa_map.py

Source : GeoJSON public (Natural Earth 110m, johan/world.geo.json)
Sortie  : src/data/africa-map.json  ->  { width, height, countries: [{ iso3, name, d }] }

La projection (Mercator) est appliquée hors ligne pour que la PWA n'embarque
aucune dépendance cartographique ni appel réseau à l'exécution.
"""

import json
import math
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "src" / "data" / "africa-map.json"
SOURCE_URL = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json"

WIDTH = 760.0
HEIGHT = 800.0
PADDING = 8.0
MIN_AREA = 4.0  # px² : on ignore les îlots invisibles pour alléger le JSON.

AFRICA = {
    "DZA", "AGO", "BEN", "BWA", "BFA", "BDI", "CMR", "CPV", "CAF", "TCD",
    "COM", "COD", "COG", "CIV", "DJI", "EGY", "GNQ", "ERI", "SWZ", "ETH",
    "GAB", "GMB", "GHA", "GIN", "GNB", "KEN", "LSO", "LBR", "LBY", "MDG",
    "MWI", "MLI", "MRT", "MUS", "MAR", "MOZ", "NAM", "NER", "NGA", "RWA",
    "STP", "SEN", "SLE", "SOM", "ZAF", "SSD", "SDN", "TZA", "TGO", "TUN",
    "UGA", "ZMB", "ZWE", "ESH",
}

# Îles absentes du jeu 110m : dessinées comme un petit repère à leur position.
ISLANDS = {
    "CPV": ("Cape Verde", -23.6, 15.9),
    "STP": ("Sao Tome and Principe", 6.6, 0.3),
}

BBOX = (-26.0, -36.0, 52.0, 38.0)  # lon_min, lat_min, lon_max, lat_max


def mercator_y(lat: float) -> float:
    """Ordonnée Mercator exprimée dans la même unité que la longitude (degrés)."""
    lat = max(min(lat, 84.0), -84.0)
    return math.degrees(math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)))


class Projection:
    def __init__(self, bbox):
        lon_min, lat_min, lon_max, lat_max = bbox
        self.lon_min, self.lon_max = lon_min, lon_max
        self.y_min, self.y_max = mercator_y(lat_min), mercator_y(lat_max)
        scale_x = (WIDTH - 2 * PADDING) / (lon_max - lon_min)
        scale_y = (HEIGHT - 2 * PADDING) / (self.y_max - self.y_min)
        self.scale = min(scale_x, scale_y)
        self.dx = (WIDTH - self.scale * (lon_max - lon_min)) / 2
        self.dy = (HEIGHT - self.scale * (self.y_max - self.y_min)) / 2

    def __call__(self, lon: float, lat: float):
        x = self.dx + (lon - self.lon_min) * self.scale
        y = self.dy + (self.y_max - mercator_y(lat)) * self.scale
        return round(x, 1), round(y, 1)


def ring_area(points) -> float:
    total = 0.0
    for (x1, y1), (x2, y2) in zip(points, points[1:] + points[:1]):
        total += x1 * y2 - x2 * y1
    return abs(total) / 2


def polygons(geometry):
    if geometry["type"] == "Polygon":
        return [geometry["coordinates"]]
    if geometry["type"] == "MultiPolygon":
        return geometry["coordinates"]
    return []


def to_path(geometry, project) -> str:
    parts = []
    for polygon in polygons(geometry):
        for ring in polygon:
            points = [project(lon, lat) for lon, lat in ring]
            deduped = [p for i, p in enumerate(points) if i == 0 or p != points[i - 1]]
            if len(deduped) < 3 or ring_area(deduped) < MIN_AREA:
                continue
            head = deduped[0]
            body = "".join(f"L{x} {y}" for x, y in deduped[1:])
            parts.append(f"M{head[0]} {head[1]}{body}Z")
    return "".join(parts)


def island_path(lon: float, lat: float, project) -> str:
    x, y = project(lon, lat)
    r = 3.2
    return f"M{x - r} {y}L{x} {y - r}L{x + r} {y}L{x} {y + r}Z"


def main():
    with urllib.request.urlopen(SOURCE_URL, timeout=60) as response:
        geo = json.load(response)

    project = Projection(BBOX)
    countries = []
    for feature in geo["features"]:
        iso3 = feature.get("id")
        if iso3 not in AFRICA:
            continue
        path = to_path(feature["geometry"], project)
        if not path:
            continue
        countries.append({
            "iso3": iso3,
            "name": feature["properties"].get("name", iso3),
            "d": path,
        })

    present = {country["iso3"] for country in countries}
    for iso3, (name, lon, lat) in ISLANDS.items():
        if iso3 not in present:
            countries.append({"iso3": iso3, "name": name, "d": island_path(lon, lat, project)})

    countries.sort(key=lambda item: item["iso3"])
    payload = {"width": WIDTH, "height": HEIGHT, "countries": countries}
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(json.dumps(payload, ensure_ascii=False) + "\n", encoding="utf-8")
    size_kb = TARGET.stat().st_size / 1024
    print(f"{len(countries)} tracés -> {TARGET.relative_to(ROOT)} ({size_kb:.0f} Ko)")


if __name__ == "__main__":
    main()
