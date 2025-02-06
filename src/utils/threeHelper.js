import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// Solar system data
const SOLAR_SYSTEM = {
  sun: {
    name: "Sun",
    radius: 696340,
    color: 0xffff00,
    temperature: 5778,
    type: "G2V",
    mass: 1, // Solar masses
    distance: 0,
  },
  planets: [
    {
      name: "Mercury",
      radius: 2440,
      distance: 57.9e6,
      color: 0x8c8c8c,
      temperature: 440,
      mass: 0.055,
      orbitalPeriod: 88,
      moons: 0,
    },
    {
      name: "Venus",
      radius: 6052,
      distance: 108.2e6,
      color: 0xe6b800,
      temperature: 737,
      mass: 0.815,
      orbitalPeriod: 225,
      moons: 0,
    },
    {
      name: "Earth",
      radius: 6371,
      distance: 149.6e6,
      color: 0x0066ff,
      temperature: 288,
      mass: 1,
      orbitalPeriod: 365,
      moons: 1,
    },
    {
      name: "Mars",
      radius: 3390,
      distance: 227.9e6,
      color: 0xff4d4d,
      temperature: 210,
      mass: 0.107,
      orbitalPeriod: 687,
      moons: 2,
    },
    {
      name: "Jupiter",
      radius: 69911,
      distance: 778.5e6,
      color: 0xffad33,
      temperature: 165,
      mass: 317.8,
      orbitalPeriod: 4333,
      moons: 79,
    },
    {
      name: "Saturn",
      radius: 58232,
      distance: 1.434e9,
      color: 0xffcc00,
      temperature: 134,
      mass: 95.2,
      orbitalPeriod: 10759,
      moons: 82,
    },
    {
      name: "Uranus",
      radius: 25362,
      distance: 2.871e9,
      color: 0x00ffff,
      temperature: 76,
      mass: 14.5,
      orbitalPeriod: 30687,
      moons: 27,
    },
    {
      name: "Neptune",
      radius: 24622,
      distance: 4.495e9,
      color: 0x0000ff,
      temperature: 72,
      mass: 17.1,
      orbitalPeriod: 60190,
      moons: 14,
    },
  ],
};

export const CONSTELLATION_CONNECTIONS = {
  And: [["3", "9", "11", "19", "30"]],
  Psc: [["1", "6", "14", "21", "31", "44"]],
  Cet: [["2", "13", "24", "26", "33", "35", "39"]],
  Phe: [["4", "5", "10", "16", "17", "22", "25", "27", "28", "29"]],
  Peg: [["7", "8", "20", "23", "34", "36", "42"]],
  Cas: [["15", "32", "40", "43"]],
  Oct: [["38", "52"]],
  Cep: [["41", "73", "86"]],
  Tuc: [["45", "55", "57", "60", "66"]],
  Scl: [["46", "53", "64", "77"]],
};

export const setupScene = (container) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Adjusted camera settings with much larger far clipping plane
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.001, // Smaller near plane to see close objects
    1000000 // Much larger far plane to see distant objects
  );

  // Position camera further out to see more of the solar system
  camera.position.set(0, 2000, 4000);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0x000000, 1);
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxDistance = 100000; // Allow zooming out further
  controls.minDistance = 1; // Allow zooming in closer

  // Add ambient light for better visibility
  const ambientLight = new THREE.AmbientLight(0x404040, 2); // Increased intensity
  scene.add(ambientLight);

  // Add directional light for shadows
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // Increased intensity
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  // Raycaster setup with adjusted threshold
  const raycaster = new THREE.Raycaster();
  raycaster.params.Points.threshold = 20; // Increased for better selection

  const handleResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  window.addEventListener("resize", handleResize);

  const cleanup = () => {
    window.removeEventListener("resize", handleResize);
    container.removeChild(renderer.domElement);
    renderer.dispose();
  };

  return { scene, camera, renderer, controls, raycaster, cleanup };
};

export const filterStars = {
  closest: (stars, limit = 50) => {
    return [...stars]
      .filter((star) => star.mag <= 6) // Only visible stars (magnitude <= 6)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, limit);
  },

  brightest: (stars, limit = 50) => {
    return [...stars].sort((a, b) => a.mag - b.mag).slice(0, limit);
  },

  hottest: (stars, limit = 50) => {
    const getTemp = (spect) => {
      if (!spect) return 0;
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
      return temps[type] || 0;
    };
    return [...stars]
      .sort((a, b) => getTemp(b.spect) - getTemp(a.spect))
      .slice(0, limit);
  },

  largest: (stars, limit = 50) => {
    return [...stars]
      .filter((star) => star.lum) // Only stars with known luminosity
      .sort((a, b) => b.lum - a.lum)
      .slice(0, limit);
  },

  constellations: (stars, constellation = null) => {
    if (!constellation) return stars;
    return stars.filter((star) => star.con === constellation);
  },
};

export const createStarField = (
  stars,
  highlightedStars = [],
  constellation = null
) => {
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];
  const sizes = [];

  stars.forEach((star) => {
    positions.push(star.x * 100, star.y * 100, star.z * 100);

    const isHighlighted =
      highlightedStars.includes(star.id) ||
      (constellation && star.con === constellation);
    const color = getStarColor(star.spect, isHighlighted);
    colors.push(color.r, color.g, color.b);

    const size = getStarSize(star.mag, isHighlighted);
    sizes.push(size);
  });

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute("size", new THREE.Float32BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 5,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.userData.stars = stars;

  return points;
};

export const createConstellationLines = (stars, constellationAbbreviation) => {
  const connections = CONSTELLATION_CONNECTIONS[constellationAbbreviation];
  if (!connections || !connections.length) return null;

  const geometry = new THREE.BufferGeometry();
  const positions = [];

  // Filter stars for this constellation and create a map by ID
  const starMap = {};
  stars
    .filter((star) => star.con === constellationAbbreviation)
    .forEach((star) => {
      starMap[star.id] = star;
    });

  // For each connection in the constellation
  connections.forEach((connection) => {
    for (let i = 0; i < connection.length - 1; i++) {
      const star1 = starMap[connection[i]];
      const star2 = starMap[connection[i + 1]];

      if (star1 && star2) {
        positions.push(
          star1.x * 100,
          star1.y * 100,
          star1.z * 100,
          star2.x * 100,
          star2.y * 100,
          star2.z * 100
        );
      }
    }
  });

  if (positions.length === 0) return null;

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const material = new THREE.LineBasicMaterial({
    color: 0x4444ff,
    opacity: 0.6,
    transparent: true,
    linewidth: 2,
  });

  return new THREE.LineSegments(geometry, material);
};

export const createSolarSystem = (scale = 2e-6) => {
  const group = new THREE.Group();
  group.userData.type = "solarSystem";

  // Keep sun size the same
  const sunGeometry = new THREE.SphereGeometry(
    SOLAR_SYSTEM.sun.radius * scale * 20, // Keep existing sun scale
    32,
    32
  );
  const sunMaterial = new THREE.MeshBasicMaterial({
    color: SOLAR_SYSTEM.sun.color,
  });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.userData = {
    ...SOLAR_SYSTEM.sun,
    objectType: "sun",
  };
  group.add(sun);

  // Increase base multiplier for planets
  SOLAR_SYSTEM.planets.forEach((planet) => {
    const planetGeometry = new THREE.SphereGeometry(
      planet.radius * scale * 2000, // Increased from 1000 to 2000
      32,
      32
    );
    const planetMaterial = new THREE.MeshPhongMaterial({ color: planet.color });
    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);

    // Position planet
    planetMesh.position.x = planet.distance * scale;

    // Add planet data to userData for tooltips
    planetMesh.userData = {
      ...planet,
      objectType: "planet",
    };

    // Add orbit line
    const orbitGeometry = new THREE.RingGeometry(
      planet.distance * scale,
      planet.distance * scale,
      64
    );
    const orbitMaterial = new THREE.LineBasicMaterial({
      color: 0x444444,
      transparent: true,
      opacity: 0.3,
    });
    const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;

    group.add(planetMesh);
    group.add(orbit);
  });

  return group;
};

const getStarColor = (spectralType, isHighlighted = false) => {
  const color = new THREE.Color();

  if (!spectralType) return color.setHSL(0, 0, 1);

  let h, s, l;
  switch (spectralType[0]) {
    case "O":
      [h, s, l] = [0.6, 1, 0.9];
      break;
    case "B":
      [h, s, l] = [0.55, 1, 0.8];
      break;
    case "A":
      [h, s, l] = [0.5, 1, 0.7];
      break;
    case "F":
      [h, s, l] = [0.45, 1, 0.6];
      break;
    case "G":
      [h, s, l] = [0.4, 1, 0.5];
      break;
    case "K":
      [h, s, l] = [0.35, 1, 0.4];
      break;
    case "M":
      [h, s, l] = [0.3, 1, 0.3];
      break;
    default:
      [h, s, l] = [0, 0, 1];
  }

  if (isHighlighted) {
    l = Math.min(1, l + 0.3);
  }

  return color.setHSL(h, s, l);
};

const getStarSize = (magnitude, isHighlighted = false) => {
  if (magnitude === null || magnitude === undefined) return 2;
  let size = Math.max(2, 10 - magnitude);
  if (isHighlighted) {
    size *= 1.5;
  }
  return size;
};
