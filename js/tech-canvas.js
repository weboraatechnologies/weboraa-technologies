/**
 * WEBORAA TECHNOLOGIES - Technology Ecosystem Network Canvas
 * Renders an animated interactive node network for modern technologies
 */

(function () {
  'use strict';

  const canvas = document.getElementById('techCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const tooltip = document.getElementById('techTooltip');
  let width, height;
  let activeFilter = 'all';
  let hoveredNode = null;

  // Modern tech node specifications
  const techNodesData = [
    { id: 'react', name: 'React', category: 'frontend', role: 'Reactive UI Component Architecture', color: '#00f0ff', xRatio: 0.22, yRatio: 0.35 },
    { id: 'js', name: 'JavaScript', category: 'frontend', role: 'Modern ES6+ / TypeScript Engine', color: '#f59e0b', xRatio: 0.15, yRatio: 0.65 },
    { id: 'python', name: 'Python', category: 'ai', role: 'AI Models, Machine Learning & Automation', color: '#38bdf8', xRatio: 0.78, yRatio: 0.32 },
    { id: 'nodejs', name: 'Node.js', category: 'backend', role: 'High-Concurrency Event-Driven Backends', color: '#22c55e', xRatio: 0.36, yRatio: 0.72 },
    { id: 'mysql', name: 'MySQL', category: 'backend', role: 'Relational Schemas & Enterprise Databases', color: '#0ea5e9', xRatio: 0.50, yRatio: 0.85 },
    { id: 'aws', name: 'AWS', category: 'cloud', role: 'Serverless Infrastructure & Elastic Compute', color: '#f97316', xRatio: 0.62, yRatio: 0.68 },
    { id: 'figma', name: 'Figma', category: 'frontend', role: 'Design Systems & Interactive Prototypes', color: '#a855f7', xRatio: 0.35, yRatio: 0.20 },
    { id: 'ai', name: 'AI', category: 'ai', role: 'LLMs, Neural Networks & Autonomous Agents', color: '#8b5cf6', xRatio: 0.85, yRatio: 0.60 },
    { id: 'apis', name: 'APIs', category: 'backend', role: 'RESTful, GraphQL & Microservices Fabric', color: '#00f0ff', xRatio: 0.48, yRatio: 0.45 },
    { id: 'cloud', name: 'Cloud', category: 'cloud', role: 'Edge Computing, CI/CD & Distributed Mesh', color: '#3b82f6', xRatio: 0.68, yRatio: 0.22 }
  ];

  // Connections between technologies
  const connections = [
    ['react', 'js'],
    ['react', 'apis'],
    ['react', 'figma'],
    ['nodejs', 'js'],
    ['nodejs', 'apis'],
    ['nodejs', 'mysql'],
    ['python', 'ai'],
    ['python', 'apis'],
    ['ai', 'cloud'],
    ['aws', 'cloud'],
    ['aws', 'mysql'],
    ['apis', 'cloud'],
    ['apis', 'mysql']
  ];

  // Animated data packets travelling on connections
  const packets = [];
  connections.forEach(([sourceId, targetId], idx) => {
    packets.push({
      sourceId,
      targetId,
      progress: (idx * 0.17) % 1,
      speed: 0.004 + (idx % 3) * 0.002
    });
  });

  let nodes = [];

  function initNodes() {
    nodes = techNodesData.map(d => ({
      ...d,
      x: d.xRatio * width,
      y: d.yRatio * height,
      baseX: d.xRatio * width,
      baseY: d.yRatio * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: 22,
      pulse: Math.random() * Math.PI
    }));
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    initNodes();
  }

  window.addEventListener('resize', resize);
  resize();

  // Mouse interaction
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let found = null;
    for (const node of nodes) {
      const dx = mouseX - node.x;
      const dy = mouseY - node.y;
      if (Math.sqrt(dx * dx + dy * dy) < node.radius + 10) {
        found = node;
        break;
      }
    }

    hoveredNode = found;

    if (found && tooltip) {
      tooltip.innerHTML = `<strong>${found.name}</strong> <span>•</span> ${found.role}`;
      tooltip.style.left = `${found.x}px`;
      tooltip.style.top = `${found.y}px`;
      tooltip.classList.add('is-visible');
      canvas.style.cursor = 'pointer';
    } else if (tooltip) {
      tooltip.classList.remove('is-visible');
      canvas.style.cursor = 'default';
    }
  });

  canvas.addEventListener('mouseleave', () => {
    hoveredNode = null;
    if (tooltip) tooltip.classList.remove('is-visible');
  });

  // Filter buttons handler
  const filterButtons = document.querySelectorAll('.tech-filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      activeFilter = btn.dataset.filter || 'all';
    });
  });

  // Animation Loop
  function render() {
    ctx.clearRect(0, 0, width, height);

    // Subtle background mesh in canvas
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 1;
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Update node gentle drift
    nodes.forEach(node => {
      node.pulse += 0.03;
      if (node !== hoveredNode) {
        node.x += node.vx;
        node.y += node.vy;

        // Soft bounce boundaries
        const boundX = width * 0.08;
        const boundY = height * 0.1;
        if (node.x < boundX || node.x > width - boundX) node.vx *= -1;
        if (node.y < boundY || node.y > height - boundY) node.vy *= -1;
      }
    });

    // Draw connection lines
    connections.forEach(([sId, tId]) => {
      const source = nodes.find(n => n.id === sId);
      const target = nodes.find(n => n.id === tId);
      if (!source || !target) return;

      const isSourceActive = activeFilter === 'all' || source.category === activeFilter;
      const isTargetActive = activeFilter === 'all' || target.category === activeFilter;
      const isHighlighted = hoveredNode && (hoveredNode.id === sId || hoveredNode.id === tId);

      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);

      if (isHighlighted) {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
        ctx.lineWidth = 2.2;
      } else if (isSourceActive && isTargetActive) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.2;
      } else {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 0.8;
      }
      ctx.stroke();
    });

    // Draw animated data packets travelling along lines
    packets.forEach(packet => {
      const source = nodes.find(n => n.id === packet.sourceId);
      const target = nodes.find(n => n.id === packet.targetId);
      if (!source || !target) return;

      const isSourceActive = activeFilter === 'all' || source.category === activeFilter;
      const isTargetActive = activeFilter === 'all' || target.category === activeFilter;
      if (!isSourceActive && !isTargetActive) return;

      packet.progress += packet.speed;
      if (packet.progress > 1) packet.progress = 0;

      const px = source.x + (target.x - source.x) * packet.progress;
      const py = source.y + (target.y - source.y) * packet.progress;

      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Draw nodes
    nodes.forEach(node => {
      const isMatch = activeFilter === 'all' || node.category === activeFilter;
      const isHovered = hoveredNode === node;
      const isNeighbor = hoveredNode && connections.some(([s, t]) => 
        (s === hoveredNode.id && t === node.id) || (t === hoveredNode.id && s === node.id)
      );

      const opacity = isMatch ? (hoveredNode ? (isHovered || isNeighbor ? 1 : 0.3) : 1) : 0.2;
      const baseRadius = isHovered ? node.radius + 4 : node.radius;

      ctx.save();
      ctx.globalAlpha = opacity;

      // Outer glowing ring
      ctx.beginPath();
      ctx.arc(node.x, node.y, baseRadius + 7 + Math.sin(node.pulse) * 2, 0, Math.PI * 2);
      ctx.strokeStyle = isHovered ? 'rgba(0, 240, 255, 0.6)' : 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Node background pill / circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, baseRadius, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? '#121d30' : '#0b101c';
      ctx.fill();
      ctx.strokeStyle = isHovered ? '#00f0ff' : (isMatch ? 'rgba(255, 255, 255, 0.16)' : 'rgba(255, 255, 255, 0.05)');
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();

      // Mini category accent dot
      ctx.beginPath();
      ctx.arc(node.x - 2, node.y - 8, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();

      // Node text label
      ctx.fillStyle = isHovered ? '#ffffff' : '#e2e8f0';
      ctx.font = `600 ${isHovered ? '12px' : '11px'} 'Space Grotesk', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.name, node.x, node.y + 3);

      ctx.restore();
    });

    requestAnimationFrame(render);
  }

  render();
})();
