import { DataSet, Edge, Node } from "vis-network/standalone";

export const addNodeDetails = (
  nodeHostMap: Record<string, any>,
  uniqueId: string,
  details: any
) => {
  if (!nodeHostMap[uniqueId]) {
    nodeHostMap[uniqueId] = details;
  }
};

export const getNodeDetailsById = (
  nodeHostMap: Record<string, any>,
  uniqueId: string
) => {
  return nodeHostMap[uniqueId] || null;
};

export const resetStyling = (
  network: any,
  nodeHostMap: Record<string, any>,
  columnData: Record<string, string>
) => {
  network.body.data.nodes.forEach((node: any) => {
    const originalDetails = nodeHostMap[node.id];
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
    const fromDetails = nodeHostMap[edge.from];
    const toDetails = nodeHostMap[edge.to];
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
