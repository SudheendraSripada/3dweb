import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class MustangStudioScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#080808');
    this.scene.fog = new THREE.FogExp2('#080808', 0.035);

    this.camera = new THREE.PerspectiveCamera(38, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    this.camera.position.set(0, 1.25, 4.8);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = false;
    this.controls.enablePan = false;

    this.buildLighting();
    this.buildEnvironment();
    this.buildMustangModel();
    this.buildClothCover();

    window.addEventListener('resize', () => this.onResize());
  }

  buildLighting() {
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.85);
    this.scene.add(ambientLight);

    // Overhead Key spotlight
    this.keySpot = new THREE.SpotLight('#ffffff', 22, 30, Math.PI / 3, 0.5, 1);
    this.keySpot.position.set(0, 7, 2);
    this.scene.add(this.keySpot);

    // Soft warm directional fill
    const dirLight = new THREE.DirectionalLight('#ffeaee', 2.5);
    dirLight.position.set(-4, 4, 3);
    this.scene.add(dirLight);

    // Overhead Glowing Light Fixtures (X-cross bars from Pinterest design)
    this.tubeGroup = new THREE.Group();
    const tubeMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    const tubeGeo = new THREE.CylinderGeometry(0.03, 0.03, 4.2, 16);

    const tube1 = new THREE.Mesh(tubeGeo, tubeMat);
    tube1.position.set(-0.4, 3.2, 0.1);
    tube1.rotation.set(0.3, 0.2, 1.1);

    const tube2 = new THREE.Mesh(tubeGeo, tubeMat);
    tube2.position.set(0.5, 3.4, -0.3);
    tube2.rotation.set(-0.2, -0.4, -0.8);

    this.tubeGroup.add(tube1, tube2);
    this.scene.add(this.tubeGroup);
  }

  buildEnvironment() {
    // Wet glossy garage floor
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#121212',
      roughness: 0.18,
      metalness: 0.6,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    this.scene.add(floor);
  }

  buildMustangModel() {
    this.carGroup = new THREE.Group();

    // High Gloss Black Mustang Body Paint
    const bodyMat = new THREE.MeshStandardMaterial({
      color: '#1a1a22',
      roughness: 0.1,
      metalness: 0.9,
    });

    const goldStripeMat = new THREE.MeshStandardMaterial({
      color: '#d4af37',
      roughness: 0.2,
      metalness: 0.8,
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.05,
      metalness: 0.98,
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: '#050505',
      roughness: 0.1,
      metalness: 0.5,
    });

    // Main Car Body (Classic 1968 Fastback Proportion)
    const bodyGeo = new THREE.BoxGeometry(1.82, 0.58, 4.2);
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 0.48;
    this.carGroup.add(bodyMesh);

    // Cabin Roof & Slanted Fastback Rear Window
    const cabinGeo = new THREE.BoxGeometry(1.48, 0.5, 2.1);
    const cabinMesh = new THREE.Mesh(cabinGeo, bodyMat);
    cabinMesh.position.set(0, 0.95, -0.15);
    cabinMesh.rotation.x = -0.14;
    this.carGroup.add(cabinMesh);

    // Front Hood Slope
    const hoodGeo = new THREE.BoxGeometry(1.78, 0.18, 1.4);
    const hood = new THREE.Mesh(hoodGeo, bodyMat);
    hood.position.set(0, 0.68, 1.25);
    hood.rotation.x = 0.06;
    this.carGroup.add(hood);

    // Windshield
    const windshieldGeo = new THREE.BoxGeometry(1.4, 0.45, 0.05);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(0, 0.92, 0.72);
    windshield.rotation.x = 0.52;
    this.carGroup.add(windshield);

    // Gold Side Racing Stripe
    const stripeLeftGeo = new THREE.BoxGeometry(0.02, 0.09, 3.8);
    const stripeLeft = new THREE.Mesh(stripeLeftGeo, goldStripeMat);
    stripeLeft.position.set(0.92, 0.42, 0);
    const stripeRight = stripeLeft.clone();
    stripeRight.position.x = -0.92;
    this.carGroup.add(stripeLeft, stripeRight);

    // Front Chrome Grille
    const grilleGeo = new THREE.BoxGeometry(1.68, 0.32, 0.08);
    const grilleMat = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.5 });
    const grille = new THREE.Mesh(grilleGeo, grilleMat);
    grille.position.set(0, 0.48, 2.11);
    this.carGroup.add(grille);

    // Headlights
    const hlGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.06, 24);
    hlGeo.rotateX(Math.PI / 2);
    const hlMat = new THREE.MeshBasicMaterial({ color: '#fffae6' });

    const hlLeft = new THREE.Mesh(hlGeo, hlMat);
    hlLeft.position.set(0.66, 0.48, 2.13);
    const hlRight = new THREE.Mesh(hlGeo, hlMat);
    hlRight.position.set(-0.66, 0.48, 2.13);

    // Headlight Spotbeams
    const spotLeft = new THREE.SpotLight('#fffae6', 15, 18, Math.PI / 5, 0.4);
    spotLeft.position.copy(hlLeft.position);
    spotLeft.target.position.set(0.66, 0.1, 8);

    const spotRight = new THREE.SpotLight('#fffae6', 15, 18, Math.PI / 5, 0.4);
    spotRight.position.copy(hlRight.position);
    spotRight.target.position.set(-0.66, 0.1, 8);

    this.carGroup.add(hlLeft, hlRight, spotLeft, spotRight, spotLeft.target, spotRight.target);

    // Rear Taillights (Classic 3-vertical bar Mustang lights)
    const tlMat = new THREE.MeshBasicMaterial({ color: '#ff2222' });
    const barGeo = new THREE.BoxGeometry(0.06, 0.22, 0.05);

    [-0.7, -0.6, -0.5, 0.5, 0.6, 0.7].forEach((xPos) => {
      const bar = new THREE.Mesh(barGeo, tlMat);
      bar.position.set(xPos, 0.54, -2.11);
      this.carGroup.add(bar);
    });

    // License Plate ("APC 420")
    const plateGeo = new THREE.BoxGeometry(0.42, 0.2, 0.02);
    const plateMat = new THREE.MeshStandardMaterial({ color: '#0d0d0d', roughness: 0.4 });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.set(0, 0.38, -2.11);
    this.carGroup.add(plate);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.22, 32);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.8 });

    [
      [0.86, 0.3, 1.25],
      [-0.86, 0.3, 1.25],
      [0.86, 0.3, -1.25],
      [-0.86, 0.3, -1.25],
    ].forEach(([x, y, z]) => {
      const tire = new THREE.Mesh(wheelGeo, wheelMat);
      tire.position.set(x, y, z);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.23, 12), chromeMat);
      rim.rotation.z = Math.PI / 2;
      tire.add(rim);
      this.carGroup.add(tire);
    });

    this.scene.add(this.carGroup);
  }

  buildClothCover() {
    // Silk Cloth draped cover
    const clothGeo = new THREE.PlaneGeometry(3.6, 5.6, 32, 32);
    const pos = clothGeo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      let height = 0.52;

      if (Math.abs(y) < 1.1) {
        height += Math.cos((y / 1.1) * (Math.PI / 2)) * 0.5;
      }
      if (y > 1.1) {
        height += (1 - (y - 1.1) / 1.7) * 0.12;
      }
      const distFromCenter = Math.abs(x);
      if (distFromCenter > 0.78) {
        height -= Math.pow((distFromCenter - 0.78) / 1.0, 1.6) * 0.85;
      }

      pos.setZ(i, Math.max(0.02, height));
    }
    clothGeo.computeVertexNormals();

    const clothMat = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      roughness: 0.5,
      metalness: 0.1,
      clearcoat: 0.4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.98,
    });

    this.clothMesh = new THREE.Mesh(clothGeo, clothMat);
    this.clothMesh.rotation.x = -Math.PI / 2;
    this.clothMesh.position.set(0, 0, 0);

    this.scene.add(this.clothMesh);
  }

  setRevealProgress(progress) {
    this.revealProgress = progress;

    if (this.clothMesh) {
      const liftY = Math.pow(progress, 1.3) * 3.8;
      const pullZ = -Math.pow(progress, 1.2) * 4.5;

      this.clothMesh.position.set(0, liftY, pullZ);
      this.clothMesh.material.opacity = Math.max(0, 1 - progress * 1.25);
      this.clothMesh.visible = this.clothMesh.material.opacity > 0.01;
    }

    // Dynamic Camera Keyframe Animation (matching Pinterest sequence)
    let camPos = new THREE.Vector3();
    let targetPos = new THREE.Vector3(0, 0.5, 0);

    if (progress < 0.3) {
      const t = progress / 0.3;
      camPos.lerpVectors(new THREE.Vector3(0, 1.25, 4.8), new THREE.Vector3(1.2, 0.6, 2.8), t);
      targetPos.set(0, 0.5, 1.5);
    } else if (progress < 0.6) {
      const t = (progress - 0.3) / 0.3;
      camPos.lerpVectors(new THREE.Vector3(1.2, 0.6, 2.8), new THREE.Vector3(-1.4, 0.45, -2.6), t);
      targetPos.lerpVectors(new THREE.Vector3(0.5, 0.5, 1.5), new THREE.Vector3(-0.3, 0.45, -2.0), t);
    } else {
      const t = (progress - 0.6) / 0.4;
      camPos.lerpVectors(new THREE.Vector3(-1.4, 0.45, -2.6), new THREE.Vector3(2.8, 0.95, 3.6), t);
      targetPos.lerpVectors(new THREE.Vector3(-0.3, 0.45, -2.0), new THREE.Vector3(0, 0.5, 0), t);
    }

    this.camera.position.copy(camPos);
    this.controls.target.copy(targetPos);
  }

  render() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }
}
