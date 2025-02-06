import React, { useRef, useState } from "react";
import StarVisualization from "./components/StarVisualization";
import Sidebar from "./components/UI/Sidebar";
import Toolbar from "./components/UI/Toolbar";

const App = () => {
  const starVisualizationRef = useRef();
  const [activeModes, setActiveModes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFreeCamera, setIsFreeCamera] = useState(false);
  const [filters, setFilters] = useState({
    magnitude: 6.0,
    magnitudeType: "apparent",
    minTemp: 2000,
    maxDistance: 1000,
  });

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const handleModeChange = (mode) => {
    setActiveModes((prev) => {
      const modeExists = prev.includes(mode);
      if (modeExists) {
        return prev.filter((m) => m !== mode);
      } else {
        return [...prev, mode];
      }
    });
  };

  const handleCameraToggle = () => {
    setIsFreeCamera(!isFreeCamera);
  };

  return (
    <div className="flex h-screen">
      <Sidebar filters={filters} onFilterChange={handleFilterChange} />
      <div className="flex-1 flex flex-col">
        <Toolbar
          onModeChange={handleModeChange}
          activeModes={activeModes}
          onSearch={setSearchQuery}
          onCameraToggle={() => starVisualizationRef.current?.toggleCamera()}
          isFreeCamera={isFreeCamera}
        />
        <main className="flex-1">
          <StarVisualization
            ref={starVisualizationRef}
            filters={filters}
            activeModes={activeModes}
            searchQuery={searchQuery}
            isFreeCamera={isFreeCamera}
            onCameraToggle={handleCameraToggle}
          />
        </main>
      </div>
    </div>
  );
};

export default App;
