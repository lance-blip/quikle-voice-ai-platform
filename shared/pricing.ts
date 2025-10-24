/**
 * Pricing Tiers and Feature Restrictions (ZAR-based South African Pricing)
 * Updated complete pricing revision with detailed feature breakdowns
 */

export type SubscriptionTier = 'freemium' | 'starter' | 'professional' | 'enterprise' | 'custom';

export interface PricingTier {
  id: SubscriptionTier;
  name: string;
  price: number; // Monthly price in ZAR
  priceUSD: number; // Monthly price in USD (for reference)
  yearlyPrice: number; // Yearly price in ZAR (with discount)
  description: string;
  features: {
    // Core limits
    maxAgents: number;
    monthlyMinutes: number;
    maxCallsPerDay: number;
    
    // Knowledge base
    knowledgeBaseSize: string; // e.g., "1 KB", "Unlimited"
    knowledgeBasesCount: string; // e.g., "Limited", "Unlimited"
    
    // Voice features
    voiceCloning: boolean;
    customVoices: number;
    
    // Dashboard & Analytics
    dashboard: 'basic' | 'full' | 'advanced';
    realTimeAnalytics: boolean;
    advancedReporting: boolean;
    performanceMetrics: boolean;
    customReports: boolean;
    
    // Integrations
    integrations: boolean;
    advancedIntegrations: boolean;
    customIntegrations: boolean;
    apiAccess: boolean;
    priorityApiAccess: boolean;
    webhooks: 'none' | 'basic' | 'advanced';
    
    // AI Analysis
    aiAnalysis: boolean;
    sentimentAnalysis: boolean;
    intentDetection: boolean;
    
    // Automations
    automations: boolean;
    advancedAutomations: boolean;
    
    // Call features
    callRecordings: boolean;
    callTranscripts: boolean;
    callHistory: boolean;
    realTimeMonitoring: boolean;
    bulkExport: boolean;
    bulkTranscriptionDownloads: boolean;
    callRouting: boolean;
    intelligentCallRouting: boolean;
    
    // White-labeling & Branding
    whiteLabel: 'none' | 'options' | 'dashboard' | 'full';
    customBranding: boolean;
    customDomain: boolean;
    
    // Support
    support: 'email' | 'email-24-48hr' | 'priority-24hr' | 'dedicated-24-7';
    supportChannels: string; // e.g., "Email", "Chat + Email", "24/7 Phone + Chat + Email"
    slaResponse: string; // e.g., "Standard", "24-hour guaranteed", "1-hour SLA"
    dedicatedAccountManager: boolean;
    
    // Team & User Management
    customUserRoles: boolean;
    multiUserTeamManagement: boolean;
    bulkUserManagement: boolean;
    
    // Advanced features
    multiLanguage: boolean;
    sso: boolean;
    multiRegionDeployment: boolean;
    dedicatedSipTrunk: boolean;
    priorityInfrastructure: boolean;
    customTraining: boolean;
    advancedSecurity: boolean;
    complianceAuditTrails: boolean;
    customFeatureDevelopment: boolean;
    directInfrastructureAccess: boolean;
    enterpriseMonitoring: boolean;
    customSlaAgreements: boolean;
    volumePricingDiscounts: boolean;
    customWebhookLimits: boolean;
    
    // Performance
    uptimeSla: string; // e.g., "Standard", "99.99%"
    agentCostComparison: string; // e.g., "3.6x cheaper than human agents"
  };
  whyChoose?: string[]; // Value propositions for this tier
}

export const PRICING_TIERS: Record<SubscriptionTier, PricingTier> = {
  freemium: {
    id: 'freemium',
    name: 'Freemium',
    price: 0,
    priceUSD: 0,
    yearlyPrice: 0,
    description: 'Get started with basic voice AI capabilities',
    features: {
      maxAgents: 1,
      monthlyMinutes: 100,
      maxCallsPerDay: 5,
      knowledgeBaseSize: '1 KB',
      knowledgeBasesCount: 'Limited',
      voiceCloning: false,
      customVoices: 0,
      dashboard: 'basic',
      realTimeAnalytics: false,
      advancedReporting: false,
      performanceMetrics: false,
      customReports: false,
      integrations: false,
      advancedIntegrations: false,
      customIntegrations: false,
      apiAccess: false,
      priorityApiAccess: false,
      webhooks: 'none',
      aiAnalysis: false,
      sentimentAnalysis: false,
      intentDetection: false,
      automations: false,
      advancedAutomations: false,
      callRecordings: true,
      callTranscripts: false,
      callHistory: true,
      realTimeMonitoring: false,
      bulkExport: false,
      bulkTranscriptionDownloads: false,
      callRouting: false,
      intelligentCallRouting: false,
      whiteLabel: 'none',
      customBranding: false,
      customDomain: false,
      support: 'email',
      supportChannels: 'Email',
      slaResponse: 'Standard',
      dedicatedAccountManager: false,
      customUserRoles: false,
      multiUserTeamManagement: false,
      bulkUserManagement: false,
      multiLanguage: false,
      sso: false,
      multiRegionDeployment: false,
      dedicatedSipTrunk: false,
      priorityInfrastructure: false,
      customTraining: false,
      advancedSecurity: false,
      complianceAuditTrails: false,
      customFeatureDevelopment: false,
      directInfrastructureAccess: false,
      enterpriseMonitoring: false,
      customSlaAgreements: false,
      volumePricingDiscounts: false,
      customWebhookLimits: false,
      uptimeSla: 'Standard',
      agentCostComparison: 'N/A',
    },
  },
  
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 8440,
    priceUSD: 49,
    yearlyPrice: 91000, // ~10% discount
    description: 'Perfect for small businesses getting started with AI agents',
    features: {
      maxAgents: 5,
      monthlyMinutes: 2000,
      maxCallsPerDay: 999999, // Unlimited
      knowledgeBaseSize: 'Unlimited',
      knowledgeBasesCount: 'Unlimited',
      voiceCloning: true,
      customVoices: 5,
      dashboard: 'full',
      realTimeAnalytics: true,
      advancedReporting: false,
      performanceMetrics: true,
      customReports: false,
      integrations: true,
      advancedIntegrations: false,
      customIntegrations: false,
      apiAccess: true,
      priorityApiAccess: false,
      webhooks: 'basic',
      aiAnalysis: true,
      sentimentAnalysis: true,
      intentDetection: true,
      automations: true,
      advancedAutomations: false,
      callRecordings: true,
      callTranscripts: true,
      callHistory: true,
      realTimeMonitoring: true,
      bulkExport: true,
      bulkTranscriptionDownloads: false,
      callRouting: false,
      intelligentCallRouting: false,
      whiteLabel: 'none',
      customBranding: false,
      customDomain: false,
      support: 'email-24-48hr',
      supportChannels: 'Email',
      slaResponse: '24-48hr',
      dedicatedAccountManager: false,
      customUserRoles: false,
      multiUserTeamManagement: false,
      bulkUserManagement: false,
      multiLanguage: false,
      sso: false,
      multiRegionDeployment: false,
      dedicatedSipTrunk: false,
      priorityInfrastructure: false,
      customTraining: false,
      advancedSecurity: false,
      complianceAuditTrails: false,
      customFeatureDevelopment: false,
      directInfrastructureAccess: false,
      enterpriseMonitoring: false,
      customSlaAgreements: false,
      volumePricingDiscounts: false,
      customWebhookLimits: false,
      uptimeSla: 'Standard',
      agentCostComparison: '3.6x cheaper than human agents (R1,688/agent/month)',
    },
    whyChoose: [
      'Get 5 full-time AI agents for cost of 1 human',
      'Deploy first agent in under 1 hour',
      '2,000 monthly minutes (handles ~400 calls)',
      'Full API access for integrations',
      'Unlimited knowledge bases',
      'Real-time analytics to track performance',
      'Scale up anytime without contracts',
    ],
  },
  
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 13100,
    priceUSD: 149,
    yearlyPrice: 141500, // ~10% discount
    description: 'Advanced features for growing businesses',
    features: {
      maxAgents: 10,
      monthlyMinutes: 5000,
      maxCallsPerDay: 999999,
      knowledgeBaseSize: 'Unlimited',
      knowledgeBasesCount: 'Unlimited',
      voiceCloning: true,
      customVoices: 10,
      dashboard: 'advanced',
      realTimeAnalytics: true,
      advancedReporting: true,
      performanceMetrics: true,
      customReports: true,
      integrations: true,
      advancedIntegrations: true,
      customIntegrations: true,
      apiAccess: true,
      priorityApiAccess: true,
      webhooks: 'advanced',
      aiAnalysis: true,
      sentimentAnalysis: true,
      intentDetection: true,
      automations: true,
      advancedAutomations: true,
      callRecordings: true,
      callTranscripts: true,
      callHistory: true,
      realTimeMonitoring: true,
      bulkExport: true,
      bulkTranscriptionDownloads: true,
      callRouting: true,
      intelligentCallRouting: true,
      whiteLabel: 'dashboard',
      customBranding: true,
      customDomain: true,
      support: 'priority-24hr',
      supportChannels: 'Chat + Email',
      slaResponse: '24-hour guaranteed',
      dedicatedAccountManager: false,
      customUserRoles: true,
      multiUserTeamManagement: true,
      bulkUserManagement: false,
      multiLanguage: true,
      sso: false,
      multiRegionDeployment: false,
      dedicatedSipTrunk: false,
      priorityInfrastructure: false,
      customTraining: false,
      advancedSecurity: false,
      complianceAuditTrails: false,
      customFeatureDevelopment: false,
      directInfrastructureAccess: false,
      enterpriseMonitoring: false,
      customSlaAgreements: false,
      volumePricingDiscounts: false,
      customWebhookLimits: false,
      uptimeSla: '99.9%',
      agentCostComparison: '4.6x cheaper than human agents (R1,310/agent/month)',
    },
    whyChoose: [
      'Double agent capacity to 10',
      '5,000 monthly minutes (~1,000 calls)',
      'White-label entire dashboard',
      'Priority support guaranteed',
      'Advanced reporting shows ROI',
      'Custom user roles for access control',
      'Priority API access',
      'Multi-team management',
      'Intelligent call routing',
      'Save R4,000+/month vs hiring',
    ],
  },
  
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 24400,
    priceUSD: 499,
    yearlyPrice: 263500, // ~10% discount
    description: 'Enterprise-grade solution with dedicated support',
    features: {
      maxAgents: 40,
      monthlyMinutes: 20000,
      maxCallsPerDay: 999999,
      knowledgeBaseSize: 'Unlimited',
      knowledgeBasesCount: 'Unlimited',
      voiceCloning: true,
      customVoices: 999999,
      dashboard: 'advanced',
      realTimeAnalytics: true,
      advancedReporting: true,
      performanceMetrics: true,
      customReports: true,
      integrations: true,
      advancedIntegrations: true,
      customIntegrations: true,
      apiAccess: true,
      priorityApiAccess: true,
      webhooks: 'advanced',
      aiAnalysis: true,
      sentimentAnalysis: true,
      intentDetection: true,
      automations: true,
      advancedAutomations: true,
      callRecordings: true,
      callTranscripts: true,
      callHistory: true,
      realTimeMonitoring: true,
      bulkExport: true,
      bulkTranscriptionDownloads: true,
      callRouting: true,
      intelligentCallRouting: true,
      whiteLabel: 'full',
      customBranding: true,
      customDomain: true,
      support: 'dedicated-24-7',
      supportChannels: '24/7 Phone + Chat + Email',
      slaResponse: 'Priority 1-hour SLA',
      dedicatedAccountManager: true,
      customUserRoles: true,
      multiUserTeamManagement: true,
      bulkUserManagement: true,
      multiLanguage: true,
      sso: true,
      multiRegionDeployment: true,
      dedicatedSipTrunk: true,
      priorityInfrastructure: true,
      customTraining: true,
      advancedSecurity: true,
      complianceAuditTrails: true,
      customFeatureDevelopment: true,
      directInfrastructureAccess: true,
      enterpriseMonitoring: true,
      customSlaAgreements: true,
      volumePricingDiscounts: true,
      customWebhookLimits: true,
      uptimeSla: '99.99%',
      agentCostComparison: '9.8x cheaper than human agents (R610/agent/month)',
    },
    whyChoose: [
      '40+ agents handling 20,000+ minutes',
      'Dedicated account manager ensures success',
      '24/7 support when you need it',
      '99.99% uptime guarantee with SLA',
      'Full white-label (your branding)',
      'Custom integrations for unique needs',
      'Multi-region for worldwide low latency',
      'Compliance & audit trails included',
      'Save R200,000+/month vs hiring',
      'Direct infrastructure access',
    ],
  },
  
  custom: {
    id: 'custom',
    name: 'Custom Enterprise',
    price: 0, // Custom pricing
    priceUSD: 0,
    yearlyPrice: 0,
    description: 'Tailored solutions for unique enterprise requirements',
    features: {
      maxAgents: 999999,
      monthlyMinutes: 999999,
      maxCallsPerDay: 999999,
      knowledgeBaseSize: 'Unlimited',
      knowledgeBasesCount: 'Unlimited',
      voiceCloning: true,
      customVoices: 999999,
      dashboard: 'advanced',
      realTimeAnalytics: true,
      advancedReporting: true,
      performanceMetrics: true,
      customReports: true,
      integrations: true,
      advancedIntegrations: true,
      customIntegrations: true,
      apiAccess: true,
      priorityApiAccess: true,
      webhooks: 'advanced',
      aiAnalysis: true,
      sentimentAnalysis: true,
      intentDetection: true,
      automations: true,
      advancedAutomations: true,
      callRecordings: true,
      callTranscripts: true,
      callHistory: true,
      realTimeMonitoring: true,
      bulkExport: true,
      bulkTranscriptionDownloads: true,
      callRouting: true,
      intelligentCallRouting: true,
      whiteLabel: 'full',
      customBranding: true,
      customDomain: true,
      support: 'dedicated-24-7',
      supportChannels: '24/7 Phone + Chat + Email',
      slaResponse: 'Custom SLA',
      dedicatedAccountManager: true,
      customUserRoles: true,
      multiUserTeamManagement: true,
      bulkUserManagement: true,
      multiLanguage: true,
      sso: true,
      multiRegionDeployment: true,
      dedicatedSipTrunk: true,
      priorityInfrastructure: true,
      customTraining: true,
      advancedSecurity: true,
      complianceAuditTrails: true,
      customFeatureDevelopment: true,
      directInfrastructureAccess: true,
      enterpriseMonitoring: true,
      customSlaAgreements: true,
      volumePricingDiscounts: true,
      customWebhookLimits: true,
      uptimeSla: 'Custom SLA',
      agentCostComparison: 'Custom calculation',
    },
  },
};

/**
 * Check if a feature is available for a given tier
 */
export function hasFeature(tier: SubscriptionTier, feature: keyof PricingTier['features']): boolean {
  const value = PRICING_TIERS[tier].features[feature];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  if (typeof value === 'string') return value !== 'none' && value !== 'Limited' && value !== 'Standard';
  return false;
}

/**
 * Get upgrade message for a locked feature
 */
export function getUpgradeMessage(feature: string, currentTier: SubscriptionTier): string {
  const messages: Record<string, string> = {
    voiceCloning: 'Upgrade to Starter (R8,440/mo) to unlock voice cloning',
    integrations: 'Upgrade to Starter (R8,440/mo) to connect integrations',
    aiAnalysis: 'Upgrade to Starter (R8,440/mo) for AI-powered call analysis',
    automations: 'Upgrade to Starter (R8,440/mo) to create automations',
    whiteLabel: 'Upgrade to Professional (R13,100/mo) for white-label branding',
    customDomain: 'Upgrade to Professional (R13,100/mo) for custom domain support',
    advancedAnalytics: 'Upgrade to Professional (R13,100/mo) for advanced analytics',
    intentDetection: 'Upgrade to Professional (R13,100/mo) for intent detection',
    multiLanguage: 'Upgrade to Professional (R13,100/mo) for multi-language support',
    sso: 'Upgrade to Enterprise (R24,400/mo) for SSO authentication',
    dedicatedAccountManager: 'Upgrade to Enterprise (R24,400/mo) for dedicated account manager',
  };
  
  return messages[feature] || `Upgrade to unlock this feature`;
}

/**
 * Get minimum tier required for a feature
 */
export function getMinimumTier(feature: keyof PricingTier['features']): SubscriptionTier {
  const tiers: SubscriptionTier[] = ['freemium', 'starter', 'professional', 'enterprise', 'custom'];
  
  for (const tier of tiers) {
    if (hasFeature(tier, feature)) {
      return tier;
    }
  }
  
  return 'custom';
}

