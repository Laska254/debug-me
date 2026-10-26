import { PointerLockControls } from "three/addons/controls/PointerLockControls.js";

// `event.code` is the physical key, so WASD stays in the same place on AZERTY and other layouts.
const MOVE_KEYS = {
    KeyW: [0, 1],
    ArrowUp: [0, 1],
    KeyS: [0, -1],
    ArrowDown: [0, -1],
    KeyA: [-1, 0],
    ArrowLeft: [-1, 0],
    KeyD: [1, 0],
    ArrowRight: [1, 0],
};
const SPRINT_KEYS = ["ShiftLeft", "ShiftRight"];

/**
 * Mouse look with pointer lock and keyboard movement for a `Player`.
 * Returns the `PointerLockControls`: call `lock()` from a click and listen for its `lock` / `unlock` events.
 */
export function createDesktopControls(player, camera, domElement) {
    const pointerLock = new PointerLockControls(camera, domElement);
    const pressed = new Set();

    const updatePlayer = () => {
        let x = 0;
        let y = 0;
        for (const code of pressed) {
            const [dx, dy] = MOVE_KEYS[code] ?? [0, 0];
            x += dx;
            y += dy;
        }
        // `W` and `ArrowUp` held together still mean one step forward.
        player.move.set(Math.sign(x), Math.sign(y));
        player.sprint = SPRINT_KEYS.some((code) => pressed.has(code));
    };

    document.addEventListener("keydown", (event) => {
        pressed.add(event.code);
        updatePlayer();
    });
    document.addEventListener("keyup", (event) => {
        pressed.delete(event.code);
        updatePlayer();
    });
    // Keys released in another window never send `keyup`, so they would stay pressed.
    window.addEventListener("blur", () => {
        pressed.clear();
        updatePlayer();
    });

    return pointerLock;
}
