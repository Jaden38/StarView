import React, { useState } from 'react';
import StarVisualization from './components/StarVisualization';
import Sidebar from './components/UI/Sidebar';
import Toolbar from './components/UI/Toolbar';

const App = () => {
  const [visualizationMode, setVisualizationMode] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    magnitude: 6,
    maxMagnitude: 15,
    minTemp: 2000,
    maxDistance: 1000,
  });

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        filters={filters} 
        onFilterChange={handleFilterChange}
      />
      <div className="flex-1 flex flex-col">
        <Toolbar 
          onModeChange={setVisualizationMode}
          activeMode={visualizationMode}
          onSearch={setSearchQuery}
        />
        <main className="flex-1">
          <StarVisualization 
            filters={filters}
            visualizationMode={visualizationMode}
            searchQuery={searchQuery}
          />
        </main>
      </div>
    </div>
  );
};

export default App;