import { useEffect, useState } from 'react';

/**
 * @file RequestDataFetcher.tsx
 * @description Fetches data from Request.json, extracts relevant columns, and provides them to the parent component.
 */

/**
 * ColumnDetail interface.
 *
 * Defines the structure of a column detail object.
 *
 * @interface ColumnDetail
 * @property {string} id - The ID of the column.
 * @property {string} displayName - The display name of the column.
 */
interface ColumnDetail {
    id: string;
    displayName: string;
}

/**
 * RequestDataFetcherProps interface.
 *
 * Defines the props for the RequestDataFetcher component.
 *
 * @interface RequestDataFetcherProps
 * @property {function} onDataFetched - Callback function to pass the fetched and filtered column details to the parent component.
 */
interface RequestDataFetcherProps {
    onDataFetched: (data: ColumnDetail[]) => void;
}

/**
 * RequestDataFetcher component.
 *
 * Fetches data from the `/Request.json` file, filters the `columnDetails` array to include only
 * specified columns, and passes the filtered data to the parent component using the `onDataFetched`
 * callback. This component does not render any UI.
 *
 * @component
 * @param {RequestDataFetcherProps} props - The component props.
 * @returns {null} Returns null as this component does not render any UI.
 */
const RequestDataFetcher: React.FC<RequestDataFetcherProps> = ({ onDataFetched }) => {
    /**
     * State to hold the fetched and filtered column details.
     *
     * @type {[ColumnDetail[], React.Dispatch<React.SetStateAction<ColumnDetail[]>>]}
     */
    const [columnDetails, setColumnDetails] = useState<ColumnDetail[]>([]);

    useEffect(() => {
        fetch('/Request.json')
            .then(response => response.json())
            .then(data => {
                const relevantColumns = data.columnDetails.filter((item: ColumnDetail) =>
                    ['host', 'appId', 'serverPort', 'serverOctets', 'hostGroupB', 'geoLocation'].includes(item.id)
                );
                console.log(relevantColumns);
                setColumnDetails(relevantColumns);
                onDataFetched(relevantColumns);
            })
            .catch(error => console.error('Error fetching column details:', error));
    }, [onDataFetched]);

    return null; // No UI needed, it just fetches data
};

export default RequestDataFetcher;