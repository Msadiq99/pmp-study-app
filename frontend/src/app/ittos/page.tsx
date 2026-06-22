"use client";
import { useState, useEffect, useCallback } from "react";
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, Node, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ittos } from "@/lib/api";
import AppShell from "@/components/AppShell";
import { Info, BookOpen } from "lucide-react";

export default function ITTOsPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ittos.graph().then((res) => {
      setNodes(res.data.nodes);
      setEdges(res.data.edges);
      setLoading(false);
    });
  }, [setNodes, setEdges]);

  const onNodeClick = useCallback(async (event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setExplanation("Generating AI explanation...");
    try {
      const res = await ittos.explain(node.id);
      setExplanation(res.data.explanation);
    } catch (e) {
      setExplanation("Could not load explanation at this time.");
    }
  }, []);

  return (
    <AppShell>
      <div className="flex overflow-hidden" style={{ height: "calc(100vh - 57px)" }}>
        {/* Legend bar */}
        <div className="absolute top-2 right-4 z-50 flex gap-3">
          {[["#10b981","Inputs"],["#f59e0b","Tools"],["#ef4444","Outputs"],["#3b82f6","Processes"]].map(([c,l]) => (
            <div key={l} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "var(--color-muted-foreground)" }}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: c }}></span> {l}
            </div>
          ))}
        </div>

        {/* Graph Canvas */}
        <div className="flex-1 h-full relative" style={{ background: "var(--color-background)" }}>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-12 h-12 rounded-2xl animate-pulse-glow" style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }} />
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              fitView
              attributionPosition="bottom-left"
              style={{ background: "transparent" }}
            >
              <Background color="rgba(255,255,255,0.05)" gap={24} />
              <Controls />
              <MiniMap
                style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
                nodeColor={(node) => {
                  switch (node.data?.category) {
                    case "Input": return "#10b981";
                    case "Tool": return "#f59e0b";
                    case "Output": return "#ef4444";
                    case "Process": return "#3b82f6";
                    default: return "#334155";
                  }
                }}
              />
            </ReactFlow>
          )}
        </div>

        {/* Info Sidebar */}
        <div className="w-80 shrink-0 p-5 flex flex-col overflow-y-auto"
          style={{ background: "var(--color-surface)", borderLeft: "1px solid var(--color-border)" }}>
          {selectedNode ? (
            <div className="animate-slide-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl text-white" style={{
                  background: selectedNode.data.category === "Input" ? "#10b981" :
                    selectedNode.data.category === "Tool" ? "#f59e0b" :
                    selectedNode.data.category === "Output" ? "#ef4444" : "#3b82f6",
                }}>
                  <BookOpen size={18} />
                </div>
                <div>
                  <h2 className="font-bold leading-tight" style={{ color: "var(--color-foreground)" }}>{selectedNode.data.label as string}</h2>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-muted-foreground)" }}>{selectedNode.data.category as string}</span>
                </div>
              </div>

              <div className="rounded-xl p-4 mb-4" style={{
                background: "linear-gradient(135deg,rgba(99,102,241,0.15),rgba(99,102,241,0.05))",
                border: "1px solid rgba(99,102,241,0.3)",
              }}>
                <div className="flex items-center gap-2 font-bold mb-2" style={{ color: "#818cf8" }}>
                  <Info size={14} /> AI Explanation
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "var(--color-foreground)" }}>{explanation}</p>
              </div>

              {Boolean(selectedNode.data.description) && (
                <div className="inset-panel">
                  <h3 className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: "var(--color-muted-foreground)" }}>PMBOK Description</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-foreground)" }}>{String(selectedNode.data.description ?? "")}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Info size={40} style={{ color: "var(--color-muted-foreground)", opacity: 0.2 }} className="mb-4" />
              <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>Click any node to see AI context and PMBOK definitions.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
