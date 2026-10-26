import { Euler, Vector2, Vector3 } from "three";

export const EYE_HEIGHT = 1.7;
// Metres per second.
const WALK_SPEED = 3.5;
const SPRINT_MULTIPLIER = 1.8;
// How quickly the velocity catches up with the input, per second. Higher feels snappier.
const ACCELERATION = 12;
// Half the width of the player's square footprint, in metres.
const BODY_RADIUS = 0.3;
// Space left between the body and a wall after a collision, so rounding errors never leave the body inside it.
const COLLISION_GAP = 0.001;
// Longer frames (a stall, a debugger pause) are cut short so the player never teleports.
const MAX_DELTA = 0.1;

const euler = new Euler(0, 0, 0, "YXZ");
const input = new Vector2();
const forward = new Vector3();
const right = new Vector3();
const target = new Vector3();

/**
 * First-person walker: moves the camera across the floor at a fixed eye height and slides along `colliders`.
 * It does not read any input itself: desktop or touch controls write `move` and `sprint`, UI panels toggle `enabled`.
 */
export class Player {
    /** Wanted direction relative to the view: `x` strafes right, `y` walks forward. Longer than 1 counts as 1. */
    move = new Vector2();
    sprint = false;
    /** Walls as world-space `Box3`s. */
    colliders = [];

    #camera;
    #enabled = true;
    #velocity = new Vector3();

    constructor(camera) {
        this.#camera = camera;
        camera.position.y = EYE_HEIGHT;
    }

    get position() {
        return this.#camera.position;
    }

    /** When false the player stands still, e.g. while a UI panel is open or the game is paused. */
    get enabled() {
        return this.#enabled;
    }

    set enabled(enabled) {
        this.#enabled = enabled;
        // Stop at once, so the player doesn't carry the old speed into the next `update()`.
        if (!enabled) this.#velocity.set(0, 0, 0);
    }

    update(delta) {
        if (!this.#enabled) return;
        delta = Math.min(delta, MAX_DELTA);

        // Only the yaw matters, so looking at the floor doesn't slow the player down.
        euler.setFromQuaternion(this.#camera.quaternion);
        forward.set(-Math.sin(euler.y), 0, -Math.cos(euler.y));
        right.set(-forward.z, 0, forward.x);

        input.copy(this.move);
        if (input.lengthSq() > 1) input.normalize();
        const speed = this.sprint ? WALK_SPEED * SPRINT_MULTIPLIER : WALK_SPEED;
        target
            .copy(right)
            .multiplyScalar(input.x * speed)
            .addScaledVector(forward, input.y * speed);

        // Exponential smoothing gives the same feel at any frame rate.
        this.#velocity.lerp(target, 1 - Math.exp(-ACCELERATION * delta));

        // Small steps, so a fast frame can't jump over a thin wall.
        const dx = this.#velocity.x * delta;
        const dz = this.#velocity.z * delta;
        const steps = Math.ceil(Math.hypot(dx, dz) / BODY_RADIUS);
        for (let i = 0; i < steps; i++) {
            this.#moveAlong("x", dx / steps);
            this.#moveAlong("z", dz / steps);
        }
    }

    // Moving one axis at a time is what makes the player slide along a wall instead of stopping dead.
    #moveAlong(axis, distance) {
        const position = this.position;
        position[axis] += distance;
        for (const box of this.colliders) {
            if (this.#overlaps(box)) {
                position[axis] =
                    distance > 0
                        ? box.min[axis] - BODY_RADIUS - COLLISION_GAP
                        : box.max[axis] + BODY_RADIUS + COLLISION_GAP;
                this.#velocity[axis] = 0;
            }
        }
    }

    // The body is a box from the floor up to eye height.
    #overlaps(box) {
        const { x, z } = this.position;
        return (
            x + BODY_RADIUS > box.min.x &&
            x - BODY_RADIUS < box.max.x &&
            z + BODY_RADIUS > box.min.z &&
            z - BODY_RADIUS < box.max.z &&
            box.min.y < EYE_HEIGHT &&
            box.max.y > 0
        );
    }
}
