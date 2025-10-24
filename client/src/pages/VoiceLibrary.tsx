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
import { Slider } from "@/components/ui/slider";
import { trpc } from "@/lib/trpc";
import { Plus, Mic, Play, Upload, Trash2, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function VoiceLibrary() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    provider: "elevenlabs" as "elevenlabs" | "cartesia",
    voiceId: "",
    sampleUrl: "",
    pitch: 1.0,
    speed: 1.0,
    stability: 0.5,
  });

  const { data: agency } = trpc.agency.get.useQuery();
  const { data: voices, refetch } = trpc.voiceClones.list.useQuery(
    { agencyId: agency?.id || 0 },
    { enabled: !!agency?.id }
  );

  const createMutation = trpc.voiceClones.create.useMutation({
    onSuccess: () => {
      toast.success("Voice added successfully");
      setCreateDialogOpen(false);
      setFormData({
        name: "",
        provider: "elevenlabs",
        voiceId: "",
        sampleUrl: "",
        pitch: 1.0,
        speed: 1.0,
        stability: 0.5,
      });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add voice");
    },
  });

  const handleCreate = () => {
    if (!agency?.id) {
      toast.error("Agency not found");
      return;
    }
    createMutation.mutate({
      agencyId: agency.id,
      name: formData.name,
      provider: formData.provider,
      providerVoiceId: formData.voiceId || `voice_${Date.now()}`,
      sampleUrl: formData.sampleUrl || undefined,
      metadata: JSON.stringify({ pitch: formData.pitch, speed: formData.speed, stability: formData.stability }),
    });
  };



  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Voice Library</h1>
            <p className="text-muted-foreground mt-2">
              Clone voices and manage TTS settings for your agents.
            </p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Voice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Voice</DialogTitle>
                <DialogDescription>
                  Clone a voice or add a pre-existing voice from your provider.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Voice Provider *</Label>
                  <Select
                    value={formData.provider}
                    onValueChange={(value: any) => setFormData({ ...formData, provider: value })}
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
                  <Label htmlFor="name">Voice Name *</Label>
                  <Input
                    id="name"
                    placeholder="Professional Female Voice"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voiceId">Voice ID (Optional)</Label>
                  <Input
                    id="voiceId"
                    placeholder="voice_abc123xyz"
                    value={formData.voiceId}
                    onChange={(e) => setFormData({ ...formData, voiceId: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    If you already have a voice ID from your provider, enter it here.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Upload Voice Sample (1-2 minutes)</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop an audio file here, or click to browse
                    </p>
                    <Button variant="outline" size="sm">
                      Choose File
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supported formats: MP3, WAV, M4A (Max 16MB)
                    </p>
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold text-sm">Voice Settings</h4>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="pitch">Pitch</Label>
                      <span className="text-sm text-muted-foreground">{formData.pitch.toFixed(1)}x</span>
                    </div>
                    <Slider
                      id="pitch"
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      value={[formData.pitch]}
                      onValueChange={([value]) => setFormData({ ...formData, pitch: value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="speed">Speed</Label>
                      <span className="text-sm text-muted-foreground">{formData.speed.toFixed(1)}x</span>
                    </div>
                    <Slider
                      id="speed"
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      value={[formData.speed]}
                      onValueChange={([value]) => setFormData({ ...formData, speed: value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="stability">Stability</Label>
                      <span className="text-sm text-muted-foreground">
                        {(formData.stability * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Slider
                      id="stability"
                      min={0}
                      max={1}
                      step={0.05}
                      value={[formData.stability]}
                      onValueChange={([value]) => setFormData({ ...formData, stability: value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Higher stability = more consistent, Lower = more expressive
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!formData.name || createMutation.isPending}>
                  {createMutation.isPending ? "Adding..." : "Add Voice"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Provider Info Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ElevenLabs</CardTitle>
              <CardDescription>High-quality voice cloning and synthesis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Ultra-realistic voice cloning</p>
              <p>• 29+ languages supported</p>
              <p>• Sub-800ms latency</p>
              <p>• Emotion and tone control</p>
              <Button variant="outline" size="sm" className="w-full mt-4">
                Connect ElevenLabs
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cartesia</CardTitle>
              <CardDescription>Lightning-fast conversational AI voices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Optimized for real-time conversations</p>
              <p>• Ultra-low latency (&lt;300ms)</p>
              <p>• Natural prosody and intonation</p>
              <p>• Streaming audio support</p>
              <Button variant="outline" size="sm" className="w-full mt-4">
                Connect Cartesia
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Voice Library Grid */}
        {!voices || voices.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Mic className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No voices yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                Add your first voice to start building natural-sounding agents.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Voice
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {voices.map((voice) => (
              <Card key={voice.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Mic className="h-5 w-5 text-primary" />
                        {voice.name}
                      </CardTitle>
                      <CardDescription className="mt-2 capitalize">
                        {voice.provider}
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
                          <Play className="h-4 w-4 mr-2" />
                          Test Voice
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {voice.sampleUrl && (
                      <div>
                        <audio controls className="w-full h-8">
                          <source src={voice.sampleUrl} type="audio/mpeg" />
                        </audio>
                      </div>
                    )}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Voice ID:</span>
                        <span className="font-mono text-xs truncate max-w-[120px]">{voice.providerVoiceId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium capitalize">{voice.status}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Test Voice
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

