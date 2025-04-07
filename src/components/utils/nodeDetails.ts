export const addNodeDetails = (map: Record<string, any>, id: string, details: any) => {
    if (!map[id]) {
      map[id] = details;
    }
  };

  export const getNodeDetailsById = (map: Record<string, any>, id: string) => {
    return map[id] || null;
  };
