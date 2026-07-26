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

  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' }); }
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
    camera = new THREE.PerspectiveCamera(38, 1, 0.1, 260);

    // ── Soft neutral softbox env (satin reflections, no colour cast) ──
    const ec = document.createElement('canvas'); ec.width = 512; ec.height = 256;
    const g2 = ec.getContext('2d');
    const grd = g2.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0.0, '#3a3f45'); grd.addColorStop(0.4, '#6c737c');
    grd.addColorStop(0.5, '#8a929c'); grd.addColorStop(0.62, '#5c626b'); grd.addColorStop(1.0, '#232629');
    g2.fillStyle = grd; g2.fillRect(0, 0, 512, 256);
    g2.fillStyle = 'rgba(248,250,253,0.92)'; g2.fillRect(0, 54, 512, 34);   // soft overhead softbox (main reflection)
    g2.fillStyle = 'rgba(210,218,228,0.5)'; g2.fillRect(0, 150, 512, 20);   // subtle lower bounce
    const envSrc = T(new THREE.CanvasTexture(ec));
    envSrc.mapping = THREE.EquirectangularReflectionMapping; envSrc.colorSpace = THREE.SRGBColorSpace;
    pmrem = new THREE.PMREMGenerator(renderer);
    envTex = pmrem.fromEquirectangular(envSrc).texture;
    scene.environment = envTex;

    // ── Very subtle brushed grain (anisotropic-ish) ──
    const nc = document.createElement('canvas'); nc.width = 256; nc.height = 256;
    const nx = nc.getContext('2d'); nx.fillStyle = '#808080'; nx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 130; i++) { const y = Math.random() * 256; nx.strokeStyle = 'rgba(255,255,255,' + (Math.random() * 0.06) + ')'; nx.beginPath(); nx.moveTo(0, y); nx.lineTo(256, y); nx.stroke(); }
    const brush = T(new THREE.CanvasTexture(nc)); brush.wrapS = brush.wrapT = THREE.RepeatWrapping; brush.repeat.set(1, 3);

    // ── Soft additive sprite (light leak only) ──
    const gc = document.createElement('canvas'); gc.width = gc.height = 128;
    const gg = gc.getContext('2d');
    const gr = gg.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,0.95)'); gr.addColorStop(0.5, 'rgba(230,240,255,0.35)'); gr.addColorStop(1, 'rgba(230,240,255,0)');
    gg.fillStyle = gr; gg.fillRect(0, 0, 128, 128);
    const softTex = T(new THREE.CanvasTexture(gc));
    const soft = (x, y, z, w, h, color, op) => { const mat = M(new THREE.SpriteMaterial({ map: softTex, color: color, blending: THREE.AdditiveBlending, transparent: true, opacity: op, depthWrite: false })); const sp = new THREE.Sprite(mat); sp.position.set(x, y, z); sp.scale.set(w, h, 1); scene.add(sp); return sp; };

    // ── Materials — brushed titanium / satin ceramic / anodized (soft) ──
    const slabMat = M(new THREE.MeshStandardMaterial({ color: 0x565c64, metalness: 0.72, roughness: 0.46, roughnessMap: brush, envMapIntensity: 1.9 }));   // brushed-titanium satin slabs
    const bevelMat = M(new THREE.MeshStandardMaterial({ color: 0x676d75, metalness: 0.95, roughness: 0.3, envMapIntensity: 1.7 }));                          // micro-bevel
    const lineMat = M(new THREE.MeshStandardMaterial({ color: 0x141517, metalness: 0.4, roughness: 0.7 }));                                                  // hairline groove (near-black)
    const wallMat = M(new THREE.MeshStandardMaterial({ color: 0x494e55, metalness: 0.6, roughness: 0.5, roughnessMap: brush, envMapIntensity: 1.1 }));       // architecture
    const floorMat = M(new THREE.MeshStandardMaterial({ color: 0x3a3e44, metalness: 0.55, roughness: 0.28, roughnessMap: brush, envMapIntensity: 1.5 }));    // satin floor (soft reflection)
    const seamMat = M(new THREE.MeshStandardMaterial({ color: 0x0a0d12, emissive: 0x5aa0ff, emissiveIntensity: 0.0, roughness: 0.4 }));
    const ledBlue = M(new THREE.MeshStandardMaterial({ color: 0x0a0d12, emissive: 0x3d9bff, emissiveIntensity: 2.0, roughness: 0.5 }));
    const ledAmber = M(new THREE.MeshStandardMaterial({ color: 0x241804, emissive: 0xffab30, emissiveIntensity: 2.2, roughness: 0.5 }));
    const ceilLine = M(new THREE.MeshStandardMaterial({ color: 0x0c0d0f, emissive: 0xfff4e6, emissiveIntensity: 1.8, roughness: 0.6 }));

    const box = (w, h, d) => G(new THREE.BoxGeometry(w, h, d));
    const mesh = (geo, mat, x, y, z, cast, rec) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (cast) m.castShadow = true; if (rec) m.receiveShadow = true; return m; };

    // ── Minimal chamber (large uninterrupted surfaces) ──
    const HALF_W = 10, HALF_H = 6, LEN = 28;
    const room = new THREE.Group();
    room.add(mesh(box(HALF_W * 2, 0.5, LEN), floorMat, 0, -HALF_H, LEN / 2 - 1.5, false, true));            // floor
    room.add(mesh(box(HALF_W * 2, 0.5, LEN), wallMat, 0, HALF_H, LEN / 2 - 1.5, false, true));              // ceiling
    room.add(mesh(box(0.5, HALF_H * 2, LEN), wallMat, -HALF_W, 0, LEN / 2 - 1.5, false, true));             // L wall
    room.add(mesh(box(0.5, HALF_H * 2, LEN), wallMat, HALF_W, 0, LEN / 2 - 1.5, false, true));              // R wall
    // two thin recessed ceiling light lines (the only practical lights you see)
    room.add(mesh(box(0.18, 0.06, LEN * 0.7), ceilLine, -2.6, HALF_H - 0.28, LEN / 2 - 1.5, false, false));
    room.add(mesh(box(0.18, 0.06, LEN * 0.7), ceilLine, 2.6, HALF_H - 0.28, LEN / 2 - 1.5, false, false));
    scene.add(room);

    // ── Vault opening carved into the far wall (integrated frame) ──
    const DW = 5.4, DH = 9, DD = 0.7;      // slab half-width, height, thickness
    const OW = DW * 2, OH = DH;            // opening
    const wall = new THREE.Group();
    // the far wall = large flush panels around the opening (carved, not a separate frame)
    const sideW = (HALF_W - OW / 2);
    wall.add(mesh(box(sideW, HALF_H * 2, 1.4), wallMat, -(OW / 2 + sideW / 2), 0, 0, false, true));         // left of opening
    wall.add(mesh(box(sideW, HALF_H * 2, 1.4), wallMat, (OW / 2 + sideW / 2), 0, 0, false, true));          // right of opening
    const topH = (HALF_H - OH / 2);
    wall.add(mesh(box(OW, topH, 1.4), wallMat, 0, (OH / 2 + topH / 2), 0, false, true));                    // lintel
    wall.add(mesh(box(OW, topH, 1.4), wallMat, 0, -(OH / 2 + topH / 2), 0, false, true));                   // sill
    // micro-bevel reveal lip around the opening (thin, lighter)
    wall.add(mesh(box(0.12, OH + 0.24, 0.5), bevelMat, -(OW / 2 + 0.06), 0, 0.45, false, false));
    wall.add(mesh(box(0.12, OH + 0.24, 0.5), bevelMat, (OW / 2 + 0.06), 0, 0.45, false, false));
    wall.add(mesh(box(OW + 0.24, 0.12, 0.5), bevelMat, 0, (OH / 2 + 0.06), 0.45, false, false));
    wall.add(mesh(box(OW + 0.24, 0.12, 0.5), bevelMat, 0, -(OH / 2 + 0.06), 0.45, false, false));
    scene.add(wall);

    // ── Hidden guide rails (barely-there) + soft internal light leak ──
    [OH / 2 - 0.25, -(OH / 2 - 0.25)].forEach((yy) => scene.add(mesh(box(OW * 1.4, 0.1, 0.16), bevelMat, 0, yy, -0.5, false, false)));
    const leak = soft(0, 0.2, -0.4, 2.2, OH * 0.95, 0xdfeaff, 0.0);   // grows as slabs part

    // ── Two monolithic slabs (near-featureless, precise gaps) ──
    const seamGlows = [];
    function makeSlab(side) {
      const grp = new THREE.Group();
      const W = DW, H = DH, D = DD;
      grp.add(mesh(box(W, H, D), slabMat, 0, 0, 0, true, true));                                   // the slab
      // micro-bevelled perimeter — a raised face plate leaving a hairline gap
      grp.add(mesh(box(W - 0.16, H - 0.16, 0.05), slabMat, -side * 0.03, 0, D / 2 + 0.02, false, true));
      grp.add(mesh(box(W - 0.06, H - 0.06, 0.02), bevelMat, 0, 0, D / 2 + 0.005, false, false));   // thin bevel rim
      // two precise horizontal panel lines (hairline recessed grooves)
      grp.add(mesh(box(W - 0.5, 0.03, 0.02), lineMat, -side * 0.03, H * 0.22, D / 2 + 0.045, false, false));
      grp.add(mesh(box(W - 0.5, 0.03, 0.02), lineMat, -side * 0.03, -H * 0.22, D / 2 + 0.045, false, false));
      // tiny functional indicators (one blue, one amber) — minimal
      grp.add(mesh(box(0.35, 0.05, 0.03), ledBlue, -side * (W / 2 - 0.9), H / 2 - 0.9, D / 2 + 0.05, false, false));
      grp.add(mesh(box(0.06, 0.06, 0.03), ledAmber, -side * (W / 2 - 0.9), -H / 2 + 0.9, D / 2 + 0.05, false, false));
      // thin illuminated seam on the inner edge
      grp.add(mesh(box(0.03, H - 0.4, 0.06), seamMat, -side * (W / 2 - 0.02), 0, D / 2 - 0.02, false, false));
      const sg = soft(0, 0, 0, 0.5, H - 0.5, 0x8ec2ff, 0.0); sg._side = side; seamGlows.push(sg);
      grp.position.x = side * (0.03 + W / 2);
      scene.add(grp);
      return grp;
    }
    const leftSlab = makeSlab(-1), rightSlab = makeSlab(1);
    const LC = leftSlab.position.x, RC = rightSlab.position.x, LO = -DW * 2 - HALF_W, RO = DW * 2 + HALF_W;

    // ── Lights — soft & even (env + directional; NO point-light hotspots) ──
    scene.add(new THREE.HemisphereLight(0xccd4dc, 0x35393f, 1.9));
    scene.add(new THREE.AmbientLight(0x7c828a, 0.75));
    const key = new THREE.DirectionalLight(0xfff6ec, 1.7);
    key.position.set(5, 13, 16); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1; key.shadow.camera.far = 80;
    key.shadow.camera.left = -14; key.shadow.camera.right = 14; key.shadow.camera.top = 13; key.shadow.camera.bottom = -13;
    key.shadow.bias = -0.0004; key.shadow.radius = 6;
    scene.add(key); scene.add(key.target);
    const fill = new THREE.DirectionalLight(0xc0c8d2, 1.1); fill.position.set(-8, 3, 13); scene.add(fill);
    const back = new THREE.DirectionalLight(0xaeb6c2, 0.5); back.position.set(0, 6, -10); scene.add(back);   // gentle rim
    const warm = new THREE.PointLight(0xffe6c2, 0, 46, 2); warm.position.set(0, 0, -6); scene.add(warm);     // reveal light only (behind slabs)

    // ── Camera ──
    let baseCam = new THREE.Vector3(0, 1.4, 16.5);
    function resize() {
      const w = overlay.clientWidth || window.innerWidth, h = overlay.clientHeight || window.innerHeight;
      const aspect = w / h; camera.aspect = aspect; camera.fov = aspect < 1 ? 58 : 38;
      baseCam.z = aspect < 1 ? 24 : 16.5; camera.updateProjectionMatrix(); renderer.setSize(w, h, false);
    }
    resize(); window.addEventListener('resize', resize);

    // ── Render loop — calm, effortless (no shake/rumble/vibration) ──
    function frame(now) {
      if (disposed) return;
      raf = requestAnimationFrame(frame);
      if (!started) started = now;
      const t = now - started;

      // gentle breathing + very slow dolly
      const sx = Math.sin(t * 0.0003) * 0.1, sy = Math.sin(t * 0.00052) * 0.06;
      const dolly = clamp((t - OPEN_AT) / OPEN_DUR, 0, 1) * 1.1;
      camera.position.set(baseCam.x + sx, baseCam.y + sy, baseCam.z - dolly);
      camera.lookAt(0, 0.2, -2);

      // seam ignites softly at unlock (the one moment of light)
      const seamI = t < UNLOCK ? 0.0 : clamp((t - UNLOCK) / 500, 0, 1) * 2.2;
      seamMat.emissiveIntensity = seamI;
      for (let i = 0; i < seamGlows.length; i++) { const s = seamGlows[i]; const slab = s._side < 0 ? leftSlab : rightSlab; s.position.set(slab.position.x + s._side * -(DW / 2 - 0.02), 0, 0.35); s.material.opacity = 0.22 * clamp((t - UNLOCK) / 500, 0, 1); }

      // effortless glide
      if (t > OPEN_AT) {
        const op = clamp((t - OPEN_AT) / OPEN_DUR, 0, 1);
        const e = easeInOutQuart(op);
        leftSlab.position.x = LC + (LO - LC) * e;
        rightSlab.position.x = RC + (RO - RC) * e;
        leak.material.opacity = Math.sin(op * Math.PI) * 0.5;   // light leak swells then fades
        leak.scale.x = 2.2 + op * 8;
        warm.intensity = op * 4;
        if (op >= 1 && !ended) { ended = true; finish(); }
      }

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
