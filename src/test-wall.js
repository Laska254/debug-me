import { Box3, BoxGeometry, EdgesGeometry, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial } from "three";
import { palette } from "./theme.js";

// Metres. Thinner than one step of the player, to show that a fast frame still can't pass through.
const THICKNESS = 0.2;
const HEIGHT = 3;
const LENGTH = 10;
const POSITION_X = 4;

/**
 * Test wall until the world layout exists: walk into it at an angle to check that the player slides along it.
 */
export function addTestWall(scene, colliders) {
    const wall = new Mesh(new BoxGeometry(THICKNESS, HEIGHT, LENGTH), new MeshBasicMaterial({ color: palette.grid }));
    wall.add(new LineSegments(new EdgesGeometry(wall.geometry), new LineBasicMaterial({ color: palette.gridAccent })));
    wall.position.set(POSITION_X, HEIGHT / 2, 0);
    scene.add(wall);
    colliders.push(new Box3().setFromObject(wall));
}
