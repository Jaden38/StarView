import React from 'react';
import {Camera, EyeIcon, Globe2, Maximize2, Search, Sparkles, ThermometerSun} from 'lucide-react';

const Toolbar = ({ onModeChange, activeModes, onSearch, onCameraToggle, isFreeCamera }) => {
  const isActive = (mode) => activeModes.includes(mode);

  return (
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
              onClick={() => onCameraToggle()}
              className={`px-3 py-2 text-sm flex items-center space-x-2 rounded ${
                  isFreeCamera ? 'bg-blue-600' : 'bg-gray-600'
              }`}
          >
            <Camera className="w-4 h-4" />
            <span>{isFreeCamera ? 'Center Camera' : 'Free Camera'}</span>
          </button>

          <button
              onClick={() => onModeChange('closest')}
              className={`px-3 py-2 text-sm flex items-center space-x-2 rounded ${
                  isActive('closest') ? 'bg-blue-600' : 'bg-gray-600'
              }`}
          >
            <EyeIcon className="w-4 h-4" />
            <span>Closest Visible Stars</span>
          </button>

        <button 
          onClick={() => onModeChange('brightest')}
          className={`px-3 py-2 text-sm flex items-center space-x-2 rounded ${
            isActive('brightest') ? 'bg-blue-600' : 'bg-gray-600'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Brightest Stars</span>
        </button>

        <button 
          onClick={() => onModeChange('hottest')}
          className={`px-3 py-2 text-sm flex items-center space-x-2 rounded ${
            isActive('hottest') ? 'bg-blue-600' : 'bg-gray-600'
          }`}
        >
          <ThermometerSun className="w-4 h-4" />
          <span>Hottest Stars</span>
        </button>

        <button 
          onClick={() => onModeChange('largest')}
          className={`px-3 py-2 text-sm flex items-center space-x-2 rounded ${
            isActive('largest') ? 'bg-blue-600' : 'bg-gray-600'
          }`}
        >
          <Maximize2 className="w-4 h-4" />
          <span>Largest Stars</span>
        </button>

        <button 
          onClick={() => onModeChange('constellations')}
          className={`px-3 py-2 text-sm flex items-center space-x-2 rounded ${
            isActive('constellations') ? 'bg-blue-600' : 'bg-gray-600'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Constellations</span>
        </button>

        <button 
          onClick={() => onModeChange('solarSystem')}
          className={`px-3 py-2 text-sm flex items-center space-x-2 rounded ${
            isActive('solarSystem') ? 'bg-blue-600' : 'bg-gray-600'
          }`}
        >
          <Globe2 className="w-4 h-4" />
          <span>Solar System</span>
        </button>
      </div>

      <div className="flex items-center bg-gray-700 rounded px-3 py-2">
        <Search className="w-4 h-4 text-gray-400" />
        <input
            type="text"
            placeholder="Search stars or constellations..."
            className="bg-transparent border-none text-white ml-2 focus:outline-none w-64"
            onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Toolbar;