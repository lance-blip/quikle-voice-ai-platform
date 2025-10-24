import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import AIChatbot from "@/components/AIChatbot";
import { Bot, Zap, Users, BarChart3, Mic, Workflow, Shield, Globe } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/quikle-logo.png" alt="Quikle Voice" className="h-8 w-8" />
              <span className="text-xl font-bold text-primary">Quikle Voice</span>
          </div>
          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <span className="text-sm text-muted-foreground">
                  {user?.name || user?.email}
                </span>
              </>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button variant="ghost">Sign In</Button>
                </a>
                <a href={getLoginUrl()}>
                  <Button>Get Started</Button>
                </a>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Build Powerful{" "}
              <span className="text-primary">AI Voice Agents</span>
              <br />
              Without Code
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create, deploy, and manage sophisticated voice AI agents for your clients. 
              Drag-and-drop flow builder, knowledge base integration, and real-time analytics—all in one platform.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a href={getLoginUrl()}>
                <Button size="lg" className="text-lg px-8">
                  Start Building Free
                </Button>
              </a>
              <Button size="lg" variant="outline" className="text-lg px-8">
                Watch Demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Scale Voice AI
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete platform for agencies to build, deploy, and manage AI voice agents for their clients.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Bot className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Visual Flow Editor</CardTitle>
                <CardDescription>
                  Build complex conversation flows with an intuitive drag-and-drop canvas. 
                  No coding required.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-accent/50 transition-colors">
              <CardHeader>
                <Zap className="h-10 w-10 text-accent mb-2" />
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Sub-800ms voice-to-voice latency with optimized STT, LLM, and TTS pipeline.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-secondary/50 transition-colors">
              <CardHeader>
                <Users className="h-10 w-10 text-secondary mb-2" />
                <CardTitle>Multi-Client Management</CardTitle>
                <CardDescription>
                  Manage unlimited clients under your agency with complete data isolation.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Mic className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Voice Cloning</CardTitle>
                <CardDescription>
                  Clone any voice with just 1-2 minutes of audio. Powered by ElevenLabs and Cartesia.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-accent/50 transition-colors">
              <CardHeader>
                <Workflow className="h-10 w-10 text-accent mb-2" />
                <CardTitle>Automations Hub</CardTitle>
                <CardDescription>
                  Trigger actions based on call events. Integrate with CRMs, calendars, and webhooks.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-secondary/50 transition-colors">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-secondary mb-2" />
                <CardTitle>Real-Time Analytics</CardTitle>
                <CardDescription>
                  Track call metrics, transcripts, and performance with detailed dashboards.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Enterprise Security</CardTitle>
                <CardDescription>
                  Zero-trust architecture with end-to-end encryption and complete tenant isolation.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-accent/50 transition-colors">
              <CardHeader>
                <Globe className="h-10 w-10 text-accent mb-2" />
                <CardTitle>White-Label Ready</CardTitle>
                <CardDescription>
                  Customize branding, logos, and domains to match your agency's identity.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-secondary/50 transition-colors">
              <CardHeader>
                <Bot className="h-10 w-10 text-secondary mb-2" />
                <CardTitle>Knowledge Base</CardTitle>
                <CardDescription>
                  Upload documents, audio, and URLs. AI-powered semantic search for dynamic responses.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From concept to deployment in minutes, not months.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                1
              </div>
              <h3 className="text-xl font-semibold">Design Your Flow</h3>
              <p className="text-muted-foreground">
                Use the visual editor to create conversation paths, add actions, and configure responses.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                2
              </div>
              <h3 className="text-xl font-semibold">Add Knowledge</h3>
              <p className="text-muted-foreground">
                Upload documents, audio files, or connect URLs to give your agent context and expertise.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                3
              </div>
              <h3 className="text-xl font-semibold">Deploy & Monitor</h3>
              <p className="text-muted-foreground">
                Connect a phone number, test your agent, and watch real-time analytics roll in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-accent text-primary-foreground">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to Transform Your Voice AI?
            </h2>
            <p className="text-xl opacity-90">
              Join hundreds of agencies building the future of conversational AI.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a href={getLoginUrl()}>
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Start Free Trial
                </Button>
              </a>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent border-white text-white hover:bg-white/10">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src="/quikle-logo.png" alt="Quikle Voice" className="h-6 w-6" />
                <span className="font-bold text-primary">Quikle Voice</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Build powerful AI voice agents without code.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Quikle Voice. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <AIChatbot />
    </div>
  );
}

