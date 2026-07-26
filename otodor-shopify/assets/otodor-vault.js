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
const OPEN_AT = 2100;       // ms — doors begin to part
const OPEN_DUR = 2800;      // ms — heavy slide (slow, massive)
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
    renderer.toneMappingExposure = 1.42;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x2a3644, 16, 52);
    camera = new THREE.PerspectiveCamera(36, 1, 0.1, 260);

    // ── Procedural env map (reflections, no external assets) ──
    const ec = document.createElement('canvas'); ec.width = 512; ec.height = 256;
    const g2 = ec.getContext('2d');
    const grd = g2.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0.0, '#1c2836'); grd.addColorStop(0.4, '#33475c');
    grd.addColorStop(0.5, '#5a748f'); grd.addColorStop(0.6, '#2e4256'); grd.addColorStop(1.0, '#14181d');
    g2.fillStyle = grd; g2.fillRect(0, 0, 512, 256);
    g2.fillStyle = 'rgba(210,232,255,0.9)'; g2.fillRect(0, 46, 512, 8); g2.fillRect(0, 80, 512, 3);
    g2.fillStyle = 'rgba(255,200,140,0.35)'; g2.fillRect(0, 205, 512, 12);
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
    const titanium = M(new THREE.MeshStandardMaterial({ color: 0x5a616b, metalness: 0.92, roughness: 0.38, envMapIntensity: 1.5 }));
    const armorMat = M(new THREE.MeshStandardMaterial({ color: 0x464d56, metalness: 0.88, roughness: 0.45, envMapIntensity: 1.35 }));
    const plateMat = M(new THREE.MeshStandardMaterial({ color: 0x333a43, metalness: 0.85, roughness: 0.52, envMapIntensity: 1.2 }));
    const wallMat = M(new THREE.MeshStandardMaterial({ color: 0x3a434e, metalness: 0.78, roughness: 0.58, envMapIntensity: 1.1 }));
    const ribMat = M(new THREE.MeshStandardMaterial({ color: 0x525a64, metalness: 0.9, roughness: 0.42, envMapIntensity: 1.3 }));
    const floorMat = M(new THREE.MeshStandardMaterial({ color: 0x2f353d, metalness: 0.6, roughness: 0.34, envMapIntensity: 1.4 }));
    const pistonMat = M(new THREE.MeshStandardMaterial({ color: 0x7a828c, metalness: 1.0, roughness: 0.26, envMapIntensity: 1.6 }));
    const boltMat = M(new THREE.MeshStandardMaterial({ color: 0x565d66, metalness: 1.0, roughness: 0.32, envMapIntensity: 1.4 }));
    const stripMat = M(new THREE.MeshStandardMaterial({ color: 0x0a0d12, emissive: 0x6db8ff, emissiveIntensity: 2.2, roughness: 0.5 }));

    const box = (w, h, d) => G(new THREE.BoxGeometry(w, h, d));
    const cyl = (r, l, s) => G(new THREE.CylinderGeometry(r, r, l, s || 20));
    const mesh = (geo, mat, x, y, z, cast, rec) => {
      const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
      if (cast) m.castShadow = true; if (rec) m.receiveShadow = true;
      return m;
    };

    // ── Corridor (camera is inside it; ends at the vault plane z=0) ──
    const HALF_W = 8, HALF_H = 5, LEN = 22;
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
    const frameMat = M(new THREE.MeshStandardMaterial({ color: 0x3d454f, metalness: 0.9, roughness: 0.46, envMapIntensity: 1.25 }));
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
      const W = 4, H = 7, D = 1.15;
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
    const LC = leftDoor.position.x, RC = rightDoor.position.x, LO = -17, RO = 17;

    // ── Lights (bright enough to READ the whole facility) ──
    scene.add(new THREE.HemisphereLight(0x93aecb, 0x2c333c, 1.5));
    scene.add(new THREE.AmbientLight(0x5a6675, 0.6));
    const key = new THREE.DirectionalLight(0xe4f0ff, 2.6);
    key.position.set(6, 11, 12); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1; key.shadow.camera.far = 70;
    key.shadow.camera.left = -13; key.shadow.camera.right = 13; key.shadow.camera.top = 12; key.shadow.camera.bottom = -12;
    key.shadow.bias = -0.0004; key.shadow.radius = 4;
    scene.add(key); scene.add(key.target);
    // Cool fill from the front-left so the door faces + corridor read
    const fill = new THREE.DirectionalLight(0x9fc4ff, 1.1); fill.position.set(-8, 4, 10); scene.add(fill);
    // Practical corridor pools + interior lights
    const fillB = new THREE.PointLight(0x8ec6ff, 120, 40, 2); fillB.position.set(0, 3, 9); scene.add(fillB);
    const interior = new THREE.PointLight(0xbcd8ff, 60, 26, 2); interior.position.set(0, 0, 3.5); scene.add(interior);
    const rimL = new THREE.PointLight(0x9fd0ff, 20, 16, 2); rimL.position.set(-1.2, 0.8, 2.6); scene.add(rimL);
    const rimR = new THREE.PointLight(0x9fd0ff, 20, 16, 2); rimR.position.set(1.2, -0.8, 2.6); scene.add(rimR);
    const warm = new THREE.PointLight(0xffc078, 0, 40, 2); warm.position.set(0, 0, -6); scene.add(warm);

    // ── Camera + resize (aspect-aware) ──
    let baseCam = new THREE.Vector3(0, 1.9, 18);
    function resize() {
      const w = overlay.clientWidth || window.innerWidth, h = overlay.clientHeight || window.innerHeight;
      const aspect = w / h;
      camera.aspect = aspect;
      camera.fov = aspect < 1 ? 56 : 38;
      baseCam.z = aspect < 1 ? 24 : 18;
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
      camera.lookAt(0, 0.5, -3);

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
