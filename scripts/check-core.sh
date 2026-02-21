#!/usr/bin/env bash
set -euo pipefail
node --check src/main.js
node --check src/scene/CarShowcase.js
node --check src/scene/config.js
