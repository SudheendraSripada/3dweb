import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';
import { ShowcaseScene } from './components/ShowcaseScene.js';
import { CAR_CATALOG } from './models/carCatalog.js';

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: 'power2.out' });

const picker = document.getElementById('car-picker');
const carName = document.getElementById('car-name');
const carTagline = document.getElementById('car-tagline');
const specsName = document.getElementById('specs-name');
const specGrid = document.getElementById('spec-grid');
const helper = document.getElementById('picker-helper');

const scene = new ShowcaseScene({
  canvas: document.getElementById('showcase-canvas'),
  onFeatureChange: (part) => {
    document.querySelectorAll('.story-panel').forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.part === part);
    });
  },
});

function renderSpecGrid(specs) {
  specGrid.innerHTML = '';
  for (const [label, value] of Object.entries(specs)) {
    const item = document.createElement('div');
    item.className = 'spec-item';
    item.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    specGrid.append(item);
  }
}

function setSelectionUI(car) {
  carName.textContent = car.name;
  carTagline.textContent = car.tagline;
  specsName.textContent = car.name;
  renderSpecGrid(car.specs);
}

function createCarPicker() {
  CAR_CATALOG.forEach((car) => {
    const button = document.createElement('button');
    button.className = 'car-chip';
    button.type = 'button';
    button.textContent = car.name;

    // Model loading is lazy and starts only after explicit user selection.
    button.addEventListener('click', async () => {
      picker.querySelectorAll('.car-chip').forEach((chip) => chip.classList.remove('active'));
      button.classList.add('active');
      helper.classList.add('is-hidden');
      setSelectionUI(car);
      await scene.loadCar(car);
    });

    picker.append(button);
  });
}

createCarPicker();
