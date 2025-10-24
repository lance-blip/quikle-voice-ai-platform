/**
 * Carrier Service Provider Types
 * Abstraction layer for telephony carriers (SA and international)
 */

export type CarrierRegion = 'south-africa' | 'international';
export type CarrierCurrency = 'ZAR' | 'USD';

export interface CarrierCapabilities {
  sipTrunk: boolean;
  numberProvisioning: boolean;
  smsSupport: boolean;
  concurrentChannels: number;
  codecSupport: string[]; // ['G729', 'GSM', 'OPUS', etc.]
}

export interface CarrierPricing {
  currency: CarrierCurrency;
  setupFee: number;
  monthlyBase: number;
  perMinuteRate: number;
}

export interface CarrierEndpoints {
  sipRegistrationUrl: string;
  apiBaseUrl: string;
  webhookUrl?: string;
}

export interface CarrierProvider {
  id: number;
  name: string;
  region: CarrierRegion;
  priority: number; // 1 = highest
  isActive: boolean;
  capabilities: CarrierCapabilities;
  pricing: CarrierPricing;
  endpoints: CarrierEndpoints;
  latencyBenchmarkMs?: number;
  maxConcurrentCalls?: number;
}

export interface CallDestination {
  phoneNumber: string;
  countryCode: string;
  isSouthAfrican: boolean;
}

export interface CarrierSelectionCriteria {
  destination: CallDestination;
  requireLowLatency: boolean;
  maxCostPerMinute?: number;
  preferredRegion?: CarrierRegion;
}

export interface CarrierHealthStatus {
  carrierId: number;
  carrierName: string;
  isHealthy: boolean;
  latencyMs: number;
  lastChecked: Date;
  errorRate: number;
}

export interface RoutingDecision {
  selectedCarrier: CarrierProvider;
  fallbackCarriers: CarrierProvider[];
  reason: string;
  estimatedLatencyMs: number;
  estimatedCostZar: number;
}

