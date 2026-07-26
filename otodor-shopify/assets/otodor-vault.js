/* ═══════════════════════════════════════════════════════════════════════
   OTODOR Vault Intro — Three.js cinematic blast-door CORRIDOR (r160, ESM)
   Self-hosted Three (./three.module.js) — no CDN, no CSP dependency.

   The camera sits INSIDE an industrial security corridor (floor, ceiling,
   ribbed titanium walls, LED strips, fog). At the far end stands a two-part
   blast door — 6m tall, 4m wide, 1m thick volumes with armor plates, recessed
   machining, bolts, hydraulic pistons. Locks retract (with a camera shake),
   then the doors slide apart under heavy easing, revealing the DOM hero through
   the transparent opening.

   Transparent renderer → the hero shows THROUGH the gap. Self-disposing.
   Any failure calls onDone() so the hero shows instantly.
   ═══════════════════════════════════════════════════════════════════════ */
import * as THREE from './three.module.js';

const UNLOCK = 900;         // ms — bolts retract, seams ignite, camera shakes
const PINS = 1200;          // ms — centre pins retract
const OPEN_AT = 2000;       // ms — doors begin to part
const OPEN_DUR = 2300;      // ms — heavy slide
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
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

  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (e) { onDone(); return; }

  try {
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0f16, 10, 30);
    camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);

    // ── Procedural env map (reflections, no external assets) ──
    const ec = document.createElement('canvas'); ec.width = 512; ec.height = 256;
    const g2 = ec.getContext('2d');
    const grd = g2.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0.0, '#070a10'); grd.addColorStop(0.4, '#131c28');
    grd.addColorStop(0.5, '#26384c'); grd.addColorStop(0.6, '#101822'); grd.addColorStop(1.0, '#040506');
    g2.fillStyle = grd; g2.fillRect(0, 0, 512, 256);
    g2.fillStyle = 'rgba(190,220,255,0.6)'; g2.fillRect(0, 50, 512, 5); g2.fillRect(0, 82, 512, 2);
    g2.fillStyle = 'rgba(255,190,120,0.22)'; g2.fillRect(0, 205, 512, 9);
    const envSrc = T(new THREE.CanvasTexture(ec));
    envSrc.mapping = THREE.EquirectangularReflectionMapping; envSrc.colorSpace = THREE.SRGBColorSpace;
    pmrem = new THREE.PMREMGenerator(renderer);
    envTex = pmrem.fromEquirectangular(envSrc).texture;
    scene.environment = envTex;

    // ── Additive glow sprite (fake bloom) ──
    const gc = document.createElement('canvas'); gc.width = gc.height = 128;
    const gg = gc.getContext('2d');
    const gr = gg.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(150,200,255,0.7)');
    gr.addColorStop(1, 'rgba(80,150,255,0)');
    gg.fillStyle = gr; gg.fillRect(0, 0, 128, 128);
    const glowTex = T(new THREE.CanvasTexture(gc));
    const glow = (x, y, z, s, color) => {
      const mat = M(new THREE.SpriteMaterial({ map: glowTex, color: color || 0x8ec5ff, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }));
      const sp = new THREE.Sprite(mat); sp.position.set(x, y, z); sp.scale.set(s, s, s);
      scene.add(sp); return sp;
    };

    // ── Materials ──
    const titanium = M(new THREE.MeshStandardMaterial({ color: 0x23272c, metalness: 0.95, roughness: 0.34, envMapIntensity: 1.2 }));
    const armorMat = M(new THREE.MeshStandardMaterial({ color: 0x1b1f24, metalness: 0.9, roughness: 0.42, envMapIntensity: 1.0 }));
    const plateMat = M(new THREE.MeshStandardMaterial({ color: 0x0f1318, metalness: 0.86, roughness: 0.55, envMapIntensity: 0.85 }));
    const wallMat = M(new THREE.MeshStandardMaterial({ color: 0x0c1015, metalness: 0.8, roughness: 0.6, envMapIntensity: 0.7 }));
    const ribMat = M(new THREE.MeshStandardMaterial({ color: 0x161b21, metalness: 0.9, roughness: 0.45 }));
    const floorMat = M(new THREE.MeshStandardMaterial({ color: 0x080a0d, metalness: 0.55, roughness: 0.42, envMapIntensity: 0.9 }));
    const pistonMat = M(new THREE.MeshStandardMaterial({ color: 0x474d54, metalness: 1.0, roughness: 0.24, envMapIntensity: 1.3 }));
    const boltMat = M(new THREE.MeshStandardMaterial({ color: 0x2b2f34, metalness: 1.0, roughness: 0.3 }));
    const stripMat = M(new THREE.MeshStandardMaterial({ color: 0x0a0d12, emissive: 0x4da6ff, emissiveIntensity: 1.2, roughness: 0.5 }));

    const box = (w, h, d) => G(new THREE.BoxGeometry(w, h, d));
    const cyl = (r, l, s) => G(new THREE.CylinderGeometry(r, r, l, s || 20));
    const mesh = (geo, mat, x, y, z, cast, rec) => {
      const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
      if (cast) m.castShadow = true; if (rec) m.receiveShadow = true;
      return m;
    };

    // ── Corridor (camera is inside it; ends at the vault plane z=0) ──
    const HALF_W = 5, HALF_H = 4, LEN = 14;
    const corridor = new THREE.Group();
    corridor.add(mesh(box(HALF_W * 2, 0.4, LEN), floorMat, 0, -HALF_H, LEN / 2 - 0.5, false, true));   // floor
    corridor.add(mesh(box(HALF_W * 2, 0.4, LEN), wallMat, 0, HALF_H, LEN / 2 - 0.5, false, true));      // ceiling
    corridor.add(mesh(box(0.4, HALF_H * 2, LEN), wallMat, -HALF_W, 0, LEN / 2 - 0.5, false, true));     // L wall
    corridor.add(mesh(box(0.4, HALF_H * 2, LEN), wallMat, HALF_W, 0, LEN / 2 - 0.5, false, true));      // R wall
    // structural ribs + ceiling light strips + wall LEDs receding down the corridor
    for (let z = 1.5; z < LEN; z += 2.4) {
      corridor.add(mesh(box(HALF_W * 2 + 0.2, 0.5, 0.35), ribMat, 0, HALF_H - 0.25, z, false, false));   // ceiling rib
      corridor.add(mesh(box(0.5, HALF_H * 2, 0.35), ribMat, -HALF_W + 0.25, 0, z, false, false));        // L rib
      corridor.add(mesh(box(0.5, HALF_H * 2, 0.35), ribMat, HALF_W - 0.25, 0, z, false, false));         // R rib
      const strip = mesh(box(2.2, 0.12, 0.12), stripMat, 0, HALF_H - 0.55, z, false, false);
      corridor.add(strip);
      glow(0, HALF_H - 0.55, z, 3.2, 0x9ec8ff).material.opacity = 0.5;
      glow(-HALF_W + 0.35, 1.4, z, 1.4, 0x4da6ff).material.opacity = 0.45;
      glow(HALF_W - 0.35, -1.4, z, 1.4, 0xff5a48).material.opacity = 0.4; // emergency red
    }
    scene.add(corridor);

    // ── Portal frame at the vault plane ──
    const frameMat = M(new THREE.MeshStandardMaterial({ color: 0x0d1015, metalness: 0.9, roughness: 0.48, envMapIntensity: 0.9 }));
    const portal = new THREE.Group();
    portal.add(mesh(box(0.9, HALF_H * 2, 1.6), frameMat, -HALF_W + 0.5, 0, 0, true, true));
    portal.add(mesh(box(0.9, HALF_H * 2, 1.6), frameMat, HALF_W - 0.5, 0, 0, true, true));
    portal.add(mesh(box(HALF_W * 2, 0.9, 1.6), frameMat, 0, HALF_H - 0.5, 0, true, true));
    portal.add(mesh(box(HALF_W * 2, 0.9, 1.6), frameMat, 0, -HALF_H + 0.5, 0, true, true));
    scene.add(portal);

    // ── Blast doors (6 tall, 4 wide, 1 thick) ──
    const seamMats = [], bolts = [], pins = [], clamps = [], pistons = [], seamGlows = [];
    function makeDoor(side) {
      const grp = new THREE.Group();
      const W = 4, H = 6, D = 1;
      grp.add(mesh(box(W, H, D), titanium, 0, 0, 0, true, true));                    // body
      grp.add(mesh(box(W * 0.88, H * 0.92, 0.14), armorMat, -side * 0.1, 0, D / 2 + 0.03, true, true)); // armor
      // recessed machined panels (grid)
      for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
        grp.add(mesh(box(W * 0.36, 1.35, 0.06), plateMat, (-side * 0.1) + (c ? 0.55 : -0.55) * side * 0 + (c - 0.5) * W * 0.42, 1.7 - r * 1.7, D / 2 - 0.02, false, true));
      }
      // vertical ventilation grooves
      for (let v = -1; v <= 1; v++) grp.add(mesh(box(0.06, H * 0.8, 0.05), plateMat, -side * (W / 2 - 0.5) + v * 0.28, 0, D / 2 + 0.02, false, false));
      // outer hex bolts
      for (let b = -2; b <= 2; b++) {
        const bo = mesh(cyl(0.1, 0.14, 6), boltMat, side * (W / 2 - 0.3), b * 1.25, D / 2 + 0.05, true, false);
        bo.rotation.x = Math.PI / 2; grp.add(bo);
      }

      // Emissive inner-edge seam
      const seamMat = M(new THREE.MeshStandardMaterial({ color: 0x0a0d12, emissive: 0x4da6ff, emissiveIntensity: 1.4, roughness: 0.4 }));
      seamMats.push(seamMat);
      grp.add(mesh(box(0.05, H * 0.95, 0.18), seamMat, -side * (W / 2 - 0.02), 0, D / 2 - 0.04, false, false));
      const sgl = glow(0, 0, 0, 0.9, 0x8ec5ff); sgl.material.opacity = 0.6; sgl._side = side; seamGlows.push(sgl);

      // Locking bolts: top + bottom (retract along Y into frame)
      [H / 2 - 0.35, -(H / 2 - 0.35)].forEach((yy) => {
        const bolt = mesh(cyl(0.16, 0.7, 18), boltMat, -side * (W / 2 - 0.15), yy, 0.2, true, false);
        bolt.rotation.z = Math.PI / 2; bolt.userData = { baseY: yy, dir: yy > 0 ? 1 : -1 };
        grp.add(bolt); bolts.push(bolt);
      });
      // Centre locking pins (retract along X, outward)
      for (let i = -1; i <= 1; i++) {
        const pin = mesh(cyl(0.13, 0.6, 18), pistonMat, -side * (W / 2) - side * 0.22, i * 1.0, 0.15, true, false);
        pin.rotation.z = Math.PI / 2; pin.userData = { baseX: -side * (W / 2) - side * 0.22, side };
        grp.add(pin); pins.push(pin);
      }
      // Magnetic clamps (slide outward on release)
      [1.9, -1.9].forEach((yy) => {
        const cl = mesh(box(0.5, 0.7, 0.6), boltMat, -side * (W / 2 - 0.05), yy, -0.15, true, false);
        cl.userData = { baseX: -side * (W / 2 - 0.05), side }; grp.add(cl); clamps.push(cl);
      });
      // Hydraulic pistons + servo housings on the inner side (revealed on open)
      for (let i = -2; i <= 2; i++) {
        const pis = mesh(cyl(0.14, 0.8, 20), pistonMat, -side * (W / 2) - side * 0.45, i * 1.1, -0.05, true, false);
        pis.rotation.z = Math.PI / 2; grp.add(pis);
        grp.add(mesh(box(0.55, 0.55, 0.7), boltMat, -side * (W / 2 - 0.25), i * 1.1, -0.2, true, false));
        pistons.push(pis);
      }

      grp.position.x = side * (0.04 + W / 2);
      scene.add(grp);
      return grp;
    }
    const leftDoor = makeDoor(-1), rightDoor = makeDoor(1);
    const LC = leftDoor.position.x, RC = rightDoor.position.x, LO = -12, RO = 12;

    // ── Lights ──
    scene.add(new THREE.HemisphereLight(0x2a3a4d, 0x060708, 0.5));
    const key = new THREE.DirectionalLight(0xcfe4ff, 2.1);
    key.position.set(5, 9, 9); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1; key.shadow.camera.far = 55;
    key.shadow.camera.left = -10; key.shadow.camera.right = 10; key.shadow.camera.top = 9; key.shadow.camera.bottom = -9;
    key.shadow.bias = -0.0004; key.shadow.radius = 4;
    scene.add(key); scene.add(key.target);
    const fillB = new THREE.PointLight(0x4da6ff, 40, 26, 2); fillB.position.set(0, 2, 7); scene.add(fillB);
    const rimL = new THREE.PointLight(0x6db4ff, 8, 12, 2); rimL.position.set(-0.7, 0.6, 2.2); scene.add(rimL);
    const rimR = new THREE.PointLight(0x6db4ff, 8, 12, 2); rimR.position.set(0.7, -0.6, 2.2); scene.add(rimR);
    const warm = new THREE.PointLight(0xffb060, 0, 30, 2); warm.position.set(0, 0, -5); scene.add(warm);

    // ── Camera + resize (aspect-aware) ──
    let baseCam = new THREE.Vector3(0, 1.2, 12.5);
    function resize() {
      const w = overlay.clientWidth || window.innerWidth, h = overlay.clientHeight || window.innerHeight;
      const aspect = w / h;
      camera.aspect = aspect;
      camera.fov = aspect < 1 ? 52 : 34;
      baseCam.z = aspect < 1 ? 15 : 12.5;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    resize();
    window.addEventListener('resize', resize);

    // ── Render loop / timeline ──
    function frame(now) {
      if (disposed) return;
      raf = requestAnimationFrame(frame);
      if (!started) started = now;
      const t = now - started;

      // Camera: breathing + tiny dolly + shake at unlock
      let sx = Math.sin(t * 0.00035) * 0.18, sy = Math.sin(t * 0.0006) * 0.1;
      const dolly = clamp((t - UNLOCK) / (OPEN_AT + OPEN_DUR - UNLOCK), 0, 1) * 1.6;
      const shakeT = clamp(1 - (t - UNLOCK) / 340, 0, 1);
      if (t > UNLOCK && shakeT > 0) { sx += (Math.random() - 0.5) * 0.14 * shakeT; sy += (Math.random() - 0.5) * 0.14 * shakeT; }
      camera.position.set(baseCam.x + sx, baseCam.y + sy, baseCam.z - dolly);
      camera.lookAt(0, 0.1, -1);

      // Seam pulse → ignite
      const si = t < UNLOCK ? 1.4 + Math.sin(t * 0.006) * 0.6 : 4.2;
      for (let i = 0; i < seamMats.length; i++) seamMats[i].emissiveIntensity = si;
      for (let i = 0; i < seamGlows.length; i++) {
        const s = seamGlows[i]; s.material.opacity = 0.55 + (t > UNLOCK ? 0.35 : Math.sin(t * 0.006) * 0.15);
        const door = s._side < 0 ? leftDoor : rightDoor;
        s.position.set(door.position.x + s._side * -1.96, 0, 0.6); s.scale.setScalar(t > UNLOCK ? 2.4 : 1.4);
      }

      // Unlock: bolts up/down, clamps out
      if (t > UNLOCK) {
        const u = clamp((t - UNLOCK) / (PINS - UNLOCK), 0, 1);
        for (let i = 0; i < bolts.length; i++) bolts[i].position.y = bolts[i].userData.baseY + bolts[i].userData.dir * 0.55 * u;
        for (let i = 0; i < clamps.length; i++) { const c = clamps[i]; c.position.x = c.userData.baseX + c.userData.side * 0.4 * u; }
      }
      // Centre pins retract (slightly later)
      if (t > PINS) {
        const p = clamp((t - PINS) / (OPEN_AT - PINS), 0, 1);
        for (let i = 0; i < pins.length; i++) { const pin = pins[i]; pin.position.x = pin.userData.baseX + pin.userData.side * 0.4 * p; pin.scale.y = 1 - 0.5 * p; }
      }

      // Doors part (heavy easing + decaying vibration)
      if (t > OPEN_AT) {
        const op = clamp((t - OPEN_AT) / OPEN_DUR, 0, 1);
        const e = easeInOutQuart(op);
        const vib = op < 0.94 ? Math.sin(t * 0.085) * 0.01 * (1 - op) : 0;
        leftDoor.position.x = LC + (LO - LC) * e - vib;
        rightDoor.position.x = RC + (RO - RC) * e + vib;
        warm.intensity = op * 5;
        if (op >= 1 && !ended) { ended = true; finish(); }
      }

      renderer.render(scene, camera);
      if (!readyFired && t > 40) { readyFired = true; onReady(); }
    }
    raf = requestAnimationFrame(frame);

    function finish() {
      if (opts.onEnd) opts.onEnd();
      window.setTimeout(function () { cleanup(); onDone(); }, 700);
    }
    function cleanup() {
      if (disposed) return; disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      for (let i = 0; i < geos.length; i++) { try { geos[i].dispose(); } catch (e) {} }
      for (let i = 0; i < mats.length; i++) { try { mats[i].dispose(); } catch (e) {} }
      for (let i = 0; i < texs.length; i++) { try { texs[i].dispose(); } catch (e) {} }
      try { envTex.dispose(); } catch (e) {}
      try { pmrem.dispose(); } catch (e) {}
      try { renderer.dispose(); } catch (e) {}
    }
    overlay._vaultCleanup = function () { cleanup(); };
  } catch (err) {
    try { renderer && renderer.dispose(); } catch (e) {}
    onDone();
  }
}
