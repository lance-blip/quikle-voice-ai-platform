import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  agencies,
  clients,
  agents,
  knowledgeBase,
  knowledgeBaseSources,
  phoneNumbers,
  callLogs,
  automations,
  automationLogs,
  voiceClones,
  Agency,
  Client,
  Agent,
  InsertAgency,
  InsertClient,
  InsertAgent,
  InsertKnowledgeBase,
  InsertKnowledgeBaseSource,
  InsertPhoneNumber,
  InsertCallLog,
  InsertAutomation,
  InsertVoiceClone
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Agency queries
export async function getAgencyByOwnerId(ownerId: number): Promise<Agency | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(agencies).where(eq(agencies.ownerId, ownerId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAgency(data: InsertAgency): Promise<Agency> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(agencies).values(data);
  const insertId = (result as any).insertId || result[0]?.insertId;
  const inserted = await db.select().from(agencies).where(eq(agencies.id, Number(insertId))).limit(1);
  return inserted[0];
}

export async function updateAgency(id: number, data: Partial<InsertAgency>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(agencies).set(data).where(eq(agencies.id, id));
}

// Client queries
export async function getClientsByAgencyId(agencyId: number): Promise<Client[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(clients).where(eq(clients.agencyId, agencyId)).orderBy(desc(clients.createdAt));
}

export async function getClientById(id: number): Promise<Client | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createClient(data: InsertClient): Promise<Client> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(clients).values(data);
  const insertId = (result as any).insertId || result[0]?.insertId;
  const inserted = await db.select().from(clients).where(eq(clients.id, Number(insertId))).limit(1);
  return inserted[0];
}

export async function updateClient(id: number, data: Partial<InsertClient>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(clients).set(data).where(eq(clients.id, id));
}

export async function deleteClient(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(clients).where(eq(clients.id, id));
}

// Agent queries
export async function getAgentsByClientId(clientId: number): Promise<Agent[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(agents).where(eq(agents.clientId, clientId)).orderBy(desc(agents.createdAt));
}

export async function getAgentById(id: number): Promise<Agent | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAgent(data: InsertAgent): Promise<Agent> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(agents).values(data);
  const insertId = (result as any).insertId || result[0]?.insertId;
  const inserted = await db.select().from(agents).where(eq(agents.id, Number(insertId))).limit(1);
  return inserted[0];
}

export async function updateAgent(id: number, data: Partial<InsertAgent>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(agents).set(data).where(eq(agents.id, id));
}

export async function deleteAgent(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(agents).where(eq(agents.id, id));
}

// Knowledge base queries
export async function getKnowledgeBaseByAgentId(agentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(knowledgeBase).where(eq(knowledgeBase.agentId, agentId)).orderBy(desc(knowledgeBase.createdAt));
}

export async function createKnowledgeBase(data: InsertKnowledgeBase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(knowledgeBase).values(data);
  const insertId = (result as any).insertId || result[0]?.insertId;
  const inserted = await db.select().from(knowledgeBase).where(eq(knowledgeBase.id, Number(insertId))).limit(1);
  return inserted[0];
}

export async function deleteKnowledgeBase(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(knowledgeBase).where(eq(knowledgeBase.id, id));
}

// Phone number queries
export async function getPhoneNumbersByClientId(clientId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(phoneNumbers).where(eq(phoneNumbers.clientId, clientId)).orderBy(desc(phoneNumbers.createdAt));
}

export async function createPhoneNumber(data: InsertPhoneNumber) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(phoneNumbers).values(data);
  const insertId = (result as any).insertId || result[0]?.insertId;
  const inserted = await db.select().from(phoneNumbers).where(eq(phoneNumbers.id, Number(insertId))).limit(1);
  return inserted[0];
}

// Call log queries
export async function getCallLogsByAgentId(agentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(callLogs).where(eq(callLogs.agentId, agentId)).orderBy(desc(callLogs.createdAt));
}

export async function createCallLog(data: InsertCallLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(callLogs).values(data);
  const insertId = (result as any).insertId || result[0]?.insertId;
  const inserted = await db.select().from(callLogs).where(eq(callLogs.id, Number(insertId))).limit(1);
  return inserted[0];
}

// Automation queries
export async function getAutomationsByAgencyId(agencyId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(automations).where(eq(automations.agencyId, agencyId)).orderBy(desc(automations.createdAt));
}

export async function createAutomation(data: InsertAutomation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(automations).values(data);
  const insertId = (result as any).insertId || result[0]?.insertId;
  const inserted = await db.select().from(automations).where(eq(automations.id, Number(insertId))).limit(1);
  return inserted[0];
}

export async function updateAutomation(id: number, data: Partial<InsertAutomation>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(automations).set(data).where(eq(automations.id, id));
}

// Voice clone queries
export async function getVoiceClonesByAgencyId(agencyId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(voiceClones).where(eq(voiceClones.agencyId, agencyId)).orderBy(desc(voiceClones.createdAt));
}

export async function createVoiceClone(data: InsertVoiceClone) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(voiceClones).values(data);
  const insertId = (result as any).insertId || result[0]?.insertId;
  const inserted = await db.select().from(voiceClones).where(eq(voiceClones.id, Number(insertId))).limit(1);
  return inserted[0];
}


// Knowledge base sources queries
export async function getKnowledgeBaseSourcesByKbId(knowledgeBaseId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(knowledgeBaseSources).where(eq(knowledgeBaseSources.knowledgeBaseId, knowledgeBaseId)).orderBy(desc(knowledgeBaseSources.createdAt));
}

export async function createKnowledgeBaseSource(data: InsertKnowledgeBaseSource) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(knowledgeBaseSources).values(data);
  const insertId = (result as any).insertId || result[0]?.insertId;
  const inserted = await db.select().from(knowledgeBaseSources).where(eq(knowledgeBaseSources.id, Number(insertId))).limit(1);
  return inserted[0];
}

export async function deleteKnowledgeBaseSource(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(knowledgeBaseSources).where(eq(knowledgeBaseSources.id, id));
}
