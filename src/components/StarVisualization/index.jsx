import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import useStarData from '../../hooks/useStarData';
import { 
  setupScene, 
  createStarField, 
  createConstellationLines, 
  createSolarSystem,
  filterStars 
} from '../../utils/threeHelper';

const StarVisualization = ({ filters, visualizationMode, searchQuery }) => {
  const containerRef = useRef();
  const sceneRef = useRef(null);
  const { stars, loading, error } = useStarData();
  const [selectedStar, setSelectedStar] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [constellation, setConstellation] = useState(null);

  // Apply all filters to stars
  const getFilteredStars = () => {
    if (!stars || !stars.length) return [];
    
    let filteredStars = [...stars];

    // Apply visualization mode filters first
    if (visualizationMode !== 'all' && visualizationMode !== 'solarSystem') {
      if (visualizationMode === 'constellations') {
        filteredStars = filterStars.constellations(filteredStars, constellation);
      } else {
        filteredStars = filterStars[visualizationMode](filteredStars);
      }
    }

    // Then apply basic filters
    filteredStars = filteredStars.filter(star => {
      const temp = getStarTemperature(star.spect);
      return (
        star.mag <= filters.magnitude &&
        star.dist <= filters.maxDistance &&
        temp >= filters.minTemp
      );
    });

    // Apply search filter if any
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredStars = filteredStars.filter(star => 
        (star.proper && star.proper.toLowerCase().includes(query)) ||
        (star.con && star.con.toLowerCase().includes(query))
      );
      
      // If search matches a constellation, set it as active
      const matchedConstellation = filteredStars.find(star => 
        star.con && star.con.toLowerCase().includes(query)
      )?.con;
      if (matchedConstellation) {
        setConstellation(matchedConstellation);
      }
    }

    return filteredStars;
  };

  const getStarTemperature = (spect) => {
    if (!spect) return 5000;
    const type = spect[0];
    const temps = { O: 30000, B: 20000, A: 9000, F: 7000, G: 5500, K: 4000, M: 3000 };
    return temps[type] || 5000;
  };

  useEffect(() => {
    if (!containerRef.current || loading) return;

    const { scene, camera, renderer, controls, raycaster, cleanup } = setupScene(containerRef.current);
    sceneRef.current = scene;

    // Mouse position handler
    const mouse = new THREE.Vector2();
    const handleMouseMove = (event) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      if (visualizationMode === 'solarSystem') {
        const solarSystem = scene.children.find(child => child.userData.type === 'solarSystem');
        if (solarSystem) {
          const intersects = raycaster.intersectObjects(solarSystem.children, false)
            .filter(intersect => intersect.object.userData.objectType);

          if (intersects.length > 0) {
            const object = intersects[0].object;
            setSelectedObject(object.userData);
            setSelectedStar(null);
          } else {
            setSelectedObject(null);
          }
        }
      } else {
        const starField = scene.children.find(child => child instanceof THREE.Points);
        if (starField) {
          const intersects = raycaster.intersectObject(starField);
          if (intersects.length > 0) {
            const index = intersects[0].index;
            const star = starField.userData.stars[index];
            setSelectedStar(star);
            setSelectedObject(null);
            if (star.con) {
              setConstellation(star.con);
            }
          } else {
            setSelectedStar(null);
          }
        }
      }
    };

    if (visualizationMode === 'solarSystem') {
      const solarSystem = createSolarSystem();
      scene.add(solarSystem);
      camera.position.set(0, 1000, 2000);
      controls.target.set(0, 0, 0);
    } else {
      const filteredStars = getFilteredStars();
      if (filteredStars.length > 0) {
        const starField = createStarField(filteredStars, [], constellation);
        scene.add(starField);

        if (visualizationMode === 'constellations' && constellation) {
          const constellationLines = createConstellationLines(filteredStars, constellation);
          if (constellationLines) {
            scene.add(constellationLines);
          }
        }
      }
    }

    containerRef.current.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cleanup();
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
      }
      while(scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }
    };
  }, [stars, loading, visualizationMode, filters, searchQuery, constellation]);

  // Helper function to format large numbers
  const formatNumber = (num) => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toFixed(1);
  };

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="absolute inset-0" />
      
      {selectedStar && (
        <div className="absolute bottom-4 left-4 bg-gray-800 bg-opacity-90 text-white p-4 rounded shadow-lg">
          <h3 className="font-bold text-xl">
            {selectedStar.proper || `Star ${selectedStar.id}`}
          </h3>
          <div className="space-y-1 mt-2">
            <p>Constellation: {selectedStar.con || 'Unknown'}</p>
            <p>Distance: {selectedStar.dist.toFixed(2)} parsecs</p>
            <p>Magnitude: {selectedStar.mag.toFixed(2)}</p>
            <p>Spectral Type: {selectedStar.spect || 'Unknown'}</p>
            {selectedStar.lum && (
              <p>Luminosity: {selectedStar.lum.toFixed(2)} × Sun</p>
            )}
          </div>
        </div>
      )}

      {selectedObject && (
        <div className="absolute bottom-4 left-4 bg-gray-800 bg-opacity-90 text-white p-4 rounded shadow-lg">
          <h3 className="font-bold text-xl">
            {selectedObject.name}
          </h3>
          <div className="space-y-1 mt-2">
            <p>Type: {selectedObject.objectType === 'sun' ? 'Star' : 'Planet'}</p>
            {selectedObject.objectType === 'sun' ? (
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
      )}

      {error && (
        <div className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded">
          Error loading star data: {error}
        </div>
      )}
    </div>
  );
};

export default StarVisualization;