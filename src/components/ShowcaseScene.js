import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger.js';
import { FEATURE_FOCUS } from '../models/carCatalog.js';
import { disposeObject3D } from '../utils/dispose.js';
import { isMobileViewport } from '../utils/device.js';

gsap.registerPlugin(ScrollTrigger);

const PARTS = ['engine', 'wheels', 'body', 'interior'];

export class ShowcaseScene {
  constructor({ canvas, onFeatureChange }) {
    this.canvas = canvas;
    this.onFeatureChange = onFeatureChange;
    this.clock = new THREE.Clock();
    this.mixers = [];
    this.modelCache = new Map();
    this.activeModel = null;
    this.isMobile = isMobileViewport();

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    this.camera.position.set(2.8, 1.6, 5.2);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: !this.isMobile, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.enabled = false;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 8;

    this.buildScene();
    this.setupLoaders();
    this.setupScrollStory();
    this.animate();
    window.addEventListener('resize', () => this.onResize());
  }

  // Scene setup: matte studio, floor reflection, and cinematic key/rim lights.
  buildScene() {
    this.scene.background = new THREE.Color('#050505');

    this.scene.add(new THREE.AmbientLight('#2f2225', 0.6));
    this.keyLight = new THREE.SpotLight('#ff3a4c', 38, 30, Math.PI / 5, 0.38, 1.2);
    this.keyLight.position.set(2.4, 4.2, 2.5);
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.PointLight('#7a0a1b', 8, 30);
    this.fillLight.position.set(-2.5, 1.2, -1.4);
    this.scene.add(this.fillLight);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(10, 96),
      new THREE.MeshPhysicalMaterial({
        color: '#101010',
        roughness: 0.19,
        metalness: 0.25,
        clearcoat: 0.95,
        clearcoatRoughness: 0.38,
        reflectivity: 0.55,
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.6;
    this.scene.add(floor);

    // HDR environment map for physically based lighting and realistic paint response.
    new RGBELoader().loadAsync('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_03_1k.hdr').then((hdr) => {
      hdr.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.environment = hdr;
    });
  }

  setupLoaders() {
    this.loader = new GLTFLoader();

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    this.loader.setDRACOLoader(dracoLoader);

    const ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath('https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/basis/');
    ktx2Loader.detectSupport(this.renderer);
    this.loader.setKTX2Loader(ktx2Loader);
  }

  // Scroll animation logic: reveal cloth + lighting ramp + camera movement + feature focus.
  setupScrollStory() {
    this.revealTimeline = gsap.timeline({ paused: true });

    this.revealTimeline
      .to(this.keyLight, { intensity: 62, duration: 1.2, ease: 'power2.inOut' }, 0)
      .to(this.fillLight, { intensity: 12, duration: 1, ease: 'power2.inOut' }, 0.15)
      .to(this.camera.position, { x: 1.2, z: 3.35, duration: 1.6, ease: 'power3.inOut' }, 0)
      .to(this.currentCloth?.scale ?? {}, { y: 0.06, x: 0.96, z: 0.88, duration: 1.3, ease: 'power2.inOut' }, 0)
      .to(this.currentCloth?.position ?? {}, { y: 1.3, duration: 1.15, ease: 'power2.out' }, 0.2)
      .to(this.currentCloth?.material ?? {}, { opacity: 0, duration: 0.9, ease: 'power2.out' }, 0.55)
      .add(() => {
        if (this.currentCloth) this.currentCloth.visible = false;
      });

    this.scrollTrigger?.kill();
    this.scrollTrigger = ScrollTrigger.create({
      trigger: '#viewer',
      start: 'top top',
      end: '+=2600',
      scrub: true,
      pin: true,
      onUpdate: (self) => {
        const progress = self.progress;
        this.controls.enabled = progress > 0.92;
        this.revealTimeline.progress(Math.min(progress * 1.15, 1));

        const idx = Math.min(PARTS.length - 1, Math.floor(progress * PARTS.length));
        const part = PARTS[idx];
        this.onFeatureChange(part);
        this.focusPart(part);

        if (progress > 0.88) {
          gsap.to('.specs__content', { opacity: 1, x: 0, duration: 0.4, overwrite: true, ease: 'power2.out' });
          gsap.to('.specs', { '--specs-left-opacity': 1, duration: 0.4, overwrite: true, ease: 'power2.out' });
        }
      },
    });
  }

  async loadCar(car) {
    this.controls.enabled = false;

    if (this.activeModel) {
      this.scene.remove(this.activeModel);
      disposeObject3D(this.activeModel);
      this.activeModel = null;
    }

    let root = this.modelCache.get(car.id)?.clone(true);

    if (!root) {
      try {
        const gltf = await this.loader.loadAsync(car.modelUrl);
        root = gltf.scene;
        this.modelCache.set(car.id, root.clone(true));
        this.mixers = [];
        if (gltf.animations?.length) {
          const mixer = new THREE.AnimationMixer(root);
          const action = mixer.clipAction(gltf.animations[0]);
          action.clampWhenFinished = true;
          action.setLoop(THREE.LoopOnce, 1);
          action.play();
          this.mixers.push(mixer);
        }
      } catch {
        root = this.createFallbackCar();
      }
    }

    root.position.set(0, -0.55, 0);
    root.traverse((child) => {
      if (!child.isMesh) return;
      if (child.material) {
        child.material.roughness = Math.max(0.15, child.material.roughness ?? 0.45);
        child.material.metalness = Math.max(0.3, child.material.metalness ?? 0.25);
      }
      child.castShadow = true;
      child.frustumCulled = true;
    });

    // LOD: keep hero mesh near camera, simplified shell for distant viewpoint.
    const lod = new THREE.LOD();
    lod.addLevel(root, 0);
    lod.addLevel(this.createLodProxy(), 4.8);

    this.currentCloth = this.createCloth();
    lod.add(this.currentCloth);

    this.activeModel = lod;
    this.scene.add(lod);

    this.revealTimeline.progress(0);
    this.currentCloth.visible = true;
    this.currentCloth.material.opacity = 0.95;
    this.currentCloth.scale.set(1.08, 0.56, 0.82);
    this.currentCloth.position.set(0, 0.35, 0);

    ScrollTrigger.refresh();
  }

  createCloth() {
    return new THREE.Mesh(
      new THREE.SphereGeometry(1.9, this.isMobile ? 28 : 48, this.isMobile ? 28 : 48),
      new THREE.MeshPhysicalMaterial({ color: '#2b2b2b', roughness: 0.88, metalness: 0.05, opacity: 0.95, transparent: true })
    );
  }

  createLodProxy() {
    const group = new THREE.Group();
    const proxyBody = new THREE.Mesh(
      new THREE.BoxGeometry(2.65, 0.75, 1.18),
      new THREE.MeshStandardMaterial({ color: '#7f0d1d', roughness: 0.5, metalness: 0.4 })
    );
    proxyBody.position.y = 0.25;
    group.add(proxyBody);
    return group;
  }

  createFallbackCar() {
    return this.createLodProxy();
  }

  // Camera movement: blend target and position for smooth feature framing.
  focusPart(part) {
    const focus = FEATURE_FOCUS[part];
    if (!focus) return;

    const target = new THREE.Vector3(...focus.target);
    const offset = new THREE.Vector3(...focus.cameraOffset);
    const desiredPos = target.clone().add(offset);

    this.controls.target.lerp(target, 0.08);
    this.camera.position.lerp(desiredPos, 0.04);
  }

  animate() {
    this.renderer.setAnimationLoop(() => {
      const delta = this.clock.getDelta();
      this.mixers.forEach((m) => m.update(delta));
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    });
  }

  onResize() {
    const { clientWidth, clientHeight } = this.canvas;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
  }
}
