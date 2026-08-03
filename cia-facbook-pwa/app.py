import streamlit as st
import pandas as pd
import plotly.express as px

st.set_page_config(page_title="Factbook FMCG 2026 - Carte Interactive", layout="wide")
st.title("🌍 CIA Factbook FMCG 2026 - Cartographie & Dashboard")

# Mapping des codes ISO3 pour l'affichage cartographique des 42 pays
ISO3_MAP = {
    'Nigeria': 'NGA', 'I. Coast': 'CIV', 'Senegal': 'SEN', 'Gambia': 'GMB',
    'Guinea Bissau': 'GNB', 'Sierra Leone': 'SLE', 'Liberia': 'LBR',
    'Guinea Conakry': 'GIN', 'Burkina Faso': 'BFA', 'Mali': 'MLI',
    'Niger': 'NER', 'Chad': 'TCD', 'Cape Verde': 'CPV', 'Togo': 'TGO',
    'Benin': 'BEN', 'Cameroon': 'CMR', 'Gabon': 'GAB', 'Congo Brazzaville': 'COG',
    'Central Africa R.': 'CAF', 'Ghana': 'GHA', 'Namibia': 'NAM',
    'Mozzambique': 'MOZ', 'Madagascar': 'MDG', 'Equatorial Guinea': 'GNQ',
    'Sao Tome & Principe': 'STP', 'DRC': 'COD', 'Angola': 'AGO',
    'South Sudan': 'SSD', 'Ethiopia': 'ETH', 'Eritrea': 'ERI',
    'Djibouti': 'DJI', 'Somalia': 'SOM', 'Kenya': 'KEN', 'Uganda': 'UGA',
    'Tanzania': 'TZA', 'Rwanda': 'RWA', 'Burundi': 'BDI', 'Malawi': 'MWI',
    'Zambia': 'ZMB', 'Zimbabwe': 'ZWE', 'South Africa': 'ZAF', 'Botswana': 'BWA'
}

@st.cache_data
def load_data():
    df = pd.read_excel('FACTBOOK_FMCG_2026_TOTALEMENT_A_JOUR.xlsx')
    df['ISO3'] = df['Country'].map(ISO3_MAP)
    return df

df_raw = load_data()
df_valid = df_raw.dropna(subset=['ISO3']).copy()

# Initialisation du pays sélectionné dans la session
if 'selected_country' not in st.session_state:
    st.session_state.selected_country = 'Nigeria'

# Formateurs visuels
def fmt_pct(val):
    if pd.isna(val) or val is None or str(val).strip() in ['', 'nan', 'None', '-']:
        return "N/A"
    try:
        num = float(str(val).replace('%', '').replace(',', '.').strip())
        if -1.0 <= num <= 1.0 and num != 0:
            return f"{num * 100:.2f}%"
        return f"{num:.2f}%"
    except Exception:
        return str(val)

def fmt_int(val):
    if pd.isna(val) or val is None or str(val).strip() in ['', 'nan', 'None', '-']:
        return "N/A"
    try:
        num = float(str(val).replace(',', '').replace('\xa0', '').strip())
        return f"{int(round(num)):,}".replace(',', ' ')
    except Exception:
        return str(val)

# --- SECTION CARTE INTERACTIVE ---
st.subheader("🗺️ Carte Thématique Afrique (Cliquer sur un pays pour le sélectionner)")

# Sélection de l'indicateur à cartographier
indicator_options = {
    'Population (2025 est.)': 'Population',
    'Population growth rate (2025 est.)': 'Taux de croissance Pop.',
    'Inflation rate (2024 est.)': 'Inflation',
    'urban population': 'Taux d\'urbanisation',
    'GDP growth rate (2024est.)': 'Croissance du PIB',
    'Literacy (Total)': 'Taux d\'alphabétisation'
}

selected_indicator_col = st.selectbox(
    "Indicateur à afficher sur la carte :", 
    list(indicator_options.keys()), 
    format_func=lambda x: indicator_options[x]
)

# Préparation de la valeur numérique pour la carte
df_valid['Map_Value'] = pd.to_numeric(df_valid[selected_indicator_col], errors='coerce')
if df_valid['Map_Value'].isna().all():
    df_valid['Map_Value'] = df_valid[selected_indicator_col].astype(str).str.extract(r'(\d+\.?\d*)').astype(float)

fig = px.choropleth(
    df_valid,
    locations="ISO3",
    color="Map_Value",
    hover_name="Country",
    scope="africa",
    color_continuous_scale="Viridis",
    labels={'Map_Value': indicator_options[selected_indicator_col]},
    height=550
)

fig.update_geos(fitbounds="locations", visible=False)
fig.update_layout(margin={"r":0,"t":0,"l":0,"b":0})

# Capture du clic sur la carte
map_event = st.plotly_chart(fig, on_select="rerun", key="africa_map")

if map_event and map_event.get("selection") and map_event["selection"].get("points"):
    clicked_point = map_event["selection"]["points"][0]
    clicked_iso3 = clicked_point.get("location")
    matched = df_valid[df_valid['ISO3'] == clicked_iso3]
    if not matched.empty:
        st.session_state.selected_country = matched.iloc[0]['Country']

# --- BARRE LATÉRALE DE SÉLECTION ---
country_list = df_raw['Country'].dropna().astype(str).unique().tolist()

selected_country = st.sidebar.selectbox(
    "Sélectionner un pays :", 
    country_list, 
    index=country_list.index(st.session_state.selected_country) if st.session_state.selected_country in country_list else 0,
    key="country_selectbox"
)

st.session_state.selected_country = selected_country

# --- SECTION DETAILS DU PAYS SÉLECTIONNÉ ---
st.markdown("---")
st.subheader(f"📌 Détails FMCG : **{st.session_state.selected_country}**")

country_df = df_raw[df_raw['Country'].astype(str) == st.session_state.selected_country]

if not country_df.empty:
    row = country_df.iloc[0]
    
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Population (2025)", fmt_int(row.get('Population (2025 est.)')))
    col2.metric("Croissance Pop.", fmt_pct(row.get('Population growth rate (2025 est.)')))
    col3.metric("Inflation", fmt_pct(row.get('Inflation rate (2024 est.)')))
    col4.metric("PIB / hab.", str(row.get('GDP per capita (2019 est.)', 'N/A')))
    
    c1, c2 = st.columns(2)
    with c1:
        st.write("#### 👥 Démographie & Société")
        st.write(f"**Âge médian :** {row.get('Median age', 'N/A')}")
        st.write(f"**Population urbaine :** {fmt_pct(row.get('urban population'))}")
        st.write(f"**Langues :** {row.get('Languages', 'N/A')}")
        st.write(f"**Groupes ethniques :** {row.get('Ethnic Groups', 'N/A')}")
    
    with c2:
        st.write("#### 📈 Économie & FMCG")
        st.write(f"**PIB Officiel :** {row.get('GDP (2024 est.) official ex rate', 'N/A')}")
        st.write(f"**Taux de chômage :** {fmt_pct(row.get('Unemployment rate')) if isinstance(row.get('Unemployment rate'), (int, float)) else str(row.get('Unemployment rate', 'N/A'))}")
        st.write(f"**Utilisateurs Mobile :** {fmt_int(row.get('Mobile cellular users (2019 est)'))}")
        st.write(f"**Pauvreté (< Seuil) :** {fmt_int(row.get('Below Poverty line'))}")

# --- TABLEAU DE DONNÉES GLOBALES ---
st.markdown("---")
st.subheader("📊 Données globales brutes")

def format_dataframe_for_display(df):
    df_formatted = df.copy()
    pct_cols = [
        'Population growth rate (2025 est.)', 'Age structure 0-14 years', 
        'Age structure 15-64 years', 'Age structure >= 65 years', 
        'urban population', 'Literacy (Total)', 'Literacy (Male)', 'Literacy (Female)',
        'GDP growth rate (2024est.)', 'Inflation rate (2024 est.)',
        'Mobile cellular (pourcentage population)', 'Internet users (pourcentage population)'
    ]
    int_cols = [
        'Population (2025 est.)', 'Area (land): sq km', 'Mobile cellular users (2019 est)',
        'Internet users (2018 est)', 'Urban', 'below 14years', 'Below Poverty line'
    ]
    for col in df_formatted.columns:
        if col in pct_cols:
            df_formatted[col] = df_formatted[col].apply(fmt_pct)
        elif col in int_cols:
            df_formatted[col] = df_formatted[col].apply(fmt_int)
        else:
            df_formatted[col] = df_formatted[col].astype(str).str.replace('\xa0', '').str.replace('nan', '-').str.strip()
    return df_formatted

st.dataframe(format_dataframe_for_display(df_raw))