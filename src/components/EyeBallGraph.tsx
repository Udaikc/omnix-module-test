import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { DataSet, Network, type Node, type Edge } from "vis-network/standalone";
import "vis-network/styles/vis-network.css";
import NodeMenu from "./NodeMenu";
import "./styles/NetworkContainer.css";

interface NetworkGraphProps {
  EyeballProps: { ColumnData: any[] } | null;
  columnData: Record<string, string>;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ EyeballProps, columnData }) => {
  const networkContainer = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [investigationTarget, setInvestigationTarget] = useState<string | null>(null);
  const networkRef = useRef<Network | null>(null);
  const nodeHostMap = useRef<Record<string, string>>({});
  const nodes = useRef<DataSet<Node> | null>(null);
  const edges = useRef<DataSet<Edge> | null>(null);

  const handleNodeClick = (nodeId: string) => {
    if (!networkRef.current || !nodes.current || !edges.current) return;

    // Reset all node colors and edges
    const allNodes = nodes.current.get();
    const allEdges = edges.current.get();

    // Set all nodes to default color
    allNodes.forEach((node) => {
      nodes.current?.update({
        id: node.id,
        color: node.id === "hostA" ? { border: "red", background: "#7b7b7b" } : "#7b7b7b",
        borderWidth: 2,
      });
    });

    // Set all edges to default color
    allEdges.forEach((edge) => {
      edges.current?.update({
        id: edge.id,
        color: { color: edge.color === "red" ? "red" : "green" },
      });
    });

    let targetLabel = nodeId;
    if (nodeId === "hostA") {
      targetLabel = `Investigate HostA - ${columnData.appId}`;
    } else {
      targetLabel = nodeHostMap.current[nodeId] || nodeId;
    }

    const positions = networkRef.current.getPositions([nodeId]);
    const nodePosition = positions[nodeId];

    if (nodePosition) {
      const { x, y } = networkRef.current.canvasToDOM(nodePosition);
      setSelectedNode(targetLabel);
      setMenuPosition({ x, y });
      setInvestigationTarget(targetLabel);
    }

    // Highlight the clicked node border in cyan
    nodes.current?.update({
      id: nodeId,
      color: { border: "cyan", background: "#7b7b7b" },
      borderWidth: 4,
    });

    // Highlight connected edges to HostA or to the clicked node in cyan
    const connectedEdges = networkRef.current.getConnectedEdges(nodeId);
    connectedEdges.forEach((edgeId) => {
      edges.current?.update({
        id: edgeId,
        color: { color: "cyan" },
      });
    });

    // Highlight HostA node in cyan if connected
    if (nodeId !== "hostA") {
      nodes.current?.update({
        id: "hostA",
        color: { border: "cyan", background: "#7b7b7b" },
      });
    }
  };

  const closeMenu = () => {
    setMenuPosition(null);
    setInvestigationTarget(null);
  };

  useEffect(() => {
    if (!EyeballProps || !EyeballProps.ColumnData) return;

    nodes.current = new DataSet<Node>([]);
    edges.current = new DataSet<Edge>([]);
    const meanBytes = 30000000.78;

    EyeballProps.ColumnData.forEach((row) => {
      const hostB = row.Server;
      const protocol = row.Service;
      const serverPort = row.Port;
      const ispName = row.Provider;
      const ispOrg = row.Organization;
      const ispNo = row.ASN;
      const serverOctets = row.Bytes;
      const IsMalicious = row.IsMalicious === "true";
      const Bytes = row.Bytes;
      const DataDirection = row.DataDirection;

      const nodeTitle = `Resolved Host: ${hostB}\nProtocol: ${protocol}\nPort: ${serverPort}\nISP: ${ispName}\nISP Org: ${ispOrg}\nISP No: ${ispNo}\nOctets: ${serverOctets};`;

      const uniqueId = uuidv4();
      nodeHostMap.current[uniqueId] = hostB;

      nodes.current?.add({
        id: uniqueId,
        title: nodeTitle,
        label: hostB,
        shape: "circularImage",
        image: "/server.png",
        size: 20,
        borderWidth: 2,
        color: row.IsMalicious === "true" ? { border: "red", background: "#7b7b7b" } : "#7b7b7b",
      });

      const edgeWidth = Bytes > meanBytes ? Math.min(1 + (Bytes - meanBytes) / meanBytes, 5) : 1;
      const edgeColor = IsMalicious ? "red" : "green"; // Corrected edge color logic

      if (DataDirection === "ToClient") {
        edges.current?.add({
          from: "hostA",
          to: uniqueId,
          width: edgeWidth,
          color: { color: edgeColor },
          arrows: { middle: { enabled: true, scaleFactor: 1, type: "arrow" } },
        });
      } else if (DataDirection === "ToHost") {
        edges.current?.add({
          from: uniqueId,
          to: "hostA",
          width: edgeWidth,
          color: { color: edgeColor },
          arrows: { middle: { enabled: true, scaleFactor: 1 } },
        });
      } else if (DataDirection === "Both") {
        edges.current?.add([
          {
            from: "hostA",
            to: uniqueId,
            width: edgeWidth,
            color: { color: edgeColor },
            arrows: { middle: { enabled: true, scaleFactor: 1, type: "arrow" } },
            smooth: { enabled: true, type: "dynamic", roundness: 0.4 },
          },
          {
            from: uniqueId,
            to: "hostA",
            width: edgeWidth,
            color: { color: edgeColor },
            arrows: { middle: { enabled: true, scaleFactor: 1, type: "arrow" } },
            smooth: { enabled: true, type: "dynamic", roundness: 0.4 },
          },
        ]);
      }
    });

    if (networkContainer.current && nodes.current && edges.current) {
      const options = {
        interaction: { navigationButtons: true, keyboard: true },
        physics: { enabled: true, solver: "forceAtlas2Based" },
      };

      networkRef.current = new Network(networkContainer.current, { nodes: nodes.current, edges: edges.current }, options);

      nodes.current?.add({
        id: "hostA",
        label: "hostA",
        shape: "circularImage",
        image: "/file_slide.png",
        size: 50,
        borderWidth: 2,
        color: { border: "red", background: "#7b7b7b" },
        title: `Application: ${columnData.appId}`,
      });

      networkRef.current.on("click", (event: any) => {
        if (event.nodes.length > 0) {
          handleNodeClick(event.nodes[0]);
        } else {
          closeMenu();
        }
      });
    }
  }, [EyeballProps, columnData]);

  return (
    <>
      <div ref={networkContainer} className="network-container" />
      {menuPosition && (
        <NodeMenu
          position={menuPosition}
          selectedNode={selectedNode}
          investigationTarget={investigationTarget}
          onClose={closeMenu}
        />
      )}
    </>
  );
};

export default NetworkGraph;