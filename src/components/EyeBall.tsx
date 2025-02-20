import React, { useState } from 'react';
import RequestDataFetcher from './RequestDataFetcher';
import SampleDataFetcher from './SampleDataFetcher';
import NetworkGraph from './EyeBallGraph';
import NodeDetails from './NodeDetails';
import { EyeballProps } from './EyeballProps';

/**
 *
 * this mainly contains the main component in the tsx 
 */

const CombinedNetworkGraph: React.FC = () => {
    const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
    const [columnData, setData] = useState<any[]>([]);
    const [EyeBallProps, setEyeBallProps] = useState<EyeballProps | null>(null);

    return (
        <div>
            <RequestDataFetcher onDataFetched={setData} />
            <SampleDataFetcher onDataFetched={setEyeBallProps} />
            <NetworkGraph columnData={columnData} EyeballProps={EyeBallProps} onNodeSelect={setSelectedNodes} />
            <NodeDetails selectedNodes={selectedNodes} />
        </div>
    );
};

export default CombinedNetworkGraph;
