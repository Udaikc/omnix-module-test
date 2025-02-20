import React from 'react';

interface NodeDetailsProps {
    selectedNodes: string[];
}

/**
 * Displays the selected node labels without using a list.
 */
const NodeDetails: React.FC<NodeDetailsProps> = ({ selectedNodes }) => {
    return (
        <div>
            <h2 style={{ color: 'black' }}>Selected Nodes:</h2>
            <div style={{ color: 'black' }}>
                {selectedNodes.length > 0 ? selectedNodes.join(', ') : 'No nodes selected'}
            </div>
        </div>
    );
};

export default NodeDetails;


