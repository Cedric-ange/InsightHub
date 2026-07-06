# Test Plan — InsightHub PWA (offline-first field collection)

Target: local dev server `http://localhost:3000`. Logged in as Enquêteur
(`enqueteur@insighthub.ci` / `demo`) unless noted.

## Primary flow — Offline collection → sync (the core value proposition)

Code refs: `src/components/forms/FormRunner.tsx` (submit → IndexedDB `syncStatus:"pending"`),
`src/lib/sync.ts` (`setOnline`, `refreshPending`, `flush`), `src/app/(app)/sync/page.tsx`.

1. Go to `/sync`. Note current "En attente" count (seed leaves some pending; record exact number N).
2. Click **"Simuler hors ligne"**.
   - PASS: status pill switches from green "Connecté au réseau" to grey "Hors ligne"; "Synchroniser maintenant" button becomes disabled.
3. Go to `/collect`, open study **"Dégustation nouvelle marque Biscuit"**.
4. Fill all required questions and click **"Valider la collecte"**.
   - PASS: success screen shows "Réponse enregistrée" AND the offline sub-text "Stockée localement — sera synchronisée au retour du réseau." (NOT the online "Synchronisation en cours" text). This distinguishes offline vs online path.
5. Return to `/sync`.
   - PASS: "En attente" count = N+1 (exactly one more than step 1). "Collectes" en attente counter also increments by 1.
   - FAIL criteria: count unchanged (submission not persisted) or app crash.
6. Click **"Simuler en ligne"**, then **"Synchroniser maintenant"**.
   - PASS: after sync, "En attente" total drops to **0**; "Dernière synchro" timestamp appears/updates.
   - FAIL: pending stays > 0.

Why adversarial: a broken write would leave the pending count unchanged at step 5; a broken flush would leave pending > 0 at step 6; a broken offline detection would show the "online" success text at step 4.

## Secondary flow — Audit Prix offline write (one edge case, different table)

Code refs: `src/app/(app)/audit-prix/page.tsx` (writes `priceAudits`, `syncStatus:"pending"`).

1. While offline (simulated), go to `/audit-prix`, click **"Nouveau relevé"**.
2. Enter Produit="Biscuit test", Prix=525, keep defaults, click **Enregistrer**.
   - PASS: green flash "Relevé enregistré localement (hors ligne)."; new row appears at top of "Derniers relevés" with a "En attente" sync badge and 525 FCFA; "Relevés" stat increments by 1.
   - FAIL: no new row, or badge shows "Synchronisé" while offline.

## Regression — Analytics insights render from data

Code refs: `src/lib/sixp.ts`, `src/app/(app)/analytics/page.tsx`.

1. Go to `/analytics` (as Admin).
   - PASS: 6P scorecard shows 6 pillar cards with numeric scores; at least one insight card renders with all three columns populated (Surface Issue / Root Cause / Recommandation) — proving the insight engine produces output, not empty state.
