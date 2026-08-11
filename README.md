# Cinematic 3D Mustang Showcase

A Vite + Three.js experience for a cinematic product showcase with scroll-driven storytelling and interactive model selection.

## Requirements
- Node.js 16 or newer
- npm 8+

## Development
```bash
npm install
npm run dev
```

The app will be available at http://localhost:3000.

## Production build
```bash
npm run build
```

## Preview build locally
```bash
npm run preview
```

## Notes
- The experience loads GLTF/GLB models from the public models folder.
- If a model cannot be loaded, the app falls back to a simplified placeholder scene so the interface remains usable.
