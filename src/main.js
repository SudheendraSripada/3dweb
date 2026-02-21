import { CarShowcase } from './scene/CarShowcase.js';
import { CARS } from './scene/config.js';

const picker = document.getElementById('car-picker');
const carName = document.getElementById('car-name');
const carTagline = document.getElementById('car-tagline');
const specsName = document.getElementById('specs-name');
const specGrid = document.getElementById('spec-grid');

const showcase = new CarShowcase({
  canvas: document.getElementById('showcase-canvas'),
  onPartChange: (part) => {
    document.querySelectorAll('.story-panel').forEach((panel) => {
      panel.classList.toggle('active', panel.dataset.part === part);
    });
  },
});

function renderSpecGrid(specs) {
  specGrid.innerHTML = '';
  Object.entries(specs).forEach(([label, value]) => {
    const item = document.createElement('div');
    item.className = 'spec-item';
    item.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    specGrid.appendChild(item);
  });
}

function createPicker() {
  CARS.forEach((car, index) => {
    const button = document.createElement('button');
    button.className = 'car-chip';
    button.textContent = car.name;
    button.addEventListener('click', async () => {
      picker.querySelectorAll('.car-chip').forEach((chip) => chip.classList.remove('active'));
      button.classList.add('active');

      carName.textContent = car.name;
      carTagline.textContent = car.tagline;
      specsName.textContent = car.name;
      renderSpecGrid(car.specs);

      await showcase.loadCar(car);
    });

    picker.appendChild(button);

    if (index === 0) {
      button.click();
    }
  });
}

createPicker();
