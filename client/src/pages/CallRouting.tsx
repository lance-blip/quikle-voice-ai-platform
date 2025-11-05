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
import { Switch } from "../components/ui/switch";
import { Plus, Edit, Trash2, GitBranch, Clock, Phone, Users, ArrowRight } from "lucide-react";

export default function CallRouting() {
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priority: 1,
    isActive: true,
    conditions: {
      timeRanges: [] as any[],
      callerIdPatterns: [] as string[],
      didNumbers: [] as string[],
      dayOfWeek: [] as number[],
    },
    actions: {
      routeToAgent: null as number | null,
      routeToQueue: null as number | null,
      routeToVoicemail: false,
      playAnnouncement: null as number | null,
      transferToNumber: null as string | null,
    },
  });

  // Fetch clients
  const { data: clients } = trpc.clients.list.useQuery();

  // Fetch routing rules
  const { data: rules, refetch: refetchRules } = trpc.routing.list.useQuery(
    { clientId: selectedClient! },
    { enabled: !!selectedClient }
  );

  // Fetch agents for routing options
  const { data: agents } = trpc.agents.list.useQuery(
    { clientId: selectedClient! },
    { enabled: !!selectedClient }
  );

  // Fetch queues for routing options
  const { data: queues } = trpc.queues.list.useQuery(
    { clientId: selectedClient! },
    { enabled: !!selectedClient }
  );

  // Mutations
  const createRule = trpc.routing.create.useMutation({
    onSuccess: () => {
      refetchRules();
      setIsCreateDialogOpen(false);
      resetForm();
    },
  });

  const updateRule = trpc.routing.update.useMutation({
    onSuccess: () => {
      refetchRules();
      setIsEditDialogOpen(false);
      setEditingRule(null);
      resetForm();
    },
  });

  const deleteRule = trpc.routing.delete.useMutation({
    onSuccess: () => {
      refetchRules();
    },
  });

  const toggleRule = trpc.routing.toggleActive.useMutation({
    onSuccess: () => {
      refetchRules();
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      priority: 1,
      isActive: true,
      conditions: {
        timeRanges: [],
        callerIdPatterns: [],
        didNumbers: [],
        dayOfWeek: [],
      },
      actions: {
        routeToAgent: null,
        routeToQueue: null,
        routeToVoicemail: false,
        playAnnouncement: null,
        transferToNumber: null,
      },
    });
  };

  const handleCreateRule = () => {
    if (!selectedClient) return;
    createRule.mutate({
      clientId: selectedClient,
      ...formData,
    });
  };

  const handleUpdateRule = () => {
    if (!editingRule) return;
    updateRule.mutate({
      id: editingRule.id,
      ...formData,
    });
  };

  const handleEditRule = (rule: any) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      description: rule.description || "",
      priority: rule.priority,
      isActive: rule.isActive,
      conditions: rule.conditions || {
        timeRanges: [],
        callerIdPatterns: [],
        didNumbers: [],
        dayOfWeek: [],
      },
      actions: rule.actions || {
        routeToAgent: null,
        routeToQueue: null,
        routeToVoicemail: false,
        playAnnouncement: null,
        transferToNumber: null,
      },
    });
    setIsEditDialogOpen(true);
  };

  const getActionDescription = (rule: any) => {
    const actions = rule.actions || {};
    const descriptions: string[] = [];

    if (actions.routeToAgent) {
      const agent = agents?.find((a) => a.id === actions.routeToAgent);
      descriptions.push(`Route to Agent: ${agent?.name || "Unknown"}`);
    }
    if (actions.routeToQueue) {
      const queue = queues?.find((q) => q.id === actions.routeToQueue);
      descriptions.push(`Route to Queue: ${queue?.name || "Unknown"}`);
    }
    if (actions.routeToVoicemail) {
      descriptions.push("Route to Voicemail");
    }
    if (actions.playAnnouncement) {
      descriptions.push(`Play Announcement #${actions.playAnnouncement}`);
    }
    if (actions.transferToNumber) {
      descriptions.push(`Transfer to ${actions.transferToNumber}`);
    }

    return descriptions.length > 0 ? descriptions.join(" → ") : "No actions configured";
  };

  const getConditionsDescription = (rule: any) => {
    const conditions = rule.conditions || {};
    const descriptions: string[] = [];

    if (conditions.timeRanges?.length > 0) {
      descriptions.push(`${conditions.timeRanges.length} time ranges`);
    }
    if (conditions.callerIdPatterns?.length > 0) {
      descriptions.push(`${conditions.callerIdPatterns.length} caller patterns`);
    }
    if (conditions.didNumbers?.length > 0) {
      descriptions.push(`${conditions.didNumbers.length} DID numbers`);
    }
    if (conditions.dayOfWeek?.length > 0) {
      descriptions.push(`${conditions.dayOfWeek.length} days`);
    }

    return descriptions.length > 0 ? descriptions.join(", ") : "No conditions";
  };

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Call Routing Rules</h1>
          <p className="text-muted-foreground">
            Configure intelligent call routing based on conditions
          </p>
        </div>
      </div>

      {/* Client Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Client</CardTitle>
          <CardDescription>Choose a client to manage their routing rules</CardDescription>
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
          {/* Create Rule Button */}
          <div className="flex justify-end">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Routing Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create Routing Rule</DialogTitle>
                  <DialogDescription>
                    Define conditions and actions for intelligent call routing
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Basic Info */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Rule Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Business Hours Routing"
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority (1-10)</Label>
                      <Input
                        id="priority"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                  </div>

                  {/* Conditions */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-4">Conditions</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Days of Week</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {daysOfWeek.map((day, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`day-${index}`}
                                checked={formData.conditions.dayOfWeek.includes(index)}
                                onChange={(e) => {
                                  const days = e.target.checked
                                    ? [...formData.conditions.dayOfWeek, index]
                                    : formData.conditions.dayOfWeek.filter((d) => d !== index);
                                  setFormData({
                                    ...formData,
                                    conditions: { ...formData.conditions, dayOfWeek: days },
                                  });
                                }}
                              />
                              <Label htmlFor={`day-${index}`} className="text-sm">{day.substring(0, 3)}</Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-4">Actions</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Route to Agent</Label>
                        <Select
                          value={formData.actions.routeToAgent?.toString() || "none"}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              actions: {
                                ...formData.actions,
                                routeToAgent: value === "none" ? null : parseInt(value),
                              },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select agent" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {agents?.map((agent) => (
                              <SelectItem key={agent.id} value={agent.id.toString()}>
                                {agent.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Route to Queue</Label>
                        <Select
                          value={formData.actions.routeToQueue?.toString() || "none"}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              actions: {
                                ...formData.actions,
                                routeToQueue: value === "none" ? null : parseInt(value),
                              },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select queue" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {queues?.map((queue) => (
                              <SelectItem key={queue.id} value={queue.id.toString()}>
                                {queue.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transferNumber">Transfer to Number</Label>
                        <Input
                          id="transferNumber"
                          value={formData.actions.transferToNumber || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              actions: { ...formData.actions, transferToNumber: e.target.value || null },
                            })
                          }
                          placeholder="+27123456789"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="voicemail"
                          checked={formData.actions.routeToVoicemail}
                          onCheckedChange={(checked) =>
                            setFormData({
                              ...formData,
                              actions: { ...formData.actions, routeToVoicemail: checked },
                            })
                          }
                        />
                        <Label htmlFor="voicemail">Route to Voicemail</Label>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRule} disabled={!formData.name}>
                    Create Rule
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Routing Rules Table */}
          <Card>
            <CardHeader>
              <CardTitle>Routing Rules</CardTitle>
              <CardDescription>Rules are evaluated by priority (1 = highest)</CardDescription>
            </CardHeader>
            <CardContent>
              {rules && rules.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Priority</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Conditions</TableHead>
                      <TableHead>Actions</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rules
                      .sort((a, b) => a.priority - b.priority)
                      .map((rule) => (
                        <TableRow key={rule.id}>
                          <TableCell>
                            <Badge variant="outline">{rule.priority}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{rule.name}</div>
                              {rule.description && (
                                <div className="text-sm text-muted-foreground">{rule.description}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={rule.isActive ? "default" : "secondary"}>
                              {rule.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {getConditionsDescription(rule)}
                          </TableCell>
                          <TableCell className="text-sm">
                            <div className="flex items-center gap-2">
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              {getActionDescription(rule)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  toggleRule.mutate({ id: rule.id, isActive: !rule.isActive })
                                }
                              >
                                <Switch checked={rule.isActive} />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleEditRule(rule)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteRule.mutate({ id: rule.id })}
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
                  No routing rules configured. Create your first rule to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Edit Dialog */}
      {editingRule && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Routing Rule</DialogTitle>
              <DialogDescription>Update conditions and actions for this rule</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Same form as create, but with update button */}
              <div className="space-y-2">
                <Label htmlFor="edit-name">Rule Name</Label>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Priority (1-10)</Label>
                  <Input
                    id="edit-priority"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="edit-isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="edit-isActive">Active</Label>
                </div>
              </div>

              {/* Conditions */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Conditions</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Days of Week</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {daysOfWeek.map((day, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`edit-day-${index}`}
                            checked={formData.conditions.dayOfWeek.includes(index)}
                            onChange={(e) => {
                              const days = e.target.checked
                                ? [...formData.conditions.dayOfWeek, index]
                                : formData.conditions.dayOfWeek.filter((d) => d !== index);
                              setFormData({
                                ...formData,
                                conditions: { ...formData.conditions, dayOfWeek: days },
                              });
                            }}
                          />
                          <Label htmlFor={`edit-day-${index}`} className="text-sm">{day.substring(0, 3)}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Actions</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Route to Agent</Label>
                    <Select
                      value={formData.actions.routeToAgent?.toString() || "none"}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          actions: {
                            ...formData.actions,
                            routeToAgent: value === "none" ? null : parseInt(value),
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select agent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {agents?.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id.toString()}>
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Route to Queue</Label>
                    <Select
                      value={formData.actions.routeToQueue?.toString() || "none"}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          actions: {
                            ...formData.actions,
                            routeToQueue: value === "none" ? null : parseInt(value),
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select queue" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {queues?.map((queue) => (
                          <SelectItem key={queue.id} value={queue.id.toString()}>
                            {queue.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-transferNumber">Transfer to Number</Label>
                    <Input
                      id="edit-transferNumber"
                      value={formData.actions.transferToNumber || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          actions: { ...formData.actions, transferToNumber: e.target.value || null },
                        })
                      }
                      placeholder="+27123456789"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-voicemail"
                      checked={formData.actions.routeToVoicemail}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          actions: { ...formData.actions, routeToVoicemail: checked },
                        })
                      }
                    />
                    <Label htmlFor="edit-voicemail">Route to Voicemail</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateRule} disabled={!formData.name}>
                Update Rule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
