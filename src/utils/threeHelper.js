import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export const setupScene = (container) => {
  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    10000
  );
  camera.position.z = 1000;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0x000000, 1);
  container.appendChild(renderer.domElement);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Handle window resize
  const handleResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  window.addEventListener('resize', handleResize);

  // Cleanup function
  const cleanup = () => {
    window.removeEventListener('resize', handleResize);
    container.removeChild(renderer.domElement);
    renderer.dispose();
  };

  return { scene, camera, renderer, controls, cleanup };
};

export const createStarField = (stars) => {
  console.log('Creating star field with', stars.length, 'stars');
  
  const geometry = new THREE.BufferGeometry();
  const positions = [];
  const colors = [];
  const sizes = [];

  stars.forEach(star => {
    // Scale positions to be more visible
    positions.push(
      star.x * 100, 
      star.y * 100, 
      star.z * 100
    );
    
    // Color based on spectral type
    const color = getStarColor(star.spect);
    colors.push(color.r, color.g, color.b);
    
    // Size based on magnitude
    const size = getStarSize(star.mag);
    sizes.push(size);
  });

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 5,  // Increased base size
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    blending: THREE.AdditiveBlending
  });

  return new THREE.Points(geometry, material);
};

const getStarColor = (spectralType) => {
  const color = new THREE.Color();
  
  if (!spectralType) return color.setHSL(0, 0, 1);

  // Color based on spectral classification
  switch (spectralType[0]) {
    case 'O': return color.setHSL(0.6, 1, 0.9);  // Blue
    case 'B': return color.setHSL(0.55, 1, 0.8);
    case 'A': return color.setHSL(0.5, 1, 0.7);
    case 'F': return color.setHSL(0.45, 1, 0.6);
    case 'G': return color.setHSL(0.4, 1, 0.5);  // Like our Sun
    case 'K': return color.setHSL(0.35, 1, 0.4);
    case 'M': return color.setHSL(0.3, 1, 0.3);  // Red
    default: return color.setHSL(0, 0, 1);
  }
};

const getStarSize = (magnitude) => {
  if (magnitude === null || magnitude === undefined) return 2;
  // Inverse relationship: brighter stars (lower magnitude) appear larger
  return Math.max(2, 10 - magnitude);
};