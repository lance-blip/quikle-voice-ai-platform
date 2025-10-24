import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Save, Key, Webhook, Palette } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
  const { data: agency, refetch } = trpc.agency.get.useQuery();
  const [formData, setFormData] = useState({
    name: agency?.name || "",
    domain: agency?.customDomain || "",
    logoUrl: agency?.logo || "",
    primaryColor: "#191970",
    secondaryColor: "#E27D60",
  });

  const updateMutation = trpc.agency.update.useMutation({
    onSuccess: () => {
      toast.success("Settings saved successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save settings");
    },
  });

  const handleSave = () => {
    if (!agency?.id) return;
    updateMutation.mutate({
      id: agency.id,
      ...formData,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your agency profile, branding, and integrations.
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="api">API Keys</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agency Information</CardTitle>
                <CardDescription>
                  Basic information about your agency.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Agency Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your Agency Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Custom Domain</Label>
                  <Input
                    id="domain"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="app.youragency.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Configure a custom domain for your white-labeled platform.
                  </p>
                </div>

                <Button onClick={handleSave} disabled={updateMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branding Settings */}
          <TabsContent value="branding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  White-Label Branding
                </CardTitle>
                <CardDescription>
                  Customize the look and feel of your platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        value={formData.primaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        placeholder="#191970"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        className="w-20 h-10"
                      />
                      <Input
                        value={formData.secondaryColor}
                        onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                        placeholder="#E27D60"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="text-sm font-semibold mb-3">Preview</h4>
                  <div className="space-y-2">
                    <div
                      className="h-12 rounded flex items-center px-4 text-white font-semibold"
                      style={{ backgroundColor: formData.primaryColor }}
                    >
                      Primary Color
                    </div>
                    <div
                      className="h-12 rounded flex items-center px-4 text-white font-semibold"
                      style={{ backgroundColor: formData.secondaryColor }}
                    >
                      Secondary Color
                    </div>
                  </div>
                </div>

                <Button onClick={handleSave} disabled={updateMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? "Saving..." : "Save Branding"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys */}
          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  API Keys
                </CardTitle>
                <CardDescription>
                  Manage API keys for integrations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>ElevenLabs API Key</Label>
                  <Input
                    type="password"
                    placeholder="sk_..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cartesia API Key</Label>
                  <Input
                    type="password"
                    placeholder="cart_..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Twilio Account SID</Label>
                  <Input
                    type="password"
                    placeholder="AC..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Twilio Auth Token</Label>
                  <Input
                    type="password"
                    placeholder="..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Telnyx API Key</Label>
                  <Input
                    type="password"
                    placeholder="KEY..."
                  />
                </div>

                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save API Keys
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks */}
          <TabsContent value="webhooks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Webhook Configuration
                </CardTitle>
                <CardDescription>
                  Configure webhooks for external integrations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <Input
                    placeholder="https://your-app.com/webhook"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Webhook Secret</Label>
                  <Input
                    type="password"
                    placeholder="whsec_..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Used to verify webhook signatures.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Events to Subscribe</Label>
                  <div className="space-y-2">
                    {[
                      "call.started",
                      "call.completed",
                      "call.failed",
                      "agent.created",
                      "agent.updated",
                    ].map((event) => (
                      <label key={event} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded" />
                        <code className="text-xs">{event}</code>
                      </label>
                    ))}
                  </div>
                </div>

                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Webhook Config
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

