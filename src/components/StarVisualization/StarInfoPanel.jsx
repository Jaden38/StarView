import React from 'react';

const StarInfoPanel = ({ selectedStar }) => {
    if (!selectedStar) return null;

    return (
        <div className="absolute bottom-4 left-4 bg-gray-800 bg-opacity-70 text-white p-4 rounded shadow-lg">
            <h3 className="font-bold text-xl">
                {selectedStar.proper || `Star ${selectedStar.id}`}
            </h3>
            <div className="space-y-1 mt-2">
                <p>Constellation: {selectedStar.con || "Unknown"}</p>
                <p>Distance: {selectedStar.dist.toFixed(2)} parsecs</p>
                <p>Magnitude: {selectedStar.mag.toFixed(2)}</p>
                <p>Spectral Type: {selectedStar.spect || "Unknown"}</p>
                {selectedStar.lum && (
                    <p>Luminosity: {selectedStar.lum.toFixed(2)} × Sun</p>
                )}
            </div>
        </div>
    );
};

export default StarInfoPanel;