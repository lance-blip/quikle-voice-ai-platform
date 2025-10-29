import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Bot, Users, Phone, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: agency, isLoading } = trpc.agency.get.useQuery();

  // Redirect to agency setup if no agency exists
  if (!isLoading && !agency) {
    setLocation("/agency-setup");
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's an overview of your voice AI platform.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-accent">+0</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-accent">+0</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-accent">+0</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Call Duration</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0m 0s</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-accent">+0%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-2 border-dashed hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Add New Client
              </CardTitle>
              <CardDescription>
                Create a new client account to start building voice agents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/clients">
                <Button className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Client
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed hover:border-accent/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-accent" />
                Build an Agent
              </CardTitle>
              <CardDescription>
                Use the visual flow editor to create a new voice agent.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/agents">
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Agent
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed hover:border-secondary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-secondary" />
                Get Phone Number
              </CardTitle>
              <CardDescription>
                Purchase or connect a phone number for your agents.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/phone-numbers">
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Number
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        {!agency && (
          <Card className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-primary/20">
            <CardHeader>
              <CardTitle>Welcome to Quikle!</CardTitle>
              <CardDescription>
                Let's get you started with your first voice AI agent.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Set up your agency profile</p>
                    <p className="text-sm text-muted-foreground">
                      Configure your branding, logo, and agency settings.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Create your first client</p>
                    <p className="text-sm text-muted-foreground">
                      Add a client account to organize agents and phone numbers.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Build your first agent</p>
                    <p className="text-sm text-muted-foreground">
                      Use the visual flow editor to design conversation flows.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href="/settings">
                  <Button>
                    Get Started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Button variant="outline">View Documentation</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest calls, agent updates, and system events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <p>No recent activity yet.</p>
              <p className="text-sm mt-2">Activity will appear here once you start using the platform.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

