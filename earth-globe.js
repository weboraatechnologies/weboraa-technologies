/**
 * WEBORAA TECHNOLOGIES — 3D Earth Global Connectivity Engine
 * Three.js interactive 3D Globe with realistic continents, dynamic clouds,
 * glowing atmospheric limb, Great Circle connection arcs, traveling light photons,
 * pulsing geographic hubs, and interactive pointer drag rotation.
 */

(function () {
  'use strict';

  const container = document.getElementById('globeCanvasContainer');
  const canvas = document.getElementById('globeCanvas');
  if (!container || !canvas) return;

  // Reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Globe dimensions & radius
  const GLOBE_RADIUS = 2.45;
  const CLOUD_RADIUS = 2.485;
  const ATMOSPHERE_RADIUS = 2.75;

  let renderer, scene, camera;
  let globeMesh, cloudsMesh, atmosphereMesh;
  let earthGroup;
  let isVisible = true;

  // Drag interaction state
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let velocity = { x: 0.0016, y: 0 };
  let autoRotateSpeed = prefersReducedMotion ? 0 : 0.0016;

  // Global Hubs (latitude, longitude, name, category)
  const HUBS = [
    { id: 'in', name: 'India', city: 'Coimbatore', lat: 11.0168, lon: 76.9558, isPrimary: true },
    { id: 'uk', name: 'United Kingdom', city: 'London', lat: 51.5074, lon: -0.1278 },
    { id: 'ca', name: 'Canada', city: 'Toronto', lat: 43.6532, lon: -79.3832 },
    { id: 'uae', name: 'UAE', city: 'Dubai', lat: 25.2048, lon: 55.2708 },
    { id: 'au', name: 'Australia', city: 'Sydney', lat: -33.8688, lon: 151.2093 },
    { id: 'us', name: 'USA', city: 'New York', lat: 40.7128, lon: -74.0060 },
    { id: 'sg', name: 'Singapore', city: 'Singapore', lat: 1.3521, lon: 103.8198 }
  ];

  // Inter-hub connection routes (startHubIndex, endHubIndex, speed, offset)
  const ROUTES = [
    { from: 0, to: 1, speed: 0.35, offset: 0.0 },   // India -> UK
    { from: 1, to: 2, speed: 0.38, offset: 0.25 },  // UK -> Canada
    { from: 2, to: 5, speed: 0.45, offset: 0.5 },   // Canada -> USA
    { from: 0, to: 3, speed: 0.42, offset: 0.15 },  // India -> UAE
    { from: 3, to: 1, speed: 0.36, offset: 0.65 },  // UAE -> UK
    { from: 0, to: 6, speed: 0.40, offset: 0.4 },   // India -> Singapore
    { from: 6, to: 4, speed: 0.34, offset: 0.75 }   // Singapore -> Australia
  ];

  const arcMeshes = [];
  const photons = [];
  const hubMarkers = [];

  // Helper: Convert Lat/Long to 3D Cartesian coordinates on sphere
  function latLongToVector3(lat, lon, radius, alt = 0) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const r = radius + alt;
    return new THREE.Vector3(
      -(r * Math.sin(phi) * Math.cos(theta)),
      (r * Math.cos(phi)),
      (r * Math.sin(phi) * Math.sin(theta))
    );
  }

  // Create elevated 3D Catmull-Rom connection curve
  function createConnectionCurve(p1, p2, elevation = 0.52) {
    const distance = p1.distanceTo(p2);
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const midLength = mid.length();

    // Lift midpoint outward based on distance
    const lift = GLOBE_RADIUS + Math.min(1.4, Math.max(0.3, distance * elevation));
    mid.normalize().multiplyScalar(lift);

    // Midpoints for smooth curved arc
    const mid1 = new THREE.Vector3().addVectors(p1, mid).multiplyScalar(0.5);
    mid1.normalize().multiplyScalar(GLOBE_RADIUS + (lift - GLOBE_RADIUS) * 0.75);

    const mid2 = new THREE.Vector3().addVectors(mid, p2).multiplyScalar(0.5);
    mid2.normalize().multiplyScalar(GLOBE_RADIUS + (lift - GLOBE_RADIUS) * 0.75);

    return new THREE.CatmullRomCurve3([p1, mid1, mid, mid2, p2]);
  }

  function init() {
    let width = container.clientWidth || 540;
    let height = container.clientHeight || 540;

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    // Scene & Camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.6, 7.6);
    camera.lookAt(0, 0, 0);

    // Root Earth Group for global rotation
    earthGroup = new THREE.Group();
    // Initial tilt to display Europe, Asia, and Indian Ocean prominently
    earthGroup.rotation.x = 0.22;
    earthGroup.rotation.y = -1.25;
    scene.add(earthGroup);

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.82);
    scene.add(ambientLight);

    // Main Sun Key Light
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.25);
    sunLight.position.set(8, 5, 7);
    scene.add(sunLight);

    // Electric-Blue Rim Backlight
    const rimLight = new THREE.DirectionalLight(0x2878F8, 1.1);
    rimLight.position.set(-8, 3, -4);
    scene.add(rimLight);

    // Soft Fill Light
    const fillLight = new THREE.DirectionalLight(0x93C5FD, 0.45);
    fillLight.position.set(0, -6, 5);
    scene.add(fillLight);

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();

    // 1. Globe Sphere (Realistic Blue Marble)
    const earthGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.38,
      metalness: 0.08,
      bumpScale: 0.05
    });

    textureLoader.load('assets/earth_atmos.jpg', function (texture) {
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      earthMat.map = texture;
      earthMat.needsUpdate = true;
    });

    globeMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(globeMesh);

    // 2. Cloud Sphere (Transparent rotating layer)
    const cloudGeo = new THREE.SphereGeometry(CLOUD_RADIUS, 64, 64);
    const cloudMat = new THREE.MeshStandardMaterial({
      transparent: true,
      opacity: 0.68,
      blending: THREE.NormalBlending,
      depthWrite: false
    });

    textureLoader.load('assets/earth_clouds.png', function (texture) {
      cloudMat.map = texture;
      cloudMat.needsUpdate = true;
    });

    cloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
    earthGroup.add(cloudsMesh);

    // 3. Electric Blue Atmosphere Outer Glow
    const atmosGeo = new THREE.SphereGeometry(ATMOSPHERE_RADIUS, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
          gl_FragColor = vec4(0.157, 0.471, 0.973, 1.0) * intensity * 1.4;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });

    atmosphereMesh = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosphereMesh);

    // 4. Soft Ambient Floor Shadow beneath Globe
    const shadowGeo = new THREE.PlaneGeometry(5.2, 5.2);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    const grad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(11, 23, 54, 0.18)');
    grad.addColorStop(0.5, 'rgba(40, 120, 248, 0.06)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    const floorShadow = new THREE.Mesh(shadowGeo, shadowMat);
    floorShadow.rotation.x = -Math.PI / 2;
    floorShadow.position.y = -2.75;
    scene.add(floorShadow);

    // 5. Build Hub Markers
    HUBS.forEach((hub, idx) => {
      const pos = latLongToVector3(hub.lat, hub.lon, GLOBE_RADIUS, 0.015);

      // Core Hub Dot
      const dotGeo = new THREE.SphereGeometry(hub.isPrimary ? 0.048 : 0.036, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({
        color: hub.isPrimary ? 0x60A5FA : 0x38BDF8
      });
      const dotMesh = new THREE.Mesh(dotGeo, dotMat);
      dotMesh.position.copy(pos);
      earthGroup.add(dotMesh);

      // Glowing Pulse Ring
      const ringGeo = new THREE.RingGeometry(0.045, 0.08, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: hub.isPrimary ? 0x2878F8 : 0x60A5FA,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
      earthGroup.add(ringMesh);

      hubMarkers.push({
        hub,
        position: pos,
        ringMesh,
        pulseOffset: idx * 0.4
      });
    });

    // 6. Build Connection Arcs & Traveling Photons
    ROUTES.forEach((route, idx) => {
      const startHub = HUBS[route.from];
      const endHub = HUBS[route.to];
      const p1 = latLongToVector3(startHub.lat, startHub.lon, GLOBE_RADIUS);
      const p2 = latLongToVector3(endHub.lat, endHub.lon, GLOBE_RADIUS);

      const curve = createConnectionCurve(p1, p2, 0.45);

      // Arc Tube Geometry
      const tubeGeo = new THREE.TubeGeometry(curve, 48, 0.012, 6, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: 0x38BDF8,
        transparent: true,
        opacity: 0.65
      });
      const arcMesh = new THREE.Mesh(tubeGeo, tubeMat);
      earthGroup.add(arcMesh);
      arcMeshes.push(arcMesh);

      // Traveling Light Photon
      const photonGeo = new THREE.SphereGeometry(0.038, 12, 12);
      const photonMat = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF
      });
      const photonMesh = new THREE.Mesh(photonGeo, photonMat);
      earthGroup.add(photonMesh);

      photons.push({
        mesh: photonMesh,
        curve: curve,
        speed: route.speed,
        offset: route.offset,
        destinationIndex: route.to
      });
    });

    // Event Listeners
    setupDragControls();
    setupIntersectionObserver();
    window.addEventListener('resize', onWindowResize, { passive: true });

    // Start Animation Loop
    animate(performance.now());
  }

  // Pointer Drag Rotation Controls
  function setupDragControls() {
    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
      velocity = { x: 0, y: 0 };
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      velocity = {
        x: deltaX * 0.005,
        y: deltaY * 0.005
      };

      earthGroup.rotation.y += velocity.x;
      earthGroup.rotation.x = Math.max(-0.6, Math.min(0.6, earthGroup.rotation.x + velocity.y));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch Support
    container.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        velocity = { x: 0, y: 0 };
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;

      velocity = {
        x: deltaX * 0.005,
        y: deltaY * 0.005
      };

      earthGroup.rotation.y += velocity.x;
      earthGroup.rotation.x = Math.max(-0.6, Math.min(0.6, earthGroup.rotation.x + velocity.y));

      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  // Resize Handler
  function onWindowResize() {
    if (!container || !renderer || !camera) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width === 0 || height === 0) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  // Performance: Pause when not in viewport
  function setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isVisible = entry.isIntersecting;
        });
      }, { threshold: 0.1 });
      observer.observe(container);
    }
  }

  // Animation Loop
  let lastTime = performance.now();

  function animate(now) {
    requestAnimationFrame(animate);

    if (!isVisible) return;

    const delta = (now - lastTime) / 1000;
    lastTime = now;

    // Smooth inertia and continuous auto-rotation
    if (!isDragging) {
      velocity.x += (autoRotateSpeed - velocity.x) * 0.04;
      velocity.y *= 0.92;
      earthGroup.rotation.y += velocity.x;
      earthGroup.rotation.x += velocity.y;
    }

    // Clouds rotate slightly faster for dynamic atmospheric realism
    if (cloudsMesh && !prefersReducedMotion) {
      cloudsMesh.rotation.y += 0.0006;
    }

    // Animate Hub Pulse Rings
    hubMarkers.forEach((marker) => {
      const pulse = ((now * 0.0018 + marker.pulseOffset) % 1.0);
      const scale = 1.0 + pulse * 1.8;
      marker.ringMesh.scale.set(scale, scale, 1);
      marker.ringMesh.material.opacity = (1.0 - pulse) * 0.85;
    });

    // Animate Traveling Photons along Great Circle Arcs
    photons.forEach((item) => {
      const t = ((now * 0.00028 * item.speed) + item.offset) % 1.0;
      const pt = item.curve.getPointAt(t);
      item.mesh.position.copy(pt);

      // Flash scale when traveling
      const pulseScale = 1.0 + Math.sin(now * 0.008 + item.offset * 10) * 0.25;
      item.mesh.scale.set(pulseScale, pulseScale, pulseScale);
    });

    renderer.render(scene, camera);
  }

  // Initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
