import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Target,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface TranscriptSegment {
  id: string;
  speaker: 'agent' | 'customer';
  text: string;
  timestamp: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

interface CallMetrics {
  duration: number;
  sentimentScore: number;
  qualityScore: number;
  customerSatisfaction: number;
  agentPerformance: number;
}

export default function CallAnalysis() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [metrics, setMetrics] = useState<CallMetrics>({
    duration: 0,
    sentimentScore: 0.75,
    qualityScore: 85,
    customerSatisfaction: 82,
    agentPerformance: 88,
  });
  const [analysis, setAnalysis] = useState({
    intent: 'Product Inquiry',
    keyPhrases: ['pricing information', 'enterprise plan', 'team features', 'integration options'],
    actionItems: ['Send pricing details via email', 'Schedule demo for next week', 'Follow up on integration requirements'],
    summary: 'Customer inquiring about enterprise pricing and integration capabilities. Interested in scheduling a demo to see team collaboration features.',
  });

  // Simulate live transcription
  useEffect(() => {
    if (!isCallActive) return;

    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        duration: prev.duration + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isCallActive]);

  const startCall = () => {
    setIsCallActive(true);
    toast.success("Call started - Real-time transcription active");
    
    // Simulate incoming transcription
    setTimeout(() => {
      addTranscriptSegment('agent', "Hello, thank you for calling Quikle Voice. How can I help you today?");
    }, 2000);
    
    setTimeout(() => {
      addTranscriptSegment('customer', "Hi, I'm interested in learning more about your enterprise pricing plans.");
    }, 5000);
    
    setTimeout(() => {
      addTranscriptSegment('agent', "Great! I'd be happy to help you with that. Can you tell me a bit about your team size and use case?");
    }, 8000);
    
    setTimeout(() => {
      addTranscriptSegment('customer', "We have about 50 sales representatives and we're looking for a solution that integrates with our CRM.");
    }, 12000);
  };

  const endCall = () => {
    setIsCallActive(false);
    toast.success("Call ended - Generating final analysis");
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.info(isMuted ? "Microphone unmuted" : "Microphone muted");
  };

  const addTranscriptSegment = (speaker: 'agent' | 'customer', text: string) => {
    const sentiment = Math.random() > 0.3 ? 'positive' : Math.random() > 0.5 ? 'neutral' : 'negative';
    const segment: TranscriptSegment = {
      id: Date.now().toString(),
      speaker,
      text,
      timestamp: new Date().toLocaleTimeString(),
      sentiment,
    };
    setTranscript(prev => [...prev, segment]);
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'border-l-green-500';
      case 'negative':
        return 'border-l-red-500';
      default:
        return 'border-l-yellow-500';
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Real-time Call Analysis</h1>
          <p className="text-muted-foreground">
            Live transcription with AI-powered sentiment analysis and insights
          </p>
        </div>

        {/* Call Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-mono font-bold">
                    {formatDuration(metrics.duration)}
                  </span>
                </div>
                {isCallActive && (
                  <Badge variant="default" className="bg-accent animate-pulse">
                    <div className="h-2 w-2 bg-white rounded-full mr-2" />
                    Live
                  </Badge>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleMute}
                  disabled={!isCallActive}
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={!isCallActive}
                >
                  <Volume2 className="h-5 w-5" />
                </Button>
                {!isCallActive ? (
                  <Button onClick={startCall} className="bg-accent hover:bg-accent/90">
                    <Phone className="h-5 w-5 mr-2" />
                    Start Call
                  </Button>
                ) : (
                  <Button onClick={endCall} variant="destructive">
                    <PhoneOff className="h-5 w-5 mr-2" />
                    End Call
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Transcription */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>Live Transcription</CardTitle>
                <CardDescription>
                  Real-time speech-to-text with speaker identification
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                {transcript.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <div className="text-center">
                      <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Start a call to see live transcription</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transcript.map(segment => (
                      <div
                        key={segment.id}
                        className={`p-4 rounded-lg border-l-4 ${getSentimentColor(segment.sentiment)} ${
                          segment.speaker === 'agent' ? 'bg-primary/5' : 'bg-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={segment.speaker === 'agent' ? 'default' : 'secondary'}>
                              {segment.speaker === 'agent' ? 'Agent' : 'Customer'}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{segment.timestamp}</span>
                          </div>
                          {getSentimentIcon(segment.sentiment)}
                        </div>
                        <p className="text-sm">{segment.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Analysis */}
          <div className="space-y-6">
            {/* Real-time Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Sentiment Score</span>
                    <span className="text-sm font-bold text-accent">
                      {Math.round(metrics.sentimentScore * 100)}%
                    </span>
                  </div>
                  <Progress value={metrics.sentimentScore * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Call Quality</span>
                    <span className="text-sm font-bold text-accent">{metrics.qualityScore}%</span>
                  </div>
                  <Progress value={metrics.qualityScore} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Customer Satisfaction</span>
                    <span className="text-sm font-bold text-accent">
                      {metrics.customerSatisfaction}%
                    </span>
                  </div>
                  <Progress value={metrics.customerSatisfaction} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Agent Performance</span>
                    <span className="text-sm font-bold text-accent">
                      {metrics.agentPerformance}%
                    </span>
                  </div>
                  <Progress value={metrics.agentPerformance} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Intent & Key Phrases */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-accent" />
                  Intent & Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Primary Intent</span>
                  <p className="font-semibold mt-1">{analysis.intent}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-muted-foreground">Key Phrases</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {analysis.keyPhrases.map((phrase, idx) => (
                      <Badge key={idx} variant="outline">{phrase}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  Action Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.actionItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Summary */}
        {transcript.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Call Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{analysis.summary}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

