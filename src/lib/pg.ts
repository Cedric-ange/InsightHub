import postgres, { type Sql } from "postgres";

// Connexion Postgres partagée (pooler Supabase) — jamais de credentials en dur.
// L'URL provient de la variable d'environnement DATABASE_URL (voir .env.example).
let _sql: Sql | null = null;

export function getSql(): Sql {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL manquante. Renseignez-la dans .env.local (local) et dans les variables d'environnement Vercel (production).",
    );
  }
  if (!_sql) {
    _sql = postgres(url, { prepare: false });
  }
  return _sql;
}
