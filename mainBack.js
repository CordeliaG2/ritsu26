import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

/* ==========================
   ESTADOS
========================== */
const STATES = {
  INTRO: "intro",
  ENTRADA: "entrada",
  EXPLORACION: "exploracion",
};

let currentState = STATES.INTRO;

/* ==========================
   CONFIG
========================== */
const CONFIG = {
  galaxy: {
    count: 500000,
    radius: 7,
    branches: 10,
    spin: 0.30,
    size: 0.015,
    insideColor: "#ffffff",
    middleColor: "#87ceeb",
    outsideColor: "#4a9eff",
    randomness: 1.0,
    randomnessPower: 10000000,
    verticalSpread: 5.0,
  },
  text: {
    canvasWidth: 2048,
    canvasHeight: 512,
    fontSize: 100,
    scale: 4,
    floatAmplitude: 0.08,
    floatSpeed: 0.0008,
  },
  photos: {
    scale: 1.5,
    floatAmplitude: 0.06,
    floatSpeed: 0.0007,
  },
  particles: {
    count: 250,
    size: 0.05,
  }
};

/* ==========================
   DATOS
========================== */
const mensajes = [
  "Gracias por todo ✨",
  "Un regalo especial 🎁",
  "Para ti 💙",
  "Recuerdos únicos 🌟",
  "Momentos especiales ⭐",
  "Siempre recordado 💫",
  "Con aprecio 🌌",  "Gracias por todo ✨",
  "Un regalo especial 🎁",
  "Para ti 💙",
  "Recuerdos únicos 🌟",
  "Momentos especiales ⭐",
  "Siempre recordado 💫",
  "Con aprecio 🌌"
];

// Reemplaza con tus rutas de fotos
const fotos = [
  './img/1.png',
  './img/2.png',
  './img/3.jpg',
  './img/4.jpg',
  './img/5.HEIC',
  './img/6.HEIC'
];

/* ==========================
   ESCENA
========================== */
const canvas = document.getElementById("galaxy");
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 8, 30);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 12;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/* ==========================
   LUCES DINÁMICAS
========================== */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0x4a9eff, 2, 25);
pointLight1.position.set(5, 5, 5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x87ceeb, 2, 25);
pointLight2.position.set(-5, -5, -5);
scene.add(pointLight2);

const pointLight3 = new THREE.PointLight(0x6eb5ff, 1.5, 20);
pointLight3.position.set(0, 8, 0);
scene.add(pointLight3);

/* ==========================
   AGUJERO NEGRO CENTRAL CON GLOW ROJO
========================== */
function crearAgujeroNegro() {
  const geometry = new THREE.SphereGeometry(0.6, 64, 64);
  const material = new THREE.MeshBasicMaterial({
    color: 0x000000,
  });
  const blackHole = new THREE.Mesh(geometry, material);
  
  // Luz roja intensa desde el agujero negro
  const redLight = new THREE.PointLight(0xff0000, 3, 5);
  redLight.position.set(0, 0, 0);
  
  const blackHoleGroup = new THREE.Group();
  blackHoleGroup.add(blackHole);
  blackHoleGroup.add(redLight);
  
  scene.add(blackHoleGroup);
  return { group: blackHoleGroup, light: redLight };
}

const blackHole = crearAgujeroNegro();

/* ==========================
   PARTÍCULAS DE ESTRELLAS FLOTANTES
========================== */
function createStarShape() {
  const shape = new THREE.Shape();
  const outerRadius = 0.5;
  const innerRadius = 0.2;
  const points = 5;
  
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    if (i === 0) {
      shape.moveTo(x, y);
    } else {
      shape.lineTo(x, y);
    }
  }
  shape.closePath();
  return shape;
}

const starParticles = [];
function createFloatingStarParticles() {
  const starShape = createStarShape();
  const extrudeSettings = { depth: 0.05, bevelEnabled: false };
  const geometry = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
  
  for (let i = 0; i < 12; i++) {
    const material = new THREE.MeshPhongMaterial({
      color: Math.random() > 0.5 ? 0x4a9eff : 0x87ceeb,
      transparent: true,
      opacity: 0.7,
      emissive: 0x4a9eff,
      emissiveIntensity: 0.4,
    });
    
    const star = new THREE.Mesh(geometry, material);
    star.scale.set(0.12, 0.12, 0.12);
    
    const angle = Math.random() * Math.PI * 2;
    const radius = 8 + Math.random() * 5;
    star.position.set(
      Math.cos(angle) * radius,
      -5 + Math.random() * 2,
      Math.sin(angle) * radius
    );
    
    star.userData = {
      baseY: star.position.y,
      speed: 0.01 + Math.random() * 0.02,
      angle: angle,
      radius: radius,
      rotSpeed: (Math.random() - 0.5) * 0.02
    };
    
    starParticles.push(star);
    scene.add(star);
  }
}

createFloatingStarParticles();

/* ==========================
   PARTÍCULAS BRILLANTES (GLITTER)
========================== */
const glitterParticles = new THREE.Group();
const glitterGeometry = new THREE.BufferGeometry();
const glitterPositions = new Float32Array(CONFIG.particles.count * 3);
const glitterColors = new Float32Array(CONFIG.particles.count * 3);

for (let i = 0; i < CONFIG.particles.count; i++) {
  const i3 = i * 3;
  const angle = Math.random() * Math.PI * 2;
  const radius = 5 + Math.random() * 10;
  
  glitterPositions[i3] = Math.cos(angle) * radius;
  glitterPositions[i3 + 1] = (Math.random() - 0.5) * 15;
  glitterPositions[i3 + 2] = Math.sin(angle) * radius;
  
  const color = new THREE.Color();
  color.setHSL(0.55 + Math.random() * 0.1, 0.8, 0.7);
  glitterColors[i3] = color.r;
  glitterColors[i3 + 1] = color.g;
  glitterColors[i3 + 2] = color.b;
}

glitterGeometry.setAttribute('position', new THREE.BufferAttribute(glitterPositions, 3));
glitterGeometry.setAttribute('color', new THREE.BufferAttribute(glitterColors, 3));

const glitterMaterial = new THREE.PointsMaterial({
  size: CONFIG.particles.size,
  vertexColors: true,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const glitter = new THREE.Points(glitterGeometry, glitterMaterial);
glitterParticles.add(glitter);
scene.add(glitterParticles);

/* ==========================
   GALAXIA CON BRAZOS MUY DEFINIDOS
========================== */
function crearGalaxia() {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(CONFIG.galaxy.count * 3);
  const colors = new Float32Array(CONFIG.galaxy.count * 3);

  const inside = new THREE.Color(CONFIG.galaxy.insideColor);
  const middle = new THREE.Color(CONFIG.galaxy.middleColor);
  const outside = new THREE.Color(CONFIG.galaxy.outsideColor);

  for (let i = 0; i < CONFIG.galaxy.count; i++) {
    const i3 = i * 3;
    
    // Radio - empieza desde el agujero negro y se expande
    const r = 0.8 + Math.pow(Math.random(), 1.5) * (CONFIG.galaxy.radius - 0.8);
    
    // Ángulo basado en las ramas - aquí está la clave
    const branchAngle = ((i % CONFIG.galaxy.branches) / CONFIG.galaxy.branches) * Math.PI * 2;
    const spinAngle = r * CONFIG.galaxy.spin;
    
    // Calcular posición exacta en el brazo
    const branchX = Math.cos(branchAngle + spinAngle) * r;
    const branchZ = Math.sin(branchAngle + spinAngle) * r;
    
    // 80% de partículas MUY pegadas al brazo
    const isOnArm = Math.random() < 0.8;
    const powerFactor = isOnArm ? 12 : 4;
    
    // Randomness extremadamente reducido
    const spread = CONFIG.galaxy.randomness * r * 0.25;
    
    const randomX = Math.pow(Math.random(), powerFactor) * 
                    (Math.random() < 0.5 ? 1 : -1) * spread;
    const randomY = Math.pow(Math.random(), powerFactor) * 
                    (Math.random() < 0.5 ? 1 : -1) * spread * 0.3;
    const randomZ = Math.pow(Math.random(), powerFactor) * 
                    (Math.random() < 0.5 ? 1 : -1) * spread;

    positions[i3] = branchX + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = branchZ + randomZ;

    // Gradiente de color: blanco -> azul cielo -> azul más oscuro
    const normalizedRadius = (r - 0.8) / (CONFIG.galaxy.radius - 0.8);
    let mixedColor;
    
    if (normalizedRadius < 0.3) {
      // Centro: blanco a azul cielo
      mixedColor = inside.clone().lerp(middle, normalizedRadius / 0.3);
    } else {
      // Exterior: azul cielo a azul oscuro
      mixedColor = middle.clone().lerp(outside, (normalizedRadius - 0.3) / 0.7);
    }
    
    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: CONFIG.galaxy.size,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);
  return points;
}

const galaxy = crearGalaxia();

/* ==========================
   TEXTOS CON ESTILO AZUL CIELO
========================== */
const textos = [];

function crearTexto(mensaje) {
  const c = document.createElement("canvas");
  c.width = CONFIG.text.canvasWidth;
  c.height = CONFIG.text.canvasHeight;

  const ctx = c.getContext("2d");
  
  // Sombra azul cielo
  ctx.shadowColor = '#87ceeb';
  ctx.shadowBlur = 30;
  
  // Texto blanco limpio
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${CONFIG.text.fontSize}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(mensaje, c.width / 2, c.height / 2);

  const texture = new THREE.CanvasTexture(c);

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, transparent: true })
  );

  const scale = Math.min(window.innerWidth / 1920, 1) * CONFIG.text.scale;
  sprite.scale.set(scale * 2, scale * 0.8, 1);

  const angle = Math.random() * Math.PI * 2;
  const radius = 2.5 + Math.random() * 2.5;
  const baseY = (Math.random() - 0.5) * 3;

  sprite.userData = { angle, radius, baseY };

  sprite.position.set(
    Math.cos(angle) * radius,
    baseY,
    Math.sin(angle) * radius
  );

  sprite.visible = false;
  textos.push(sprite);
  scene.add(sprite);
}

mensajes.forEach(crearTexto);

/* ==========================
   FOTOS PNG SIN MARCO
========================== */
const spritesFotos = [];
const loader = new THREE.TextureLoader();

fotos.forEach((ruta, idx) => {
  loader.load(
    ruta, 
    (texture) => {
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ 
          map: texture, 
          transparent: true,
          alphaTest: 0.1
        })
      );

      const angle = (idx / fotos.length) * Math.PI * 2 + Math.random() * 0.5;
      const radius = 4 + Math.random() * 2;
      const baseY = (Math.random() - 0.5) * 2;

      sprite.userData = { angle, radius, baseY };
      sprite.scale.set(CONFIG.photos.scale, CONFIG.photos.scale, 1);

      sprite.position.set(
        Math.cos(angle) * radius,
        baseY,
        Math.sin(angle) * radius
      );

      sprite.visible = false;
      spritesFotos.push(sprite);
      scene.add(sprite);
    },
    undefined,
    (error) => {
      console.warn(`No se pudo cargar la imagen: ${ruta}`, error);
    }
  );
});

/* ==========================
   INTRO ESTILO CRASH BANDICOOT 2
========================== */
function crearTextoIntro(texto, esPequeno = false) {
  const c = document.createElement("canvas");
  c.width = 2560;
  c.height = 640;

  const ctx = c.getContext("2d");
  
  // Sombra azul cielo para el intro
  ctx.shadowColor = '#87ceeb';
  ctx.shadowBlur = 50;
  
  ctx.fillStyle = '#ffffff';
  
  // Ajustar tamaño según el tipo de texto
  const fontSize = esPequeno ? 80 : 200;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(texto, c.width / 2, c.height / 2);

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(c),
      transparent: true,
      opacity: 0,
    })
  );

  // Escala adaptativa basada en el tamaño de la pantalla
  const baseScale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  const scaleMultiplier = esPequeno ? 0.8 : 1;
  
  sprite.scale.set(
    8 * baseScale * scaleMultiplier, 
    1.6 * baseScale * scaleMultiplier, 
    1
  );
  sprite.position.set(0, 0, 2);
  scene.add(sprite);
  return sprite;
}

const introTexts = [
  { text: "Sony Computer Entertainment presents", small: false },
  { text: "A Universal Studios Production", small: false },
];
let introIndex = 0;
let introStart = Date.now();
let introSprite = crearTextoIntro(introTexts[introIndex].text, introTexts[introIndex].small);

let entradaStart = 0;

/* ==========================
   INPUT MOUSE / TOUCH
========================== */
let lastX = null;
let lastY = null;
let deltaX = 0;
let deltaY = 0;
let isDragging = false;

function updateInput(x, y) {
  if (currentState !== STATES.EXPLORACION) return;
  if (lastX === null) {
    lastX = x;
    lastY = y;
    return;
  }
  deltaX = (x - lastX) * 0.003;
  deltaY = (y - lastY) * 0.003;
  lastX = x;
  lastY = y;
}

canvas.addEventListener("mousedown", () => {
  isDragging = true;
  lastX = null;
  lastY = null;
});

canvas.addEventListener("mousemove", (e) => {
  if (isDragging) {
    updateInput(e.clientX, e.clientY);
  }
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
  lastX = null;
  lastY = null;
});

canvas.addEventListener("mouseleave", () => {
  isDragging = false;
  lastX = null;
  lastY = null;
});

canvas.addEventListener("touchstart", (e) => {
  isDragging = true;
  if (e.touches.length) {
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  }
});

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (e.touches.length && isDragging) {
    updateInput(e.touches[0].clientX, e.touches[0].clientY);
  }
});

canvas.addEventListener("touchend", () => {
  isDragging = false;
  lastX = null;
  lastY = null;
});

/* ==========================
   ANIMACIÓN
========================== */
let orbit = 0;
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const now = Date.now();
  const elapsedTime = clock.getElapsedTime();

  /* INTRO ESTILO CRASH */
  if (currentState === STATES.INTRO) {
    const t = now - introStart;

    if (t < 1200) {
      introSprite.material.opacity = t / 1200;
    } else if (t < 3000) {
      introSprite.material.opacity = 1;
    } else if (t < 4000) {
      introSprite.material.opacity = 1 - (t - 3000) / 1000;
    } else {
      scene.remove(introSprite);
      introIndex++;
      if (introIndex < introTexts.length) {
        introSprite = crearTextoIntro(introTexts[introIndex].text, introTexts[introIndex].small);
        introStart = now;
      } else {
        currentState = STATES.ENTRADA;
        entradaStart = now;
      }
    }

    renderer.render(scene, camera);
    return;
  }

  /* ENTRADA */
  if (currentState === STATES.ENTRADA) {
    const p = Math.min((now - entradaStart) / 3000, 1);
    galaxy.material.opacity = p * 0.95;
    const eased = 1 - Math.pow(1 - p, 3);
    camera.position.z = 12 - eased * 4;

    if (p === 1) {
      textos.forEach((t) => (t.visible = true));
      spritesFotos.forEach((f) => (f.visible = true));
      currentState = STATES.EXPLORACION;
    }
  }

  /* EXPLORACIÓN */
  if (currentState === STATES.EXPLORACION) {
    // Auto-rotación MUY LENTA
    if (!isDragging && Math.abs(deltaX) < 0.0001 && Math.abs(deltaY) < 0.0001) {
      orbit += 0.0003;
    } else {
      orbit += deltaX;
    }

    deltaX *= 0.92;
    deltaY *= 0.92;

    // Rotación de la galaxia
    galaxy.rotation.y = -orbit * 0.3;
    galaxy.rotation.x = Math.sin(orbit * 0.15) * 0.08;
    
    // Rotación del agujero negro con glow rojo pulsante
    blackHole.group.rotation.y = elapsedTime * 0.3;
    blackHole.group.rotation.x = Math.sin(elapsedTime * 0.2) * 0.1;
    
    // Pulso del glow rojo
    blackHole.light.intensity = 3 + Math.sin(elapsedTime * 2) * 1;

    // Posición de la cámara
    camera.position.x = Math.sin(orbit) * 8;
    camera.position.z = Math.cos(orbit) * 8;
    camera.position.y = THREE.MathUtils.clamp(
      camera.position.y + deltaY * 1.5,
      -3,
      3
    );

    // Animar luces
    pointLight1.position.x = Math.sin(elapsedTime * 0.5) * 5;
    pointLight1.position.z = Math.cos(elapsedTime * 0.5) * 5;
    pointLight2.position.x = Math.sin(elapsedTime * 0.3 + Math.PI) * 5;
    pointLight2.position.z = Math.cos(elapsedTime * 0.3 + Math.PI) * 5;
    pointLight3.position.y = 8 + Math.sin(elapsedTime * 0.4) * 2;

    // Animar estrellas flotantes
    starParticles.forEach((star, i) => {
      star.position.y += star.userData.speed;
      if (star.position.y > 10) {
        star.position.y = -5;
      }
      
      const angle = star.userData.angle + elapsedTime * 0.1;
      star.position.x = Math.cos(angle) * star.userData.radius;
      star.position.z = Math.sin(angle) * star.userData.radius;
      
      star.rotation.y += star.userData.rotSpeed;
      star.rotation.z = Math.sin(elapsedTime + i) * 0.1;
    });

    // Animar partículas brillantes (glitter)
    glitterParticles.rotation.y = elapsedTime * 0.05;
    const positions = glitter.geometry.attributes.position.array;
    for (let i = 0; i < CONFIG.particles.count; i++) {
      const i3 = i * 3;
      positions[i3 + 1] += Math.sin(elapsedTime * 2 + i) * 0.01;
    }
    glitter.geometry.attributes.position.needsUpdate = true;

    // Textos flotantes
    textos.forEach((t, i) => {
      const a = t.userData.angle + orbit * 0.8;
      t.position.x = Math.cos(a) * t.userData.radius;
      t.position.z = Math.sin(a) * t.userData.radius;
      t.position.y =
        t.userData.baseY +
        Math.sin(now * CONFIG.text.floatSpeed + i * 0.5) *
          CONFIG.text.floatAmplitude;
      
      t.lookAt(camera.position);
    });

    // Fotos flotantes
    spritesFotos.forEach((s, i) => {
      const a = s.userData.angle + orbit * 0.5;
      s.position.x = Math.cos(a) * s.userData.radius;
      s.position.z = Math.sin(a) * s.userData.radius;
      s.position.y =
        s.userData.baseY +
        Math.sin(now * CONFIG.photos.floatSpeed + i * 0.7) *
          CONFIG.photos.floatAmplitude;
      
      s.lookAt(camera.position);
    });

    galaxy.rotation.y += 0.00015;
  }

  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}

animate();

/* ==========================
   RESIZE
========================== */
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});