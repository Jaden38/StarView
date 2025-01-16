import React from 'react';
import StarVisualization from './components/StarVisualization';
import Sidebar from './components/UI/Sidebar';
import Toolbar from './components/UI/Toolbar';

const App = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Toolbar />
        <main className="flex-1">
          <StarVisualization />
        </main>
      </div>
    </div>
  );
};

export default App;