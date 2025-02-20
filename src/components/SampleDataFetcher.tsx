import { useEffect, useState } from 'react';
import { MatrixData } from './EyeballProps';

/**

 FETCHED THE NODES SURROUNDING THE CENTRAL NODE WHICH ARE CONNECTED TO THE CENTRAL NODE

*/

interface SampleDataFetcherProps {
    onDataFetched: (data: MatrixData) => void;
}

const SampleDataFetcher: React.FC<SampleDataFetcherProps> = ({ onDataFetched }) => {
    const [matrixData, setMatrixData] = useState<MatrixData | null>(null);

    useEffect(() => {
        fetch('/sampleData.json')
            .then(response => response.json())
            .then((data: MatrixData) => {
                setMatrixData(data);
                onDataFetched(data);
            })
            .catch(error => console.error('Error fetching sample data:', error));
    }, [onDataFetched]);

    return null; // No UI needed, just fetching data
};

export default SampleDataFetcher;
