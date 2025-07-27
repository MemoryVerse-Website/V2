// script.js - Main Website Interactivity & Landing Page Logic

// ===============================
// Particle Background for Landing
// ===============================
function setupParticles() {
  const particleContainer = document.querySelector('.particles');
  if (!particleContainer) return;
  const colors = [
    'rgba(255, 215, 0, 0.12)',
    'rgba(118, 75, 162, 0.12)',
    'rgba(255,255,255,0.08)'
  ];
  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.width = `${14 + Math.random()*22}px`;
    p.style.height = p.style.width;
    p.style.left = `${Math.random()*100}%`;
    p.style.animationDuration = `${6 + Math.random()*6}s`;
    p.style.top = `${Math.random()*100}%`;
    particleContainer.appendChild(p);
  }
}
// For auth pages
function setupAuthParticles() {
  const particleContainer = document.querySelector('.auth-particles');
  if (!particleContainer) return;
  for (let i = 0; i < 16; i++) {
    const p = document.createElement('div');
    p.className = 'auth-particle';
    p.style.left = `${Math.random()*100}%`;
    p.style.width = `${10 + Math.random()*14}px`;
    p.style.height = p.style.width;
    p.style.animationDuration = `${7 + Math.random()*5}s`;
    particleContainer.appendChild(p);
  }
}

// ===============================
// Scroll-triggered Animations
// ===============================
function revealOnScroll() {
  const revealElems = document.querySelectorAll('.feature-card, .memory-card, .step, .section-title');
  // Intersection Observer animation
  const observer = new window.IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1;
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  revealElems.forEach(el => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(40px)';
    observer.observe(el);
  });
}

// ===============================
// Navigation Event Handling
// ===============================
function setupNavigation() {
  // Logout
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      if (window.MemoryVerseAuth) window.MemoryVerseAuth.logout();
      else if (window.location) window.location.href = 'index.html';
    });
  });
  // Navigation buttons
  document.querySelectorAll('[data-nav]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const navTarget = item.getAttribute('data-nav');
      switch (navTarget) {
        case 'login':
          window.location.href = 'login.html'; break;
        case 'signup':
          window.location.href = 'signup.html'; break;
        case 'create-memory':
          window.location.href = 'create-memory.html'; break;
        case 'home':
          window.location.href = 'index.html'; break;
        default:
          if (navTarget.endsWith('.html')) window.location.href = navTarget;
      }
    });
  });
}

// ===============================
// Flash Notification UX
// ===============================
function flashOnLandingFromAction() {
  // (E.g., after signup, login, logout)
  const urlParams = new URLSearchParams(window.location.search);
  const flash = urlParams.get('flash');
  if (flash) {
    const msg = decodeURIComponent(flash);
    if (window.MemoryVerseAuth) window.MemoryVerseAuth.showNotification(msg, 'success');
    // Remove the flash from URL for a clean reload
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

// ===============================
// Memory "Anniversary" Notification
// ===============================
function showMemoryAnniversaries() {
  if (!window.MemoryVerseAuth) return;
  const session = window.MemoryVerseAuth.getCurrentSession();
  if (!session || !session.userId) return;
  const usersData = JSON.parse(localStorage.getItem('memoryverse_users') || '[]');
  const user = usersData.find(u => u.id === session.userId);
  if (!user || !user.memories) return;
  if (!Array.isArray(user.memories)) return;
  const today = new Date();
  user.memories.forEach(memory => {
    if (!memory.date) return;
    const memDate = new Date(memory.date);
    // Match month & day (ignore year)
    if (memDate.getMonth() === today.getMonth() && memDate.getDate() === today.getDate()) {
      window.MemoryVerseAuth.showNotification(`🎉 It's the anniversary of your memory: "${memory.title || 'Untitled memory'}"!`, 'info');
    }
  });
}

// ===============================
// Accessible Keyboard Nav for Cards
// ===============================
function setupCardAccessibility() {
  // Make memory-card and feature-card keyboard focusable
  document.querySelectorAll('.memory-card, .feature-card').forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-pressed', 'false');
    card.addEventListener('focus', () => card.classList.add('focus'));
    card.addEventListener('blur', () => card.classList.remove('focus'));
    // Optional: Enter triggers click
    card.addEventListener('keyup', (e) => {
      if (e.key === "Enter" || e.key === " ") {
        card.click();
      }
    });
  });
}

// ===============================
// Set Welcome Name in Navigation (Landing)
// ===============================
function setLandingWelcome() {
  if (!window.MemoryVerseAuth) return;
  const session = window.MemoryVerseAuth.getCurrentSession();
  const welcomeText = document.getElementById('welcome-text');
  if (welcomeText && session && session.firstName) {
    welcomeText.textContent = `Welcome, ${session.firstName}`;
  }
}

// ===============================
// Optional: Dark/Light Mode Toggler
// ===============================
function setupThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (!toggleBtn) return;
  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('darkmode');
    // Save to localStorage
    localStorage.setItem('memoryverse_theme', document.body.classList.contains('darkmode') ? 'dark' : 'light');
  });
  // On load, apply saved mode
  const init = localStorage.getItem('memoryverse_theme');
  if (init === 'dark') document.body.classList.add('darkmode');
}

// ===============================
// Startup
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  setupParticles();
  setupAuthParticles();
  revealOnScroll();
  setupNavigation();
  setupCardAccessibility();
  flashOnLandingFromAction();
  setLandingWelcome();

  // If user is logged in and has memories, check for anniversary
  if ((window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) &&
    window.MemoryVerseAuth) {
    showMemoryAnniversaries();
  }

  setupThemeToggle(); // optional, only works if theme toggle btn is in HTML
  // Responsive burger nav (if you add hamburger for mobile)
  const burger = document.getElementById('burger-menu');
  const navLinks = document.querySelector('.nav-links');
  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }
});

