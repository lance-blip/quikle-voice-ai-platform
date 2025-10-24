/**
 * Pricing Tiers and Feature Restrictions
 * Implements freemium strategy to drive upgrades
 */

export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'enterprise';

export interface PricingTier {
  id: SubscriptionTier;
  name: string;
  price: number; // Monthly price in USD
  yearlyPrice: number; // Yearly price in USD (with discount)
  features: {
    // Agent limits
    maxAgents: number;
    
    // Call limits
    monthlyMinutes: number;
    
    // Voice features
    voiceCloning: boolean;
    customVoices: number;
    
    // Integrations
    integrations: boolean;
    advancedIntegrations: boolean; // Stripe, advanced CRM features
    
    // AI Analysis
    aiAnalysis: boolean;
    sentimentAnalysis: boolean;
    intentDetection: boolean;
    
    // Automations
    automations: boolean;
    advancedAutomations: boolean;
    
    // Analytics
    basicAnalytics: boolean;
    advancedAnalytics: boolean;
    customReports: boolean;
    
    // White-labeling
    whiteLabel: boolean;
    customDomain: boolean;
    
    // Support
    support: 'community' | 'email' | 'priority' | 'dedicated';
    
    // Additional features
    multiLanguage: boolean;
    apiAccess: boolean;
    webhooks: boolean;
    sso: boolean;
  };
}

export const PRICING_TIERS: Record<SubscriptionTier, PricingTier> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    yearlyPrice: 0,
    features: {
      maxAgents: 1,
      monthlyMinutes: 100,
      voiceCloning: false,
      customVoices: 0,
      integrations: false,
      advancedIntegrations: false,
      aiAnalysis: false,
      sentimentAnalysis: false,
      intentDetection: false,
      automations: false,
      advancedAutomations: false,
      basicAnalytics: true,
      advancedAnalytics: false,
      customReports: false,
      whiteLabel: false,
      customDomain: false,
      support: 'community',
      multiLanguage: false,
      apiAccess: false,
      webhooks: false,
      sso: false,
    },
  },
  
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 49,
    yearlyPrice: 470, // ~20% discount
    features: {
      maxAgents: 5,
      monthlyMinutes: 1000,
      voiceCloning: true,
      customVoices: 3,
      integrations: true,
      advancedIntegrations: false,
      aiAnalysis: true,
      sentimentAnalysis: true,
      intentDetection: false,
      automations: true,
      advancedAutomations: false,
      basicAnalytics: true,
      advancedAnalytics: true,
      customReports: false,
      whiteLabel: false,
      customDomain: false,
      support: 'email',
      multiLanguage: false,
      apiAccess: true,
      webhooks: true,
      sso: false,
    },
  },
  
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 149,
    yearlyPrice: 1430, // ~20% discount
    features: {
      maxAgents: 25,
      monthlyMinutes: 5000,
      voiceCloning: true,
      customVoices: 15,
      integrations: true,
      advancedIntegrations: true,
      aiAnalysis: true,
      sentimentAnalysis: true,
      intentDetection: true,
      automations: true,
      advancedAutomations: true,
      basicAnalytics: true,
      advancedAnalytics: true,
      customReports: true,
      whiteLabel: true,
      customDomain: true,
      support: 'priority',
      multiLanguage: true,
      apiAccess: true,
      webhooks: true,
      sso: false,
    },
  },
  
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 499,
    yearlyPrice: 4790, // ~20% discount
    features: {
      maxAgents: 999999, // Unlimited
      monthlyMinutes: 999999, // Unlimited
      voiceCloning: true,
      customVoices: 999999, // Unlimited
      integrations: true,
      advancedIntegrations: true,
      aiAnalysis: true,
      sentimentAnalysis: true,
      intentDetection: true,
      automations: true,
      advancedAutomations: true,
      basicAnalytics: true,
      advancedAnalytics: true,
      customReports: true,
      whiteLabel: true,
      customDomain: true,
      support: 'dedicated',
      multiLanguage: true,
      apiAccess: true,
      webhooks: true,
      sso: true,
    },
  },
};

/**
 * Check if a feature is available for a given tier
 */
export function hasFeature(tier: SubscriptionTier, feature: keyof PricingTier['features']): boolean {
  return PRICING_TIERS[tier].features[feature] as boolean;
}

/**
 * Get upgrade message for a locked feature
 */
export function getUpgradeMessage(feature: string, currentTier: SubscriptionTier): string {
  const messages: Record<string, string> = {
    voiceCloning: 'Upgrade to Starter or higher to unlock voice cloning',
    integrations: 'Upgrade to Starter or higher to connect integrations',
    aiAnalysis: 'Upgrade to Starter or higher for AI-powered call analysis',
    automations: 'Upgrade to Starter or higher to create automations',
    whiteLabel: 'Upgrade to Professional for white-label branding',
    customDomain: 'Upgrade to Professional for custom domain support',
    advancedAnalytics: 'Upgrade to Starter or higher for advanced analytics',
    intentDetection: 'Upgrade to Professional for intent detection',
    multiLanguage: 'Upgrade to Professional for multi-language support',
    sso: 'Upgrade to Enterprise for SSO authentication',
  };
  
  return messages[feature] || `Upgrade to unlock this feature`;
}

/**
 * Get minimum tier required for a feature
 */
export function getMinimumTier(feature: keyof PricingTier['features']): SubscriptionTier {
  const tiers: SubscriptionTier[] = ['free', 'starter', 'professional', 'enterprise'];
  
  for (const tier of tiers) {
    if (PRICING_TIERS[tier].features[feature]) {
      return tier;
    }
  }
  
  return 'enterprise';
}

