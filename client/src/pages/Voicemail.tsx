import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Play, Trash2, Mail, MailOpen, Download, Phone, Clock, MessageSquare } from "lucide-react";

export default function Voicemail() {
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [selectedVoicemail, setSelectedVoicemail] = useState<any>(null);
  const [isPlayDialogOpen, setIsPlayDialogOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  // Fetch clients
  const { data: clients } = trpc.clients.list.useQuery();

  // Fetch voicemails
  const { data: voicemails, refetch: refetchVoicemails } = trpc.voicemail.list.useQuery(
    { clientId: selectedClient! },
    { enabled: !!selectedClient }
  );

  // Fetch voicemail stats
  const { data: stats } = trpc.voicemail.getStats.useQuery(
    { clientId: selectedClient! },
    { enabled: !!selectedClient }
  );

  // Mutations
  const markAsRead = trpc.voicemail.markAsRead.useMutation({
    onSuccess: () => {
      refetchVoicemails();
    },
  });

  const markAsUnread = trpc.voicemail.markAsUnread.useMutation({
    onSuccess: () => {
      refetchVoicemails();
    },
  });

  const deleteVoicemail = trpc.voicemail.delete.useMutation({
    onSuccess: () => {
      refetchVoicemails();
      setIsPlayDialogOpen(false);
    },
  });

  const handlePlayVoicemail = (voicemail: any) => {
    setSelectedVoicemail(voicemail);
    setIsPlayDialogOpen(true);
    if (!voicemail.isRead) {
      markAsRead.mutate({ id: voicemail.id });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredVoicemails = voicemails?.filter((vm) => {
    if (filter === "unread") return !vm.isRead;
    if (filter === "read") return vm.isRead;
    return true;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Voicemail</h1>
          <p className="text-muted-foreground">
            Manage voicemail messages and transcriptions
          </p>
        </div>
      </div>

      {/* Client Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Client</CardTitle>
          <CardDescription>Choose a client to view their voicemails</CardDescription>
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
                <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalVoicemails || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unread</CardTitle>
                <MailOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.unreadVoicemails || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatDuration(stats?.avgDuration || 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today</CardTitle>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.todayVoicemails || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all" onValueChange={(value) => setFilter(value as any)} className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All Messages</TabsTrigger>
                <TabsTrigger value="unread">Unread ({stats?.unreadVoicemails || 0})</TabsTrigger>
                <TabsTrigger value="read">Read</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={filter} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Voicemail Messages</CardTitle>
                  <CardDescription>Click on a message to play and view transcription</CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredVoicemails && filteredVoicemails.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead>From</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Transcription Preview</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredVoicemails.map((voicemail) => (
                          <TableRow 
                            key={voicemail.id}
                            className={!voicemail.isRead ? "font-semibold bg-muted/50" : ""}
                          >
                            <TableCell>
                              {voicemail.isRead ? (
                                <MailOpen className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Mail className="h-4 w-4 text-primary" />
                              )}
                            </TableCell>
                            <TableCell>{voicemail.callerId || "Unknown"}</TableCell>
                            <TableCell>{formatDate(voicemail.createdAt)}</TableCell>
                            <TableCell>{formatDuration(voicemail.duration)}</TableCell>
                            <TableCell className="max-w-md truncate">
                              {voicemail.transcription ? (
                                <span className="flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4" />
                                  {voicemail.transcription.substring(0, 50)}...
                                </span>
                              ) : (
                                <span className="text-muted-foreground">No transcription</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handlePlayVoicemail(voicemail)}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (voicemail.isRead) {
                                      markAsUnread.mutate({ id: voicemail.id });
                                    } else {
                                      markAsRead.mutate({ id: voicemail.id });
                                    }
                                  }}
                                >
                                  {voicemail.isRead ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteVoicemail.mutate({ id: voicemail.id })}
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
                      {filter === "unread" ? "No unread voicemails" : filter === "read" ? "No read voicemails" : "No voicemails found"}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Play Voicemail Dialog */}
      {selectedVoicemail && (
        <Dialog open={isPlayDialogOpen} onOpenChange={setIsPlayDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Voicemail from {selectedVoicemail.callerId || "Unknown"}</DialogTitle>
              <DialogDescription>
                Received on {formatDate(selectedVoicemail.createdAt)} • Duration: {formatDuration(selectedVoicemail.duration)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Audio Player */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Audio Recording</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedVoicemail.audioUrl ? (
                    <audio controls className="w-full">
                      <source src={selectedVoicemail.audioUrl} type="audio/wav" />
                      Your browser does not support the audio element.
                    </audio>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Audio not available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Transcription */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Transcription</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedVoicemail.transcription ? (
                    <p className="text-sm whitespace-pre-wrap">{selectedVoicemail.transcription}</p>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No transcription available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Download audio
                    if (selectedVoicemail.audioUrl) {
                      window.open(selectedVoicemail.audioUrl, '_blank');
                    }
                  }}
                  disabled={!selectedVoicemail.audioUrl}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteVoicemail.mutate({ id: selectedVoicemail.id })}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <Button onClick={() => setIsPlayDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
