import React from 'react';
import { Search } from 'lucide-react';

const Toolbar = () => {
  return (
    <div className="bg-gray-800 p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          Visible Stars
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          Brightest Stars
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          Constellations
        </button>
      </div>
      <div className="flex items-center bg-gray-700 rounded px-3 py-2">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search stars..."
          className="bg-transparent border-none text-white ml-2 focus:outline-none"
        />
      </div>
    </div>
  );
};

export default Toolbar;