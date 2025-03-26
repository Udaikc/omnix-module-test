/**
 * EyeballGraph Component
 *
 * This component visualizes network data using the vis-network library.
 * It displays nodes and edges, highlighting malicious nodes and dynamically adjusting edge widths.
 *
 * @module NetworkGraph
 */

import React, { useEffect, useRef, useState } from 'react';
import { DataSet, Network, type Node, type Edge } from 'vis-network/standalone';
import { v4 as uuidv4 } from 'uuid';
import 'vis-network/styles/vis-network.css';
import NodeMenu from './NodeMenu';
import './styles/NetworkContainer.css';

/**
 * Props for the NetworkGraph component
 *
 * @typedef {Object} NetworkGraphProps
 * @property {{ ColumnData: any[] } | null} EyeballProps - Contains network data
 * @property {Record<string, string>} columnData - Mapped column data
 */

interface NetworkGraphProps {
  EyeballProps: { ColumnData: any[] } | null;
  columnData: Record<string, string>;
}

/**
 * NetworkGraph Component
 *
 * @param {NetworkGraphProps} props - The component props
 * @returns {JSX.Element} A network graph visualization
 */
const NetworkGraph: React.FC<NetworkGraphProps> = ({ EyeballProps, columnData }) => {
  const networkContainer = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const networkRef = useRef<Network | null>(null);

  /**
   * Handles node click event to display node menu
   * @param {string} nodeId - The ID of the clicked node
   */
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

  /**
   * Closes the node menu
   */
  const closeMenu = () => setMenuPosition(null);

  useEffect(() => {
    if (!EyeballProps || !EyeballProps.ColumnData) return;

    const nodes = new DataSet<Node>([]);
    const edges = new DataSet<Edge>([]);
    const nodeMap: { [hostB: string]: string } = {};

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

      const meanBytes = 30000000.78;
      const meanBytes1 = 56301017.78; // Precomputed mean
      const edgeWidth = Bytes > meanBytes ? Math.min(1 + (Bytes - meanBytes) / meanBytes, 5) : 1;

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

        edges.add({
          from: 'hostA',
          to: uniqueId,
          width: edgeWidth,
          color: { color: IsMalicious ? 'red' : 'green' },
        });
      }
    });

    if (networkContainer.current) {
      const options = {
        interaction: { navigationButtons: true, keyboard: true },
        physics: { enabled: true, solver: 'forceAtlas2Based' },
        nodes: {
          size: 50,
          borderWidth: 2,
          color: { border: '#7b7b7b', background: '#7b7b7b' },
          font: { color: '#FFFFFF', size: 14 },
        },
        edges: {
          color: { color: '#848484' },
          arrows: 'middle',
        },
      };

      networkRef.current = new Network(networkContainer.current, { nodes, edges }, options);

      /**
       * Constructs the title string using columnData mappings
       */
      const hostATitle = `
      Application: ${columnData.appId}\n
      Geo Location: ${columnData.geoLocation}\n
      Host Group: ${columnData.hostGroupB}\n
      Volume Total: ${columnData.serverOctets}\n
      Server Port: ${columnData.serverPort}\n
      `;

      nodes.add({
        id: 'hostA',
        label: 'hostA',
        shape: 'circularImage',
        image: '/file_slide.png',
        size: 50,
        borderWidth: 2,
        color: { border: 'red', background: '#7b7b7b' },
        title: hostATitle,
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
      <div ref={networkContainer} className='network-container' />

      {menuPosition && (
        <NodeMenu position={menuPosition} selectedNode={selectedNode} onClose={closeMenu} />
      )}
    </>
  );
};

export default NetworkGraph;
