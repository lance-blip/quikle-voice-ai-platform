import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Settings, TestTube, Zap, CreditCard, Calendar, Mail, Workflow } from "lucide-react";
import { toast } from "sonner";

interface IntegrationConfig {
  id: string;
  name: string;
  category: "crm" | "payment" | "calendar" | "communication" | "automation";
  icon: any;
  connected: boolean;
  status: "active" | "error" | "inactive";
  lastSync?: Date;
  config?: Record<string, string>;
}

export default function IntegrationsDashboard() {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([
    {
      id: "quikle-hub",
      name: "Quikle Innovation Hub",
      category: "crm",
      icon: Zap,
      connected: true,
      status: "active",
      lastSync: new Date(),
    },
    {
      id: "stripe",
      name: "Stripe",
      category: "payment",
      icon: CreditCard,
      connected: false,
      status: "inactive",
    },
    {
      id: "calendly",
      name: "Calendly",
      category: "calendar",
      icon: Calendar,
      connected: false,
      status: "inactive",
    },
    {
      id: "google-calendar",
      name: "Google Calendar",
      category: "calendar",
      icon: Calendar,
      connected: false,
      status: "inactive",
    },
    {
      id: "sendgrid",
      name: "SendGrid",
      category: "communication",
      icon: Mail,
      connected: false,
      status: "inactive",
    },
    {
      id: "zapier",
      name: "Zapier",
      category: "automation",
      icon: Workflow,
      connected: false,
      status: "inactive",
    },
  ]);

  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationConfig | null>(null);

  const handleConnect = (integrationId: string) => {
    setIntegrations(prev =>
      prev.map(int =>
        int.id === integrationId
          ? { ...int, connected: true, status: "active" as const, lastSync: new Date() }
          : int
      )
    );
    toast.success("Integration connected successfully");
    setConfigDialogOpen(false);
  };

  const handleDisconnect = (integrationId: string) => {
    setIntegrations(prev =>
      prev.map(int =>
        int.id === integrationId
          ? { ...int, connected: false, status: "inactive" as const }
          : int
      )
    );
    toast.success("Integration disconnected");
  };

  const handleTest = (integrationId: string) => {
    toast.success("Integration test successful");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-accent text-accent-foreground"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge>;
      case "error":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline">Inactive</Badge>;
    }
  };

  const categories = [
    { value: "all", label: "All Integrations" },
    { value: "crm", label: "CRM" },
    { value: "payment", label: "Payment" },
    { value: "calendar", label: "Calendar" },
    { value: "communication", label: "Communication" },
    { value: "automation", label: "Automation" },
  ];

  const [activeCategory, setActiveCategory] = useState("all");

  const filteredIntegrations = activeCategory === "all"
    ? integrations
    : integrations.filter(int => int.category === activeCategory);

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Integrations Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and configure all your platform integrations
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{integrations.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Connected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {integrations.filter(i => i.connected).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {integrations.filter(i => i.status === "active").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {integrations.filter(i => i.status === "error").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
          <TabsList>
            {categories.map(cat => (
              <TabsTrigger key={cat.value} value={cat.value}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Integrations Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredIntegrations.map(integration => {
            const Icon = integration.icon;
            return (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <CardDescription className="capitalize">{integration.category}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(integration.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  {integration.lastSync && (
                    <p className="text-sm text-muted-foreground mb-4">
                      Last synced: {integration.lastSync.toLocaleString()}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    {integration.connected ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedIntegration(integration);
                            setConfigDialogOpen(true);
                          }}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTest(integration.id)}
                        >
                          <TestTube className="h-4 w-4 mr-1" />
                          Test
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDisconnect(integration.id)}
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => {
                          setSelectedIntegration(integration);
                          setConfigDialogOpen(true);
                        }}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Configuration Dialog */}
        <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Configure {selectedIntegration?.name}</DialogTitle>
              <DialogDescription>
                Enter your API credentials and configuration settings
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {selectedIntegration?.id === "stripe" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="stripe-api-key">Stripe API Key</Label>
                    <Input
                      id="stripe-api-key"
                      type="password"
                      placeholder="sk_live_..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripe-webhook-secret">Webhook Secret</Label>
                    <Input
                      id="stripe-webhook-secret"
                      type="password"
                      placeholder="whsec_..."
                    />
                  </div>
                </>
              )}

              {selectedIntegration?.id === "calendly" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="calendly-api-key">Calendly API Key</Label>
                    <Input
                      id="calendly-api-key"
                      type="password"
                      placeholder="Enter your Calendly API key"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calendly-org-uri">Organization URI</Label>
                    <Input
                      id="calendly-org-uri"
                      placeholder="https://api.calendly.com/organizations/..."
                    />
                  </div>
                </>
              )}

              {selectedIntegration?.id === "google-calendar" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="google-client-id">Client ID</Label>
                    <Input
                      id="google-client-id"
                      placeholder="Enter your Google OAuth Client ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="google-client-secret">Client Secret</Label>
                    <Input
                      id="google-client-secret"
                      type="password"
                      placeholder="Enter your Google OAuth Client Secret"
                    />
                  </div>
                </>
              )}

              {selectedIntegration?.id === "sendgrid" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="sendgrid-api-key">SendGrid API Key</Label>
                    <Input
                      id="sendgrid-api-key"
                      type="password"
                      placeholder="SG...."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sendgrid-from-email">From Email</Label>
                    <Input
                      id="sendgrid-from-email"
                      type="email"
                      placeholder="noreply@yourdomain.com"
                    />
                  </div>
                </>
              )}

              {selectedIntegration?.id === "zapier" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="zapier-webhook-url">Webhook URL</Label>
                    <Input
                      id="zapier-webhook-url"
                      placeholder="https://hooks.zapier.com/hooks/catch/..."
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => selectedIntegration && handleConnect(selectedIntegration.id)}>
                {selectedIntegration?.connected ? "Save Changes" : "Connect"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

