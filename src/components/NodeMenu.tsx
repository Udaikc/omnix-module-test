import React from 'react';
import './styles/NodeMenu.css';

interface NodeMenuProps {
    position: { x: number; y: number };
    selectedNode: string | null;
    onClose: () => void;
}

const NodeMenu: React.FC<NodeMenuProps> = ({ position, selectedNode, onClose }) => {
    if (!selectedNode) return null;

    return (
        <div
            className="node-menu"
            style={{
                position: 'absolute',
                left: `${Math.min(position.x, window.innerWidth - 200)}px`,
                top: `${Math.min(position.y, window.innerHeight - 100)}px`,
                backgroundColor: 'white',
                zIndex: 1000,
            }}
            onClick={onClose}
        >
            {selectedNode === 'hostA' ? (
                <>
                    <a href={`#details-${selectedNode}`} className="link">Show Details</a>
                    <hr className="separator" />
                    <a href={`#detection-${selectedNode}`} className="link">Show Detection</a>
                    <hr className="separator" />
                    <a href={`#session-analysis-${selectedNode}`} className="link">Launch Session Analysis</a>
                    <hr className="separator" />
                    <a href={`#packet-analysis-${selectedNode}`} className="link">Launch Packet Analysis</a>
                </>
            ) : (
                <>
                    <a href={`#expand-${selectedNode}`} className="link">Expand</a>
                    <hr className="separator" />
                    <a href={`#filter-${selectedNode}`} className="link">Add to Filters</a>
                    <hr className="separator" />
                    <a href={`#details-${selectedNode}`} className="link">Show Details</a>
                    <hr className="separator" />
                    <a href={`#detection-${selectedNode}`} className="link">Show Detection</a>
                    <hr className="separator" />
                    <a href={`#investigation-${selectedNode}`} className="link">Investigation Host</a>
                    <hr className="separator" />
                    <a href={`#session-analysis-${selectedNode}`} className="link">Launch Session Analysis</a>
                    <hr className="separator" />
                    <a href={`#packet-analysis-${selectedNode}`} className="link">Launch Packet Analysis</a>
                </>
            )}
        </div>
    );
};

export default NodeMenu;
