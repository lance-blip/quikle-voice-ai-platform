import { useState } from "react";
import { useRoute, useLocation } from "wouter";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, FileText, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function KnowledgeBaseDetail() {
  const [, params] = useRoute("/knowledge-base/:id");
  const [, setLocation] = useLocation();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [content, setContent] = useState("");

  const knowledgeBaseId = params?.id ? parseInt(params.id) : null;

  const { data: knowledgeBase, isLoading: kbLoading } = trpc.knowledgeBase.list.useQuery(
    { agentId: 0 }, // We'll need to get the agent ID from the KB
    { enabled: false }
  );

  const { data: sources, refetch: refetchSources } = trpc.knowledgeBaseSources.list.useQuery(
    { knowledgeBaseId: knowledgeBaseId || 0 },
    { enabled: !!knowledgeBaseId }
  );

  const createSourceMutation = trpc.knowledgeBaseSources.create.useMutation({
    onSuccess: () => {
      toast.success("Source added successfully");
      setCreateDialogOpen(false);
      setContent("");
      refetchSources();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add source");
    },
  });

  const deleteSourceMutation = trpc.knowledgeBaseSources.delete.useMutation({
    onSuccess: () => {
      toast.success("Source deleted successfully");
      refetchSources();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete source");
    },
  });

  const handleCreateSource = () => {
    if (!content.trim()) {
      toast.error("Content cannot be empty");
      return;
    }
    if (!knowledgeBaseId) {
      toast.error("Invalid knowledge base ID");
      return;
    }
    createSourceMutation.mutate({
      knowledgeBaseId,
      content: content.trim(),
    });
  };

  const handleDeleteSource = (id: number) => {
    if (confirm("Are you sure you want to delete this source?")) {
      deleteSourceMutation.mutate({ id });
    }
  };

  if (!knowledgeBaseId) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Invalid knowledge base ID</p>
            <Button onClick={() => setLocation("/knowledge-base")} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Knowledge Base
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => setLocation("/knowledge-base")}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Knowledge Base #{knowledgeBaseId}</h1>
            <p className="text-muted-foreground mt-2">
              Manage content sources for this knowledge base
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Source
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Source</DialogTitle>
                <DialogDescription>
                  Paste text content to add to this knowledge base
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Paste your text content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Add raw text content that will be used to train your agent
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSource} disabled={createSourceMutation.isPending}>
                  {createSourceMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Sources List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Content Sources</h2>
          {sources && sources.length > 0 ? (
            <div className="space-y-4">
              {sources.map((source, index) => (
                <Card key={source.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-base">Source #{index + 1}</CardTitle>
                          <CardDescription className="text-xs">
                            Added {new Date(source.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSource(source.id)}
                        disabled={deleteSourceMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted rounded-md p-4">
                      <p className="text-sm font-mono whitespace-pre-wrap line-clamp-6">
                        {source.content}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No content sources yet</p>
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Source
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Sources</p>
                <p className="text-2xl font-bold">{sources?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Characters</p>
                <p className="text-2xl font-bold">
                  {sources?.reduce((acc, s) => acc + s.content.length, 0) || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-2xl font-bold">
                  {sources && sources.length > 0
                    ? new Date(sources[0].updatedAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
