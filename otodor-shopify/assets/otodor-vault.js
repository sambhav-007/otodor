/* ═══════════════════════════════════════════════════════════════════════
   OTODOR Vault Intro — Three.js minimal LUXURY vault (r160, ESM)
   Self-hosted Three (./three.module.js). No CDN / CSP dependency.

   Design language: Apple / Nothing / B&O / Ex Machina — NOT industrial sci-fi.

   V5 — THE DOORS ARE THE WHOLE SCREEN.
   There is no room, no chamber, no wall, no reveal sleeve, no interior. Two
   pitch-black monolithic gates, split along a diagonal, cover the entire
   viewport with a margin, and glide apart to reveal THE LIVE PAGE behind them
   (the canvas is transparent — what is behind the doors is the DOM itself).
   Nothing is ever built behind the gates, so there is nothing to look into:
   they part, the site is there, the overlay fades.

   Consequences of that rule, kept deliberately:
   • the camera never moves — any sway or dolly would swing the viewport edge
     past the doors and leak the page around them before they open;
   • the slabs are REBUILT on resize to cover the camera's visible rect, so
     "full viewport" holds at every aspect from ultrawide to portrait;
   • no fog, no shadows, no interior lights — nothing exists to receive them.

   Self-disposing; any failure calls onDone() so the page shows instantly.
   ═══════════════════════════════════════════════════════════════════════ */
import * as THREE from './three.module.js';

const UNLOCK = 900;    // seam ignites, hidden locks release (no visible travel)
const OPEN_AT = 1650;  // slabs begin to glide
const OPEN_DUR = 3000; // slow, effortless, massive
const HOLD = 140;      // a beat after the gates clear the frame, before the overlay lets go
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// effortless glide — smooth in/out, no overshoot, no vibration
const easeInOutQuart = (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);

export default function initVault(overlay, opts) {
  opts = opts || {};
  const onDone = opts.onDone || function () {};
  const onReady = opts.onReady || function () {};
  const canvas = overlay.querySelector('[data-vault-canvas]');
  if (!canvas) { onDone(); return; }

  let renderer, scene, camera, pmrem, envTex, raf = 0;
  let disposed = false, ended = false, started = 0, readyFired = false, clearedAt = 0;
  const mats = [], texs = [];
  const M = (m) => { mats.push(m); return m; };
  const T = (t) => { texs.push(t); return t; };

  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { onDone(); return; }

  try {
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    // No shadows: with the room gone there is no surface left to receive one.
    renderer.shadowMap.enabled = false;

    scene = new THREE.Scene();
    // No fog either — fog only tints the gates toward a colour that belongs to
    // an atmosphere the scene no longer has.
    const CAM_Z = 24;
    camera = new THREE.PerspectiveCamera(45, 1, 1, 120);
    camera.position.set(0, 0, CAM_Z);
    camera.lookAt(0, 0, 0);

    // ── Soft neutral softbox env (satin reflections, no colour cast) ──
    const ec = document.createElement('canvas'); ec.width = 512; ec.height = 256;
    const g2 = ec.getContext('2d');
    const grd = g2.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0.0, '#3a3f45'); grd.addColorStop(0.4, '#6c737c');
    grd.addColorStop(0.5, '#8a929c'); grd.addColorStop(0.62, '#5c626b'); grd.addColorStop(1.0, '#232629');
    g2.fillStyle = grd; g2.fillRect(0, 0, 512, 256);
    g2.fillStyle = 'rgba(255,255,255,1)'; g2.fillRect(0, 48, 512, 46);      // bright overhead softbox — the door's key reflection band
    g2.fillStyle = 'rgba(150,175,205,0.6)'; g2.fillRect(0, 150, 512, 24);   // subtle cool lower bounce
    const envSrc = T(new THREE.CanvasTexture(ec));
    envSrc.mapping = THREE.EquirectangularReflectionMapping; envSrc.colorSpace = THREE.SRGBColorSpace;
    pmrem = new THREE.PMREMGenerator(renderer);
    envTex = pmrem.fromEquirectangular(envSrc).texture;
    scene.environment = envTex;

    // ── Brushed-titanium micro relief so the metal just catches light ──
    const nmC = document.createElement('canvas'); nmC.width = 256; nmC.height = 256;
    const nmX = nmC.getContext('2d'); nmX.fillStyle = 'rgb(128,128,255)'; nmX.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 340; i++) { const x = Math.random() * 256; const d = Math.round((Math.random() - 0.5) * 30); nmX.strokeStyle = 'rgb(' + (128 + d) + ',128,255)'; nmX.lineWidth = Math.random() * 1.1; nmX.beginPath(); nmX.moveTo(x, 0); nmX.lineTo(x, 256); nmX.stroke(); }
    const slabNormal = T(new THREE.CanvasTexture(nmC)); slabNormal.wrapS = slabNormal.wrapT = THREE.RepeatWrapping; slabNormal.repeat.set(6, 6);

    // ── Materials — brushed titanium / anodized accents ──
    const slabMat = M(new THREE.MeshPhysicalMaterial({ color: 0x000000, metalness: 0.15, roughness: 0.55, normalMap: slabNormal, normalScale: new THREE.Vector2(0.12, 0.12), clearcoat: 0.5, clearcoatRoughness: 0.22, envMapIntensity: 0.35 }));   // pitch-black gates — only a faint clearcoat edge sheen
    const seamMat = M(new THREE.MeshStandardMaterial({ color: 0x0a0d12, emissive: 0x5aa0ff, emissiveIntensity: 0.0, roughness: 0.4 }));
    const ledBlue = M(new THREE.MeshStandardMaterial({ color: 0x0a0d12, emissive: 0x3d9bff, emissiveIntensity: 2.0, roughness: 0.5 }));
    const ledAmber = M(new THREE.MeshStandardMaterial({ color: 0x241804, emissive: 0xffab30, emissiveIntensity: 2.2, roughness: 0.5 }));

    // ── OTODOR monogram — planar-mapped so the DIAGONAL cut splits its slant ──
    let monoTex = null, logoMat = null;
    try { monoTex = new THREE.TextureLoader().load(new URL('./otodor-monogram.png', import.meta.url).href); } catch (e) { monoTex = null; }
    if (monoTex) {
      monoTex.colorSpace = THREE.SRGBColorSpace; monoTex.wrapS = monoTex.wrapT = THREE.ClampToEdgeWrapping; monoTex.anisotropy = 8;
      logoMat = M(new THREE.MeshStandardMaterial({ map: monoTex, emissive: 0x9fd0ff, emissiveMap: monoTex, emissiveIntensity: 1.0, transparent: true, alphaTest: 0.35, depthWrite: false, metalness: 0.4, roughness: 0.5, envMapIntensity: 0.7 }));
    }

    // ── Lights — soft & even (env + directional; NO point-light hotspots) ──
    scene.add(new THREE.HemisphereLight(0xccd4dc, 0x35393f, 1.9));
    scene.add(new THREE.AmbientLight(0x7c828a, 0.75));
    const key = new THREE.DirectionalLight(0xfff6ec, 1.7); key.position.set(5, 13, 16); scene.add(key);
    const fill = new THREE.DirectionalLight(0xc0c8d2, 1.1); fill.position.set(-8, 3, 13); scene.add(fill);
    const back = new THREE.DirectionalLight(0xaeb6c2, 0.5); back.position.set(0, 6, -10); scene.add(back);   // gentle rim

    /* ── The two gates ───────────────────────────────────────────────────
       Built to COVER the camera's visible rectangle at the door plane, with
       a margin, so no aspect ratio can ever show page around them. Because
       that rectangle depends on the viewport, the slabs are rebuilt on every
       resize rather than scaled: scaling would either skew the 45° slant or
       drag the monogram's size around with the window. */
    const DD = 1.1, MARGIN = 1.12;
    // The seam gap is proportional, not a fixed world size: the gates are now as
    // large as the viewport, so a constant 0.05 would shrink to a sub-pixel line
    // on a big screen. Tied to the frame it stays a ~3 px hairline everywhere.
    let GAP = 0.08;
    let leftSlab = null, rightSlab = null;
    let slabGeos = [];
    let parkL = 0, parkR = 0, clearX = 0;

    function visibleHalf() {
      const halfH = Math.tan((camera.fov * Math.PI) / 360) * CAM_Z;
      return { h: halfH, w: halfH * camera.aspect };
    }

    function disposeSlabs() {
      [leftSlab, rightSlab].forEach(function (grp) {
        if (!grp) return;
        scene.remove(grp);
      });
      for (let i = 0; i < slabGeos.length; i++) { try { slabGeos[i].dispose(); } catch (e) {} }
      slabGeos = [];
      leftSlab = rightSlab = null;
    }

    function buildSlabs() {
      disposeSlabs();

      const v = visibleHalf();
      const HW = v.w * MARGIN, HH = v.h * MARGIN;      // half-extents the gates must cover
      const SLANT = HH * 0.52;                          // diagonal offset — matches the logo's ~45° slash
      const LOGO = Math.min(HW, HH) * 2 * 0.26;         // monogram sized against the FRAME, not the door
      GAP = v.h * 0.008;                                // ~3 px hairline at any viewport height
      const diagRot = -Math.atan2(2 * SLANT, HH * 2);
      const diagLen = Math.sqrt(4 * SLANT * SLANT + 4 * HH * HH);
      const G = (g) => { slabGeos.push(g); return g; };
      const mesh = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; };

      function makeSlab(side) {
        const grp = new THREE.Group();
        const shape = new THREE.Shape();
        if (side < 0) {   // left of the diagonal
          shape.moveTo(-HW, -HH);
          shape.lineTo(-SLANT - GAP, -HH);
          shape.lineTo(SLANT - GAP, HH);
          shape.lineTo(-HW, HH);
        } else {          // right of the diagonal
          shape.moveTo(-SLANT + GAP, -HH);
          shape.lineTo(HW, -HH);
          shape.lineTo(HW, HH);
          shape.lineTo(SLANT + GAP, HH);
        }
        shape.closePath();

        const baseGeo = G(new THREE.ExtrudeGeometry(shape, { depth: DD, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 1 }));
        baseGeo.translate(0, 0, -DD / 2);
        grp.add(mesh(baseGeo, slabMat, 0, 0, 0));

        // logo clipped to this half's shape → the diagonal splits its slant.
        // Bake planar UVs explicitly (ShapeGeometry's default UVs are unreliable here).
        if (logoMat) {
          const face = G(new THREE.ShapeGeometry(shape));
          const pos = face.attributes.position, uvArr = new Float32Array(pos.count * 2);
          for (let k = 0; k < pos.count; k++) { uvArr[k * 2] = pos.getX(k) / LOGO + 0.5; uvArr[k * 2 + 1] = pos.getY(k) / LOGO + 0.5; }
          face.setAttribute('uv', new THREE.BufferAttribute(uvArr, 2));
          grp.add(mesh(face, logoMat, 0, 0, DD / 2 + 0.16));
        }

        // Glowing diagonal seam edge — one HALF per slab so it travels with the gate
        // and stays lit for the whole animation. Each bar fills exactly its side of
        // the slot, so closed they read as ONE continuous line.
        const seamEl = mesh(G(new THREE.BoxGeometry(GAP, diagLen, 0.12)), seamMat, (side * GAP) / 2, 0, DD / 2 + 0.14);
        seamEl.rotation.z = diagRot; grp.add(seamEl);

        // tiny functional indicators, placed off the frame's proportions
        const ledX = side * HW * 0.55, ledY = HH * 0.6, ledS = Math.max(HH * 0.045, 0.22);
        grp.add(mesh(G(new THREE.BoxGeometry(ledS * 1.6, ledS * 0.22, 0.04)), ledBlue, ledX, ledY, DD / 2 + 0.08));
        grp.add(mesh(G(new THREE.BoxGeometry(ledS * 0.32, ledS * 0.32, 0.04)), ledAmber, ledX, -ledY, DD / 2 + 0.08));

        scene.add(grp);
        return grp;
      }

      leftSlab = makeSlab(-1);
      rightSlab = makeSlab(1);

      // Park each half completely OFF-SCREEN. The left gate's furthest-right
      // point is its top corner at +SLANT, so it clears the frame once that
      // corner passes -v.w. Anything short of this leaves a black wedge sitting
      // over the page at the end of the animation.
      clearX = -(v.w + SLANT);
      parkL = clearX - 0.6;
      parkR = -parkL;
    }

    function resize() {
      const w = overlay.clientWidth || window.innerWidth, h = overlay.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      // Portrait needs a taller frustum or the rebuilt gates get absurdly tall
      // for the width they have to cover.
      camera.fov = camera.aspect < 1 ? 58 : 45;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
      buildSlabs();
    }
    resize(); window.addEventListener('resize', resize);

    // ── Render loop — calm, effortless (no shake/rumble/vibration) ──
    function frame(now) {
      if (disposed) return;
      raf = requestAnimationFrame(frame);
      if (!started) started = now;
      const t = now - started;

      // seam ignites softly at unlock (the one moment of light)
      seamMat.emissiveIntensity = t < UNLOCK ? 0.0 : clamp((t - UNLOCK) / 500, 0, 1) * 2.4;

      // effortless glide — straight off both sides of the screen
      if (t > OPEN_AT && leftSlab && rightSlab) {
        const e = easeInOutQuart(clamp((t - OPEN_AT) / OPEN_DUR, 0, 1));
        leftSlab.position.x = parkL * e;
        rightSlab.position.x = parkR * e;

        // Finish on the frame the gates actually leave the viewport, not on the
        // nominal end of the glide: easeInOutQuart spends its last ~15% crawling
        // the final few percent of travel, which happens entirely off-screen and
        // would hold an empty overlay over a page the user can already see.
        if (!clearedAt && leftSlab.position.x <= clearX) clearedAt = t;
      }
      if (clearedAt && t > clearedAt + HOLD && !ended) { ended = true; finish(); }

      renderer.render(scene, camera);
      if (!readyFired && t > 40) { readyFired = true; onReady(); }
    }
    raf = requestAnimationFrame(frame);

    function finish() { if (opts.onEnd) opts.onEnd(); window.setTimeout(function () { cleanup(); onDone(); }, 700); }
    function cleanup() {
      if (disposed) return; disposed = true;
      cancelAnimationFrame(raf); window.removeEventListener('resize', resize);
      disposeSlabs();
      for (let i = 0; i < mats.length; i++) { try { mats[i].dispose(); } catch (e) {} }
      for (let i = 0; i < texs.length; i++) { try { texs[i].dispose(); } catch (e) {} }
      try { monoTex && monoTex.dispose(); } catch (e) {}
      try { envTex.dispose(); } catch (e) {} try { pmrem.dispose(); } catch (e) {} try { renderer.dispose(); } catch (e) {}
    }
    overlay._vaultCleanup = function () { cleanup(); };
  } catch (err) {
    try { renderer && renderer.dispose(); } catch (e) {}
    onDone();
  }
}
