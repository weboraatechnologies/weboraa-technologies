/**
 * WEBORAA TECHNOLOGIES - Hero Interactive 3D Canvas
 * Renders an interactive 3D geometric tech lattice with mouse parallax & glowing nodes
 */

(function () {
  'use strict';

  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, cx, cy;
  let animationFrameId;

  // Mouse interaction state
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let isHovering = false;

  // 3D Geometry Vertices (Icosahedron & Core Nodes)
  const phi = (1 + Math.sqrt(5)) / 2;
  const rawVertices = [
    [-1,  phi,  0], [ 1,  phi,  0], [-1, -phi,  0], [ 1, -phi,  0],
    [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
    [ phi,  0, -1], [ phi,  0,  1], [-phi,  0, -1], [-phi,  0,  1],
    // Extra internal and outer satellite nodes
    [ 0,  0,  phi * 1.3], [ 0,  0, -phi * 1.3],
    [ phi * 1.3, 0, 0],   [-phi * 1.3, 0, 0],
    [ 0,  phi * 1.3, 0],  [ 0, -phi * 1.3, 0]
  ];

  // Scale vertices to readable size
  const scale = 80;
  const nodes = rawVertices.map(v => ({
    x: v[0] * scale,
    y: v[1] * scale,
    z: v[2] * scale,
    baseX: v[0] * scale,
    baseY: v[1] * scale,
    baseZ: v[2] * scale,
  }));

  // Ambient floating dust particles
  const particlesCount = 45;
  const particles = [];
  for (let i = 0; i < particlesCount; i++) {
    particles.push({
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 400,
      z: (Math.random() - 0.5) * 400,
      size: Math.random() * 1.8 + 0.6,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      speedZ: (Math.random() - 0.5) * 0.3,
      color: Math.random() > 0.4 ? '#00f0ff' : '#8b5cf6'
    });
  }

  // Rotation angles
  let rotX = 0.2;
  let rotY = 0.4;
  let rotZ = 0.1;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    cx = width / 2;
    cy = height / 2;
  }

  window.addEventListener('resize', resize);
  resize();

  // Mouse move listener
  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
      isHovering = true;
      mouse.targetX = (e.clientX - (rect.left + rect.width / 2)) * 0.0015;
      mouse.targetY = (e.clientY - (rect.top + rect.height / 2)) * 0.0015;
    } else {
      isHovering = false;
    }
  });

  // 3D rotation math
  function rotate3D(point, angleX, angleY, angleZ) {
    // Rotate Y
    let cosY = Math.cos(angleY);
    let sinY = Math.sin(angleY);
    let x1 = point.x * cosY - point.z * sinY;
    let z1 = point.x * sinY + point.z * cosY;

    // Rotate X
    let cosX = Math.cos(angleX);
    let sinX = Math.sin(angleX);
    let y2 = point.y * cosX - z1 * sinX;
    let z2 = point.y * sinX + z1 * cosX;

    // Rotate Z
    let cosZ = Math.cos(angleZ);
    let sinZ = Math.sin(angleZ);
    let x3 = x1 * cosZ - y2 * sinZ;
    let y3 = x1 * sinZ + y2 * cosZ;

    // Perspective projection
    const fov = 380;
    const perspective = fov / (fov + z2);

    return {
      x: x3 * perspective + cx,
      y: y3 * perspective + cy,
      z: z2,
      scale: perspective
    };
  }

  // Animation Loop
  let time = 0;
  function animate() {
    time += 0.015;

    // Smooth mouse damping
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    rotY += 0.003 + mouse.x * 0.5;
    rotX += 0.002 + mouse.y * 0.5;
    rotZ += 0.001;

    ctx.clearRect(0, 0, width, height);

    // Draw ambient glow at the center
    const radial = ctx.createRadialGradient(cx, cy, 10, cx, cy, 180);
    radial.addColorStop(0, 'rgba(0, 240, 255, 0.12)');
    radial.addColorStop(0.5, 'rgba(139, 92, 246, 0.06)');
    radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    // Project nodes
    const projectedNodes = nodes.map(n => {
      // Add subtle breathing wave
      const breathe = Math.sin(time + n.baseX) * 4;
      const point = {
        x: n.baseX + breathe,
        y: n.baseY + breathe,
        z: n.baseZ + breathe
      };
      return rotate3D(point, rotX, rotY, rotZ);
    });

    // Draw connections between nodes that are within distance
    const maxDist = scale * 1.5;
    for (let i = 0; i < projectedNodes.length; i++) {
      for (let j = i + 1; j < projectedNodes.length; j++) {
        const p1 = projectedNodes[i];
        const p2 = projectedNodes[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.45;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
          ctx.lineWidth = 1.1;
          ctx.stroke();

          // Occasionally send an energetic light pulse down the edge
          const pulseProgress = (time * 0.8 + (i * 3 + j)) % 2;
          if (pulseProgress < 1) {
            const px = p1.x + (p2.x - p1.x) * pulseProgress;
            const py = p1.y + (p2.y - p1.y) * pulseProgress;
            ctx.beginPath();
            ctx.arc(px, py, 1.8, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }
    }

    // Draw rotating orbital rings
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.2);
    ctx.beginPath();
    ctx.ellipse(0, 0, scale * 1.8, scale * 0.9, rotX, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // Draw nodes
    projectedNodes.forEach((p, idx) => {
      const radius = (idx % 2 === 0 ? 3.5 : 2.5) * p.scale;
      const isCyan = idx % 3 === 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(radius, 1.5), 0, Math.PI * 2);
      ctx.fillStyle = isCyan ? '#00f0ff' : '#a855f7';
      ctx.shadowColor = isCyan ? '#00f0ff' : '#8b5cf6';
      ctx.shadowBlur = 10 * p.scale;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Small outer ring on key nodes
      if (idx % 4 === 0) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius * 2.2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    });

    // Draw floating particles
    particles.forEach(pt => {
      pt.x += pt.speedX;
      pt.y += pt.speedY;
      pt.z += pt.speedZ;

      if (Math.abs(pt.x) > 200) pt.speedX *= -1;
      if (Math.abs(pt.y) > 200) pt.speedY *= -1;
      if (Math.abs(pt.z) > 200) pt.speedZ *= -1;

      const proj = rotate3D(pt, rotX * 0.5, rotY * 0.5, rotZ * 0.5);
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, Math.max(pt.size * proj.scale, 0.8), 0, Math.PI * 2);
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = 0.45 * proj.scale;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });

    animationFrameId = requestAnimationFrame(animate);
  }

  animate();

  // Cleanup if needed
  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(animationFrameId);
  });
})();
