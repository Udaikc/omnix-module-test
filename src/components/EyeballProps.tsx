import React, { useState } from 'react';
import RequestDataFetcher from './RequestDataFetcher';
import SampleDataFetcher from './SampleDataFetcher';
import NetworkGraph from './EyeBallGraph';
import { EyeballProps } from './Eyeball';

/**
 *
 * this mainly contains the main component in the tsx
 */

const CombinedNetworkGraph: React.FC = () => {
    const [columnData, setData] = useState<any[]>([]);
    const [EyeBallProps, setEyeBallProps] = useState<EyeballProps | null>(null);

    return (
        <div>
            <RequestDataFetcher onDataFetched={setData} />
            <SampleDataFetcher onDataFetched={setEyeBallProps} />
            <NetworkGraph columnData={columnData} EyeballProps={EyeBallProps} />
        </div>
    );
};

export default CombinedNetworkGraph;
