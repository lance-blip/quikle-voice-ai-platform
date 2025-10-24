/**
 * Database operations for carrier registry
 */

import { eq, and, desc } from "drizzle-orm";
import { getDb } from "../db";
import { carrierRegistry, type InsertCarrierRegistry, type CarrierRegistry } from "../../drizzle/schema";
import type { CarrierProvider, CarrierCapabilities, CarrierPricing, CarrierEndpoints } from "./types";

/**
 * Convert database row to CarrierProvider type
 */
function dbRowToCarrierProvider(row: CarrierRegistry): CarrierProvider {
  const capabilities: CarrierCapabilities = row.capabilities 
    ? JSON.parse(row.capabilities)
    : {
        sipTrunk: true,
        numberProvisioning: true,
        smsSupport: false,
        concurrentChannels: 100,
        codecSupport: ['G729', 'GSM'],
      };

  const pricing: CarrierPricing = {
    currency: row.currency,
    setupFee: parseFloat(row.setupFee || '0'),
    monthlyBase: parseFloat(row.monthlyBase || '0'),
    perMinuteRate: parseFloat(row.costPerMinuteZar || '0'),
  };

  const endpoints: CarrierEndpoints = {
    sipRegistrationUrl: row.sipEndpoint || '',
    apiBaseUrl: row.apiBaseUrl || '',
  };

  return {
    id: row.id,
    name: row.carrierName,
    region: row.region,
    priority: row.priority,
    isActive: row.isActive === 1,
    capabilities,
    pricing,
    endpoints,
    latencyBenchmarkMs: row.latencyBenchmarkMs || undefined,
    maxConcurrentCalls: row.maxConcurrentCalls || undefined,
  };
}

/**
 * Get all active carriers
 */
export async function getAllCarriers(): Promise<CarrierProvider[]> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select()
    .from(carrierRegistry)
    .where(eq(carrierRegistry.isActive, 1))
    .orderBy(carrierRegistry.priority);

  return rows.map(dbRowToCarrierProvider);
}

/**
 * Get carriers by region
 */
export async function getCarriersByRegion(region: 'south-africa' | 'international'): Promise<CarrierProvider[]> {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select()
    .from(carrierRegistry)
    .where(
      and(
        eq(carrierRegistry.region, region),
        eq(carrierRegistry.isActive, 1)
      )
    )
    .orderBy(carrierRegistry.priority);

  return rows.map(dbRowToCarrierProvider);
}

/**
 * Get carrier by ID
 */
export async function getCarrierById(id: number): Promise<CarrierProvider | null> {
  const db = await getDb();
  if (!db) return null;

  const rows = await db
    .select()
    .from(carrierRegistry)
    .where(eq(carrierRegistry.id, id))
    .limit(1);

  if (rows.length === 0) return null;
  return dbRowToCarrierProvider(rows[0]);
}

/**
 * Create a new carrier
 */
export async function createCarrier(data: {
  carrierName: string;
  region: 'south-africa' | 'international';
  priority?: number;
  sipEndpoint?: string;
  apiBaseUrl?: string;
  apiCredentials?: string;
  supportedCodecs?: string[];
  maxConcurrentCalls?: number;
  latencyBenchmarkMs?: number;
  costPerMinuteZar?: string;
  currency?: 'ZAR' | 'USD';
  setupFee?: string;
  monthlyBase?: string;
  capabilities?: CarrierCapabilities;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const insertData: InsertCarrierRegistry = {
    carrierName: data.carrierName,
    region: data.region,
    priority: data.priority || 10,
    sipEndpoint: data.sipEndpoint || null,
    apiBaseUrl: data.apiBaseUrl || null,
    apiCredentials: data.apiCredentials || null,
    supportedCodecs: data.supportedCodecs ? JSON.stringify(data.supportedCodecs) : null,
    maxConcurrentCalls: data.maxConcurrentCalls || null,
    latencyBenchmarkMs: data.latencyBenchmarkMs || null,
    costPerMinuteZar: data.costPerMinuteZar || null,
    currency: data.currency || 'ZAR',
    setupFee: data.setupFee || null,
    monthlyBase: data.monthlyBase || null,
    capabilities: data.capabilities ? JSON.stringify(data.capabilities) : null,
  };

  const result = await db.insert(carrierRegistry).values(insertData);
  return Number((result as any).insertId || 0);
}

/**
 * Update carrier
 */
export async function updateCarrier(
  id: number,
  data: Partial<Omit<InsertCarrierRegistry, 'id'>>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.update(carrierRegistry).set(data).where(eq(carrierRegistry.id, id));
}

/**
 * Update carrier latency benchmark
 */
export async function updateCarrierLatency(id: number, latencyMs: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db
    .update(carrierRegistry)
    .set({ latencyBenchmarkMs: latencyMs })
    .where(eq(carrierRegistry.id, id));
}

/**
 * Toggle carrier active status
 */
export async function toggleCarrierStatus(id: number, isActive: boolean): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db
    .update(carrierRegistry)
    .set({ isActive: isActive ? 1 : 0 })
    .where(eq(carrierRegistry.id, id));
}

