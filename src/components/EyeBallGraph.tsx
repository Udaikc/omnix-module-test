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
  const [investigationTarget, setInvestigationTarget] = useState<any | null>(null); // Store HostA details
  const networkRef = useRef<Network | null>(null);
  const nodeHostMap = useRef<Record<string, any>>({}); // Store node details

  // Method to add node details to nodeHostMap
  const addNodeDetails = (uniqueId: string, details: any) => {
    if (!nodeHostMap.current[uniqueId]) {
      nodeHostMap.current[uniqueId] = details;
    }
  };

  // Method to get node details by uniqueId
  const getNodeDetailsById = (uniqueId: string) => {
    const nodeDetails = nodeHostMap.current[uniqueId];
    if (nodeDetails) {
      return nodeDetails;
    }
    return null;
  };

  const resetStyling = () => {
    const network = networkRef.current;
    if (!network) return;

    // Reset all nodes
    network.body.data.nodes.forEach((node: any) => {
      const originalDetails = getNodeDetailsById(node.id);
      const isMalicious = originalDetails?.IsMalicious === true;

      network.body.data.nodes.update({
        id: node.id,
        borderWidth: 2,
        color: isMalicious
          ? { border: "red", background: "#7b7b7b" }
          : "#7b7b7b", // this matches your existing condition
      });

      network.body.data.nodes.update({
        id: "hostA",
        borderWidth: 2,
        color:
          { border: "red", background: "#7b7b7b" }
      });
    });



    // Reset all edges
    network.body.data.edges.forEach((edge: any) => {
      const fromDetails = getNodeDetailsById(edge.from);
      const toDetails = getNodeDetailsById(edge.to);
      const isEitherMalicious =
        fromDetails?.IsMalicious === true || toDetails?.IsMalicious === true || columnData.isHostAMalicious === "true";

      network.body.data.edges.update({
        id: edge.id,
        color: { color: isEitherMalicious ? "red" : "green" },
      });
    });
  };

  // Handle node click to display the menu and pass the details to NodeMenu
  const handleNodeClick = (uniqueId: string) => {
    const network = networkRef.current;
    if (!network) return;

    // If the clicked node is already selected, deselect it
    if (selectedNode === uniqueId) {
      resetStyling();
      closeMenu();
      setSelectedNode(null);
      return;
    }

    resetStyling(); // Reset styles before applying new highlights

    const positions = network.getPositions([uniqueId]);
    const nodePosition = positions[uniqueId];
    if (nodePosition) {
      const { x, y } = network.canvasToDOM(nodePosition);
      const details = getNodeDetailsById(uniqueId);

      if (details) {
        setSelectedNode(uniqueId); // Store the unique node ID here now
      }

      setMenuPosition({ x, y });
      setInvestigationTarget(details);

      // Highlight clicked node
      network.body.data.nodes.update([
        {
          id: uniqueId,
          borderWidth: 4,
          color: { border: "cyan", background: "#7b7b7b" },
        },
      ]);

      // Highlight connected edges
      network.getConnectedEdges(uniqueId).forEach((edgeId) => {
        network.body.data.edges.update({
          id: edgeId,
          color: { color: "cyan" },
        });
      });

      // Highlight hostA
      network.body.data.nodes.update([
        {
          id: "hostA",
          borderWidth: 4,
          color: { border: "cyan", background: "#7b7b7b" },
        },
      ]);
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
      const scope = row.Scope;

      const nodeTitle = `Resolved Host: ${hostB}\nProtocol: ${protocol}\nPort: ${serverPort}\nISP: ${ispName}\nISP Org: ${ispOrg}\nISP No: ${ispNo}\nOctets: ${serverOctets};`;

      const uniqueId = uuidv4();

      // Store node details in the map
      const nodeDetails = {
        hostB,
        protocol,
        serverPort,
        ispName,
        ispOrg,
        ispNo,
        serverOctets,
        IsMalicious,
        DataDirection,
        scope,
      };
      addNodeDetails(uniqueId, nodeDetails); // Add details to map

      nodes.add({
        id: uniqueId,
        label: hostB,
        title: nodeTitle,
        shape: "circularImage",
        image: scope === "External" ? "/external_server.png" : "/server.png",
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
        edges.add([{
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
        }
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
        image: "/file_slide.png", // You can update this image based on hostA type or other attributes if needed
        size: 50,
        borderWidth: 2,
        color: { border: "red", background: "#7b7b7b" }, // You can customize the color based on status or other criteria
        title:
          `Application: ${columnData.appId}\nGeoLocation: ${columnData.geoLocation}\nHost Group: ${columnData.hostGroupB}\nServer Volume: ${columnData.serverOctets}\nServer Port: ${columnData.serverPort}`, // Display all details in the tooltip
      });

      // Store HostA details
      const hostADetails = {
        hostB: "hostA",
        // Add any details specific to HostA
        appId: columnData.appId,
        geoLocation: columnData.geoLocation,
        hostGroupB: columnData.hostGroupB,
        serverOctets: columnData.serverOctets,
        serverPort: columnData.serverPort,
      };
      setInvestigationTarget(hostADetails); // Set HostA as the initial investigation target

      networkRef.current.on("click", (event: any) => {
        if (event.nodes.length > 0) {
          handleNodeClick(event.nodes[0]); // use ID directly
        } else {
          resetStyling();
          closeMenu();
          setSelectedNode(null);
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
          selectedNode={selectedNode} // Send server (hostB) as selectedNode
          investigationTarget={investigationTarget} // Send HostA details as investigation target
          onClose={closeMenu}
        />
      )}
    </>
  );
};

export default NetworkGraph;
