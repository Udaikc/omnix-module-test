import React from 'react';
import './styles/NodeMenu.css';

interface NodeMenuProps {
    position: { x: number; y: number };
    selectedNode: string | null;
    investigationTarget: string | null;
    onClose: () => void;
}

const NodeMenu: React.FC<NodeMenuProps> = ({ position, selectedNode, investigationTarget, onClose }) => {
    if (!selectedNode) return null;

    const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault(); // Prevent default link behavior
        const href = event.currentTarget.getAttribute('href');
        if (href) {
            alert(`Link clicked: ${href}`);
            onClose(); // Close the menu after clicking a link
        }
    };

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
            onClick={onClose} // Close the menu if clicked outside the link
        >
            {selectedNode === 'hostA' ? (
                <>
                    <a href={`#details-${selectedNode}`} className="link" onClick={handleLinkClick}>
                        Show Details
                    </a>
                    <hr className="separator" />
                    <a href={`#detection-${selectedNode}`} className="link" onClick={handleLinkClick}>
                        Show Detection
                    </a>
                    <hr className="separator" />
                    <a href={`#session-analysis-${selectedNode}`} className="link" onClick={handleLinkClick}>
                        Launch Session Analysis
                    </a>
                    <hr className="separator" />
                    <a href={`#packet-analysis-${selectedNode}`} className="link" onClick={handleLinkClick}>
                        Launch Packet Analysis
                    </a>
                </>
            ) : (
                <>
                    <a href={`#expand-${selectedNode}`} className="link" onClick={handleLinkClick}>
                        Expand
                    </a>
                    <hr className="separator" />
                    <a href={`#filter-${selectedNode}`} className="link" onClick={handleLinkClick}>
                        Add to Filters
                    </a>
                    <hr className="separator" />
                    <a href={`#details-${selectedNode}`} className="link" onClick={handleLinkClick}>
                        Show Details
                    </a>
                    <hr className="separator" />
                    <a href={`#detection-${selectedNode}`} className="link" onClick={handleLinkClick}>
                        Show Detection
                    </a>
                    <hr className="separator" />
                    <a href={`#investigation-${selectedNode} - #hostA- ${investigationTarget}`} className="link" onClick={handleLinkClick}>
                        Investigation Host
                    </a>
                    <hr className="separator" />
                    <a href={`#investigation-${selectedNode} - #hostA- ${investigationTarget}`} className="link" onClick={handleLinkClick}>
                        Launch Session Analysis
                    </a>
                    <hr className="separator" />
                    <a href={`#investigation-${selectedNode} - #hostA- ${investigationTarget}`} className="link" onClick={handleLinkClick}>
                        Launch Packet Analysis
                    </a>
                </>
            )}
        </div>
    );
};

export default NodeMenu;