import { useState, useEffect } from "react";
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
import { Plus, BookOpen, FileText, File, Link as LinkIcon, Trash2, Upload, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function KnowledgeBase() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    sourceType: "text" as "text" | "pdf" | "csv" | "audio" | "url",
    sourceUrl: "",
  });

  const { data: agency } = trpc.agency.get.useQuery();
  const { data: clients } = trpc.clients.list.useQuery(
    { agencyId: agency?.id || 0 },
    { enabled: !!agency?.id }
  );

  // Fetch agents when client is selected
  const { data: clientAgents } = trpc.agents.listByClient.useQuery(
    { clientId: selectedClientId || 0 },
    { enabled: !!selectedClientId }
  );

  useEffect(() => {
    if (clientAgents) {
      setAgents(clientAgents);
      setSelectedAgentId(null);
    } else {
      setAgents([]);
    }
  }, [clientAgents]);

  const { data: knowledgeItems, refetch } = trpc.knowledgeBase.list.useQuery(
    { agentId: selectedAgentId || 0 },
    { enabled: !!selectedAgentId }
  );

  const createMutation = trpc.knowledgeBase.create.useMutation({
    onSuccess: () => {
      toast.success("Knowledge item added successfully");
      setCreateDialogOpen(false);
      setFormData({ title: "", content: "", sourceType: "text", sourceUrl: "" });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add knowledge item");
    },
  });

  const deleteMutation = trpc.knowledgeBase.delete.useMutation({
    onSuccess: () => {
      toast.success("Knowledge item deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete knowledge item");
    },
  });

  const handleCreate = () => {
    if (!selectedAgentId) {
      toast.error("Please select an agent first");
      return;
    }
    createMutation.mutate({
      agentId: selectedAgentId,
      ...formData,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this knowledge item?")) {
      deleteMutation.mutate({ id });
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <File className="h-5 w-5 text-red-500" />;
      case "csv":
        return <File className="h-5 w-5 text-green-500" />;
      case "audio":
        return <File className="h-5 w-5 text-purple-500" />;
      case "url":
        return <LinkIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Knowledge Base</h1>
          <p className="text-muted-foreground">
            Upload documents, URLs, and audio files to train your agents
          </p>
        </div>

        {/* Client and Agent Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Agent</CardTitle>
            <CardDescription>Choose a client and agent to manage their knowledge base</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client-select">Select a Client</Label>
                <Select value={selectedClientId?.toString() || ""} onValueChange={(value) => setSelectedClientId(parseInt(value))}>
                  <SelectTrigger id="client-select">
                    <SelectValue placeholder="Choose a client..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="agent-select">Select an Agent</Label>
                <Select value={selectedAgentId?.toString() || ""} onValueChange={(value) => setSelectedAgentId(parseInt(value))} disabled={!selectedClientId}>
                  <SelectTrigger id="agent-select">
                    <SelectValue placeholder={selectedClientId ? "Choose an agent..." : "Select a client first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.length > 0 ? (
                      agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id.toString()}>
                          {agent.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        {selectedClientId ? "No agents found" : "Select a client first"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Knowledge Item */}
        {selectedAgentId && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Add Knowledge Item</CardTitle>
                <CardDescription>Upload documents, URLs, or audio to train your agent</CardDescription>
              </div>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Knowledge Item</DialogTitle>
                    <DialogDescription>Add a new document, URL, or audio file to your knowledge base</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Company Handbook"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="source-type">Source Type</Label>
                      <Select value={formData.sourceType} onValueChange={(value) => setFormData({ ...formData, sourceType: value as any })}>
                        <SelectTrigger id="source-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                          <SelectItem value="url">URL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.sourceType === "url" ? (
                      <div className="space-y-2">
                        <Label htmlFor="url">URL</Label>
                        <Input
                          id="url"
                          placeholder="https://example.com"
                          value={formData.sourceUrl}
                          onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                          id="content"
                          placeholder="Paste your content here..."
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          rows={4}
                        />
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Adding..." : "Add Item"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
          </Card>
        )}

        {/* Knowledge Items List */}
        {selectedAgentId && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Knowledge Items</h2>
            {knowledgeItems && knowledgeItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {knowledgeItems.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getSourceIcon(item.sourceType)}
                          <div>
                            <CardTitle className="text-base">{item.title}</CardTitle>
                            <CardDescription className="text-xs capitalize">{item.sourceType}</CardDescription>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.location.href = `/knowledge-base/${item.id}`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {item.content && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No knowledge items yet</p>
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Item
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!selectedAgentId && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Select a client and agent to get started</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

