import { Vector2 } from "three";

// How far past a zone's edge the player has to walk to leave it, in metres. Without it, standing on the edge could fire
// `zone:enter` again on every small step.
const LEAVE_MARGIN = 0.5;

const point = new Vector2();

/**
 * Fires `zone:enter` when the player walks into a zone and `zone:leave` when they walk out, with the zone in
 * `event.detail.zone`. Zones are `{ id, name, bounds }`, where `bounds` is a `Box2` over the world's `x` and `z`.
 * They must not overlap, so the player is in one zone at most.
 */
export class ZoneTriggers extends EventTarget {
    #zones;
    #current = null;

    constructor(zones) {
        super();
        this.#zones = zones.map((zone) => ({ zone, leaveBounds: zone.bounds.clone().expandByScalar(LEAVE_MARGIN) }));
    }

    /** The zone the player is in, or `null` in the hub and the corridors. */
    get current() {
        return this.#current?.zone ?? null;
    }

    update({ x, z }) {
        point.set(x, z);
        if (this.#current && !this.#current.leaveBounds.containsPoint(point)) {
            const { zone } = this.#current;
            this.#current = null;
            this.dispatchEvent(new CustomEvent("zone:leave", { detail: { zone } }));
        }
        if (this.#current) return;

        this.#current = this.#zones.find(({ zone }) => zone.bounds.containsPoint(point)) ?? null;
        if (this.#current) this.dispatchEvent(new CustomEvent("zone:enter", { detail: { zone: this.#current.zone } }));
    }
}
