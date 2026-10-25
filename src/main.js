import * as THREE from "three";
import { palette } from "./theme.js";
import "./style.css";

const MAX_PIXEL_RATIO = 2;
const container = document.querySelector("#app");

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
renderer.setSize(window.innerWidth, window.innerHeight);
container.append(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(palette.background);
scene.fog = new THREE.Fog(palette.background, 10, 40);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.7, 8);

const grid = new THREE.GridHelper(80, 80, palette.gridAccent, palette.grid);
scene.add(grid);

// Placeholder until the ClassLoader hub exists: a glowing wireframe "class" floating at eye level.
const placeholder = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.5, 1)),
    new THREE.LineBasicMaterial({ color: palette.neon }),
);
placeholder.position.y = 1.7;
scene.add(placeholder);

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const timer = new THREE.Timer();
renderer.setAnimationLoop((timestamp) => {
    timer.update(timestamp);
    const delta = timer.getDelta();
    placeholder.rotation.x += delta * 0.2;
    placeholder.rotation.y += delta * 0.3;
    renderer.render(scene, camera);
});
