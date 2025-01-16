import React from 'react';
import { Sliders, Eye, Star, Thermometer } from 'lucide-react';

const Sidebar = ({ filters, onFilterChange }) => {
  return (
    <div className="w-64 bg-gray-900 p-4 text-white">
      <h2 className="text-xl font-bold mb-4">Filters</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="flex items-center mb-2">
            <Eye className="w-4 h-4 mr-2" />
            Visibility
          </h3>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="15"
              step="0.1"
              value={filters.magnitude}
              onChange={(e) => onFilterChange('magnitude', parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="w-12 text-sm">{filters.magnitude.toFixed(1)}</span>
          </div>
        </div>

        <div>
          <h3 className="flex items-center mb-2">
            <Star className="w-4 h-4 mr-2" />
            Magnitude
          </h3>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="-27"
              max="15"
              step="0.1"
              value={filters.maxMagnitude}
              onChange={(e) => onFilterChange('maxMagnitude', parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="w-12 text-sm">{filters.maxMagnitude.toFixed(1)}</span>
          </div>
        </div>

        <div>
          <h3 className="flex items-center mb-2">
            <Thermometer className="w-4 h-4 mr-2" />
            Temperature
          </h3>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="2000"
              max="30000"
              step="100"
              value={filters.minTemp}
              onChange={(e) => onFilterChange('minTemp', parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="w-16 text-sm">{filters.minTemp}K</span>
          </div>
        </div>

        <div>
          <h3 className="flex items-center mb-2">
            <Sliders className="w-4 h-4 mr-2" />
            Distance
          </h3>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={filters.maxDistance}
              onChange={(e) => onFilterChange('maxDistance', parseFloat(e.target.value))}
              className="w-full"
            />
            <span className="w-16 text-sm">{filters.maxDistance} pc</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;