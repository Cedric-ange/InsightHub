"use client";

import { useLiveQuery } from "dexie-react-hooks";
import {
  RefreshCw,
  Wifi,
  WifiOff,
  CloudUpload,
  ClipboardList,
  Tags,
  Store,
} from "lucide-react";
import { getDB } from "@/lib/db";
import { useSync } from "@/lib/sync";
import { PageHeader, StatCard, Card } from "@/components/ui";
import { formatDateTime, cn } from "@/lib/utils";

export default function SyncPage() {
  const { online, syncing, pending, lastSyncAt, flush, setOnline } = useSync();

  const counts = useLiveQuery(async () => {
    const db = getDB();
    const [subP, subT, paP, paT, maP, maT] = await Promise.all([
      db.submissions.where("syncStatus").equals("pending").count(),
      db.submissions.count(),
      db.priceAudits.where("syncStatus").equals("pending").count(),
      db.priceAudits.count(),
      db.merchAudits.where("syncStatus").equals("pending").count(),
      db.merchAudits.count(),
    ]);
    return { subP, subT, paP, paT, maP, maT };
  }, [pending, syncing]);

  return (
    <div>
      <PageHeader
        title="Synchronisation"
        subtitle="Les données terrain sont stockées localement (IndexedDB) et rejouées vers le serveur au retour du réseau."
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium",
            online
              ? "bg-emerald-100 text-emerald-800"
              : "bg-slate-200 text-slate-700",
          )}
        >
          {online ? <Wifi size={16} /> : <WifiOff size={16} />}
          {online ? "Connecté au réseau" : "Hors ligne"}
        </div>

        <button
          className="btn-secondary"
          onClick={() => setOnline(!online)}
          title="Simuler l'état réseau pour tester le mode offline"
        >
          Simuler {online ? "hors ligne" : "en ligne"}
        </button>

        <button
          className="btn-primary"
          onClick={() => flush()}
          disabled={!online || syncing || pending.total === 0}
        >
          {syncing ? (
            <RefreshCw size={16} className="animate-spin" />
          ) : (
            <CloudUpload size={16} />
          )}
          Synchroniser maintenant
        </button>

        {lastSyncAt && (
          <span className="text-xs text-slate-400">
            Dernière synchro : {formatDateTime(lastSyncAt)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="En attente"
          value={pending.total}
          tone={pending.total > 0 ? "amber" : "green"}
          icon={<CloudUpload size={18} />}
        />
        <StatCard
          label="Collectes"
          value={`${counts?.subP ?? 0} / ${counts?.subT ?? 0}`}
          hint="en attente / total"
          icon={<ClipboardList size={18} />}
        />
        <StatCard
          label="Audits prix"
          value={`${counts?.paP ?? 0} / ${counts?.paT ?? 0}`}
          hint="en attente / total"
          icon={<Tags size={18} />}
        />
        <StatCard
          label="Merchandising"
          value={`${counts?.maP ?? 0} / ${counts?.maT ?? 0}`}
          hint="en attente / total"
          icon={<Store size={18} />}
        />
      </div>

      <Card className="mt-6">
        <h3 className="mb-2 text-sm font-semibold text-slate-700">
          Comment ça marche
        </h3>
        <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-600">
          <li>Chaque collecte est écrite immédiatement en local (statut « en attente »).</li>
          <li>L&apos;application détecte le retour du réseau et déclenche la synchronisation.</li>
          <li>Chaque enregistrement est envoyé au serveur puis marqué « synchronisé ».</li>
          <li>Aucune donnée n&apos;est perdue même sans connexion (modèle KoboCollect).</li>
        </ol>
      </Card>
    </div>
  );
}
