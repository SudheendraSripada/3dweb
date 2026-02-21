export const CARS = [
  {
    id: 'mustang',
    name: 'Mustang',
    tagline: 'Iconic V8 muscle tuned for modern precision.',
    modelUrl: '/models/mustang-draco.gltf',
    specs: {
      Horsepower: '480 hp',
      Torque: '415 lb-ft',
      '0-100 km/h': '4.2s',
      'Top Speed': '250 km/h',
    },
  },
  {
    id: 'shelby-gt500',
    name: 'Mustang Shelby GT500',
    tagline: 'Supercharged brutality with relentless launch character.',
    modelUrl: '/models/shelby-gt500-draco.gltf',
    specs: {
      Horsepower: '760 hp',
      Torque: '625 lb-ft',
      '0-100 km/h': '3.5s',
      'Top Speed': '290 km/h',
    },
  },
  {
    id: 'gtd',
    name: 'Mustang GTD',
    tagline: 'Street legal race engineering with elite aerodynamic control.',
    modelUrl: '/models/gtd-draco.gltf',
    specs: {
      Horsepower: '800+ hp',
      Torque: '677 lb-ft',
      '0-100 km/h': '3.2s',
      'Top Speed': '325 km/h',
    },
  },
  {
    id: 'gt350r',
    name: 'Mustang GT350R',
    tagline: 'Flat-plane fury designed for high-rev corner attacks.',
    modelUrl: '/models/gt350r-draco.gltf',
    specs: {
      Horsepower: '526 hp',
      Torque: '429 lb-ft',
      '0-100 km/h': '3.9s',
      'Top Speed': '285 km/h',
    },
  },
  {
    id: 'dark-horse',
    name: 'Mustang Dark Horse',
    tagline: 'Track-capable confidence wrapped in stealth aggression.',
    modelUrl: '/models/dark-horse-draco.gltf',
    specs: {
      Horsepower: '500 hp',
      Torque: '418 lb-ft',
      '0-100 km/h': '4.1s',
      'Top Speed': '270 km/h',
    },
  },
];

export const PART_FOCUS = {
  engine: { x: 0, y: 0.8, z: 1.8 },
  wheels: { x: 1.8, y: 0.2, z: 1.2 },
  body: { x: 0, y: 0.5, z: 2.2 },
  interior: { x: -0.4, y: 0.8, z: 1.4 },
};
