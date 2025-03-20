import React, { useState } from 'react';
import RequestDataFetcher from './RequestDataFetcher';
import SampleDataFetcher from './SampleDataFetcher';
import NetworkContainer from './EyeBallGraph';
import { EyeballProps } from './Eyeball';

/**
 * @file EyeBallProps.tsx
 * @description This component acts as the main container for fetching data and rendering the network graph.
 */

/**
 * EyeBallGraph component.
 *
 * This component integrates data fetching from two sources (RequestDataFetcher and SampleDataFetcher)
 * and passes the fetched data to the NetworkContainer component for visualization.
 *
 * @component
 * @returns {JSX.Element} The rendered EyeBallGraph component.
 */
const EyeBallGraph: React.FC = () => {
    /**
     * State to hold the column data fetched by RequestDataFetcher.
     */
    const [columnData, setData] = useState<Record<string, string>>({});

    /**
     * State to hold the EyeballProps data fetched by SampleDataFetcher.
     */
    const [eyeBallProps, setEyeBallProps] = useState<EyeballProps | null>(null);

    return (
        <div>
            <RequestDataFetcher onDataFetched={setData} />
            <SampleDataFetcher onDataFetched={setEyeBallProps} />
            <NetworkContainer columnData={columnData} EyeballProps={eyeBallProps} />
        </div>
    );
};

export default EyeBallGraph;
