import { getDb } from "./db";
import bcrypt from "bcryptjs";

export async function ensureDatabaseSeeded(): Promise<void> {
  const db = getDb();
  const userCount = (db.prepare("SELECT COUNT(*) as count FROM users").get() as unknown as { count: number }).count;

  if (userCount > 0) {
    return; // Already seeded
  }

  const defaultPasswordHash = await bcrypt.hash("devcraft123", 10);

  // 1. Insert Curated Users
  const users = [
    {
      id: "usr_elena",
      username: "elena_design",
      name: "Elena Rostova",
      email: "elena@devcraft.io",
      role: "Design Systems Lead",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      bio: "Crafting hyper-polished design systems, micro-interactions, and futuristic UI widgets. Ex-Linear designer.",
      github_url: "https://github.com",
      website_url: "https://elenarostova.design",
    },
    {
      id: "usr_marcus",
      username: "marcus_code",
      name: "Marcus Chen",
      email: "marcus@devcraft.io",
      role: "Creative Technologist",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      bio: "Shader explorer, Three.js geek, and creative coder. Obsessed with high-FPS generative art in the browser.",
      github_url: "https://github.com",
      website_url: "https://marcuschen.dev",
    },
    {
      id: "usr_alex",
      username: "alex_fullstack",
      name: "Alex Rivera",
      email: "alex@devcraft.io",
      role: "Fullstack Architect",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      bio: "Building fast Next.js fullstack applications, database tooling, and open-source developer toolkits.",
      github_url: "https://github.com",
      website_url: "https://rivera.io",
    },
    {
      id: "usr_sophie",
      username: "sophie_css",
      name: "Sophie Laurent",
      email: "sophie@devcraft.io",
      role: "Frontend & CSS Artist",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      bio: "Pushing modern CSS and SVG shaders to the extreme. Bento grids, glassmorphism, and buttery spring physics.",
      github_url: "https://github.com",
      website_url: "https://sophiecss.art",
    },
  ];

  for (const u of users) {
    db.prepare(`
      INSERT INTO users (id, username, name, email, password_hash, avatar_url, bio, role, github_url, website_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      u.id,
      u.username,
      u.name,
      u.email,
      defaultPasswordHash,
      u.avatar_url,
      u.bio,
      u.role,
      u.github_url,
      u.website_url
    );
  }

  // 2. Insert Showcase Projects with Live Runnable Sandboxes
  const projects = [
    {
      id: "prj_bento",
      title: "CyberMatrix Bento Grid",
      tagline: "Futuristic bento grid with mouse-tracking radial borders and interactive metric counters.",
      description: "A production-grade, highly responsive Bento Grid architecture inspired by modern developer landing pages. Features cursor-reactive border gradient tracking via pure CSS variables, live statistic counters, and dark glassmorphic styling.",
      tags: JSON.stringify(["React", "Tailwind", "CSSArt", "Components"]),
      cover_image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      demo_url: "https://devcraft.io/demo/bento",
      github_url: "https://github.com/elena/cyber-bento",
      views: 1420,
      author_id: "usr_elena",
      code_snippet: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #090a10; color: #f3f4f6; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 860px; width: 100%; }
    .card {
      position: relative;
      background: rgba(18, 20, 29, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 18px;
      padding: 24px;
      overflow: hidden;
      transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.3s;
      cursor: pointer;
    }
    .card:hover { transform: translateY(-4px); border-color: rgba(139, 92, 246, 0.5); }
    .card.col-2 { grid-column: span 2; }
    .glow {
      position: absolute; width: 120px; height: 120px;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, transparent 70%);
      pointer-events: none; border-radius: 50%; opacity: 0;
      transition: opacity 0.2s;
    }
    .card:hover .glow { opacity: 1; }
    .badge {
      display: inline-block; padding: 4px 10px; font-size: 11px; font-weight: 600;
      border-radius: 9999px; background: rgba(139, 92, 246, 0.15); color: #c4b5fd;
      border: 1px solid rgba(139, 92, 246, 0.3); margin-bottom: 12px;
    }
    h3 { font-size: 18px; margin-bottom: 8px; color: #fff; font-weight: 600; }
    p { font-size: 13px; color: #9ca3af; line-height: 1.5; }
    .metric { font-size: 32px; font-weight: 700; color: #38bdf8; margin-top: 16px; font-family: monospace; }
    .btn {
      margin-top: 14px; background: #8b5cf6; color: white; border: none; padding: 8px 16px;
      border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.2s;
    }
    .btn:hover { background: #7c3aed; }
  </style>
</head>
<body>
  <div class="grid">
    <div class="card col-2">
      <div class="glow" id="glow1"></div>
      <span class="badge">Live Telemetry</span>
      <h3>Global Edge Network</h3>
      <p>Sub-millisecond routing across 300+ edge locations with automated failover and quantum-safe TLS.</p>
      <div class="metric" id="reqCount">4,892,104 req/s</div>
      <button class="btn" onclick="boost()">Simulate Traffic Spike</button>
    </div>
    <div class="card">
      <div class="glow" id="glow2"></div>
      <span class="badge" style="background: rgba(16, 185, 129, 0.15); color: #6ee7b7; border-color: rgba(16, 185, 129, 0.3);">Operational</span>
      <h3>System Health</h3>
      <p>Zero downtime observed over the past 180 consecutive days.</p>
      <div class="metric" style="color: #34d399;">99.998%</div>
    </div>
    <div class="card">
      <div class="glow" id="glow3"></div>
      <span class="badge">P2P Mesh</span>
      <h3>Active Nodes</h3>
      <p>Decentralized state synchronization across live peers.</p>
      <div class="metric" style="color: #f472b6;">1,420</div>
    </div>
    <div class="card col-2">
      <div class="glow" id="glow4"></div>
      <span class="badge">Adaptive AI</span>
      <h3>Intelligent Cache Synthesis</h3>
      <p>Predictive memory prefetching powered by real-time client interaction embeddings.</p>
      <div class="metric" style="color: #a78bfa;">0.42 ms avg</div>
    </div>
  </div>
  <script>
    let count = 4892104;
    function boost() {
      count += Math.floor(Math.random() * 250000 + 50000);
      document.getElementById('reqCount').innerText = count.toLocaleString() + ' req/s';
    }
    document.querySelectorAll('.card').forEach(card => {
      const glow = card.querySelector('.glow');
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        glow.style.left = (e.clientX - rect.left - 60) + 'px';
        glow.style.top = (e.clientY - rect.top - 60) + 'px';
      });
    });
  </script>
</body>
</html>`,
    },
    {
      id: "prj_particles",
      title: "Neural Particle Constellation",
      tagline: "Interactive HTML5 Canvas particle network with dynamic physics and shockwave click interactions.",
      description: "A lightweight, zero-dependency particle constellation built on HTML5 Canvas. Nodes detect proximity to calculate distance-weighted glowing connection lines, flee smoothly from the mouse cursor, and trigger expanding shockwaves on click.",
      tags: JSON.stringify(["Canvas", "CreativeCoding", "WebGL", "Interactive"]),
      cover_image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80",
      demo_url: "https://devcraft.io/demo/particles",
      github_url: "https://github.com/marcus/neural-constellation",
      views: 2840,
      author_id: "usr_marcus",
      code_snippet: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #07080d; overflow: hidden; height: 100vh; display: flex; align-items: center; justify-content: center; font-family: monospace; }
    canvas { display: block; width: 100vw; height: 100vh; }
    .hint {
      position: absolute; bottom: 20px; color: rgba(255, 255, 255, 0.4);
      font-size: 12px; pointer-events: none; letter-spacing: 1px;
    }
  </style>
</head>
<body>
  <canvas id="c"></canvas>
  <div class="hint">CLICK TO GENERATE SHOCKWAVE • MOVE CURSOR TO REPEL</div>
  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const mouse = { x: -1000, y: -1000, radius: 120 };
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', () => { mouse.x = -1000; mouse.y = -1000; });

    const shockwaves = [];
    window.addEventListener('click', e => {
      shockwaves.push({ x: e.clientX, y: e.clientY, radius: 5, maxRadius: 180, alpha: 1 });
    });

    const particles = [];
    const count = 90;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        radius: Math.random() * 2 + 1.5,
        baseColor: Math.random() > 0.3 ? '#8b5cf6' : '#38bdf8'
      });
    }

    function animate() {
      ctx.fillStyle = 'rgba(7, 8, 13, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Render shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(56, 189, 248, ' + sw.alpha + ')';
        ctx.lineWidth = 2;
        ctx.stroke();
        sw.radius += 5;
        sw.alpha -= 0.025;
        if (sw.alpha <= 0) shockwaves.splice(i, 1);
      }

      // Update and connect particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse repel
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x += (dx / dist) * force * 5;
          p.y += (dy / dist) * force * 5;
        }

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist2 < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = 'rgba(139, 92, 246, ' + (1 - dist2 / 110) * 0.4 + ')';
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.baseColor;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.baseColor;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      requestAnimationFrame(animate);
    }
    animate();
  </script>
</body>
</html>`,
    },
    {
      id: "prj_switch",
      title: "Neumorphic Cyberpunk HUD Switch",
      tagline: "Futuristic hardware-inspired toggle switches with reactive neon glow, sound pulse, and telemetry dials.",
      description: "An homage to physical cyberpunk control consoles and avionics instrumentation. Includes interactive multi-state toggles, customizable LED intensity sliders, and tactile visual feedback.",
      tags: JSON.stringify(["UIComponents", "CSSArt", "Microinteractions"]),
      cover_image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
      demo_url: "https://devcraft.io/demo/hud-switch",
      github_url: "https://github.com/sophie/cyber-hud-controls",
      views: 1910,
      author_id: "usr_sophie",
      code_snippet: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #0b0d14; color: #fff; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .panel {
      background: linear-gradient(145deg, #121520, #0c0e17);
      border: 1px solid rgba(255, 255, 255, 0.09);
      border-radius: 24px;
      padding: 32px;
      width: 420px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 16px; margin-bottom: 24px; }
    .header h2 { font-size: 16px; font-weight: 700; letter-spacing: 1px; color: #e2e8f0; text-transform: uppercase; }
    .led { width: 10px; height: 10px; border-radius: 50%; background: #10b981; box-shadow: 0 0 12px #10b981; }
    .control-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .label { font-size: 14px; font-weight: 500; color: #cbd5e1; }
    .sub { font-size: 11px; color: #64748b; margin-top: 2px; }
    
    /* Toggle switch */
    .switch {
      position: relative; width: 60px; height: 32px; background: #1e2235;
      border-radius: 9999px; cursor: pointer; transition: 0.3s;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .switch::after {
      content: ''; position: absolute; top: 3px; left: 4px; width: 24px; height: 24px;
      background: #94a3b8; border-radius: 50%; transition: 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .switch.active { background: #8b5cf6; border-color: #a78bfa; box-shadow: 0 0 20px rgba(139, 92, 246, 0.5); }
    .switch.active::after { left: 30px; background: #fff; }
    
    /* Slider */
    .slider-box { margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.08); }
    input[type=range] {
      width: 100%; -webkit-appearance: none; height: 6px; border-radius: 3px;
      background: #1e2235; outline: none; margin-top: 10px;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%;
      background: #06b6d4; cursor: pointer; box-shadow: 0 0 10px #06b6d4;
    }
    .status-msg { margin-top: 18px; padding: 10px 14px; border-radius: 10px; background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.2); font-size: 12px; color: #67e8f9; font-family: monospace; }
  </style>
</head>
<body>
  <div class="panel">
    <div class="header">
      <h2>Module Core-9</h2>
      <div class="led" id="masterLed"></div>
    </div>
    <div class="control-row">
      <div>
        <div class="label">Overdrive Shield</div>
        <div class="sub">Deflect incoming thermal harmonics</div>
      </div>
      <div class="switch active" onclick="toggle(this, 'Shields engaged at 100% capacity')"></div>
    </div>
    <div class="control-row">
      <div>
        <div class="label">Quantum Interlink</div>
        <div class="sub">Sync across multi-region clusters</div>
      </div>
      <div class="switch active" onclick="toggle(this, 'Quantum mesh synchronized')"></div>
    </div>
    <div class="control-row">
      <div>
        <div class="label">Auditory Feedback Pulse</div>
        <div class="sub">Synthesize acoustic alert tones</div>
      </div>
      <div class="switch" onclick="toggle(this, 'Acoustic synthesizer initialized')"></div>
    </div>
    <div class="slider-box">
      <div class="control-row" style="margin-bottom: 0;">
        <div class="label">Flux Capacitor Output</div>
        <span id="sliderVal" style="color: #06b6d4; font-weight: 700; font-family: monospace;">85%</span>
      </div>
      <input type="range" min="0" max="100" value="85" oninput="updateSlider(this.value)">
    </div>
    <div class="status-msg" id="statusBox">> SYSTEM READY: ALL 3 PROTOCOLS RUNNING</div>
  </div>
  <script>
    function toggle(el, msg) {
      el.classList.toggle('active');
      document.getElementById('statusBox').innerText = '> ' + (el.classList.contains('active') ? msg : 'SUBSYSTEM STANDBY');
    }
    function updateSlider(val) {
      document.getElementById('sliderVal').innerText = val + '%';
      document.getElementById('statusBox').innerText = '> CORE OUTPUT ADJUSTED TO ' + val + '% FLUX';
    }
  </script>
</body>
</html>`,
    },
    {
      id: "prj_carousel",
      title: "Holographic 3D Tilt Card Deck",
      tagline: "Realistic 3D parallax cards with dynamic holographic foil glare and gyroscope simulation.",
      description: "An interactive card presentation deck built with CSS 3D perspective transforms. Responds dynamically to mouse coordinates to cast realistic iridescent surface reflections, specular highlights, and natural tilt depth.",
      tags: JSON.stringify(["NextJS", "Tailwind", "Components", "DesignSystem"]),
      cover_image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80",
      demo_url: "https://devcraft.io/demo/tilt-card",
      github_url: "https://github.com/alex/holographic-tilt-card",
      views: 3120,
      author_id: "usr_alex",
      code_snippet: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: #08090f; min-height: 100vh; display: flex; align-items: center; justify-content: center; perspective: 1000px; }
    .card-container {
      position: relative; width: 340px; height: 480px; transition: transform 0.1s ease-out;
      transform-style: preserve-3d; cursor: pointer;
    }
    .card {
      width: 100%; height: 100%; border-radius: 24px; padding: 32px;
      background: linear-gradient(135deg, rgba(30, 34, 53, 0.8), rgba(15, 17, 28, 0.95));
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
      display: flex; flex-direction: column; justify-content: space-between;
      position: relative; overflow: hidden; backdrop-filter: blur(12px);
    }
    .glare {
      position: absolute; inset: 0; border-radius: 24px;
      background: radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), rgba(255, 255, 255, 0.25) 0%, transparent 60%);
      pointer-events: none; mix-blend-mode: overlay; opacity: 0; transition: opacity 0.3s;
    }
    .card-container:hover .glare { opacity: 1; }
    .chip {
      width: 44px; height: 34px; border-radius: 8px;
      background: linear-gradient(135deg, #d4af37, #f3e5ab);
      box-shadow: inset 0 1px 2px rgba(255,255,255,0.4), 0 2px 4px rgba(0,0,0,0.4);
    }
    .brand { font-size: 14px; font-weight: 700; color: #a5b4fc; letter-spacing: 2px; }
    .number { font-size: 20px; font-family: monospace; letter-spacing: 3px; color: #f8fafc; margin-top: 40px; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; }
    .holder-label { font-size: 9px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; }
    .holder-name { font-size: 14px; font-weight: 600; color: #fff; margin-top: 4px; }
    .badge-tier { background: linear-gradient(90deg, #ec4899, #8b5cf6); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; color: #fff; }
  </style>
</head>
<body>
  <div class="card-container" id="cardContainer">
    <div class="card">
      <div class="glare" id="glare"></div>
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div class="chip"></div>
        <div class="brand">DEVCRAFT BLACK</div>
      </div>
      <div>
        <div class="number">•••• 8920 4410 7719</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 6px; font-family: monospace;">EXP: 10/29 • CVV: •••</div>
      </div>
      <div class="footer">
        <div>
          <div class="holder-label">CARDHOLDER</div>
          <div class="holder-name">ALEX RIVERA</div>
        </div>
        <div class="badge-tier">FOUNDER</div>
      </div>
    </div>
  </div>
  <script>
    const box = document.getElementById('cardContainer');
    const glare = document.getElementById('glare');
    document.addEventListener('mousemove', e => {
      const rect = box.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -16;
      const rotateY = ((x - cx) / cx) * 16;
      box.style.transform = 'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
      glare.style.setProperty('--gx', (x / rect.width * 100) + '%');
      glare.style.setProperty('--gy', (y / rect.height * 100) + '%');
    });
    box.addEventListener('mouseleave', () => {
      box.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  </script>
</body>
</html>`,
    },
  ];

  for (const p of projects) {
    db.prepare(`
      INSERT INTO projects (
        id, title, tagline, description, tags, cover_image, code_snippet, demo_url, github_url, views, author_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      p.id,
      p.title,
      p.tagline,
      p.description,
      p.tags,
      p.cover_image,
      p.code_snippet,
      p.demo_url,
      p.github_url,
      p.views,
      p.author_id
    );
  }

  // 3. Seed Stars & Social Comments
  const stars = [
    { projectId: "prj_bento", userId: "usr_marcus" },
    { projectId: "prj_bento", userId: "usr_alex" },
    { projectId: "prj_bento", userId: "usr_sophie" },
    { projectId: "prj_particles", userId: "usr_elena" },
    { projectId: "prj_particles", userId: "usr_alex" },
    { projectId: "prj_switch", userId: "usr_marcus" },
    { projectId: "prj_switch", userId: "usr_elena" },
    { projectId: "prj_carousel", userId: "usr_sophie" },
    { projectId: "prj_carousel", userId: "usr_elena" },
    { projectId: "prj_carousel", userId: "usr_marcus" },
  ];

  for (const s of stars) {
    const starId = "star_" + Math.random().toString(36).slice(2, 9);
    db.prepare("INSERT INTO stars (id, project_id, user_id) VALUES (?, ?, ?)").run(starId, s.projectId, s.userId);
  }

  const comments = [
    {
      id: "cmt_1",
      projectId: "prj_bento",
      userId: "usr_marcus",
      content: "The cursor-tracking radial glow is so clean! Have you tested how it handles on mobile touch viewports?",
    },
    {
      id: "cmt_2",
      projectId: "prj_bento",
      userId: "usr_elena",
      content: "Thanks Marcus! On mobile it smoothly falls back to a subtle ambient glow to preserve 60fps scrolling.",
    },
    {
      id: "cmt_3",
      projectId: "prj_particles",
      userId: "usr_sophie",
      content: "The shockwave on click feels incredible. Reminds me of the particle effects in modern rhythm games!",
    },
    {
      id: "cmt_4",
      projectId: "prj_carousel",
      userId: "usr_elena",
      content: "The holographic foil specular highlight is pure craft. Loving the subtle gold chip gradient too.",
    },
  ];

  for (const c of comments) {
    db.prepare("INSERT INTO comments (id, project_id, user_id, content) VALUES (?, ?, ?, ?)").run(
      c.id,
      c.projectId,
      c.userId,
      c.content
    );
  }
}
