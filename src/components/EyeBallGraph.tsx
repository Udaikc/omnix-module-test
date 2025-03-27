import React, { useEffect, useRef, useState } from "react";
import { DataSet, Network, type Node, type Edge } from "vis-network/standalone";
import { v4 as uuidv4 } from "uuid";
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
  const networkRef = useRef<Network | null>(null);

  const handleNodeClick = (nodeId: string) => {
    if (!networkRef.current) return;

    const positions = networkRef.current.getPositions([nodeId]);
    const nodePosition = positions[nodeId];

    if (nodePosition) {
      const { x, y } = networkRef.current.canvasToDOM(nodePosition);
      setSelectedNode(nodeId);
      setMenuPosition({ x, y });
    }
  };

  const closeMenu = () => setMenuPosition(null);

  useEffect(() => {
    if (!EyeballProps || !EyeballProps.ColumnData) return;

    const nodes = new DataSet<Node>([]);
    const edges = new DataSet<Edge>([]);
    const nodeMap: { [key: string]: string } = {};

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

      const meanBytes = 30000000.78;
      const edgeWidth = Bytes > meanBytes ? Math.min(1 + (Bytes - meanBytes) / meanBytes, 5) : 1;

      let nodeId = hostB;
      if (DataDirection === "ToClient") nodeId += " (Client)";
      if (DataDirection === "ToHost") nodeId += " (Host)";

      if (!nodeMap[nodeId]) {
        const uniqueId = uuidv4();
        nodeMap[nodeId] = uniqueId;

        nodes.add({
          id: uniqueId,
          title: nodeTitle,
          label: nodeId,
          shape: "circularImage",
          image: "/server.png",
          size: 20,
          borderWidth: 2,
          color: IsMalicious ? { border: "red", background: "#7b7b7b" } : "#7b7b7b",
        });
      }

      const uniqueId = nodeMap[nodeId];

      // **Check if the node is malicious**
      const nodeIsMalicious = IsMalicious || columnData.isHostAMalicious === "true";
      const edgeColor = nodeIsMalicious ? "red" : "green"; // ✅ Red if malicious, else green

      // Handling different DataDirection cases
      if (DataDirection === "ToClient") {
        edges.add({
          from: "hostA",
          to: uniqueId,
          width: edgeWidth,
          color: { color: edgeColor }, // ✅ Edge color based on malicious status
          arrows: { middle: true },
        });
      } else if (DataDirection === "ToHost") {
        edges.add({
          from: uniqueId,
          to: "hostA",
          width: edgeWidth,
          color: { color: edgeColor },
          arrows: { middle: true },
        });
      } else if (DataDirection === "Both") {
        // Create two overlapping edges for bidirectional traffic
        edges.add([
          {
            from: "hostA",
            to: uniqueId,
            width: edgeWidth,
            color: { color: edgeColor },
            arrows: { middle: true },
            smooth: { enabled: true, type: "line", roundness: 0.2 },
          },
          {
            from: uniqueId,
            to: "hostA",
            width: edgeWidth,
            color: { color: edgeColor },
            arrows: { middle: true },
            smooth: { enabled: true, type: "curvedCCW", roundness: 0.2 },
          },
        ]);
      }
    });


    if (networkContainer.current) {
      const options = {
        interaction: { navigationButtons: true, keyboard: true },
        physics: { enabled: true, solver: "forceAtlas2Based" },
        nodes: {
          size: 50,
          borderWidth: 2,
          color: { border: "#7b7b7b", background: "#7b7b7b" },
          font: { color: "#FFFFFF", size: 14 },
        },
        edges: {
          color: { color: "#848484" },
          arrows: "middle",
        },
      };

      networkRef.current = new Network(networkContainer.current, { nodes, edges }, options);

      const hostATitle = `Application: ${columnData.appId}\nGeo Location: ${columnData.geoLocation}\nHost Group: ${columnData.hostGroupB}\nVolume Total: ${columnData.serverOctets}\nServer Port: ${columnData.serverPort}`;

      nodes.add({
        id: "hostA",
        label: "hostA",
        shape: "circularImage",
        image: "/file_slide.png",
        size: 50,
        borderWidth: 2,
        color: { border: "red", background: "#7b7b7b" },
        title: hostATitle,
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
      {menuPosition && <NodeMenu position={menuPosition} selectedNode={selectedNode} onClose={closeMenu} />}
    </>
  );
};

export default NetworkGraph;