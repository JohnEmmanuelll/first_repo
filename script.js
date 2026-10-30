// Kung naka-reduce motion ang user, huwag nang mag-animate
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Moving background (particles + lines) ----------
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d');
let w, h, dots = [];
const mouse = { x: -999, y: -999 };

function resize() {
  w = canvas.width = innerWidth;
  h = canvas.height = innerHeight;
  // dami ng dots depende sa laki ng screen
  const count = Math.min(110, Math.floor((w * h) / 20000));
  dots = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
  }));
}

function draw() {
  ctx.clearRect(0, 0, w, h);
  for (const d of dots) {
    d.x += d.vx; d.y += d.vy;
    // bounce sa gilid
    if (d.x < 0 || d.x > w) d.vx *= -1;
    if (d.y < 0 || d.y > h) d.vy *= -1;
    // medyo lumalayo sa mouse
    const dx = d.x - mouse.x, dy = d.y - mouse.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 120) { d.x += dx / dist * 1.2; d.y += dy / dist * 1.2; }
    ctx.fillStyle = 'rgba(220,220,220,.6)';
    ctx.beginPath(); ctx.arc(d.x, d.y, 2, 0, Math.PI * 2); ctx.fill();
  }
  // guhit sa pagitan ng magkalapit na dots
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const d = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
      if (d < 130) {
        ctx.strokeStyle = `rgba(180,180,180,${(1 - d / 130) * 0.3})`;
        ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y); ctx.stroke();
      }
    }
  }
  if (!reduceMotion) requestAnimationFrame(draw); // static na lang kung reduce motion
}

resize();
addEventListener('resize', resize);
addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
draw();

// ---------- Glow na sumusunod sa mouse (smooth) ----------
const glow = document.getElementById('glow');
let gx = innerWidth / 2, gy = innerHeight / 2;
if (!reduceMotion) {
  const follow = () => {
    gx += (mouse.x - gx) * 0.08;
    gy += (mouse.y - gy) * 0.08;
    glow.style.transform = `translate(${gx}px, ${gy}px)`;
    requestAnimationFrame(follow);
  };
  follow();
}

// ---------- Hatiin ang malaking pangalan sa letters para may stagger animation ----------
let idx = 0;
document.querySelectorAll('.big span').forEach(line => {
  const text = line.textContent;
  line.textContent = '';
  [...text].forEach(ch => {
    const s = document.createElement('span');
    s.className = 'ch';
    s.style.setProperty('--i', idx++);
    s.textContent = ch;
    line.appendChild(s);
  });
});

// ---------- Typing effect sa job title (isang beses lang) ----------
const roleEl = document.getElementById('role');
const full = roleEl.textContent;
if (!reduceMotion) {
  roleEl.textContent = '';
  let n = 0;
  const type = () => {
    roleEl.textContent = full.slice(0, ++n);
    if (n < full.length) setTimeout(type, 55);
  };
  setTimeout(type, 1500); // hintay muna matapos ang intro
}

// ---------- Parallax: sumusunod nang konti ang photo at star sa mouse ----------
const heroPhoto = document.querySelector('.hero-photo');
const star = document.querySelector('.star');
if (!reduceMotion) {
  addEventListener('mousemove', e => {
    const x = (e.clientX / innerWidth - 0.5) * 2;
    const y = (e.clientY / innerHeight - 0.5) * 2;
    heroPhoto.style.transform = `translate(${x * 8}px, ${y * 8}px)`;
    star.style.translate = `${x * -14}px ${y * -14}px`;
  });
}

// ---------- Reveal on scroll ----------
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ---------- Active nav link habang nag-scroll ----------
const links = document.querySelectorAll('nav a');
const sections = [...links].map(a => document.querySelector(a.getAttribute('href')));
const navObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => s && navObs.observe(s));

// ---------- Scroll progress + nav border ----------
const bar = document.getElementById('progress');
const nav = document.querySelector('.nav');
addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (scrollY / max * 100) + '%';
  nav.classList.toggle('scrolled', scrollY > 20);
}, { passive: true });

// ---------- Spotlight sa card kapag hinover ----------
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const b = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - b.left) + 'px');
    card.style.setProperty('--my', (e.clientY - b.top) + 'px');
  });
});

// ---------- Mobile menu ----------
const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('links');
menuBtn.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
});
menu.addEventListener('click', () => { menu.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false); });

document.getElementById('year').textContent = new Date().getFullYear();
