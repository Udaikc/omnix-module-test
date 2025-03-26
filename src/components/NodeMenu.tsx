// NodeMenu.tsx
import React from 'react';
import './styles/NodeMenu.css'

interface NodeMenuProps {
    position: { x: number; y: number };
    selectedNode: string | null;
    onClose: () => void;
}

const NodeMenu: React.FC<NodeMenuProps> = ({ position, selectedNode, onClose }) => {
    if (!selectedNode) return null;

    return (
        <div
            style={{
                position: 'absolute',
                left: `${Math.min(position.x, window.innerWidth - 200)}px`,
                top: `${Math.min(position.y, window.innerHeight - 100)}px`,
                backgroundColor: 'white',
                padding: '5px',
                borderRadius: '5px',
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
            }}
            onClick={onClose}
        >
            {selectedNode === 'hostA' ? (
                <>
                    <button className="button" onClick={() => alert(`Show Details for ${selectedNode}`)}>Show Details</button>
                    <hr />
                    <button className="button" onClick={() => alert(`Show Detection for ${selectedNode}`)}>Show Detection</button>
                    <hr />
                    <button className="button" onClick={() => alert(`Launch Session Analysis for ${selectedNode}`)}>
                        Launch Session Analysis
                    </button>
                    <hr />
                    <button className="button" onClick={() => alert(`Launch Packet Analysis for ${selectedNode}`)}>
                        Launch Packet Analysis
                    </button>
                </>
            ) : (
                <>
                    <button className="button" onClick={() => alert(`Expand ${selectedNode}`)}>Expand</button>
                    <hr />
                    <button className="button" onClick={() => alert(`Add to Filters ${selectedNode}`)}>Add to Filters</button>
                    <hr />
                    <button className="button" onClick={() => alert(`Show Details for ${selectedNode}`)}>Show Details</button>
                    <hr />
                    <button className="button" onClick={() => alert(`Show Detection for ${selectedNode}`)}>Show Detection</button>
                    <hr />
                    <button className="button" onClick={() => alert(`Investigation Host ${selectedNode}`)}>Investigation Host</button>
                    <hr />
                    <button className="button" onClick={() => alert(`Launch Session Analysis for ${selectedNode}`)}>
                        Launch Session Analysis
                    </button>
                    <hr />
                    <button className="button" onClick={() => alert(`Launch Packet Analysis for ${selectedNode}`)}>
                        Launch Packet Analysis
                    </button>
                </>
            )}
        </div>
    );
};

export default NodeMenu;