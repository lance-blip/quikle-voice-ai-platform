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
import { Plus, BookOpen, FileText, File, Link as LinkIcon, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

export default function KnowledgeBase() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
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

  // Get all agents from all clients
  const allAgents = clients?.flatMap((client) => 
    client.id ? [] : [] // Will be populated when we fetch agents per client
  ) || [];

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Knowledge Base</h1>
            <p className="text-muted-foreground mt-2">
              Upload documents, audio, and URLs to give your agents context and expertise.
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedAgentId}>
                <Plus className="h-4 w-4 mr-2" />
                Add Knowledge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Knowledge Source</DialogTitle>
                <DialogDescription>
                  Upload content that your agent can reference during conversations.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="sourceType">Source Type *</Label>
                  <Select
                    value={formData.sourceType}
                    onValueChange={(value: any) => setFormData({ ...formData, sourceType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text / Paste Content</SelectItem>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="csv">CSV / Spreadsheet</SelectItem>
                      <SelectItem value="audio">Audio File</SelectItem>
                      <SelectItem value="url">Website URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Product Documentation"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                {formData.sourceType === "url" && (
                  <div className="space-y-2">
                    <Label htmlFor="sourceUrl">URL *</Label>
                    <Input
                      id="sourceUrl"
                      type="url"
                      placeholder="https://example.com/docs"
                      value={formData.sourceUrl}
                      onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                    />
                  </div>
                )}

                {formData.sourceType === "text" && (
                  <div className="space-y-2">
                    <Label htmlFor="content">Content *</Label>
                    <Textarea
                      id="content"
                      placeholder="Paste your content here..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={10}
                    />
                  </div>
                )}

                {["pdf", "csv", "audio"].includes(formData.sourceType) && (
                  <div className="space-y-2">
                    <Label>Upload File</Label>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Drag and drop your file here, or click to browse
                      </p>
                      <Button variant="outline" size="sm">
                        Choose File
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Max file size: 16MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!formData.title || createMutation.isPending}>
                  {createMutation.isPending ? "Adding..." : "Add Knowledge"}
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
              <CardDescription>Choose an agent to manage its knowledge base.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Agent selector will be populated once agents are created.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Knowledge Items Grid */}
        {selectedAgentId && (!knowledgeItems || knowledgeItems.length === 0) && (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No knowledge sources yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                Add documents, audio files, or URLs to give your agent context.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Source
              </Button>
            </CardContent>
          </Card>
        )}

        {selectedAgentId && knowledgeItems && knowledgeItems.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {knowledgeItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getSourceIcon(item.sourceType)}
                      <div className="flex-1">
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <CardDescription className="mt-1">
                          <span className="capitalize">{item.sourceType}</span>
                          {item.sourceUrl && (
                            <span className="block text-xs truncate mt-1">{item.sourceUrl}</span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p className="line-clamp-3">
                      {item.content || "No preview available"}
                    </p>
                    <p className="text-xs mt-2">
                      Added {new Date(item.createdAt).toLocaleDateString()}
                    </p>
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

