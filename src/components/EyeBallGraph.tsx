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
    const meanBytes = 30000000.78; // Used for edge width calculation

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

      const uniqueId = uuidv4();// Generate a truly unique ID

      console.log(hostB + "-" + uniqueId);

      nodes.add({
        id: uniqueId,
        title: nodeTitle,
        label: hostB,
        shape: "circularImage",
        image: "/server.png",
        size: 20,
        borderWidth: 2,
        color: IsMalicious ? { border: "red", background: "#7b7b7b" } : "#7b7b7b",
      });

      // Edge Width Calculation
      const edgeWidth = Bytes > meanBytes ? Math.min(1 + (Bytes - meanBytes) / meanBytes, 5) : 1;
      const edgeColor = IsMalicious || columnData.isHostAMalicious === "true" ? "red" : "green";

      if (DataDirection === "ToClient") {
        edges.add({
          from: "hostA",
          to: uniqueId,
          width: edgeWidth,
          color: { color: edgeColor },
          arrows: { middle: { enabled: true, scaleFactor: 1, type: "arrow" } },
        });
      } else if (DataDirection === "ToHost") {
        edges.add({
          from: uniqueId,
          to: "hostA",
          width: edgeWidth,
          color: { color: edgeColor },
          arrows: { middle: { enabled: true, scaleFactor: 1 } },
        });
      } else if (DataDirection === "Both") {
        edges.add([
          {
            from: "hostA",
            to: uniqueId,
            width: edgeWidth,
            color: { color: edgeColor },
            arrows: { middle: { enabled: true, scaleFactor: 1, type: "arrow" } },
            smooth: { enabled: true, type: "dynamic", roundness: 0.4 }, // Stronger CCW Curve
          },
          {
            from: uniqueId,
            to: "hostA",
            width: edgeWidth,
            color: { color: edgeColor },
            arrows: { middle: { enabled: true, scaleFactor: 1, type: "arrow" } },
            smooth: { enabled: true, type: "dynamic", roundness: 0.4 }, // Stronger CW Curve
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
          arrows: {
            middle: {
              enabled: true,
              scaleFactor: 1,
              type: "arrow",
              color: "#FFFFFF" // Custom arrow color
            },
          }
        },
      };

      console.log("Total number of nodes:", nodes.length);

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

      console.log("Total number of nodes:", nodes.length);

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
