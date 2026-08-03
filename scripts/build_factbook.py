"""Convertit le classeur CIA Factbook FMCG en JSON consommable par la PWA.

    python3 scripts/build_factbook.py

Source : data/FACTBOOK_FMCG_2026.xlsx  ->  src/data/factbook.json
Les taux sont normalisés en fraction (0..1), les valeurs absolues en nombre,
les champs narratifs restent des chaînes nettoyées.
"""

import json
import math
import re
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "cia-facbook-pwa" / "FACTBOOK_FMCG_2026_TOTALEMENT_A_JOUR.xlsx"
TARGET = ROOT / "src" / "data" / "factbook.json"

# Codes ISO3 des pays couverts par le factbook (clé de jointure avec la carte).
ISO3 = {
    "Nigeria": "NGA", "I. Coast": "CIV", "Senegal": "SEN", "Gambia": "GMB",
    "Guinea Bissau": "GNB", "Sierra Leone": "SLE", "Liberia": "LBR",
    "Guinea Conakry": "GIN", "Burkina Faso": "BFA", "Mali": "MLI",
    "Niger": "NER", "Chad": "TCD", "Cape Verde": "CPV", "Togo": "TGO",
    "Benin": "BEN", "Cameroon": "CMR", "Gabon": "GAB",
    "Congo Brazzaville": "COG", "Central Africa R.": "CAF", "Ghana": "GHA",
    "Namibia": "NAM", "Mozzambique": "MOZ", "Madagascar": "MDG",
    "Equatorial Guinea": "GNQ", "Sao Tome & Principe": "STP", "DRC": "COD",
    "Angola": "AGO", "South Sudan": "SSD", "Ethiopia": "ETH",
    "Eritrea": "ERI", "Djibouti": "DJI", "Somalia": "SOM", "Kenya": "KEN",
    "Uganda": "UGA", "Tanzania": "TZA", "Rwanda": "RWA", "Burundi": "BDI",
    "Malawi": "MWI", "Zambia": "ZMB", "Zimbabwe": "ZWE",
    "South Africa": "ZAF", "Botswana": "BWA",
}

# Colonne Excel -> (clé JSON, type). "rate" = fraction, "num" = nombre, "text" = chaîne.
FIELDS = [
    ("Country", "country", "text"),
    ("Area (land): sq km", "areaKm2", "num"),
    ("Population (2025 est.)", "population", "num"),
    ("Population growth rate (2025 est.)", "populationGrowth", "rate"),
    ("Age structure 0-14 years", "age0_14", "rate"),
    ("Age structure 15-64 years", "age15_64", "rate"),
    ("Age structure >= 65 years", "age65plus", "rate"),
    ("Median age", "medianAge", "text"),
    ("urban population", "urbanRate", "rate"),
    ("Ethnic Groups", "ethnicGroups", "text"),
    ("Religions", "religions", "text"),
    ("Languages", "languages", "text"),
    ("Literacy (Total)", "literacyTotal", "rate"),
    ("Literacy (Male)", "literacyMale", "rate"),
    ("Literacy (Female)", "literacyFemale", "rate"),
    ("Administrative division", "adminDivision", "text"),
    ("GDP (2024 est.) official ex rate", "gdp", "text"),
    ("GDP growth rate (2024est.)", "gdpGrowth", "rate"),
    ("GDP per capita (2019 est.)", "gdpPerCapita", "text"),
    ("Unemployment rate", "unemploymentRate", "rate"),
    ("Population below poverty line", "povertyRate", "rate"),
    ("Household income or consumption by percentage share", "incomeShare", "text"),
    ("Inflation rate (2024 est.)", "inflationRate", "rate"),
    ("Mobile cellular users (2019 est)", "mobileUsers", "num"),
    ("Mobile cellular (pourcentage population)", "mobilePenetration", "rate"),
    ("Internet users (2018 est)", "internetUsers", "num"),
    ("Internet users (pourcentage population)", "internetPenetration", "rate"),
    ("Radio brodacast stations", "radioStations", "num"),
    ("TV broadcast stations", "tvStations", "num"),
    ("Urban", "urbanPopulation", "num"),
    ("below 14years", "population0_14", "num"),
    ("Below Poverty line", "populationBelowPoverty", "num"),
]

EMPTY = {"", "nan", "none", "-", "n/a", "na"}


def clean_text(value):
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return None
    text = str(value).replace("\xa0", " ").strip()
    return None if text.lower() in EMPTY else text


def parse_number(value):
    text = clean_text(value)
    if text is None:
        return None
    # "$187.76 billion (2024 est.)" -> on ne garde que le premier nombre.
    match = re.search(r"-?\d[\d\s.,]*", text.replace("%", ""))
    if not match:
        return None
    raw = match.group(0).replace(" ", "")
    if "," in raw and "." in raw:
        raw = raw.replace(",", "") if raw.rfind(".") > raw.rfind(",") else raw.replace(".", "").replace(",", ".")
    elif "," in raw:
        # "1,266,700" = séparateur de milliers ; "40,1" = virgule décimale.
        thousands = re.fullmatch(r"-?\d{1,3}(,\d{3})+", raw)
        raw = raw.replace(",", "") if thousands else raw.replace(",", ".")
    raw = raw.rstrip(".")
    try:
        return float(raw)
    except ValueError:
        return None


def parse_rate(value):
    """Renvoie une fraction : "41,5%" -> 0.415, 0.332 -> 0.332.

    Les cellules numériques du classeur sont déjà des fractions (y compris les
    pénétrations mobiles > 100 %) ; seules les cellules saisies en texte
    ("3% (2024 est.)") doivent être divisées par 100.
    """
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return None if math.isnan(value) else round(float(value), 6)
    text = clean_text(value)
    if text is None:
        return None
    number = parse_number(text)
    if number is None:
        return None
    if "%" in text or abs(number) > 1:
        return round(number / 100, 6)
    return round(number, 6)


def main():
    frame = pd.read_excel(SOURCE)
    records = []
    for _, row in frame.iterrows():
        country = clean_text(row.get("Country"))
        if country is None or country not in ISO3:
            continue  # lignes de regroupement ("India Ocean", "Islands"…)
        record = {"iso3": ISO3[country]}
        for column, key, kind in FIELDS:
            value = row.get(column)
            if kind == "text":
                record[key] = clean_text(value)
            elif kind == "rate":
                record[key] = parse_rate(value)
            else:
                number = parse_number(value)
                record[key] = round(number, 2) if number is not None else None
        records.append(record)

    records.sort(key=lambda item: item["country"])
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(records)} pays -> {TARGET.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
