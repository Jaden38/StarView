import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import useStarData from '../../hooks/useStarData';
import { setupScene, createStarField } from '../../utils/threeHelper';

const StarVisualization = () => {
  const containerRef = useRef();
  const { stars, loading, error } = useStarData();
  const [selectedStar, setSelectedStar] = useState(null);
  const [debug, setDebug] = useState('');

  useEffect(() => {
    if (!containerRef.current || loading || !stars.length) {
      setDebug(`Container: ${!!containerRef.current}, Loading: ${loading}, Stars: ${stars.length}`);
      return;
    }

    try {
      const { scene, camera, renderer, controls, cleanup } = setupScene(containerRef.current);
      
      // Add a simple grid helper for debugging
      const gridHelper = new THREE.GridHelper(2000, 20);
      scene.add(gridHelper);
      
      // Create and add starField
      const starField = createStarField(stars);
      scene.add(starField);
      
      console.log('Star field created with vertices:', starField.geometry.attributes.position.count);

      // Animation loop
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      return () => {
        cleanup();
        scene.remove(starField);
        scene.remove(gridHelper);
      };
    } catch (err) {
      setDebug(`Error in scene setup: ${err.message}`);
      console.error('Scene setup error:', err);
    }
  }, [stars, loading]);

  return (
    <div className="relative w-full h-full bg-black">
      <div ref={containerRef} className="w-full h-full" />
      {debug && (
        <div className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded">
          Debug: {debug}
        </div>
      )}
      {selectedStar && (
        <div className="absolute bottom-4 left-4 bg-gray-800 text-white p-4 rounded shadow-lg">
          <h3 className="font-bold">{selectedStar.proper || `Star ${selectedStar.id}`}</h3>
          <p>Distance: {selectedStar.dist} parsecs</p>
          <p>Magnitude: {selectedStar.mag}</p>
          <p>Spectral Type: {selectedStar.spect}</p>
        </div>
      )}
    </div>
  );
};

export default StarVisualization;