import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Phone, PhoneOff, Clock, Activity, Volume2, Mic, User } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LiveCall {
  id: string;
  agentName: string;
  callerNumber: string;
  duration: number;
  status: "ringing" | "in-progress" | "on-hold" | "transferring";
  transcript: string[];
  sentiment: "positive" | "neutral" | "negative";
  audioLevel: number;
}

export default function LiveMonitoring() {
  const [liveCalls, setLiveCalls] = useState<LiveCall[]>([
    {
      id: "call-1",
      agentName: "Customer Support Agent",
      callerNumber: "+1 (555) 123-4567",
      duration: 145,
      status: "in-progress",
      transcript: [
        "Agent: Hello, thank you for calling. How can I help you today?",
        "Caller: Hi, I'm having issues with my account.",
        "Agent: I'd be happy to help you with that. Can you provide your account number?",
      ],
      sentiment: "neutral",
      audioLevel: 65,
    },
    {
      id: "call-2",
      agentName: "Sales Agent",
      callerNumber: "+1 (555) 987-6543",
      duration: 89,
      status: "in-progress",
      transcript: [
        "Agent: Good afternoon! Thanks for your interest in our services.",
        "Caller: Yes, I'd like to learn more about your pricing.",
      ],
      sentiment: "positive",
      audioLevel: 72,
    },
  ]);

  const { data: agency } = trpc.agency.get.useQuery();

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCalls((calls) =>
        calls.map((call) => ({
          ...call,
          duration: call.duration + 1,
          audioLevel: Math.floor(Math.random() * 40) + 50,
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-accent text-accent-foreground";
      case "negative":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ringing":
        return "bg-blue-500";
      case "in-progress":
        return "bg-accent";
      case "on-hold":
        return "bg-yellow-500";
      case "transferring":
        return "bg-purple-500";
      default:
        return "bg-muted";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Live Monitoring</h1>
          <p className="text-muted-foreground mt-2">
            Monitor active calls in real-time with live transcripts and analytics.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Calls</CardTitle>
              <Phone className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveCalls.length}</div>
              <p className="text-xs text-muted-foreground">Currently in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDuration(
                  Math.floor(
                    liveCalls.reduce((sum, call) => sum + call.duration, 0) / liveCalls.length
                  )
                )}
              </div>
              <p className="text-xs text-muted-foreground">Average call time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Positive Sentiment</CardTitle>
              <Activity className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(
                  (liveCalls.filter((c) => c.sentiment === "positive").length / liveCalls.length) *
                    100
                )}
                %
              </div>
              <p className="text-xs text-muted-foreground">Calls with positive sentiment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Queue</CardTitle>
              <PhoneOff className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Calls waiting</p>
            </CardContent>
          </Card>
        </div>

        {/* Live Calls */}
        {liveCalls.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Phone className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No active calls</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Live calls will appear here when your agents are actively handling conversations.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {liveCalls.map((call) => (
              <Card key={call.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-primary" />
                        {call.agentName}
                        <Badge className={getStatusColor(call.status)}>
                          {call.status.replace("-", " ")}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {call.callerNumber}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(call.duration)}
                        </span>
                        <Badge className={getSentimentColor(call.sentiment)} variant="outline">
                          {call.sentiment}
                        </Badge>
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Mic className="h-4 w-4 mr-2" />
                        Listen
                      </Button>
                      <Button variant="outline" size="sm">
                        Join
                      </Button>
                      <Button variant="destructive" size="sm">
                        End Call
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Live Transcript */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold">Live Transcript</h4>
                        <span className="text-xs text-muted-foreground">Real-time</span>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4 space-y-3 max-h-[300px] overflow-y-auto">
                        {call.transcript.map((line, index) => (
                          <div key={index} className="text-sm">
                            <span
                              className={
                                line.startsWith("Agent:")
                                  ? "font-semibold text-primary"
                                  : "font-semibold text-accent"
                              }
                            >
                              {line.split(":")[0]}:
                            </span>
                            <span className="ml-2">{line.split(":").slice(1).join(":")}</span>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            <div
                              className="w-2 h-2 bg-primary rounded-full animate-pulse"
                              style={{ animationDelay: "0.2s" }}
                            />
                            <div
                              className="w-2 h-2 bg-primary rounded-full animate-pulse"
                              style={{ animationDelay: "0.4s" }}
                            />
                          </div>
                          <span className="text-xs">Listening...</span>
                        </div>
                      </div>
                    </div>

                    {/* Call Metrics */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold">Call Metrics</h4>

                      <div className="space-y-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Audio Level</span>
                            <span className="font-medium">{call.audioLevel}%</span>
                          </div>
                          <Progress value={call.audioLevel} className="h-2" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Talk Time</span>
                            <span className="font-medium">65%</span>
                          </div>
                          <Progress value={65} className="h-2" />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Silence Time</span>
                            <span className="font-medium">8%</span>
                          </div>
                          <Progress value={8} className="h-2" />
                        </div>

                        <div className="pt-4 border-t space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Words/Min:</span>
                            <span className="font-medium">145</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Interruptions:</span>
                            <span className="font-medium">2</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Keywords:</span>
                            <span className="font-medium">5</span>
                          </div>
                        </div>
                      </div>
                    </div>
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

