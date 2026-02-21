# Cinematic Mustang 3D Showcase

Premium dark-studio automotive showcase built with Three.js + GSAP ScrollTrigger.

## Included in this repository

- Full app source (`index.html`, `src/`)
- Local placeholder 3D assets for all configured cars (`public/models/*.gltf`)
- Scroll-driven cloth reveal logic and section storytelling
- Multi-path model loading fallback (`.gltf` then `.glb`)

## Run locally

```bash
python3 -m http.server 4173
# open http://127.0.0.1:4173
```

## Push and open PR (GitHub)

```bash
git checkout -b feat/publish-cinematic-showcase
git push -u origin feat/publish-cinematic-showcase
# then open a PR into main
```

If your PR shows merge conflicts in `src/scene/config.js`, keep the `modelUrls` arrays so both `.gltf` and `.glb` references can coexist.
