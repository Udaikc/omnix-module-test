import { useEffect, useRef } from 'react';
import { DataSet, Network, type Node, type Edge } from 'vis-network/standalone';
import { v4 as uuidv4 } from 'uuid';

export const useNetworkGraph = (
  networkContainer: React.RefObject<HTMLDivElement>,
  EyeballProps: { ColumnData: any[] } | null,
  columnData: Record<string, string>,
  setSelectedNode: (nodeId: string | null) => void,
  setMenuPosition: (position: { x: number; y: number } | null) => void
) => {
  const networkRef = useRef<Network | null>(null);

  useEffect(() => {
    if (!EyeballProps || !EyeballProps.ColumnData) return;

    const nodes = new DataSet<Node>([]);
    const edges = new DataSet<Edge>([]);
    const nodeMap: { [hostB: string]: string } = {};

    EyeballProps.ColumnData.forEach((row) => {
      const hostB = row.Server;
      if (!nodeMap[hostB]) {
        const uniqueId = uuidv4();
        nodeMap[hostB] = uniqueId;
        nodes.add({ id: uniqueId, label: hostB, shape: 'circularImage', image: '/server.png', size: 20, color: '#7b7b7b' });
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
        edges: { color: { color: '#848484' } },
      };

      networkRef.current = new Network(networkContainer.current, { nodes, edges }, options);

      nodes.add({ id: 'hostA', label: 'hostA', shape: 'circularImage', image: '/file_slide.png', size: 50, color: { border: 'red' } });

      networkRef.current.on('click', (event: any) => {
        if (event.nodes.length > 0) {
          const nodeId = event.nodes[0];
          const positions = networkRef.current?.getPositions([nodeId]);
          const nodePosition = positions?.[nodeId];

          if (nodePosition) {
            const { x, y } = networkRef.current?.canvasToDOM(nodePosition);
            setSelectedNode(nodeId);
            setMenuPosition({ x, y });
          }
        } else {
          setMenuPosition(null);
        }
      });
    }
  }, [EyeballProps, columnData]);

  return { networkRef };
};
