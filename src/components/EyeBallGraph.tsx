// NetworkGraph.tsx
import React, { useEffect, useRef, useState } from 'react';
import { DataSet, Network, type Node, type Edge } from 'vis-network/standalone';
import { v4 as uuidv4 } from 'uuid';
import 'vis-network/styles/vis-network.css';
import NodeMenu from './NodeMenu';
import './styles/NetworkContainer.css' // Separate component for node menu

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
    const nodeMap: { [hostB: string]: string } = {};

    EyeballProps?.ColumnData.forEach((row) => {
      const hostB = row.Server; // Using server as hostB, as that's the closest equivalent.
      const protocol = row.Service; // Using service as protocol
      const serverPort = row.Port;
      const ispName = row.Provider; // Using Provider as ispName
      const ispOrg = row.Organization;
      const ispNo = row.ASN;
      const serverOctets = row.Bytes;
      const IsMalicious = row.IsMalicious === "true"; // Convert to boolean

      const nodeTitle = `Resolved Host: ${hostB}\n` +
        `Protocol: ${protocol}\n` +
        `Port: ${serverPort}\n` +
        `ISP: ${ispName}\n` +
        `ISP Org: ${ispOrg}\n` +
        `ISP No: ${ispNo}\n` +
        `Octets: ${serverOctets}`;

      if (!nodeMap[hostB]) {
        const uniqueId = uuidv4();
        nodeMap[hostB] = uniqueId;
        nodes.add({
          id: uniqueId,
          title: nodeTitle,
          label: hostB,
          shape: 'circularImage',
          image: '/server.png',
          size: 20,
          borderWidth: 2,
          color: IsMalicious ? { border: 'red', background: '#7b7b7b' } : '#7b7b7b',
        });
        edges.add({ from: 'hostA', to: uniqueId });
      }
    });


    if (networkContainer.current) {
      const options = {
        interaction: { navigationButtons: true, keyboard: true },
        physics: { enabled: true, solver: 'barnesHut' },
        nodes: {
          size: 50,
          borderWidth: 2,
          color: { border: '#7b7b7b', background: '#7b7b7b' },
          font: { color: '#FFFFFF', size: 14 },
        },
        edges: {
          color: { color: '#848484' },
          arrows: 'middle', // Adds arrows at the middle of edges
        },
      };


      networkRef.current = new Network(networkContainer.current, { nodes, edges }, options);


      // Constructing the title string using columnData mappings
      const hostATitle = `
      Application: ${columnData.appId}
      Geo Location: ${columnData.geoLocation}
      Host Group: ${columnData.hostGroupB}
      Volume Total: ${columnData.serverOctets}
      Server Port: ${columnData.serverPort}
`;

      // Adding the 'hostA' node with detailed information
      nodes.add({
        id: 'hostA',
        label: 'hostA',
        shape: 'circularImage',
        image: '/file_slide.png',
        size: 50,
        borderWidth: 2,
        color: { border: 'red', background: '#7b7b7b' },
        title: hostATitle, // This will display the details on hover
      });

      networkRef.current.on('click', (event: any) => {
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
      <div
        ref={networkContainer}
        className='network-container'
      />

      {menuPosition && (
        <NodeMenu
          position={menuPosition}
          selectedNode={selectedNode}
          onClose={closeMenu}
        />
      )}
    </>
  );
};

export default NetworkGraph;