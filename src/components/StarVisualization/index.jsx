import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import * as THREE from "three";
import useStarData from "../../hooks/useStarData";
import {PointerLockControls} from 'three/examples/jsm/controls/PointerLockControls';
import {
    createConstellationLines,
    createSolarSystem,
    createStarField,
    filterStars,
    setupScene,
} from "../../utils/threeHelper";

const StarVisualization = forwardRef(({ filters, activeModes, searchQuery, isFreeCamera, onCameraToggle }, ref) => {
  const containerRef = useRef();
  const isMouseDownRef = useRef(false);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const orbitControlsRef = useRef(null);
  const pointerControlsRef = useRef(null);
  const moveRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
    rotateLeft: false,
    rotateRight: false
  });
  const speedRef = useRef(50);
  const animationFrameRef = useRef(null);
  const { stars, loading, error } = useStarData();
  const [selectedStar, setSelectedStar] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [constellation, setConstellation] = useState(null);
  const [lastModes, setLastModes] = useState([]);

    const handleKeyDown = (event) => {
        if (!isFreeCamera) return;
        console.log('Key pressed:', event.key);
        switch (event.key.toLowerCase()) {
            case 'z': moveRef.current.forward = true; break;
            case 's': moveRef.current.backward = true; break;
            case 'q': moveRef.current.left = true; break;
            case 'd': moveRef.current.right = true; break;
            case 'arrowup': moveRef.current.up = true; break;
            case 'arrowdown': moveRef.current.down = true; break;
            case 'arrowleft': moveRef.current.rotateLeft = true; break;
            case 'arrowright': moveRef.current.rotateRight = true; break;
            case 'shift': speedRef.current = 100; break;
        }
    };

    const handleKeyUp = (event) => {
        if (!isFreeCamera) return;
        console.log('Key released:', event.key);
        switch (event.key.toLowerCase()) {
            case 'z': moveRef.current.forward = false; break;
            case 's': moveRef.current.backward = false; break;
            case 'q': moveRef.current.left = false; break;
            case 'd': moveRef.current.right = false; break;
            case 'arrowup': moveRef.current.up = false; break;
            case 'arrowdown': moveRef.current.down = false; break;
            case 'arrowleft': moveRef.current.rotateLeft = false; break;
            case 'arrowright': moveRef.current.rotateRight = false; break;
            case 'shift': speedRef.current = 50; break;
        }
    };

  const handleMouseDown = () => {
    isMouseDownRef.current = true;
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
  };

  const toggleCamera = () => {
    if (!cameraRef.current) return;

    const newIsFreeCamera = !isFreeCamera;
    onCameraToggle();

    if (!newIsFreeCamera) {
      pointerControlsRef.current.unlock();
      orbitControlsRef.current.enabled = true;
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);

      // Reset camera position
      cameraRef.current.position.set(0, 2000, 4000);
      cameraRef.current.lookAt(0, 0, 0);
      orbitControlsRef.current.target.set(0, 0, 0);
    } else {
      orbitControlsRef.current.enabled = false;
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
    }
  };

  useImperativeHandle(ref, () => ({
    toggleCamera
  }));

  // Star filtering logic remains the same
  const getFilteredStars = () => {
    if (!stars || !stars.length) return [];

    let filteredStars = [...stars];

    if (activeModes.includes("solarSystem")) {
      filteredStars = filteredStars.filter((star) => star.id !== 0);
    }

    if (activeModes.length > 0) {
      const modeStars = activeModes
        .filter((mode) => mode !== "solarSystem" && mode !== "constellations")
        .map((mode) => {
            return filterStars[mode]([...stars]);
        });

      if (modeStars.length > 0) {
        const starIds = new Set();
        filteredStars = modeStars.flat().filter((star) => {
          if (starIds.has(star.id)) return false;
          starIds.add(star.id);
          return true;
        });
      }

      if (activeModes.includes("constellations") && constellation) {
        filteredStars = filteredStars.filter(
          (star) => star.con === constellation
        );
      }
    }

    filteredStars = filteredStars.filter((star) => {
      const temp = getStarTemperature(star.spect);
      return (
        star.mag <= filters.magnitude &&
        star.dist <= filters.maxDistance &&
        temp >= filters.minTemp
      );
    });

    filteredStars = filteredStars.filter((star) => {
      const temp = getStarTemperature(star.spect);
      const relevantMagnitude =
        filters.magnitudeType === "apparent" ? star.mag : star.absmag;
      return (
        relevantMagnitude <= filters.magnitude &&
        star.dist <= filters.maxDistance &&
        temp >= filters.minTemp
      );
    });

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredStars = filteredStars.filter(
        (star) =>
          (star.proper && star.proper.toLowerCase().includes(query)) ||
          (star.con && star.con.toLowerCase().includes(query))
      );
    }

    return filteredStars;
  };

  const getStarTemperature = (spect) => {
    if (!spect) return 5000;
    const type = spect[0];
    const temps = {
      O: 30000,
      B: 20000,
      A: 9000,
      F: 7000,
      G: 5500,
      K: 4000,
      M: 3000,
    };
    return temps[type] || 5000;
  };

  // Initial setup effect - runs once
  useEffect(() => {
    if (!containerRef.current || loading) return;

    const { scene, camera, renderer, controls: orbitControls, raycaster, cleanup } = setupScene(containerRef.current);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    cameraRef.current = camera;
    orbitControlsRef.current = orbitControls;
    controlsRef.current = orbitControls;
    pointerControlsRef.current = new PointerLockControls(camera, containerRef.current);
    pointerControlsRef.current.pointerSpeed = 0.5; // Reduce mouse sensitivity

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current)
        return;

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameRef.current);
      cleanup();
    };
  }, [loading]);

  // Free camera effect
  useEffect(() => {
    if (!cameraRef.current) return;

    if (isFreeCamera) {
      orbitControlsRef.current.enabled = false;
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      orbitControlsRef.current.enabled = true;

      // Reset camera position
      cameraRef.current.position.set(0, 2000, 4000);
      cameraRef.current.lookAt(0, 0, 0);
      orbitControlsRef.current.target.set(0, 0, 0);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isFreeCamera]);

  // Scene update effect
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current || !controlsRef.current || loading) return;

    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const renderer = rendererRef.current;

    // Check if we're specifically switching to solar system mode
    const isNewSolarSystemMode =
        activeModes.includes('solarSystem') &&
        activeModes.length === 1 &&
        !lastModes.includes('solarSystem');

    // Update last modes for next comparison
    setLastModes(activeModes);

    // Clear existing objects
    while(scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    const raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 10;

    const mouse = new THREE.Vector2();
    const handleMouseMove = (event) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Handle solar system interactions
      if (activeModes.includes("solarSystem")) {
        const solarSystem = scene.children.find(
            (child) => child.userData.type === "solarSystem"
        );
        if (solarSystem) {
          const intersects = raycaster
              .intersectObjects(solarSystem.children, false)
              .filter((intersect) => intersect.object.userData.objectType);

          if (intersects.length > 0) {
            const object = intersects[0].object;
            setSelectedObject(object.userData);
            setSelectedStar(null);
          } else {
            setSelectedObject(null);
          }
        }
      }

      // Handle star interactions
      const starField = scene.children.find(
          (child) => child instanceof THREE.Points
      );
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
        } else if (!activeModes.includes("solarSystem")) {
          setSelectedStar(null);
        }
      }
    };

    // Add objects to scene
    const filteredStars = getFilteredStars();
    if (filteredStars.length > 0) {
      const starField = createStarField(filteredStars, [], constellation);
      scene.add(starField);

      if (activeModes.includes("constellations") && constellation) {
        const constellationLines = createConstellationLines(
            filteredStars,
            constellation
        );
        if (constellationLines) {
          scene.add(constellationLines);
        }
      }
    }

    if (activeModes.includes('solarSystem')) {
      const solarSystem = createSolarSystem();
      scene.add(solarSystem);

      if (isNewSolarSystemMode) {
        camera.position.set(0, 2000, 4000);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
      }
    }

    const handleMouseMovement = (event) => {
      if (isFreeCamera && isMouseDownRef.current) {
        const movementX = event.movementX || 0;
        const movementY = event.movementY || 0;

        // Create a quaternion for horizontal rotation around Y axis
        const horizontalRotation = new THREE.Quaternion();
        horizontalRotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -movementX * 0.002);

        // Create a quaternion for vertical rotation around right vector
        const right = new THREE.Vector3(1, 0, 0);
        right.applyQuaternion(camera.quaternion);
        const verticalRotation = new THREE.Quaternion();
        verticalRotation.setFromAxisAngle(right, -movementY * 0.002);

        // Apply rotations in correct order
        camera.quaternion.multiplyQuaternions(verticalRotation, camera.quaternion);
        camera.quaternion.multiplyQuaternions(horizontalRotation, camera.quaternion);

        // Normalize to prevent accumulated errors
        camera.quaternion.normalize();
      }
    };

    containerRef.current.addEventListener("mousedown", handleMouseDown);
    containerRef.current.addEventListener("mouseup", handleMouseUp);
    containerRef.current.addEventListener("mousemove", handleMouseMove);
    containerRef.current.addEventListener("mousemove", handleMouseMovement);

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (isFreeCamera) {
        const camera = cameraRef.current;
        const direction = new THREE.Vector3();
        const sideVector = new THREE.Vector3();

        camera.getWorldDirection(direction);
        camera.getWorldDirection(sideVector);
        sideVector.cross(camera.up);

          const { forward, backward, left, right, up, down, rotateLeft, rotateRight } = moveRef.current;
          const speed = speedRef.current;

          if (forward) camera.position.addScaledVector(direction, speed);
          if (backward) camera.position.addScaledVector(direction, -speed);
          if (left) camera.position.addScaledVector(sideVector, -speed);
          if (right) camera.position.addScaledVector(sideVector, speed);
          if (forward) camera.position.addScaledVector(direction, speed);
          if (backward) camera.position.addScaledVector(direction, -speed);
          if (left) camera.position.addScaledVector(sideVector, -speed);
          if (right) camera.position.addScaledVector(sideVector, speed);
          if (up) camera.position.y += speed;
          if (down) camera.position.y -= speed;
          if (rotateLeft) {
              const rotation = new THREE.Quaternion();
              rotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), 0.03);
              camera.quaternion.multiplyQuaternions(rotation, camera.quaternion);
          }
          if (rotateRight) {
              const rotation = new THREE.Quaternion();
              rotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -0.03);
              camera.quaternion.multiplyQuaternions(rotation, camera.quaternion);
          }
      } else {
        orbitControlsRef.current?.update();
      }

      if (activeModes.includes("solarSystem")) {
        const solarSystem = scene.children.find(
            (child) => child.userData.type === "solarSystem"
        );
        if (solarSystem) {
          solarSystem.children.forEach((child) => {
            if (child.userData.objectType === "planet") {
              const orbitalDistance = child.userData.distance * 2e-6;
              const orbitalPeriod = child.userData.orbitalPeriod;
              const angularSpeed = (2 * Math.PI) / (orbitalPeriod * 60);
              const time = performance.now() * 0.001;
              const angle = time * angularSpeed;

              child.position.x = orbitalDistance * Math.cos(angle);
              child.position.z = orbitalDistance * Math.sin(angle);
            }
          });
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      if (containerRef.current) {
        containerRef.current.removeEventListener("mousemove", handleMouseMove);
        containerRef.current.removeEventListener("mousemove", handleMouseMovement);
        containerRef.current.removeEventListener("mousedown", handleMouseDown);
        containerRef.current.removeEventListener("mouseup", handleMouseUp);
      }
    };
  }, [stars, loading, activeModes, filters, searchQuery, constellation, isFreeCamera]);

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
            <p>Constellation: {selectedStar.con || "Unknown"}</p>
            <p>Distance: {selectedStar.dist.toFixed(2)} parsecs</p>
            <p>Magnitude: {selectedStar.mag.toFixed(2)}</p>
            <p>Spectral Type: {selectedStar.spect || "Unknown"}</p>
            {selectedStar.lum && (
              <p>Luminosity: {selectedStar.lum.toFixed(2)} × Sun</p>
            )}
          </div>
        </div>
      )}

      {selectedObject && (
        <div className="absolute bottom-4 left-4 bg-gray-800 bg-opacity-90 text-white p-4 rounded shadow-lg">
          <h3 className="font-bold text-xl">{selectedObject.name}</h3>
          <div className="space-y-1 mt-2">
            <p>
              Type: {selectedObject.objectType === "sun" ? "Star" : "Planet"}
            </p>
            {selectedObject.objectType === "sun" ? (
              <>
                <p>Spectral Type: {selectedObject.type}</p>
                <p>Temperature: {formatNumber(selectedObject.temperature)}K</p>
                <p>Radius: {formatNumber(selectedObject.radius)} km</p>
                <p>Mass: {selectedObject.mass} solar masses</p>
              </>
            ) : (
              <>
                <p>
                  Distance from Sun:{" "}
                  {formatNumber(selectedObject.distance / 1e6)} million km
                </p>
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

      {isFreeCamera && (
          <div className="absolute top-20 left-4 bg-gray-800 bg-opacity-90 text-white p-2 rounded">
            <div className="text-sm">
              <p>Controls:</p>
              <ul className="list-disc pl-4">
                <li>ZQSD: Move forward, backward, left, and right</li>
                <li>Arrow keys: Vertical (up/down) and rotational movement</li>
                <li>Mouse: Look around</li>
                <li>Shift: Speed up</li>
              </ul>
            </div>
          </div>
      )}
    </div>
  );
});

export default StarVisualization;
