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
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

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

        network.getConnectedEdges(uniqueId).forEach((edgeId) => {
          network.body.data.edges.update({
            id: edgeId,
            color: { color: "cyan" },
          });
        });
      }
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
        Bytes,
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
      });

      const edgeWidth = Bytes;
      const edgeColor = nodeDetails.IsMalicious || columnData.isHostAMalicious === "true" ? "red" : "green";

      const edgeConfig = {
        from: DataDirection === "ToClient" ? "hostA" : uniqueId,
        to: DataDirection === "ToClient" ? uniqueId : "hostA",
        width: edgeWidth,
        color: { color: edgeColor },
        arrows: { middle: { enabled: true, scaleFactor: 1, type: "arrow" } },
      };

      // Apply the roundness to the edge when DataDirection is "Both"
      if (DataDirection === "Both") {
        const edgeConfigToClient = {
          ...edgeConfig,
          from: uniqueId,
          to: "hostA",
          smooth: {
            type: "dynamic",  // smooth curve
            roundness: 0.5,       // Adjust this value to control the roundness
          },
        };

        const edgeConfigFromClient = {
          ...edgeConfig,
          from: "hostA",
          to: uniqueId,
          smooth: {
            type: "dynamic",  // smooth curve
            roundness: 0.5,       // Adjust this value to control the roundness
          },
        };

        // Add both edges with dynamic roundness
        edges.add([edgeConfigToClient, edgeConfigFromClient]);
      } else {
        // Add the edge if the direction is not "Both"
        edges.add(edgeConfig);
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
        title: `Application: ${columnData.appId}\nGeoLocation: ${columnData.geoLocation}\nHost Group: ${columnData.hostGroupB}\nServer Volume: ${columnData.serverOctets}\nServer Port: ${columnData.serverPort}`,
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
          console.log(event.nodes);
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
          selectedNode={selectedNode}
          investigationTarget={investigationTarget}
          onClose={closeMenu}
        />
      )}
    </>
  );
};

export default NetworkGraph;
