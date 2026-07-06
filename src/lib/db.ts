import Dexie, { type Table } from "dexie";
import type {
  MerchAudit,
  PriceAudit,
  Study,
  Submission,
  User,
} from "./types";

// IndexedDB-backed offline store. All field data lives here first and is
// replayed to the backend by the sync engine when connectivity returns.
export class InsightHubDB extends Dexie {
  users!: Table<User, string>;
  studies!: Table<Study, string>;
  submissions!: Table<Submission, string>;
  priceAudits!: Table<PriceAudit, string>;
  merchAudits!: Table<MerchAudit, string>;

  constructor() {
    super("insighthub");
    this.version(1).stores({
      users: "id, role, email, active",
      studies: "id, status, category, createdAt",
      submissions: "id, studyId, agentId, syncStatus, createdAt",
      priceAudits: "id, outlet, brand, syncStatus, createdAt",
      merchAudits: "id, outlet, brand, syncStatus, createdAt",
    });
  }
}

let _db: InsightHubDB | null = null;

// Lazily instantiate so the module is import-safe during SSR.
export function getDB(): InsightHubDB {
  if (typeof window === "undefined") {
    throw new Error("getDB() must only be called in the browser");
  }
  if (!_db) _db = new InsightHubDB();
  return _db;
}
