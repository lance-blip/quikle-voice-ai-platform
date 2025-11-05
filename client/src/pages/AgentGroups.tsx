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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Plus, Edit, Trash2, Users, UserCheck, UserX, Clock, Activity, Circle } from "lucide-react";

export default function AgentGroups() {
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [isCreateGroupDialogOpen, setIsCreateGroupDialogOpen] = useState(false);
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);

  // Form state
  const [groupFormData, setGroupFormData] = useState({
    name: "",
    description: "",
    maxConcurrentCalls: 5,
    skillLevel: "intermediate" as "beginner" | "intermediate" | "advanced",
  });

  // Fetch clients
  const { data: clients } = trpc.clients.list.useQuery();

  // Fetch agent groups
  const { data: groups, refetch: refetchGroups } = trpc.agentGroups.list.useQuery(
    { clientId: selectedClient! },
    { enabled: !!selectedClient }
  );

  // Fetch agents
  const { data: agents, refetch: refetchAgents } = trpc.agents.list.useQuery(
    { clientId: selectedClient! },
    { enabled: !!selectedClient }
  );

  // Fetch agent statuses
  const { data: agentStatuses } = trpc.agentGroups.getAgentStatuses.useQuery(
    { clientId: selectedClient! },
    { enabled: !!selectedClient }
  );

  // Fetch group stats
  const { data: groupStats } = trpc.agentGroups.getGroupStats.useQuery(
    { clientId: selectedClient! },
    { enabled: !!selectedClient }
  );

  // Mutations
  const createGroup = trpc.agentGroups.create.useMutation({
    onSuccess: () => {
      refetchGroups();
      setIsCreateGroupDialogOpen(false);
      resetGroupForm();
    },
  });

  const updateGroup = trpc.agentGroups.update.useMutation({
    onSuccess: () => {
      refetchGroups();
      setIsEditGroupDialogOpen(false);
      setEditingGroup(null);
      resetGroupForm();
    },
  });

  const deleteGroup = trpc.agentGroups.delete.useMutation({
    onSuccess: () => {
      refetchGroups();
    },
  });

  const updateAgentStatus = trpc.agentGroups.updateAgentStatus.useMutation({
    onSuccess: () => {
      refetchAgents();
    },
  });

  const assignAgentToGroup = trpc.agentGroups.assignAgent.useMutation({
    onSuccess: () => {
      refetchAgents();
      refetchGroups();
    },
  });

  const resetGroupForm = () => {
    setGroupFormData({
      name: "",
      description: "",
      maxConcurrentCalls: 5,
      skillLevel: "intermediate",
    });
  };

  const handleCreateGroup = () => {
    if (!selectedClient) return;
    createGroup.mutate({
      clientId: selectedClient,
      ...groupFormData,
    });
  };

  const handleUpdateGroup = () => {
    if (!editingGroup) return;
    updateGroup.mutate({
      id: editingGroup.id,
      ...groupFormData,
    });
  };

  const handleEditGroup = (group: any) => {
    setEditingGroup(group);
    setGroupFormData({
      name: group.name,
      description: group.description || "",
      maxConcurrentCalls: group.maxConcurrentCalls || 5,
      skillLevel: group.skillLevel || "intermediate",
    });
    setIsEditGroupDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      available: { variant: "default", icon: UserCheck, label: "Available" },
      busy: { variant: "destructive", icon: Activity, label: "Busy" },
      away: { variant: "secondary", icon: Clock, label: "Away" },
      offline: { variant: "outline", icon: UserX, label: "Offline" },
    };
    const config = variants[status] || variants.offline;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getSkillLevelBadge = (level: string) => {
    const variants: Record<string, string> = {
      beginner: "secondary",
      intermediate: "default",
      advanced: "destructive",
    };
    return <Badge variant={variants[level] as any}>{level}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Groups & Status</h1>
          <p className="text-muted-foreground">
            Manage agent groups, assignments, and real-time status
          </p>
        </div>
      </div>

      {/* Client Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Client</CardTitle>
          <CardDescription>Choose a client to manage their agent groups</CardDescription>
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
                <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{groupStats?.totalGroups || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Agents</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{groupStats?.availableAgents || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Busy Agents</CardTitle>
                <Activity className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{groupStats?.busyAgents || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Offline Agents</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{groupStats?.offlineAgents || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="groups" className="space-y-4">
            <TabsList>
              <TabsTrigger value="groups">Agent Groups</TabsTrigger>
              <TabsTrigger value="status">Agent Status</TabsTrigger>
            </TabsList>

            {/* Agent Groups Tab */}
            <TabsContent value="groups" className="space-y-4">
              <div className="flex justify-end">
                <Dialog open={isCreateGroupDialogOpen} onOpenChange={setIsCreateGroupDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetGroupForm}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Agent Group
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Agent Group</DialogTitle>
                      <DialogDescription>
                        Define a new agent group with specific skills and capacity
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Group Name</Label>
                        <Input
                          id="name"
                          value={groupFormData.name}
                          onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                          placeholder="e.g., Sales Team"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={groupFormData.description}
                          onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                          placeholder="Optional description"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxCalls">Max Concurrent Calls</Label>
                        <Input
                          id="maxCalls"
                          type="number"
                          min="1"
                          max="20"
                          value={groupFormData.maxConcurrentCalls}
                          onChange={(e) =>
                            setGroupFormData({ ...groupFormData, maxConcurrentCalls: parseInt(e.target.value) })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="skillLevel">Skill Level</Label>
                        <Select
                          value={groupFormData.skillLevel}
                          onValueChange={(value: any) => setGroupFormData({ ...groupFormData, skillLevel: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateGroupDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateGroup} disabled={!groupFormData.name}>
                        Create Group
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Agent Groups</CardTitle>
                  <CardDescription>Organize agents into groups for efficient call distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  {groups && groups.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Skill Level</TableHead>
                          <TableHead>Max Concurrent Calls</TableHead>
                          <TableHead>Agents</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groups.map((group) => (
                          <TableRow key={group.id}>
                            <TableCell className="font-medium">{group.name}</TableCell>
                            <TableCell className="text-muted-foreground">{group.description || "—"}</TableCell>
                            <TableCell>{getSkillLevelBadge(group.skillLevel || "intermediate")}</TableCell>
                            <TableCell>{group.maxConcurrentCalls || 5}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {agents?.filter((a) => a.groupId === group.id).length || 0} agents
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleEditGroup(group)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteGroup.mutate({ id: group.id })}
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
                      No agent groups configured. Create your first group to get started.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Agent Status Tab */}
            <TabsContent value="status" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Status Dashboard</CardTitle>
                  <CardDescription>Monitor and update agent availability in real-time</CardDescription>
                </CardHeader>
                <CardContent>
                  {agents && agents.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Agent</TableHead>
                          <TableHead>Group</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Current Calls</TableHead>
                          <TableHead>Last Activity</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {agents.map((agent) => {
                          const status = agentStatuses?.find((s) => s.agentId === agent.id);
                          const group = groups?.find((g) => g.id === agent.groupId);
                          return (
                            <TableRow key={agent.id}>
                              <TableCell className="font-medium">{agent.name}</TableCell>
                              <TableCell>{group ? group.name : <span className="text-muted-foreground">Unassigned</span>}</TableCell>
                              <TableCell>{getStatusBadge(status?.status || "offline")}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{status?.currentCalls || 0}</Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {status?.lastActivity ? new Date(status.lastActivity).toLocaleString() : "—"}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Select
                                    value={status?.status || "offline"}
                                    onValueChange={(value) =>
                                      updateAgentStatus.mutate({ agentId: agent.id, status: value })
                                    }
                                  >
                                    <SelectTrigger className="w-[140px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="available">Available</SelectItem>
                                      <SelectItem value="busy">Busy</SelectItem>
                                      <SelectItem value="away">Away</SelectItem>
                                      <SelectItem value="offline">Offline</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Select
                                    value={agent.groupId?.toString() || "none"}
                                    onValueChange={(value) =>
                                      assignAgentToGroup.mutate({
                                        agentId: agent.id,
                                        groupId: value === "none" ? null : parseInt(value),
                                      })
                                    }
                                  >
                                    <SelectTrigger className="w-[140px]">
                                      <SelectValue placeholder="Assign group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">No Group</SelectItem>
                                      {groups?.map((group) => (
                                        <SelectItem key={group.id} value={group.id.toString()}>
                                          {group.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No agents found. Create agents first to manage their status.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Edit Group Dialog */}
      {editingGroup && (
        <Dialog open={isEditGroupDialogOpen} onOpenChange={setIsEditGroupDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Agent Group</DialogTitle>
              <DialogDescription>Update group settings and configuration</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Group Name</Label>
                <Input
                  id="edit-name"
                  value={groupFormData.name}
                  onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={groupFormData.description}
                  onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxCalls">Max Concurrent Calls</Label>
                <Input
                  id="edit-maxCalls"
                  type="number"
                  min="1"
                  max="20"
                  value={groupFormData.maxConcurrentCalls}
                  onChange={(e) =>
                    setGroupFormData({ ...groupFormData, maxConcurrentCalls: parseInt(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-skillLevel">Skill Level</Label>
                <Select
                  value={groupFormData.skillLevel}
                  onValueChange={(value: any) => setGroupFormData({ ...groupFormData, skillLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditGroupDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateGroup} disabled={!groupFormData.name}>
                Update Group
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
