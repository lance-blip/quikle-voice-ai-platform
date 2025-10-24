import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles, Zap, Building2, Crown, MessageSquare } from "lucide-react";
import { PRICING_TIERS, type SubscriptionTier } from "@shared/pricing";
import { Link } from "wouter";

const tierIcons = {
  freemium: Sparkles,
  starter: Zap,
  professional: Building2,
  enterprise: Crown,
  custom: MessageSquare,
};

const tierColors = {
  freemium: "bg-gray-100 text-gray-900",
  starter: "bg-teal-100 text-teal-900",
  professional: "bg-coral-100 text-coral-900",
  enterprise: "bg-midnight-100 text-midnight-900",
  custom: "bg-purple-100 text-purple-900",
};

export default function Pricing() {
  const tiers: SubscriptionTier[] = ['freemium', 'starter', 'professional', 'enterprise', 'custom'];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600">
            Choose the perfect plan for your business. All plans include 14-day free trial.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-teal-900">💰 Save 10% with yearly billing</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
          {tiers.map((tierId) => {
            const tier = PRICING_TIERS[tierId];
            const Icon = tierIcons[tierId];
            const isProfessional = tierId === 'professional';
            const isCustom = tierId === 'custom';
            
            return (
              <Card 
                key={tierId} 
                className={`relative ${isProfessional ? 'border-2 border-coral shadow-lg scale-105' : ''}`}
              >
                {isProfessional && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-coral text-white">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${tierColors[tierId]} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription className="text-sm">{tier.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="mb-6">
                    {isCustom ? (
                      <div className="text-3xl font-bold text-gray-900">Custom</div>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-gray-900">
                          R{tier.price.toLocaleString()}
                          <span className="text-base font-normal text-gray-600">/month</span>
                        </div>
                        {tier.yearlyPrice > 0 && (
                          <div className="text-sm text-gray-600 mt-1">
                            R{tier.yearlyPrice.toLocaleString()}/year (save 10%)
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal" />
                      <span>
                        {tier.features.maxAgents === 999999 ? 'Unlimited' : tier.features.maxAgents} agent{tier.features.maxAgents !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-teal" />
                      <span>
                        {tier.features.monthlyMinutes === 999999 ? 'Unlimited' : tier.features.monthlyMinutes.toLocaleString()} min/month
                      </span>
                    </div>
                    {tier.features.voiceCloning && (
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-teal" />
                        <span>
                          {tier.features.customVoices === 999999 ? 'Unlimited' : tier.features.customVoices} custom voice{tier.features.customVoices !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {tier.features.integrations ? (
                        <Check className="w-4 h-4 text-teal" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={!tier.features.integrations ? 'text-gray-400' : ''}>
                        Integrations
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {tier.features.aiAnalysis ? (
                        <Check className="w-4 h-4 text-teal" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400" />
                      )}
                      <span className={!tier.features.aiAnalysis ? 'text-gray-400' : ''}>
                        AI Analysis
                      </span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter>
                  {isCustom ? (
                    <Button className="w-full" variant="outline" asChild>
                      <a href="mailto:enterprise@quikle.co.za">Contact Sales</a>
                    </Button>
                  ) : (
                    <Button 
                      className={`w-full ${isProfessional ? 'bg-coral hover:bg-coral/90' : ''}`}
                      variant={isProfessional ? 'default' : 'outline'}
                      asChild
                    >
                      <Link href="/dashboard">
                        {tierId === 'freemium' ? 'Start Free' : 'Start Trial'}
                      </Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Feature Comparison</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-semibold">Feature</th>
                  {tiers.map(tierId => (
                    <th key={tierId} className="text-center py-4 px-4 font-semibold">
                      {PRICING_TIERS[tierId].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Core Features */}
                <tr className="border-b bg-gray-50">
                  <td colSpan={6} className="py-3 px-4 font-semibold text-gray-900">Core Features</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Agents</td>
                  {tiers.map(tierId => {
                    const tier = PRICING_TIERS[tierId];
                    return (
                      <td key={tierId} className="text-center py-3 px-4">
                        {tier.features.maxAgents === 999999 ? 'Unlimited' : tier.features.maxAgents}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Monthly Minutes</td>
                  {tiers.map(tierId => {
                    const tier = PRICING_TIERS[tierId];
                    return (
                      <td key={tierId} className="text-center py-3 px-4">
                        {tier.features.monthlyMinutes === 999999 ? 'Unlimited' : tier.features.monthlyMinutes.toLocaleString()}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Knowledge Base</td>
                  {tiers.map(tierId => {
                    const tier = PRICING_TIERS[tierId];
                    return (
                      <td key={tierId} className="text-center py-3 px-4">
                        {tier.features.knowledgeBasesCount}
                      </td>
                    );
                  })}
                </tr>
                
                {/* Voice Features */}
                <tr className="border-b bg-gray-50">
                  <td colSpan={6} className="py-3 px-4 font-semibold text-gray-900">Voice Features</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Voice Cloning</td>
                  {tiers.map(tierId => {
                    const tier = PRICING_TIERS[tierId];
                    return (
                      <td key={tierId} className="text-center py-3 px-4">
                        {tier.features.voiceCloning ? (
                          <Check className="w-5 h-5 text-teal mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Custom Voices</td>
                  {tiers.map(tierId => {
                    const tier = PRICING_TIERS[tierId];
                    return (
                      <td key={tierId} className="text-center py-3 px-4">
                        {tier.features.customVoices === 999999 ? 'Unlimited' : tier.features.customVoices}
                      </td>
                    );
                  })}
                </tr>
                
                {/* Analytics */}
                <tr className="border-b bg-gray-50">
                  <td colSpan={6} className="py-3 px-4 font-semibold text-gray-900">Analytics & Reporting</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Dashboard</td>
                  {tiers.map(tierId => {
                    const tier = PRICING_TIERS[tierId];
                    return (
                      <td key={tierId} className="text-center py-3 px-4 capitalize">
                        {tier.features.dashboard}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Real-time Analytics</td>
                  {tiers.map(tierId => {
                    const tier = PRICING_TIERS[tierId];
                    return (
                      <td key={tierId} className="text-center py-3 px-4">
                        {tier.features.realTimeAnalytics ? (
                          <Check className="w-5 h-5 text-teal mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Advanced Reporting</td>
                  {tiers.map(tierId => {
                    const tier = PRICING_TIERS[tierId];
                    return (
                      <td key={tierId} className="text-center py-3 px-4">
                        {tier.features.advancedReporting ? (
                          <Check className="w-5 h-5 text-teal mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
                
                {/* Integrations */}
                <tr className="border-b bg-gray-50">
                  <td colSpan={6} className="py-3 px-4 font-semibold text-gray-900">Integrations</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">API Access</td>
                  {tiers.map(tierId => {
                    const tier = PRICING_TIERS[tierId];
                    return (
                      <td key={tierId} className="text-center py-3 px-4">
                        {tier.features.apiAccess ? (
                          <Check className="w-5 h-5 text-teal mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Webhooks</td>
                  {tiers.map(tierId => {
                    const tier = PRICING_TIERS[tierId];
                    return (
                      <td key={tierId} className="text-center py-3 px-4 capitalize">
                        {tier.features.webhooks}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Custom Integrations</td>
                  {tiers.map(tierId => {
                    const tier = PRICING_TIERS[tierId];
                    return (
                      <td key={tierId} className="text-center py-3 px-4">
                        {tier.features.customIntegrations ? (
                          <Check className="w-5 h-5 text-teal mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
                
                {/* AI Features */}
                <tr className="border-b bg-gray-50">
                  <td colSpan={6} className="py-3 px-4 font-semibold text-gray-900">AI Features</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Sentiment Analysis</td>
                  {tiers.map(tierId => {
                    const tier = PRICING_TIERS[tierId];
                    return (
                      <td key={tierId} className="text-center py-3 px-4">
                        {tier.features.sentimentAnalysis ? (
                          <Check className="w-5 h-5 text-teal mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Intent Detection</td>
                  {tiers.map(tierId => {
                    const tier = PRICING_TIERS[tierId];
                    return (
                      <td key={tierId} className="text-center py-3 px-4">
                        {tier.features.intentDetection ? (
                          <Check className="w-5 h-5 text-teal mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
                
                {/* White-Label */}
                <tr className="border-b bg-gray-50">
                  <td colSpan={6} className="py-3 px-4 font-semibold text-gray-900">White-Label & Branding</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">White-Label</td>
                  {tiers.map(tierId => {
                    const tier = PRICING_TIERS[tierId];
                    return (
                      <td key={tierId} className="text-center py-3 px-4 capitalize">
                        {tier.features.whiteLabel}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Custom Domain</td>
                  {tiers.map(tierId => {
                    const tier = PRICING_TIERS[tierId];
                    return (
                      <td key={tierId} className="text-center py-3 px-4">
                        {tier.features.customDomain ? (
                          <Check className="w-5 h-5 text-teal mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
                
                {/* Support */}
                <tr className="border-b bg-gray-50">
                  <td colSpan={6} className="py-3 px-4 font-semibold text-gray-900">Support</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Support Channels</td>
                  {tiers.map(tierId => {
                    const tier = PRICING_TIERS[tierId];
                    return (
                      <td key={tierId} className="text-center py-3 px-4">
                        {tier.features.supportChannels}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">SLA Response</td>
                  {tiers.map(tierId => {
                    const tier = PRICING_TIERS[tierId];
                    return (
                      <td key={tierId} className="text-center py-3 px-4">
                        {tier.features.slaResponse}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4">Dedicated Account Manager</td>
                  {tiers.map(tierId => {
                    const tier = PRICING_TIERS[tierId];
                    return (
                      <td key={tierId} className="text-center py-3 px-4">
                        {tier.features.dedicatedAccountManager ? (
                          <Check className="w-5 h-5 text-teal mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Custom Enterprise Section */}
        <div className="mt-16 bg-gradient-to-r from-midnight to-teal rounded-2xl p-12 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Don't see what you need? Let's build something custom.</h2>
            <p className="text-xl mb-8 opacity-90">
              For enterprises requiring 20,000+ monthly minutes, 40+ concurrent agents, custom integrations, 
              white-label deployment, on-premise options, or multi-region setup.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8 text-left">
              <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                <h3 className="font-semibold mb-3">What's Included:</h3>
                <ul className="space-y-2 text-sm">
                  <li>• White-label platform with your branding</li>
                  <li>• Custom SLA agreements</li>
                  <li>• Dedicated support team</li>
                  <li>• Custom integrations & features</li>
                  <li>• On-premise deployment options</li>
                  <li>• Multi-region infrastructure</li>
                </ul>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                <h3 className="font-semibold mb-3">Process:</h3>
                <ul className="space-y-2 text-sm">
                  <li>1. Review requirements (24 hours)</li>
                  <li>2. Solutions architect creates proposal</li>
                  <li>3. Follow-up call to discuss</li>
                  <li>4. Fixed quote (within 48 hours)</li>
                  <li>5. Provision environment upon agreement</li>
                  <li>6. Typical deployment: 1-4 weeks</li>
                </ul>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-midnight hover:bg-gray-100" asChild>
                <a href="mailto:enterprise@quikle.co.za">Email enterprise@quikle.co.za</a>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Book Custom Consultation
              </Button>
            </div>
            
            <p className="mt-6 text-sm opacity-75">
              Custom quote within 24 hours • Deployment 1-4 weeks
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <details className="bg-white rounded-lg p-6 shadow">
              <summary className="font-semibold cursor-pointer">What happens when I exceed my monthly minutes?</summary>
              <p className="mt-3 text-gray-600">
                You'll receive a notification at 80% usage. Additional minutes are billed at R0.22/minute. 
                You can upgrade anytime to a higher tier for better rates.
              </p>
            </details>
            
            <details className="bg-white rounded-lg p-6 shadow">
              <summary className="font-semibold cursor-pointer">Can I cancel anytime?</summary>
              <p className="mt-3 text-gray-600">
                Yes! All plans are month-to-month with no long-term contracts. Cancel anytime from your dashboard.
              </p>
            </details>
            
            <details className="bg-white rounded-lg p-6 shadow">
              <summary className="font-semibold cursor-pointer">Do you offer refunds?</summary>
              <p className="mt-3 text-gray-600">
                We offer a 14-day money-back guarantee. If you're not satisfied, contact support for a full refund.
              </p>
            </details>
            
            <details className="bg-white rounded-lg p-6 shadow">
              <summary className="font-semibold cursor-pointer">What payment methods do you accept?</summary>
              <p className="mt-3 text-gray-600">
                We accept all major credit cards, EFT, and can arrange invoicing for Enterprise customers.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}

