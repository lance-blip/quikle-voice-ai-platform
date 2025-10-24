import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Phone, PhoneIncoming, PhoneOutgoing, Clock, FileText, Download, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CallLogs() {
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [selectedCall, setSelectedCall] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: agency } = trpc.agency.get.useQuery();
  const { data: clients } = trpc.clients.list.useQuery(
    { agencyId: agency?.id || 0 },
    { enabled: !!agency?.id }
  );

  const { data: callLogs } = trpc.callLogs.list.useQuery(
    { agentId: selectedAgentId || 0 },
    { enabled: !!selectedAgentId }
  );

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-accent/10 text-accent";
      case "failed":
        return "bg-destructive/10 text-destructive";
      case "no-answer":
        return "bg-yellow-500/10 text-yellow-600";
      case "busy":
        return "bg-orange-500/10 text-orange-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Call Logs</h1>
            <p className="text-muted-foreground mt-2">
              View call history, transcripts, and performance metrics.
            </p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by caller, transcript..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Agent</label>
                <Select
                  value={selectedAgentId?.toString() || ""}
                  onValueChange={(value) => setSelectedAgentId(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All agents..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="no-answer">No Answer</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{callLogs?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <PhoneIncoming className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {callLogs?.filter((c) => c.status === "completed").length || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {callLogs && callLogs.length > 0
                  ? formatDuration(
                      Math.floor(
                        callLogs.reduce((sum, c) => sum + (c.duration || 0), 0) / callLogs.length
                      )
                    )
                  : "0:00"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <PhoneOutgoing className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {callLogs && callLogs.length > 0
                  ? Math.round(
                      (callLogs.filter((c) => c.status === "completed").length / callLogs.length) *
                        100
                    )
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Calls</CardTitle>
            <CardDescription>View and analyze your call history</CardDescription>
          </CardHeader>
          <CardContent>
            {!callLogs || callLogs.length === 0 ? (
              <div className="text-center py-12">
                <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No calls yet</h3>
                <p className="text-sm text-muted-foreground">
                  Call logs will appear here once your agents start receiving calls.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Caller</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {callLogs.map((call) => (
                    <TableRow key={call.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        {new Date(call.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {call.direction === "inbound" ? (
                            <PhoneIncoming className="h-4 w-4 text-accent" />
                          ) : (
                            <PhoneOutgoing className="h-4 w-4 text-primary" />
                          )}
                          <span className="capitalize">{call.direction}</span>
                        </div>
                      </TableCell>
                      <TableCell>{call.callerNumber || "Unknown"}</TableCell>
                      <TableCell>{formatDuration(call.duration)}</TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                            call.status
                          )}`}
                        >
                          {call.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCall(call)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Call Detail Dialog */}
        <Dialog open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Call Details</DialogTitle>
              <DialogDescription>
                {selectedCall && new Date(selectedCall.createdAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            {selectedCall && (
              <div className="space-y-6">
                {/* Call Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Direction</p>
                    <p className="text-sm capitalize">{selectedCall.direction}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Duration</p>
                    <p className="text-sm">{formatDuration(selectedCall.duration)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Caller Number</p>
                    <p className="text-sm">{selectedCall.callerNumber || "Unknown"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getStatusColor(
                        selectedCall.status
                      )}`}
                    >
                      {selectedCall.status}
                    </span>
                  </div>
                </div>

                {/* Transcript */}
                {selectedCall.transcript && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Transcript</h3>
                    <div className="bg-muted rounded-lg p-4 text-sm whitespace-pre-wrap">
                      {selectedCall.transcript}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {selectedCall.summary && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">AI Summary</h3>
                    <div className="bg-accent/10 rounded-lg p-4 text-sm">
                      {selectedCall.summary}
                    </div>
                  </div>
                )}

                {/* Recording */}
                {selectedCall.recordingUrl && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">Recording</h3>
                    <audio controls className="w-full">
                      <source src={selectedCall.recordingUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download Transcript
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download Recording
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

