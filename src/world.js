import {
    Box2,
    Box3,
    BoxGeometry,
    CanvasTexture,
    Color,
    EdgesGeometry,
    GridHelper,
    IcosahedronGeometry,
    LineBasicMaterial,
    LineSegments,
    Mesh,
    MeshBasicMaterial,
    PlaneGeometry,
    SRGBColorSpace,
    Vector2,
    Vector3,
} from "three";
import { palette } from "./theme.js";

// Metres.
const WALL_HEIGHT = 4.5;
const WALL_THICKNESS = 0.4;
const GATE_WIDTH = 4;
const GATE_HEIGHT = 3;
const HUB_SIZE = 16;
// From the hub's wall to the zone's wall.
const CORRIDOR_LENGTH = 6;
const GRID_CELL_SIZE = 1;
const LABEL_HEIGHT = 0.7;
// Keeps a label just in front of its wall, so the two never flicker through each other.
const LABEL_OFFSET = 0.01;
// Canvas pixels, enough to keep the text sharp up close.
const LABEL_FONT_SIZE = 96;
const LABEL_PADDING = 24;
const CORE_RADIUS = 2;
const CORE_DETAIL = 1;
// High enough to show over the walls from inside every zone, as a landmark on the way back.
const CORE_HEIGHT = 9;
// Radians per second.
const CORE_SPIN_X = 0.2;
const CORE_SPIN_Y = 0.3;

// `direction` points from the hub to the zone over the world's `x` and `z`. The player starts in the middle of the hub
// looking along -z, so Stack is the gate straight ahead. Zones stand side by side around the hub, so a zone wider than
// `HUB_SIZE + 2 * CORRIDOR_LENGTH` would run into its neighbours.
const ZONES = [
    { id: "stack", name: "Stack", direction: new Vector2(0, -1), size: 22, color: palette.keyword },
    { id: "heap", name: "Heap", direction: new Vector2(1, 0), size: 26, color: palette.field },
    { id: "gc", name: "Garbage Collector", direction: new Vector2(0, 1), size: 22, color: palette.string },
    { id: "main", name: "main()", direction: new Vector2(-1, 0), size: 22, color: palette.method },
];

const SIDES = [new Vector2(0, -1), new Vector2(1, 0), new Vector2(0, 1), new Vector2(-1, 0)];

/**
 * Builds the inside of the JVM from primitives: the ClassLoader hub around the origin, with a gate on each side that
 * leads down a corridor into a zone. Every wall is added to `colliders`.
 * Returns the zones as `{ id, name, bounds }` for `ZoneTriggers`, and `update(delta)`, which animates the world.
 */
export function createWorld(scene, colliders) {
    const hubHalf = HUB_SIZE / 2;
    const zoneStart = hubHalf + CORRIDOR_LENGTH;
    const worldSize = 2 * (zoneStart + Math.max(...ZONES.map((zone) => zone.size)));
    scene.add(new GridHelper(worldSize, worldSize / GRID_CELL_SIZE, palette.gridAccent, palette.grid));

    const wallMaterial = new MeshBasicMaterial({ color: palette.grid });
    const edgeMaterials = new Map();

    // A wall facing along `normal`, which is one of `SIDES`.
    const addWall = (center, normal, length, color, bottom = 0) => {
        const height = WALL_HEIGHT - bottom;
        const size = new Vector3(
            normal.x === 0 ? length : WALL_THICKNESS,
            height,
            normal.y === 0 ? length : WALL_THICKNESS,
        );
        const position = new Vector3(center.x, bottom + height / 2, center.y);
        const wall = new Mesh(new BoxGeometry(size.x, size.y, size.z), wallMaterial);
        wall.position.copy(position);
        if (!edgeMaterials.has(color)) edgeMaterials.set(color, new LineBasicMaterial({ color }));
        wall.add(new LineSegments(new EdgesGeometry(wall.geometry), edgeMaterials.get(color)));
        scene.add(wall);
        colliders.push(new Box3().setFromCenterAndSize(position, size));
    };

    // A side of a square room, with a gate in the middle if `gate` is set.
    const addSide = (center, normal, length, color, gate) => {
        if (!gate) {
            addWall(center, normal, length, color);
            return;
        }
        const segment = (length - GATE_WIDTH) / 2;
        const along = new Vector2(-normal.y, normal.x);
        for (const sign of [-1, 1]) {
            addWall(center.clone().addScaledVector(along, (sign * (GATE_WIDTH + segment)) / 2), normal, segment, color);
        }
        addWall(center, normal, GATE_WIDTH, color, GATE_HEIGHT);
    };

    // Each wall is longer than the room by its thickness, so the corners are closed.
    const addRoom = (center, size, color, hasGate) => {
        for (const normal of SIDES) {
            const sideCenter = center.clone().addScaledVector(normal, size / 2);
            addSide(sideCenter, normal, size + WALL_THICKNESS, color, hasGate(normal));
        }
    };

    // A sign over a gate, on the wall face that looks along `facing`.
    const addLabel = (text, color, wallCenter, facing) => {
        const label = createLabel(text, color);
        const { x, y } = wallCenter.clone().addScaledVector(facing, WALL_THICKNESS / 2 + LABEL_OFFSET);
        label.position.set(x, (GATE_HEIGHT + WALL_HEIGHT) / 2, y);
        label.rotation.y = Math.atan2(facing.x, facing.y);
        scene.add(label);
    };

    addRoom(new Vector2(), HUB_SIZE, palette.neon, () => true);

    const zones = ZONES.map(({ id, name, direction, size, color }) => {
        const hubGate = direction.clone().multiplyScalar(hubHalf);
        const zoneGate = direction.clone().multiplyScalar(zoneStart);
        const back = direction.clone().negate();
        addLabel(name, color, hubGate, back);
        addLabel("ClassLoader", palette.neon, zoneGate, direction);

        const along = new Vector2(-direction.y, direction.x);
        const corridorCenter = direction.clone().multiplyScalar(hubHalf + CORRIDOR_LENGTH / 2);
        for (const sign of [-1, 1]) {
            const wallCenter = corridorCenter
                .clone()
                .addScaledVector(along, (sign * (GATE_WIDTH + WALL_THICKNESS)) / 2);
            addWall(wallCenter, along, CORRIDOR_LENGTH, color);
        }

        const center = direction.clone().multiplyScalar(zoneStart + size / 2);
        addRoom(center, size, color, (normal) => normal.equals(back));
        const inner = new Vector2().setScalar(size - WALL_THICKNESS);
        return { id, name, bounds: new Box2().setFromCenterAndSize(center, inner) };
    });

    // The ClassLoader core: a wireframe "class" spinning high over the hub. Fog would hide it from the far zones.
    const core = new LineSegments(
        new EdgesGeometry(new IcosahedronGeometry(CORE_RADIUS, CORE_DETAIL)),
        new LineBasicMaterial({ color: palette.neon, fog: false }),
    );
    core.position.y = CORE_HEIGHT;
    scene.add(core);

    return {
        zones,
        update(delta) {
            core.rotation.x += delta * CORE_SPIN_X;
            core.rotation.y += delta * CORE_SPIN_Y;
        },
    };
}

// Text drawn on a canvas, so the build needs no font files.
function createLabel(text, color) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const font = `${LABEL_FONT_SIZE}px ${getComputedStyle(document.documentElement).fontFamily}`;
    context.font = font;
    canvas.width = Math.ceil(context.measureText(text).width) + LABEL_PADDING * 2;
    canvas.height = LABEL_FONT_SIZE + LABEL_PADDING * 2;
    // Resizing the canvas resets the context, font included.
    context.font = font;
    context.textBaseline = "middle";
    context.fillStyle = `#${new Color(color).getHexString()}`;
    context.fillText(text, LABEL_PADDING, canvas.height / 2);

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return new Mesh(
        new PlaneGeometry((LABEL_HEIGHT * canvas.width) / canvas.height, LABEL_HEIGHT),
        new MeshBasicMaterial({ map: texture, transparent: true }),
    );
}
