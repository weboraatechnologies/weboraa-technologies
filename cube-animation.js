/**
 * WEBORAA TECHNOLOGIES — 3D Cube Transformation Animation Engine
 * Animates cubes traveling along an architectural curved trajectory from
 * "YOUR IDEA" into "YOUR DIGITAL SOLUTION", synced with a 5-step interactive process track.
 */

(function () {
  'use strict';

  // Config
  const ANIM_DURATION = 12000; // 12s full cycle
  let activeStep = 1;
  let cycleStartTime = performance.now();
  let userOverrideTime = null;
  let isHovered = false;

  // DOM Elements
  const stage = document.getElementById('hero3dStage');
  const canvas = document.getElementById('cubeCanvas');
  const stripCards = document.querySelectorAll('.process-strip-card');

  if (!stage || !canvas) return;

  // Detect Three.js
  const hasThree = typeof THREE !== 'undefined';

  if (hasThree) {
    initThreeScene();
  } else {
    initCanvasFallback();
  }

  initStepInteractions();

  // --------------------------------------------------------------------------
  // 1. Three.js Real-Time 3D Engine
  // --------------------------------------------------------------------------
  function initThreeScene() {
    let width = stage.clientWidth || 500;
    let height = stage.clientHeight || 360;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 9.8);
    camera.lookAt(0, 0.1, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.95);
    dirLight.position.set(6, 10, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 25;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    // Soft Blue Fill Light
    const fillLight = new THREE.DirectionalLight(0x2563EB, 0.45);
    fillLight.position.set(-6, -2, 4);
    scene.add(fillLight);

    // Floor Shadow Receiver
    const floorGeo = new THREE.PlaneGeometry(25, 25);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.12 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.1;
    floor.receiveShadow = true;
    scene.add(floor);

    // Materials
    const blueMat = new THREE.MeshStandardMaterial({
      color: 0x1E60F2,
      roughness: 0.18,
      metalness: 0.08
    });

    const lightBlueMat = new THREE.MeshStandardMaterial({
      color: 0x3B82F6,
      roughness: 0.22,
      metalness: 0.05
    });

    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xF8FAFC,
      roughness: 0.25,
      metalness: 0.02
    });

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x2563EB,
      transparent: true,
      opacity: 0.75
    });

    // Spline Curve (Traversing bottom-left to top-right)
    const curvePoints = [
      new THREE.Vector3(-4.0, -1.6, 0.0),
      new THREE.Vector3(-2.6, -1.0, 0.4),
      new THREE.Vector3(-1.0, -0.1, 0.7),
      new THREE.Vector3(0.8, 0.7, 0.3),
      new THREE.Vector3(2.4, 0.9, -0.1),
      new THREE.Vector3(3.5, 0.5, 0.0)
    ];

    const spline = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeo = new THREE.TubeGeometry(spline, 70, 0.022, 8, false);
    const tubeMesh = new THREE.Mesh(tubeGeo, wireMat);
    scene.add(tubeMesh);

    // Glowing Trail Particles along Spline
    const particleCount = 20;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleMat = new THREE.PointsMaterial({
      color: 0x60A5FA,
      size: 0.12,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 1. Origin: "YOUR IDEA" Single White Cube
    const ideaCubeGeo = new THREE.BoxGeometry(0.85, 0.85, 0.85);
    const ideaCube = new THREE.Mesh(ideaCubeGeo, whiteMat);
    ideaCube.position.copy(curvePoints[0]);
    ideaCube.rotation.set(0.12, 0.35, 0.08);
    ideaCube.castShadow = true;
    ideaCube.receiveShadow = true;
    scene.add(ideaCube);

    // 2. Destination: "YOUR DIGITAL SOLUTION" 2x2x2 Assembled Composite
    const clusterGroup = new THREE.Group();
    clusterGroup.position.copy(curvePoints[curvePoints.length - 1]);
    scene.add(clusterGroup);

    const subSize = 0.55;
    const gap = 0.04;
    const offset = (subSize + gap) / 2;
    const clusterCubes = [];

    // Colors matching user mockup: alternating blue and white blocks
    const pattern = [
      // Bottom layer [z=0: back, z=1: front]
      [true, false], // [x=0, y=0], [x=1, y=0]
      [false, true],
      // Top layer
      [false, true],
      [true, false]
    ];

    let blockIdx = 0;
    for (let y = 0; y < 2; y++) {
      for (let z = 0; z < 2; z++) {
        for (let x = 0; x < 2; x++) {
          const isBlue = (x + y + z) % 2 === 0;
          const cube = new THREE.Mesh(
            new THREE.BoxGeometry(subSize, subSize, subSize),
            isBlue ? (y === 1 && x === 1 ? lightBlueMat : blueMat) : whiteMat
          );
          cube.position.set(
            (x === 0 ? -offset : offset),
            (y === 0 ? -offset : offset),
            (z === 0 ? -offset : offset)
          );
          cube.castShadow = true;
          cube.receiveShadow = true;
          cube.userData = {
            basePos: cube.position.clone(),
            origScale: 1
          };
          clusterGroup.add(cube);
          clusterCubes.push(cube);
          blockIdx++;
        }
      }
    }
    clusterGroup.rotation.set(0.18, -0.42, 0.05);

    // 3. Traveling Cubes along the Curve
    const travelingCount = 4;
    const travelingCubes = [];

    for (let i = 0; i < travelingCount; i++) {
      const isBlue = i % 2 === 1;
      const tCube = new THREE.Mesh(
        new THREE.BoxGeometry(0.68, 0.68, 0.68),
        isBlue ? blueMat : whiteMat
      );
      tCube.castShadow = true;
      tCube.receiveShadow = true;
      scene.add(tCube);
      travelingCubes.push({
        mesh: tCube,
        offset: i / travelingCount,
        rotSpeedX: 1.5 + (i * 0.4),
        rotSpeedY: 2.0 + (i * 0.3),
        rotSpeedZ: 1.2 + (i * 0.2)
      });
    }

    // Mouse Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;

    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 0.28;
      targetRotX = y * 0.18;
    });

    stage.addEventListener('mouseleave', () => {
      targetRotY = 0;
      targetRotX = 0;
    });

    // Responsive Resize Handler
    function handleResize() {
      if (!stage || !renderer || !camera) return;
      width = stage.clientWidth;
      height = stage.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', handleResize, { passive: true });

    // Animation Loop
    let lastTime = performance.now();

    function animate(now) {
      requestAnimationFrame(animate);

      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Cycle progress
      let elapsed = now - cycleStartTime;
      let progress = (elapsed % ANIM_DURATION) / ANIM_DURATION;

      if (userOverrideTime !== null) {
        progress = userOverrideTime;
      }

      // Update Active Step Badge
      const currentStep = Math.min(5, Math.floor(progress * 5) + 1);
      if (currentStep !== activeStep) {
        setActiveStep(currentStep);
      }

      // Smooth Camera Parallax
      camera.position.x += (targetRotY * 4.0 - camera.position.x) * 0.05;
      camera.position.y += ((1.8 - targetRotX * 3.0) - camera.position.y) * 0.05;
      camera.lookAt(0, 0.1, 0);

      // Idea Cube Subtle Breath
      ideaCube.position.y = curvePoints[0].y + Math.sin(now * 0.0025) * 0.04;
      ideaCube.rotation.y = 0.35 + Math.sin(now * 0.0018) * 0.08;

      // Cluster Breathing / Docking Reaction
      const clusterPulse = 1 + Math.sin(now * 0.003) * 0.025;
      clusterGroup.scale.set(clusterPulse, clusterPulse, clusterPulse);
      clusterGroup.rotation.y = -0.42 + Math.sin(now * 0.0012) * 0.05;

      // Animate Traveling Cubes along Spline
      travelingCubes.forEach((item, idx) => {
        let t = (progress + item.offset) % 1.0;

        // Position on Spline
        const pos = spline.getPointAt(t);
        item.mesh.position.copy(pos);

        // Smooth tumbling rotation
        item.mesh.rotation.x = t * Math.PI * 4 + (now * 0.001 * item.rotSpeedX);
        item.mesh.rotation.y = t * Math.PI * 3 + (now * 0.001 * item.rotSpeedY);
        item.mesh.rotation.z = t * Math.PI * 2 + (now * 0.001 * item.rotSpeedZ);

        // Scale easing near ends: emerge smoothly from idea, merge into cluster
        let scale = 1.0;
        if (t < 0.08) {
          scale = t / 0.08;
        } else if (t > 0.92) {
          scale = (1.0 - t) / 0.08;
        }
        item.mesh.scale.set(scale, scale, scale);
      });

      // Animate Glowing Particles along Curve
      const posAttr = particleGeo.attributes.position;
      const positions = particlePositions;
      for (let p = 0; p < particleCount; p++) {
        let pt = ((progress * 1.5) + (p / particleCount)) % 1.0;
        let pPos = spline.getPointAt(pt);
        // Add subtle radial displacement
        positions[p * 3] = pPos.x + Math.sin(now * 0.005 + p) * 0.08;
        positions[p * 3 + 1] = pPos.y + Math.cos(now * 0.005 + p) * 0.08;
        positions[p * 3 + 2] = pPos.z + Math.sin(p * 2) * 0.05;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      // Render
      renderer.render(scene, camera);
    }

    requestAnimationFrame(animate);
  }

  // --------------------------------------------------------------------------
  // 2. High-Performance Canvas 2D Fallback
  // --------------------------------------------------------------------------
  function initCanvasFallback() {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width, height;

    function resizeCanvas() {
      width = stage.clientWidth || 500;
      height = stage.clientHeight || 360;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    function drawIsometricCube(cx, cy, size, colorTop, colorLeft, colorRight) {
      const h = size * 0.5;
      const w = size * 0.866;

      // Top face
      ctx.beginPath();
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx + w, cy - h);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx - w, cy - h);
      ctx.closePath();
      ctx.fillStyle = colorTop;
      ctx.fill();

      // Left face
      ctx.beginPath();
      ctx.moveTo(cx - w, cy - h);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + size);
      ctx.lineTo(cx - w, cy + h);
      ctx.closePath();
      ctx.fillStyle = colorLeft;
      ctx.fill();

      // Right face
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + w, cy - h);
      ctx.lineTo(cx + w, cy + h);
      ctx.lineTo(cx, cy + size);
      ctx.closePath();
      ctx.fillStyle = colorRight;
      ctx.fill();
    }

    function render2D(now) {
      requestAnimationFrame(render2D);

      ctx.clearRect(0, 0, width, height);

      let elapsed = now - cycleStartTime;
      let progress = (elapsed % ANIM_DURATION) / ANIM_DURATION;
      if (userOverrideTime !== null) progress = userOverrideTime;

      // Calculate step
      const currentStep = Math.min(5, Math.floor(progress * 5) + 1);
      if (currentStep !== activeStep) setActiveStep(currentStep);

      // Trajectory Bézier
      const p0 = { x: width * 0.12, y: height * 0.78 };
      const cp1 = { x: width * 0.35, y: height * 0.82 };
      const cp2 = { x: width * 0.52, y: height * 0.32 };
      const p1 = { x: width * 0.82, y: height * 0.48 };

      // Draw Curve
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p1.x, p1.y);
      ctx.strokeStyle = '#2563EB';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Traveling cubes along curve
      for (let i = 0; i < 4; i++) {
        let t = (progress + (i / 4)) % 1.0;
        let u = 1 - t;
        let x = u * u * u * p0.x + 3 * u * u * t * cp1.x + 3 * u * t * t * cp2.x + t * t * t * p1.x;
        let y = u * u * u * p0.y + 3 * u * u * t * cp1.y + 3 * u * t * t * cp2.y + t * t * t * p1.y;

        const isBlue = i % 2 === 1;
        const top = isBlue ? '#3B82F6' : '#FFFFFF';
        const left = isBlue ? '#1E60F2' : '#E2E8F0';
        const right = isBlue ? '#1D4ED8' : '#CBD5E1';

        drawIsometricCube(x, y, 16, top, left, right);
      }
    }

    requestAnimationFrame(render2D);
  }

  // --------------------------------------------------------------------------
  // 3. 5-Step Process Interactive Sync
  // --------------------------------------------------------------------------
  function setActiveStep(stepNum) {
    activeStep = stepNum;
    stripCards.forEach(card => {
      const cardStep = parseInt(card.getAttribute('data-step'), 10);
      if (cardStep === stepNum) {
        card.classList.add('is-active');
        const progressBar = card.querySelector('.strip-progress-bar');
        if (progressBar) {
          progressBar.style.transition = 'width 2.4s linear';
          progressBar.style.width = '100%';
        }
      } else {
        card.classList.remove('is-active');
        const progressBar = card.querySelector('.strip-progress-bar');
        if (progressBar) {
          progressBar.style.transition = 'none';
          progressBar.style.width = '0%';
        }
      }
    });
  }

  function initStepInteractions() {
    stripCards.forEach(card => {
      card.addEventListener('click', () => {
        const step = parseInt(card.getAttribute('data-step'), 10);
        if (!isNaN(step)) {
          // Jump to this phase (0.0, 0.2, 0.4, 0.6, 0.8)
          const targetProgress = (step - 1) * 0.2;
          cycleStartTime = performance.now() - (targetProgress * ANIM_DURATION);
          setActiveStep(step);

          // Clear manual override after 3.5s
          userOverrideTime = targetProgress;
          setTimeout(() => {
            userOverrideTime = null;
          }, 3500);
        }
      });
    });
  }

})();
