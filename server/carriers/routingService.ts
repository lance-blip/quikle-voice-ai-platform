/**
 * Intelligent Carrier Routing Service
 * Selects optimal carrier based on destination, latency, and cost
 */

import type {
  CarrierProvider,
  CallDestination,
  CarrierSelectionCriteria,
  RoutingDecision,
  CarrierHealthStatus,
} from './types';

const LATENCY_THRESHOLD_MS = 200;
const SA_COUNTRY_CODE = '+27';

/**
 * Detect if a phone number is South African
 */
export function isSouthAfricanNumber(phoneNumber: string): boolean {
  const normalized = phoneNumber.replace(/\s+/g, '');
  return normalized.startsWith(SA_COUNTRY_CODE) || normalized.startsWith('27');
}

/**
 * Parse phone number to extract destination information
 */
export function parseDestination(phoneNumber: string): CallDestination {
  const normalized = phoneNumber.replace(/\s+/g, '');
  const isSA = isSouthAfricanNumber(normalized);
  
  return {
    phoneNumber: normalized,
    countryCode: isSA ? '+27' : 'unknown',
    isSouthAfrican: isSA,
  };
}

/**
 * Filter carriers by region and active status
 */
export function filterCarriersByRegion(
  carriers: CarrierProvider[],
  region: 'south-africa' | 'international' | 'all'
): CarrierProvider[] {
  return carriers
    .filter(c => c.isActive)
    .filter(c => region === 'all' || c.region === region)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Select optimal carrier based on latency and cost
 */
export function selectOptimalCarrier(
  carriers: CarrierProvider[],
  healthStatuses: Map<number, CarrierHealthStatus>
): CarrierProvider | null {
  if (carriers.length === 0) return null;

  // Filter carriers with acceptable latency
  const lowLatencyCarriers = carriers.filter(carrier => {
    const health = healthStatuses.get(carrier.id);
    if (!health || !health.isHealthy) return false;
    return health.latencyMs < LATENCY_THRESHOLD_MS;
  });

  // If we have low-latency carriers, pick the highest priority one
  if (lowLatencyCarriers.length > 0) {
    return lowLatencyCarriers[0];
  }

  // Otherwise, return the highest priority carrier that's healthy
  for (const carrier of carriers) {
    const health = healthStatuses.get(carrier.id);
    if (health && health.isHealthy) {
      return carrier;
    }
  }

  // Last resort: return first carrier even if health unknown
  return carriers[0];
}

/**
 * Main routing decision logic
 * Implements the decision tree from requirements:
 * 1. Detect call origin/destination (check +27 prefix for SA numbers)
 * 2. IF origin OR destination = South Africa → Route via PRIMARY SA carrier
 * 3. ELSE IF international → Route via SECONDARY carriers or Twilio/Telnyx
 * 4. IF primary SA carrier fails → Automatic failover to next SA carrier
 * 5. IF all SA carriers unavailable → Emergency fallback to Twilio/Telnyx
 */
export function makeRoutingDecision(
  criteria: CarrierSelectionCriteria,
  allCarriers: CarrierProvider[],
  healthStatuses: Map<number, CarrierHealthStatus>
): RoutingDecision {
  const { destination, requireLowLatency } = criteria;

  // Step 1: Detect if call involves South Africa
  if (destination.isSouthAfrican) {
    // Step 2: Route via SA carriers
    const saCarriers = filterCarriersByRegion(allCarriers, 'south-africa');
    const primaryCarrier = selectOptimalCarrier(saCarriers, healthStatuses);

    if (primaryCarrier) {
      // Step 4: Prepare fallback carriers
      const fallbacks = saCarriers.filter(c => c.id !== primaryCarrier.id);
      
      // Step 5: Add international carriers as emergency fallback
      const internationalCarriers = filterCarriersByRegion(allCarriers, 'international');
      fallbacks.push(...internationalCarriers);

      const health = healthStatuses.get(primaryCarrier.id);
      
      return {
        selectedCarrier: primaryCarrier,
        fallbackCarriers: fallbacks,
        reason: `SA number detected (+27). Routing via ${primaryCarrier.name} for optimal latency.`,
        estimatedLatencyMs: health?.latencyMs || primaryCarrier.latencyBenchmarkMs || 150,
        estimatedCostZar: primaryCarrier.pricing.perMinuteRate,
      };
    }
  }

  // Step 3: International routing
  const internationalCarriers = filterCarriersByRegion(allCarriers, 'international');
  const selectedCarrier = selectOptimalCarrier(internationalCarriers, healthStatuses);

  if (!selectedCarrier) {
    throw new Error('No available carriers for routing');
  }

  const health = healthStatuses.get(selectedCarrier.id);
  const costZar = selectedCarrier.pricing.currency === 'USD' 
    ? selectedCarrier.pricing.perMinuteRate * 18.5 // Approximate USD to ZAR conversion
    : selectedCarrier.pricing.perMinuteRate;

  return {
    selectedCarrier,
    fallbackCarriers: internationalCarriers.filter(c => c.id !== selectedCarrier.id),
    reason: `International call. Routing via ${selectedCarrier.name}.`,
    estimatedLatencyMs: health?.latencyMs || selectedCarrier.latencyBenchmarkMs || 300,
    estimatedCostZar: costZar,
  };
}

/**
 * Calculate cost savings compared to international carriers
 */
export function calculateCostSavings(
  saCarrierCost: number,
  internationalCarrierCost: number
): {
  savingsZar: number;
  savingsPercentage: number;
} {
  const savingsZar = internationalCarrierCost - saCarrierCost;
  const savingsPercentage = (savingsZar / internationalCarrierCost) * 100;

  return {
    savingsZar: Math.max(0, savingsZar),
    savingsPercentage: Math.max(0, savingsPercentage),
  };
}

