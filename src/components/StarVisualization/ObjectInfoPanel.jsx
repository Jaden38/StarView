import React from 'react';

const formatNumber = (num) => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toFixed(1);
};

const ObjectInfoPanel = ({ selectedObject }) => {
    if (!selectedObject) return null;

    return (
        <div className="absolute bottom-4 left-4 bg-gray-800 bg-opacity-90 text-white p-4 rounded shadow-lg">
            <h3 className="font-bold text-xl">{selectedObject.name}</h3>
            <div className="space-y-1 mt-2">
                <p>Type: {selectedObject.objectType === "sun" ? "Star" : "Planet"}</p>
                {selectedObject.objectType === "sun" ? (
                    <>
                        <p>Spectral Type: {selectedObject.type}</p>
                        <p>Temperature: {formatNumber(selectedObject.temperature)}K</p>
                        <p>Radius: {formatNumber(selectedObject.radius)} km</p>
                        <p>Mass: {selectedObject.mass} solar masses</p>
                    </>
                ) : (
                    <>
                        <p>Distance from Sun: {formatNumber(selectedObject.distance / 1e6)} million km</p>
                        <p>Temperature: {selectedObject.temperature}K</p>
                        <p>Radius: {formatNumber(selectedObject.radius)} km</p>
                        <p>Mass: {selectedObject.mass} Earth masses</p>
                        <p>Orbital Period: {selectedObject.orbitalPeriod} Earth days</p>
                        <p>Moons: {selectedObject.moons}</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default ObjectInfoPanel;