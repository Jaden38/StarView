import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { SOLAR_SYSTEM, planetTextures } from "../data/solarSystemData";
import { CONSTELLATION_CONNECTIONS } from "../data/constellationData";

const textureLoader = new THREE.TextureLoader();
const textureCache = new Map();
const loadTexture = (path) => {
  if (textureCache.has(path)) {
    return textureCache.get(path);
  }

  const texture = textureLoader.load(path, (texture) => {
    texture.anisotropy = 16;
    texture.needsUpdate = true;
  });

  textureCache.set(path, texture);
  return texture;
};

const createStarShaderMaterial = () => {
  const vertexShader = `
    attribute float size;
    varying vec3 vColor;
    
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    
    void main() {
      
      vec2 center = vec2(0.5, 0.5);
      float dist = distance(gl_PointCoord, center);
      
      
      float core = smoothstep(0.5, 0.0, dist);
      
      
      float glow = 1.0 - smoothstep(0.0, 0.5, dist);
      glow = pow(glow, 2.0); 
      
      
      vec3 color = vColor;
      float alpha = core + glow * 0.6; 
      
      
      vec3 glowColor = mix(color, vec3(0.8, 0.9, 1.0), 0.3);
      color = mix(glowColor, color, core / (core + glow));
      
      
      gl_FragColor = vec4(color, alpha);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    vertexColors: true,
  });
};

export const setupScene = (container) => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.001,
    1000000
  );

  camera.position.set(0, 2000, 4000);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0x000000, 1);
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxDistance = 100000;
  controls.minDistance = 1;

  const ambientLight = new THREE.AmbientLight(0x404040, 2);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(1, 1, 1);
  scene.add(directionalLight);

  const raycaster = new THREE.Raycaster();
  raycaster.params.Points.threshold = 20;

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
      .filter((star) => star.mag <= 6)
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
      .filter((star) => star.lum)
      .sort((a, b) => b.lum - a.lum)
      .slice(0, limit);
  },

  constellations: (stars, constellation = null) => {
    if (!constellation) return stars;
    return stars.filter((star) => {
      if (star.con !== constellation) return false;

      const connections = CONSTELLATION_CONNECTIONS[constellation];
      if (!connections) return false;

      const hipId = parseInt(star.hip);
      return connections.some(
        ([hip1, hip2]) => hipId === hip1 || hipId === hip2
      );
    });
  },
};

const getStarColor = (spectralType, isHighlighted = false) => {
  const color = new THREE.Color();

  if (!spectralType) return color.setRGB(1, 1, 0.95);

  let r, g, b;

  switch (spectralType[0]) {
    case "O":
      r = 0.5;
      g = 0.6;
      b = 1.0;
      break;
    case "B":
      r = 0.7;
      g = 0.8;
      b = 1.0;
      break;
    case "A":
      r = 0.95;
      g = 0.95;
      b = 1.0;
      break;
    case "F":
      r = 1.0;
      g = 1.0;
      b = 0.9;
      break;
    case "G":
      r = 1.0;
      g = 0.95;
      b = 0.8;
      break;
    case "K":
      r = 1.0;
      g = 0.8;
      b = 0.5;
      break;
    case "M":
      r = 1.0;
      g = 0.5;
      b = 0.2;
      break;
    default:
      r = 1.0;
      g = 1.0;
      b = 1.0;
  }

  if (isHighlighted) {
    r = Math.min(1.0, r + 0.1);
    g = Math.min(1.0, g + 0.1);
    b = Math.min(1.0, b + 0.1);
  }

  return color.setRGB(r, g, b);
};

const getStarSize = (magnitude, isHighlighted = false) => {
  if (magnitude === null || magnitude === undefined) return 3;

  let size = 3 + Math.pow(1.8, 6 - magnitude);

  size = Math.min(size, 25);

  if (isHighlighted) {
    size *= 1.4;
  }

  return size;
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

  const material = createStarShaderMaterial();

  const points = new THREE.Points(geometry, material);
  points.userData.stars = stars;

  points.frustumCulled = false;

  return points;
};

export const createConstellationLines = (stars, constellationAbbreviation) => {
  if (!constellationAbbreviation) {
    return null;
  }

  const connections = CONSTELLATION_CONNECTIONS[constellationAbbreviation];
  if (!connections?.length) {
    console.log(`No connections found for ${constellationAbbreviation}`);
    return null;
  }

  const starMap = new Map();
  stars.forEach((star) => {
    if (star.hip) {
      starMap.set(parseInt(star.hip), star);
    }
  });

  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const validConnections = [];

  connections.forEach(([hip1, hip2]) => {
    const star1 = starMap.get(parseInt(hip1));
    const star2 = starMap.get(parseInt(hip2));

    if (star1 && star2) {
      positions.push(
        star1.x * 100,
        star1.y * 100,
        star1.z * 100,
        star2.x * 100,
        star2.y * 100,
        star2.z * 100
      );
      validConnections.push([star1, star2]);
    }
  });

  if (positions.length === 0) {
    console.log("No valid connections found for constellation");
    return null;
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const material = new THREE.LineBasicMaterial({
    color: 0x6080ff,
    opacity: 0.7,
    transparent: true,
    linewidth: 1,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });

  const lines = new THREE.LineSegments(geometry, material);
  lines.userData = {
    type: "constellationLines",
    constellation: constellationAbbreviation,
    referenceCount: 1,
  };

  lines.renderOrder = 1;
  lines.frustumCulled = false;

  return lines;
};

export const createSolarSystem = (scale = 2e-6) => {
  const group = new THREE.Group();
  group.userData.type = "solarSystem";

  const sunGeometry = new THREE.SphereGeometry(
    SOLAR_SYSTEM.sun.radius * scale * 20,
    32,
    32
  );

  const sunTexture = loadTexture("assets/sun.jpg");

  const sunMaterial = new THREE.MeshBasicMaterial({
    map: sunTexture,
    color: 0xffff80,
    emissive: 0xffaa00,
  });

  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.userData = {
    ...SOLAR_SYSTEM.sun,
    objectType: "sun",
  };

  const sunGlowGeometry = new THREE.SphereGeometry(
    SOLAR_SYSTEM.sun.radius * scale * 22,
    32,
    32
  );

  const sunGlowMaterial = new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      void main() {
        float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
        gl_FragColor = vec4(1.0, 0.8, 0.3, 1.0) * intensity;
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.BackSide,
  });

  const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
  sun.add(sunGlow);
  sun.renderOrder = 1;
  group.add(sun);

  SOLAR_SYSTEM.planets.forEach((planet) => {
    const planetGeometry = new THREE.SphereGeometry(
      planet.radius * scale * 2000,
      32,
      32
    );

    let texture = null;
    if (planetTextures[planet.name]) {
      const texturePath = `assets/${planetTextures[planet.name]}`;
      texture = loadTexture(texturePath);
    }

    const planetMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 15,
    });

    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    planetMesh.position.x = planet.distance * scale;
    planetMesh.userData = {
      ...planet,
      objectType: "planet",
    };

    if (planet.name === "Earth") {
      const atmosphereGeometry = new THREE.SphereGeometry(
        planet.radius * scale * 2100,
        32,
        32
      );

      const atmosphereMaterial = new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 1.5);
            gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
      planetMesh.add(atmosphere);
    }

    planetMesh.renderOrder = 1;
    group.add(planetMesh);

    const orbitGeometry = new THREE.RingGeometry(
      planet.distance * scale,
      planet.distance * scale * 1.001,
      128
    );

    const orbitMaterial = new THREE.LineBasicMaterial({
      color: 0x6666aa,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    orbit.renderOrder = 0;
    group.add(orbit);
  });

  return group;
};
