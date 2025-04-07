import { Network } from "vis-network";
import { getNodeDetailsById, resetStyling } from "./networkUtils";

interface ColumnData {
  appId: string;
  geoLocation: string;
  hostGroupB: string;
  serverOctets: string;
  serverPort: string;
  isHostAMalicious?: string;
}

interface NodeClickHandlerParams {
  uniqueId: string;
  network: Network;
  nodeHostMap: Record<string, any>;
  columnData: ColumnData;
  setMenuPosition: (pos: { x: number; y: number }) => void;
  setInvestigationTarget: (target: any) => void;
  setSelectedNode: (id: string) => void;
  selectedNodeRef: React.MutableRefObject<string | null>;
}

export const handleNodeClick = ({
  uniqueId,
  network,
  nodeHostMap,
  columnData,
  setMenuPosition,
  setInvestigationTarget,
  setSelectedNode,
  selectedNodeRef,
}: NodeClickHandlerParams) => {
  resetStyling(network, nodeHostMap, columnData);

  const positions = network.getPositions([uniqueId]);
  const nodePosition = positions[uniqueId];
  const { x, y } = network.canvasToDOM(nodePosition);

  if (uniqueId === "hostA") {
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
  } else {
    const details = getNodeDetailsById(nodeHostMap, uniqueId);
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
};
