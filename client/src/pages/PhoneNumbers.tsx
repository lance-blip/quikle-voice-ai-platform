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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Plus, Phone, MoreVertical, Trash2, Settings } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PhoneNumbers() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    provider: "twilio" as "twilio" | "telnyx",
    providerSid: "",
  });

  const { data: agency } = trpc.agency.get.useQuery();
  const { data: clients } = trpc.clients.list.useQuery(
    { agencyId: agency?.id || 0 },
    { enabled: !!agency?.id }
  );

  const { data: phoneNumbers, refetch } = trpc.phoneNumbers.list.useQuery(
    { clientId: selectedClientId || 0 },
    { enabled: !!selectedClientId }
  );

  const createMutation = trpc.phoneNumbers.create.useMutation({
    onSuccess: () => {
      toast.success("Phone number added successfully");
      setCreateDialogOpen(false);
      setFormData({ phoneNumber: "", provider: "twilio", providerSid: "" });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add phone number");
    },
  });

  const handleCreate = () => {
    if (!selectedClientId) {
      toast.error("Please select a client first");
      return;
    }
    createMutation.mutate({
      clientId: selectedClientId,
      ...formData,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Phone Numbers</h1>
            <p className="text-muted-foreground mt-2">
              Manage phone numbers and connect them to your voice agents.
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedClientId}>
                <Plus className="h-4 w-4 mr-2" />
                Add Number
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Phone Number</DialogTitle>
                <DialogDescription>
                  Connect a phone number from Twilio or Telnyx to your agents.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider *</Label>
                  <Select
                    value={formData.provider}
                    onValueChange={(value: any) => setFormData({ ...formData, provider: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="telnyx">Telnyx</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="providerSid">Provider SID / ID</Label>
                  <Input
                    id="providerSid"
                    placeholder="PN1234567890abcdef"
                    value={formData.providerSid}
                    onChange={(e) => setFormData({ ...formData, providerSid: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional: The unique identifier from your provider
                  </p>
                </div>

                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <h4 className="text-sm font-semibold">Setup Instructions</h4>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Purchase a phone number from {formData.provider === "twilio" ? "Twilio" : "Telnyx"}</li>
                    <li>Configure the webhook URL in your provider dashboard</li>
                    <li>Copy the phone number and SID here</li>
                    <li>Assign the number to an agent</li>
                  </ol>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!formData.phoneNumber || createMutation.isPending}>
                  {createMutation.isPending ? "Adding..." : "Add Number"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Client Selector */}
        {clients && clients.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Select Client</CardTitle>
              <CardDescription>Choose a client to manage their phone numbers.</CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedClientId?.toString() || ""}
                onValueChange={(value) => setSelectedClientId(Number(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        {/* Phone Numbers Grid */}
        {selectedClientId && (!phoneNumbers || phoneNumbers.length === 0) && (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Phone className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No phone numbers yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                Add a phone number from Twilio or Telnyx to start receiving calls.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Number
              </Button>
            </CardContent>
          </Card>
        )}

        {selectedClientId && phoneNumbers && phoneNumbers.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {phoneNumbers.map((number) => (
              <Card key={number.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-primary" />
                        {number.phoneNumber}
                      </CardTitle>
                      <CardDescription className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="capitalize">{number.provider}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full ${
                              number.status === "active"
                                ? "bg-accent/10 text-accent"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {number.status}
                          </span>
                        </div>
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
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assigned Agent:</span>
                      <span className="font-medium">
                        {number.agentId ? "Agent #" + number.agentId : "Not assigned"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Calls:</span>
                      <span className="font-medium">0</span>
                    </div>
                    {number.providerSid && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Provider ID:</span>
                        <span className="font-mono text-xs truncate max-w-[120px]">
                          {number.providerSid}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Provider Setup Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Twilio Setup</CardTitle>
              <CardDescription>Connect your Twilio account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>1. Log in to your Twilio console</p>
              <p>2. Purchase a phone number</p>
              <p>3. Configure webhook URL:</p>
              <code className="block bg-muted p-2 rounded text-xs">
                https://your-domain.com/api/webhooks/twilio
              </code>
              <Button variant="outline" size="sm" className="w-full mt-4">
                View Documentation
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Telnyx Setup</CardTitle>
              <CardDescription>Connect your Telnyx account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>1. Log in to your Telnyx portal</p>
              <p>2. Order a phone number</p>
              <p>3. Configure webhook URL:</p>
              <code className="block bg-muted p-2 rounded text-xs">
                https://your-domain.com/api/webhooks/telnyx
              </code>
              <Button variant="outline" size="sm" className="w-full mt-4">
                View Documentation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

