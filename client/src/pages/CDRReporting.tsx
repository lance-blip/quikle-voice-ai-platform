import { useState } from "react";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Download, Phone, Clock, TrendingUp, Users, CheckCircle, XCircle, PhoneOff } from "lucide-react";

export default function CDRReporting() {
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Fetch clients
  const { data: clients } = trpc.clients.list.useQuery();

  // Fetch dashboard data
  const { data: dashboardData } = trpc.cdr.getDashboard.useQuery(
    {
      clientId: selectedClient!,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    },
    { enabled: !!selectedClient }
  );

  // Fetch call records
  const { data: callRecords } = trpc.cdr.getRecords.useQuery(
    {
      clientId: selectedClient!,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      limit: 100,
    },
    { enabled: !!selectedClient }
  );

  // Fetch analytics
  const { data: analytics } = trpc.cdr.getAnalytics.useQuery(
    {
      clientId: selectedClient!,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    },
    { enabled: !!selectedClient }
  );

  // Fetch agent metrics
  const { data: agentMetrics } = trpc.cdr.getAgentMetrics.useQuery(
    {
      clientId: selectedClient!,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    },
    { enabled: !!selectedClient }
  );

  // Export mutation
  const exportToCSV = trpc.cdr.exportToCSV.useMutation({
    onSuccess: (data) => {
      // Create a download link
      const blob = new Blob([data.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cdr-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });

  const handleExport = () => {
    if (selectedClient) {
      exportToCSV.mutate({
        clientId: selectedClient,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Call Detail Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive call analytics and performance metrics
          </p>
        </div>
        <Button onClick={handleExport} disabled={!selectedClient || exportToCSV.isLoading}>
          <Download className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select client and date range for reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Client</Label>
              <Select
                value={selectedClient?.toString()}
                onValueChange={(value) => setSelectedClient(parseInt(value))}
              >
                <SelectTrigger>
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
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClient && (
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="calls">Call Records</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            {dashboardData && (
              <>
                <div className="grid gap-4 md:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData.totalCalls}</div>
                      <p className="text-xs text-muted-foreground">
                        {dashboardData.inboundCalls} inbound, {dashboardData.outboundCalls} outbound
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatDuration(dashboardData.avgDuration)}</div>
                      <p className="text-xs text-muted-foreground">
                        Total: {formatDuration(dashboardData.totalDuration)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Answer Rate</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData.answerRate}%</div>
                      <p className="text-xs text-muted-foreground">
                        {dashboardData.answeredCalls} answered
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{dashboardData.activeAgents}</div>
                      <p className="text-xs text-muted-foreground">
                        Handling calls
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Call Outcomes</CardTitle>
                      <CardDescription>Distribution of call results</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>Completed</span>
                          </div>
                          <Badge variant="default">{dashboardData.completedCalls}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <PhoneOff className="h-4 w-4 text-yellow-500" />
                            <span>Abandoned</span>
                          </div>
                          <Badge variant="secondary">{dashboardData.abandonedCalls}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span>Failed</span>
                          </div>
                          <Badge variant="destructive">{dashboardData.failedCalls}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Peak Hours</CardTitle>
                      <CardDescription>Busiest times of day</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8 text-muted-foreground">
                        Hourly volume chart coming soon
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="calls" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Call Records</CardTitle>
                <CardDescription>Detailed call history</CardDescription>
              </CardHeader>
              <CardContent>
                {callRecords && callRecords.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date/Time</TableHead>
                        <TableHead>Caller</TableHead>
                        <TableHead>Agent</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Outcome</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {callRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{formatDate(record.startedAt)}</TableCell>
                          <TableCell>{record.callerId || "Unknown"}</TableCell>
                          <TableCell>{record.agentName || "N/A"}</TableCell>
                          <TableCell>{formatDuration(record.duration)}</TableCell>
                          <TableCell>
                            <Badge variant={record.status === "completed" ? "default" : "secondary"}>
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{record.outcome}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No call records found for the selected date range
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {analytics && (
              <>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Service Level</CardTitle>
                      <CardDescription>Calls answered within threshold</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{analytics.serviceLevel}%</div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Target: 80% within 20 seconds
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Abandonment Rate</CardTitle>
                      <CardDescription>Calls abandoned before answer</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{analytics.abandonmentRate}%</div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Target: &lt; 5%
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>First Call Resolution</CardTitle>
                      <CardDescription>Issues resolved on first call</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{analytics.firstCallResolution}%</div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Target: &gt; 70%
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Average Wait Time</CardTitle>
                      <CardDescription>Time in queue before answer</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{analytics.avgWaitTime}s</div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Target: &lt; 20 seconds
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Average Talk Time</CardTitle>
                      <CardDescription>Average conversation duration</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{formatDuration(analytics.avgTalkTime)}</div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Industry average: 6 minutes
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="agents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
                <CardDescription>Individual agent metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {agentMetrics && agentMetrics.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agent</TableHead>
                        <TableHead>Calls Handled</TableHead>
                        <TableHead>Avg Duration</TableHead>
                        <TableHead>Utilization</TableHead>
                        <TableHead>CSAT Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agentMetrics.map((agent) => (
                        <TableRow key={agent.agentId}>
                          <TableCell className="font-medium">{agent.agentName}</TableCell>
                          <TableCell>{agent.callsHandled}</TableCell>
                          <TableCell>{formatDuration(agent.avgDuration)}</TableCell>
                          <TableCell>
                            <Badge variant={agent.utilization > 80 ? "default" : "secondary"}>
                              {agent.utilization}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={agent.csatScore > 4 ? "default" : "secondary"}>
                              {agent.csatScore.toFixed(1)}/5.0
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No agent metrics available for the selected date range
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
