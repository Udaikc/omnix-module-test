import React, { useEffect, useRef } from 'react';
import { DataSet, Network, type Node, type Edge } from 'vis-network/standalone';
import { v4 as uuidv4 } from 'uuid';
import 'vis-network/styles/vis-network.css';

/**
 * @file EyeBallGraph.tsx
 * @description Renders a network graph using vis-network based on provided EyeballProps and columnData.
 */

/**
 * NetworkGraphProps interface.
 *
 * Defines the props for the NetworkContainer component.
 *
 * @interface NetworkGraphProps
 * @property {object|null} EyeballProps - The data containing nodes to be rendered in the graph.
 * @property {Array} columnData - Additional column data used to display information about the central node.
 */
interface NetworkGraphProps {
  EyeballProps: { ColumnData: any[] } | null;
  columnData: any[];
}

/**
 * NetworkContainer component.
 *
 * Renders a network graph using vis-network. It processes the EyeballProps data to create nodes and edges,
 * and uses columnData to display information about the central node.
 *
 * @component
 * @param {NetworkGraphProps} props - The component props.
 * @returns {JSX.Element} The rendered network graph.
 */
const NetworkContainer: React.FC<NetworkGraphProps> = ({ EyeballProps, columnData }) => {
  const networkContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!EyeballProps || !EyeballProps.ColumnData) {
      return;
    }

    const nodes = new DataSet<Node>([]);
    const edges = new DataSet<Edge>([]);
    const nodeMap: { [hostB: string]: string } = {};

    EyeballProps.ColumnData.forEach((row) => {
      // Mapping the provided data to the required format
      const resolvedHostB = row.Server;
      const hostB = row.Server; // Using server as hostB, as that's the closest equivalent.
      const protocol = row.Service; // Using service as protocol
      const serverPort = row.Port;
      const ispName = row.Provider; // Using Provider as ispName
      const ispOrg = row.Organization;
      const ispNo = row.ASN;
      const serverOctets = row.Bytes;

      const nodeTitle = `Resolved Host: ${resolvedHostB}\n` +
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
          label: resolvedHostB,
          title: nodeTitle,
          shape: 'circularImage',
          image: '/server.png',
          size: 20,
          borderWidth: 2,
          color: '#7b7b7b',
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
        },
      };
      const network = new Network(networkContainer.current, { nodes, edges }, options);

      const columnTitle = `Host: HostA\n` +
        `Application: ${columnData.find((item) => item.id === 'appId')?.displayName || 'N/A'}\n` +
        `Server Port: ${columnData.find((item) => item.id === 'serverPort')?.displayName || 'N/A'}\n` +
        `Volume: ${columnData.find((item) => item.id === 'serverOctets')?.displayName || 'N/A'}\n` +
        `Host Group: ${columnData.find((item) => item.id === 'hostGroupB')?.displayName || 'N/A'}\n` +
        `Geolocation: ${columnData.find((item) => item.id === 'geoLocation')?.displayName || 'N/A'}`;

      nodes.add({
        id: 'hostA',
        label: 'hostA',
        title: columnTitle,
        shape: 'circularImage',
        image: '/file_slide.png',
        size: 50,
        borderWidth: 2,
        color: '#7b7b7b',
      });
    }
  }, [EyeballProps]);

  return <div ref={networkContainer} style={{ height: '600px', width: '100%', backgroundColor: '#000000' }} />;
};

export default NetworkContainer;