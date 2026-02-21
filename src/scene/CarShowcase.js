import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/RGBELoader.js';
import { DRACOLoader } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/loaders/DRACOLoader.js';
import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';
import { ScrollTrigger } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js';
import { PART_FOCUS } from './config.js';

gsap.registerPlugin(ScrollTrigger);

const PART_SEQUENCE = ['engine', 'wheels', 'body', 'interior'];

export class CarShowcase {
  constructor({ canvas, onPartChange }) {
    this.canvas = canvas;
    this.onPartChange = onPartChange;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    this.camera.position.set(2.6, 1.8, 4.8);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.clock = new THREE.Clock();
    this.mixers = [];
    this.currentCar = null;
    this.revealTween = null;

    this.initScene();
    this.initScrollTimeline();
    this.animate();
    window.addEventListener('resize', () => this.onResize());
  }

  initScene() {
    this.scene.background = new THREE.Color('#050505');

    const hemi = new THREE.HemisphereLight('#ff9696', '#1a1a1a', 1.15);
    this.scene.add(hemi);

    this.keyLight = new THREE.SpotLight('#ff3b3b', 75, 20, Math.PI / 6, 0.45, 1.6);
    this.keyLight.position.set(2.5, 4.2, 2.4);
    this.scene.add(this.keyLight);

    this.rimLight = new THREE.PointLight('#c70039', 18, 30);
    this.rimLight.position.set(-3.5, 1.8, -2.2);
    this.scene.add(this.rimLight);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(9, 96),
      new THREE.MeshPhysicalMaterial({
        color: '#0e0e0e',
        roughness: 0.17,
        metalness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.3,
        reflectivity: 0.55,
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.62;
    this.scene.add(floor);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.enableDamping = true;
    this.controls.enabled = false;
    this.controls.minDistance = 2.2;
    this.controls.maxDistance = 7;

    const envLoader = new RGBELoader();
    envLoader
      .loadAsync('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_03_1k.hdr')
      .then((hdr) => {
        hdr.mapping = THREE.EquirectangularReflectionMapping;
        this.scene.environment = hdr;
      })
      .catch(() => {});
  }

  async loadCar(car) {
    if (this.currentCar) {
      this.scene.remove(this.currentCar);
    }

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    loader.setDRACOLoader(dracoLoader);

    let root;
    try {
      const gltf = await loader.loadAsync(car.modelUrl);
      root = gltf.scene;
      if (gltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(root);
        const clip = gltf.animations[0];
        const action = mixer.clipAction(clip);
        action.play();
        this.mixers = [mixer];
      }
    } catch {
      root = this.createFallbackCar();
    }

    root.position.set(0, -0.55, 0);
    root.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.roughness = Math.max(0.15, child.material.roughness ?? 0.4);
        child.material.metalness = Math.max(0.3, child.material.metalness ?? 0.2);
      }
    });

    const cloth = this.createClothOverlay();
    root.add(cloth);

    this.currentCar = root;
    this.cloth = cloth;
    this.scene.add(root);

    this.playRevealTimeline();
  }

  createFallbackCar() {
    const group = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2.7, 0.8, 1.2),
      new THREE.MeshStandardMaterial({ color: '#8f0707', metalness: 0.76, roughness: 0.3 })
    );
    body.position.y = 0.2;
    group.add(body);

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.55, 1.1),
      new THREE.MeshStandardMaterial({ color: '#131313', metalness: 0.2, roughness: 0.45 })
    );
    cabin.position.set(0.1, 0.8, 0);
    group.add(cabin);

    return group;
  }

  createClothOverlay() {
    const cloth = new THREE.Mesh(
      new THREE.SphereGeometry(1.9, 60, 60),
      new THREE.MeshPhysicalMaterial({
        color: '#252525',
        roughness: 0.88,
        metalness: 0.06,
        transmission: 0.02,
        clearcoat: 0.2,
        opacity: 0.93,
        transparent: true,
      })
    );
    cloth.scale.set(1.08, 0.55, 0.82);
    cloth.position.y = 0.35;
    return cloth;
  }

  initScrollTimeline() {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#viewer',
        start: 'top top',
        end: '+=2200',
        scrub: true,
        pin: true,
      },
    });

    tl.to(this.keyLight, { intensity: 95, duration: 1.2 }, 0)
      .to(this.camera.position, { z: 3.4, x: 1.35, duration: 1.6 }, 0)
      .to(this.rimLight.position, { x: -1.2, z: -0.8, duration: 1.4 }, 0.2)
      .to(
        {},
        {
          duration: 2,
          onUpdate: () => {
            const progress = tl.progress();
            const index = Math.min(PART_SEQUENCE.length - 1, Math.floor(progress * PART_SEQUENCE.length));
            const part = PART_SEQUENCE[index];
            this.onPartChange(part);
            this.focusPart(part, progress);
          },
        },
        0
      )
      .to('#specs .specs__content', { opacity: 1, x: 0, duration: 0.6 }, 1.5)
      .to('.story-panel', { opacity: 1, y: 0, stagger: 0.1, duration: 0.4 }, 0.4)
      .add(() => {
        this.controls.enabled = true;
      }, 1.9);
  }

  focusPart(part, progress) {
    const pos = PART_FOCUS[part];
    if (!pos) return;

    const blend = 0.08;
    this.controls.target.lerp(new THREE.Vector3(pos.x, pos.y, pos.z * (0.9 + progress * 0.3)), blend);
  }

  playRevealTimeline() {
    if (!this.cloth) return;
    if (this.revealTween) this.revealTween.kill();

    this.cloth.visible = true;
    this.cloth.scale.set(1.08, 0.55, 0.82);
    this.cloth.material.opacity = 0.95;

    this.revealTween = gsap
      .timeline()
      .to(this.cloth.scale, { y: 0.08, x: 0.96, z: 0.9, duration: 1.4, ease: 'power2.inOut' })
      .to(this.cloth.position, { y: 1.3, duration: 1.3, ease: 'power2.out' }, 0.3)
      .to(this.cloth.material, { opacity: 0, duration: 0.8, ease: 'power2.out' }, 0.8)
      .add(() => {
        this.cloth.visible = false;
      });
  }

  animate() {
    const tick = () => {
      const delta = this.clock.getDelta();
      this.mixers.forEach((mixer) => mixer.update(delta));
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(tick);
    };

    tick();
  }

  onResize() {
    const { clientWidth, clientHeight } = this.canvas;
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(clientWidth, clientHeight, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
}
