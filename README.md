# InsightHub — Field Intelligence Platform (FIP)

Plateforme propriétaire de **Market & Consumer Intelligence** : collecte terrain
digitale (offline-first PWA), audit prix, merchandising et analytics automatisées
reliées à l'**IBP** (Integrated Business Planning) et au modèle **6P**
(Product, Price, Place, Promotion, Pack, Proposition).

Ce dépôt contient **la Web App / PWA** (front-end). Le backend .NET/Azure et l'IA
Vision décrits dans le cahier des charges sont hors périmètre de ce MVP ; une
couche `src/lib/` (services `sync`, `db`, `auth`) est prête à être branchée sur
l'API REST.

## Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** (UI mobile-first)
- **PWA** : `manifest.webmanifest` + Service Worker (`public/sw.js`) — installable
  et fonctionnel hors connexion
- **Offline-first** : **Dexie** (IndexedDB) pour le stockage local + file de
  synchronisation qui rejoue les données au retour du réseau (modèle KoboCollect)
- **Zustand** pour l'état (auth, sync)
- **Recharts** pour la data-visualisation

## Modules (MVP)

| Module | Route | Description |
| --- | --- | --- |
| Authentification / rôles | `/login` | Comptes démo par rôle, prêt pour Entra ID/MFA |
| Créateur de questionnaires | `/studies` | Éditeur de formulaires (18 types de questions, logique conditionnelle, 6P) |
| Collecte terrain (offline) | `/collect` | Page enquêteur, rendu dynamique, GPS + horodatage + durée |
| Audit Prix | `/audit-prix` | Relevé prix/promo/dispo + photo, indice de prix |
| Merchandising | `/merchandising` | Facings, linéaire, rupture, PLV, photos avant/après |
| Analytics & Insights | `/analytics` | KPIs, scorecard 6P, insights auto (Surface → Root cause → Reco) |
| Validation | `/validation` | Workflow Enquêteur → Superviseur → Publication |
| Synchronisation | `/sync` | État réseau, données en attente, resynchronisation |
| Administration | `/admin` | Gestion utilisateurs, rôles, permissions |

## Démarrer

```bash
npm install
npm run dev      # http://localhost:3000
```

Autres commandes : `npm run build`, `npm run start`, `npm run lint`.

### Comptes de démonstration

Mot de passe pour tous : `demo`. Boutons de connexion rapide sur l'écran de login.

| Rôle | Email |
| --- | --- |
| Administrateur | `admin@insighthub.ci` |
| Manager | `manager@insighthub.ci` |
| Analyste | `analyst@insighthub.ci` |
| Superviseur Terrain | `superviseur@insighthub.ci` |
| Enquêteur | `enqueteur@insighthub.ci` |

Au premier lancement, IndexedDB est alimentée avec des études et des données de
démonstration (`src/lib/seed.ts`).

## Tester le mode offline

1. Ouvrez `/sync` et cliquez **« Simuler hors ligne »** (ou coupez le réseau dans
   les DevTools).
2. Effectuez une collecte / un audit prix : l'enregistrement passe en
   « En attente ».
3. Repassez **en ligne** : la synchronisation se déclenche automatiquement et les
   éléments passent à « Synchronisé ».

## Structure

```
src/
  app/
    login/                 écran de connexion
    (app)/                 shell authentifié (sidebar + topbar)
      dashboard, studies, collect, audit-prix,
      merchandising, analytics, validation, sync, admin
  components/
    layout/                Sidebar, Topbar, navigation
    forms/                 StudyBuilder, FormRunner, QuestionRenderer, PhotoInput, SignaturePad
    ui/                    primitives (StatCard, Card, PageHeader…)
    GpsMap.tsx             carte GPS SVG offline
  lib/
    types.ts               modèle de domaine
    db.ts                  schéma Dexie (IndexedDB)
    auth.ts                auth mock + contrôle d'accès par rôle
    sync.ts                moteur de synchronisation offline
    analytics.ts           agrégations KPI
    sixp.ts                moteur d'insights IBP/6P
    seed.ts                données de démonstration
public/
  manifest.webmanifest, sw.js, icons/
```
