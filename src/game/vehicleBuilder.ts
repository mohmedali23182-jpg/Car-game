import * as THREE from 'three';
import { WheelTelemetry } from './types';

export interface OffroadVehicleVisuals {
  rootGroup: THREE.Group;
  chassisGroup: THREE.Group;
  steeringWheelGroup: THREE.Group;
  wheelSteeringGroups: [THREE.Group, THREE.Group, THREE.Group, THREE.Group];
  wheelSpinGroups: [THREE.Group, THREE.Group, THREE.Group, THREE.Group];
  suspensionStruts: [THREE.Mesh, THREE.Mesh, THREE.Mesh, THREE.Mesh];
  brakeLightMaterial: THREE.MeshStandardMaterial;
  cockpitCameraAnchor: THREE.Object3D;
  chaseCameraTarget: THREE.Object3D;
  updateVisuals: (
    position: THREE.Vector3,
    quaternion: THREE.Quaternion,
    chassisPitchRad: number,
    chassisRollRad: number,
    steeringAngleRad: number,
    braking: boolean,
    wheels: [WheelTelemetry, WheelTelemetry, WheelTelemetry, WheelTelemetry]
  ) => void;
  dispose: () => void;
}

/**
 * Builds an original, rugged 12-part procedural 3D 4x4 Mountain Expedition SUV ("مَسَالِك 4x4")
 * with independent rotating/steering wheel assemblies, visible suspension struts,
 * roof expedition rack, rear spare tire, working brake lights, and cockpit interior.
 */
export function buildOffroadVehicle(isSoftwareGl: boolean): OffroadVehicleVisuals {
  const geometriesToDispose: THREE.BufferGeometry[] = [];
  const materialsToDispose: THREE.Material[] = [];

  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometriesToDispose.push(g);
    return g;
  };
  const trackMat = <T extends THREE.Material>(m: T): T => {
    materialsToDispose.push(m);
    return m;
  };

  // Materials across varied roughness/metalness scales
  const bodyPaintMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xd97724, // Desert Amber / Highland Terracotta Metallic
      metalness: 0.55,
      roughness: 0.26,
      clearcoat: 0.85,
      clearcoatRoughness: 0.14,
    })
  );

  const roofWhiteMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xf1ede4, // Classic expedition white roof cap
      metalness: 0.2,
      roughness: 0.42,
    })
  );

  const darkTrimMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x1b2028, // Heavy-duty offroad polymer/steel fenders & bumpers
      metalness: 0.45,
      roughness: 0.68,
    })
  );

  const steelBullbarMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x333b48,
      metalness: 0.85,
      roughness: 0.28,
    })
  );

  const glassMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x1e293b,
      metalness: 0.1,
      roughness: 0.08,
      transmission: isSoftwareGl ? 0 : 0.72,
      transparent: true,
      opacity: isSoftwareGl ? 0.42 : 0.88,
      depthWrite: false,
    })
  );

  const tireRubberMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x181a1f,
      metalness: 0.08,
      roughness: 0.88,
    })
  );

  const alloyRimMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.88,
      roughness: 0.22,
    })
  );

  const headlightMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      emissive: new THREE.Color(0xfef3c7),
      emissiveIntensity: 1.4,
      roughness: 0.15,
    })
  );

  const brakeLightMaterial = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      emissive: new THREE.Color(0xef4444),
      emissiveIntensity: 0.35,
      roughness: 0.25,
    })
  );

  const jerrycanMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      metalness: 0.35,
      roughness: 0.52,
    })
  );

  const springCoilMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xeab308, // Yellow heavy-duty coilover strut
      metalness: 0.65,
      roughness: 0.32,
    })
  );

  const rootGroup = new THREE.Group();
  const chassisGroup = new THREE.Group();
  rootGroup.add(chassisGroup);

  // 1. Primary Silhouette: Extruded Side-Profile SUV Lower Body Hull
  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(-2.15, 0.42);
  bodyShape.lineTo(2.15, 0.42);
  bodyShape.lineTo(2.22, 0.96);
  bodyShape.lineTo(1.95, 1.18); // Hood front edge
  bodyShape.lineTo(0.88, 1.24); // Base of windshield
  bodyShape.lineTo(0.45, 1.86); // Top of windshield
  bodyShape.lineTo(-1.82, 1.86); // Roofline
  bodyShape.lineTo(-2.12, 1.18); // Rear D-pillar
  bodyShape.lineTo(-2.18, 0.52);
  bodyShape.closePath();

  const hullGeo = trackGeo(
    new THREE.ExtrudeGeometry(bodyShape, {
      depth: 1.84,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.05,
      bevelSegments: 3,
    })
  );
  // Rotate so length is along -Z (forward) and width is along X
  hullGeo.translate(0, 0, -0.92);
  hullGeo.rotateY(Math.PI * 0.5);

  const mainBodyMesh = new THREE.Mesh(hullGeo, bodyPaintMat);
  mainBodyMesh.castShadow = !isSoftwareGl;
  mainBodyMesh.receiveShadow = !isSoftwareGl;
  chassisGroup.add(mainBodyMesh);

  // 2. White Expedition Roof Cap
  const roofCapGeo = trackGeo(new THREE.BoxGeometry(1.82, 0.11, 2.28));
  const roofCapMesh = new THREE.Mesh(roofCapGeo, roofWhiteMat);
  roofCapMesh.position.set(0, 1.9, 0.68);
  roofCapMesh.castShadow = !isSoftwareGl;
  chassisGroup.add(roofCapMesh);

  // 3. Flared Off-road Wheel Fenders (4 arches) + Side Running Boards
  const fenderGeo = trackGeo(new THREE.BoxGeometry(0.24, 0.34, 0.96));
  const fenderOffsets = [
    [-0.95, 0.66, -1.35],
    [0.95, 0.66, -1.35],
    [-0.95, 0.66, 1.35],
    [0.95, 0.66, 1.35],
  ];
  for (const [fx, fy, fz] of fenderOffsets) {
    const fender = new THREE.Mesh(fenderGeo, darkTrimMat);
    fender.position.set(fx, fy, fz);
    chassisGroup.add(fender);
  }

  const stepBoardGeo = trackGeo(new THREE.BoxGeometry(0.22, 0.08, 1.72));
  const stepLeft = new THREE.Mesh(stepBoardGeo, darkTrimMat);
  stepLeft.position.set(-0.98, 0.42, 0);
  const stepRight = new THREE.Mesh(stepBoardGeo, darkTrimMat);
  stepRight.position.set(0.98, 0.42, 0);
  chassisGroup.add(stepLeft, stepRight);

  // 4. Windows & Windshield Glass
  const windshieldGeo = trackGeo(new THREE.BoxGeometry(1.68, 0.64, 0.06));
  const windshieldMesh = new THREE.Mesh(windshieldGeo, glassMat);
  windshieldMesh.position.set(0, 1.54, -0.66);
  windshieldMesh.rotation.x = -0.58;
  windshieldMesh.renderOrder = 2;
  chassisGroup.add(windshieldMesh);

  const sideWindowGeo = trackGeo(new THREE.BoxGeometry(1.94, 0.48, 1.96));
  const sideWindowMesh = new THREE.Mesh(sideWindowGeo, glassMat);
  sideWindowMesh.position.set(0, 1.54, 0.68);
  sideWindowMesh.renderOrder = 2;
  chassisGroup.add(sideWindowMesh);

  // 5. Front Grille, Bullbar, Winch & Circular Off-road Headlights
  const grilleGeo = trackGeo(new THREE.BoxGeometry(1.66, 0.42, 0.12));
  const grilleMesh = new THREE.Mesh(grilleGeo, darkTrimMat);
  grilleMesh.position.set(0, 0.92, -2.18);
  chassisGroup.add(grilleMesh);

  const frontBumperGeo = trackGeo(new THREE.BoxGeometry(2.04, 0.26, 0.28));
  const frontBumperMesh = new THREE.Mesh(frontBumperGeo, steelBullbarMat);
  frontBumperMesh.position.set(0, 0.56, -2.24);
  chassisGroup.add(frontBumperMesh);

  // Bullbar tube frame
  const bullbarTopGeo = trackGeo(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 10));
  bullbarTopGeo.rotateZ(Math.PI * 0.5);
  const bullbarTop = new THREE.Mesh(bullbarTopGeo, steelBullbarMat);
  bullbarTop.position.set(0, 1.04, -2.34);
  chassisGroup.add(bullbarTop);

  const headlightGeo = trackGeo(new THREE.CylinderGeometry(0.14, 0.14, 0.08, 16));
  headlightGeo.rotateX(Math.PI * 0.5);
  const hlLeft = new THREE.Mesh(headlightGeo, headlightMat);
  hlLeft.position.set(-0.62, 0.93, -2.22);
  const hlRight = new THREE.Mesh(headlightGeo, headlightMat);
  hlRight.position.set(0.62, 0.93, -2.22);
  chassisGroup.add(hlLeft, hlRight);

  // 6. Expedition Roof Rack + Spare Gear & Jerrycans
  const rackRailGeo = trackGeo(new THREE.BoxGeometry(1.66, 0.08, 2.05));
  const rackMesh = new THREE.Mesh(rackRailGeo, steelBullbarMat);
  rackMesh.position.set(0, 2.0, 0.72);
  chassisGroup.add(rackMesh);

  const jerrycanGeo = trackGeo(new THREE.BoxGeometry(0.36, 0.28, 0.48));
  const jc1 = new THREE.Mesh(jerrycanGeo, jerrycanMat);
  jc1.position.set(-0.46, 2.16, 0.95);
  const jc2 = new THREE.Mesh(jerrycanGeo, jerrycanMat);
  jc2.position.set(0.46, 2.16, 0.95);
  chassisGroup.add(jc1, jc2);

  // 7. Rear Bumper, Brake Lights & Tailgate Spare Wheel
  const rearBumperGeo = trackGeo(new THREE.BoxGeometry(2.02, 0.25, 0.24));
  const rearBumper = new THREE.Mesh(rearBumperGeo, steelBullbarMat);
  rearBumper.position.set(0, 0.54, 2.18);
  chassisGroup.add(rearBumper);

  const tailLightGeo = trackGeo(new THREE.BoxGeometry(0.24, 0.34, 0.08));
  const tlLeft = new THREE.Mesh(tailLightGeo, brakeLightMaterial);
  tlLeft.position.set(-0.82, 0.94, 2.16);
  const tlRight = new THREE.Mesh(tailLightGeo, brakeLightMaterial);
  tlRight.position.set(0.82, 0.94, 2.16);
  chassisGroup.add(tlLeft, tlRight);

  // Rear mounted spare tire
  const spareTireGeo = trackGeo(new THREE.CylinderGeometry(0.41, 0.41, 0.28, 20));
  spareTireGeo.rotateX(Math.PI * 0.5);
  const spareTire = new THREE.Mesh(spareTireGeo, tireRubberMat);
  spareTire.position.set(0.18, 1.12, 2.26);
  const spareRimGeo = trackGeo(new THREE.CylinderGeometry(0.24, 0.24, 0.3, 14));
  spareRimGeo.rotateX(Math.PI * 0.5);
  const spareRim = new THREE.Mesh(spareRimGeo, alloyRimMat);
  spareRim.position.set(0.18, 1.12, 2.26);
  chassisGroup.add(spareTire, spareRim);

  // 8. Cockpit Interior: Dashboard, A-Pillars & Dynamic Steering Wheel (for Camera 2!)
  const dashGeo = trackGeo(new THREE.BoxGeometry(1.62, 0.32, 0.44));
  const dashMesh = new THREE.Mesh(dashGeo, darkTrimMat);
  dashMesh.position.set(0, 1.18, -0.52);
  chassisGroup.add(dashMesh);

  const steeringWheelGroup = new THREE.Group();
  steeringWheelGroup.position.set(-0.42, 1.28, -0.28);
  steeringWheelGroup.rotation.x = -0.35;

  const swRingGeo = trackGeo(new THREE.TorusGeometry(0.19, 0.026, 10, 24));
  const swRing = new THREE.Mesh(swRingGeo, darkTrimMat);
  const swSpokeGeo = trackGeo(new THREE.BoxGeometry(0.34, 0.035, 0.025));
  const swSpoke = new THREE.Mesh(swSpokeGeo, alloyRimMat);
  steeringWheelGroup.add(swRing, swSpoke);
  chassisGroup.add(steeringWheelGroup);

  // Cockpit camera anchor (Driver eye level inside left-hand-drive cabin)
  const cockpitCameraAnchor = new THREE.Object3D();
  cockpitCameraAnchor.position.set(-0.42, 1.58, -0.02);
  chassisGroup.add(cockpitCameraAnchor);

  const chaseCameraTarget = new THREE.Object3D();
  chaseCameraTarget.position.set(0, 1.4, -1.5);
  chassisGroup.add(chaseCameraTarget);

  // 9-12. Four Independent Multi-Part Wheel & Suspension Strut Assemblies
  const wheelGeo = trackGeo(new THREE.CylinderGeometry(0.44, 0.44, 0.32, 24));
  wheelGeo.rotateZ(Math.PI * 0.5);

  const rimGeo = trackGeo(new THREE.CylinderGeometry(0.26, 0.26, 0.33, 16));
  rimGeo.rotateZ(Math.PI * 0.5);

  const spokeBarGeo = trackGeo(new THREE.BoxGeometry(0.35, 0.06, 0.46));
  const strutGeo = trackGeo(new THREE.CylinderGeometry(0.055, 0.055, 0.58, 10));

  const wheelMountPositions: [number, number, number][] = [
    [-0.96, 0.44, -1.35], // FL
    [0.96, 0.44, -1.35],  // FR
    [-0.96, 0.44, 1.35],  // RL
    [0.96, 0.44, 1.35],   // RR
  ];

  const wheelSteeringGroups: [THREE.Group, THREE.Group, THREE.Group, THREE.Group] = [
    new THREE.Group(),
    new THREE.Group(),
    new THREE.Group(),
    new THREE.Group(),
  ];

  const wheelSpinGroups: [THREE.Group, THREE.Group, THREE.Group, THREE.Group] = [
    new THREE.Group(),
    new THREE.Group(),
    new THREE.Group(),
    new THREE.Group(),
  ];

  const suspensionStruts: [THREE.Mesh, THREE.Mesh, THREE.Mesh, THREE.Mesh] = [] as unknown as [
    THREE.Mesh,
    THREE.Mesh,
    THREE.Mesh,
    THREE.Mesh
  ];

  for (let i = 0; i < 4; i++) {
    const [wx, wy, wz] = wheelMountPositions[i];
    const steerGroup = wheelSteeringGroups[i];
    const spinGroup = wheelSpinGroups[i];

    steerGroup.position.set(wx, wy, wz);

    const tireMesh = new THREE.Mesh(wheelGeo, tireRubberMat);
    tireMesh.castShadow = !isSoftwareGl;
    const rimMesh = new THREE.Mesh(rimGeo, alloyRimMat);
    const spoke1 = new THREE.Mesh(spokeBarGeo, darkTrimMat);
    const spoke2 = new THREE.Mesh(spokeBarGeo, darkTrimMat);
    spoke2.rotation.x = Math.PI * 0.5;

    spinGroup.add(tireMesh, rimMesh, spoke1, spoke2);
    steerGroup.add(spinGroup);
    rootGroup.add(steerGroup);

    // Visible coilover suspension strut linking wheel arch to wheel hub
    const strutMesh = new THREE.Mesh(strutGeo, springCoilMat);
    strutMesh.position.set(wx * 0.82, wy + 0.34, wz);
    rootGroup.add(strutMesh);
    suspensionStruts[i] = strutMesh;
  }

  // Soft Grounding Contact Shadow Plane directly under the SUV
  const shadowPlaneGeo = trackGeo(new THREE.PlaneGeometry(2.6, 4.9));
  shadowPlaneGeo.rotateX(-Math.PI * 0.5);
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sctx = shadowCanvas.getContext('2d')!;
  const grad = sctx.createRadialGradient(64, 64, 12, 64, 64, 60);
  grad.addColorStop(0, 'rgba(0,0,0,0.62)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 128, 128);
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const contactShadowMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.55,
    })
  );
  const contactShadowMesh = new THREE.Mesh(shadowPlaneGeo, contactShadowMat);
  contactShadowMesh.position.set(0, 0.04, 0);
  rootGroup.add(contactShadowMesh);

  return {
    rootGroup,
    chassisGroup,
    steeringWheelGroup,
    wheelSteeringGroups,
    wheelSpinGroups,
    suspensionStruts,
    brakeLightMaterial,
    cockpitCameraAnchor,
    chaseCameraTarget,
    updateVisuals: (
      position,
      quaternion,
      chassisPitchRad,
      chassisRollRad,
      steeringAngleRad,
      braking,
      wheels
    ) => {
      rootGroup.position.copy(position);
      rootGroup.quaternion.copy(quaternion);

      // Dynamic suspension body pitch/roll on bumps, acceleration squat, and cornering
      chassisGroup.rotation.set(chassisPitchRad, 0, chassisRollRad);

      // Steering wheel inside cockpit rotates proportionally
      steeringWheelGroup.rotation.z = -steeringAngleRad * 6.5;

      // Brake lights glow brightly when braking
      brakeLightMaterial.emissiveIntensity = braking ? 2.4 : 0.35;

      // Update each wheel's vertical suspension travel, steering angle, and rolling spin
      for (let i = 0; i < 4; i++) {
        const w = wheels[i];
        const [baseWx, baseWy, baseWz] = wheelMountPositions[i];
        // Compression raises wheel relative to chassis rest pose
        const travelOffsetY = (w.compressionRatio - 0.35) * 0.28;
        wheelSteeringGroups[i].position.set(baseWx, baseWy + travelOffsetY, baseWz);
        wheelSteeringGroups[i].rotation.y = w.steerAngleRad;
        wheelSpinGroups[i].rotation.x = w.rotationRad;

        // Compress/extend visible suspension strut
        const strutScaleY = Math.max(0.45, 1.15 - w.compressionRatio * 0.55);
        suspensionStruts[i].scale.set(1, strutScaleY, 1);
        suspensionStruts[i].position.set(
          baseWx * 0.82,
          baseWy + 0.34 + travelOffsetY * 0.5,
          baseWz
        );
      }
    },
    dispose: () => {
      shadowTex.dispose();
      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
    },
  };
}
