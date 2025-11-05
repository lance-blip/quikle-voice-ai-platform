import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Play, Download, Trash2, Search, Phone, Clock, User, Calendar, Mic, FileAudio } from "lucide-react";

export default function CallRecording() {
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [selectedRecording, setSelectedRecording] = useState<any>(null);
  const [isPlayDialogOpen, setIsPlayDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");

  // Fetch clients
  const { data: clients } = trpc.clients.list.useQuery();

  // Fetch recordings
  const { data: recordings, refetch: refetchRecordings } = trpc.recording.list.useQuery(
    { 
      clientId: selectedClient!,
      search: searchTerm || undefined,
      dateRange: dateFilter !== "all" ? dateFilter : undefined,
    },
    { enabled: !!selectedClient }
  );

  // Fetch recording stats
  const { data: stats } = trpc.recording.getStats.useQuery(
    { clientId: selectedClient! },
    { enabled: !!selectedClient }
  );

  // Mutations
  const deleteRecording = trpc.recording.delete.useMutation({
    onSuccess: () => {
      refetchRecordings();
      setIsPlayDialogOpen(false);
    },
  });

  const bulkDelete = trpc.recording.bulkDelete.useMutation({
    onSuccess: () => {
      refetchRecordings();
    },
  });

  const handlePlayRecording = (recording: any) => {
    setSelectedRecording(recording);
    setIsPlayDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getCallDirectionBadge = (direction: string) => {
    return direction === "inbound" ? (
      <Badge variant="default">Inbound</Badge>
    ) : (
      <Badge variant="secondary">Outbound</Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Call Recordings</h1>
          <p className="text-muted-foreground">
            Access and manage call recordings with transcriptions
          </p>
        </div>
      </div>

      {/* Client Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Client</CardTitle>
          <CardDescription>Choose a client to view their call recordings</CardDescription>
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
                <CardTitle className="text-sm font-medium">Total Recordings</CardTitle>
                <FileAudio className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalRecordings || 0}</div>
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
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                <Mic className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatFileSize(stats?.totalSize || 0)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.todayRecordings || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by caller, agent, or call ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This week</SelectItem>
                    <SelectItem value="month">This month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Recordings</TabsTrigger>
              <TabsTrigger value="inbound">Inbound</TabsTrigger>
              <TabsTrigger value="outbound">Outbound</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Call Recordings</CardTitle>
                  <CardDescription>Click on a recording to play and view details</CardDescription>
                </CardHeader>
                <CardContent>
                  {recordings && recordings.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Direction</TableHead>
                          <TableHead>Caller</TableHead>
                          <TableHead>Agent</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recordings.map((recording) => (
                          <TableRow key={recording.id}>
                            <TableCell>{formatDate(recording.createdAt)}</TableCell>
                            <TableCell>{getCallDirectionBadge(recording.direction)}</TableCell>
                            <TableCell>{recording.callerId || "Unknown"}</TableCell>
                            <TableCell>
                              {recording.agentName || <span className="text-muted-foreground">N/A</span>}
                            </TableCell>
                            <TableCell>{formatDuration(recording.duration)}</TableCell>
                            <TableCell>{formatFileSize(recording.fileSize || 0)}</TableCell>
                            <TableCell>
                              {recording.transcription ? (
                                <Badge variant="outline">Transcribed</Badge>
                              ) : (
                                <Badge variant="secondary">Audio Only</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handlePlayRecording(recording)}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (recording.audioUrl) {
                                      window.open(recording.audioUrl, '_blank');
                                    }
                                  }}
                                  disabled={!recording.audioUrl}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteRecording.mutate({ id: recording.id })}
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
                      No recordings found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inbound" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Inbound Call Recordings</CardTitle>
                </CardHeader>
                <CardContent>
                  {recordings && recordings.filter(r => r.direction === "inbound").length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Caller</TableHead>
                          <TableHead>Agent</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recordings
                          .filter(r => r.direction === "inbound")
                          .map((recording) => (
                            <TableRow key={recording.id}>
                              <TableCell>{formatDate(recording.createdAt)}</TableCell>
                              <TableCell>{recording.callerId || "Unknown"}</TableCell>
                              <TableCell>{recording.agentName || "N/A"}</TableCell>
                              <TableCell>{formatDuration(recording.duration)}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePlayRecording(recording)}
                                  >
                                    <Play className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(recording.audioUrl, '_blank')}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No inbound recordings found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="outbound" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Outbound Call Recordings</CardTitle>
                </CardHeader>
                <CardContent>
                  {recordings && recordings.filter(r => r.direction === "outbound").length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Called Number</TableHead>
                          <TableHead>Agent</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recordings
                          .filter(r => r.direction === "outbound")
                          .map((recording) => (
                            <TableRow key={recording.id}>
                              <TableCell>{formatDate(recording.createdAt)}</TableCell>
                              <TableCell>{recording.callerId || "Unknown"}</TableCell>
                              <TableCell>{recording.agentName || "N/A"}</TableCell>
                              <TableCell>{formatDuration(recording.duration)}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePlayRecording(recording)}
                                  >
                                    <Play className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(recording.audioUrl, '_blank')}
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No outbound recordings found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Play Recording Dialog */}
      {selectedRecording && (
        <Dialog open={isPlayDialogOpen} onOpenChange={setIsPlayDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Call Recording Details</DialogTitle>
              <DialogDescription>
                {formatDate(selectedRecording.createdAt)} • Duration: {formatDuration(selectedRecording.duration)}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Call Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Call Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Direction</Label>
                      <div className="mt-1">{getCallDirectionBadge(selectedRecording.direction)}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Caller ID</Label>
                      <div className="mt-1">{selectedRecording.callerId || "Unknown"}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Agent</Label>
                      <div className="mt-1">{selectedRecording.agentName || "N/A"}</div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">File Size</Label>
                      <div className="mt-1">{formatFileSize(selectedRecording.fileSize || 0)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Audio Player */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Audio Recording</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedRecording.audioUrl ? (
                    <audio controls className="w-full">
                      <source src={selectedRecording.audioUrl} type="audio/wav" />
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
              {selectedRecording.transcription && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Transcription</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{selectedRecording.transcription}</p>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (selectedRecording.audioUrl) {
                      window.open(selectedRecording.audioUrl, '_blank');
                    }
                  }}
                  disabled={!selectedRecording.audioUrl}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteRecording.mutate({ id: selectedRecording.id })}
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
