import { DataSet, type Node, type Edge } from "vis-network/standalone";

export const createNode = (id: string, details: any): Node => {
  return {
    id,
    label: details.hostB,
    title: `Resolved Host: ${details.hostB}
Protocol: ${details.protocol}
Port: ${details.serverPort}
ISP: ${details.ispName}
ISP Org: ${details.ispOrg}
ISP No: ${details.ispNo}
Octets: ${details.serverOctets}`,
    shape: "circularImage",
    image: details.scope === "External" ? "/external_server.png" : "/server.png",
    size: 20,
    borderWidth: 2,
    color: details.IsMalicious
      ? { border: "red", background: "#7b7b7b" }
      : "#7b7b7b",
  };
};

export const createEdges = (
  uniqueId: string,
  Bytes: number,
  DataDirection: string,
  isMalicious: boolean
): Edge[] => {
  const color = isMalicious ? "red" : "green";
  const common = {
    width: Bytes,
    color: { color },
    arrows: { middle: { enabled: true, scaleFactor: 1, type: "arrow" } },
  };

  if (DataDirection === "Both") {
    return [
      {
        ...common,
        from: uniqueId,
        to: "hostA",
        smooth: { type: "dynamic", roundness: 0.5 },
      },
      {
        ...common,
        from: "hostA",
        to: uniqueId,
        smooth: { type: "dynamic", roundness: 0.5 },
      },
    ];
  }

  return [
    {
      ...common,
      from: DataDirection === "ToClient" ? "hostA" : uniqueId,
      to: DataDirection === "ToClient" ? uniqueId : "hostA",
    },
  ];
};
