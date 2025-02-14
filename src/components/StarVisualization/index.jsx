import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import * as THREE from "three";
import useStarData from "../../hooks/useStarData";
import CameraControls from "./CameraControls";
import StarInfoPanel from "./StarInfoPanel";
import ObjectInfoPanel from "./ObjectInfoPanel";
import ErrorMessage from "./ErrorMessage";
import useCameraControls from "../../hooks/useCameraControls";
import useStarFilter from "../../hooks/useStarFilter";
import {
  CONSTELLATION_CONNECTIONS,
  createConstellationLines,
  createSolarSystem,
  createStarField,
  setupScene,
} from "../../utils/threeHelper";

const StarVisualization = forwardRef(
    ({ filters, activeModes, searchQuery, isFreeCamera, onCameraToggle }, ref) => {
      const containerRef = useRef();
      const sceneRef = useRef(null);
      const rendererRef = useRef(null);
      const cameraRef = useRef(null);
      const controlsRef = useRef(null);
      const orbitControlsRef = useRef(null);
      const animationFrameRef = useRef(null);
      const resizeObserverRef = useRef(null);
      const constellationLinesRef = useRef([]);
      const starFieldRef = useRef(null);

      const { stars, loading, error } = useStarData();
      const [selectedStar, setSelectedStar] = useState(null);
      const [selectedObject, setSelectedObject] = useState(null);
      const [constellation, setConstellation] = useState(null);
      const [lastModes, setLastModes] = useState([]);
      const [activeConstellationLines] = useState(new Map());

      const { updateCameraPosition } = useCameraControls(
          cameraRef.current,
          containerRef,
          isFreeCamera,
          orbitControlsRef.current
      );

      const filteredStars = useStarFilter(
          stars,
          filters,
          activeModes,
          searchQuery,
          constellation
      );

      const handleResize = () => {
        if (!containerRef.current || !cameraRef.current || !rendererRef.current)
          return;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
        rendererRef.current.setPixelRatio(window.devicePixelRatio);
      };

      useEffect(() => {
        resizeObserverRef.current = new ResizeObserver((entries) => {
          for (const entry of entries) {
            if (entry.target === containerRef.current) {
              handleResize();
            }
          }
        });

        if (containerRef.current) {
          resizeObserverRef.current.observe(containerRef.current);
        }

        return () => {
          if (resizeObserverRef.current) {
            resizeObserverRef.current.disconnect();
          }
        };
      }, []);

      const toggleCamera = () => {
        if (!cameraRef.current) return;
        onCameraToggle();
      };

      useImperativeHandle(ref, () => ({
        toggleCamera,
      }));

      useEffect(() => {
        if (!containerRef.current || loading) return;

        const {
          scene,
          camera,
          renderer,
          controls: orbitControls,
          cleanup,
        } = setupScene(containerRef.current);

        sceneRef.current = scene;
        rendererRef.current = renderer;
        cameraRef.current = camera;
        orbitControlsRef.current = orbitControls;
        controlsRef.current = orbitControls;

        window.addEventListener("resize", handleResize);

        return () => {
          window.removeEventListener("resize", handleResize);
          cancelAnimationFrame(animationFrameRef.current);
          cleanup();
        };
      }, [loading]);

      useEffect(() => {
        if (!sceneRef.current || !cameraRef.current || !controlsRef.current || loading) return;

        const scene = sceneRef.current;
        const camera = cameraRef.current;
        const controls = controlsRef.current;
        const renderer = rendererRef.current;

        const isNewSolarSystemMode =
            activeModes.includes("solarSystem") &&
            activeModes.length === 1 &&
            !lastModes.includes("solarSystem");

        setLastModes(activeModes);

        const currentConstellationLines = new Set(constellationLinesRef.current);

        scene.children.forEach(child => {
          if (!currentConstellationLines.has(child)) {
            scene.remove(child);
          }
        });

        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
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

        if (filteredStars.length > 0) {
          const starField = createStarField(filteredStars, [], constellation);
          starFieldRef.current = starField;
          scene.add(starField);

          if (activeModes.includes("constellations")) {
            const constellations = [...new Set(filteredStars.map((star) => star.con))];

            constellations.forEach((con) => {
              if (con && CONSTELLATION_CONNECTIONS[con]) {
                let constellationLines = constellationLinesRef.current.find(
                    line => line.userData.constellation === con
                );

                if (!constellationLines) {
                  constellationLines = createConstellationLines(filteredStars, con);
                  if (constellationLines) {
                    constellationLines.material.needsUpdate = true;
                    constellationLines.frustumCulled = false;
                    constellationLines.renderOrder = 1;
                    scene.add(constellationLines);
                    constellationLinesRef.current.push(constellationLines);
                  }
                } else {
                  constellationLines.material.needsUpdate = true;
                  constellationLines.visible = true;
                  if (!scene.children.includes(constellationLines)) {
                    scene.add(constellationLines);
                  }
                }
              }
            });
          }
        }

        if (activeModes.includes("solarSystem")) {
          const solarSystem = createSolarSystem();
          scene.add(solarSystem);

          if (isNewSolarSystemMode) {
            camera.position.set(0, 2000, 4000);
            camera.lookAt(0, 0, 0);
            controls.target.set(0, 0, 0);
          }
        }

        containerRef.current.addEventListener("mousemove", handleMouseMove);

        const animate = () => {
          animationFrameRef.current = requestAnimationFrame(animate);

          if (isFreeCamera) {
            updateCameraPosition();
          } else {
            orbitControlsRef.current?.update();
          }

          constellationLinesRef.current.forEach(lines => {
            if (lines && lines.material) {
              lines.material.needsUpdate = true;
              if (lines.visible !== activeModes.includes("constellations")) {
                lines.visible = activeModes.includes("constellations");
              }
            }
          });

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
          }

          constellationLinesRef.current.forEach(line => {
            if (line) {
              line.visible = false;
            }
          });
        };
      }, [
        stars,
        loading,
        activeModes,
        filters,
        searchQuery,
        constellation,
        isFreeCamera,
        updateCameraPosition,
        filteredStars,
      ]);

      return (
          <div className="relative w-full h-full">
            <div ref={containerRef} className="absolute inset-0" />
            <StarInfoPanel selectedStar={selectedStar} />
            <ObjectInfoPanel selectedObject={selectedObject} />
            <ErrorMessage error={error} />
            <CameraControls isFreeCamera={isFreeCamera} />
          </div>
      );
    }
);

StarVisualization.propTypes = {
  filters: PropTypes.object.isRequired,
  activeModes: PropTypes.arrayOf(PropTypes.string).isRequired,
  searchQuery: PropTypes.string.isRequired,
  isFreeCamera: PropTypes.bool.isRequired,
  onCameraToggle: PropTypes.func.isRequired,
};

export default StarVisualization;