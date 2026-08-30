import './style.css';
import { MustangStudioScene } from './components/MustangStudioScene.js';

const canvas = document.getElementById('showcase-canvas');
const scene = new MustangStudioScene(canvas);

// UI DOM Elements
const dragHandle = document.getElementById('drag-handle');
const arcPath = document.getElementById('arc-path');
const arcActivePath = document.getElementById('arc-active-path');
const heroTitleGroup = document.getElementById('hero-title-group');
const heroDesc = document.getElementById('hero-desc');
const revealedGroup = document.getElementById('revealed-group');
const sliderContainer = document.getElementById('slider-container');

let isDragging = false;
let currentProgress = 0; // 0 to 1
let pathTotalLength = 0;

if (arcPath) {
  pathTotalLength = arcPath.getTotalLength();
  arcActivePath.style.strokeDasharray = `${pathTotalLength}`;
  arcActivePath.style.strokeDashoffset = `${pathTotalLength}`;
}

// Calculate handle position along SVG arc path given progress (0..1)
function updateHandlePosition(progress) {
  currentProgress = Math.max(0, Math.min(1, progress));

  if (arcPath) {
    const point = arcPath.getPointAtLength(currentProgress * pathTotalLength);
    // Convert SVG point coordinates to percentage inside container
    const svgBBox = { width: 600, height: 300 };
    const leftPercent = (point.x / svgBBox.width) * 100;
    const topPercent = (point.y / svgBBox.height) * 100;

    dragHandle.style.left = `${leftPercent}%`;
    dragHandle.style.top = `${topPercent}%`;

    arcActivePath.style.strokeDashoffset = `${pathTotalLength * (1 - currentProgress)}`;
  }

  // Update 3D Scene
  scene.setRevealProgress(currentProgress);

  // Update UI Elements opacity & transforms based on progress
  if (currentProgress > 0.15) {
    heroTitleGroup.style.opacity = Math.max(0, 1 - (currentProgress - 0.15) * 3);
    heroDesc.style.opacity = Math.max(0, 1 - (currentProgress - 0.15) * 3);
  } else {
    heroTitleGroup.style.opacity = 1;
    heroDesc.style.opacity = 1;
  }

  if (currentProgress > 0.75) {
    revealedGroup.style.opacity = (currentProgress - 0.75) * 4;
    revealedGroup.style.transform = `translateY(${(1 - currentProgress) * 40}px)`;
  } else {
    revealedGroup.style.opacity = 0;
  }
}

// Drag functionality on Arc Slider
function onPointerDown(e) {
  isDragging = true;
  dragHandle.classList.add('active');
  e.preventDefault();
}

function onPointerMove(e) {
  if (!isDragging) return;

  const rect = sliderContainer.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;

  // Horizontal position ratio across the arc (0 at left, 1 at right)
  const xRatio = (clientX - rect.left) / rect.width;
  updateHandlePosition(xRatio);
}

function onPointerUp() {
  isDragging = false;
  dragHandle.classList.remove('active');
}

dragHandle.addEventListener('mousedown', onPointerDown);
dragHandle.addEventListener('touchstart', onPointerDown, { passive: false });

window.addEventListener('mousemove', onPointerMove);
window.addEventListener('touchmove', onPointerMove);

window.addEventListener('mouseup', onPointerUp);
window.addEventListener('touchend', onPointerUp);

// Wheel / Scroll event to drive reveal
window.addEventListener('wheel', (e) => {
  const delta = e.deltaY * 0.0008;
  updateHandlePosition(currentProgress + delta);
});

// Initialize at 0
updateHandlePosition(0);

// Animation Loop
function animate() {
  requestAnimationFrame(animate);
  scene.render();
}
animate();
