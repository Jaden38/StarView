import React, { useState } from 'react';
import StarVisualization from './components/StarVisualization';
import Sidebar from './components/UI/Sidebar';
import Toolbar from './components/UI/Toolbar';

const App = () => {
  // Change to array to support multiple modes
  const [activeModes, setActiveModes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    magnitude: 6.0,
    magnitudeType: 'apparent',
    minTemp: 2000,
    maxDistance: 1000,
  });

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleModeChange = (mode) => {
    setActiveModes(prev => {
      const modeExists = prev.includes(mode);
      if (modeExists) {
        // Remove mode if it exists
        return prev.filter(m => m !== mode);
      } else {
        // Add mode if it doesn't exist
        return [...prev, mode];
      }
    });
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        filters={filters} 
        onFilterChange={handleFilterChange}
      />
      <div className="flex-1 flex flex-col">
        <Toolbar 
          onModeChange={handleModeChange}
          activeModes={activeModes}
          onSearch={setSearchQuery}
        />
        <main className="flex-1">
          <StarVisualization 
            filters={filters}
            activeModes={activeModes}
            searchQuery={searchQuery}
          />
        </main>
      </div>
    </div>
  );
};

export default App;