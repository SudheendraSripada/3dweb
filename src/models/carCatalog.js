export const CAR_CATALOG = [
  {
    id: 'mustang',
    name: 'Mustang',
    tagline: 'Iconic V8 muscle tuned for modern precision.',
    modelUrl: '/models/mustang-draco.glb',
    specs: { Horsepower: '480 hp', Torque: '415 lb-ft', '0-100 km/h': '4.2s', 'Top Speed': '250 km/h' },
  },
  {
    id: 'shelby-gt500',
    name: 'Mustang Shelby GT500',
    tagline: 'Supercharged brutality with relentless launch character.',
    modelUrl: '/models/shelby-gt500-draco.glb',
    specs: { Horsepower: '760 hp', Torque: '625 lb-ft', '0-100 km/h': '3.5s', 'Top Speed': '290 km/h' },
  },
  {
    id: 'gtd',
    name: 'Mustang GTD',
    tagline: 'Street legal race engineering with elite aerodynamic control.',
    modelUrl: '/models/gtd-draco.glb',
    specs: { Horsepower: '800+ hp', Torque: '677 lb-ft', '0-100 km/h': '3.2s', 'Top Speed': '325 km/h' },
  },
  {
    id: 'gt350r',
    name: 'Mustang GT350R',
    tagline: 'Flat-plane fury designed for high-rev corner attacks.',
    modelUrl: '/models/gt350r-draco.glb',
    specs: { Horsepower: '526 hp', Torque: '429 lb-ft', '0-100 km/h': '3.9s', 'Top Speed': '285 km/h' },
  },
  {
    id: 'dark-horse',
    name: 'Mustang Dark Horse',
    tagline: 'Track-capable confidence wrapped in stealth aggression.',
    modelUrl: '/models/dark-horse-draco.glb',
    specs: { Horsepower: '500 hp', Torque: '418 lb-ft', '0-100 km/h': '4.1s', 'Top Speed': '270 km/h' },
  },
];

export const FEATURE_FOCUS = {
  engine: { target: [0.05, 0.9, 1.75], cameraOffset: [1.2, 0.55, 2.9] },
  wheels: { target: [1.6, 0.25, 1.0], cameraOffset: [1.3, 0.3, 2.45] },
  body: { target: [0.0, 0.55, 2.0], cameraOffset: [0.2, 0.55, 3.0] },
  interior: { target: [-0.25, 0.8, 1.25], cameraOffset: [0.7, 0.7, 2.5] },
};
