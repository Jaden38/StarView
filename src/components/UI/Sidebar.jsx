import React from 'react';
import { Sliders, Eye, Star, Thermometer } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-900 p-4 text-white">
      <h2 className="text-xl font-bold mb-4">Filters</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="flex items-center mb-2">
            <Eye className="w-4 h-4 mr-2" />
            Visibility
          </h3>
          <input
            type="range"
            min="0"
            max="100"
            className="w-full"
          />
        </div>

        <div>
          <h3 className="flex items-center mb-2">
            <Star className="w-4 h-4 mr-2" />
            Magnitude
          </h3>
          <input
            type="range"
            min="-27"
            max="15"
            className="w-full"
          />
        </div>

        <div>
          <h3 className="flex items-center mb-2">
            <Thermometer className="w-4 h-4 mr-2" />
            Temperature
          </h3>
          <input
            type="range"
            min="2000"
            max="30000"
            className="w-full"
          />
        </div>

        <div>
          <h3 className="flex items-center mb-2">
            <Sliders className="w-4 h-4 mr-2" />
            Distance
          </h3>
          <input
            type="range"
            min="0"
            max="1000"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;