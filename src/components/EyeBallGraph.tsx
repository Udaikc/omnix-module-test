import React, { useEffect, useRef } from 'react';
import { DataSet, Network, type Node, type Edge } from 'vis-network/standalone';
import { v4 as uuidv4 } from 'uuid';
import 'vis-network/styles/vis-network.css';
import { EyeballProps } from './Eyeball';

/**
 * EyeBallGraph Component
 *
 * - Inserts a central host node
 * - Fetches data from RequestDataFetcher and SampleDataFetcher
 * - Displays nodes & edges in a Vis Network graph
 * - Handles node selection and returns selected nodes
 */

/**
 * Interface defining the props for the NetworkGraph component.
 * @interface NetworkGraphProps
 */
interface NetworkGraphProps {
    /**
     * An array of data columns.
     * @type {any[]}
     */
    columnData: any[];
    /**
     * Props for the Eyeball component, or null.
     * @type {EyeballProps | null}
     */
    EyeballProps: EyeballProps | null;
    /**
     * Callback function to handle node selection.
     * @type {(nodes: string[]) => void}
     */
}

/**
 * React functional component for displaying a network graph.
 * @function NetworkGraph
 * @param {NetworkGraphProps} props - The component's props.
 * @returns {JSX.Element} - The rendered component.
 */
const NetworkGraph: React.FC<NetworkGraphProps> = ({ columnData, EyeballProps }) => {
    /**
     * Ref to the div element that will contain the Vis.js network.
     * @type {React.RefObject<HTMLDivElement>}
     */
    const networkContainer = useRef<HTMLDivElement>(null);

    /**
     * Effect hook to initialize and update the Vis.js network.
     */
    useEffect(() => {
        /**
         * Early return if EyeballProps is null.
         */
        if (!EyeballProps) return;

        /**
         * DataSet to hold the nodes of the network.
         * @type {DataSet<Node>}
         */
        const nodes = new DataSet<Node>([]);
        /**
         * DataSet to hold the edges of the network.
         * @type {DataSet<Edge>}
         */
        const edges = new DataSet<Edge>([]);
        /**
         * Map to store unique hostB to node ID mappings.
         * @type {{ [hostB: string]: string }}
         */
        const nodeMap: { [hostB: string]: string } = {};

        /**
         * Process MatrixData and add nodes & edges.
         */
        EyeballProps.ColumnData.forEach(row => {
            /**
             * Resolved hostB from the data row.
             * @type {string}
             */
            const resolvedHostB = row[0];
            /**
             * HostB from the data row.
             * @type {string}
             */
            const hostB = row[5];
            /**
             * Protocol from the data row.
             * @type {string}
             */
            const protocol = row[3];
            /**
             * Server port from the data row.
             * @type {number}
             */
            const serverPort = row[4];
            /**
             * ISP name from the data row.
             * @type {string}
             */
            const ispName = row[12];
            /**
             * ISP organization from the data row.
             * @type {string}
             */
            const ispOrg = row[13];
            /**
             * ISP number from the data row.
             * @type {string}
             */
            const ispNo = row[14];
            /**
             * Server octets from the data row.
             * @type {number}
             */
            const serverOctets = row[15];

            /**
             * Title string for the node.
             * @type {string}
             */
            const nodeTitle = `Resolved Host: ${resolvedHostB}\n` +
                `Protocol: ${protocol}\n` +
                `Port: ${serverPort}\n` +
                `ISP: ${ispName}\n` +
                `ISP Org: ${ispOrg}\n` +
                `ISP No: ${ispNo}\n` +
                `Octets: ${serverOctets}`;

            /**
             * Check if the hostB has already been added as a node.
             */
            if (!nodeMap[hostB]) {
                /**
                 * Generate a unique ID for the node.
                 * @type {string}
                 */
                const uniqueId = uuidv4();
                /**
                 * Store the hostB to unique ID mapping.
                 */
                nodeMap[hostB] = uniqueId;
                /**
                 * Add the node to the DataSet.
                 */
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
                /**
                 * Add an edge from hostA to the new node.
                 */
                edges.add({ from: 'hostA', to: uniqueId });
            }
        });

        /**
         * Check if the network container is available.
         */
        if (networkContainer.current) {
            /**
             * Options for the Vis.js network.
             * @type {object}
             */
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
            /**
             * Create a new Vis.js network instance.
             * @type {Network}
             */
            const network = new Network(networkContainer.current, { nodes, edges }, options);

            /**
             * Add click event listener to handle node selection.
             */
            network.on('click', (properties: any) => {
                /**
                 * Array of node IDs that were clicked.
                 * @type {string[]}
                 */
                const ids = properties.nodes;
                /**
                 * Array of clicked node details.
                 * @type {Node[]}
                 */
                const clickedNodes = nodes.get(ids);

                /**
                 * Check if any nodes were clicked.
                 */
                if (clickedNodes.length > 0) {
                    /**
                     * Log the selected node details.
                     */
                    console.log("Selected Node Details:", clickedNodes);
                    /**
                     * Call the onNodeSelect callback with the selected node labels.
                     */

                } else {
                    /**
                     * Log that no node was selected.
                     */
                    console.log("No node selected.");
                    /**
                     * Call the onNodeSelect callback with an empty array.
                     */

                }
            });

            /**
             * Create title for the central HostA node.
             * @type {string}
             */
            const columnTitle = `Host: HostA\n` +
                `Application: ${columnData.find(item => item.id === 'appId')?.displayName || 'N/A'}\n` +
                `Server Port: ${columnData.find(item => item.id === 'serverPort')?.displayName || 'N/A'}\n` +
                `Volume: ${columnData.find(item => item.id === 'serverOctets')?.displayName || 'N/A'}\n` +
                `Host Group: ${columnData.find(item => item.id === 'hostGroupB')?.displayName || 'N/A'}\n` +
                `Geolocation: ${columnData.find(item => item.id === 'geoLocation')?.displayName || 'N/A'}`;

            /**
             * Add the central HostA node.
             */
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
    }, [EyeballProps, columnData]);

    /**
     * Render the network container div.
    */

    return <div ref={networkContainer} style={{ height: '600px', width: '100%', backgroundColor: '#000000' }} />;
};

export default NetworkGraph;
