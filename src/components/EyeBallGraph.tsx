import React, { useEffect, useRef } from 'react';
import { DataSet, Network, type Node, type Edge } from 'vis-network/standalone';
import { v4 as uuidv4 } from 'uuid';
import 'vis-network/styles/vis-network.css';
import { EyeballProps } from './EyeballProps';

/**
 * EyeBallGraph Component
 *
 * - Inserts a central host node
 * - Fetches data from RequestDataFetcher and SampleDataFetcher
 * - Displays nodes & edges in a Vis Network graph
 * - Handles node selection and returns selected nodes
 */

interface NetworkGraphProps {
    columnData: any[];
    EyeballProps: EyeballProps | null;
    onNodeSelect: (nodes: string[]) => void;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({ columnData, EyeballProps, onNodeSelect }) => {
    const networkContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!EyeballProps) return;

        const nodes = new DataSet<Node>([]);
        const edges = new DataSet<Edge>([]);
        const nodeMap: { [hostB: string]: string } = {}; // Store unique host mappings

        //  Process MatrixData and add nodes & edges
        EyeballProps.Matrix_Data.forEach(row => {
            const resolvedHostB = row[0];
            const hostB = row[5];
            const protocol = row[3];
            const serverPort = row[4];
            const ispName = row[12];
            const ispOrg = row[13];
            const ispNo = row[14];
            const serverOctets = row[15];

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
                    color: '#7b7b7b'
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
                    font: { color: '#FFFFFF', size: 14 }
                }
            };
            const network = new Network(networkContainer.current, { nodes, edges }, options);

            //  Add click event listener to handle node selection
            network.on('click', (properties: any) => {
                const ids = properties.nodes;
                const clickedNodes = nodes.get(ids); // Retrieve node details

                if (clickedNodes.length > 0) {
                    console.log("Selected Node Details:", clickedNodes);
                    onNodeSelect(clickedNodes.map((node: any) => node.label)); // ✅ Send selected nodes to parent
                } else {
                    console.log("No node selected.");
                    onNodeSelect([]); // Reset selection when clicking outside nodes
                }
            });

            //  Insert central HostA node with title
            const columnTitle = `Host: HostA\n` +
                `Application: ${columnData.find(item => item.id === 'appId')?.displayName || 'N/A'}\n` +
                `Server Port: ${columnData.find(item => item.id === 'serverPort')?.displayName || 'N/A'}\n` +
                `Volume: ${columnData.find(item => item.id === 'serverOctets')?.displayName || 'N/A'}\n` +
                `Host Group: ${columnData.find(item => item.id === 'hostGroupB')?.displayName || 'N/A'}\n` +
                `Geolocation: ${columnData.find(item => item.id === 'geoLocation')?.displayName || 'N/A'}`;

            nodes.add({
                id: 'hostA',
                label: 'hostA',
                title: columnTitle,
                shape: 'circularImage',
                image: '/file_slide.png',
                size: 50,
                borderWidth: 2,
                color: '#7b7b7b'
            });
        }
    }, [EyeballProps, columnData, onNodeSelect]);

    return <div ref={networkContainer} style={{ height: '600px', width: '100%', backgroundColor: '#000000' }} />;
};

export default NetworkGraph;
