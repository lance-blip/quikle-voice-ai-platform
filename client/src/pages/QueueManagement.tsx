import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Plus, Edit, Trash2, Users, Clock, Phone, TrendingUp } from "lucide-react";

export default function QueueManagement() {
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<any>(null);

  // Fetch clients
  const { data: clients } = trpc.clients.list.useQuery();

  // Fetch queues for selected client
  const { data: queues, refetch: refetchQueues } = trpc.queue.list.useQuery(
    { clientId: selectedClient! },
    { enabled: !!selectedClient }
  );

  // Fetch queue stats
  const { data: queueStats } = trpc.queue.getStats.useQuery(
    { queueId: selectedQueue?.id },
    { enabled: !!selectedQueue }
  );

  // Fetch queue entries
  const { data: queueEntries } = trpc.queue.getEntries.useQuery(
    { queueId: selectedQueue?.id },
    { enabled: !!selectedQueue }
  );

  // Mutations
  const createQueue = trpc.queue.create.useMutation({
    onSuccess: () => {
      refetchQueues();
      setIsCreateDialogOpen(false);
    },
  });

  const updateQueue = trpc.queue.update.useMutation({
    onSuccess: () => {
      refetchQueues();
      setIsEditDialogOpen(false);
    },
  });

  const deleteQueue = trpc.queue.delete.useMutation({
    onSuccess: () => {
      refetchQueues();
      setSelectedQueue(null);
    },
  });

  const handleCreateQueue = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createQueue.mutate({
      clientId: selectedClient!,
      name: formData.get("name") as string,
      maxWaitTime: parseInt(formData.get("maxWaitTime") as string),
      maxQueueSize: parseInt(formData.get("maxQueueSize") as string),
      overflowAction: formData.get("overflowAction") as "voicemail" | "transfer" | "hangup",
      overflowDestination: formData.get("overflowDestination") as string || undefined,
    });
  };

  const handleUpdateQueue = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    updateQueue.mutate({
      id: selectedQueue.id,
      name: formData.get("name") as string,
      maxWaitTime: parseInt(formData.get("maxWaitTime") as string),
      maxQueueSize: parseInt(formData.get("maxQueueSize") as string),
      overflowAction: formData.get("overflowAction") as "voicemail" | "transfer" | "hangup",
      overflowDestination: formData.get("overflowDestination") as string || undefined,
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Queue Management</h1>
          <p className="text-muted-foreground">
            Manage call queues, monitor wait times, and optimize call routing
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={!selectedClient}>
              <Plus className="mr-2 h-4 w-4" />
              Create Queue
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateQueue}>
              <DialogHeader>
                <DialogTitle>Create New Queue</DialogTitle>
                <DialogDescription>
                  Configure a new call queue for your client
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Queue Name</Label>
                  <Input id="name" name="name" placeholder="Support Queue" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxWaitTime">Max Wait Time (seconds)</Label>
                  <Input id="maxWaitTime" name="maxWaitTime" type="number" defaultValue="300" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxQueueSize">Max Queue Size</Label>
                  <Input id="maxQueueSize" name="maxQueueSize" type="number" defaultValue="50" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overflowAction">Overflow Action</Label>
                  <Select name="overflowAction" defaultValue="voicemail">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voicemail">Send to Voicemail</SelectItem>
                      <SelectItem value="transfer">Transfer Call</SelectItem>
                      <SelectItem value="hangup">Hangup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overflowDestination">Overflow Destination (optional)</Label>
                  <Input id="overflowDestination" name="overflowDestination" placeholder="+1234567890" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Queue</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Client Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Client</CardTitle>
          <CardDescription>Choose a client to manage their queues</CardDescription>
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
        <Tabs defaultValue="queues" className="space-y-4">
          <TabsList>
            <TabsTrigger value="queues">Queues</TabsTrigger>
            <TabsTrigger value="live">Live View</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="queues" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Call Queues</CardTitle>
                <CardDescription>Manage your call queues and settings</CardDescription>
              </CardHeader>
              <CardContent>
                {queues && queues.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Max Wait Time</TableHead>
                        <TableHead>Max Size</TableHead>
                        <TableHead>Overflow Action</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queues.map((queue) => (
                        <TableRow key={queue.id}>
                          <TableCell className="font-medium">{queue.name}</TableCell>
                          <TableCell>{queue.maxWaitTime}s</TableCell>
                          <TableCell>{queue.maxQueueSize}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{queue.overflowAction}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">Active</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedQueue(queue);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteQueue.mutate({ id: queue.id })}
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
                    No queues found. Create your first queue to get started.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="live" className="space-y-4">
            {selectedQueue ? (
              <>
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Calls in Queue</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{queueStats?.callsInQueue || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{queueStats?.avgWaitTime || 0}s</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Longest Wait</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{queueStats?.longestWait || 0}s</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Abandoned</CardTitle>
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{queueStats?.abandonedCalls || 0}</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Calls in Queue</CardTitle>
                    <CardDescription>Real-time view of waiting calls</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {queueEntries && queueEntries.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Position</TableHead>
                            <TableHead>Caller</TableHead>
                            <TableHead>Wait Time</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {queueEntries.map((entry, index) => (
                            <TableRow key={entry.id}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{entry.callerId || "Unknown"}</TableCell>
                              <TableCell>{Math.floor((Date.now() - new Date(entry.enteredAt).getTime()) / 1000)}s</TableCell>
                              <TableCell>
                                <Badge variant={entry.priority === 1 ? "default" : "secondary"}>
                                  {entry.priority === 1 ? "High" : "Normal"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{entry.status}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No calls currently in queue
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-muted-foreground">
                    Select a queue to view live statistics
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Queue Statistics</CardTitle>
                <CardDescription>Historical performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Historical statistics coming soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Edit Dialog */}
      {selectedQueue && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <form onSubmit={handleUpdateQueue}>
              <DialogHeader>
                <DialogTitle>Edit Queue</DialogTitle>
                <DialogDescription>Update queue settings</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Queue Name</Label>
                  <Input id="edit-name" name="name" defaultValue={selectedQueue.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-maxWaitTime">Max Wait Time (seconds)</Label>
                  <Input id="edit-maxWaitTime" name="maxWaitTime" type="number" defaultValue={selectedQueue.maxWaitTime} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-maxQueueSize">Max Queue Size</Label>
                  <Input id="edit-maxQueueSize" name="maxQueueSize" type="number" defaultValue={selectedQueue.maxQueueSize} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-overflowAction">Overflow Action</Label>
                  <Select name="overflowAction" defaultValue={selectedQueue.overflowAction}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voicemail">Send to Voicemail</SelectItem>
                      <SelectItem value="transfer">Transfer Call</SelectItem>
                      <SelectItem value="hangup">Hangup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-overflowDestination">Overflow Destination (optional)</Label>
                  <Input id="edit-overflowDestination" name="overflowDestination" defaultValue={selectedQueue.overflowDestination || ""} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
