import writeXlsxFile, { type SheetData } from "write-excel-file/browser";
import type { FactbookCountry } from "./factbook";

// Export Excel calqué sur FACTBOOK_FMCG_2026_TOTALEMENT_A_JOUR.xlsx :
// mêmes en-têtes et même ordre de colonnes, avec Main_Cluster / Sub_Cluster
// ajoutés après le pays et les deux montants en version numérique à la fin.
type ExportColumn = {
  header: string;
  value: (row: FactbookCountry) => string | number | null;
  type: "text" | "percent" | "integer" | "decimal";
  width: number;
};

const text = (
  header: string,
  value: (row: FactbookCountry) => string | null,
  width = 30,
): ExportColumn => ({ header, value, type: "text", width });

const percent = (header: string, value: (row: FactbookCountry) => number | null): ExportColumn => ({
  header,
  value,
  type: "percent",
  width: 16,
});

const integer = (header: string, value: (row: FactbookCountry) => number | null): ExportColumn => ({
  header,
  value,
  type: "integer",
  width: 18,
});

export const EXPORT_COLUMNS: ExportColumn[] = [
  text("Country", (row) => row.country, 22),
  text("Main_Cluster", (row) => row.mainCluster, 14),
  text("Sub_Cluster", (row) => row.subCluster, 12),
  integer("Area (land): sq km", (row) => row.areaKm2),
  integer("Population (2025 est.)", (row) => row.population),
  percent("Population growth rate (2025 est.)", (row) => row.populationGrowth),
  percent("Age structure 0-14 years", (row) => row.age0_14),
  percent("Age structure 15-64 years", (row) => row.age15_64),
  percent("Age structure >= 65 years", (row) => row.age65plus),
  text("Median age", (row) => row.medianAge, 20),
  percent("urban population", (row) => row.urbanRate),
  text("Ethnic Groups", (row) => row.ethnicGroups, 60),
  text("Religions", (row) => row.religions, 60),
  text("Languages", (row) => row.languages, 60),
  percent("Literacy (Total)", (row) => row.literacyTotal),
  percent("Literacy (Male)", (row) => row.literacyMale),
  percent("Literacy (Female)", (row) => row.literacyFemale),
  text("Administrative division", (row) => row.adminDivision, 28),
  text("GDP (2024 est.) official ex rate", (row) => row.gdp, 28),
  percent("GDP growth rate (2024est.)", (row) => row.gdpGrowth),
  text("GDP per capita (2019 est.)", (row) => row.gdpPerCapita, 24),
  percent("Unemployment rate", (row) => row.unemploymentRate),
  percent("Population below poverty line", (row) => row.povertyRate),
  text("Household income or consumption by percentage share", (row) => row.incomeShare, 40),
  percent("Inflation rate (2024 est.)", (row) => row.inflationRate),
  integer("Mobile cellular users (2019 est)", (row) => row.mobileUsers),
  percent("Mobile cellular (pourcentage population)", (row) => row.mobilePenetration),
  integer("Internet users (2018 est)", (row) => row.internetUsers),
  percent("Internet users (pourcentage population)", (row) => row.internetPenetration),
  integer("Radio brodacast stations", (row) => row.radioStations),
  integer("TV broadcast stations", (row) => row.tvStations),
  integer("Urban", (row) => row.urbanPopulation),
  integer("below 14years", (row) => row.population0_14),
  integer("Below Poverty line", (row) => row.populationBelowPoverty),
  { header: "GDP (Bn USD)", value: (row) => row.gdpUsdBn, type: "decimal", width: 16 },
  integer("GDP per capita (USD)", (row) => row.gdpPerCapitaUsd),
];

const HEADER_STYLE = {
  fontWeight: "bold" as const,
  color: "#FFFFFF",
  backgroundColor: "#1F4E79",
  align: "center" as const,
  alignVertical: "center" as const,
  wrap: true,
};

/** Génère le classeur côté navigateur (aucun appel réseau) et déclenche le téléchargement. */
export async function downloadFactbookExcel(
  rows: FactbookCountry[],
  fileName = "FACTBOOK_FMCG_2026_TOTALEMENT_A_JOUR.xlsx",
): Promise<void> {
  const header = EXPORT_COLUMNS.map((column) => ({ value: column.header, ...HEADER_STYLE }));

  const body = rows.map((row) =>
    EXPORT_COLUMNS.map((column) => {
      const value = column.value(row);
      if (value === null || value === undefined) return { value: null };
      if (column.type === "text") return { type: String, value: String(value) };
      if (column.type === "percent") return { type: Number, value, format: "0.00%" };
      if (column.type === "decimal") return { type: Number, value, format: "#,##0.00" };
      return { type: Number, value, format: "#,##0" };
    }),
  );

  await writeXlsxFile([header, ...body] as SheetData, {
    sheet: "Factbook FMCG 2026",
    columns: EXPORT_COLUMNS.map((column) => ({ width: column.width })),
    stickyRowsCount: 1,
  }).toFile(fileName);
}
