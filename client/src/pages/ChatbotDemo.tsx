import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Send, Sparkles, Loader2, Download, Trash2, Copy, Check, Bot, User } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  intent?: string;
  sentiment?: string;
}

export default function ChatbotDemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm the Quikle Voice AI Assistant powered by Gemini 2.5 Pro. I can help you with:\n\n• Platform features and capabilities\n• Pricing and subscription plans\n• Technical support and integration\n• Sales inquiries\n• General questions\n\nHow can I assist you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessageMutation = trpc.chatbot.sendMessage.useMutation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        message: userMessage.content,
        conversationHistory: messages.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        })),
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message,
        timestamp: response.timestamp,
        intent: response.intent,
        sentiment: response.sentiment,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
      console.error(error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: 'assistant',
        content: "👋 Hi! I'm the Quikle Voice AI Assistant. How can I help you today?",
        timestamp: new Date().toISOString(),
      },
    ]);
    toast.success("Conversation history cleared");
  };

  const handleExportConversation = () => {
    const conversationText = messages
      .map(m => `[${new Date(m.timestamp).toLocaleString()}] ${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quikle-chatbot-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Conversation exported");
  };

  const handleCopyConversation = () => {
    const conversationText = messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n');
    
    navigator.clipboard.writeText(conversationText);
    setCopied(true);
    toast.success("Conversation copied to clipboard");
    
    setTimeout(() => setCopied(false), 2000);
  };

  const suggestions = [
    "How does voice cloning work?",
    "What integrations are available?",
    "Tell me about pricing plans",
    "How do I get started?",
    "What's the difference between Starter and Professional?",
    "Can I white-label the platform?",
    "How does the AI analysis work?",
    "What's your uptime guarantee?",
  ];

  const sentimentColor = (sentiment?: string) => {
    if (!sentiment) return 'bg-gray-100 text-gray-800';
    if (sentiment === 'positive') return 'bg-green-100 text-green-800';
    if (sentiment === 'negative') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-teal to-midnight flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Chatbot Demo</h1>
              <p className="text-gray-600">Test our Gemini 2.5 Pro-powered assistant</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[700px] flex flex-col">
              <CardHeader className="bg-gradient-to-r from-teal to-midnight text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    <CardTitle>Quikle AI Assistant</CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Powered by Gemini 2.5 Pro
                  </Badge>
                </div>
                <CardDescription className="text-white/80">
                  Real-time AI assistance for sales, support, and general inquiries
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, idx) => (
                  <div
                    key={idx}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' ? 'bg-coral' : 'bg-teal'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="h-4 w-4 text-white" />
                        ) : (
                          <Bot className="h-4 w-4 text-white" />
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <div
                          className={`rounded-lg p-4 ${
                            message.role === 'user'
                              ? 'bg-coral text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                          {message.intent && (
                            <Badge variant="outline" className="text-xs">
                              {message.intent}
                            </Badge>
                          )}
                          {message.sentiment && (
                            <Badge className={`text-xs ${sentimentColor(message.sentiment)}`}>
                              {message.sentiment}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex gap-3 max-w-[80%]">
                      <div className="h-8 w-8 rounded-full bg-teal flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-teal" />
                        <span className="text-sm text-gray-600">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </CardContent>

              <CardFooter className="border-t p-4 bg-gray-50">
                <div className="w-full space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={isTyping}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!input.trim() || isTyping}
                      className="bg-teal hover:bg-teal/90"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearHistory}
                      disabled={messages.length <= 1}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyConversation}
                      disabled={messages.length <= 1}
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportConversation}
                      disabled={messages.length <= 1}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Questions</CardTitle>
                <CardDescription>Click to try these questions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {suggestions.map((suggestion, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full justify-start text-left h-auto py-2 px-3"
                  >
                    <MessageCircle className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="text-xs">{suggestion}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Capabilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded bg-teal/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-3 w-3 text-teal" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Intent Detection</p>
                    <p className="text-xs text-gray-600">Identifies sales, support, or general queries</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded bg-coral/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-3 w-3 text-coral" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Sentiment Analysis</p>
                    <p className="text-xs text-gray-600">Detects positive, neutral, or negative tone</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded bg-midnight/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-3 w-3 text-midnight" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Context Awareness</p>
                    <p className="text-xs text-gray-600">Maintains conversation history and context</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-3 w-3 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Smart Suggestions</p>
                    <p className="text-xs text-gray-600">Provides relevant follow-up questions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conversation Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Messages</span>
                  <span className="text-lg font-bold">{messages.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">User Messages</span>
                  <span className="text-lg font-bold">{messages.filter(m => m.role === 'user').length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">AI Responses</span>
                  <span className="text-lg font-bold">{messages.filter(m => m.role === 'assistant').length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

