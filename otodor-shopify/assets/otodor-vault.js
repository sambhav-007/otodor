/* ═══════════════════════════════════════════════════════════════════════
   OTODOR Vault Intro — Three.js cinematic blast-door scene (r160, ESM)
   Lazy-loaded once per session by sections/otodor-vault-intro.liquid.

   A real 3D scene: two thick beveled titanium door volumes inside a portal
   frame, PBR materials + procedural env-map reflections, a key light with
   real shadows, blue rim + warm interior lights, a perspective camera that
   breathes, retracting locking pistons, and a heavy easeInOutQuart slide that
   reveals the hero through the widening (transparent) gap.

   Transparent renderer → the DOM hero behind the canvas shows through the gap.
   Fully self-disposing. Any failure calls onDone() so the hero shows instantly.
   ═══════════════════════════════════════════════════════════════════════ */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const UNLOCK = 850;        // ms — locks disengage / seams ignite
const OPEN_AT = 1750;      // ms — doors begin to part
const OPEN_DUR = 2100;     // ms — slide duration (heavy)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeInOutQuart = (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2);

export default function initVault(overlay, opts) {
  opts = opts || {};
  const onDone = opts.onDone || function () {};
  const onReady = opts.onReady || function () {};
  const canvas = overlay.querySelector('[data-vault-canvas]');
  if (!canvas) { onDone(); return; }

  let renderer, scene, camera, pmrem, envTex, raf = 0;
  let disposed = false, ended = false, started = 0;
  const disposables = [];
  const track = (o) => { disposables.push(o); return o; };

  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (e) { onDone(); return; }

  try {
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(32, 1, 0.1, 120);

    // ── Procedural environment (reflections without external assets) ──
    const envCanvas = document.createElement('canvas');
    envCanvas.width = 512; envCanvas.height = 256;
    const g = envCanvas.getContext('2d');
    const grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0.0, '#070a0f');
    grd.addColorStop(0.42, '#141c26');
    grd.addColorStop(0.5, '#26384c');
    grd.addColorStop(0.58, '#131a23');
    grd.addColorStop(1.0, '#040506');
    g.fillStyle = grd; g.fillRect(0, 0, 512, 256);
    g.fillStyle = 'rgba(190,220,255,0.55)'; g.fillRect(0, 54, 512, 5); g.fillRect(0, 84, 512, 2);
    g.fillStyle = 'rgba(120,170,230,0.35)'; g.fillRect(0, 120, 512, 3);
    g.fillStyle = 'rgba(255,190,120,0.22)'; g.fillRect(0, 205, 512, 9);
    const envSrc = track(new THREE.CanvasTexture(envCanvas));
    envSrc.mapping = THREE.EquirectangularReflectionMapping;
    envSrc.colorSpace = THREE.SRGBColorSpace;
    pmrem = new THREE.PMREMGenerator(renderer);
    envTex = pmrem.fromEquirectangular(envSrc).texture;
    scene.environment = envTex;

    // ── Materials ──
    const titanium = track(new THREE.MeshStandardMaterial({ color: 0x24282d, metalness: 0.96, roughness: 0.36, envMapIntensity: 1.15 }));
    const plateMat = track(new THREE.MeshStandardMaterial({ color: 0x11151a, metalness: 0.88, roughness: 0.52, envMapIntensity: 0.9 }));
    const armorMat = track(new THREE.MeshStandardMaterial({ color: 0x1b1f24, metalness: 0.92, roughness: 0.44, envMapIntensity: 1.0 }));
    const frameMat = track(new THREE.MeshStandardMaterial({ color: 0x0f1216, metalness: 0.9, roughness: 0.5, envMapIntensity: 0.85 }));
    const pistonMat = track(new THREE.MeshStandardMaterial({ color: 0x454b52, metalness: 1.0, roughness: 0.26, envMapIntensity: 1.2 }));
    const boltMat = track(new THREE.MeshStandardMaterial({ color: 0x2a2e33, metalness: 1.0, roughness: 0.3 }));
    const floorMat = track(new THREE.MeshStandardMaterial({ color: 0x090b0e, metalness: 0.45, roughness: 0.6, envMapIntensity: 0.6 }));

    const boxes = [];
    const box = (w, h, d) => { const gm = new THREE.BoxGeometry(w, h, d); boxes.push(gm); return gm; };
    const cyl = (r, len, seg) => { const gm = new THREE.CylinderGeometry(r, r, len, seg || 18); boxes.push(gm); return gm; };

    // ── Floor (grounding + reflection + contact shadow) ──
    const floor = new THREE.Mesh(track(new THREE.PlaneGeometry(60, 60)), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.position.y = -3.25; floor.receiveShadow = true;
    scene.add(floor);

    // ── Portal frame (static — implies a massive facility opening) ──
    const frameGroup = new THREE.Group();
    const addFrameBar = (x, y, w, h, d) => {
      const m = new THREE.Mesh(box(w, h, d), frameMat);
      m.position.set(x, y, d ? 0 : 0); m.castShadow = true; m.receiveShadow = true;
      frameGroup.add(m);
    };
    addFrameBar(-3.55, 0, 0.9, 7.6, 1.7);
    addFrameBar(3.55, 0, 0.9, 7.6, 1.7);
    addFrameBar(0, 3.55, 7.9, 0.9, 1.7);
    addFrameBar(0, -3.55, 7.9, 0.9, 1.7);
    scene.add(frameGroup);

    // ── Door builder ──
    const pistons = [];
    const seamMats = [];
    function makeDoor(side) {  // side = -1 (left) or +1 (right)
      const grp = new THREE.Group();
      const W = 3.0, H = 6.0, D = 1.25;

      const body = new THREE.Mesh(box(W, H, D), titanium);
      body.castShadow = true; body.receiveShadow = true;
      grp.add(body);

      // Raised armor layer + recessed plates on the front face
      const armor = new THREE.Mesh(box(W * 0.86, H * 0.9, 0.12), armorMat);
      armor.position.z = D / 2 + 0.02; armor.castShadow = true; armor.receiveShadow = true;
      grp.add(armor);
      for (let r = 0; r < 3; r++) {
        const plate = new THREE.Mesh(box(W * 0.62, 1.35, 0.06), plateMat);
        plate.position.set(-side * 0.18, 1.7 - r * 1.7, D / 2 - 0.02);
        plate.receiveShadow = true;
        grp.add(plate);
      }
      // Hex bolts down the outer edge
      for (let b = -2; b <= 2; b++) {
        const bolt = new THREE.Mesh(cyl(0.09, 0.14, 6), boltMat);
        bolt.rotation.x = Math.PI / 2;
        bolt.position.set(side * (W / 2 - 0.28), b * 1.25, D / 2 + 0.04);
        grp.add(bolt);
      }

      // Emissive seam strip on the inner edge (glows at unlock)
      const seamMat = new THREE.MeshStandardMaterial({ color: 0x0a0d12, emissive: 0x4da6ff, emissiveIntensity: 1.6, metalness: 0.3, roughness: 0.4 });
      seamMats.push(seamMat); track(seamMat);
      const seam = new THREE.Mesh(box(0.05, H * 0.94, 0.16), seamMat);
      seam.position.set(-side * (W / 2 - 0.02), 0, D / 2 - 0.04);
      grp.add(seam);

      // Locking pistons crossing the inner face (retract before opening)
      for (let i = -2; i <= 2; i++) {
        const pis = new THREE.Mesh(cyl(0.13, 0.55, 20), pistonMat);
        pis.rotation.z = Math.PI / 2;
        pis.castShadow = true;
        const baseX = -side * (W / 2) - side * 0.24;
        pis.position.set(baseX, i * 1.12, 0.12);
        pis.userData = { baseX, side };
        grp.add(pis); pistons.push(pis);
        // servo housing behind each piston
        const hub = new THREE.Mesh(box(0.4, 0.4, 0.5), boltMat);
        hub.position.set(-side * (W / 2 - 0.2), i * 1.12, -0.1);
        grp.add(hub);
      }

      grp.position.x = side * (0.05 + W / 2);
      scene.add(grp);
      return grp;
    }
    const leftDoor = makeDoor(-1);
    const rightDoor = makeDoor(1);
    const LEFT_CLOSED = leftDoor.position.x, RIGHT_CLOSED = rightDoor.position.x;
    const LEFT_OPEN = -9.5, RIGHT_OPEN = 9.5;

    // ── Lights ──
    scene.add(new THREE.HemisphereLight(0x2a3a4d, 0x070809, 0.55));
    const key = new THREE.DirectionalLight(0xcfe4ff, 2.3);
    key.position.set(5.5, 9, 7.5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.near = 1; key.shadow.camera.far = 45;
    key.shadow.camera.left = -9; key.shadow.camera.right = 9;
    key.shadow.camera.top = 9; key.shadow.camera.bottom = -9;
    key.shadow.bias = -0.0004; key.shadow.radius = 3;
    scene.add(key); scene.add(key.target);

    const rimL = new THREE.PointLight(0x4da6ff, 6, 10, 2); rimL.position.set(-0.6, 0.5, 2.2); scene.add(rimL);
    const rimR = new THREE.PointLight(0x4da6ff, 6, 10, 2); rimR.position.set(0.6, -0.5, 2.2); scene.add(rimR);
    const warm = new THREE.PointLight(0xffb060, 0, 22, 2); warm.position.set(0, 0, -4.5); scene.add(warm);

    // ── Camera + sizing (aspect-aware so it fits phones too) ──
    function resize() {
      const w = overlay.clientWidth || window.innerWidth;
      const h = overlay.clientHeight || window.innerHeight;
      const aspect = w / h;
      camera.aspect = aspect;
      camera.fov = aspect < 1 ? 50 : 31;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    resize();
    window.addEventListener('resize', resize);

    // ── Render loop / timeline ──
    function frame(now) {
      if (disposed) return;
      raf = requestAnimationFrame(frame);
      if (!started) { started = now; }
      const t = now - started;

      // Camera breathing + subtle push-in as it opens
      const push = clamp((t - OPEN_AT) / OPEN_DUR, 0, 1);
      camera.position.set(
        Math.sin(t * 0.00035) * 0.18,
        0.85 + Math.sin(t * 0.00055) * 0.09,
        9.2 - push * 0.7
      );
      camera.lookAt(0, 0.05, -0.5);

      // Seam pulse → ignite
      const si = t < UNLOCK ? 1.5 + Math.sin(t * 0.006) * 0.6 : 4.2;
      for (let i = 0; i < seamMats.length; i++) seamMats[i].emissiveIntensity = si;

      // Pistons retract between unlock and open
      if (t > UNLOCK) {
        const pr = clamp((t - UNLOCK) / (OPEN_AT - UNLOCK), 0, 1);
        for (let i = 0; i < pistons.length; i++) {
          const p = pistons[i];
          p.position.x = p.userData.baseX + p.userData.side * 0.32 * pr;
          p.scale.setScalar(1 - 0.35 * pr);
        }
      }

      // Doors part (heavy easing) + rail micro-vibration
      if (t > OPEN_AT) {
        const op = clamp((t - OPEN_AT) / OPEN_DUR, 0, 1);
        const e = easeInOutQuart(op);
        const vib = op < 0.96 ? Math.sin(t * 0.09) * 0.006 : 0;
        leftDoor.position.x = LEFT_CLOSED + (LEFT_OPEN - LEFT_CLOSED) * e - vib;
        rightDoor.position.x = RIGHT_CLOSED + (RIGHT_OPEN - RIGHT_CLOSED) * e + vib;
        warm.intensity = op * 4;
        rimL.intensity = 6 + op * 2; rimR.intensity = 6 + op * 2;
        if (op >= 1 && !ended) { ended = true; finish(); }
      }

      renderer.render(scene, camera);

      if (t > 40 && onReady._pending) { onReady._pending = false; onReady(); }
    }
    onReady._pending = true;
    raf = requestAnimationFrame(frame);

    function finish() {
      if (opts.onEnd) opts.onEnd();          // section fades the overlay
      window.setTimeout(function () { cleanup(); onDone(); }, 650);
    }

    function cleanup() {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      for (let i = 0; i < boxes.length; i++) boxes[i].dispose();
      for (let i = 0; i < disposables.length; i++) { try { disposables[i].dispose(); } catch (e) {} }
      try { envTex.dispose(); } catch (e) {}
      try { pmrem.dispose(); } catch (e) {}
      try { renderer.dispose(); } catch (e) {}
    }

    // Expose an emergency cleanup for the safety timeout in the section.
    overlay._vaultCleanup = function () { cleanup(); };
  } catch (err) {
    try { renderer && renderer.dispose(); } catch (e) {}
    onDone();
  }
}
