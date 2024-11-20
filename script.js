import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

// Debug
const gui = new dat.GUI();

// Loaders
const loader = new THREE.TextureLoader();

// Textures
const texture = loader.load("static/texture-6.jpg"); // ваша картинка
const height = loader.load("static/height-2.png"); // ваша карта нормалей

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Base Geometry and Morph Target
const geometry1 = new THREE.PlaneGeometry(3, 3, 512, 512); // Базовая геометрия
const geometry2 = new THREE.PlaneGeometry(3, 3, 512, 512); // Геометрия для морфинга

for (let i = 0; i < geometry2.attributes.position.count; i++) {
    geometry2.attributes.position.setZ(i, geometry2.attributes.position.getZ(i) + 0.5 * Math.sin(i));
}

// Добавляем морф-таргет к базовой геометрии
geometry1.morphAttributes.position = [geometry2.attributes.position];

// Material
const material = new THREE.MeshStandardMaterial({
  color: 'gray',
  map: texture,
  side: THREE.DoubleSide,
  displacementMap: height,
  displacementScale: 1,
  morphTargets: true // Включаем поддержку morph targets
});

// Mesh
const plane = new THREE.Mesh(geometry1, material);
scene.add(plane);
plane.rotation.x = Math.PI; // Поворот на 180 градусов

// Lights
const pointLight = new THREE.PointLight(0xffffff, 600);
pointLight.position.set(2, 3, 4);
scene.add(pointLight);

// UI Controls
const col = { color: '#D9D9D9' };

// Plane rotation
gui.add(plane.rotation, 'x').min(0).max(10);

// Light position
gui.add(pointLight.position, 'x').name('Light X').min(-10).max(10).step(0.1);
gui.add(pointLight.position, 'y').name('Light Y').min(-10).max(10).step(0.1);
gui.add(pointLight.position, 'z').name('Light Z').min(-10).max(10).step(0.1);

// Color changer
gui.addColor(col, 'color').name('Light Color').onChange(() => {
  pointLight.color.set(col.color);
});

// Displacement Scale
const displacementControls = {
  displacementScale: material.displacementScale
};
gui.add(displacementControls, 'displacementScale').min(0).max(2).step(0.01).onChange((value) => {
  material.displacementScale = value;
});

// Morph Target Control
const morphControls = { morphFactor: 0 };
gui.add(morphControls, 'morphFactor').min(0).max(1).step(0.01).name('Morph Factor').onChange((value) => {
  plane.morphTargetInfluences[0] = value;
});

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
};

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0, 3);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Animate
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Update Orbital Controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
