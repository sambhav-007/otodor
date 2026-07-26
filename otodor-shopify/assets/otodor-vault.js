/* ═══════════════════════════════════════════════════════════════════════
   OTODOR Vault Intro — Three.js cinematic blast-door corridor (r160, ESM)
   Self-hosted Three (./three.module.js). No CDN / CSP dependency.

   A camera INSIDE an industrial security tunnel; a massive two-part blast door
   dominates the frame. Multi-layer armor doors, varied tunnel detail, static
   wall-cavity machinery (rails / hydraulics / cable carriers) revealed as the
   doors part, procedural wear (roughness map), staged heavy motion, and the DOM
   hero revealed through the widening transparent gap. Self-disposing; any
   failure calls onDone() so the hero shows instantly.
   ═══════════════════════════════════════════════════════════════════════ */
import * as THREE from './three.module.js';

const WARN = 350;      // warning lights activate
const UNLOCK = 950;    // locking bolts retract, clamps release, seams ignite
const PINS = 1300;     // centre pins retract
const PRESSURE = 1750; // hydraulic pressure builds — vibration, no travel yet
const OPEN_AT = 2250;  // doors begin to part
const OPEN_DUR = 2800; // heavy slide
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeInOutQuart = (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);
const rnd = (seed) => { const x = Math.sin(seed * 127.1) * 43758.5453; return x - Math.floor(x); };

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
    renderer.toneMappingExposure = 1.4;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x2a3644, 20, 60);
    camera = new THREE.PerspectiveCamera(40, 1, 0.1, 300);

    // ── Procedural env map ──
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

    // ── Procedural wear: roughness map (machining marks + speckle) ──
    const nc = document.createElement('canvas'); nc.width = nc.height = 256;
    const nx = nc.getContext('2d');
    nx.fillStyle = '#7a7a7a'; nx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 900; i++) { // fine speckle
      const v = 90 + Math.random() * 130; nx.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',0.5)';
      nx.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
    }
    for (let i = 0; i < 60; i++) { // anisotropic machining streaks
      const y = Math.random() * 256, a = Math.random() * 0.25;
      nx.strokeStyle = 'rgba(255,255,255,' + a + ')'; nx.lineWidth = Math.random() * 1.2;
      nx.beginPath(); nx.moveTo(0, y); nx.lineTo(256, y + (Math.random() - 0.5) * 6); nx.stroke();
    }
    const wearTex = T(new THREE.CanvasTexture(nc));
    wearTex.wrapS = wearTex.wrapT = THREE.RepeatWrapping; wearTex.repeat.set(3, 3);

    // ── Carbon-fibre weave (roughness) ──
    const cc = document.createElement('canvas'); cc.width = cc.height = 64;
    const cx = cc.getContext('2d'); cx.fillStyle = '#606060'; cx.fillRect(0, 0, 64, 64);
    cx.fillStyle = '#8a8a8a';
    for (let y = 0; y < 64; y += 8) for (let x = 0; x < 64; x += 8) { if (((x + y) / 8) % 2 === 0) cx.fillRect(x, y, 6, 6); }
    const carbonTex = T(new THREE.CanvasTexture(cc));
    carbonTex.wrapS = carbonTex.wrapT = THREE.RepeatWrapping; carbonTex.repeat.set(6, 8);

    // ── Additive glow / dust sprite ──
    const gc = document.createElement('canvas'); gc.width = gc.height = 128;
    const gg = gc.getContext('2d');
    const gr = gg.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(150,200,255,0.7)'); gr.addColorStop(1, 'rgba(80,150,255,0)');
    gg.fillStyle = gr; gg.fillRect(0, 0, 128, 128);
    const glowTex = T(new THREE.CanvasTexture(gc));
    const glow = (x, y, z, s, color, op) => {
      const mat = M(new THREE.SpriteMaterial({ map: glowTex, color: color || 0x8ec5ff, blending: THREE.AdditiveBlending, transparent: true, opacity: op == null ? 0.5 : op, depthWrite: false }));
      const sp = new THREE.Sprite(mat); sp.position.set(x, y, z); sp.scale.set(s, s, s); scene.add(sp); return sp;
    };

    // ── Materials (varied — titanium / graphite / carbon / steel / anodized) ──
    const titanium = M(new THREE.MeshStandardMaterial({ color: 0x5c636d, metalness: 0.92, roughness: 0.4, roughnessMap: wearTex, envMapIntensity: 1.5 }));
    const graphite = M(new THREE.MeshStandardMaterial({ color: 0x30343b, metalness: 0.7, roughness: 0.72, roughnessMap: wearTex, envMapIntensity: 0.9 }));
    const carbon = M(new THREE.MeshStandardMaterial({ color: 0x24272c, metalness: 0.6, roughness: 0.55, roughnessMap: carbonTex, envMapIntensity: 1.0 }));
    const steel = M(new THREE.MeshStandardMaterial({ color: 0x8a929c, metalness: 1.0, roughness: 0.22, roughnessMap: wearTex, envMapIntensity: 1.7 }));
    const anodized = M(new THREE.MeshStandardMaterial({ color: 0x3f5a74, metalness: 0.85, roughness: 0.38, envMapIntensity: 1.4 }));
    const armorMat = M(new THREE.MeshStandardMaterial({ color: 0x474e58, metalness: 0.88, roughness: 0.46, roughnessMap: wearTex, envMapIntensity: 1.35 }));
    const wallMat = M(new THREE.MeshStandardMaterial({ color: 0x3a434e, metalness: 0.78, roughness: 0.6, roughnessMap: wearTex, envMapIntensity: 1.1 }));
    const ribMat = M(new THREE.MeshStandardMaterial({ color: 0x525a64, metalness: 0.9, roughness: 0.44, envMapIntensity: 1.3 }));
    const floorMat = M(new THREE.MeshStandardMaterial({ color: 0x2f353d, metalness: 0.62, roughness: 0.3, roughnessMap: wearTex, envMapIntensity: 1.5 }));
    const pistonMat = M(new THREE.MeshStandardMaterial({ color: 0x7c848e, metalness: 1.0, roughness: 0.24, envMapIntensity: 1.6 }));
    const boltMat = M(new THREE.MeshStandardMaterial({ color: 0x565d66, metalness: 1.0, roughness: 0.32, envMapIntensity: 1.4 }));
    const stripMat = M(new THREE.MeshStandardMaterial({ color: 0x0a0d12, emissive: 0x6db8ff, emissiveIntensity: 2.2, roughness: 0.5 }));
    const warnMat = M(new THREE.MeshStandardMaterial({ color: 0x2a1a06, emissive: 0xff8a10, emissiveIntensity: 0.0, roughness: 0.5 }));

    const box = (w, h, d) => G(new THREE.BoxGeometry(w, h, d));
    const cyl = (r, l, s) => G(new THREE.CylinderGeometry(r, r, l, s || 16));
    const mesh = (geo, mat, x, y, z, cast, rec) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (cast) m.castShadow = true; if (rec) m.receiveShadow = true; return m; };

    // ── Corridor (varied industrial tunnel; camera is inside it) ──
    const HALF_W = 8, HALF_H = 5.5, LEN = 24;
    const corridor = new THREE.Group();
    corridor.add(mesh(box(HALF_W * 2, 0.4, LEN), floorMat, 0, -HALF_H, LEN / 2 - 0.5, false, true));
    corridor.add(mesh(box(HALF_W * 2, 0.4, LEN), wallMat, 0, HALF_H, LEN / 2 - 0.5, false, true));
    corridor.add(mesh(box(0.4, HALF_H * 2, LEN), wallMat, -HALF_W, 0, LEN / 2 - 0.5, false, true));
    corridor.add(mesh(box(0.4, HALF_H * 2, LEN), wallMat, HALF_W, 0, LEN / 2 - 0.5, false, true));
    let seg = 0;
    for (let z = 1.6; z < LEN; z += 2.6) {
      const big = (seg % 3 === 0);
      // ceiling rib + recessed light channel
      corridor.add(mesh(box(HALF_W * 2 + 0.2, big ? 0.7 : 0.45, 0.4), ribMat, 0, HALF_H - 0.3, z, false, false));
      const strip = mesh(box(2.4, 0.14, 0.14), stripMat, 0, HALF_H - 0.62, z, false, false); corridor.add(strip);
      glow(0, HALF_H - 0.62, z, 3.4, 0x9ec8ff, 0.5);
      // wall support columns / ribs (both sides), varied depth
      [-1, 1].forEach((s) => {
        const d = 0.4 + rnd(seg + s) * 0.35;
        corridor.add(mesh(box(0.55, HALF_H * 2, d), ribMat, s * (HALF_W - 0.28), 0, z, false, false));
        // maintenance panels / service hatches on alternating segments
        if (seg % 2 === 0) corridor.add(mesh(box(0.12, 1.5, 1.2), graphite, s * (HALF_W - 0.05), (rnd(seg * s) - 0.5) * 3, z + 0.4, false, false));
        // cable conduits running along the wall
        const cd = mesh(cyl(0.09, 2.6, 10), boltMat, s * (HALF_W - 0.15), -HALF_H + 1.1, z, false, false); cd.rotation.x = Math.PI / 2; corridor.add(cd);
        // wall LED + emergency indicator
        glow(s * (HALF_W - 0.4), 1.6, z, 1.5, 0x4da6ff, 0.45);
        if (seg % 3 === 1) glow(s * (HALF_W - 0.4), -1.8, z, 1.3, 0xff5a48, 0.4);
      });
      // ventilation duct across the ceiling on some segments
      if (seg % 3 === 2) corridor.add(mesh(box(1.4, 0.5, 1.6), graphite, (rnd(seg) - 0.5) * 6, HALF_H - 0.9, z, false, false));
      // floor expansion joint
      corridor.add(mesh(box(HALF_W * 2, 0.05, 0.12), graphite, 0, -HALF_H + 0.22, z, false, false));
      seg++;
    }
    scene.add(corridor);

    // ── Portal frame at the vault plane ──
    const frameMat = M(new THREE.MeshStandardMaterial({ color: 0x3d454f, metalness: 0.9, roughness: 0.46, roughnessMap: wearTex, envMapIntensity: 1.25 }));
    const portal = new THREE.Group();
    portal.add(mesh(box(1.1, HALF_H * 2, 2.0), frameMat, -HALF_W + 0.55, 0, 0, true, true));
    portal.add(mesh(box(1.1, HALF_H * 2, 2.0), frameMat, HALF_W - 0.55, 0, 0, true, true));
    portal.add(mesh(box(HALF_W * 2, 1.1, 2.0), frameMat, 0, HALF_H - 0.55, 0, true, true));
    portal.add(mesh(box(HALF_W * 2, 1.1, 2.0), frameMat, 0, -HALF_H + 0.55, 0, true, true));
    // warning beacons on the frame
    const warns = [];
    [[-HALF_W + 1.3, HALF_H - 1.2], [HALF_W - 1.3, HALF_H - 1.2], [-HALF_W + 1.3, -HALF_H + 1.2], [HALF_W - 1.3, -HALF_H + 1.2]].forEach((p) => {
      const w = mesh(box(0.3, 0.3, 0.2), warnMat, p[0], p[1], 0.9, false, false); portal.add(w); warns.push(w);
    });
    scene.add(portal);

    // ── Static wall-cavity mechanism (revealed as doors slide) ──
    const DW = 5.5, DH = 9, DD = 1.4;                 // door dims (≈40% bigger)
    const mechMats = { rail: steel, hyd: pistonMat, srv: graphite };
    const mech = new THREE.Group();
    // top + bottom linear guide rails spanning behind the opening
    [DH / 2 - 0.2, -(DH / 2 - 0.2)].forEach((yy) => {
      mech.add(mesh(box(HALF_W * 1.7, 0.22, 0.22), steel, 0, yy, -0.5, false, false));
      mech.add(mesh(box(HALF_W * 1.7, 0.1, 0.5), graphite, 0, yy - 0.22, -0.55, false, false)); // rail bed
    });
    // side hydraulic cylinders + servo housings inside each cavity
    [-1, 1].forEach((s) => {
      const hb = mesh(cyl(0.28, 2.2, 20), pistonMat, s * (DW + 1.0), 0.4, -0.55, false, false); hb.rotation.z = Math.PI / 2; mech.add(hb);
      mech.add(mesh(box(0.8, 1.0, 0.8), graphite, s * (DW + 1.6), 0.4, -0.6, false, false));       // servo motor
      // roller assembly guides
      for (let r = -1; r <= 1; r++) { const rl = mesh(cyl(0.16, 0.4, 12), steel, s * (DW - 0.4), r * 1.5, -0.5, false, false); rl.rotation.x = Math.PI / 2; mech.add(rl); }
    });
    scene.add(mech);

    // ── Blast doors (multi-layer armor) ──
    const seamMats = [], seamGlows = [], bolts = [], pins = [], clamps = [], cableLinks = [];
    function makeDoor(side) {
      const grp = new THREE.Group();
      const W = DW, H = DH, D = DD;
      grp.add(mesh(box(W, H, D), titanium, 0, 0, 0, true, true));                       // shell
      // inner-side LAYERED armor (steps inward → visible thickness on open)
      for (let l = 0; l < 3; l++) grp.add(mesh(box(0.14, H * (0.9 - l * 0.12), D * (0.8 - l * 0.18)), l === 1 ? carbon : armorMat, -side * (W / 2 - 0.07 - l * 0.14), 0, 0, true, true));
      // chamfered perimeter frame (polished steel)
      [[0, H / 2 - 0.2, W, 0.4], [0, -(H / 2 - 0.2), W, 0.4], [-(W / 2 - 0.2) * side * 0 - (W / 2 - 0.2), 0, 0.4, H], [(W / 2 - 0.2), 0, 0.4, H]].forEach((f) => {
        grp.add(mesh(box(f[2], f[3], 0.16), steel, f[0], f[1], D / 2 + 0.02, false, true));
      });
      // outer armor shell plate (graphite, raised) + recessed central plate (carbon)
      grp.add(mesh(box(W * 0.82, H * 0.86, 0.16), graphite, -side * 0.08, 0, D / 2 + 0.05, true, true));
      grp.add(mesh(box(W * 0.5, H * 0.5, 0.1), carbon, -side * 0.08, 0.2, D / 2 - 0.02, false, true));
      // reinforced corners
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach((c) => grp.add(mesh(box(0.8, 0.8, 0.22), steel, c[0] * (W / 2 - 0.5), c[1] * (H / 2 - 0.5), D / 2 + 0.04, true, false)));
      // bolt pattern grid on the armor
      for (let bx = -1; bx <= 1; bx++) for (let by = -2; by <= 2; by++) { const b = mesh(cyl(0.09, 0.14, 6), boltMat, bx * W * 0.28 - side * 0.08, by * 1.4, D / 2 + 0.12, false, false); b.rotation.x = Math.PI / 2; grp.add(b); }
      // deep vertical grooves + horizontal cooling slots
      for (let v = -2; v <= 2; v++) grp.add(mesh(box(0.05, H * 0.7, 0.08), graphite, v * 0.5 - side * 0.08, -0.6, D / 2 + 0.06, false, false));
      for (let s2 = 0; s2 < 4; s2++) grp.add(mesh(box(W * 0.42, 0.06, 0.06), carbon, -side * (W / 2 - 1.1), 2.4 - s2 * 0.28, D / 2 + 0.07, false, false));
      // maintenance cover (anodized) with mini bolts
      grp.add(mesh(box(1.0, 1.3, 0.1), anodized, side * (W / 2 - 1.0), -H / 2 + 1.5, D / 2 + 0.06, false, true));

      // Emissive inner seam + glow
      const seamMat = M(new THREE.MeshStandardMaterial({ color: 0x0a0d12, emissive: 0x4da6ff, emissiveIntensity: 1.4, roughness: 0.4 })); seamMats.push(seamMat);
      grp.add(mesh(box(0.06, H * 0.95, 0.2), seamMat, -side * (W / 2 - 0.02), 0, D / 2 - 0.05, false, false));
      const sg = glow(0, 0, 0, 1.1, 0x8ec5ff, 0.6); sg._side = side; seamGlows.push(sg);

      // Locking bolts (top/bottom, retract along Y) + centre pins (retract along X) + clamps
      [H / 2 - 0.5, -(H / 2 - 0.5)].forEach((yy) => { const bo = mesh(cyl(0.19, 0.9, 16), boltMat, -side * (W / 2 - 0.2), yy, 0.25, true, false); bo.rotation.z = Math.PI / 2; bo.userData = { baseY: yy, dir: yy > 0 ? 1 : -1 }; grp.add(bo); bolts.push(bo); });
      for (let i = -1; i <= 1; i++) { const pin = mesh(cyl(0.15, 0.7, 16), pistonMat, -side * (W / 2) - side * 0.28, i * 1.3, 0.2, true, false); pin.rotation.z = Math.PI / 2; pin.userData = { baseX: -side * (W / 2) - side * 0.28, side }; grp.add(pin); pins.push(pin); }
      [2.6, -2.6].forEach((yy) => { const cl = mesh(box(0.6, 0.9, 0.7), boltMat, -side * (W / 2 - 0.05), yy, -0.2, true, false); cl.userData = { baseX: -side * (W / 2 - 0.05), side }; grp.add(cl); clamps.push(cl); });
      // Cable carrier (drag chain) trailing to the outer edge — moves with the door
      for (let k = 0; k < 6; k++) grp.add(mesh(box(0.3, 0.24, 0.24), k % 2 ? graphite : boltMat, side * (W / 2 + 0.4 + k * 0.34), -H / 2 + 0.6, -0.4, false, false));
      // roller blocks riding the rails (move with door)
      [DH / 2 - 0.2, -(DH / 2 - 0.2)].forEach((yy) => { const rb = mesh(box(0.5, 0.4, 0.4), steel, side * (W / 2 - 0.3), yy, -0.5, true, false); grp.add(rb); });

      grp.position.x = side * (0.05 + W / 2);
      scene.add(grp);
      return grp;
    }
    const leftDoor = makeDoor(-1), rightDoor = makeDoor(1);
    const LC = leftDoor.position.x, RC = rightDoor.position.x, LO = -20, RO = 20;

    // ── Floating dust ──
    const dust = [];
    for (let i = 0; i < 26; i++) { const d = glow((Math.random() - 0.5) * 16, (Math.random() - 0.5) * 9, 2 + Math.random() * 12, 0.18 + Math.random() * 0.16, 0xbcd6ff, 0.14 + Math.random() * 0.14); d._sp = 0.2 + Math.random() * 0.4; d._ph = Math.random() * 6.28; dust.push(d); }

    // ── Lights ──
    scene.add(new THREE.HemisphereLight(0x93aecb, 0x2c333c, 1.45));
    scene.add(new THREE.AmbientLight(0x5a6675, 0.55));
    const key = new THREE.DirectionalLight(0xe4f0ff, 2.5);
    key.position.set(7, 13, 14); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1; key.shadow.camera.far = 80;
    key.shadow.camera.left = -15; key.shadow.camera.right = 15; key.shadow.camera.top = 14; key.shadow.camera.bottom = -14;
    key.shadow.bias = -0.0004; key.shadow.radius = 4;
    scene.add(key); scene.add(key.target);
    const fill = new THREE.DirectionalLight(0x9fc4ff, 1.0); fill.position.set(-10, 5, 12); scene.add(fill);
    const fillB = new THREE.PointLight(0x8ec6ff, 130, 44, 2); fillB.position.set(0, 3.5, 11); scene.add(fillB);
    const interior = new THREE.PointLight(0xbcd8ff, 55, 30, 2); interior.position.set(0, 0, 4); scene.add(interior);
    const rimL = new THREE.PointLight(0x9fd0ff, 22, 18, 2); rimL.position.set(-1.4, 1.0, 3.0); scene.add(rimL);
    const rimR = new THREE.PointLight(0x9fd0ff, 22, 18, 2); rimR.position.set(1.4, -1.0, 3.0); scene.add(rimR);
    const warm = new THREE.PointLight(0xffc078, 0, 46, 2); warm.position.set(0, 0, -7); scene.add(warm);

    // ── Camera ──
    let baseCam = new THREE.Vector3(0, 2.0, 16);
    function resize() {
      const w = overlay.clientWidth || window.innerWidth, h = overlay.clientHeight || window.innerHeight;
      const aspect = w / h;
      camera.aspect = aspect; camera.fov = aspect < 1 ? 60 : 40;
      baseCam.z = aspect < 1 ? 23 : 16;
      camera.updateProjectionMatrix(); renderer.setSize(w, h, false);
    }
    resize(); window.addEventListener('resize', resize);

    // ── Render loop / staged timeline ──
    function frame(now) {
      if (disposed) return;
      raf = requestAnimationFrame(frame);
      if (!started) started = now;
      const t = now - started;

      // Camera: breathing + dolly + shake at unlock + micro rumble during pressure/open
      let sx = Math.sin(t * 0.00035) * 0.2, sy = Math.sin(t * 0.0006) * 0.11;
      const dolly = clamp((t - UNLOCK) / (OPEN_AT + OPEN_DUR - UNLOCK), 0, 1) * 1.8;
      const shakeT = clamp(1 - (t - UNLOCK) / 340, 0, 1);
      let rumble = 0;
      if (t > PRESSURE && t < OPEN_AT) rumble = (t - PRESSURE) / (OPEN_AT - PRESSURE) * 0.05;
      if (t > OPEN_AT) rumble = 0.05 * (1 - clamp((t - OPEN_AT) / OPEN_DUR, 0, 1));
      if (t > UNLOCK && shakeT > 0) { sx += (Math.random() - 0.5) * 0.15 * shakeT; sy += (Math.random() - 0.5) * 0.15 * shakeT; }
      sx += (Math.random() - 0.5) * rumble; sy += (Math.random() - 0.5) * rumble;
      camera.position.set(baseCam.x + sx, baseCam.y + sy, baseCam.z - dolly);
      camera.lookAt(0, 0.4, -3);

      // Warning beacons blink on
      if (t > WARN) { const bl = (Math.floor(t / 260) % 2) === 0 ? 3.0 : 0.5; for (let i = 0; i < warns.length; i++) warns[i].material.emissiveIntensity = bl; }

      // Seams pulse → ignite
      const si = t < UNLOCK ? 1.4 + Math.sin(t * 0.006) * 0.6 : 4.2;
      for (let i = 0; i < seamMats.length; i++) seamMats[i].emissiveIntensity = si;
      for (let i = 0; i < seamGlows.length; i++) { const s = seamGlows[i]; const door = s._side < 0 ? leftDoor : rightDoor; s.position.set(door.position.x + s._side * -(DW / 2 - 0.05), 0, 0.7); s.material.opacity = 0.55 + (t > UNLOCK ? 0.35 : Math.sin(t * 0.006) * 0.15); s.scale.setScalar(t > UNLOCK ? 2.6 : 1.5); }

      // Unlock: bolts, clamps
      if (t > UNLOCK) { const u = clamp((t - UNLOCK) / (PINS - UNLOCK), 0, 1); for (let i = 0; i < bolts.length; i++) bolts[i].position.y = bolts[i].userData.baseY + bolts[i].userData.dir * 0.6 * u; for (let i = 0; i < clamps.length; i++) clamps[i].position.x = clamps[i].userData.baseX + clamps[i].userData.side * 0.45 * u; }
      // Centre pins retract
      if (t > PINS) { const p = clamp((t - PINS) / (PRESSURE - PINS), 0, 1); for (let i = 0; i < pins.length; i++) { pins[i].position.x = pins[i].userData.baseX + pins[i].userData.side * 0.45 * p; pins[i].scale.y = 1 - 0.5 * p; } }
      // Pre-open pressure vibration (doors buzz but don't travel)
      if (t > PRESSURE && t < OPEN_AT) { const b = Math.sin(t * 0.13) * 0.02; leftDoor.position.x = LC - b; rightDoor.position.x = RC + b; }

      // Heavy slide (resistance → accel → momentum → brake)
      if (t > OPEN_AT) {
        const op = clamp((t - OPEN_AT) / OPEN_DUR, 0, 1);
        const e = easeInOutQuart(op);
        const vib = op < 0.92 ? Math.sin(t * 0.08) * 0.012 * (1 - op) : 0;
        leftDoor.position.x = LC + (LO - LC) * e - vib;
        rightDoor.position.x = RC + (RO - RC) * e + vib;
        warm.intensity = op * 5.5;
        if (op >= 1 && !ended) { ended = true; finish(); }
      }

      // Dust drift
      for (let i = 0; i < dust.length; i++) { const d = dust[i]; d.position.y += Math.sin(t * 0.0004 + d._ph) * 0.0008 * d._sp * 60; d.position.x += Math.cos(t * 0.0003 + d._ph) * 0.0006 * d._sp * 60; }

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
