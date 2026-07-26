/* ═══════════════════════════════════════════════════════════════════════
   OTODOR Vault Intro — Three.js cinematic blast door (r160, ESM)
   Self-hosted Three (./three.module.js). No CDN / CSP dependency.

   Art direction: neutral graphite/gunmetal/titanium palette (NOT blue) with a
   warm-white interior and only small functional blue/amber LEDs. Big interlocking
   armor sections, large circular/hex mechanical modules, a deep bunker frame, an
   asymmetric cool-grey corridor, and strong value contrast (dark door / light
   frame / mid corridor) so the DOOR is the hero. Staged heavy motion reveals a
   real wall-cavity mechanism; the DOM hero shows through the widening gap.
   Self-disposing; any failure calls onDone() so the hero shows instantly.
   ═══════════════════════════════════════════════════════════════════════ */
import * as THREE from './three.module.js';

const WARN = 350, UNLOCK = 950, PINS = 1300, PRESSURE = 1750, OPEN_AT = 2250, OPEN_DUR = 2800;
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

  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { onDone(); return; }

  try {
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x353b42, 22, 64);
    camera = new THREE.PerspectiveCamera(40, 1, 0.1, 300);

    // ── Neutral studio env map (steel reflections, not blue) ──
    const ec = document.createElement('canvas'); ec.width = 512; ec.height = 256;
    const g2 = ec.getContext('2d');
    const grd = g2.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0.0, '#2b3037'); grd.addColorStop(0.45, '#565d66');
    grd.addColorStop(0.5, '#7c8590'); grd.addColorStop(0.55, '#565d66'); grd.addColorStop(1.0, '#1a1d21');
    g2.fillStyle = grd; g2.fillRect(0, 0, 512, 256);
    g2.fillStyle = 'rgba(240,244,250,0.85)'; g2.fillRect(0, 44, 512, 10);
    g2.fillStyle = 'rgba(255,224,180,0.3)'; g2.fillRect(0, 210, 512, 10);
    const envSrc = T(new THREE.CanvasTexture(ec));
    envSrc.mapping = THREE.EquirectangularReflectionMapping; envSrc.colorSpace = THREE.SRGBColorSpace;
    pmrem = new THREE.PMREMGenerator(renderer);
    envTex = pmrem.fromEquirectangular(envSrc).texture;
    scene.environment = envTex;

    // ── Procedural wear roughness map ──
    const nc = document.createElement('canvas'); nc.width = nc.height = 256;
    const nx = nc.getContext('2d'); nx.fillStyle = '#7a7a7a'; nx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 700; i++) { const v = 90 + Math.random() * 130; nx.fillStyle = 'rgba(' + v + ',' + v + ',' + v + ',0.45)'; nx.fillRect(Math.random() * 256, Math.random() * 256, 1, 1); }
    for (let i = 0; i < 44; i++) { const y = Math.random() * 256; nx.strokeStyle = 'rgba(255,255,255,' + (Math.random() * 0.2) + ')'; nx.lineWidth = Math.random() * 1.1; nx.beginPath(); nx.moveTo(0, y); nx.lineTo(256, y + (Math.random() - 0.5) * 5); nx.stroke(); }
    const wear = T(new THREE.CanvasTexture(nc)); wear.wrapS = wear.wrapT = THREE.RepeatWrapping; wear.repeat.set(2, 2);

    // ── Soft additive sprite (light-shaft dust only) ──
    const gc = document.createElement('canvas'); gc.width = gc.height = 128;
    const gg = gc.getContext('2d');
    const gr = gg.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(0.4, 'rgba(255,250,235,0.4)'); gr.addColorStop(1, 'rgba(255,250,235,0)');
    gg.fillStyle = gr; gg.fillRect(0, 0, 128, 128);
    const softTex = T(new THREE.CanvasTexture(gc));
    const shaft = (x, y, z, w, h, color, op) => {
      const mat = M(new THREE.SpriteMaterial({ map: softTex, color: color, blending: THREE.AdditiveBlending, transparent: true, opacity: op, depthWrite: false }));
      const sp = new THREE.Sprite(mat); sp.position.set(x, y, z); sp.scale.set(w, h, 1); scene.add(sp); return sp;
    };

    // ── Palette (VALUE CONTRAST: door darkest, frame lightest, corridor mid) ──
    const graphite = M(new THREE.MeshStandardMaterial({ color: 0x24272c, metalness: 0.82, roughness: 0.5, roughnessMap: wear, envMapIntensity: 1.2 }));   // DOOR — darkest
    const ceramic = M(new THREE.MeshStandardMaterial({ color: 0x121316, metalness: 0.3, roughness: 0.62, envMapIntensity: 0.8 }));                          // recesses — near black
    const gunmetal = M(new THREE.MeshStandardMaterial({ color: 0x3a3f46, metalness: 0.88, roughness: 0.44, roughnessMap: wear, envMapIntensity: 1.1 }));    // structural modules
    const titaniumFrame = M(new THREE.MeshStandardMaterial({ color: 0x777d86, metalness: 0.9, roughness: 0.4, roughnessMap: wear, envMapIntensity: 1.45 })); // FRAME — lightest
    const steel = M(new THREE.MeshStandardMaterial({ color: 0x9aa1aa, metalness: 1.0, roughness: 0.2, roughnessMap: wear, envMapIntensity: 1.7 }));          // polished accents
    const corridorMat = M(new THREE.MeshStandardMaterial({ color: 0x474d54, metalness: 0.62, roughness: 0.56, roughnessMap: wear, envMapIntensity: 1.05 })); // corridor — mid grey
    const floorMat = M(new THREE.MeshStandardMaterial({ color: 0x3c4149, metalness: 0.6, roughness: 0.32, roughnessMap: wear, envMapIntensity: 1.35 }));
    const ledMat = M(new THREE.MeshStandardMaterial({ color: 0x0a0d12, emissive: 0x3d9bff, emissiveIntensity: 2.4, roughness: 0.5 }));                        // small blue LEDs only
    const warnMat = M(new THREE.MeshStandardMaterial({ color: 0x241804, emissive: 0xff8a10, emissiveIntensity: 0.0, roughness: 0.5 }));
    const seamMat = M(new THREE.MeshStandardMaterial({ color: 0x0a0d12, emissive: 0x3d9bff, emissiveIntensity: 1.0, roughness: 0.45 }));

    const box = (w, h, d) => G(new THREE.BoxGeometry(w, h, d));
    const cyl = (r, l, s) => G(new THREE.CylinderGeometry(r, r, l, s || 24));
    const hex = (r, l) => G(new THREE.CylinderGeometry(r, r, l, 6));
    const mesh = (geo, mat, x, y, z, cast, rec) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (cast) m.castShadow = true; if (rec) m.receiveShadow = true; return m; };

    // ── Corridor — cool grey, LARGE + ASYMMETRIC (hand-placed, not grid) ──
    const HALF_W = 8.5, HALF_H = 5.5, LEN = 26;
    const corridor = new THREE.Group();
    corridor.add(mesh(box(HALF_W * 2, 0.5, LEN), floorMat, 0, -HALF_H, LEN / 2 - 1, false, true));
    corridor.add(mesh(box(HALF_W * 2, 0.5, LEN), corridorMat, 0, HALF_H, LEN / 2 - 1, false, true));
    corridor.add(mesh(box(0.5, HALF_H * 2, LEN), corridorMat, -HALF_W, 0, LEN / 2 - 1, false, true));
    corridor.add(mesh(box(0.5, HALF_H * 2, LEN), corridorMat, HALF_W, 0, LEN / 2 - 1, false, true));
    // A few LARGE structural ring-beams at irregular depths
    [3.4, 8.2, 14.5, 21].forEach((z, i) => {
      const d = 0.9 - i * 0.12;
      corridor.add(mesh(box(HALF_W * 2 + 0.3, 1.0, d), corridorMat, 0, HALF_H - 0.5, z, false, true));
      corridor.add(mesh(box(0.9, HALF_H * 2, d), corridorMat, -HALF_W + 0.45, 0, z, false, true));
      corridor.add(mesh(box(0.9, HALF_H * 2, d), corridorMat, HALF_W - 0.45, 0, z, false, true));
      // recessed warm ceiling light channel + soft shaft
      corridor.add(mesh(box(3.6, 0.16, 0.5), M(new THREE.MeshStandardMaterial({ color: 0x0c0d0f, emissive: 0xffe8c4, emissiveIntensity: 2.0, roughness: 0.6 })), (i % 2 ? 1.6 : -1.4), HALF_H - 0.7, z, false, false));
      shaft((i % 2 ? 1.6 : -1.4), HALF_H - 3.2, z, 6.5, 7.5, 0xfff1d8, 0.05);
    });
    // Large asymmetric maintenance panels (different walls / heights / sizes)
    corridor.add(mesh(box(0.16, 2.6, 3.2), gunmetal, -HALF_W + 0.06, 0.6, 6.5, false, true));
    corridor.add(mesh(box(0.16, 1.8, 2.2), gunmetal, HALF_W - 0.06, -1.2, 11, false, true));
    corridor.add(mesh(box(0.16, 3.2, 2.6), gunmetal, HALF_W - 0.06, 0.4, 3.2, false, true));
    // Blue floor LEDs (small, functional) down one side only
    [4, 9, 15].forEach((z) => corridor.add(mesh(box(0.5, 0.05, 0.14), ledMat, -HALF_W + 0.9, -HALF_H + 0.28, z, false, false)));
    scene.add(corridor);

    // ── Deep BUNKER frame (thick titanium wrap; door recessed inside) ──
    const DW = 5.6, DH = 9, DD = 1.5;
    const FD = 5.0; // frame depth — dramatic
    const portal = new THREE.Group();
    const fh = HALF_H, fw = HALF_W;
    portal.add(mesh(box(1.6, fh * 2, FD), titaniumFrame, -DW - 0.5, 0, -FD / 2 + 0.6, true, true));
    portal.add(mesh(box(1.6, fh * 2, FD), titaniumFrame, DW + 0.5, 0, -FD / 2 + 0.6, true, true));
    portal.add(mesh(box(fw * 2, 1.7, FD), titaniumFrame, 0, DH / 2 + 0.6, -FD / 2 + 0.6, true, true));
    portal.add(mesh(box(fw * 2, 1.7, FD), titaniumFrame, 0, -DH / 2 - 0.6, -FD / 2 + 0.6, true, true));
    // chamfered inner reveal (angled mouth) — lighter steel lip at the front
    [[-1, 0], [1, 0], [0, 1], [0, -1]].forEach((n) => {
      const horiz = n[0] !== 0;
      const m = mesh(box(horiz ? 0.7 : DW * 2 + 1.4, horiz ? DH + 1.4 : 0.7, 1.0), steel, n[0] * (DW + 0.2), n[1] * (DH / 2 + 0.35), 0.75, false, true);
      m.rotation[horiz ? 'y' : 'x'] = n[0] || n[1] ? (horiz ? -n[0] : n[1]) * 0.5 : 0; portal.add(m);
    });
    // amber warning beacons on the frame corners
    const warns = [];
    [[-DW - 0.5, DH / 2 - 0.3], [DW + 0.5, DH / 2 - 0.3], [-DW - 0.5, -DH / 2 + 0.3], [DW + 0.5, -DH / 2 + 0.3]].forEach((p) => { const w = mesh(box(0.35, 0.35, 0.3), warnMat, p[0], p[1], 1.1, false, false); portal.add(w); warns.push(w); });
    scene.add(portal);

    // ── Wall-cavity mechanism (large volume; revealed as doors part) ──
    const mech = new THREE.Group();
    [DH / 2 - 0.5, -(DH / 2 - 0.5)].forEach((yy) => mech.add(mesh(box(DW * 3.2, 0.35, 0.6), steel, 0, yy, -0.9, false, true)));   // big guide rails
    [-1, 1].forEach((s) => {
      const hyd = mesh(cyl(0.45, 3.0, 24), steel, s * (DW + 1.4), 0.4, -1.0, false, true); hyd.rotation.z = Math.PI / 2; mech.add(hyd); // hydraulic cylinder
      mech.add(mesh(box(1.3, 1.6, 1.1), gunmetal, s * (DW + 2.2), 0.4, -1.1, false, true));                                         // servo/motor block
      mech.add(mesh(cyl(0.32, 0.5, 20), steel, s * (DW - 0.6), DH / 2 - 0.5, -0.9, false, false));                                  // roller
      mech.add(mesh(cyl(0.32, 0.5, 20), steel, s * (DW - 0.6), -(DH / 2 - 0.5), -0.9, false, false));
      // service light inside cavity (warm)
      mech.add(mesh(box(0.14, 2.0, 0.14), M(new THREE.MeshStandardMaterial({ color: 0x0c0d0f, emissive: 0xffe4bc, emissiveIntensity: 1.8, roughness: 0.6 })), s * (DW + 0.9), 0, -0.7, false, false));
    });
    scene.add(mech);

    // ── Blast doors — BIG interlocking sections (asymmetric per side) ──
    const seamGlows = [], bolts = [], pins = [], lockDisks = [];
    function makeDoor(side) {
      const grp = new THREE.Group();
      const W = DW, H = DH, D = DD;
      grp.add(mesh(box(W, H, D), graphite, 0, 0, 0, true, true));                                   // slab
      // inner-side layered armor (2 big steps → readable thickness)
      grp.add(mesh(box(0.22, H * 0.88, D * 0.7), gunmetal, -side * (W / 2 - 0.11), 0, 0, true, true));
      grp.add(mesh(box(0.18, H * 0.7, D * 0.5), ceramic, -side * (W / 2 - 0.3), 0, 0, false, true));
      // big chamfered perimeter (wide steel border)
      grp.add(mesh(box(W - 0.2, 0.55, 0.22), steel, 0, H / 2 - 0.35, D / 2 + 0.02, false, true));
      grp.add(mesh(box(W - 0.2, 0.55, 0.22), steel, 0, -H / 2 + 0.35, D / 2 + 0.02, false, true));
      grp.add(mesh(box(0.55, H - 0.2, 0.22), steel, (W / 2 - 0.35), 0, D / 2 + 0.02, false, true));
      grp.add(mesh(box(0.55, H - 0.2, 0.22), steel, -(W / 2 - 0.35), 0, D / 2 + 0.02, false, true));
      // TWO large armor sections split by a diagonal cut (offset → interlocking)
      grp.add(mesh(box(W * 0.72, H * 0.44, 0.18), graphite, -side * 0.25, H * 0.2, D / 2 + 0.05, true, true));
      grp.add(mesh(box(W * 0.72, H * 0.44, 0.18), gunmetal, side * 0.25, -H * 0.2, D / 2 + 0.05, true, true));
      const diag = mesh(box(W * 1.05, 0.5, 0.26), steel, 0, 0, D / 2 + 0.09, true, false); diag.rotation.z = side * 0.42; grp.add(diag); // diagonal seam beam
      // deep recessed centre (pushed back)
      grp.add(mesh(box(W * 0.5, H * 0.34, 0.2), ceramic, -side * 0.2, H * 0.02, D / 2 - 0.06, false, true));
      // LARGE hexagonal mechanical region + circular locking hub (asymmetric vertical placement)
      const hy = side < 0 ? 1.7 : -1.7;
      const hexM = mesh(hex(1.15, 0.3), ceramic, -side * 0.2, hy, D / 2 + 0.12, true, true); hexM.rotation.x = Math.PI / 2; grp.add(hexM);
      const ring = mesh(cyl(1.0, 0.18, 32), steel, -side * 0.2, hy, D / 2 + 0.2, true, false); ring.rotation.x = Math.PI / 2; grp.add(ring);
      const hub = mesh(cyl(0.55, 0.3, 24), gunmetal, -side * 0.2, hy, D / 2 + 0.22, true, false); hub.rotation.x = Math.PI / 2; grp.add(hub);
      // MASSIVE locking assembly at the inner edge + its big circular lock disk
      grp.add(mesh(box(0.9, H * 0.5, 0.7), gunmetal, -side * (W / 2 - 0.5), -0.4, 0.28, true, true));
      const disk = mesh(cyl(0.5, 0.5, 24), steel, -side * (W / 2 - 0.35), -0.4, 0.34, true, false); disk.rotation.z = Math.PI / 2; grp.add(disk); lockDisks.push(disk);
      // small blue status LED on the module (functional light)
      grp.add(mesh(box(0.5, 0.08, 0.06), ledMat, -side * (W / 2 - 0.9), 1.9, D / 2 + 0.16, false, false));

      // subtle emissive seam + a small glow (NOT the focal point)
      grp.add(mesh(box(0.05, H * 0.9, 0.18), seamMat, -side * (W / 2 - 0.02), 0, D / 2 - 0.05, false, false));
      const sg = shaft(0, 0, 0, 0.9, 6, 0x6fb0ff, 0.28); sg._side = side; seamGlows.push(sg);

      // Locking bolts (top/bottom) + centre pins for the unlock sequence
      [H / 2 - 0.7, -(H / 2 - 0.7)].forEach((yy) => { const bo = mesh(cyl(0.22, 1.0, 16), steel, -side * (W / 2 - 0.25), yy, 0.3, true, false); bo.rotation.z = Math.PI / 2; bo.userData = { baseY: yy, dir: yy > 0 ? 1 : -1 }; grp.add(bo); bolts.push(bo); });
      for (let i = -1; i <= 1; i++) { const pin = mesh(cyl(0.16, 0.8, 16), steel, -side * (W / 2) - side * 0.3, i * 2.2, 0.24, true, false); pin.rotation.z = Math.PI / 2; pin.userData = { baseX: -side * (W / 2) - side * 0.3, side }; grp.add(pin); pins.push(pin); }

      grp.position.x = side * (0.05 + W / 2);
      scene.add(grp);
      return grp;
    }
    const leftDoor = makeDoor(-1), rightDoor = makeDoor(1);
    const LC = leftDoor.position.x, RC = rightDoor.position.x, LO = -22, RO = 22;

    // ── Light-shaft dust (a few faint motes ONLY under the ceiling channels) ──
    const motes = [];
    [3.4, 8.2, 14.5].forEach((z, i) => { const x = i % 2 ? 1.6 : -1.4; for (let k = 0; k < 4; k++) { const d = shaft(x + (Math.random() - 0.5) * 2.5, 1 + (Math.random() - 0.5) * 4, z + (Math.random() - 0.5) * 1.5, 0.14, 0.14, 0xfff0d8, 0.1 + Math.random() * 0.08); d._ph = Math.random() * 6.28; motes.push(d); } });

    // ── Lights (neutral + warm interior; only LEDs are coloured) ──
    scene.add(new THREE.HemisphereLight(0xb6c0cc, 0x2e3238, 1.25));
    scene.add(new THREE.AmbientLight(0x6a7078, 0.5));
    const key = new THREE.DirectionalLight(0xfff2e2, 2.6);
    key.position.set(7, 13, 14); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1; key.shadow.camera.far = 80;
    key.shadow.camera.left = -15; key.shadow.camera.right = 15; key.shadow.camera.top = 14; key.shadow.camera.bottom = -14;
    key.shadow.bias = -0.0004; key.shadow.radius = 4;
    scene.add(key); scene.add(key.target);
    const fill = new THREE.DirectionalLight(0xaeb8c4, 1.0); fill.position.set(-10, 5, 12); scene.add(fill);
    const ceilA = new THREE.PointLight(0xfff0d8, 90, 40, 2); ceilA.position.set(-1.4, 4.4, 8); scene.add(ceilA);
    const ceilB = new THREE.PointLight(0xfff0d8, 70, 36, 2); ceilB.position.set(1.6, 4.4, 3.4); scene.add(ceilB);
    const interior = new THREE.PointLight(0xffe6c4, 60, 30, 2); interior.position.set(0, 0, 3.2); scene.add(interior);   // warm white interior
    const warm = new THREE.PointLight(0xffd9a0, 0, 50, 2); warm.position.set(0, 0, -7); scene.add(warm);                 // hero light behind

    // ── Camera ──
    let baseCam = new THREE.Vector3(0, 1.9, 16);
    function resize() {
      const w = overlay.clientWidth || window.innerWidth, h = overlay.clientHeight || window.innerHeight;
      const aspect = w / h; camera.aspect = aspect; camera.fov = aspect < 1 ? 60 : 40;
      baseCam.z = aspect < 1 ? 23 : 16; camera.updateProjectionMatrix(); renderer.setSize(w, h, false);
    }
    resize(); window.addEventListener('resize', resize);

    // ── Render loop / staged timeline ──
    function frame(now) {
      if (disposed) return;
      raf = requestAnimationFrame(frame);
      if (!started) started = now;
      const t = now - started;

      let sx = Math.sin(t * 0.00033) * 0.16, sy = Math.sin(t * 0.0006) * 0.09;
      const dolly = clamp((t - UNLOCK) / (OPEN_AT + OPEN_DUR - UNLOCK), 0, 1) * 1.6;
      const shakeT = clamp(1 - (t - UNLOCK) / 340, 0, 1);
      let rumble = 0;
      if (t > PRESSURE && t < OPEN_AT) rumble = (t - PRESSURE) / (OPEN_AT - PRESSURE) * 0.05;
      else if (t > OPEN_AT) rumble = 0.05 * (1 - clamp((t - OPEN_AT) / OPEN_DUR, 0, 1));
      if (t > UNLOCK && shakeT > 0) { sx += (Math.random() - 0.5) * 0.14 * shakeT; sy += (Math.random() - 0.5) * 0.14 * shakeT; }
      sx += (Math.random() - 0.5) * rumble; sy += (Math.random() - 0.5) * rumble;
      camera.position.set(baseCam.x + sx, baseCam.y + sy, baseCam.z - dolly);
      camera.lookAt(0, 0.3, -3);

      if (t > WARN) { const bl = (Math.floor(t / 260) % 2) === 0 ? 3.0 : 0.4; for (let i = 0; i < warns.length; i++) warns[i].material.emissiveIntensity = bl; }

      // seam: subtle, small (door is the hero — do not over-glow)
      seamMat.emissiveIntensity = t < UNLOCK ? 0.9 + Math.sin(t * 0.006) * 0.3 : 1.8;
      for (let i = 0; i < seamGlows.length; i++) { const s = seamGlows[i]; const door = s._side < 0 ? leftDoor : rightDoor; s.position.set(door.position.x + s._side * -(DW / 2 - 0.05), 0, 0.7); s.material.opacity = t > UNLOCK ? 0.4 : 0.28; }
      // lock disks spin during unlock (rotating servos)
      if (t > UNLOCK) { const sp = clamp((t - UNLOCK) / (OPEN_AT - UNLOCK), 0, 1); for (let i = 0; i < lockDisks.length; i++) lockDisks[i].rotation.x = sp * 6.28 * 1.5; }

      if (t > UNLOCK) { const u = clamp((t - UNLOCK) / (PINS - UNLOCK), 0, 1); for (let i = 0; i < bolts.length; i++) bolts[i].position.y = bolts[i].userData.baseY + bolts[i].userData.dir * 0.6 * u; }
      if (t > PINS) { const p = clamp((t - PINS) / (PRESSURE - PINS), 0, 1); for (let i = 0; i < pins.length; i++) { pins[i].position.x = pins[i].userData.baseX + pins[i].userData.side * 0.5 * p; pins[i].scale.y = 1 - 0.5 * p; } }
      if (t > PRESSURE && t < OPEN_AT) { const b = Math.sin(t * 0.13) * 0.02; leftDoor.position.x = LC - b; rightDoor.position.x = RC + b; }

      if (t > OPEN_AT) {
        const op = clamp((t - OPEN_AT) / OPEN_DUR, 0, 1);
        const e = easeInOutQuart(op);
        const vib = op < 0.92 ? Math.sin(t * 0.08) * 0.012 * (1 - op) : 0;
        leftDoor.position.x = LC + (LO - LC) * e - vib;
        rightDoor.position.x = RC + (RO - RC) * e + vib;
        warm.intensity = op * 6;
        if (op >= 1 && !ended) { ended = true; finish(); }
      }

      for (let i = 0; i < motes.length; i++) { const d = motes[i]; d.position.y += Math.sin(t * 0.0005 + d._ph) * 0.05; d.position.x += Math.cos(t * 0.0004 + d._ph) * 0.03; }

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
