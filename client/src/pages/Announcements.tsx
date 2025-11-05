import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Plus, Edit, Trash2, Play, Upload, Volume2, Clock, FileAudio, MessageSquare } from "lucide-react";

export default function Announcements() {
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [isPlayDialogOpen, setIsPlayDialogOpen] = useState(false);
  const [playingAnnouncement, setPlayingAnnouncement] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "greeting" as "greeting" | "hold_music" | "queue_message" | "ivr" | "voicemail" | "custom",
    text: "",
    audioUrl: "",
    isActive: true,
    duration: 0,
  });

  // Fetch clients
  const { data: clients } = trpc.clients.list.useQuery();

  // Fetch announcements
  const { data: announcements, refetch: refetchAnnouncements } = trpc.announcements.list.useQuery(
    { clientId: selectedClient! },
    { enabled: !!selectedClient }
  );

  // Fetch announcement stats
  const { data: stats } = trpc.announcements.getStats.useQuery(
    { clientId: selectedClient! },
    { enabled: !!selectedClient }
  );

  // Mutations
  const createAnnouncement = trpc.announcements.create.useMutation({
    onSuccess: () => {
      refetchAnnouncements();
      setIsCreateDialogOpen(false);
      resetForm();
    },
  });

  const updateAnnouncement = trpc.announcements.update.useMutation({
    onSuccess: () => {
      refetchAnnouncements();
      setIsEditDialogOpen(false);
      setEditingAnnouncement(null);
      resetForm();
    },
  });

  const deleteAnnouncement = trpc.announcements.delete.useMutation({
    onSuccess: () => {
      refetchAnnouncements();
    },
  });

  const toggleActive = trpc.announcements.toggleActive.useMutation({
    onSuccess: () => {
      refetchAnnouncements();
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      type: "greeting",
      text: "",
      audioUrl: "",
      isActive: true,
      duration: 0,
    });
  };

  const handleCreateAnnouncement = () => {
    if (!selectedClient) return;
    createAnnouncement.mutate({
      clientId: selectedClient,
      ...formData,
    });
  };

  const handleUpdateAnnouncement = () => {
    if (!editingAnnouncement) return;
    updateAnnouncement.mutate({
      id: editingAnnouncement.id,
      ...formData,
    });
  };

  const handleEditAnnouncement = (announcement: any) => {
    setEditingAnnouncement(announcement);
    setFormData({
      name: announcement.name,
      description: announcement.description || "",
      type: announcement.type,
      text: announcement.text || "",
      audioUrl: announcement.audioUrl || "",
      isActive: announcement.isActive,
      duration: announcement.duration || 0,
    });
    setIsEditDialogOpen(true);
  };

  const handlePlayAnnouncement = (announcement: any) => {
    setPlayingAnnouncement(announcement);
    setIsPlayDialogOpen(true);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      greeting: { variant: "default", label: "Greeting" },
      hold_music: { variant: "secondary", label: "Hold Music" },
      queue_message: { variant: "outline", label: "Queue Message" },
      ivr: { variant: "destructive", label: "IVR" },
      voicemail: { variant: "default", label: "Voicemail" },
      custom: { variant: "secondary", label: "Custom" },
    };
    const config = variants[type] || variants.custom;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const announcementTypes = [
    { value: "greeting", label: "Greeting" },
    { value: "hold_music", label: "Hold Music" },
    { value: "queue_message", label: "Queue Message" },
    { value: "ivr", label: "IVR Menu" },
    { value: "voicemail", label: "Voicemail" },
    { value: "custom", label: "Custom" },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">
            Manage audio announcements, greetings, and hold music
          </p>
        </div>
      </div>

      {/* Client Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Client</CardTitle>
          <CardDescription>Choose a client to manage their announcements</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedClient?.toString()}
            onValueChange={(value) => setSelectedClient(parseInt(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients?.map((client) => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedClient && (
        <>
          {/* Statistics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
                <Volume2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalAnnouncements || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <FileAudio className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats?.activeAnnouncements || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDuration(stats?.totalDuration || 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Text-to-Speech</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.ttsAnnouncements || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Create Announcement Button */}
          <div className="flex justify-end">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Announcement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Announcement</DialogTitle>
                  <DialogDescription>
                    Create a new audio announcement or text-to-speech message
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Welcome Greeting"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Optional description"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {announcementTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="text">Text (for TTS)</Label>
                    <Textarea
                      id="text"
                      value={formData.text}
                      onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                      placeholder="Enter text to be converted to speech..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="audioUrl">Audio URL (optional)</Label>
                    <Input
                      id="audioUrl"
                      value={formData.audioUrl}
                      onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                      placeholder="https://example.com/audio.mp3"
                    />
                    <p className="text-sm text-muted-foreground">
                      Provide an audio URL or use text-to-speech
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (seconds)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="0"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAnnouncement} disabled={!formData.name}>
                    Create Announcement
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Announcements</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Announcements</CardTitle>
                  <CardDescription>Manage all audio announcements and messages</CardDescription>
                </CardHeader>
                <CardContent>
                  {announcements && announcements.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {announcements.map((announcement) => (
                          <TableRow key={announcement.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{announcement.name}</div>
                                {announcement.description && (
                                  <div className="text-sm text-muted-foreground">{announcement.description}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{getTypeBadge(announcement.type)}</TableCell>
                            <TableCell>
                              <Badge variant={announcement.isActive ? "default" : "secondary"}>
                                {announcement.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatDuration(announcement.duration || 0)}</TableCell>
                            <TableCell>
                              {announcement.audioUrl ? (
                                <Badge variant="outline">Audio File</Badge>
                              ) : announcement.text ? (
                                <Badge variant="outline">Text-to-Speech</Badge>
                              ) : (
                                <Badge variant="secondary">Not Configured</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handlePlayAnnouncement(announcement)}
                                  disabled={!announcement.audioUrl && !announcement.text}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    toggleActive.mutate({ id: announcement.id, isActive: !announcement.isActive })
                                  }
                                >
                                  <Switch checked={announcement.isActive} />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditAnnouncement(announcement)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteAnnouncement.mutate({ id: announcement.id })}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No announcements found. Create your first announcement to get started.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Active Announcements</CardTitle>
                </CardHeader>
                <CardContent>
                  {announcements && announcements.filter(a => a.isActive).length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {announcements
                          .filter(a => a.isActive)
                          .map((announcement) => (
                            <TableRow key={announcement.id}>
                              <TableCell className="font-medium">{announcement.name}</TableCell>
                              <TableCell>{getTypeBadge(announcement.type)}</TableCell>
                              <TableCell>{formatDuration(announcement.duration || 0)}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePlayAnnouncement(announcement)}
                                  >
                                    <Play className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditAnnouncement(announcement)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No active announcements
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inactive" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Inactive Announcements</CardTitle>
                </CardHeader>
                <CardContent>
                  {announcements && announcements.filter(a => !a.isActive).length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {announcements
                          .filter(a => !a.isActive)
                          .map((announcement) => (
                            <TableRow key={announcement.id}>
                              <TableCell className="font-medium">{announcement.name}</TableCell>
                              <TableCell>{getTypeBadge(announcement.type)}</TableCell>
                              <TableCell>{formatDuration(announcement.duration || 0)}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePlayAnnouncement(announcement)}
                                  >
                                    <Play className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditAnnouncement(announcement)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No inactive announcements
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Edit Dialog */}
      {editingAnnouncement && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Announcement</DialogTitle>
              <DialogDescription>Update announcement settings and content</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {announcementTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-text">Text (for TTS)</Label>
                <Textarea
                  id="edit-text"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-audioUrl">Audio URL</Label>
                <Input
                  id="edit-audioUrl"
                  value={formData.audioUrl}
                  onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration (seconds)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  min="0"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="edit-isActive">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateAnnouncement} disabled={!formData.name}>
                Update Announcement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Play Dialog */}
      {playingAnnouncement && (
        <Dialog open={isPlayDialogOpen} onOpenChange={setIsPlayDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{playingAnnouncement.name}</DialogTitle>
              <DialogDescription>
                {getTypeBadge(playingAnnouncement.type)} • Duration: {formatDuration(playingAnnouncement.duration || 0)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {playingAnnouncement.audioUrl ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Audio Playback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <audio controls className="w-full">
                      <source src={playingAnnouncement.audioUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </CardContent>
                </Card>
              ) : playingAnnouncement.text ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Text-to-Speech Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{playingAnnouncement.text}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No audio or text content available
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setIsPlayDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
