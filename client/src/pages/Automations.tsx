import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Plus, Workflow, Zap, MoreVertical, Trash2, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Automations() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    triggerType: "call_completed" as string,
    triggerConditions: "{}",
    actionType: "webhook" as string,
    actionConfig: "{}",
    status: "active" as "active" | "paused",
  });

  const { data: agency } = trpc.agency.get.useQuery();
  const { data: clients } = trpc.clients.list.useQuery(
    { agencyId: agency?.id || 0 },
    { enabled: !!agency?.id }
  );

  const { data: automations, refetch } = trpc.automations.list.useQuery(
    { agencyId: agency?.id || 0 },
    { enabled: !!agency?.id }
  );

  const createMutation = trpc.automations.create.useMutation({
    onSuccess: () => {
      toast.success("Automation created successfully");
      setCreateDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        triggerType: "call_completed",
        triggerConditions: "{}",
        actionType: "webhook",
        actionConfig: "{}",
        status: "active",
      });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create automation");
    },
  });

  // Delete functionality to be implemented

  const handleCreate = () => {
    if (!selectedAgentId) {
      toast.error("Please select an agent first");
      return;
    }
    if (!agency?.id) return;
    createMutation.mutate({
      agencyId: agency.id,
      name: formData.name,
      description: formData.description,
      triggerType: formData.triggerType as any,
      triggerConfig: formData.triggerConditions,
      actions: JSON.stringify([{ type: formData.actionType, config: formData.actionConfig }]),
      enabled: formData.status === "active" ? 1 : 0,
    });
  };

  const handleDelete = (id: number) => {
    toast.info("Delete functionality coming soon");
  };

  const triggerTypes = [
    { value: "call_completed", label: "Call Completed" },
    { value: "call_failed", label: "Call Failed" },
    { value: "keyword_detected", label: "Keyword Detected" },
    { value: "sentiment_negative", label: "Negative Sentiment" },
    { value: "transfer_requested", label: "Transfer Requested" },
    { value: "schedule", label: "Scheduled Time" },
  ];

  const actionTypes = [
    { value: "webhook", label: "Send Webhook" },
    { value: "email", label: "Send Email" },
    { value: "sms", label: "Send SMS" },
    { value: "crm_update", label: "Update CRM" },
    { value: "slack", label: "Slack Notification" },
    { value: "calendar", label: "Create Calendar Event" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Automations</h1>
            <p className="text-muted-foreground mt-2">
              Create workflows that trigger actions based on call events and conditions.
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedAgentId}>
                <Plus className="h-4 w-4 mr-2" />
                Create Automation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Automation</DialogTitle>
                <DialogDescription>
                  Set up a workflow that automatically triggers actions based on events.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Automation Name *</Label>
                  <Input
                    id="name"
                    placeholder="Send CRM update after call"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this automation does..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold text-sm">Trigger</h4>
                  <div className="space-y-2">
                    <Label htmlFor="triggerType">When this happens *</Label>
                    <Select
                      value={formData.triggerType}
                      onValueChange={(value) => setFormData({ ...formData, triggerType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {triggerTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="triggerConditions">Conditions (JSON)</Label>
                    <Textarea
                      id="triggerConditions"
                      placeholder='{"duration": ">60", "sentiment": "negative"}'
                      value={formData.triggerConditions}
                      onChange={(e) =>
                        setFormData({ ...formData, triggerConditions: e.target.value })
                      }
                      rows={3}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold text-sm">Action</h4>
                  <div className="space-y-2">
                    <Label htmlFor="actionType">Do this *</Label>
                    <Select
                      value={formData.actionType}
                      onValueChange={(value) => setFormData({ ...formData, actionType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {actionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="actionConfig">Configuration (JSON)</Label>
                    <Textarea
                      id="actionConfig"
                      placeholder='{"url": "https://api.example.com/webhook", "method": "POST"}'
                      value={formData.actionConfig}
                      onChange={(e) => setFormData({ ...formData, actionConfig: e.target.value })}
                      rows={3}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!formData.name || createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Automation"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Agent Selector */}
        {clients && clients.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Select Agent</CardTitle>
              <CardDescription>Choose an agent to manage its automations.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Agent selector will be populated once agents are created.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Automation Templates */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Popular Templates</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-5 w-5 text-accent" />
                  CRM Integration
                </CardTitle>
                <CardDescription>
                  Update your CRM with call details and outcomes automatically.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full">
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Slack Alerts
                </CardTitle>
                <CardDescription>
                  Get notified in Slack when important calls happen.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full">
                  Use Template
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-5 w-5 text-secondary" />
                  Follow-up Email
                </CardTitle>
                <CardDescription>
                  Send automated follow-up emails after calls complete.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full">
                  Use Template
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Automations List */}
        {selectedAgentId && (!automations || automations.length === 0) && (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Workflow className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No automations yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                Create your first automation to streamline workflows and integrate with other tools.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Automation
              </Button>
            </CardContent>
          </Card>
        )}

        {selectedAgentId && automations && automations.length > 0 && (
          <div className="space-y-4">
            {automations.map((automation) => (
              <Card key={automation.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Workflow className="h-5 w-5 text-primary" />
                        {automation.name}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-normal ${
                            automation.enabled
                              ? "bg-accent/10 text-accent"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {automation.enabled ? "active" : "paused"}
                        </span>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {automation.description || "No description"}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          {automation.enabled ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(automation.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Trigger</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {automation.triggerType.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Actions</h4>
                      <p className="text-sm text-muted-foreground">
                        {automation.actions ? JSON.parse(automation.actions).length + " action(s)" : "No actions"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between items-center text-xs text-muted-foreground">
                    <span>Status: {automation.enabled ? "Enabled" : "Disabled"}</span>
                    <span>Updated: {new Date(automation.updatedAt).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

