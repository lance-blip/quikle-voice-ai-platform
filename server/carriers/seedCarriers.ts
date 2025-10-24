/**
 * Seed script to populate carrier registry with South African carriers
 * Run this to initialize the carrier database with default SA providers
 */

import { createCarrier } from './db';

export async function seedSouthAfricanCarriers() {
  console.log('🌍 Seeding South African carriers...');

  // PRIMARY CARRIERS (Tier 1)
  await createCarrier({
    carrierName: 'Saicom',
    region: 'south-africa',
    priority: 1,
    sipEndpoint: 'sip.saicom.io',
    apiBaseUrl: 'https://api.saicom.io',
    maxConcurrentCalls: 1000,
    latencyBenchmarkMs: 95,
    costPerMinuteZar: '0.35',
    currency: 'ZAR',
    setupFee: '0',
    monthlyBase: '500',
    supportedCodecs: ['G729', 'GSM', 'OPUS', 'G711'],
    capabilities: {
      sipTrunk: true,
      numberProvisioning: true,
      smsSupport: true,
      concurrentChannels: 1000,
      codecSupport: ['G729', 'GSM', 'OPUS', 'G711'],
    },
  });
  console.log('✅ Added Saicom (Priority 1)');

  await createCarrier({
    carrierName: 'Wanatel',
    region: 'south-africa',
    priority: 2,
    sipEndpoint: 'sip.wanatel.co.za',
    apiBaseUrl: 'https://api.wanatel.co.za',
    maxConcurrentCalls: 100,
    latencyBenchmarkMs: 120,
    costPerMinuteZar: '0.29',
    currency: 'ZAR',
    setupFee: '0',
    monthlyBase: '0',
    supportedCodecs: ['G729', 'GSM'],
    capabilities: {
      sipTrunk: true,
      numberProvisioning: true,
      smsSupport: false,
      concurrentChannels: 100,
      codecSupport: ['G729', 'GSM'],
    },
  });
  console.log('✅ Added Wanatel (Priority 2)');

  await createCarrier({
    carrierName: 'AVOXI',
    region: 'south-africa',
    priority: 3,
    sipEndpoint: 'sip.avoxi.com',
    apiBaseUrl: 'https://api.avoxi.com',
    maxConcurrentCalls: 10000,
    latencyBenchmarkMs: 90,
    costPerMinuteZar: '0.42',
    currency: 'ZAR',
    setupFee: '0',
    monthlyBase: '1200',
    supportedCodecs: ['G729', 'GSM', 'OPUS', 'G711'],
    capabilities: {
      sipTrunk: true,
      numberProvisioning: true,
      smsSupport: true,
      concurrentChannels: 10000,
      codecSupport: ['G729', 'GSM', 'OPUS', 'G711'],
    },
  });
  console.log('✅ Added AVOXI (Priority 3)');

  // SECONDARY CARRIERS (Cost-Optimized Tier)
  await createCarrier({
    carrierName: 'Switch Telecom',
    region: 'south-africa',
    priority: 4,
    sipEndpoint: 'sip.switchtelecom.co.za',
    apiBaseUrl: 'https://api.switchtelecom.co.za',
    maxConcurrentCalls: 1000,
    latencyBenchmarkMs: 130,
    costPerMinuteZar: '0.25',
    currency: 'ZAR',
    setupFee: '0',
    monthlyBase: '100',
    supportedCodecs: ['G729', 'GSM'],
    capabilities: {
      sipTrunk: true,
      numberProvisioning: true,
      smsSupport: false,
      concurrentChannels: 1000,
      codecSupport: ['G729', 'GSM'],
    },
  });
  console.log('✅ Added Switch Telecom (Priority 4)');

  await createCarrier({
    carrierName: 'IP Telecom',
    region: 'south-africa',
    priority: 5,
    sipEndpoint: 'sip.iptelecom.co.za',
    apiBaseUrl: 'https://api.iptelecom.co.za',
    maxConcurrentCalls: 500,
    latencyBenchmarkMs: 140,
    costPerMinuteZar: '0.28',
    currency: 'ZAR',
    setupFee: '150',
    monthlyBase: '60',
    supportedCodecs: ['G729', 'GSM'],
    capabilities: {
      sipTrunk: true,
      numberProvisioning: false,
      smsSupport: false,
      concurrentChannels: 500,
      codecSupport: ['G729', 'GSM'],
    },
  });
  console.log('✅ Added IP Telecom (Priority 5)');

  // INTERNATIONAL CARRIERS (Fallback)
  await createCarrier({
    carrierName: 'Twilio',
    region: 'international',
    priority: 10,
    sipEndpoint: 'sip.twilio.com',
    apiBaseUrl: 'https://api.twilio.com',
    maxConcurrentCalls: 10000,
    latencyBenchmarkMs: 300,
    costPerMinuteZar: '1.20',
    currency: 'USD',
    setupFee: '0',
    monthlyBase: '0',
    supportedCodecs: ['G729', 'GSM', 'OPUS', 'G711'],
    capabilities: {
      sipTrunk: true,
      numberProvisioning: true,
      smsSupport: true,
      concurrentChannels: 10000,
      codecSupport: ['G729', 'GSM', 'OPUS', 'G711'],
    },
  });
  console.log('✅ Added Twilio (Priority 10 - International Fallback)');

  await createCarrier({
    carrierName: 'Telnyx',
    region: 'international',
    priority: 11,
    sipEndpoint: 'sip.telnyx.com',
    apiBaseUrl: 'https://api.telnyx.com',
    maxConcurrentCalls: 10000,
    latencyBenchmarkMs: 280,
    costPerMinuteZar: '1.10',
    currency: 'USD',
    setupFee: '0',
    monthlyBase: '0',
    supportedCodecs: ['G729', 'GSM', 'OPUS', 'G711'],
    capabilities: {
      sipTrunk: true,
      numberProvisioning: true,
      smsSupport: true,
      concurrentChannels: 10000,
      codecSupport: ['G729', 'GSM', 'OPUS', 'G711'],
    },
  });
  console.log('✅ Added Telnyx (Priority 11 - International Fallback)');

  console.log('🎉 Carrier seeding complete!');
}

// Run if executed directly
if (require.main === module) {
  seedSouthAfricanCarriers()
    .then(() => {
      console.log('✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

