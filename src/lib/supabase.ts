import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Si les variables manquent lors du build, on passe des chaînes vides pour éviter le crash.
// L'erreur sera levée proprement au moment d'une vraie requête si les clés manquent en production.
if (typeof window === 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn("⚠️ Warning: Supabase environment variables are missing during build time.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);