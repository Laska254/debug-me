import * as THREE from "three";
import { palette } from "./theme.js";
import "./style.css";

const MAX_PIXEL_RATIO = 2;
const EYE_HEIGHT = 1.7;
const FOG_NEAR = 10;
const FOG_FAR = 40;
const CAMERA_FOV = 70;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 100;
const CAMERA_DISTANCE = 8;
const GRID_SIZE = 80;
const GRID_DIVISIONS = 80;
const PLACEHOLDER_RADIUS = 1.5;
const PLACEHOLDER_DETAIL = 1;
// Radians per second.
const PLACEHOLDER_SPIN_X = 0.2;
const PLACEHOLDER_SPIN_Y = 0.3;

// Expose the palette to CSS as custom properties, e.g. gridAccent -> --grid-accent.
for (const [name, value] of Object.entries(palette)) {
    const property = `--${name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
    document.documentElement.style.setProperty(property, `#${value.toString(16).padStart(6, "0")}`);
}

const container = document.querySelector("#app");

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
renderer.setSize(window.innerWidth, window.innerHeight);
container.append(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(palette.background);
scene.fog = new THREE.Fog(palette.background, FOG_NEAR, FOG_FAR);

const camera = new THREE.PerspectiveCamera(CAMERA_FOV, window.innerWidth / window.innerHeight, CAMERA_NEAR, CAMERA_FAR);
camera.position.set(0, EYE_HEIGHT, CAMERA_DISTANCE);

const grid = new THREE.GridHelper(GRID_SIZE, GRID_DIVISIONS, palette.gridAccent, palette.grid);
scene.add(grid);

// Placeholder until the ClassLoader hub exists: a glowing wireframe "class" floating at eye level.
const placeholder = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(PLACEHOLDER_RADIUS, PLACEHOLDER_DETAIL)),
    new THREE.LineBasicMaterial({ color: palette.neon }),
);
placeholder.position.y = EYE_HEIGHT;
scene.add(placeholder);

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const timer = new THREE.Timer();
timer.connect(document);
renderer.setAnimationLoop((timestamp) => {
    timer.update(timestamp);
    const delta = timer.getDelta();
    placeholder.rotation.x += delta * PLACEHOLDER_SPIN_X;
    placeholder.rotation.y += delta * PLACEHOLDER_SPIN_Y;
    renderer.render(scene, camera);
});
