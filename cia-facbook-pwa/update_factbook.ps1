# 1. Vérification de l'existence du dépôt cloné
if (-not (Test-Path "factbook.json")) {
    Write-Host "Clonage du dépôt GitHub en cours..." -ForegroundColor Yellow
    git clone https://github.com/factbook/factbook.json.git
}

# 2. Exécution du traitement de mise à jour Excel et export JSON
python -c @"
import os, json, re, pandas as pd, openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils.dataframe import dataframe_to_rows

COUNTRY_CODES = {
    'Nigeria': 'ni', 'I. Coast': 'iv', 'Senegal': 'sg', 'Gambia': 'ga',
    'Guinea Bissau': 'pu', 'Sierra Leone': 'sl', 'Liberia': 'li',
    'Guinea Conakry': 'gv', 'Burkina Faso': 'uv', 'Mali': 'ml',
    'Niger': 'ng', 'Chad': 'cd', 'Cape Verde': 'cv', 'Togo': 'to',
    'Benin': 'bn', 'Cameroon': 'cm', 'Gabon': 'gb', 'Congo Brazzaville': 'cf',
    'Central Africa R.': 'ct', 'Ghana': 'gh', 'Namibia': 'wa',
    'Mozzambique': 'mz', 'Madagascar': 'ma', 'Equatorial Guinea': 'ek',
    'Sao Tome & Principe': 'tp', 'DRC': 'cg', 'Angola': 'ao',
    'South Sudan': 'od', 'Ethiopia': 'et', 'Eritrea': 'er',
    'Djibouti': 'dj', 'Somalia': 'so', 'Kenya': 'ke', 'Uganda': 'ug',
    'Tanzania': 'tz', 'Rwanda': 'rw', 'Burundi': 'by', 'Malawi': 'mi',
    'Zambia': 'za', 'Zimbabwe': 'zi', 'South Africa': 'sf', 'Botswana': 'bc'
}

def get_nested(d, *keys):
    for k in keys:
        if isinstance(d, dict): d = d.get(k, {})
        else: return None
    return d if isinstance(d, (str, int, float)) else None

def parse_float(text):
    if not text: return None
    cleaned = str(text).replace(',', '').replace('%', '').strip()
    match = re.search(r'\d+(\.\d+)?', cleaned)
    if match:
        val = float(match.group(0))
        return val / 100.0 if '%' in str(text) else val
    return None

def parse_int(text):
    if not text: return None
    cleaned = str(text).replace(',', '').replace(' ', '')
    match = re.search(r'\d+', cleaned)
    return int(match.group(0)) if match else None

input_excel = 'FMCG_Factbook_Optimized_For_PWA.xlsx'
df = pd.read_excel(input_excel)
updated_count = 0

for country, code in COUNTRY_CODES.items():
    json_path = os.path.join('factbook.json', 'africa', f'{code}.json')
    if os.path.exists(json_path):
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        people = data.get('People and Society', {})
        economy = data.get('Economy', {})
        
        pop = parse_int(get_nested(people, 'Population', 'total', 'text') or get_nested(people, 'Population', 'text'))
        pop_growth = parse_float(get_nested(people, 'Population growth rate', 'text'))
        age_0_14 = parse_float(get_nested(people, 'Age structure', '0-14 years', 'text'))
        age_15_64 = parse_float(get_nested(people, 'Age structure', '15-64 years', 'text'))
        age_65 = parse_float(get_nested(people, 'Age structure', '65 years and over', 'text'))
        median_age = get_nested(people, 'Median age', 'total', 'text') or get_nested(people, 'Median age', 'text')
        urban_pct = parse_float(get_nested(people, 'Urbanization', 'urban population', 'text'))
        ethnic = get_nested(people, 'Ethnic groups', 'text')
        religions = get_nested(people, 'Religions', 'text')
        languages = get_nested(people, 'Languages', 'text')
        lit_total = parse_float(get_nested(people, 'Literacy', 'total population', 'text'))
        
        gdp_off = get_nested(economy, 'GDP (official exchange rate)', 'text') or get_nested(economy, 'Real GDP (purchasing power parity)', 'Real GDP (purchasing power parity) 2024', 'text')
        gdp_growth = parse_float(get_nested(economy, 'Real GDP growth rate', 'Real GDP growth rate 2024', 'text'))
        gdp_pc = get_nested(economy, 'Real GDP per capita', 'Real GDP per capita 2024', 'text')
        inflation = parse_float(get_nested(economy, 'Inflation rate (consumer prices)', 'Inflation rate (consumer prices) 2024', 'text'))
        unemp = get_nested(economy, 'Unemployment rate', 'Unemployment rate 2024', 'text')

        idx = df[df['Country'] == country].index
        if len(idx) > 0:
            i = idx[0]
            if pop: df.loc[i, 'Population (2025 est.)'] = pop
            if pop_growth is not None: df.loc[i, 'Population growth rate (2025 est.)'] = pop_growth
            if age_0_14 is not None: df.loc[i, 'Age structure 0-14 years'] = age_0_14
            if age_15_64 is not None: df.loc[i, 'Age structure 15-64 years'] = age_15_64
            if age_65 is not None: df.loc[i, 'Age structure >= 65 years'] = age_65
            if median_age: df.loc[i, 'Median age'] = median_age
            if urban_pct is not None: df.loc[i, 'urban population'] = urban_pct
            if ethnic: df.loc[i, 'Ethnic Groups'] = ethnic
            if religions: df.loc[i, 'Religions'] = religions
            if languages: df.loc[i, 'Languages'] = languages
            if lit_total is not None: df.loc[i, 'Literacy (Total)'] = lit_total
            if gdp_off: df.loc[i, 'GDP (2024 est.) official ex rate'] = gdp_off
            if gdp_growth is not None: df.loc[i, 'GDP growth rate (2024est.)'] = gdp_growth
            if gdp_pc: df.loc[i, 'GDP per capita (2019 est.)'] = gdp_pc
            if inflation is not None: df.loc[i, 'Inflation rate (2024 est.)'] = inflation
            if unemp: df.loc[i, 'Unemployment rate'] = unemp

            if pop and urban_pct: df.loc[i, 'Urban'] = round(pop * urban_pct)
            if pop and age_0_14: df.loc[i, 'below 14years'] = round(pop * age_0_14)
            updated_count += 1

# Formatage OpenPyXL pour Excel
wb = openpyxl.Workbook()
ws = wb.active
ws.title = 'Factbook FMCG 2026'

header_font = Font(bold=True, color='FFFFFF')
header_fill = PatternFill(start_color='1F4E79', end_color='1F4E79', fill_type='solid')
border_style = Side(border_style='thin', color='D3D3D3')
border = Border(left=border_style, right=border_style, top=border_style, bottom=border_style)

pct_headers = [
    'Population growth rate (2025 est.)', 'Age structure 0-14 years', 
    'Age structure 15-64 years', 'Age structure >= 65 years', 
    'urban population', 'Literacy (Total)', 'Literacy (Male)', 'Literacy (Female)',
    'GDP growth rate (2024est.)', 'Inflation rate (2024 est.)',
    'Mobile cellular (pourcentage population)', 'Internet users (pourcentage population)'
]

int_headers = [
    'Population (2025 est.)', 'Area (land): sq km', 'Mobile cellular users (2019 est)',
    'Internet users (2018 est)', 'Urban', 'below 14years', 'Below Poverty line'
]

for col_num, column_title in enumerate(df.columns, 1):
    cell = ws.cell(row=1, column=col_num, value=column_title)
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
    cell.border = border
    ws.column_dimensions[openpyxl.utils.get_column_letter(col_num)].width = 25

for r_idx, row in enumerate(dataframe_to_rows(df, index=False, header=False), 2):
    for c_idx, value in enumerate(row, 1):
        cell = ws.cell(row=r_idx, column=c_idx, value=value)
        cell.border = border
        cell.alignment = Alignment(vertical='center', wrap_text=True)
        col_name = df.columns[c_idx - 1]
        
        if col_name in pct_headers and isinstance(value, (int, float)):
            cell.number_format = '0.00%'
        elif col_name in int_headers and isinstance(value, (int, float)):
            cell.number_format = '#,##0'

ws.auto_filter.ref = ws.dimensions
ws.freeze_panes = 'B2'
wb.save('FACTBOOK_FMCG_2026_TOTALEMENT_A_JOUR.xlsx')

df.to_json('factbook_data.json', orient='records', indent=4, force_ascii=False)
print(f'Succès : {updated_count} pays synchronisés avec formatage Excel et JSON PWA.')
"@