/**
 * Apparatus3D.tsx
 * Interactive 3D WebGL apparatus reconstructed from physical laboratory photographs:
 * - Dual chrome cylindrical rails on heavy black cast-iron arched feet with leveling screws (Photo 1).
 * - Central graduated millimeter scale rule.
 * - Black laser power supply module box with bright red toggle switch (Photo 1).
 * - Left launcher upright with height adjustment rod and side lever clamp (Photo 1).
 * - Flexible black optical fiber looping gracefully across the bench (Photo 1).
 * - Fiber output chuck barrel pointing at target screen (Photo 2).
 * - Movable screen carriage with knurled silver micrometer thumb-screw (Photo 2).
 * - Target screen with exact concentric millimeter circle markings (4, 8, 12... 80mm) from Photo 2.
 * - Emerging conical laser beam and glowing red laser spot with diffraction rings.
 * - Mouse controls: Drag to rotate, scroll to zoom, right-click drag to pan.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ViewPreset } from '../types/lab';
import { Eye, RotateCcw, Maximize2 } from 'lucide-react';

interface Apparatus3DProps {
  L: number;                 // Distance in mm (primary simulation parameter)
  na: number;                // Numerical Aperture (default 0.20)
  spotDiameter: number;      // Calculated average spot diameter (mm)
  thetaDeg: number;          // Acceptance angle in degrees
}

export const Apparatus3D: React.FC<Apparatus3DProps> = ({
  L,
  na,
  spotDiameter,
  thetaDeg
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Dynamic mesh references
  const screenCarriageGroupRef = useRef<THREE.Group | null>(null);
  const lightConeRef = useRef<THREE.Mesh | null>(null);
  const spotMeshRef = useRef<THREE.Mesh | null>(null);
  const spotHaloRef = useRef<THREE.Mesh | null>(null);
  const dimensionLineRef = useRef<THREE.Line | null>(null);
  const dimensionLabelRef = useRef<THREE.Sprite | null>(null);

  // Camera Orbit state
  const orbitRef = useRef({
    radius: 170,
    theta: Math.PI / 4.2,      // Azimuth angle
    phi: Math.PI / 3.2,        // Elevation angle
    target: new THREE.Vector3(25, 0, 0),
    isDragging: false,
    dragButton: 0,
    prevMouseX: 0,
    prevMouseY: 0
  });

  const [activeView, setActiveView] = useState<ViewPreset>('3d');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);
    scene.fog = new THREE.FogExp2(0x070b14, 0.002);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 1200);
    cameraRef.current = camera;
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    // Illumination
    const ambientLight = new THREE.AmbientLight(0xdbeafe, 0.95);
    scene.add(ambientLight);

    const overheadLight = new THREE.DirectionalLight(0xffffff, 1.35);
    overheadLight.position.set(40, 110, 60);
    overheadLight.castShadow = true;
    scene.add(overheadLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.6);
    rimLight.position.set(-60, 40, -50);
    scene.add(rimLight);

    const laserGlow = new THREE.PointLight(0xff0033, 2.8, 85);
    laserGlow.position.set(0, 0, 0);
    scene.add(laserGlow);

    // Build Physical Apparatus
    buildLabCounterTable(scene);
    buildDualRailOpticalBench(scene);
    buildLaserPowerSupplyBox(scene);
    buildLeftLauncherUpright(scene);
    buildFiberCable(scene);
    buildFiberOutputChuckUpright(scene);
    buildMovableScreenCarriage(scene, L, spotDiameter);

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        if (spotHaloRef.current) {
          const s = 1.0 + Math.sin(Date.now() * 0.005) * 0.02;
          spotHaloRef.current.scale.set(s, s, 1);
        }
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (rendererRef.current?.domElement) {
        rendererRef.current.dispose();
        containerRef.current?.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  // Update dynamic elements when distance L changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const spotRadius = Math.max(0.4, spotDiameter / 2.0);

    if (screenCarriageGroupRef.current) {
      screenCarriageGroupRef.current.position.set(L, 0, 0);
    }

    if (spotMeshRef.current) {
      spotMeshRef.current.geometry.dispose();
      spotMeshRef.current.geometry = new THREE.CircleGeometry(spotRadius, 64);
    }
    if (spotHaloRef.current) {
      spotHaloRef.current.geometry.dispose();
      spotHaloRef.current.geometry = new THREE.RingGeometry(spotRadius * 0.85, spotRadius * 1.35, 48);
    }

    if (lightConeRef.current) {
      lightConeRef.current.geometry.dispose();
      const coneGeo = new THREE.ConeGeometry(spotRadius, L, 48, 1, true);
      coneGeo.rotateZ(-Math.PI / 2);
      coneGeo.translate(L / 2, 12, 0);
      lightConeRef.current.geometry = coneGeo;
    }

    if (dimensionLineRef.current) {
      const pts = [
        new THREE.Vector3(0, -22, 0),
        new THREE.Vector3(L, -22, 0)
      ];
      dimensionLineRef.current.geometry.setFromPoints(pts);
    }

    if (dimensionLabelRef.current) {
      dimensionLabelRef.current.position.set(L / 2, -26, 0);
      updateLabelSprite(dimensionLabelRef.current, `L = ${L.toFixed(1)} mm`);
    }

    orbitRef.current.target.set(L / 2, 0, 0);
    updateCameraPosition();
  }, [L, spotDiameter, na]);

  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi, target } = orbitRef.current;
    const x = target.x + radius * Math.sin(phi) * Math.sin(theta);
    const y = target.y + radius * Math.cos(phi);
    const z = target.z + radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(target);
  };

  const setViewPreset = (view: ViewPreset) => {
    setActiveView(view);
    const midX = L / 2;
    orbitRef.current.target.set(midX, 0, 0);

    if (view === 'front') {
      orbitRef.current.theta = Math.PI / 2;
      orbitRef.current.phi = Math.PI / 2;
      orbitRef.current.radius = 110;
      orbitRef.current.target.set(L, 0, 0);
    } else if (view === 'top') {
      orbitRef.current.theta = 0;
      orbitRef.current.phi = 0.01;
      orbitRef.current.radius = 210;
    } else if (view === 'side') {
      orbitRef.current.theta = 0;
      orbitRef.current.phi = Math.PI / 2;
      orbitRef.current.radius = 180;
    } else {
      orbitRef.current.theta = Math.PI / 4.2;
      orbitRef.current.phi = Math.PI / 3.2;
      orbitRef.current.radius = 170;
    }
    updateCameraPosition();
  };

  // Mouse Orbit Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    orbitRef.current.isDragging = true;
    orbitRef.current.dragButton = e.button;
    orbitRef.current.prevMouseX = e.clientX;
    orbitRef.current.prevMouseY = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!orbitRef.current.isDragging) return;
    const dx = e.clientX - orbitRef.current.prevMouseX;
    const dy = e.clientY - orbitRef.current.prevMouseY;
    orbitRef.current.prevMouseX = e.clientX;
    orbitRef.current.prevMouseY = e.clientY;

    if (orbitRef.current.dragButton === 0) {
      orbitRef.current.theta -= dx * 0.008;
      orbitRef.current.phi = THREE.MathUtils.clamp(
        orbitRef.current.phi - dy * 0.008,
        0.05,
        Math.PI - 0.05
      );
    } else if (orbitRef.current.dragButton === 2) {
      orbitRef.current.target.x -= dx * 0.12;
      orbitRef.current.target.y += dy * 0.12;
    }
    updateCameraPosition();
  };

  const handleMouseUp = () => {
    orbitRef.current.isDragging = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    orbitRef.current.radius = THREE.MathUtils.clamp(
      orbitRef.current.radius + e.deltaY * 0.15,
      40,
      400
    );
    updateCameraPosition();
  };

  // Physical Model Construction
  const buildLabCounterTable = (scene: THREE.Scene) => {
    const tableGeo = new THREE.PlaneGeometry(350, 220);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, 256, 256);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(7, 4.4);

    const tableMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.25,
      metalness: 0.1
    });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.rotateX(-Math.PI / 2);
    tableMesh.position.set(0, -38, 0);
    tableMesh.receiveShadow = true;
    scene.add(tableMesh);

    const wallGeo = new THREE.PlaneGeometry(350, 180);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xdde3ea, roughness: 0.9 });
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.set(0, 52, -75);
    scene.add(wallMesh);
  };

  const buildDualRailOpticalBench = (scene: THREE.Scene) => {
    const benchGroup = new THREE.Group();
    const benchLength = 260;

    const railGeo = new THREE.CylinderGeometry(2.0, 2.0, benchLength, 32);
    railGeo.rotateZ(Math.PI / 2);
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.12
    });

    const frontRail = new THREE.Mesh(railGeo, chromeMat);
    frontRail.position.set(0, -28, 15);
    benchGroup.add(frontRail);

    const backRail = new THREE.Mesh(railGeo, chromeMat);
    backRail.position.set(0, -28, -15);
    benchGroup.add(backRail);

    const scaleRuleGeo = new THREE.BoxGeometry(benchLength - 10, 1.2, 10);
    const scaleRuleMat = new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.7, roughness: 0.3 });
    const scaleRule = new THREE.Mesh(scaleRuleGeo, scaleRuleMat);
    scaleRule.position.set(0, -28.2, 0);
    benchGroup.add(scaleRule);

    for (let x = -110; x <= 110; x += 10) {
      const tickGeo = new THREE.BoxGeometry(0.8, 1.5, 6);
      const tickMat = new THREE.MeshBasicMaterial({ color: 0x334155 });
      const tick = new THREE.Mesh(tickGeo, tickMat);
      tick.position.set(x, -27.5, 0);
      benchGroup.add(tick);
    }

    const buildEndSupport = (xPos: number) => {
      const archGroup = new THREE.Group();
      archGroup.position.set(xPos, -28, 0);
      const blackCastMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8, metalness: 0.4 });

      const bar = new THREE.Mesh(new THREE.BoxGeometry(10, 8, 42), blackCastMat);
      archGroup.add(bar);

      const archLegGeo = new THREE.TorusGeometry(18, 4, 16, 24, Math.PI);
      archLegGeo.rotateY(Math.PI / 2);
      archLegGeo.rotateZ(Math.PI);
      const leg = new THREE.Mesh(archLegGeo, blackCastMat);
      leg.position.set(0, -4, 0);
      archGroup.add(leg);

      const screwGeo = new THREE.CylinderGeometry(2, 2, 7, 16);
      const screwMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85 });
      const s1 = new THREE.Mesh(screwGeo, screwMat);
      s1.position.set(0, -8, 18);
      archGroup.add(s1);

      const s2 = new THREE.Mesh(screwGeo, screwMat);
      s2.position.set(0, -8, -18);
      archGroup.add(s2);

      benchGroup.add(archGroup);
    };

    buildEndSupport(-benchLength / 2);
    buildEndSupport(benchLength / 2);
    scene.add(benchGroup);
  };

  const buildLaserPowerSupplyBox = (scene: THREE.Scene) => {
    const boxGroup = new THREE.Group();
    boxGroup.position.set(-15, -34, 42);

    const boxGeo = new THREE.BoxGeometry(32, 12, 28);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.5, metalness: 0.5 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.castShadow = true;
    boxGroup.add(box);

    // Bright Red Rocker/Toggle Switch (Photo 1)
    const switchBase = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 1.5), new THREE.MeshStandardMaterial({ color: 0x27272a }));
    switchBase.position.set(6, 0, 14.2);
    boxGroup.add(switchBase);

    const switchToggleGeo = new THREE.CylinderGeometry(1.6, 1.6, 3.5, 16);
    switchToggleGeo.rotateX(Math.PI / 2);
    const switchToggle = new THREE.Mesh(
      switchToggleGeo,
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xff0000, emissiveIntensity: 0.5 })
    );
    switchToggle.position.set(6, 0, 15.2);
    boxGroup.add(switchToggle);

    const cableCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-10, 0, -14),
      new THREE.Vector3(-45, -28, 10),
      new THREE.Vector3(-75, -15, 0)
    );
    const cable = new THREE.Mesh(
      new THREE.TubeGeometry(cableCurve, 24, 0.8, 8, false),
      new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.7 })
    );
    boxGroup.add(cable);
    scene.add(boxGroup);
  };

  const buildLeftLauncherUpright = (scene: THREE.Scene) => {
    const launcherGroup = new THREE.Group();
    launcherGroup.position.set(-75, 0, 0);

    const carriageMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.7 });
    const carriage = new THREE.Mesh(new THREE.BoxGeometry(22, 6, 38), carriageMat);
    carriage.position.set(0, -25, 0);
    launcherGroup.add(carriage);

    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 7.5, 20, 24), carriageMat);
    pillar.position.set(0, -13, 0);
    launcherGroup.add(pillar);

    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 24, 24), chromeMat);
    shaft.position.set(0, 0, 0);
    launcherGroup.add(shaft);

    const leverGeo = new THREE.CylinderGeometry(1.2, 1.2, 10, 16);
    leverGeo.rotateZ(Math.PI / 3);
    const lever = new THREE.Mesh(leverGeo, chromeMat);
    lever.position.set(-6, -6, 0);
    launcherGroup.add(lever);

    const couplerGeo = new THREE.CylinderGeometry(3.5, 3.5, 18, 24);
    couplerGeo.rotateZ(Math.PI / 2);
    const coupler = new THREE.Mesh(couplerGeo, carriageMat);
    coupler.position.set(5, 12, 0);
    launcherGroup.add(coupler);

    scene.add(launcherGroup);
  };

  const buildFiberCable = (scene: THREE.Scene) => {
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(-66, 12, 0),
      new THREE.Vector3(-35, -20, 12),
      new THREE.Vector3(-15, -22, -10),
      new THREE.Vector3(0, 12, 0)
    );
    const fiberMesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 48, 0.9, 12, false),
      new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4, metalness: 0.2 })
    );
    scene.add(fiberMesh);
  };

  const buildFiberOutputChuckUpright = (scene: THREE.Scene) => {
    const chuckGroup = new THREE.Group();
    chuckGroup.position.set(0, 0, 0);

    const blackMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.7 });
    const carriage = new THREE.Mesh(new THREE.BoxGeometry(20, 6, 38), blackMat);
    carriage.position.set(0, -25, 0);
    chuckGroup.add(carriage);

    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 7.5, 20, 24), blackMat);
    pillar.position.set(0, -13, 0);
    chuckGroup.add(pillar);

    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 24, 24), chromeMat);
    shaft.position.set(0, 0, 0);
    chuckGroup.add(shaft);

    const leverGeo = new THREE.CylinderGeometry(1.2, 1.2, 10, 16);
    leverGeo.rotateZ(Math.PI / 3);
    const lever = new THREE.Mesh(leverGeo, chromeMat);
    lever.position.set(-6, -6, 0);
    chuckGroup.add(lever);

    const block = new THREE.Mesh(new THREE.BoxGeometry(8, 12, 8), blackMat);
    block.position.set(0, 12, 0);
    chuckGroup.add(block);

    const barrelGeo = new THREE.CylinderGeometry(2.2, 2.2, 18, 24);
    barrelGeo.rotateZ(Math.PI / 2);
    const barrel = new THREE.Mesh(barrelGeo, blackMat);
    barrel.position.set(9, 12, 0);
    chuckGroup.add(barrel);

    scene.add(chuckGroup);
  };

  const buildMovableScreenCarriage = (scene: THREE.Scene, initialL: number, initialSpotDiam: number) => {
    const spotRadius = Math.max(0.4, initialSpotDiam / 2.0);

    const coneGeo = new THREE.ConeGeometry(spotRadius, initialL, 48, 1, true);
    coneGeo.rotateZ(-Math.PI / 2);
    coneGeo.translate(initialL / 2, 12, 0);
    const cone = new THREE.Mesh(
      coneGeo,
      new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xff0022,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.32,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );
    lightConeRef.current = cone;
    scene.add(cone);

    const screenCarriage = new THREE.Group();
    screenCarriage.position.set(initialL, 0, 0);
    screenCarriageGroupRef.current = screenCarriage;

    const blackMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.7 });
    const carriage = new THREE.Mesh(new THREE.BoxGeometry(22, 6, 38), blackMat);
    carriage.position.set(0, -25, 0);
    screenCarriage.add(carriage);

    // Knurled thumb-screw (Photo 2)
    const microGeo = new THREE.CylinderGeometry(3.2, 3.2, 10, 24);
    microGeo.rotateZ(Math.PI / 2);
    const microScrew = new THREE.Mesh(microGeo, new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.85, roughness: 0.3 }));
    microScrew.position.set(-14, -25, 0);
    screenCarriage.add(microScrew);

    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 7.5, 20, 24), blackMat);
    pillar.position.set(0, -13, 0);
    screenCarriage.add(pillar);

    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 24, 24), chromeMat);
    shaft.position.set(0, 0, 0);
    screenCarriage.add(shaft);

    const leverGeo = new THREE.CylinderGeometry(1.2, 1.2, 10, 16);
    leverGeo.rotateZ(Math.PI / 3);
    const lever = new THREE.Mesh(leverGeo, chromeMat);
    lever.position.set(-6, -6, 0);
    screenCarriage.add(lever);

    const backPlate = new THREE.Mesh(new THREE.BoxGeometry(1.8, 68, 52), blackMat);
    backPlate.position.set(0, 12, 0);
    screenCarriage.add(backPlate);

    const screenFace = createExactPhotoTargetScreenMesh();
    screenFace.position.set(-1.0, 12, 0);
    screenCarriage.add(screenFace);

    const spotGeo = new THREE.CircleGeometry(spotRadius, 64);
    const spot = new THREE.Mesh(spotGeo, new THREE.MeshBasicMaterial({ color: 0xff0033, transparent: true, opacity: 0.95, side: THREE.DoubleSide }));
    spot.rotateY(-Math.PI / 2);
    spot.position.set(-1.05, 12, 0);
    spotMeshRef.current = spot;
    screenCarriage.add(spot);

    const haloGeo = new THREE.RingGeometry(spotRadius * 0.85, spotRadius * 1.35, 48);
    const halo = new THREE.Mesh(haloGeo, new THREE.MeshBasicMaterial({ color: 0xff3366, transparent: true, opacity: 0.45, side: THREE.DoubleSide }));
    halo.rotateY(-Math.PI / 2);
    halo.position.set(-1.06, 12, 0);
    spotHaloRef.current = halo;
    screenCarriage.add(halo);

    scene.add(screenCarriage);

    const lineMat = new THREE.LineBasicMaterial({ color: 0xfacc15, linewidth: 2 });
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -22, 0),
      new THREE.Vector3(initialL, -22, 0)
    ]);
    const dimensionLine = new THREE.Line(lineGeo, lineMat);
    dimensionLineRef.current = dimensionLine;
    scene.add(dimensionLine);

    const labelSprite = createTextSprite(`L = ${initialL.toFixed(1)} mm`);
    labelSprite.position.set(initialL / 2, -26, 0);
    dimensionLabelRef.current = labelSprite;
    scene.add(labelSprite);
  };

  const createExactPhotoTargetScreenMesh = (): THREE.Mesh => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 1024, 1024);

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, 1010, 1010);

      const centerX = 512;
      const centerY = 560;

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(centerX, 60);
      ctx.lineTo(centerX, 980);
      ctx.moveTo(60, centerY);
      ctx.lineTo(964, centerY);
      ctx.stroke();

      const scale = 10.0;
      const diameters = [4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80];

      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#1e293b';

      diameters.forEach((d, idx) => {
        const radius = (d / 2.0) * scale;
        ctx.strokeStyle = d % 20 === 0 ? '#1e293b' : '#64748b';
        ctx.lineWidth = d % 20 === 0 ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();

        const topY = centerY - radius;
        const labelY = 110 + (idx % 6) * 32;

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(centerX + (idx % 2 === 0 ? radius * 0.45 : radius * 0.7), topY + 5);
        ctx.lineTo(centerX + (idx % 2 === 0 ? radius * 0.45 : radius * 0.7), labelY);
        ctx.stroke();

        ctx.fillText(`${d}`, centerX + (idx % 2 === 0 ? radius * 0.45 : radius * 0.7), labelY - 14);
      });
    }

    const texture = new THREE.CanvasTexture(canvas);
    const planeGeo = new THREE.PlaneGeometry(50, 66);
    const planeMat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotateY(-Math.PI / 2);
    return mesh;
  };

  const createTextSprite = (text: string): THREE.Sprite => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.roundRect?.(10, 8, 236, 48, 8);
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 22px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 128, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture }));
    sprite.scale.set(18, 5, 1);
    return sprite;
  };

  const updateLabelSprite = (sprite: THREE.Sprite, text: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.roundRect?.(10, 8, 236, 48, 8);
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 22px Segoe UI, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 128, 32);
    }
    sprite.material.map?.dispose();
    sprite.material.map = new THREE.CanvasTexture(canvas);
    sprite.material.needsUpdate = true;
  };

  return (
    <div
      className={`relative w-full h-full min-h-[500px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 3D Viewport Controls Top Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        {/* Preset View Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700 pointer-events-auto shadow-lg">
          <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-cyan-400" /> View:
          </span>
          {(['3d', 'front', 'top', 'side'] as ViewPreset[]).map((preset) => (
            <button
              key={preset}
              onClick={() => setViewPreset(preset)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-all cursor-pointer ${
                activeView === preset
                  ? 'bg-cyan-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {preset === '3d'
                ? '3D Perspective'
                : preset === 'front'
                ? 'Screen Grid (Photo 2)'
                : preset === 'side'
                ? 'Bench Side (Photo 1)'
                : 'Overhead Top'}
            </button>
          ))}
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setViewPreset('3d')}
            title="Reset Camera View"
            className="p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 shadow-lg transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            className="p-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 shadow-lg transition-all cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Three.js Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing flex-1"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      />

      {/* Bottom HUD: Live Physical Readouts */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-3 bg-slate-900/95 backdrop-blur-md px-3.5 py-2.5 rounded-lg border border-slate-700 text-xs text-slate-300 pointer-events-auto shadow-lg">
          <div className="flex items-center gap-1.5 pr-2.5 border-r border-slate-700">
            <span className="text-slate-400">Distance L:</span>
            <span className="font-mono font-bold text-amber-400">{L.toFixed(1)} mm</span>
          </div>
          <div className="flex items-center gap-1.5 pr-2.5 border-r border-slate-700">
            <span className="text-slate-400">Spot Diam D:</span>
            <span className="font-mono font-bold text-rose-400">{spotDiameter.toFixed(2)} mm</span>
          </div>
          <div className="flex items-center gap-1.5 pr-2.5 border-r border-slate-700">
            <span className="text-slate-400">NA:</span>
            <span className="font-mono font-bold text-emerald-400">{na.toFixed(4)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">θ = sin⁻¹(NA):</span>
            <span className="font-mono font-bold text-sky-400">{thetaDeg.toFixed(2)}°</span>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
          <span>Drag: Orbit</span>
          <span>•</span>
          <span>Scroll: Zoom</span>
          <span>•</span>
          <span>Right Drag: Pan</span>
        </div>
      </div>
    </div>
  );
};
