import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Zap, Crown, Rocket, Star } from "lucide-react";
import { PRICING_TIERS, SubscriptionTier } from "@shared/pricing";

export default function Pricing() {
  const tiers: SubscriptionTier[] = ['free', 'starter', 'professional', 'enterprise'];

  const tierIcons = {
    free: Zap,
    starter: Rocket,
    professional: Crown,
    enterprise: Star,
  };

  const tierColors = {
    free: "bg-gray-500",
    starter: "bg-blue-500",
    professional: "bg-purple-500",
    enterprise: "bg-amber-500",
  };

  const handleUpgrade = (tier: SubscriptionTier) => {
    // TODO: Implement Stripe checkout
    console.log(`Upgrading to ${tier}`);
  };

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Start free and upgrade as you grow. All plans include 14-day money-back guarantee.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {tiers.map((tierId) => {
          const tier = PRICING_TIERS[tierId];
          const Icon = tierIcons[tierId];
          const colorClass = tierColors[tierId];
          const isPopular = tierId === 'professional';

          return (
            <Card key={tierId} className={`relative ${isPopular ? 'border-accent border-2 shadow-lg' : ''}`}>
              {isPopular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${colorClass} flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">
                      ${tier.price}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {tier.yearlyPrice > 0 && (
                    <div className="text-sm text-muted-foreground mt-1">
                      ${tier.yearlyPrice}/year (save 20%)
                    </div>
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      {tier.features.maxAgents === 999999 ? 'Unlimited' : tier.features.maxAgents} agent{tier.features.maxAgents !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      {tier.features.monthlyMinutes === 999999 ? 'Unlimited' : `${tier.features.monthlyMinutes.toLocaleString()}`} min/month
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {tier.features.voiceCloning ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={`text-sm ${!tier.features.voiceCloning ? 'text-muted-foreground' : ''}`}>
                      Voice cloning
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {tier.features.integrations ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={`text-sm ${!tier.features.integrations ? 'text-muted-foreground' : ''}`}>
                      Integrations
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {tier.features.aiAnalysis ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={`text-sm ${!tier.features.aiAnalysis ? 'text-muted-foreground' : ''}`}>
                      AI analysis
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {tier.features.automations ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={`text-sm ${!tier.features.automations ? 'text-muted-foreground' : ''}`}>
                      Automations
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {tier.features.whiteLabel ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={`text-sm ${!tier.features.whiteLabel ? 'text-muted-foreground' : ''}`}>
                      White-label
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm capitalize">
                      {tier.features.support} support
                    </span>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={isPopular ? "default" : "outline"}
                  onClick={() => handleUpgrade(tierId)}
                >
                  {tierId === 'free' ? 'Start Free' : tierId === 'enterprise' ? 'Contact Sales' : 'Upgrade Now'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="bg-muted rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Feature Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Feature</th>
                {tiers.map(tier => (
                  <th key={tier} className="text-center py-3 px-4 capitalize">{tier}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-4">Max Agents</td>
                {tiers.map(tier => (
                  <td key={tier} className="text-center py-3 px-4">
                    {PRICING_TIERS[tier].features.maxAgents === 999999 ? '∞' : PRICING_TIERS[tier].features.maxAgents}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Monthly Minutes</td>
                {tiers.map(tier => (
                  <td key={tier} className="text-center py-3 px-4">
                    {PRICING_TIERS[tier].features.monthlyMinutes === 999999 ? '∞' : PRICING_TIERS[tier].features.monthlyMinutes.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Voice Cloning</td>
                {tiers.map(tier => (
                  <td key={tier} className="text-center py-3 px-4">
                    {PRICING_TIERS[tier].features.voiceCloning ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">AI Analysis</td>
                {tiers.map(tier => (
                  <td key={tier} className="text-center py-3 px-4">
                    {PRICING_TIERS[tier].features.aiAnalysis ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Integrations</td>
                {tiers.map(tier => (
                  <td key={tier} className="text-center py-3 px-4">
                    {PRICING_TIERS[tier].features.integrations ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">Automations</td>
                {tiers.map(tier => (
                  <td key={tier} className="text-center py-3 px-4">
                    {PRICING_TIERS[tier].features.automations ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">White-Label</td>
                {tiers.map(tier => (
                  <td key={tier} className="text-center py-3 px-4">
                    {PRICING_TIERS[tier].features.whiteLabel ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-3 px-4">API Access</td>
                {tiers.map(tier => (
                  <td key={tier} className="text-center py-3 px-4">
                    {PRICING_TIERS[tier].features.apiAccess ? <Check className="h-5 w-5 text-green-500 mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

