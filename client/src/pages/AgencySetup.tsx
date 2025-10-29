import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Building2, ArrowRight, Loader2 } from "lucide-react";

export default function AgencySetup() {
  const [, setLocation] = useLocation();
  const [agencyName, setAgencyName] = useState("");
  const [logo, setLogo] = useState("");
  const [customDomain, setCustomDomain] = useState("");

  const createAgencyMutation = trpc.agency.create.useMutation({
    onSuccess: () => {
      toast.success("Agency created successfully!");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(`Failed to create agency: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyName.trim()) {
      toast.error("Agency name is required");
      return;
    }
    createAgencyMutation.mutate({
      name: agencyName,
      logo: logo || undefined,
      customDomain: customDomain || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-midnight/5 via-teal/5 to-coral/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-teal to-midnight flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl">Welcome to Quikle Voice!</CardTitle>
          <CardDescription className="text-base mt-2">
            Let's set up your agency profile to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="agencyName">
                Agency Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="agencyName"
                placeholder="e.g., Acme Voice Solutions"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                This will be displayed to your clients and in your dashboard.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL (Optional)</Label>
              <Input
                id="logo"
                placeholder="https://example.com/logo.png"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Add your agency logo for white-label branding.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customDomain">Custom Domain (Optional)</Label>
              <Input
                id="customDomain"
                placeholder="voice.youragency.com"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Configure a custom domain for your white-labeled platform.
              </p>
            </div>

            <div className="bg-teal/10 border border-teal/20 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">What's Next?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Create client accounts to organize your agents</li>
                <li>• Build voice agents with our visual flow editor</li>
                <li>• Connect phone numbers and start handling calls</li>
                <li>• Monitor performance with real-time analytics</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1"
                disabled={createAgencyMutation.isPending}
              >
                {createAgencyMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Agency
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/dashboard")}
              >
                Skip for Now
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

