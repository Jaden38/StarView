import React from 'react';

const CameraControls = ({ isFreeCamera }) => {
    if (!isFreeCamera) return null;

    return (
        <div className="absolute top-20 left-4 bg-gray-800 bg-opacity-70 text-white p-2 rounded">
            <div className="text-sm">
                <p>Controls:</p>
                <ul className="list-disc pl-4">
                    <li>ZQSD: Move forward, backward, left, and right</li>
                    <li>Arrow keys: Vertical (up/down) and rotational movement</li>
                    <li>Mouse: Look around</li>
                    <li>Shift: Speed up</li>
                </ul>
            </div>
        </div>
    );
};

export default CameraControls;