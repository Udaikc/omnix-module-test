import { useEffect, useState } from 'react';


/**
 FETCHES THE REQUEST.JSON DATA ELEMENTS WHICH CONTAINS THE CENTRAL NODE 
 */

interface ColumnDetail {
    id: string;
    displayName: string;
}

interface RequestDataFetcherProps {
    onDataFetched: (data: ColumnDetail[]) => void;
}

const RequestDataFetcher: React.FC<RequestDataFetcherProps> = ({ onDataFetched }) => {
    const [columnDetails, setColumnDetails] = useState<ColumnDetail[]>([]);

    useEffect(() => {
        fetch('/Request.json')
            .then(response => response.json())
            .then(data => {
                const relevantColumns = data.columnDetails.filter((item: ColumnDetail) =>
                    ['host', 'appId', 'serverPort', 'serverOctets', 'hostGroupB', 'geoLocation'].includes(item.id)
                );
                setColumnDetails(relevantColumns);
                onDataFetched(relevantColumns);
            })
            .catch(error => console.error('Error fetching column details:', error));
    }, [onDataFetched]);

    return null; // No UI needed, it just fetches data
};

export default RequestDataFetcher;
