import * as THREE from "three";
import { createDesktopControls } from "./desktop-controls.js";
import { EYE_HEIGHT, Player } from "./player.js";
import { addTestWall } from "./test-wall.js";
import { exposePaletteToCss, palette } from "./theme.js";
import "./style.css";

const MAX_PIXEL_RATIO = 2;
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

exposePaletteToCss();

const container = document.querySelector("#app");

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
renderer.setSize(window.innerWidth, window.innerHeight);
container.append(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(palette.background);
scene.fog = new THREE.Fog(palette.background, FOG_NEAR, FOG_FAR);

const camera = new THREE.PerspectiveCamera(CAMERA_FOV, window.innerWidth / window.innerHeight, CAMERA_NEAR, CAMERA_FAR);
camera.position.z = CAMERA_DISTANCE;

const grid = new THREE.GridHelper(GRID_SIZE, GRID_DIVISIONS, palette.gridAccent, palette.grid);
scene.add(grid);

// Placeholder until the ClassLoader hub exists: a glowing wireframe "class" floating at eye level.
const placeholder = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(PLACEHOLDER_RADIUS, PLACEHOLDER_DETAIL)),
    new THREE.LineBasicMaterial({ color: palette.neon }),
);
placeholder.position.y = EYE_HEIGHT;
scene.add(placeholder);

const player = new Player(camera);
player.colliders.push(
    new THREE.Box3().setFromCenterAndSize(placeholder.position, new THREE.Vector3().setScalar(PLACEHOLDER_RADIUS * 2)),
);
addTestWall(scene, player.colliders);

// Until the start screen and pause menu exist, one overlay starts the game and shows that it is paused.
const overlay = document.querySelector("#overlay");
const overlayTitle = overlay.querySelector(".overlay-title");
// Touch screens have no pointer lock, so the overlay would never close. Until the touch controls exist (#4),
// they skip it and just watch the scene.
const isTouch = window.matchMedia("(pointer: coarse)").matches;
if (!isTouch) {
    overlay.hidden = false;
    overlay.focus();
}

let paused = !isTouch;
const { pointerLock, lock } = createDesktopControls(player, camera, renderer.domElement);
overlay.addEventListener("click", lock);
// Chrome refuses the lock for about a second after `Esc`, and sandboxed iframes refuse it always.
document.addEventListener("pointerlockerror", () => {
    overlayTitle.textContent = "Couldn't capture the mouse. Click again";
});
pointerLock.addEventListener("lock", () => {
    paused = false;
    player.enabled = true;
    overlay.hidden = true;
});
pointerLock.addEventListener("unlock", () => {
    paused = true;
    player.enabled = false;
    overlayTitle.textContent = "Paused. Click to resume";
    overlay.hidden = false;
    overlay.focus();
});

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const timer = new THREE.Timer();
timer.connect(document);
renderer.setAnimationLoop((timestamp) => {
    timer.update(timestamp);
    if (!paused) {
        const delta = timer.getDelta();
        player.update(delta);
        placeholder.rotation.x += delta * PLACEHOLDER_SPIN_X;
        placeholder.rotation.y += delta * PLACEHOLDER_SPIN_Y;
    }
    renderer.render(scene, camera);
});
