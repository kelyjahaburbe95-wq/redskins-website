// ── THREE.JS 3D BACKGROUND ──
const canvas = document.getElementById('hero-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 5);

// ── PARTICULES ──
const count = 1800;
const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);
const sizes = new Float32Array(count);

for (let i = 0; i < count; i++) {
  const i3 = i * 3;
  positions[i3]     = (Math.random() - 0.5) * 24;
  positions[i3 + 1] = (Math.random() - 0.5) * 14;
  positions[i3 + 2] = (Math.random() - 0.5) * 8;

  const isRed = Math.random() > 0.75;
  if (isRed) {
    colors[i3] = 0.75; colors[i3 + 1] = 0; colors[i3 + 2] = 0.1;
  } else {
    const g = 0.2 + Math.random() * 0.3;
    colors[i3] = g; colors[i3 + 1] = g; colors[i3 + 2] = g;
  }
  sizes[i] = Math.random() * 3 + 0.5;
}

const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

const mat = new THREE.PointsMaterial({
  size: 0.04, vertexColors: true,
  transparent: true, opacity: 0.7, sizeAttenuation: true,
});

const particles = new THREE.Points(geo, mat);
scene.add(particles);

// ── FORMES GÉOMÉTRIQUES FLOTTANTES ──
const shapes = [];
const shapeMat = new THREE.MeshStandardMaterial({
  color: 0xC0001A, metalness: 0.9, roughness: 0.1,
  transparent: true, opacity: 0.15, wireframe: true
});

const torus = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.04, 12, 80), shapeMat.clone());
torus.position.set(3.5, 0.5, -2);
scene.add(torus);
shapes.push({ mesh: torus, rx: 0.003, ry: 0.005 });

const octa = new THREE.Mesh(new THREE.OctahedronGeometry(0.8), shapeMat.clone());
octa.position.set(-3.8, -1, -1.5);
scene.add(octa);
shapes.push({ mesh: octa, rx: 0.004, ry: 0.003 });

const icosa = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6), shapeMat.clone());
icosa.position.set(2, -2, -1);
scene.add(icosa);
shapes.push({ mesh: icosa, rx: 0.006, ry: 0.004 });

// ── LUMIÈRES ──
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const redLight = new THREE.PointLight(0xC0001A, 3, 15);
redLight.position.set(2, 2, 2);
scene.add(redLight);
const whiteLight = new THREE.PointLight(0xffffff, 1, 10);
whiteLight.position.set(-3, -1, 3);
scene.add(whiteLight);

// ── MOUSE PARALLAX ──
let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
});

// ── ANIMATION LOOP ──
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  targetX += (mouseX - targetX) * 0.04;
  targetY += (mouseY - targetY) * 0.04;

  particles.rotation.y = t * 0.04 + targetX * 0.1;
  particles.rotation.x = t * 0.02 + targetY * 0.06;

  camera.position.x = targetX * 0.4;
  camera.position.y = targetY * 0.2;
  camera.lookAt(0, 0, 0);

  shapes.forEach(({ mesh, rx, ry }, i) => {
    mesh.rotation.x += rx;
    mesh.rotation.y += ry;
    mesh.position.y += Math.sin(t * 0.5 + i) * 0.003;
  });

  redLight.intensity = 2.5 + Math.sin(t * 1.5) * 0.8;
  renderer.render(scene, camera);
}
animate();

// ── RESIZE ──
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ── CUSTOM CURSOR ──  ← ICI C'EST CE QUI MANQUAIT
const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
const cursorEl = document.getElementById('cursor');
let cx = 0, cy = 0, ringX = 0, ringY = 0;
let cursorVisible = false;

document.addEventListener('mousemove', (e) => {
  cx = e.clientX; cy = e.clientY;

  if (!cursorVisible) {
    cursorEl.style.opacity = '1';
    ring.style.opacity = '1';
    cursorVisible = true;
  }

  dot.style.left = cx + 'px';
  dot.style.top = cy + 'px';
});

document.addEventListener('mouseleave', () => {
  cursorEl.style.opacity = '0';
  ring.style.opacity = '0';
});
document.addEventListener('mouseenter', () => {
  cursorEl.style.opacity = '1';
  ring.style.opacity = '1';
});

function animateCursor() {
  ringX += (cx - ringX) * 0.12;
  ringY += (cy - ringY) * 0.12;
  ring.style.left = ringX + 'px';
  ring.style.top = ringY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button, .card-3d, .stat').forEach(el => {
  el.addEventListener('mouseenter', () => {
    ring.style.width = '60px';
    ring.style.height = '60px';
  });
  el.addEventListener('mouseleave', () => {
    ring.style.width = '40px';
    ring.style.height = '40px';
  });
});

// ── TILT 3D SUR LES CARTES ──
document.querySelectorAll('.card-3d').forEach(card => {
  const shine = card.querySelector('.card-shine');

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx2 = rect.width / 2;
    const cy2 = rect.height / 2;
    const rotY = ((x - cx2) / cx2) * 12;
    const rotX = -((y - cy2) / cy2) * 10;

    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(10px)`;

    shine.style.setProperty('--mx', (x / rect.width * 100) + '%');
    shine.style.setProperty('--my', (y / rect.height * 100) + '%');
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    card.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
    setTimeout(() => { card.style.transition = 'transform 0.1s ease'; }, 600);
  });

  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.1s ease';
  });
});

// ── SCROLL FADE IN ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.card-3d, .stat, .featured-3d, .about').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16,1,0.3,1)';
  observer.observe(el);
});
