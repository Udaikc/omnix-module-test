import { useEffect, useState } from 'react';

interface ColumnDetail {
    id: string;
    displayName: string;
}

interface RequestJson {
    columnDetails: ColumnDetail[];
}

interface RequestDataFetcherProps {
    onDataFetched: (data: Record<string, string>) => void;
}

const RequestDataFetcher: React.FC<RequestDataFetcherProps> = ({ onDataFetched }) => {
    const [columnDetails, setColumnDetails] = useState<Record<string, string>>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/Request.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data: RequestJson = await response.json();

                // Convert array to an object { "appId": "Application ID", ... }
                const relevantColumns = data.columnDetails.reduce((acc, item) => {
                    if (['host', 'appId', 'serverPort', 'serverOctets', 'hostGroupB', 'geoLocation'].includes(item.id)) {
                        acc[item.id] = item.displayName;
                    }
                    return acc;
                }, {} as Record<string, string>);

                setColumnDetails(relevantColumns);
                onDataFetched(relevantColumns);

            } catch (error) {
                console.error('Error fetching column details:', error);
            }
        };

        fetchData();
    }, [onDataFetched]);

    return null;
};

export default RequestDataFetcher;
