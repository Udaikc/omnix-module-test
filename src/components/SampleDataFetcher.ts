import { useEffect, useState } from 'react';
import { EyeballProps } from './Eyeball';

/**
 * @file SampleDataFetcher.ts
 * @description Fetches sample data from a JSON file and provides it to the parent component.
 */

/**
 * SampleDataFetcherProps interface.
 *
 * Defines the props for the SampleDataFetcher component.
 *
 * @interface SampleDataFetcherProps
 * @property {function} onDataFetched - Callback function to pass the fetched data to the parent component.
 */
interface SampleDataFetcherProps {
  onDataFetched: (data: EyeballProps) => void;
}

/**
 * SampleDataFetcher component.
 *
 * Fetches sample data from the `/sampleData.json` file and passes it to the parent component
 * using the `onDataFetched` callback. This component does not render any UI.
 *
 * @component
 * @param {SampleDataFetcherProps} props - The component props.
 * @returns {null} Returns null as this component does not render any UI.
 */
const SampleDataFetcher: React.FC<SampleDataFetcherProps> = ({ onDataFetched }) => {
  /**
   * State to hold the fetched EyeballProps data.
   *
   * @type {[EyeballProps | null, React.Dispatch<React.SetStateAction<EyeballProps | null>>]}
   */
  const [ColumnData, setColumnData] = useState<EyeballProps | null>(null);

  useEffect(() => {
    fetch('/sampleData.json')
      .then(response => response.json())
      .then((data: EyeballProps) => {
        console.log(data);
        setColumnData(data);
        onDataFetched(data);
      })
      .catch(error => console.error('Error fetching sample data:', error));
  }, [onDataFetched]);

  return null; // No UI needed, just fetching data
};

export default SampleDataFetcher;