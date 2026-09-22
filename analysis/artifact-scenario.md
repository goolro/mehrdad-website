# v4 Scenario — «تندیس / The Artifact»

## Research findings (2026 session, verified via web search)

**What the owner saw in the ads is real and named:** "Three.js Builder" / "web3d-integration"
Claude Code skills (mcpmarket.com, claudedesignskills on GitHub, mdskills.ai, terminalskills.io).
They work because they encode the actual recipe used by award studios:

1. **GPU particle fields** — 30k–100k+ points in ONE draw call, all motion in the
   vertex shader (curl noise, morph targets, pointer forces). CPU-simulated particles
   (our earlier attempts) cap at ~3k and look flat/muddy.
2. **One focal artifact, not an ambient background** — Refero on oryzo.ai (built by
   Lusion): "treats a single product object like a museum artifact: full-bleed
   warm-dark canvas, cream typography floating in generous negative space."
3. **Real camera depth** — perspective camera, pointer parallax, size attenuation,
   depth fade. Flat DOM blobs can never produce this.
4. **Interactive storytelling** — the object changes state as the story progresses
   (Awwwards "WebGL Particle Physics & Fluid Shaders… mouse interaction, fluid").

**Why v1–v3 failed the owner's eye:** every previous attempt was a *background layer*
(blobs, light-field, contour map). The reference sites are a *subject* on a canvas.
A background can at best be "not ugly"; an artifact can be unforgettable.

## Scenario — one mind, six states

> «یک ذهن، شش گویش» — every discipline Mehrdad works in is one STATE of the same
> living sculpture. The sculpture is forged from ~90,000 points of warm light,
> floating in a dark museum room. Selecting a discipline re-forges it:
>
> | Discipline  | State (geometry)   | Meaning                      | Tint   |
> |-------------|--------------------|------------------------------|--------|
> | مهندسی       | torus knot (2,3)   | load paths, structure        | amber  |
> | ریاضی        | geodesic sphere    | pure form, proof             | violet |
> | فیزیک        | double helix       | orbits, waves                | teal   |
> | شیمی         | molecular cluster  | bonds, reactions             | green  |
> | دیجیتال      | wave lattice       | bits, fields                 | magenta|
> | طراحی        | torus              | the loop of form & use       | rose   |

**Rules (carried from v3 lessons + research):**
- ONE owner layer: the WebGL canvas is the only ambient element in the section.
- ONE focal object; cream/white typography floats over it; generous negative space.
- The section is a permanent "museum room" (warm-dark canvas) even in light theme —
  this is the oryzo system, and additive-blend particles need darkness.
- Interaction is real 3D: pointer raycast → repulsion field in the vertex shader;
  camera parallax; morph easing between states.
- prefers-reduced-motion → single rendered still frame (a painting), no rAF loop.
- No WebGL / context failure → CSS gradient fallback, content fully readable.
- Everything lives inside DesignPreview (sandbox); live site untouched. If the owner
  rejects it, rollback = revert two imports in DesignPreview.tsx.

## Files
- `src/components/site/ArtifactScene.tsx`  — three.js engine (points + shader + raycast)
- `src/components/site/ArtifactShowcase.tsx` — typography + discipline chips (bilingual)
- `src/components/site/DesignPreview.tsx`  — swap: ArtifactScene+Showcase replace
  DesignAmbient+VelocityShowcase (old files kept for instant rollback)

## v4.1 update — eight states (owner request: «فرمول و شیء»)
Owner asked: can it show objects — math/physics/chemistry formulas, a car, a rocket?
Answer: yes — same morph architecture, new targets baked by the classic
"canvas → pixel-sample → point cloud" technique:
- math = a²+b²=c² · physics = E=mc² (text rendered on offscreen canvas)
- chemistry = benzene ring diagram + C₆H₆ (strokes + manual subscripts)
- rocket = BLUEPRINT OUTLINE (fills blur into blobs; strokes read like formulas)
- car = side-profile coupe silhouette (fill works: big + varied outline)
Lessons baked into code:
- per-state fit: point size / alpha / y-offset (STATE_FIT) — text = small+dim+sunk
- flat states UNWIND their spin to face the camera (spinY → nearest 2π)
- uWobble scales breathing down to 0.3 on flat states (protects thin strokes)
- depth slab thinned on flat states (0.1–0.3) + sway calmed to ±0.1 rad —
  depth×yaw was doubling every stroke into a 20px band
- renderStill must set uMorph (reduced-motion state switching)
- easing uses generous dt clamp (0.25s) — sandbox's ~5fps software rendering
  was silently stretching morphs 5× (screenshots kept catching mid-morph)
- idle auto-tour: 11s without interaction → walks the 8 states every 7s
