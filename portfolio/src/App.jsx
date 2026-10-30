import React, { useState, useEffect, useRef } from 'react';

// --- Matrix Dot Grid Canvas Component with Interactive Perspective & Ripple ---
const MatrixCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      radius: 170,
      isActive: false,
    };

    const spacing = 34;
    let dots = [];

    const initDots = () => {
      dots = [];
      const cols = Math.ceil(width / spacing) + 2;
      const rows = Math.ceil(height / spacing) + 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({
            baseX: c * spacing,
            baseY: r * spacing,
            x: c * spacing,
            y: r * spacing,
            phase: Math.random() * Math.PI * 2,
            char: (c + r) % 7 === 0 ? (Math.random() > 0.5 ? '1' : '0') : null,
          });
        }
      }
    };

    initDots();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initDots();
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.isActive = true;
    };

    const handleMouseLeave = () => {
      mouse.isActive = false;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        mouse.isActive = true;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove);

    let time = 0;

    const render = () => {
      time += 0.02;

      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      const perspectiveTiltX = ((mouse.x - width / 2) / width) * 14;
      const perspectiveTiltY = ((mouse.y - height / 2) / height) * 14;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const wave = Math.sin(time + dot.phase) * 1.5;

        const dx = mouse.x - (dot.baseX + perspectiveTiltX);
        const dy = mouse.y - (dot.baseY + perspectiveTiltY);
        const dist = Math.sqrt(dx * dx + dy * dy);

        let intensity = 0;

        if (dist < mouse.radius) {
          intensity = 1 - dist / mouse.radius;
          const force = Math.sin((dist / mouse.radius) * Math.PI) * 12;
          const angle = Math.atan2(dy, dx);
          dot.x = dot.baseX + perspectiveTiltX - Math.cos(angle) * force;
          dot.y = dot.baseY + perspectiveTiltY - Math.sin(angle) * force + wave;
        } else {
          dot.x += (dot.baseX + perspectiveTiltX - dot.x) * 0.1;
          dot.y += (dot.baseY + perspectiveTiltY + wave - dot.y) * 0.1;
        }

        if (intensity > 0.1) {
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, 1.8 + intensity * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${16 + intensity * 150}, ${185 + intensity * 70}, ${129 + intensity * 40}, ${0.4 + intensity * 0.6})`;
          ctx.shadowColor = '#00ff9d';
          ctx.shadowBlur = 8 * intensity;
          ctx.fill();
          ctx.shadowBlur = 0;

          if (dot.char && intensity > 0.4) {
            ctx.font = '10px monospace';
            ctx.fillStyle = `rgba(204, 255, 0, ${intensity * 0.9})`;
            ctx.fillText(dot.char, dot.x + 4, dot.y - 4);
          }
        } else {
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
          ctx.fill();
        }
      }

      if (mouse.isActive) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();

        const pulseRadius = (time * 45) % mouse.radius;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(16, 185, 129, ${0.15 * (1 - pulseRadius / mouse.radius)})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.9 }}
    />
  );
};

// --- Floating Frosted-Glass Navigation Bar ---
const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Projects', href: '#projects' },
    { name: 'Skills', href: '#skills' },
    { name: 'Campus Life', href: '#campus-life' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-4 transition-all duration-300">
      <nav
        className={`max-w-6xl mx-auto rounded-2xl md:rounded-full px-5 py-3.5 transition-all duration-300 glass-nav flex items-center justify-between ${
          isScrolled ? 'shadow-2xl shadow-emerald-950/40 border-emerald-500/30' : ''
        }`}
      >
        <a href="#" className="flex items-center gap-2.5 group focus:outline-none">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400 group-hover:bg-emerald-500/20 transition-all duration-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
            <span className="font-mono text-sm font-bold">&gt;_</span>
          </div>
          <div className="flex items-baseline">
            <span className="font-extrabold text-lg tracking-wider text-white group-hover:text-emerald-300 transition-colors">
              GAGAN
            </span>
            <span className="font-black text-lg tracking-wider text-emerald-400 ml-1">
              M
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime-400 ml-1.5 animate-pulse shadow-[0_0_8px_#a3e635]"></span>
          </div>
        </a>

        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="px-4 py-1.5 text-sm font-medium text-gray-300 hover:text-white rounded-full transition-all duration-200 relative group"
            >
              <span className="relative z-10 group-hover:text-emerald-400 transition-colors">
                {link.name}
              </span>
              <span className="absolute inset-0 rounded-full bg-emerald-500/0 group-hover:bg-emerald-500/10 border border-transparent group-hover:border-emerald-500/30 transition-all duration-300 transform scale-95 group-hover:scale-100"></span>
            </a>
          ))}
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-xs font-mono text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>v1.0 // Online</span>
          </div>
        </div>

        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-300 hover:text-emerald-400 hover:bg-emerald-500/10 focus:outline-none transition-colors border border-emerald-500/20"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden max-w-6xl mx-auto mt-2 p-4 rounded-2xl glass-nav border-emerald-500/30 flex flex-col gap-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-2.5 text-base font-medium text-gray-200 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl transition-all border border-transparent hover:border-emerald-500/20"
            >
              {link.name}
            </a>
          ))}
          <div className="pt-2 border-t border-emerald-500/20 flex justify-between items-center px-4 py-2 text-xs font-mono text-emerald-400">
            <span>🟢 1st Year AI/ML</span>
            <span>Open for Internships</span>
          </div>
        </div>
      )}
    </header>
  );
};

// --- Hero Intro Screen Component ---
const Hero = () => {
  return (
    <section className="relative z-10 flex flex-col justify-center items-center text-center px-4 sm:px-6 pt-32 pb-16 max-w-5xl mx-auto w-full">
      <div className="ambient-glow w-96 h-96 bg-emerald-600/15 -top-10 left-1/2 -translate-x-1/2 pointer-events-none"></div>
      <div className="ambient-glow w-64 h-64 bg-lime-500/10 top-1/3 left-1/4 pointer-events-none"></div>

      <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-pill mb-8 hover:border-emerald-400/50 transition-all duration-300 cursor-default group">
        <span className="radar-beacon flex h-2.5 w-2.5 relative">
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_10px_#10b981]"></span>
        </span>
        <span className="font-mono text-xs sm:text-sm font-medium tracking-wide text-emerald-300 group-hover:text-emerald-200 transition-colors">
          🟢 Student Developer // Open for Internships
        </span>
        <span className="text-lime-400 font-mono text-xs hidden sm:inline">⚡</span>
      </div>

      <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15] mb-6">
        Hey, I am{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-lime-300 neon-text-glow">
          GAGAN M
        </span>
        <span className="block mt-2 text-3xl sm:text-5xl md:text-6xl font-bold text-gray-200">
          — Building the Future of Tech.
        </span>
      </h1>

      <p className="text-base sm:text-lg md:text-xl text-gray-300/90 max-w-2xl mx-auto leading-relaxed font-normal mb-8">
        <span className="text-emerald-400 font-semibold">1st year AI/ML</span> passionate about{' '}
        <span className="text-white font-medium border-b border-emerald-500/40">web development</span>,{' '}
        <span className="text-white font-medium border-b border-emerald-500/40">AI</span>, and building{' '}
        <span className="text-lime-300 font-medium">real-world projects</span>.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-10">
        <a
          href="#projects"
          className="btn-emerald-glow text-gray-950 font-bold px-8 py-4 rounded-xl text-base flex items-center justify-center gap-2.5 w-full sm:w-auto group cursor-pointer"
        >
          <span>View My Projects</span>
          <svg
            className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>

        <a
          href="#resume"
          className="btn-outline-glow text-emerald-300 font-semibold px-8 py-4 rounded-xl text-base flex items-center justify-center gap-2.5 w-full sm:w-auto cursor-pointer"
        >
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>Download Resume / CV</span>
        </a>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono text-gray-400 max-w-xl">
        <span className="px-3 py-1 rounded-md bg-[#161b22] border border-emerald-500/20 text-emerald-400/90">
          #Python
        </span>
        <span className="px-3 py-1 rounded-md bg-[#161b22] border border-emerald-500/20 text-emerald-400/90">
          #MachineLearning
        </span>
        <span className="px-3 py-1 rounded-md bg-[#161b22] border border-emerald-500/20 text-emerald-400/90">
          #React.js
        </span>
        <span className="px-3 py-1 rounded-md bg-[#161b22] border border-emerald-500/20 text-emerald-400/90">
          #TailwindCSS
        </span>
        <span className="px-3 py-1 rounded-md bg-[#161b22] border border-lime-400/30 text-lime-400/90">
          #NextGenTech
        </span>
      </div>
    </section>
  );
};

// --- 3D Tilt Project Card Component with Physics ---
const ProjectCard = ({ project }) => {
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({
    rx: 0,
    ry: 0,
    s: 1,
    shineX: 50,
    shineY: 50,
    opacity: 0,
    isHovered: false,
  });

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -9;
    const rotateY = ((x - centerX) / centerX) * 9;

    setTilt({
      rx: rotateX,
      ry: rotateY,
      s: 1.015,
      shineX: (x / rect.width) * 100,
      shineY: (y / rect.height) * 100,
      opacity: 1,
      isHovered: true,
    });
  };

  const handleMouseLeave = () => {
    setTilt({
      rx: 0,
      ry: 0,
      s: 1,
      shineX: 50,
      shineY: 50,
      opacity: 0,
      isHovered: false,
    });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-2xl"
      style={{ perspective: '1000px' }}
    >
      <div
        className="project-card-glass relative rounded-2xl p-6 sm:p-7 flex flex-col justify-between h-full overflow-hidden"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(${
            tilt.isHovered ? -6 : 0
          }px) scale(${tilt.s})`,
          transition: tilt.isHovered
            ? 'transform 0.08s ease-out, box-shadow 0.25s ease'
            : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300 z-10"
          style={{
            background: `radial-gradient(circle at ${tilt.shineX}% ${tilt.shineY}%, rgba(16, 185, 129, 0.22) 0%, rgba(204, 255, 0, 0.07) 25%, transparent 65%)`,
            opacity: tilt.opacity,
          }}
        />

        <div className="flex items-center justify-between mb-4 relative z-20">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wide bg-emerald-950/50 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {project.category}
          </span>
          <span className="font-mono text-xs text-gray-500 tracking-wider">
            0{project.id} // SYS
          </span>
        </div>

        <div className="mb-4 relative z-20">
          <div className="w-12 h-12 rounded-xl bg-[#0d1117] border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-colors">
            {project.icon === 'calendar' && (
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
            {project.icon === 'camera' && (
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            {project.icon === 'document' && (
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            )}
          </div>
        </div>

        <div className="flex-1 mb-5 relative z-20">
          <h3 className="text-xl font-bold text-white mb-2.5 flex items-center gap-2">
            <span>{project.title}</span>
          </h3>
          <p className="text-sm text-gray-300/85 leading-relaxed">
            {project.description}
          </p>
        </div>

        <div className="mb-6 relative z-20">
          <div className="flex flex-wrap gap-1.5">
            {project.tech.map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-[#0d1117]/80 text-emerald-300 border border-emerald-500/25 shadow-sm"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-emerald-500/15 flex items-center gap-3 relative z-20">
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 text-center py-2.5 px-3 rounded-xl bg-emerald-500 text-gray-950 font-bold text-xs tracking-wider uppercase hover:bg-emerald-400 transition-all duration-200 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_22px_rgba(16,185,129,0.5)] flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Live Demo</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 text-center py-2.5 px-3 rounded-xl border border-emerald-500/30 hover:border-emerald-400 bg-emerald-950/20 text-gray-200 hover:text-white font-medium text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-1.5 hover:bg-emerald-500/10 cursor-pointer"
          >
            <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </div>
  );
};

// --- Featured Projects Showcase Section ---
const FeaturedProjects = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filterOptions = ['All', 'Web Apps', 'AI / ML', 'Mini-Projects'];

  const projectsData = [
    {
      id: 1,
      title: 'Campus Event Finder',
      category: 'Web Apps',
      categories: ['All', 'Web Apps'],
      icon: 'calendar',
      description: 'Centralizes university club hackathons, tech workshops, and fests into an interactive discovery feed with automated deadline alerts. Solves fragmented WhatsApp announcements with synced calendar reminders and one-click RSVP.',
      tech: ['React', 'Firebase', 'Tailwind CSS', 'REST API'],
      liveUrl: '#live-campus-finder',
      githubUrl: 'https://github.com/gagan-m/campus-event-finder',
    },
    {
      id: 2,
      title: 'Smart Attendance Tracker',
      category: 'AI / ML',
      categories: ['All', 'AI / ML'],
      icon: 'camera',
      description: 'Automates classroom roll call using computer vision and deep face recognition models with 98.4% validation accuracy. Drastically reduces manual attendance time and exports instant CSV audit logs directly for university faculty.',
      tech: ['Python', 'OpenCV', 'PyTorch', 'FastAPI'],
      liveUrl: '#live-smart-attendance',
      githubUrl: 'https://github.com/gagan-m/smart-attendance-tracker',
    },
    {
      id: 3,
      title: 'Student Notes Marketplace',
      category: 'Web Apps',
      categories: ['All', 'Web Apps', 'Mini-Projects'],
      icon: 'document',
      description: 'A peer-to-peer academic exchange where university students upload, review, and curate subject summaries and exam revision guides. Integrates full-text search, in-browser PDF previews, and student reputation badges.',
      tech: ['Tailwind', 'Node.js', 'Express', 'MongoDB'],
      liveUrl: '#live-notes-marketplace',
      githubUrl: 'https://github.com/gagan-m/student-notes-marketplace',
    },
  ];

  const filteredProjects = projectsData.filter((project) =>
    project.categories.includes(activeFilter)
  );

  return (
    <section id="projects" className="relative z-10 px-4 sm:px-6 py-20 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
            <span className="font-mono text-xs text-emerald-400 font-semibold tracking-widest uppercase">
              Featured Projects // 01
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Crafted for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-300">
              Real Impact.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-400 max-w-xl mt-2">
            Explore a curated selection of full-stack web applications, machine learning tools, and engineering experiments.
          </p>
        </div>

        {/* Filter Pill Row */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#161b22]/70 border border-emerald-500/20 backdrop-blur-md">
          {filterOptions.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-gray-950 font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3-Column Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-xs sm:text-sm font-mono text-gray-400">
          Want to inspect more experiments?{' '}
          <a
            href="https://github.com/gagan-m"
            target="_blank"
            rel="noreferrer"
            className="text-emerald-400 hover:text-lime-300 transition-colors underline underline-offset-4 font-semibold"
          >
            Browse all repositories on GitHub →
          </a>
        </p>
      </div>
    </section>
  );
};

// --- Interactive Skill Pill with Comfort Tooltip ---
const SkillPill = ({ name, icon, level }) => {
  const levelConfigs = {
    'Proficient': {
      dot: 'bg-emerald-400 shadow-[0_0_6px_#10b981]',
      text: 'text-emerald-300',
    },
    'Familiar': {
      dot: 'bg-lime-400 shadow-[0_0_6px_#a3e635]',
      text: 'text-lime-300',
    },
    'Currently Learning': {
      dot: 'bg-teal-300 animate-pulse shadow-[0_0_6px_#00ff9d]',
      text: 'text-teal-200',
    },
  };

  const config = levelConfigs[level] || levelConfigs['Proficient'];

  return (
    <div className="relative group/skill flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#0d1117]/85 border border-emerald-500/20 hover:border-emerald-400/80 hover:bg-[#161b22] hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] cursor-pointer select-none">
      <span className="w-5 h-5 flex items-center justify-center text-emerald-400 flex-shrink-0">
        {icon}
      </span>
      <span className="text-xs sm:text-sm font-medium text-gray-200 group-hover/skill:text-white transition-colors">
        {name}
      </span>

      <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/skill:opacity-100 pointer-events-none transform translate-y-1 group-hover/skill:translate-y-0 transition-all duration-200 z-30 flex flex-col items-center whitespace-nowrap">
        <div className="px-2.5 py-1 rounded-md bg-[#161b22] border border-emerald-500/40 text-[11px] font-mono tracking-wide shadow-[0_4px_12px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
          <span className={config.text}>{level}</span>
        </div>
        <div className="w-1.5 h-1.5 rotate-45 bg-[#161b22] border-r border-b border-emerald-500/40 -mt-1"></div>
      </div>
    </div>
  );
};

// --- Tech Stack & Skills Section Component ---
const TechStack = () => {
  const icons = {
    cpp: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 2L2 7v10l10 5 10-5V7L12 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 9a3 3 0 00-3 3 3 3 0 003 3m5-3h4m-2-2v4" />
      </svg>
    ),
    python: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.914 0C5.825 0 6.2 2.656 6.2 2.656l.006 2.752h5.808v.825H3.87S0 5.787 0 11.916c0 6.13 3.398 5.92 3.398 5.92h2.027v-2.846s-.11-3.398 3.344-3.398h5.753s3.236.052 3.236-3.128V3.128S18.236 0 11.914 0zm-3.05 1.834a1.01 1.01 0 11.002 2.02 1.01 1.01 0 01-.002-2.02zm3.222 22.166c6.089 0 5.714-2.656 5.714-2.656l-.006-2.752H11.986v-.825h8.144s3.87.446 3.87-5.683c0-6.13-3.398-5.92-3.398-5.92h-2.027v2.846s.11 3.398-3.344 3.398H9.477s-3.236-.052-3.236 3.128v6.344s-.476 3.128 5.844 3.128zm3.05-1.834a1.01 1.01 0 11-.002-2.02 1.01 1.01 0 01.002 2.02z" />
      </svg>
    ),
    js: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3h18v18H3V3zm10.72 13.91c.71 1.15 1.85 1.76 3.21 1.76 1.34 0 2.22-.67 2.22-1.63 0-1.12-.9-1.54-2.45-2.19-2.22-.92-3.69-1.92-3.69-4.14 0-2.3 1.74-3.96 4.43-3.96 1.94 0 3.33.67 4.19 2.27l-2.24 1.44c-.45-.81-1.07-1.17-1.95-1.17-.89 0-1.52.54-1.52 1.28 0 .89.65 1.28 2.09 1.87 2.56 1.05 4.09 2.07 4.09 4.47 0 2.65-2.07 4.16-5.04 4.16-2.74 0-4.49-1.3-5.26-2.86l2.02-1.29zM6.16 16.97l2.25-1.35c.49.88 1.01 1.44 1.98 1.44.83 0 1.49-.33 1.49-1.59V6.88H14.7v8.59c0 2.68-1.56 3.88-3.94 3.88-2.09 0-3.56-1.07-4.6-2.38z" />
      </svg>
    ),
    java: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 8h1a4 4 0 010 8h-1M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" />
      </svg>
    ),
    ts: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3h18v18H3V3zm7.74 8.27H8.56V18H6.78v-6.73H4.6V9.75h6.14v1.52zm3.38 6.55c.78.61 1.81.91 2.94.91 2.22 0 3.73-1.14 3.73-2.92 0-1.74-1.11-2.47-2.94-3.12-1.42-.51-1.94-.95-1.94-1.72 0-.74.65-1.28 1.76-1.28.98 0 1.8.36 2.45.92l1.09-1.35c-.93-.82-2.14-1.23-3.54-1.23-2.22 0-3.6 1.25-3.6 2.89 0 1.63 1.07 2.44 2.8 3.06 1.49.53 2.08.97 2.08 1.81 0 .84-.79 1.39-2.02 1.39-1.17 0-2.2-.47-2.97-1.15l-1.03 1.39z" />
      </svg>
    ),
    sql: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <ellipse cx="12" cy="5" rx="9" ry="3" strokeWidth="1.8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    react: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <ellipse cx="12" cy="12" rx="10" ry="4.5" strokeWidth="1.8" transform="rotate(0 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4.5" strokeWidth="1.8" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4.5" strokeWidth="1.8" transform="rotate(120 12 12)" />
        <circle cx="12" cy="12" r="1.8" fill="currentColor" />
      </svg>
    ),
    tailwind: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.336 6.182 14.975 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.336 13.382 8.975 12 6.001 12z" />
      </svg>
    ),
    node: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 2l9 5v10l-9 5-9-5V7l9-5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 22V12m0 0L3 7m9 5l9-5" />
      </svg>
    ),
    git: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="6" cy="6" r="3" strokeWidth="1.8" />
        <circle cx="18" cy="18" r="3" strokeWidth="1.8" />
        <circle cx="6" cy="18" r="3" strokeWidth="1.8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 9v6M9 6h6a3 3 0 013 3v6" />
      </svg>
    ),
    pytorch: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 2c2 3 5 4.5 5 7.5a5 5 0 11-10 0c0-3 3-4.5 5-7.5z" />
        <circle cx="15.5" cy="5.5" r="1.5" fill="currentColor" />
      </svg>
    ),
    fastapi: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    dsa: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="5" r="2.5" strokeWidth="1.8" />
        <circle cx="6" cy="19" r="2.5" strokeWidth="1.8" />
        <circle cx="18" cy="19" r="2.5" strokeWidth="1.8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10.5 7.5L7.5 16.5M13.5 7.5L16.5 16.5" />
      </svg>
    ),
    oop: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
      </svg>
    ),
    dbms: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 6h16M4 12h16M4 18h16M7 6v12M17 6v12" />
      </svg>
    ),
    os: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="1.8" />
        <rect x="9" y="9" width="6" height="6" strokeWidth="1.8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
      </svg>
    ),
    networks: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
      </svg>
    ),
    system: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="1.8" />
        <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="1.8" />
        <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="1.8" />
        <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="1.8" />
      </svg>
    ),
  };

  const categories = [
    {
      id: 1,
      title: 'Languages',
      tag: 'SYNTAX & RUNTIMES',
      skills: [
        { name: 'C++', icon: icons.cpp, level: 'Proficient' },
        { name: 'Python', icon: icons.python, level: 'Proficient' },
        { name: 'JavaScript', icon: icons.js, level: 'Proficient' },
        { name: 'Java', icon: icons.java, level: 'Familiar' },
        { name: 'TypeScript', icon: icons.ts, level: 'Currently Learning' },
        { name: 'SQL', icon: icons.sql, level: 'Familiar' },
      ],
    },
    {
      id: 2,
      title: 'Frameworks & Tools',
      tag: 'LIBS & ECOSYSTEM',
      skills: [
        { name: 'React.js', icon: icons.react, level: 'Proficient' },
        { name: 'Tailwind CSS', icon: icons.tailwind, level: 'Proficient' },
        { name: 'Node.js', icon: icons.node, level: 'Familiar' },
        { name: 'Git & GitHub', icon: icons.git, level: 'Proficient' },
        { name: 'PyTorch', icon: icons.pytorch, level: 'Currently Learning' },
        { name: 'FastAPI', icon: icons.fastapi, level: 'Familiar' },
      ],
    },
    {
      id: 3,
      title: 'Core CS Concepts',
      tag: 'FOUNDATIONS & ARCH',
      skills: [
        { name: 'Data Structures (DSA)', icon: icons.dsa, level: 'Proficient' },
        { name: 'OOP Principles', icon: icons.oop, level: 'Proficient' },
        { name: 'DBMS & RDBMS', icon: icons.dbms, level: 'Familiar' },
        { name: 'Operating Systems', icon: icons.os, level: 'Familiar' },
        { name: 'Computer Networks', icon: icons.networks, level: 'Currently Learning' },
        { name: 'System Design Basics', icon: icons.system, level: 'Currently Learning' },
      ],
    },
  ];

  return (
    <section id="skills" className="relative z-10 px-4 sm:px-6 py-20 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
            <span className="font-mono text-xs text-emerald-400 font-semibold tracking-widest uppercase">
              Technical Arsenal // 02
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Tech Stack &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-lime-300">
              Skills Matrix.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-400 max-w-xl mt-2">
            Languages, frameworks, and fundamental computer science principles I build with daily.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 px-4 py-2 rounded-2xl bg-[#161b22]/70 border border-emerald-500/20 backdrop-blur-md text-xs font-mono">
          <span className="text-gray-400 text-[11px] hidden sm:inline">Comfort:</span>
          <span className="inline-flex items-center gap-1.5 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]"></span>
            Proficient
          </span>
          <span className="text-gray-600">•</span>
          <span className="inline-flex items-center gap-1.5 text-lime-300">
            <span className="w-2 h-2 rounded-full bg-lime-400 shadow-[0_0_6px_#a3e635]"></span>
            Familiar
          </span>
          <span className="text-gray-600">•</span>
          <span className="inline-flex items-center gap-1.5 text-teal-200">
            <span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse shadow-[0_0_6px_#00ff9d]"></span>
            Learning
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="project-card-glass rounded-2xl p-6 sm:p-7 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-emerald-500/15">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono text-xs font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    0{cat.id}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">{cat.title}</h3>
                    <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block">
                      {cat.tag}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs text-emerald-400/80 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {cat.skills.length} skills
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {cat.skills.map((skill) => (
                  <SkillPill
                    key={skill.name}
                    name={skill.name}
                    icon={skill.icon}
                    level={skill.level}
                  />
                ))}
              </div>
            </div>

            <div className="mt-8 pt-3 border-t border-emerald-500/10 flex items-center justify-between text-[11px] font-mono text-gray-500">
              <span>Hover for comfort level</span>
              <span className="text-emerald-400">⚡ active</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// --- Education & Campus Journey Component ---
const EducationJourney = () => {
  const milestones = [
    {
      year: '2026',
      badge: 'CURRENT FOCUS',
      title: '1st Year B.Tech & Hackathon Finalist',
      description: 'Pursuing B.Tech in Artificial Intelligence & Machine Learning; finalist at State-Level AI Hackathon engineering automated computer vision solutions.',
      isCurrent: true,
    },
    {
      year: '2025',
      badge: 'CAMPUS LEADERSHIP',
      title: 'Core Technical Club Member / Web Lead',
      description: 'Orchestrated frontend architecture for the university tech fest portal and led hands-on development workshops for 30+ junior students.',
      isCurrent: false,
    },
    {
      year: '2024',
      badge: 'GENESIS & DEGREE START',
      title: 'Began Degree & Built First Web App',
      description: 'Commenced undergraduate engineering journey with academic distinction; designed and deployed first end-to-end full-stack web applications.',
      isCurrent: false,
    },
  ];

  const achievements = [
    {
      icon: '🏆',
      title: '1st Place Winner',
      event: 'University AI Hackathon',
      subtext: 'Best Web & AI Prototype',
    },
    {
      icon: '⚡',
      title: '150+ Solved',
      event: 'LeetCode & Problem Solving',
      subtext: 'DSA Consistency & Logic',
    },
    {
      icon: '👥',
      title: 'Tech Club Organizer',
      event: 'Campus Web Chapter Lead',
      subtext: '300+ Workshop Attendees',
    },
    {
      icon: '📜',
      title: 'Full-Stack Certified',
      event: 'Modern Web Architecture',
      subtext: 'React, Node.js & Cloud Tools',
    },
  ];

  return (
    <section id="campus-life" className="relative z-10 px-4 sm:px-6 py-20 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
            <span className="font-mono text-xs text-emerald-400 font-semibold tracking-widest uppercase">
              Academic Milestones // 03
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Education &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-lime-300">
              Campus Journey.
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-400 max-w-xl mt-2">
            Timeline of academic growth, competitive hackathons, and technical student leadership.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-[#161b22]/70 border border-emerald-500/20 backdrop-blur-md text-xs font-mono text-emerald-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>1st Year Undergrad • Class of 2028</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Vertical Illuminated Timeline */}
        <div className="lg:col-span-7 relative">
          <div className="absolute left-[19px] sm:left-[23px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>

          <div className="space-y-6 sm:space-y-8">
            {milestones.map((m) => (
              <div key={m.year} className="relative pl-12 sm:pl-16 group">
                <div className="absolute left-[13px] sm:left-[17px] top-4 w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#00ff9d] border-2 border-[#0d1117] z-20 flex items-center justify-center">
                  {m.isCurrent && (
                    <span className="absolute -inset-1 rounded-full bg-emerald-400/60 animate-ping"></span>
                  )}
                </div>

                <div className="project-card-glass rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:border-emerald-500/45 hover:translate-x-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <span className="px-3 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold tracking-wider">
                      {m.year}
                    </span>
                    <span className="font-mono text-[10px] tracking-widest text-lime-400/90 uppercase bg-[#0d1117] px-2.5 py-0.5 rounded-full border border-lime-400/20">
                      {m.badge}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                    {m.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-300/85 leading-relaxed">
                    {m.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 5 Columns: Compact 2x2 Achievement Callouts + Degree Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="project-card-glass rounded-2xl p-6 sm:p-7">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-emerald-500/15">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 text-lg">⚡</span>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Key Accomplishments
                </h3>
              </div>
              <span className="text-xs font-mono text-gray-500">HONORS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {achievements.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#0d1117]/85 border border-emerald-500/20 hover:border-emerald-400/80 hover:bg-[#161b22] hover:-translate-y-1 transition-all duration-200 shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] flex flex-col justify-between group cursor-default"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-[10px] font-mono text-emerald-400/90 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                      VERIFIED
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-white group-hover:text-emerald-300 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs font-mono text-gray-400 mt-1">
                      {item.event}
                    </p>
                    <span className="text-[11px] text-gray-500 mt-2 block border-t border-emerald-500/10 pt-2">
                      {item.subtext}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="project-card-glass rounded-2xl p-6 border-emerald-500/30 bg-gradient-to-br from-[#161b22]/90 to-[#0d1117]/90 relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-2xl flex-shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                🎓
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold block mb-1">
                  Undergraduate Degree
                </span>
                <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                  B.Tech in Artificial Intelligence & Machine Learning
                </h4>
                <p className="text-xs text-gray-300/80 mt-1.5 leading-relaxed">
                  Rigorous coursework in computational intelligence, algorithmic optimization, linear algebra, and software architecture.
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-emerald-500/15 text-xs font-mono text-gray-400">
                  <span className="text-emerald-300">● CGPA: 9.2 / 10.0</span>
                  <span className="text-lime-300">● Active Researcher</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// --- Footer ---
const FooterBar = () => {
  return (
    <footer className="relative z-10 py-8 text-center text-xs font-mono text-gray-500 border-t border-emerald-500/10">
      <p>© 2026 Gagan M • Built with React & Tailwind CSS • Cyber-Emerald Theme</p>
    </footer>
  );
};

// --- Main App Root ---
export default function App() {
  return (
    <div className="relative min-h-screen bg-[#0d1117] text-gray-100 flex flex-col justify-between overflow-hidden">
      <MatrixCanvas />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <FeaturedProjects />
        <TechStack />
        <EducationJourney />
      </main>
      <FooterBar />
    </div>
  );
}
