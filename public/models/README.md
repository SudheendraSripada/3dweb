# Local model placeholders

This folder intentionally contains local GLTF assets so model loading works out of the box.
The app now tries each car's `modelUrls` in order (`.gltf` first, then `.glb`) to reduce merge friction between branches that referenced different extensions.
Replace these placeholder assets with production Mustang scans/exports while keeping the same base filenames.
