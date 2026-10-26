import * as THREE from "three";
import { createDesktopControls } from "./desktop-controls.js";
import { Player } from "./player.js";
import { createPostProcessing } from "./post-processing.js";
import { exposePaletteToCss, palette } from "./theme.js";
import { createTouchControls } from "./touch-controls.js";
import { createWorld } from "./world.js";
import { ZoneTriggers } from "./zone-triggers.js";
import "./style.css";

const MAX_PIXEL_RATIO = 2;
const FOG_NEAR = 10;
const FOG_FAR = 40;
const CAMERA_FOV = 70;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 100;

exposePaletteToCss();

const container = document.querySelector("#app");

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
renderer.setSize(window.innerWidth, window.innerHeight);
container.append(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(palette.background);
scene.fog = new THREE.Fog(palette.background, FOG_NEAR, FOG_FAR);

// Starts in the middle of the hub, looking at the first gate.
const camera = new THREE.PerspectiveCamera(CAMERA_FOV, window.innerWidth / window.innerHeight, CAMERA_NEAR, CAMERA_FAR);
const postProcessing = createPostProcessing(renderer, scene, camera);

const player = new Player(camera);
const world = createWorld(scene, player.colliders);
// `zone:enter` and `zone:leave` are for the log console (#7) and the breakpoint progress (#9).
const zoneTriggers = new ZoneTriggers(world.zones);

// Until the start screen and pause menu exist, one overlay starts the game and shows that it is paused.
const overlay = document.querySelector("#overlay");
const overlayTitle = overlay.querySelector(".overlay-title");
const overlayHint = overlay.querySelector(".overlay-hint");
overlay.hidden = false;
overlay.focus();

let paused = true;
const play = () => {
    paused = false;
    player.enabled = true;
    overlay.hidden = true;
};

// Detected by the main input, not the user agent, so a laptop with a touch screen keeps the mouse and keyboard.
if (window.matchMedia("(pointer: coarse)").matches) {
    createTouchControls(player, camera, renderer.domElement);
    // No pointer lock and no `Esc` here, so one tap starts the game and nothing pauses it until the pause menu exists.
    overlayTitle.textContent = "Tap to play";
    overlayHint.textContent = "Left stick to move, push past its ring to walk faster, drag on the right half to look";
    overlay.addEventListener("click", play);
} else {
    const { pointerLock, lock } = createDesktopControls(player, camera, renderer.domElement);
    overlay.addEventListener("click", lock);
    // Chrome refuses the lock for about a second after `Esc`, and sandboxed iframes refuse it always.
    document.addEventListener("pointerlockerror", () => {
        overlayTitle.textContent = "Couldn't capture the mouse. Click again";
    });
    pointerLock.addEventListener("lock", play);
    pointerLock.addEventListener("unlock", () => {
        paused = true;
        player.enabled = false;
        overlayTitle.textContent = "Paused. Click to resume";
        overlay.hidden = false;
        overlay.focus();
    });
}

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    postProcessing.setSize(window.innerWidth, window.innerHeight);
});

const timer = new THREE.Timer();
timer.connect(document);
renderer.setAnimationLoop((timestamp) => {
    timer.update(timestamp);
    if (!paused) {
        const delta = timer.getDelta();
        player.update(delta);
        zoneTriggers.update(player.position);
        world.update(delta);
    }
    postProcessing.render();
});
