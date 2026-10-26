import { Euler, MathUtils, Vector2 } from "three";

// How far the knob travels from the centre, in CSS pixels. At the edge the player walks at full speed.
const JOYSTICK_RADIUS = 56;
// The finger sprints once it is this many radii from the centre, past the ring, while the knob stays at the edge.
const SPRINT_REACH = 1.5;
// Radians per CSS pixel dragged.
const LOOK_SPEED = 0.006;
// Straight up or down, the same limit as `PointerLockControls` on desktop.
const MAX_PITCH = Math.PI / 2;

const euler = new Euler(0, 0, 0, "YXZ");
const offset = new Vector2();

/**
 * Virtual joystick and drag-to-look for a `Player` on touch screens, which have no pointer lock.
 * The joystick in the bottom-left corner moves the player, and how far it is pushed sets the speed, up to a sprint
 * past the ring. Dragging on the right half of the screen turns the camera. Each finger is tracked on its own, so both
 * work at once.
 * Returns `actionButton`, the touch replacement for `E`. It stays hidden until there is something to inspect (#8).
 */
export function createTouchControls(player, camera, domElement) {
    const root = document.createElement("div");
    root.className = "touch-controls";
    root.style.setProperty("--joystick-radius", `${JOYSTICK_RADIUS}px`);
    root.innerHTML = `
        <div class="joystick"><div class="joystick-knob"></div></div>
        <button class="action-button" type="button" hidden>Inspect</button>
    `;
    domElement.after(root);

    const joystick = root.querySelector(".joystick");
    const knob = root.querySelector(".joystick-knob");
    const center = new Vector2();
    let stickPointer = null;

    const moveStick = (event) => {
        offset.set(event.clientX - center.x, event.clientY - center.y);
        player.sprint = offset.length() > JOYSTICK_RADIUS * SPRINT_REACH;
        joystick.classList.toggle("sprinting", player.sprint);
        offset.clampLength(0, JOYSTICK_RADIUS);
        knob.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
        // Screen `y` points down, while `move.y` walks forward.
        player.move.set(offset.x / JOYSTICK_RADIUS, -offset.y / JOYSTICK_RADIUS);
    };

    joystick.addEventListener("pointerdown", (event) => {
        if (stickPointer !== null) return;
        stickPointer = event.pointerId;
        // Capture keeps the finger on the stick even when it slides off it.
        joystick.setPointerCapture(event.pointerId);
        const rect = joystick.getBoundingClientRect();
        center.set(rect.left + rect.width / 2, rect.top + rect.height / 2);
        moveStick(event);
    });
    joystick.addEventListener("pointermove", (event) => {
        if (event.pointerId === stickPointer) moveStick(event);
    });
    // Fires after `pointerup` and `pointercancel` alike.
    joystick.addEventListener("lostpointercapture", (event) => {
        if (event.pointerId !== stickPointer) return;
        stickPointer = null;
        knob.style.transform = "";
        joystick.classList.remove("sprinting");
        player.move.set(0, 0);
        player.sprint = false;
    });

    const last = new Vector2();
    let lookPointer = null;

    domElement.addEventListener("pointerdown", (event) => {
        if (lookPointer !== null || event.clientX < window.innerWidth / 2) return;
        lookPointer = event.pointerId;
        domElement.setPointerCapture(event.pointerId);
        last.set(event.clientX, event.clientY);
    });
    domElement.addEventListener("pointermove", (event) => {
        if (event.pointerId !== lookPointer) return;
        // Like desktop, where the mouse stops turning the camera once the game is paused.
        if (player.enabled) {
            euler.setFromQuaternion(camera.quaternion);
            euler.y -= (event.clientX - last.x) * LOOK_SPEED;
            euler.x = MathUtils.clamp(euler.x - (event.clientY - last.y) * LOOK_SPEED, -MAX_PITCH, MAX_PITCH);
            camera.quaternion.setFromEuler(euler);
        }
        last.set(event.clientX, event.clientY);
    });
    domElement.addEventListener("lostpointercapture", (event) => {
        if (event.pointerId === lookPointer) lookPointer = null;
    });

    return { actionButton: root.querySelector(".action-button") };
}
