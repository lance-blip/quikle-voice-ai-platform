import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, ExternalLink, Plus, Settings, Zap } from "lucide-react";
import { toast } from "sonner";

interface Integration {
  id: string;
  name: string;
  description: string;
  category: "crm" | "calendar" | "payment" | "communication" | "automation";
  logo: string;
  connected: boolean;
  features: string[];
}

export default function Integrations() {
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const integrations: Integration[] = [
    {
      id: "salesforce",
      name: "Salesforce",
      description: "Sync contacts, leads, and opportunities automatically",
      category: "crm",
      logo: "🔵",
      connected: false,
      features: ["Contact sync", "Lead tracking", "Opportunity management", "Custom fields"],
    },
    {
      id: "hubspot",
      name: "HubSpot",
      description: "Integrate with HubSpot CRM for seamless contact management",
      category: "crm",
      logo: "🟠",
      connected: true,
      features: ["Contact sync", "Deal tracking", "Email integration", "Workflows"],
    },
    {
      id: "pipedrive",
      name: "Pipedrive",
      description: "Connect your sales pipeline with voice agent interactions",
      category: "crm",
      logo: "🟢",
      connected: false,
      features: ["Pipeline sync", "Activity logging", "Deal updates", "Custom fields"],
    },
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Schedule appointments and sync availability",
      category: "calendar",
      logo: "📅",
      connected: true,
      features: ["Appointment booking", "Availability check", "Event creation", "Reminders"],
    },
    {
      id: "calendly",
      name: "Calendly",
      description: "Enable automated scheduling through voice conversations",
      category: "calendar",
      logo: "🗓️",
      connected: false,
      features: ["Smart scheduling", "Buffer times", "Round-robin", "Team scheduling"],
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Process payments and manage subscriptions",
      category: "payment",
      logo: "💳",
      connected: false,
      features: ["Payment processing", "Subscription management", "Invoicing", "Refunds"],
    },
    {
      id: "sendgrid",
      name: "SendGrid",
      description: "Send follow-up emails after calls",
      category: "communication",
      logo: "✉️",
      connected: false,
      features: ["Email sending", "Templates", "Analytics", "Scheduling"],
    },
    {
      id: "twilio",
      name: "Twilio SMS",
      description: "Send SMS notifications and follow-ups",
      category: "communication",
      logo: "📱",
      connected: true,
      features: ["SMS sending", "MMS support", "Delivery tracking", "Templates"],
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Connect to 5,000+ apps with automated workflows",
      category: "automation",
      logo: "⚡",
      connected: false,
      features: ["Multi-step zaps", "Filters", "Delays", "Custom webhooks"],
    },
    {
      id: "make",
      name: "Make (Integromat)",
      description: "Build complex automation scenarios",
      category: "automation",
      logo: "🔄",
      connected: false,
      features: ["Visual builder", "Advanced routing", "Data transformation", "Error handling"],
    },
  ];

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration);
    setConnectDialogOpen(true);
  };

  const handleDisconnect = (integrationId: string) => {
    toast.success("Integration disconnected successfully");
  };

  const categories = [
    { value: "all", label: "All Integrations" },
    { value: "crm", label: "CRM" },
    { value: "calendar", label: "Calendar" },
    { value: "payment", label: "Payment" },
    { value: "communication", label: "Communication" },
    { value: "automation", label: "Automation" },
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredIntegrations =
    selectedCategory === "all"
      ? integrations
      : integrations.filter((i) => i.category === selectedCategory);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground mt-2">
            Connect your favorite tools and automate workflows.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connected</CardTitle>
              <CheckCircle className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {integrations.filter((i) => i.connected).length}
              </div>
              <p className="text-xs text-muted-foreground">Active integrations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{integrations.length}</div>
              <p className="text-xs text-muted-foreground">Total integrations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length - 1}</div>
              <p className="text-xs text-muted-foreground">Integration types</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList>
            {categories.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="space-y-4 mt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredIntegrations.map((integration) => (
                <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{integration.logo}</div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {integration.name}
                            {integration.connected && (
                              <Badge variant="outline" className="bg-accent/10 text-accent">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Connected
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {integration.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Features</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {integration.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="text-accent">•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      {integration.connected ? (
                        <>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDisconnect(integration.id)}
                          >
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full"
                          onClick={() => handleConnect(integration)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Connect Dialog */}
        <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-2xl">{selectedIntegration?.logo}</span>
                Connect {selectedIntegration?.name}
              </DialogTitle>
              <DialogDescription>{selectedIntegration?.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input id="api-key" type="password" placeholder="Enter your API key" />
                <p className="text-xs text-muted-foreground">
                  You can find your API key in your {selectedIntegration?.name} account settings.
                </p>
              </div>

              {selectedIntegration?.category === "crm" && (
                <div className="space-y-2">
                  <Label htmlFor="instance-url">Instance URL</Label>
                  <Input
                    id="instance-url"
                    placeholder="https://your-instance.salesforce.com"
                  />
                </div>
              )}

              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <h4 className="text-sm font-semibold">What you'll get:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {selectedIntegration?.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConnectDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast.success(`${selectedIntegration?.name} connected successfully`);
                  setConnectDialogOpen(false);
                }}
              >
                Connect Integration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

