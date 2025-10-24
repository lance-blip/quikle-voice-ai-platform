import { useCallback, useState, useEffect } from "react";
import { useRoute } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { Save, Play, ArrowLeft, Plus } from "lucide-react";
import { Link } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const nodeTypes = {
  start: { label: "Start", color: "bg-accent", icon: "▶" },
  message: { label: "Message", color: "bg-primary", icon: "💬" },
  question: { label: "Question", color: "bg-secondary", icon: "❓" },
  condition: { label: "Condition", color: "bg-yellow-500", icon: "🔀" },
  action: { label: "Action", color: "bg-purple-500", icon: "⚡" },
  api: { label: "API Call", color: "bg-blue-500", icon: "🔗" },
  transfer: { label: "Transfer", color: "bg-orange-500", icon: "📞" },
  end: { label: "End", color: "bg-red-500", icon: "⏹" },
};

const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    data: { label: "Start" },
    position: { x: 250, y: 25 },
    style: { background: "#41B3A3", color: "white", border: "2px solid #2C8A7E" },
  },
];

const initialEdges: Edge[] = [];

export default function AgentFlowEditor() {
  const [, params] = useRoute("/agents/:id/edit");
  const agentId = params?.id ? Number(params.id) : null;

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodeConfig, setNodeConfig] = useState({
    label: "",
    message: "",
    variable: "",
  });

  const { data: agent, refetch } = trpc.agents.get.useQuery(
    { id: agentId || 0 },
    { enabled: !!agentId }
  );

  const updateMutation = trpc.agents.update.useMutation({
    onSuccess: () => {
      toast.success("Flow saved successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save flow");
    },
  });

  // Load flow data when agent is loaded
  useEffect(() => {
    if (agent?.flowData) {
      try {
        const flowData = JSON.parse(agent.flowData);
        if (flowData.nodes) setNodes(flowData.nodes);
        if (flowData.edges) setEdges(flowData.edges);
      } catch (error) {
        console.error("Failed to parse flow data:", error);
      }
    }
  }, [agent, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setNodeConfig({
      label: node.data.label || "",
      message: node.data.message || "",
      variable: node.data.variable || "",
    });
  }, []);

  const addNode = (type: keyof typeof nodeTypes) => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type: type === "start" ? "input" : type === "end" ? "output" : "default",
      data: { label: nodeTypes[type].label },
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 100 },
      style: {
        background: nodeTypes[type].color.replace("bg-", "#"),
        color: "white",
        border: "2px solid rgba(0,0,0,0.2)",
        borderRadius: "8px",
        padding: "10px",
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const updateNodeData = () => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? { ...node, data: { ...node.data, ...nodeConfig } }
          : node
      )
    );
    toast.success("Node updated");
  };

  const saveFlow = () => {
    if (!agentId) return;
    const flowData = JSON.stringify({ nodes, edges });
    updateMutation.mutate({
      id: agentId,
      flowData,
    });
  };

  if (!agentId) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Invalid agent ID</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/agents">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{agent?.name || "Loading..."}</h1>
              <p className="text-sm text-muted-foreground">Visual Flow Editor</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Test
            </Button>
            <Button size="sm" onClick={saveFlow} disabled={updateMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Save Flow"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Node Palette */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">Add Nodes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(nodeTypes).map(([key, value]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => addNode(key as keyof typeof nodeTypes)}
                >
                  <span className="mr-2">{value.icon}</span>
                  {value.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Flow Canvas */}
          <div className="col-span-7 h-[calc(100vh-200px)] border rounded-lg bg-card">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              fitView
            >
              <Controls />
              <MiniMap />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
          </div>

          {/* Node Properties */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle className="text-sm">Node Properties</CardTitle>
              <CardDescription>
                {selectedNode ? `Editing: ${selectedNode.data.label}` : "Select a node to edit"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedNode ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Label</Label>
                    <Input
                      value={nodeConfig.label}
                      onChange={(e) => setNodeConfig({ ...nodeConfig, label: e.target.value })}
                      placeholder="Node label"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea
                      value={nodeConfig.message}
                      onChange={(e) => setNodeConfig({ ...nodeConfig, message: e.target.value })}
                      placeholder="What should the agent say?"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Variable Name</Label>
                    <Input
                      value={nodeConfig.variable}
                      onChange={(e) => setNodeConfig({ ...nodeConfig, variable: e.target.value })}
                      placeholder="e.g., customer_name"
                    />
                  </div>
                  <Button onClick={updateNodeData} className="w-full">
                    Update Node
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Click on a node to edit its properties
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

