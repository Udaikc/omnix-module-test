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
  const [investigationTarget, setInvestigationTarget] = useState<any | null>(null);
  const networkRef = useRef<Network | null>(null);
  const nodeHostMap = useRef<Record<string, any>>({});
  const selectedNodeRef = useRef<string | null>(null);

  const addNodeDetails = (uniqueId: string, details: any) => {
    if (!nodeHostMap.current[uniqueId]) {
      nodeHostMap.current[uniqueId] = details;
    }
  };

  const getNodeDetailsById = (uniqueId: string) => {
    return nodeHostMap.current[uniqueId] || null;
  };

  const resetStyling = () => {
    const network = networkRef.current;
    if (!network) return;

    network.body.data.nodes.forEach((node: any) => {
      const originalDetails = getNodeDetailsById(node.id);
      const isMalicious = originalDetails?.IsMalicious === true;
      network.body.data.nodes.update({
        id: node.id,
        borderWidth: 2,
        color: isMalicious
          ? { border: "red", background: "#7b7b7b" }
          : "#7b7b7b",
      });
    });

    network.body.data.nodes.update({
      id: "hostA",
      borderWidth: 2,
      color: { border: "red", background: "#7b7b7b" },
    });

    network.body.data.edges.forEach((edge: any) => {
      const fromDetails = getNodeDetailsById(edge.from);
      const toDetails = getNodeDetailsById(edge.to);
      const isEitherMalicious =
        fromDetails?.IsMalicious === true ||
        toDetails?.IsMalicious === true ||
        columnData.isHostAMalicious === "true";

      network.body.data.edges.update({
        id: edge.id,
        color: { color: isEitherMalicious ? "red" : "green" },
      });
    });
  };

  const handleNodeClick = (uniqueId: string) => {
    const network = networkRef.current;
    if (!network) return;

    resetStyling();

    const positions = network.getPositions([uniqueId]);
    const nodePosition = positions[uniqueId];
    if (nodePosition) {
      const { x, y } = network.canvasToDOM(nodePosition);
      const details = getNodeDetailsById(uniqueId);
      selectedNodeRef.current = uniqueId;
      setMenuPosition({ x, y });
      setInvestigationTarget(details);

      network.body.data.nodes.update({
        id: uniqueId,
        borderWidth: 4,
        color: { border: "cyan", background: "#7b7b7b" },
      });

      network.getConnectedEdges(uniqueId).forEach((edgeId) => {
        network.body.data.edges.update({
          id: edgeId,
          color: { color: "cyan" },
        });
      });

      network.body.data.nodes.update({
        id: "hostA",
        borderWidth: 4,
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

    const nodes = new DataSet<Node>([]);
    const edges = new DataSet<Edge>([]);

    EyeballProps.ColumnData.forEach((row) => {
      const {
        Server: hostB,
        Service: protocol,
        Port: serverPort,
        Provider: ispName,
        Organization: ispOrg,
        ASN: ispNo,
        Bytes: serverOctets,
        IsMalicious,
        DataDirection,
        Scope: scope,
      } = row;

      const uniqueId = uuidv4();

      const nodeDetails = {
        hostB,
        protocol,
        serverPort,
        ispName,
        ispOrg,
        ispNo,
        serverOctets,
        IsMalicious: IsMalicious === "true",
        DataDirection,
        scope,
      };

      addNodeDetails(uniqueId, nodeDetails);

      const nodeTitle = `Resolved Host: ${hostB}\nProtocol: ${protocol}\nPort: ${serverPort}\nISP: ${ispName}\nISP Org: ${ispOrg}\nISP No: ${ispNo}\nOctets: ${serverOctets}`;

      // Group nodes based on their 'scope' (Internal or External)
      const groupId = scope === "External" ? 1 : 2;

      nodes.add({
        id: uniqueId,
        label: hostB,
        title: nodeTitle,
        shape: "circularImage",
        image: scope === "External" ? "/external_server.png" : "/server.png",
        size: 20,
        borderWidth: 2,
        color: nodeDetails.IsMalicious
          ? { border: "red", background: "#7b7b7b" }
          : "#7b7b7b",
        group: groupId, // Assign group based on scope
      });

      const edgeColor = nodeDetails.IsMalicious || columnData.isHostAMalicious === "true" ? "red" : "green";
      const edgeBase = {
        width: serverOctets,
        color: { color: edgeColor },
        arrows: { middle: { enabled: true, scaleFactor: 1, type: "arrow" } },
      };

      if (DataDirection === "ToClient") {
        edges.add({ from: "hostA", to: uniqueId, ...edgeBase });
      } else if (DataDirection === "ToHost") {
        edges.add({ from: uniqueId, to: "hostA", ...edgeBase });
      } else if (DataDirection === "Both") {
        edges.add([
          { from: "hostA", to: uniqueId, ...edgeBase, smooth: { enabled: true, type: "dynamic", roundness: 0.4 } },
          { from: uniqueId, to: "hostA", ...edgeBase, smooth: { enabled: true, type: "dynamic", roundness: 0.4 } },
        ]);
      }
    });

    if (networkContainer.current) {
      const options = {
        interaction: { navigationButtons: true, keyboard: true },
        physics: { enabled: true, solver: "forceAtlas2Based" },
        groups: {
          1: { // External Group
            shape: "dot",
            color: { background: "blue", border: "darkblue" },
            label: "External",
          },
          2: { // Internal Group
            shape: "dot",
            color: { background: "green", border: "darkgreen" },
            label: "Internal",
          },
        },
      };

      networkRef.current = new Network(networkContainer.current, { nodes, edges }, options);

      // Adding hostA node (hostB)
      nodes.add({
        id: "hostA",
        label: "hostA",
        shape: "circularImage",
        image: "/file_slide.png",
        size: 50,
        borderWidth: 2,
        color: { border: "red", background: "#7b7b7b" },
        title: `Application: ${columnData.appId}\nGeoLocation: ${columnData.geoLocation}\nHost Group: ${columnData.hostGroupB}\nServer Volume: ${columnData.serverOctets}\nServer Port: ${columnData.serverPort}`,
        group: 2, // Assign hostA to the Internal group
      });

      setInvestigationTarget({
        hostB: "hostA",
        appId: columnData.appId,
        geoLocation: columnData.geoLocation,
        hostGroupB: columnData.hostGroupB,
        serverOctets: columnData.serverOctets,
        serverPort: columnData.serverPort,
      });

      networkRef.current.on("click", (event: any) => {
        if (event.nodes.length > 0) {
          const clickedNodeId = event.nodes[0];
          if (clickedNodeId === selectedNodeRef.current) {
            resetStyling();
            closeMenu();
            selectedNodeRef.current = null;
          } else {
            handleNodeClick(clickedNodeId);
          }
        } else {
          closeMenu();
          selectedNodeRef.current = null;
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
          selectedNode={selectedNodeRef.current}
          investigationTarget={investigationTarget}
          onClose={closeMenu}
        />
      )}
    </>
  );
};

export default NetworkGraph;
