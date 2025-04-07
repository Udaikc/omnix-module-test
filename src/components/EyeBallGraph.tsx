import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { DataSet, Network, Node, Edge } from "vis-network/standalone";
import "vis-network/styles/vis-network.css";
import NodeMenu from "./NodeMenu";
import "./styles/NetworkContainer.css";

import { addNodeDetails, resetStyling } from "./utils/networkUtils";
import { createNode, createEdges } from "./utils/graphBuilder";
import { handleNodeClick } from "./utils/handleNodeClick";

interface NetworkGraphProps {
  EyeballProps: { ColumnData: any[] } | null;
  columnData: {
    appId: string;
    geoLocation: string;
    hostGroupB: string;
    serverOctets: string;
    serverPort: string;
    isHostAMalicious?: string; // optional property
  };
}

const EyeballGraph: React.FC<NetworkGraphProps> = ({ EyeballProps, columnData }) => {
  const networkContainer = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const nodeHostMap = useRef<Record<string, any>>({});
  const selectedNodeRef = useRef<string | null>(null);

  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
<<<<<<< HEAD

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

    if (uniqueId === "hostA") {
      // Special handling for HostA
      const positions = network.getPositions(["hostA"]);
      const nodePosition = positions["hostA"];
      if (nodePosition) {
        const { x, y } = network.canvasToDOM(nodePosition);
        setMenuPosition({ x, y });
        setInvestigationTarget({
          hostB: "hostA",
          appId: columnData.appId,
          geoLocation: columnData.geoLocation,
          hostGroupB: columnData.hostGroupB,
          serverOctets: columnData.serverOctets,
          serverPort: columnData.serverPort,
        });
        setSelectedNode("hostA");

        network.body.data.nodes.update({
          id: "hostA",
          borderWidth: 4,
          color: { border: "cyan", background: "#7b7b7b" },
        });

        network.body.data.edges.forEach((edge: any) => {
          if (edge.from === "hostA" || edge.to === "hostA") {
            network.body.data.edges.update({
              id: edge.id,
              color: { color: "cyan" },
            });
          }
        });
      }
    } else {
      // Regular node click handling
      const positions = network.getPositions([uniqueId]);
      const nodePosition = positions[uniqueId];
      if (nodePosition) {
        const { x, y } = network.canvasToDOM(nodePosition);
        const details = getNodeDetailsById(uniqueId);
        selectedNodeRef.current = uniqueId;
        setMenuPosition({ x, y });
        setInvestigationTarget(details);
        setSelectedNode(details.hostB);

        network.body.data.nodes.update({
          id: uniqueId,
          borderWidth: 4,
          color: { border: "cyan", background: "#7b7b7b" },
        });

        network.body.data.nodes.update({
          id: "hostA",
          borderWidth: 4,
          color: { border: "cyan", background: "#7b7b7b" },
        });

        network.getConnectedEdges(uniqueId).forEach((edgeId) => {
          network.body.data.edges.update({
            id: edgeId,
            color: { color: "cyan" },
          });
        });
      }
    }
  };

=======
  const [investigationTarget, setInvestigationTarget] = useState<any | null>(null);
>>>>>>> hostA

  const closeMenu = () => {
    setMenuPosition(null);
    setInvestigationTarget(null);
  };

  const handleNodeClickWrapper = (uniqueId: string) => {
    const network = networkRef.current;
    if (network) {
      handleNodeClick({
        uniqueId,
        network: network,
        nodeHostMap: nodeHostMap.current,
        columnData,
        setMenuPosition,
        setInvestigationTarget,
        setSelectedNode,
        selectedNodeRef,
      });
    }
  };

  useEffect(() => {
    if (!EyeballProps?.ColumnData) return;

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
        Bytes,
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
        serverOctets: Bytes,
        IsMalicious: IsMalicious === "true",
        DataDirection,
        scope,
      };

      addNodeDetails(nodeHostMap.current, uniqueId, nodeDetails);

      const node = createNode(uniqueId, nodeDetails);
      const edgeList = createEdges(
        uniqueId,
        Bytes,
        DataDirection,
        nodeDetails.IsMalicious || columnData.isHostAMalicious === "true"
      );

      nodes.add(node);
      edges.add(edgeList);
    });

    if (networkContainer.current) {
      const options = {
        interaction: { navigationButtons: true, keyboard: true },
        physics: { enabled: true, solver: "forceAtlas2Based" },
      };

      networkRef.current = new Network(networkContainer.current, { nodes, edges }, options);

      const hostANode: Node = {
        id: "hostA",
        label: "hostA",
        shape: "circularImage",
        image: "/file_slide.png",
        size: 50,
        borderWidth: 2,
        color: { border: "red", background: "#7b7b7b" },
        title: `Application: ${columnData.appId}
GeoLocation: ${columnData.geoLocation}
Host Group: ${columnData.hostGroupB}
Server Volume: ${columnData.serverOctets}
Server Port: ${columnData.serverPort}`,
      };

      nodes.add(hostANode);
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
            resetStyling(networkRef.current!, nodeHostMap.current, columnData);
            closeMenu();
            selectedNodeRef.current = null;
          } else {
            handleNodeClickWrapper(clickedNodeId);
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
      {menuPosition && investigationTarget && (
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

export default EyeballGraph;
