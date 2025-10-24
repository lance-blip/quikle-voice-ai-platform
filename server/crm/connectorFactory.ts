/**
 * CRM Connector Factory
 * Creates and manages CRM connector instances
 */

import type { CRMProvider, CRMConnector } from './types';
import { QuikleInnovationHubConnector } from './connectors/quikleInnovationHub';
import { HubSpotConnector } from './connectors/hubspot';
import { SalesforceConnector } from './connectors/salesforce';

/**
 * CRM Connector Registry
 * Maps provider names to connector classes
 */
const connectorRegistry: Record<CRMProvider, new () => CRMConnector> = {
  'quikle-innovation-hub': QuikleInnovationHubConnector,
  'hubspot': HubSpotConnector,
  'salesforce': SalesforceConnector,
  // Placeholders for remaining connectors
  'pipedrive': QuikleInnovationHubConnector as any, // TODO: Implement Pipedrive connector
  'zoho': QuikleInnovationHubConnector as any, // TODO: Implement Zoho connector
  'monday': QuikleInnovationHubConnector as any, // TODO: Implement Monday connector
};

/**
 * Create a CRM connector instance
 */
export function createCRMConnector(provider: CRMProvider): CRMConnector {
  const ConnectorClass = connectorRegistry[provider];
  
  if (!ConnectorClass) {
    throw new Error(`CRM connector not found for provider: ${provider}`);
  }

  return new ConnectorClass();
}

/**
 * Get all available CRM providers
 */
export function getAvailableCRMProviders(): CRMProvider[] {
  return Object.keys(connectorRegistry) as CRMProvider[];
}

/**
 * Check if a CRM provider is supported
 */
export function isCRMProviderSupported(provider: string): provider is CRMProvider {
  return provider in connectorRegistry;
}

/**
 * CRM Provider Metadata
 */
export const CRM_PROVIDER_METADATA: Record<CRMProvider, {
  name: string;
  description: string;
  logo: string;
  category: 'native' | 'popular' | 'enterprise' | 'project-management';
  features: string[];
  setupComplexity: 'easy' | 'medium' | 'complex';
  pricingModel: 'free' | 'freemium' | 'paid';
  recommendedFor: string[];
}> = {
  'quikle-innovation-hub': {
    name: 'Quikle Innovation Hub',
    description: 'Native Quikle CRM and Project Management platform with deep integration',
    logo: '🎯',
    category: 'native',
    features: [
      'Native authentication',
      'Real-time sync',
      'Project management',
      'Task tracking',
      'Team collaboration',
      'Custom workflows',
      'Advanced reporting',
      'Zero configuration',
    ],
    setupComplexity: 'easy',
    pricingModel: 'free',
    recommendedFor: [
      'Quikle ecosystem users',
      'Agencies needing project management',
      'Teams requiring unified platform',
      'Users wanting seamless integration',
    ],
  },
  'hubspot': {
    name: 'HubSpot',
    description: 'All-in-one CRM, marketing, and sales platform',
    logo: '🟠',
    category: 'popular',
    features: [
      'Contact management',
      'Deal tracking',
      'Email integration',
      'Marketing automation',
      'Sales pipeline',
      'Reporting dashboards',
    ],
    setupComplexity: 'medium',
    pricingModel: 'freemium',
    recommendedFor: [
      'SMBs',
      'Marketing teams',
      'Sales-focused organizations',
      'Inbound marketing strategies',
    ],
  },
  'salesforce': {
    name: 'Salesforce',
    description: 'Enterprise-grade CRM with extensive customization',
    logo: '☁️',
    category: 'enterprise',
    features: [
      'Advanced customization',
      'Enterprise security',
      'AppExchange marketplace',
      'AI-powered insights',
      'Multi-cloud solutions',
      'Complex workflows',
    ],
    setupComplexity: 'complex',
    pricingModel: 'paid',
    recommendedFor: [
      'Large enterprises',
      'Complex sales processes',
      'Multi-department organizations',
      'Regulated industries',
    ],
  },
  'pipedrive': {
    name: 'Pipedrive',
    description: 'Sales-focused CRM built for pipeline management',
    logo: '🟢',
    category: 'popular',
    features: [
      'Visual pipeline',
      'Activity tracking',
      'Email integration',
      'Mobile app',
      'Sales reporting',
      'Goal setting',
    ],
    setupComplexity: 'easy',
    pricingModel: 'paid',
    recommendedFor: [
      'Sales teams',
      'Pipeline-driven businesses',
      'Field sales',
      'Deal-focused workflows',
    ],
  },
  'zoho': {
    name: 'Zoho CRM',
    description: 'Affordable CRM with comprehensive features',
    logo: '🔵',
    category: 'popular',
    features: [
      'Multi-channel communication',
      'AI assistant (Zia)',
      'Workflow automation',
      'Social media integration',
      'Canvas customization',
      'Affordable pricing',
    ],
    setupComplexity: 'medium',
    pricingModel: 'freemium',
    recommendedFor: [
      'Budget-conscious businesses',
      'Small to medium businesses',
      'Multi-channel sales',
      'International teams',
    ],
  },
  'monday': {
    name: 'Monday.com',
    description: 'Work OS with CRM and project management capabilities',
    logo: '🎨',
    category: 'project-management',
    features: [
      'Visual boards',
      'Custom workflows',
      'Team collaboration',
      'Time tracking',
      'Automations',
      'Integrations',
    ],
    setupComplexity: 'easy',
    pricingModel: 'paid',
    recommendedFor: [
      'Project-based businesses',
      'Creative agencies',
      'Cross-functional teams',
      'Visual workflow preference',
    ],
  },
};

