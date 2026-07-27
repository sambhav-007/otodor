/* ═══════════════════════════════════════════════════════════════════════
   OTODOR Vault Intro — Three.js minimal LUXURY vault (r160, ESM)
   Self-hosted Three (./three.module.js). No CDN / CSP dependency.

   Design language: Apple / Nothing / B&O / Ex Machina — NOT industrial sci-fi.
   Two enormous near-featureless monolithic slabs, precise hairline panel gaps,
   a micro-bevelled perimeter, a single thin illuminated seam, hidden mechanics.
   The frame is carved into a smooth architectural wall. Brushed-titanium satin
   materials, soft reflections, neutral-white light with tiny blue/amber accents.
   The slabs glide apart effortlessly (no shake, no visible hydraulics); the DOM
   hero is revealed through the widening gap with a soft internal light leak.
   Self-disposing; any failure calls onDone() so the hero shows instantly.
   ═══════════════════════════════════════════════════════════════════════ */
import * as THREE from './three.module.js';

const UNLOCK = 900;    // seam ignites, hidden locks release (no visible travel)
const OPEN_AT = 1650;  // slabs begin to glide
const OPEN_DUR = 3000; // slow, effortless, massive
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
  let disposed = false, ended = false, started = 0, readyFired = false;
  const geos = [], mats = [], texs = [];
  const G = (g) => { geos.push(g); return g; };
  const M = (m) => { mats.push(m); return m; };
  const T = (t) => { texs.push(t); return t; };

  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance', logarithmicDepthBuffer: true }); }
  catch (e) { onDone(); return; }

  try {
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x2b2f34, 24, 70);
    camera = new THREE.PerspectiveCamera(38, 1, 3, 90);   // tight near/far → strong depth precision (no z-fighting)

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

    // ── Brushed-titanium grain (roughness) + micro normal relief ──
    const nc = document.createElement('canvas'); nc.width = 256; nc.height = 256;
    const nx = nc.getContext('2d'); nx.fillStyle = '#7d7d7d'; nx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 420; i++) { const x = Math.random() * 256; const light = Math.random() < 0.5; nx.strokeStyle = 'rgba(' + (light ? '255,255,255' : '54,54,54') + ',' + (0.015 + Math.random() * 0.04) + ')'; nx.lineWidth = Math.random() * 0.9; nx.beginPath(); nx.moveTo(x, 0); nx.lineTo(x + (Math.random() - 0.5) * 4, 256); nx.stroke(); }
    const brush = T(new THREE.CanvasTexture(nc)); brush.wrapS = brush.wrapT = THREE.RepeatWrapping; brush.repeat.set(6, 2);
    // normal map — very fine vertical brushed relief so the metal just catches light
    const nmC = document.createElement('canvas'); nmC.width = 256; nmC.height = 256;
    const nmX = nmC.getContext('2d'); nmX.fillStyle = 'rgb(128,128,255)'; nmX.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 340; i++) { const x = Math.random() * 256; const d = Math.round((Math.random() - 0.5) * 30); nmX.strokeStyle = 'rgb(' + (128 + d) + ',128,255)'; nmX.lineWidth = Math.random() * 1.1; nmX.beginPath(); nmX.moveTo(x, 0); nmX.lineTo(x, 256); nmX.stroke(); }
    const slabNormal = T(new THREE.CanvasTexture(nmC)); slabNormal.wrapS = slabNormal.wrapT = THREE.RepeatWrapping; slabNormal.repeat.set(4, 4);

    // ── Soft additive sprite (light leak only) ──
    const gc = document.createElement('canvas'); gc.width = gc.height = 128;
    const gg = gc.getContext('2d');
    const gr = gg.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.5, 'rgba(230,240,255,0.35)'); gr.addColorStop(1, 'rgba(230,240,255,0)');
    gg.fillStyle = gr; gg.fillRect(0, 0, 128, 128);
    const softTex = T(new THREE.CanvasTexture(gc));
    const soft = (x, y, z, w, h, color, op) => { const mat = M(new THREE.SpriteMaterial({ map: softTex, color: color, blending: THREE.AdditiveBlending, transparent: true, opacity: op, depthWrite: false })); const sp = new THREE.Sprite(mat); sp.position.set(x, y, z); sp.scale.set(w, h, 1); scene.add(sp); return sp; };

    // ── Materials — brushed titanium / satin ceramic / anodized (soft) ──
    const slabMat = M(new THREE.MeshPhysicalMaterial({ color: 0x000000, metalness: 0.15, roughness: 0.55, normalMap: slabNormal, normalScale: new THREE.Vector2(0.12, 0.12), clearcoat: 0.5, clearcoatRoughness: 0.22, envMapIntensity: 0.35 }));   // pitch-black gates — only a faint clearcoat edge sheen
    const bevelMat = M(new THREE.MeshStandardMaterial({ color: 0x262a30, metalness: 0.95, roughness: 0.32, envMapIntensity: 1.6 }));                         // dark-steel cavity accents (guide rails)
    const lineMat = M(new THREE.MeshStandardMaterial({ color: 0x0a0b0d, metalness: 0.4, roughness: 0.7 }));                                                  // hairline groove
    const wallMat = M(new THREE.MeshStandardMaterial({ color: 0x0b0d11, metalness: 0.55, roughness: 0.52, roughnessMap: brush, envMapIntensity: 1.4 }));     // black architecture (matte)
    const floorMat = M(new THREE.MeshStandardMaterial({ color: 0x090b0e, metalness: 0.6, roughness: 0.26, roughnessMap: brush, envMapIntensity: 1.8 }));     // black reflective floor
    const seamMat = M(new THREE.MeshStandardMaterial({ color: 0x0a0d12, emissive: 0x5aa0ff, emissiveIntensity: 0.0, roughness: 0.4 }));
    const ledBlue = M(new THREE.MeshStandardMaterial({ color: 0x0a0d12, emissive: 0x3d9bff, emissiveIntensity: 2.0, roughness: 0.5 }));
    const ledAmber = M(new THREE.MeshStandardMaterial({ color: 0x241804, emissive: 0xffab30, emissiveIntensity: 2.2, roughness: 0.5 }));
    const ceilLine = M(new THREE.MeshStandardMaterial({ color: 0x0c0d0f, emissive: 0xfff4e6, emissiveIntensity: 1.8, roughness: 0.6 }));

    const box = (w, h, d) => G(new THREE.BoxGeometry(w, h, d));
    const mesh = (geo, mat, x, y, z, cast, rec) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (cast) m.castShadow = true; if (rec) m.receiveShadow = true; return m; };

    // ── Minimal chamber (large uninterrupted surfaces) ──
    // HALF_W must CONTAIN a fully-parked gate, or the side wall slices it and the gate
    // reads as sinking into the wall. A parked gate's outer edge reaches
    //   (OW/2 + SLANT) + (OW/2 + OV) = 10.08 + 5.6 = 15.68
    // and the wall's inner face sits at HALF_W - 0.25, so HALF_W must exceed 15.93.
    const HALF_W = 16.5, HALF_H = 6, LEN = 28;
    const room = new THREE.Group();
    room.add(mesh(box(HALF_W * 2, 0.5, LEN), floorMat, 0, -HALF_H, LEN / 2 - 1.5, false, true));            // floor
    room.add(mesh(box(HALF_W * 2, 0.5, LEN), wallMat, 0, HALF_H, LEN / 2 - 1.5, false, true));              // ceiling
    room.add(mesh(box(0.5, HALF_H * 2, LEN), wallMat, -HALF_W, 0, LEN / 2 - 1.5, false, true));             // L wall
    room.add(mesh(box(0.5, HALF_H * 2, LEN), wallMat, HALF_W, 0, LEN / 2 - 1.5, false, true));              // R wall
    // two thin recessed ceiling light lines (the only practical lights you see)
    room.add(mesh(box(0.18, 0.06, LEN * 0.7), ceilLine, -2.6, HALF_H - 0.5, LEN / 2 - 1.5, false, false));
    room.add(mesh(box(0.18, 0.06, LEN * 0.7), ceilLine, 2.6, HALF_H - 0.5, LEN / 2 - 1.5, false, false));
    scene.add(room);

    // ── Vault opening carved into the far wall (integrated frame) ──
    const DW = 5.4, DH = 9, DD = 1.5;      // slab half-width, height, thickness (massive)
    const OW = DW * 2, OH = DH;            // opening
    const wall = new THREE.Group();
    // Panels OVERLAP (never abut) so no two faces are coplanar → no z-fighting.
    const sideW = (HALF_W - OW / 2);
    const topH = (HALF_H - OH / 2);
    // lintel + sill: full width, in front
    wall.add(mesh(box(HALF_W * 2, topH, 1.4), wallMat, 0, HALF_H - topH / 2, 0, false, true));              // lintel
    wall.add(mesh(box(HALF_W * 2, topH, 1.4), wallMat, 0, -(HALF_H - topH / 2), 0, false, true));           // sill
    // side jambs: opening height + overlap into lintel/sill, recessed so their top/bottom hide behind them
    wall.add(mesh(box(sideW, OH + 0.9, 1.3), wallMat, -(OW / 2 + sideW / 2), 0, -0.08, false, true));       // left jamb
    wall.add(mesh(box(sideW, OH + 0.9, 1.3), wallMat, (OW / 2 + sideW / 2), 0, -0.08, false, true));        // right jamb
    scene.add(wall);

    // soft internal light leak (grows as the gates part) — no inner walls / rails
    const leak = soft(0, 0.2, -0.5, 2.2, OH * 0.95, 0xeef2ff, 0.0);

    // ── OTODOR monogram — planar-mapped so the DIAGONAL cut splits its slant ──
    let monoTex = null, logoMat = null;
    try { monoTex = new THREE.TextureLoader().load(new URL('./otodor-monogram.png', import.meta.url).href); } catch (e) { monoTex = null; }
    const SLANT = OH * 0.52;  // diagonal offset — matched to the logo's ~45° square-diagonal slash
    const LW = 3.8, LH = 3.8, LY = 0;                 // logo centred on the door centre → the seam runs through the middle of the logo
    if (monoTex) {
      monoTex.colorSpace = THREE.SRGBColorSpace; monoTex.wrapS = monoTex.wrapT = THREE.ClampToEdgeWrapping; monoTex.anisotropy = 8;
      logoMat = M(new THREE.MeshStandardMaterial({ map: monoTex, emissive: 0x9fd0ff, emissiveMap: monoTex, emissiveIntensity: 1.0, transparent: true, alphaTest: 0.35, depthWrite: false, metalness: 0.4, roughness: 0.5, envMapIntensity: 0.7 }));
    }

    // ── Two blast-door halves split along a DIAGONAL, built from extruded shapes ──
    const seamGlows = [];
    const EXT = 0.3, OV = 0.2, GAP = 0.05;   // frame overlap + seam half-gap
    // The seam is drawn ONCE (not per slab) so the two halves can never read as two
    // offset parallel lines. It spans the exact cut — corner to corner of the gates,
    // no overshoot — and lives at the split centre (x = 0).
    const diagRot = -Math.atan2(2 * SLANT, OH + 2 * EXT);
    const diagLen = Math.sqrt((2 * SLANT) * (2 * SLANT) + (OH + 2 * EXT) * (OH + 2 * EXT));
    function makeSlab(side) {
      const grp = new THREE.Group();
      const shape = new THREE.Shape();
      if (side < 0) {   // left of the diagonal
        shape.moveTo(-OW / 2 - OV, -OH / 2 - EXT);
        shape.lineTo(-SLANT - GAP, -OH / 2 - EXT);
        shape.lineTo(SLANT - GAP, OH / 2 + EXT);
        shape.lineTo(-OW / 2 - OV, OH / 2 + EXT);
      } else {          // right of the diagonal
        shape.moveTo(-SLANT + GAP, -OH / 2 - EXT);
        shape.lineTo(OW / 2 + OV, -OH / 2 - EXT);
        shape.lineTo(OW / 2 + OV, OH / 2 + EXT);
        shape.lineTo(SLANT + GAP, OH / 2 + EXT);
      }
      shape.closePath();
      const baseGeo = G(new THREE.ExtrudeGeometry(shape, { depth: DD, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 1 }));
      baseGeo.translate(0, 0, -DD / 2);
      grp.add(mesh(baseGeo, slabMat, 0, 0, 0, true, true));
      // logo clipped to this half's shape → the diagonal splits its slant.
      // Bake planar UVs explicitly (ShapeGeometry's default UVs are unreliable here).
      if (logoMat) {
        const face = G(new THREE.ShapeGeometry(shape));
        const pos = face.attributes.position, uvArr = new Float32Array(pos.count * 2);
        for (let k = 0; k < pos.count; k++) { uvArr[k * 2] = pos.getX(k) / LW + 0.5; uvArr[k * 2 + 1] = (pos.getY(k) - LY) / LH + 0.5; }
        face.setAttribute('uv', new THREE.BufferAttribute(uvArr, 2));
        grp.add(mesh(face, logoMat, 0, 0, DD / 2 + 0.16, false, false));
      }
      // Glowing diagonal seam edge — one HALF per slab so it travels with the gate and
      // stays lit for the whole animation. Each bar fills exactly its side of the 0.1
      // slot (width GAP, centred at side*GAP/2), so closed they read as ONE continuous
      // line — not two offset parallel lines.
      const seamEl = mesh(box(GAP, diagLen, 0.12), seamMat, side * GAP / 2, 0, DD / 2 + 0.14, false, false);
      seamEl.rotation.z = diagRot; grp.add(seamEl);
      // tiny functional indicators
      grp.add(mesh(box(0.35, 0.05, 0.04), ledBlue, side * 3.6, 3.4, DD / 2 + 0.08, false, false));
      grp.add(mesh(box(0.07, 0.07, 0.04), ledAmber, side * 3.6, -3.4, DD / 2 + 0.08, false, false));
      grp.position.z = 1.6;   // whole slab sits in FRONT of the wall face (toward the viewer), not submerged
      scene.add(grp);
      return grp;
    }
    const leftSlab = makeSlab(-1), rightSlab = makeSlab(1);

    // Slabs are built at the opening centre; they part horizontally and park at the edges.
    // Park EXACTLY where the diagonal's trailing corner clears the opening — no further.
    // Overshooting (the old +1.6) sailed them past the side walls, where the wall clipped
    // them into two chunks floating detached from the frame. Flush against the jamb they
    // stay read as gates parked on the wall.
    const LC = 0, RC = 0;
    const LO = -(OW / 2 + SLANT), RO = OW / 2 + SLANT;

    // ── Lights — soft & even (env + directional; NO point-light hotspots) ──
    scene.add(new THREE.HemisphereLight(0xccd4dc, 0x35393f, 1.9));
    scene.add(new THREE.AmbientLight(0x7c828a, 0.75));
    const key = new THREE.DirectionalLight(0xfff6ec, 1.7);
    key.position.set(5, 13, 16); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1; key.shadow.camera.far = 80;
    key.shadow.camera.left = -20; key.shadow.camera.right = 20; key.shadow.camera.top = 13; key.shadow.camera.bottom = -13;   // must span the parked gates (|x| ≈ 15.7) or their shadows clip
    key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03; key.shadow.radius = 2.5;
    scene.add(key); scene.add(key.target);
    const fill = new THREE.DirectionalLight(0xc0c8d2, 1.1); fill.position.set(-8, 3, 13); scene.add(fill);
    const back = new THREE.DirectionalLight(0xaeb6c2, 0.5); back.position.set(0, 6, -10); scene.add(back);   // gentle rim
    const warm = new THREE.PointLight(0xffe8cc, 0, 30, 2); warm.position.set(0, 0.4, -1.4); scene.add(warm); // interior light — grazes the revealed thick edges

    // ── Camera ──
    // Framed as ARCHITECTURE, not as a close-up of a slab: the camera sits far enough
    // back that the whole chamber reads — jambs, the two recessed ceiling light lines,
    // and the reflective floor — with the gates as the object inside it. Landscape used
    // to sit at z 16.5 / fov 38, which cropped to black door and threw the room away.
    let baseCam = new THREE.Vector3(0, 1.4, 24);
    function resize() {
      const w = overlay.clientWidth || window.innerWidth, h = overlay.clientHeight || window.innerHeight;
      // landscape fov opens up to keep the (now wider) side walls inside the frame —
      // pulling further back instead isn't possible, the camera would exit the room
      const aspect = w / h; camera.aspect = aspect; camera.fov = aspect < 1 ? 58 : 48;
      baseCam.z = 24; camera.updateProjectionMatrix(); renderer.setSize(w, h, false);
    }
    resize(); window.addEventListener('resize', resize);

    // ── Render loop — calm, effortless (no shake/rumble/vibration) ──
    function frame(now) {
      if (disposed) return;
      raf = requestAnimationFrame(frame);
      if (!started) started = now;
      const t = now - started;

      // fly-through: after the doors open + a brief hold, the camera dives through
      // the opening into the hero (zoom in fully to reach the landing page).
      const OPEN_END = OPEN_AT + OPEN_DUR;
      // (longer than before: the camera now starts further back, so the dive covers more
      // distance — keep it unhurried rather than a lurch)
      const fly = t > OPEN_END + 500 ? easeInOutQuart(clamp((t - OPEN_END - 500) / 1800, 0, 1)) : 0;

      // breathing + slow pre-open dolly, then FLY forward through the gap
      const sx = Math.sin(t * 0.0003) * 0.1 * (1 - fly), sy = Math.sin(t * 0.00052) * 0.06 * (1 - fly);
      const preDolly = clamp((t - OPEN_AT) / OPEN_DUR, 0, 1) * 1.1;
      const camZ = fly > 0 ? (baseCam.z - 1.1) + fly * (2.4 - (baseCam.z - 1.1)) : baseCam.z - preDolly;
      camera.position.set(baseCam.x + sx, baseCam.y + sy, camZ);
      camera.lookAt(0, 0.2 * (1 - fly), -3);

      // seam ignites softly at unlock (the one moment of light)
      seamMat.emissiveIntensity = t < UNLOCK ? 0.0 : clamp((t - UNLOCK) / 500, 0, 1) * 2.4;

      // effortless glide
      if (t > OPEN_AT) {
        const op = clamp((t - OPEN_AT) / OPEN_DUR, 0, 1);
        const e = easeInOutQuart(op);
        leftSlab.position.x = LC + (LO - LC) * e;
        rightSlab.position.x = RC + (RO - RC) * e;
        // hold the interior glow open — the old sin() curve returned to 0 by op≈0.67,
        // leaving the fully-open portal as a flat black rectangle with no depth
        leak.material.opacity = Math.min(op * 2.2, 1) * 0.42;
        leak.scale.x = 2.0 + op * 7;
        warm.intensity = Math.min(op * 3, 1) * 3.2;
      }
      // fly complete → cross-fade to the hero
      if (fly >= 1 && !ended) { ended = true; finish(); }

      renderer.render(scene, camera);
      if (!readyFired && t > 40) { readyFired = true; onReady(); }
    }
    raf = requestAnimationFrame(frame);

    function finish() { if (opts.onEnd) opts.onEnd(); window.setTimeout(function () { cleanup(); onDone(); }, 700); }
    function cleanup() {
      if (disposed) return; disposed = true;
      cancelAnimationFrame(raf); window.removeEventListener('resize', resize);
      for (let i = 0; i < geos.length; i++) { try { geos[i].dispose(); } catch (e) {} }
      for (let i = 0; i < mats.length; i++) { try { mats[i].dispose(); } catch (e) {} }
      for (let i = 0; i < texs.length; i++) { try { texs[i].dispose(); } catch (e) {} }
      try { envTex.dispose(); } catch (e) {} try { pmrem.dispose(); } catch (e) {} try { renderer.dispose(); } catch (e) {}
    }
    overlay._vaultCleanup = function () { cleanup(); };
  } catch (err) {
    try { renderer && renderer.dispose(); } catch (e) {}
    onDone();
  }
}
