/**
 * NetworkGraph Component
 *
 * This component visualizes a network graph using vis-network, representing a host ("hostA") and its
 * connections to various servers ("hostB") based on network traffic data. Each connection's attributes,
 * such as protocol, port, ISP, and data direction, are displayed.
 *
 * @module NetworkGraph
 * @requires react
 * @requires uuidv4
 * @requires vis-network/standalone
 * @requires "vis-network/styles/vis-network.css"
 * @requires NodeMenu
 */

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

/**
 * Props for NetworkGraph Component
 * @typedef {Object} NetworkGraphProps
 * @property {{ ColumnData: any[] } | null} EyeballProps - Data containing network connections.
 * @property {Record<string, string>} columnData - Metadata for "hostA", including application ID and malicious status.
 */

/**
 * NetworkGraph React Functional Component
 *
 * @param {NetworkGraphProps} props - Component properties.
 * @returns {JSX.Element} The network graph visualization.
 */

const NetworkGraph: React.FC<NetworkGraphProps> = ({ EyeballProps, columnData }) => {
  const networkContainer = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [investigationTarget, setInvestigationTarget] = useState<string | null>(null);
  const networkRef = useRef<Network | null>(null);
  const nodeHostMap = useRef<Record<string, string>>({}); // Maps node IDs to HostB values


  /**
   * Handles node click event.
   * Opens a menu with investigation options for a selected node.
   *
   * @param {string} nodeId - ID of the clicked node.
   */


  const handleNodeClick = (nodeId: string) => {
    if (!networkRef.current) return;

    let targetLabel = nodeId; // Default to node ID
    if (nodeId === "hostA") {
      targetLabel = `Investigate HostA - ${columnData.appId}`; // Use HostA's application ID
    } else {
      targetLabel = nodeHostMap.current[nodeId] || nodeId; // Use HostB if available
    }

    const positions = networkRef.current.getPositions([nodeId]);
    const nodePosition = positions[nodeId];
    if (nodePosition) {
      const { x, y } = networkRef.current.canvasToDOM(nodePosition);
      setSelectedNode(targetLabel);
      setMenuPosition({ x, y });
      setInvestigationTarget(targetLabel);
    }
  };

  /**
   * Closes the node menu.
   */

  const closeMenu = () => {
    setMenuPosition(null);
    setInvestigationTarget(null);
  };

  useEffect(() => {
    if (!EyeballProps || !EyeballProps.ColumnData) return;

    const nodes = new DataSet<Node>([]);
    const edges = new DataSet<Edge>([]);
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

  /**
   * Took the details from the Row iteration of the HostB array informatio.
   */

      const nodeTitle = `Resolved Host: ${hostB}\nProtocol: ${protocol}\nPort: ${serverPort}\nISP: ${ispName}\nISP Org: ${ispOrg}\nISP No: ${ispNo}\nOctets: ${serverOctets};`;


      const uniqueId = uuidv4();
      nodeHostMap.current[uniqueId] = hostB;

      nodes.add({
        id: uniqueId,
        title: nodeTitle,
        label: hostB,
        shape: "circularImage",
        image: "/server.png",
        size: 20,
        borderWidth: 2,
        color: row.IsMalicious === "true" ? { border: "red", background: "#7b7b7b" } : "#7b7b7b",
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
      };

      networkRef.current = new Network(networkContainer.current, { nodes, edges }, options);

      nodes.add({
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
