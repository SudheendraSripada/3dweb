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
const pickerError = document.getElementById('picker-error');

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

function setButtonsBusyState(busy) {
  picker.querySelectorAll('.car-chip').forEach((chip) => {
    chip.disabled = busy;
    chip.classList.toggle('is-loading', busy);
  });
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
      pickerError.textContent = 'Loading 3D model…';
      setSelectionUI(car);
      setButtonsBusyState(true);
      try {
        await scene.loadCar(car);
        pickerError.textContent = '';
      } catch (error) {
        pickerError.textContent = 'Unable to load the selected 3D model. Check network/model URL and try again.';
        console.error(error);
      } finally {
        setButtonsBusyState(false);
      }
    });

    picker.append(button);
  });
}

createCarPicker();
