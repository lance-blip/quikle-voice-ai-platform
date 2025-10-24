import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Play, Phone, Mic, Volume2, RotateCcw, Download, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TestMessage {
  role: "agent" | "caller";
  content: string;
  timestamp: Date;
}

interface TestResult {
  success: boolean;
  duration: number;
  latency: number;
  errors: string[];
  warnings: string[];
}

export default function AgentTesting() {
  const [selectedAgentId, setSelectedAgentId] = useState<number | null>(null);
  const [testMode, setTestMode] = useState<"text" | "voice">("text");
  const [testInput, setTestInput] = useState("");
  const [testMessages, setTestMessages] = useState<TestMessage[]>([]);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const { data: agency } = trpc.agency.get.useQuery();
  // For testing purposes, we'll need to select a client first
  // In a real scenario, you'd have a client selector
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const { data: agents } = trpc.agents.list.useQuery(
    { clientId: selectedClientId || 0 },
    { enabled: !!selectedClientId }
  );

  const handleSendMessage = () => {
    if (!testInput.trim()) return;

    // Add caller message
    const callerMessage: TestMessage = {
      role: "caller",
      content: testInput,
      timestamp: new Date(),
    };
    setTestMessages((prev) => [...prev, callerMessage]);
    setTestInput("");

    // Simulate agent response
    setTimeout(() => {
      const agentMessage: TestMessage = {
        role: "agent",
        content: generateMockResponse(testInput),
        timestamp: new Date(),
      };
      setTestMessages((prev) => [...prev, agentMessage]);
    }, 1500);
  };

  const generateMockResponse = (input: string): string => {
    const responses = [
      "Thank you for that information. Let me help you with that.",
      "I understand. Can you provide me with more details?",
      "Great! I've processed your request. Is there anything else I can help you with?",
      "I see. Let me check that for you right away.",
      "Perfect. I'll make sure to take care of that for you.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleStartVoiceTest = () => {
    setIsTestRunning(true);
    toast.info("Starting voice test simulation...");

    // Simulate voice test
    setTimeout(() => {
      setTestResult({
        success: true,
        duration: 45.3,
        latency: 650,
        errors: [],
        warnings: ["Voice quality slightly degraded at 32s mark"],
      });
      setIsTestRunning(false);
      toast.success("Voice test completed successfully");
    }, 3000);
  };

  const handleReset = () => {
    setTestMessages([]);
    setTestResult(null);
    setTestInput("");
  };

  const testScenarios = [
    {
      name: "Customer Support",
      description: "Test handling of common support queries",
      prompts: [
        "I need help with my account",
        "How do I reset my password?",
        "I'm having trouble logging in",
      ],
    },
    {
      name: "Sales Inquiry",
      description: "Test product information and pricing questions",
      prompts: [
        "What are your pricing plans?",
        "Can you tell me about your features?",
        "I'd like to schedule a demo",
      ],
    },
    {
      name: "Appointment Booking",
      description: "Test scheduling and calendar integration",
      prompts: [
        "I'd like to book an appointment",
        "What times are available tomorrow?",
        "Can I reschedule my appointment?",
      ],
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Agent Testing</h1>
          <p className="text-muted-foreground mt-2">
            Test your agents with simulated conversations and voice calls.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Configuration</CardTitle>
                <CardDescription>Select agent and test mode</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Agent</Label>
                  <Select
                    value={selectedAgentId?.toString()}
                    onValueChange={(value) => setSelectedAgentId(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agents?.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id.toString()}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Test Mode</Label>
                  <Select value={testMode} onValueChange={(value: any) => setTestMode(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text Chat</SelectItem>
                      <SelectItem value="voice">Voice Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full"
                  onClick={handleReset}
                  variant="outline"
                  disabled={testMessages.length === 0 && !testResult}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Test
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Scenarios</CardTitle>
                <CardDescription>Quick test templates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {testScenarios.map((scenario, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <h4 className="font-semibold text-sm">{scenario.name}</h4>
                    <p className="text-xs text-muted-foreground">{scenario.description}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        scenario.prompts.forEach((prompt, i) => {
                          setTimeout(() => {
                            setTestInput(prompt);
                            setTimeout(() => handleSendMessage(), 500);
                          }, i * 3000);
                        });
                      }}
                    >
                      <Play className="h-3 w-3 mr-2" />
                      Run Scenario
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Testing Interface */}
          <div className="lg:col-span-2">
            <Tabs value={testMode} onValueChange={(value: any) => setTestMode(value)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">Text Chat Test</TabsTrigger>
                <TabsTrigger value="voice">Voice Call Test</TabsTrigger>
              </TabsList>

              {/* Text Chat Testing */}
              <TabsContent value="text" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Conversation Simulator</CardTitle>
                    <CardDescription>
                      Test your agent's responses in a text-based conversation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Chat Messages */}
                    <div className="border rounded-lg p-4 h-[400px] overflow-y-auto bg-muted/20">
                      {testMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <Mic className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-sm text-muted-foreground">
                            Start a conversation to test your agent
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {testMessages.map((message, index) => (
                            <div
                              key={index}
                              className={`flex ${
                                message.role === "caller" ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                  message.role === "caller"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-semibold">
                                    {message.role === "caller" ? "You" : "Agent"}
                                  </span>
                                  <span className="text-xs opacity-70">
                                    {message.timestamp.toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-sm">{message.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        disabled={!selectedAgentId}
                      />
                      <Button onClick={handleSendMessage} disabled={!selectedAgentId || !testInput}>
                        Send
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Voice Call Testing */}
              <TabsContent value="voice" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Voice Call Simulator</CardTitle>
                    <CardDescription>
                      Test your agent's voice performance and latency
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border rounded-lg p-8 text-center space-y-4">
                      {!isTestRunning && !testResult && (
                        <>
                          <Phone className="h-16 w-16 mx-auto text-primary" />
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Ready to Test</h3>
                            <p className="text-sm text-muted-foreground">
                              Click the button below to start a simulated voice call
                            </p>
                          </div>
                          <Button
                            size="lg"
                            onClick={handleStartVoiceTest}
                            disabled={!selectedAgentId}
                          >
                            <Phone className="h-5 w-5 mr-2" />
                            Start Voice Test
                          </Button>
                        </>
                      )}

                      {isTestRunning && (
                        <>
                          <div className="relative">
                            <div className="h-24 w-24 mx-auto rounded-full bg-accent/20 flex items-center justify-center animate-pulse">
                              <Volume2 className="h-12 w-12 text-accent" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Call in Progress</h3>
                            <p className="text-sm text-muted-foreground">
                              Testing voice quality and response time...
                            </p>
                          </div>
                        </>
                      )}

                      {testResult && (
                        <>
                          <div
                            className={`h-24 w-24 mx-auto rounded-full flex items-center justify-center ${
                              testResult.success
                                ? "bg-accent/20 text-accent"
                                : "bg-destructive/20 text-destructive"
                            }`}
                          >
                            {testResult.success ? (
                              <CheckCircle className="h-12 w-12" />
                            ) : (
                              <XCircle className="h-12 w-12" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold mb-2">Test Complete</h3>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div className="text-center">
                                <p className="text-2xl font-bold">{testResult.duration}s</p>
                                <p className="text-xs text-muted-foreground">Duration</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold">{testResult.latency}ms</p>
                                <p className="text-xs text-muted-foreground">Avg. Latency</p>
                              </div>
                            </div>
                          </div>

                          {testResult.warnings.length > 0 && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-left">
                              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <span className="text-yellow-500">⚠</span> Warnings
                              </h4>
                              {testResult.warnings.map((warning, index) => (
                                <p key={index} className="text-xs text-muted-foreground">
                                  • {warning}
                                </p>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={handleReset}>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Run Again
                            </Button>
                            <Button variant="outline" className="flex-1">
                              <Download className="h-4 w-4 mr-2" />
                              Export Results
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

