import React from 'react';
import './styles/useNetworkGraph.css'

interface ContextMenuProps {
    menuPosition: { x: number; y: number } | null;
    selectedNode: string | null;
    closeMenu: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ menuPosition, selectedNode, closeMenu }) => {
    if (!menuPosition) return null;

    return (
        <div
            style={{
                position: 'absolute',
                left: `${Math.min(menuPosition.x, window.innerWidth - 200)}px`,
                top: `${Math.min(menuPosition.y, window.innerHeight - 200)}px`,
                backgroundColor: 'white',
                padding: '1px',
                borderRadius: '5px',
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
            }}
            onClick={closeMenu}
        >
            {selectedNode === 'hostA' ? (
                <>
                    <button className="button" onClick={() => alert(`Show Details for ${selectedNode}`)}>Show Details</button>
                    <hr />
                    <button className="button" onClick={() => alert(`Show Detection for ${selectedNode}`)}>Show Detection</button>
                    <hr />
                    <button className="button" onClick={() => alert(`Launch Session Analysis for ${selectedNode}`)}>Launch Session Analysis</button>
                    <hr />
                    <button className="button" onClick={() => alert(`Launch Packet Analysis for ${selectedNode}`)}>Launch Packet Analysis</button>
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
                    <button className="button" onClick={() => alert(`Launch Session Analysis for ${selectedNode}`)}>Launch Session Analysis</button>
                    <hr />
                    <button className="button" onClick={() => alert(`Launch Packet Analysis for ${selectedNode}`)}>Launch Packet Analysis</button>
                </>
            )}
        </div>
    );
};

export default ContextMenu;
