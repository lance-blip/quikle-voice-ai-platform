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
import { Plus, Bot, MoreVertical, Edit, Trash2, Play, Copy } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "wouter";

export default function Agents() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    voiceProvider: "elevenlabs" as "elevenlabs" | "cartesia",
    status: "draft" as "draft" | "active" | "paused",
  });

  const { data: agency } = trpc.agency.get.useQuery();
  const { data: clients } = trpc.clients.list.useQuery(
    { agencyId: agency?.id || 0 },
    { enabled: !!agency?.id }
  );

  const { data: agents, refetch } = trpc.agents.list.useQuery(
    { clientId: selectedClientId || 0 },
    { enabled: !!selectedClientId }
  );

  const createMutation = trpc.agents.create.useMutation({
    onSuccess: () => {
      toast.success("Agent created successfully");
      setCreateDialogOpen(false);
      setFormData({ name: "", description: "", voiceProvider: "elevenlabs", status: "draft" });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create agent");
    },
  });

  const deleteMutation = trpc.agents.delete.useMutation({
    onSuccess: () => {
      toast.success("Agent deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete agent");
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

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this agent? This action cannot be undone.")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Voice Agents</h1>
            <p className="text-muted-foreground mt-2">
              Build and manage AI voice agents with the visual flow editor.
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!clients || clients.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Create Agent
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Agent</DialogTitle>
                <DialogDescription>
                  Set up a new voice agent. You can configure the conversation flow after creation.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Agent Name *</Label>
                  <Input
                    id="name"
                    placeholder="Customer Support Agent"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Handles customer inquiries and support requests..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="voiceProvider">Voice Provider</Label>
                  <Select
                    value={formData.voiceProvider}
                    onValueChange={(value: any) => setFormData({ ...formData, voiceProvider: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                      <SelectItem value="cartesia">Cartesia</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="draft">Draft</SelectItem>
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
                  {createMutation.isPending ? "Creating..." : "Create Agent"}
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
              <CardDescription>Choose a client to view and manage their agents.</CardDescription>
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

        {/* No Clients State */}
        {(!clients || clients.length === 0) && (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Bot className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No clients yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                Create a client account first before building agents.
              </p>
              <Link href="/clients">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Client
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Agents Grid */}
        {selectedClientId && (!agents || agents.length === 0) && (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Bot className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No agents yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                Create your first voice agent to start building conversations.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Agent
              </Button>
            </CardContent>
          </Card>
        )}

        {selectedClientId && agents && agents.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        {agent.name}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-normal ${
                            agent.status === "active"
                              ? "bg-accent/10 text-accent"
                              : agent.status === "paused"
                              ? "bg-secondary/10 text-secondary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {agent.status}
                        </span>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {agent.description || "No description"}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/agents/${agent.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Flow
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Play className="h-4 w-4 mr-2" />
                          Test Agent
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDelete(agent.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Voice Provider:</span>
                      <span className="font-medium capitalize">{agent.voiceProvider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Calls:</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span className="font-medium">
                        {new Date(agent.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link href={`/agents/${agent.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Flow
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
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

