import { HalfFloatType, Vector2, WebGLRenderTarget } from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

const BLOOM_STRENGTH = 0.9;
// From 0 to 1: how far the glow spreads.
const BLOOM_RADIUS = 0.4;
// Only colours brighter than this glow, so the neon lines and labels do while the dark walls and background don't.
const BLOOM_THRESHOLD = 0.2;
// The renderer's own `antialias` doesn't reach the composer's render targets, so they smooth edges themselves.
const MSAA_SAMPLES = 4;

/**
 * Renders the scene with neon bloom, or straight to the screen when bloom is off, which saves the extra passes on slow
 * GPUs. Bloom is on unless the page is opened with `?quality=low`, and `bloom` can be switched at any time.
 */
export function createPostProcessing(renderer, scene, camera) {
    const target = new WebGLRenderTarget(1, 1, { type: HalfFloatType, samples: MSAA_SAMPLES });
    const composer = new EffectComposer(renderer, target);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new Vector2(), BLOOM_STRENGTH, BLOOM_RADIUS, BLOOM_THRESHOLD));
    // Applies the colour space conversion that `renderer.render()` does on its own when it draws to the screen.
    composer.addPass(new OutputPass());

    const postProcessing = {
        bloom: new URLSearchParams(window.location.search).get("quality") !== "low",
        /** Call after `renderer.setSize()`, so the pixel ratio is the same. */
        setSize(width, height) {
            composer.setPixelRatio(renderer.getPixelRatio());
            composer.setSize(width, height);
        },
        render() {
            if (postProcessing.bloom) {
                composer.render();
            } else {
                renderer.render(scene, camera);
            }
        },
    };
    postProcessing.setSize(window.innerWidth, window.innerHeight);
    return postProcessing;
}
