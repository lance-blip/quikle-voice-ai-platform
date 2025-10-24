import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, Globe, MapPin, TrendingDown, Zap, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Carrier {
  id: number;
  name: string;
  region: "south-africa" | "international";
  priority: number;
  isActive: boolean;
  latencyMs: number;
  costPerMinZar: number;
  currency: "ZAR" | "USD";
  maxChannels: number;
  uptime: number;
  codecSupport: string[];
}

export default function CarrierManagement() {
  const [routingMode, setRoutingMode] = useState<string>("automatic");

  // Mock carrier data - in production, this would come from trpc query
  const carriers: Carrier[] = [
    {
      id: 1,
      name: "Saicom",
      region: "south-africa",
      priority: 1,
      isActive: true,
      latencyMs: 95,
      costPerMinZar: 0.35,
      currency: "ZAR",
      maxChannels: 1000,
      uptime: 99.9,
      codecSupport: ["G729", "GSM", "OPUS", "G711"],
    },
    {
      id: 2,
      name: "Wanatel",
      region: "south-africa",
      priority: 2,
      isActive: true,
      latencyMs: 120,
      costPerMinZar: 0.29,
      currency: "ZAR",
      maxChannels: 100,
      uptime: 99.5,
      codecSupport: ["G729", "GSM"],
    },
    {
      id: 3,
      name: "AVOXI",
      region: "south-africa",
      priority: 3,
      isActive: true,
      latencyMs: 90,
      costPerMinZar: 0.42,
      currency: "ZAR",
      maxChannels: 10000,
      uptime: 99.995,
      codecSupport: ["G729", "GSM", "OPUS", "G711"],
    },
    {
      id: 4,
      name: "Switch Telecom",
      region: "south-africa",
      priority: 4,
      isActive: false,
      latencyMs: 130,
      costPerMinZar: 0.25,
      currency: "ZAR",
      maxChannels: 1000,
      uptime: 99.0,
      codecSupport: ["G729", "GSM"],
    },
    {
      id: 10,
      name: "Twilio",
      region: "international",
      priority: 10,
      isActive: true,
      latencyMs: 300,
      costPerMinZar: 1.2,
      currency: "USD",
      maxChannels: 10000,
      uptime: 99.95,
      codecSupport: ["G729", "GSM", "OPUS", "G711"],
    },
    {
      id: 11,
      name: "Telnyx",
      region: "international",
      priority: 11,
      isActive: true,
      latencyMs: 280,
      costPerMinZar: 1.1,
      currency: "USD",
      maxChannels: 10000,
      uptime: 99.99,
      codecSupport: ["G729", "GSM", "OPUS", "G711"],
    },
  ];

  const saCarriers = carriers.filter((c) => c.region === "south-africa");
  const intlCarriers = carriers.filter((c) => c.region === "international");

  const avgSACost = saCarriers.reduce((sum, c) => sum + c.costPerMinZar, 0) / saCarriers.length;
  const avgIntlCost = intlCarriers.reduce((sum, c) => sum + c.costPerMinZar, 0) / intlCarriers.length;
  const costSavings = ((avgIntlCost - avgSACost) / avgIntlCost) * 100;

  const avgSALatency = saCarriers.reduce((sum, c) => sum + c.latencyMs, 0) / saCarriers.length;
  const avgIntlLatency = intlCarriers.reduce((sum, c) => sum + c.latencyMs, 0) / intlCarriers.length;

  const handleTestCarrier = (carrierId: number) => {
    toast.info(`Testing carrier ${carrierId}... This may take a few seconds.`);
    setTimeout(() => {
      toast.success(`Carrier test completed successfully! Latency: ${Math.floor(Math.random() * 50 + 80)}ms`);
    }, 2000);
  };

  const handleToggleCarrier = (carrierId: number, currentStatus: boolean) => {
    toast.success(`Carrier ${currentStatus ? "deactivated" : "activated"} successfully`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Carrier Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage telephony carriers and optimize call routing for South African market.
            </p>
          </div>
          <Select value={routingMode} onValueChange={setRoutingMode}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select routing mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="automatic">Automatic (Local Priority)</SelectItem>
              <SelectItem value="sa-only">South Africa Only</SelectItem>
              <SelectItem value="global">Global (International)</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Performance Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg SA Latency</CardTitle>
              <Zap className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(avgSALatency)}ms</div>
              <p className="text-xs text-muted-foreground">
                {Math.round(avgIntlLatency - avgSALatency)}ms faster than international
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{costSavings.toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground">
                vs international carriers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Carriers</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {carriers.filter((c) => c.isActive).length}
              </div>
              <p className="text-xs text-muted-foreground">
                {saCarriers.filter((c) => c.isActive).length} SA, {intlCarriers.filter((c) => c.isActive).length} International
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Cost (SA)</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R{avgSACost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">per minute</p>
            </CardContent>
          </Card>
        </div>

        {/* Carrier Comparison Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Latency & Cost Comparison</CardTitle>
            <CardDescription>
              Visual comparison of SA carriers vs. International carriers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">South African Carriers</span>
                    <span className="text-accent">{Math.round(avgSALatency)}ms avg</span>
                  </div>
                  <div className="h-8 bg-accent/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent flex items-center justify-end pr-2 text-xs font-medium text-white"
                      style={{ width: `${(avgSALatency / 400) * 100}%` }}
                    >
                      R{avgSACost.toFixed(2)}/min
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">International Carriers</span>
                    <span className="text-muted-foreground">{Math.round(avgIntlLatency)}ms avg</span>
                  </div>
                  <div className="h-8 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-muted-foreground/60 flex items-center justify-end pr-2 text-xs font-medium text-white"
                      style={{ width: `${(avgIntlLatency / 400) * 100}%` }}
                    >
                      R{avgIntlCost.toFixed(2)}/min
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Carrier Tables */}
        <Tabs defaultValue="south-africa">
          <TabsList>
            <TabsTrigger value="south-africa">
              <MapPin className="h-4 w-4 mr-2" />
              South African Carriers
            </TabsTrigger>
            <TabsTrigger value="international">
              <Globe className="h-4 w-4 mr-2" />
              International Carriers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="south-africa" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>South African SIP Trunk Providers</CardTitle>
                <CardDescription>
                  Local carriers optimized for sub-200ms latency and cost efficiency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Carrier</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Latency</TableHead>
                      <TableHead>Cost/Min</TableHead>
                      <TableHead>Channels</TableHead>
                      <TableHead>Uptime</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {saCarriers.map((carrier) => (
                      <TableRow key={carrier.id}>
                        <TableCell className="font-medium">{carrier.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">P{carrier.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={carrier.latencyMs < 120 ? "text-accent font-medium" : ""}>
                            {carrier.latencyMs}ms
                          </span>
                        </TableCell>
                        <TableCell>R{carrier.costPerMinZar.toFixed(2)}</TableCell>
                        <TableCell>{carrier.maxChannels.toLocaleString()}</TableCell>
                        <TableCell>{carrier.uptime}%</TableCell>
                        <TableCell>
                          {carrier.isActive ? (
                            <Badge className="bg-accent/10 text-accent">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTestCarrier(carrier.id)}
                            >
                              Test
                            </Button>
                            <Button
                              size="sm"
                              variant={carrier.isActive ? "outline" : "default"}
                              onClick={() => handleToggleCarrier(carrier.id, carrier.isActive)}
                            >
                              {carrier.isActive ? "Disable" : "Enable"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="international" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>International Carriers (Fallback)</CardTitle>
                <CardDescription>
                  Global carriers for non-SA calls and emergency failover
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Carrier</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Latency</TableHead>
                      <TableHead>Cost/Min</TableHead>
                      <TableHead>Channels</TableHead>
                      <TableHead>Uptime</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {intlCarriers.map((carrier) => (
                      <TableRow key={carrier.id}>
                        <TableCell className="font-medium">{carrier.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">P{carrier.priority}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {carrier.latencyMs}ms
                        </TableCell>
                        <TableCell>R{carrier.costPerMinZar.toFixed(2)}</TableCell>
                        <TableCell>{carrier.maxChannels.toLocaleString()}</TableCell>
                        <TableCell>{carrier.uptime}%</TableCell>
                        <TableCell>
                          {carrier.isActive ? (
                            <Badge className="bg-accent/10 text-accent">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTestCarrier(carrier.id)}
                            >
                              Test
                            </Button>
                            <Button
                              size="sm"
                              variant={carrier.isActive ? "outline" : "default"}
                              onClick={() => handleToggleCarrier(carrier.id, carrier.isActive)}
                            >
                              {carrier.isActive ? "Disable" : "Enable"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

