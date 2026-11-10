import * as THREE from 'three';
import { LIVING_MOUNTAINS_PALETTE, MaterialLibrary } from './materials';
import {
  CHUNK_LENGTH_M,
  mountainRoad,
  PHASE2_MISSIONS,
  ROAD_WIDTH_M,
  RoadSample,
  TOTAL_CHUNKS_COUNT,
  WORLD_POIS,
} from './roadSpline';
import {
  EffectiveGraphicsQuality,
  SurfaceType,
  TimeOfDayPreset,
  WeatherPreset,
  WheelTelemetry,
} from './types';

interface TrafficVehicleAgent {
  distanceM: number;
  speedMs: number;
  baseSpeedMs: number;
  direction: 1 | -1;
  laneOffsetM: number;
  type: 'sedan' | 'pickup' | 'truck' | 'minibus';
  color: THREE.Color;
}

export interface HighlandWorld {
  worldGroup: THREE.Group;
  applyQuality: (quality: EffectiveGraphicsQuality) => void;
  applyAtmosphere: (
    timeOfDay: TimeOfDayPreset,
    weather: WeatherPreset,
    scene: THREE.Scene,
    sunLight: THREE.DirectionalLight,
    hemiLight: THREE.HemisphereLight
  ) => number;
  updateWorldStreamingAndTraffic: (
    elapsedSec: number,
    dt: number,
    playerDistanceM: number,
    playerPos: THREE.Vector3,
    playerSpeedKmh: number,
    playerSurface: SurfaceType,
    playerWheels: [WheelTelemetry, WheelTelemetry, WheelTelemetry, WheelTelemetry],
    finishDistanceM: number,
    aiRivalDistanceM?: number | null
  ) => {
    activeChunksCount: number;
    activeTrafficCount: number;
    lightningFlashTriggered: boolean;
  };
  dispose: () => void;
}

export function buildHighlandWorld(
  materials: MaterialLibrary,
  isSoftwareGl: boolean
): HighlandWorld {
  const worldGroup = new THREE.Group();
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

  const samples = mountainRoad.getAllSamples();
  const numSamples = samples.length;

  // 1. Continuous 15.0 km Road Mesh
  const roadVerts = new Float32Array(numSamples * 2 * 3);
  const roadNormals = new Float32Array(numSamples * 2 * 3);
  const roadUvs = new Float32Array(numSamples * 2 * 2);
  const roadColors = new Float32Array(numSamples * 2 * 3);
  const roadIndices = new Uint32Array((numSamples - 1) * 6);

  const surfaceColorMap: Record<RoadSample['surface'], THREE.Color> = {
    asphalt: new THREE.Color(LIVING_MOUNTAINS_PALETTE.asphaltGray),
    dirt: new THREE.Color(0x8c6d46),
    gravel: new THREE.Color(0x7c7870),
    sand: new THREE.Color(LIVING_MOUNTAINS_PALETTE.desertGold),
    mud: new THREE.Color(0x4e3b29),
    rock: new THREE.Color(0x635c54),
  };
  const tempColor = new THREE.Color();

  for (let i = 0; i < numSamples; i++) {
    const s = samples[i];
    const halfW = s.widthM * 0.5;

    const lx = s.position.x - s.binormal.x * halfW;
    const ly = s.position.y - s.binormal.y * halfW + 0.04;
    const lz = s.position.z - s.binormal.z * halfW;

    const rx = s.position.x + s.binormal.x * halfW;
    const ry = s.position.y + s.binormal.y * halfW + 0.04;
    const rz = s.position.z + s.binormal.z * halfW;

    const vIdx = i * 6;
    roadVerts[vIdx] = lx;
    roadVerts[vIdx + 1] = ly;
    roadVerts[vIdx + 2] = lz;
    roadVerts[vIdx + 3] = rx;
    roadVerts[vIdx + 4] = ry;
    roadVerts[vIdx + 5] = rz;

    roadNormals[vIdx] = s.normal.x;
    roadNormals[vIdx + 1] = s.normal.y;
    roadNormals[vIdx + 2] = s.normal.z;
    roadNormals[vIdx + 3] = s.normal.x;
    roadNormals[vIdx + 4] = s.normal.y;
    roadNormals[vIdx + 5] = s.normal.z;

    const uvIdx = i * 4;
    const vCoord = s.distanceM * 0.12;
    roadUvs[uvIdx] = 0;
    roadUvs[uvIdx + 1] = vCoord;
    roadUvs[uvIdx + 2] = 1;
    roadUvs[uvIdx + 3] = vCoord;

    tempColor.copy(surfaceColorMap[s.surface]);
    roadColors[vIdx] = tempColor.r;
    roadColors[vIdx + 1] = tempColor.g;
    roadColors[vIdx + 2] = tempColor.b;
    roadColors[vIdx + 3] = tempColor.r;
    roadColors[vIdx + 4] = tempColor.g;
    roadColors[vIdx + 5] = tempColor.b;

    if (i < numSamples - 1) {
      const idx = i * 6;
      const a = i * 2;
      const b = i * 2 + 1;
      const c = (i + 1) * 2;
      const d = (i + 1) * 2 + 1;
      roadIndices[idx] = a;
      roadIndices[idx + 1] = b;
      roadIndices[idx + 2] = c;
      roadIndices[idx + 3] = b;
      roadIndices[idx + 4] = d;
      roadIndices[idx + 5] = c;
    }
  }

  const roadGeo = trackGeo(new THREE.BufferGeometry());
  roadGeo.setAttribute('position', new THREE.BufferAttribute(roadVerts, 3));
  roadGeo.setAttribute('normal', new THREE.BufferAttribute(roadNormals, 3));
  roadGeo.setAttribute('uv', new THREE.BufferAttribute(roadUvs, 2));
  roadGeo.setAttribute('color', new THREE.BufferAttribute(roadColors, 3));
  roadGeo.setIndex(new THREE.BufferAttribute(roadIndices, 1));
  roadGeo.computeBoundingSphere();

  const roadMesh = new THREE.Mesh(roadGeo, materials.roadVertexMaterial);
  roadMesh.receiveShadow = !isSoftwareGl;
  worldGroup.add(roadMesh);

  // 2. Chunked Layered 3D Mountain Terrain (30 Chunks of 500m)
  const lateralProfile = [-88, -56, -32, -16, -8, -5.2, 5.2, 8.0, 18, 36, 62, 92];
  const cols = lateralProfile.length;

  const chunkGroups: THREE.Group[] = [];
  for (let cid = 0; cid < TOTAL_CHUNKS_COUNT; cid++) {
    const cg = new THREE.Group();
    cg.name = `WorldChunk_${cid}`;
    chunkGroups.push(cg);
    worldGroup.add(cg);
  }

  const cliffStoneCol = new THREE.Color(LIVING_MOUNTAINS_PALETTE.stoneBrown);
  const terraceGreenCol = new THREE.Color(LIVING_MOUNTAINS_PALETTE.mountainGreen);
  const desertSandCol = new THREE.Color(LIVING_MOUNTAINS_PALETTE.desertGold);
  const coastalBeachCol = new THREE.Color(0xc9b486);
  const wadiLushCol = new THREE.Color(0x3b6234);
  const tihamaEarthCol = new THREE.Color(0x9b825c);
  const copperStrataCol = new THREE.Color(LIVING_MOUNTAINS_PALETTE.warmCopper);

  for (let cid = 0; cid < TOTAL_CHUNKS_COUNT; cid++) {
    const chunkSamples = mountainRoad.getSamplesForChunk(cid);
    if (chunkSamples.length < 2) continue;

    const rows = chunkSamples.length;
    const tVerts = new Float32Array(rows * cols * 3);
    const tUvs = new Float32Array(rows * cols * 2);
    const tColors = new Float32Array(rows * cols * 3);
    const tIndices = new Uint32Array((rows - 1) * (cols - 1) * 6);

    for (let r = 0; r < rows; r++) {
      const s = chunkSamples[r];
      const halfRoad = s.widthM * 0.5;

      for (let c = 0; c < cols; c++) {
        const lat = lateralProfile[c];
        const wx = s.position.x + s.binormal.x * lat;
        const wz = s.position.z + s.binormal.z * lat;

        let wy = s.position.y + s.binormal.y * lat;
        if (Math.abs(lat) <= halfRoad + 0.5) {
          wy -= 0.08;
          tempColor.copy(cliffStoneCol);
        } else {
          const q = mountainRoad.queryGroundAtPoint(wx, wz, s.distanceM);
          wy = q.groundHeightY;
          if (Math.abs(lat) > 30) {
            wy += Math.sin(wx * 0.035 + wz * 0.042) * 6.5 + Math.cos(wx * 0.08) * 2.4;
          }

          if (s.regionId === 'masalik_desert') {
            tempColor.copy(desertSandCol);
          } else if (s.regionId === 'coastal_road') {
            tempColor.copy(lat > 0 ? coastalBeachCol : cliffStoneCol);
          } else if (s.regionId === 'tihama_plains') {
            tempColor.copy(tihamaEarthCol);
          } else if (s.regionId === 'wadi_rayhan') {
            tempColor.copy(c % 2 === 0 ? wadiLushCol : cliffStoneCol);
          } else {
            const heightBand = Math.abs(Math.floor(wy / 3.6)) % 4;
            if (heightBand === 0) tempColor.copy(terraceGreenCol);
            else if (heightBand === 2) tempColor.copy(cliffStoneCol).lerp(copperStrataCol, 0.28);
            else tempColor.copy(cliffStoneCol);
          }

          const shade = 0.88 + 0.18 * Math.sin(wx * 0.055 + wz * 0.055);
          tempColor.multiplyScalar(shade);
        }

        const idx3 = (r * cols + c) * 3;
        tVerts[idx3] = wx;
        tVerts[idx3 + 1] = wy;
        tVerts[idx3 + 2] = wz;

        const idx2 = (r * cols + c) * 2;
        tUvs[idx2] = lat * 0.08;
        tUvs[idx2 + 1] = s.distanceM * 0.08;

        tColors[idx3] = tempColor.r;
        tColors[idx3 + 1] = tempColor.g;
        tColors[idx3 + 2] = tempColor.b;
      }
    }

    let ptr = 0;
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const a = r * cols + c;
        const b = r * cols + c + 1;
        const d = (r + 1) * cols + c;
        const e = (r + 1) * cols + c + 1;
        tIndices[ptr++] = a;
        tIndices[ptr++] = b;
        tIndices[ptr++] = d;
        tIndices[ptr++] = b;
        tIndices[ptr++] = e;
        tIndices[ptr++] = d;
      }
    }

    const cGeo = trackGeo(new THREE.BufferGeometry());
    cGeo.setAttribute('position', new THREE.BufferAttribute(tVerts, 3));
    cGeo.setAttribute('uv', new THREE.BufferAttribute(tUvs, 2));
    cGeo.setAttribute('color', new THREE.BufferAttribute(tColors, 3));
    cGeo.setIndex(new THREE.BufferAttribute(tIndices, 1));
    cGeo.computeVertexNormals();
    cGeo.computeBoundingSphere();

    const cMesh = new THREE.Mesh(cGeo, materials.cliffRockMaterial);
    cMesh.receiveShadow = !isSoftwareGl;
    chunkGroups[cid].add(cMesh);
  }

  // 3. Coastal Sea Water Plane & Natural Distant Mountain Horizon Ring
  const seaMat = trackMat(
    new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      roughness: 0.14,
      metalness: 0.15,
      clearcoat: 0.95,
      transparent: true,
      opacity: 0.88,
    })
  );
  const coastMid = mountainRoad.getSampleAtDistance(11400);
  const seaGeo = trackGeo(new THREE.PlaneGeometry(2600, 2600));
  seaGeo.rotateX(-Math.PI * 0.5);
  const seaMesh = new THREE.Mesh(seaGeo, seaMat);
  seaMesh.position.set(
    coastMid.position.x + coastMid.binormal.x * 320,
    6.5,
    coastMid.position.z + coastMid.binormal.z * 320
  );
  worldGroup.add(seaMesh);

  // Distant Mountain Peaks Ring (follows player so world boundaries always look like natural mountain ranges)
  const horizonRingGroup = new THREE.Group();
  const peakGeo = trackGeo(new THREE.ConeGeometry(165, 290, 7));
  for (let p = 0; p < 18; p++) {
    const angle = (p / 18) * Math.PI * 2;
    const dist = 680 + (p % 3) * 85;
    const peak = new THREE.Mesh(peakGeo, materials.distantMountainMaterial);
    peak.position.set(
      Math.cos(angle) * dist,
      70 + (p % 4) * 22,
      Math.sin(angle) * dist
    );
    peak.rotation.y = p * 0.7;
    peak.scale.set(1.1 + (p % 3) * 0.25, 0.8 + (p % 4) * 0.25, 1.1);
    horizonRingGroup.add(peak);
  }
  worldGroup.add(horizonRingGroup);

  // 4. Tunnels, Stone Bridges, Guardrails & Chevron Signs
  const tunnelArchGeo = trackGeo(
    new THREE.CylinderGeometry(7.6, 7.6, 16, 12, 1, true, 0, Math.PI)
  );
  tunnelArchGeo.rotateZ(-Math.PI * 0.5);
  tunnelArchGeo.rotateY(Math.PI * 0.5);
  const tunnelMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x3b352e,
      roughness: 0.92,
      side: THREE.DoubleSide,
    })
  );
  const tunnelLampMat = trackMat(new THREE.MeshBasicMaterial({ color: 0xfef08a }));
  const tunnelLampGeo = trackGeo(new THREE.BoxGeometry(0.8, 0.15, 2.2));

  const bridgeWallGeo = trackGeo(new THREE.BoxGeometry(0.55, 1.4, 14));
  const bridgePillarGeo = trackGeo(new THREE.BoxGeometry(1.5, 18, 1.5));
  const guardrailRailGeo = trackGeo(new THREE.BoxGeometry(0.14, 0.32, 12.2));
  const chevronBoardGeo = trackGeo(new THREE.BoxGeometry(1.8, 0.95, 0.1));

  for (let i = 0; i < numSamples; i += 3) {
    const s = samples[i];
    const yaw = Math.atan2(s.tangent.x, -s.tangent.z);

    if (s.hasTunnel) {
      const tGrp = new THREE.Group();
      tGrp.position.copy(s.position);
      tGrp.rotation.y = yaw;
      const arch = new THREE.Mesh(tunnelArchGeo, tunnelMat);
      const lamp = new THREE.Mesh(tunnelLampGeo, tunnelLampMat);
      lamp.position.set(0, 7.1, 0);
      tGrp.add(arch, lamp);
      chunkGroups[s.chunkId].add(tGrp);
    }

    if (s.hasBridge) {
      const bGroup = new THREE.Group();
      bGroup.position.copy(s.position);
      bGroup.rotation.y = yaw;

      const leftParapet = new THREE.Mesh(bridgeWallGeo, materials.yemeniStoneMaterial);
      leftParapet.position.set(-s.widthM * 0.5 - 0.3, 0.7, 0);
      const rightParapet = new THREE.Mesh(bridgeWallGeo, materials.yemeniStoneMaterial);
      rightParapet.position.set(s.widthM * 0.5 + 0.3, 0.7, 0);

      const pillar = new THREE.Mesh(bridgePillarGeo, materials.yemeniStoneMaterial);
      pillar.position.set(0, -9.0, 0);

      bGroup.add(leftParapet, rightParapet, pillar);
      chunkGroups[s.chunkId].add(bGroup);
    } else if (Math.abs(s.curvature) > 0.0046 && !s.hasTunnel) {
      const curveSign = s.curvature > 0 ? -1 : 1;
      const lat = curveSign * (s.widthM * 0.5 + 0.45);
      const gx = s.position.x + s.binormal.x * lat;
      const gz = s.position.z + s.binormal.z * lat;
      const gy = s.position.y + s.binormal.y * lat;

      const rail = new THREE.Mesh(guardrailRailGeo, materials.guardrailMetalMaterial);
      rail.position.set(gx, gy + 0.55, gz);
      rail.rotation.y = yaw;
      chunkGroups[s.chunkId].add(rail);

      if (i % 9 === 0) {
        const chev = new THREE.Mesh(chevronBoardGeo, materials.chevronSignMaterial);
        chev.position.set(gx, gy + 1.45, gz);
        chev.rotation.y = yaw + (curveSign > 0 ? -0.35 : 0.35);
        chunkGroups[s.chunkId].add(chev);
      }
    }
  }

  // 5. POIs: Fuel, Workshops, Car Wash, Villages & Markets
  const fuelCanopyMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x059669,
      emissive: new THREE.Color(0x065f46),
      emissiveIntensity: 0.4,
      roughness: 0.32,
    })
  );
  const workshopMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: new THREE.Color(0x92400e),
      emissiveIntensity: 0.4,
      roughness: 0.38,
    })
  );
  const carWashArchMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: new THREE.Color(0x0369a1),
      emissiveIntensity: 0.45,
      roughness: 0.25,
    })
  );
  const whiteDomeMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.28,
    })
  );
  const streetLampBulbMat = trackMat(new THREE.MeshBasicMaterial({ color: 0xfde68a }));

  for (const poi of WORLD_POIS) {
    const s = mountainRoad.getSampleAtDistance(poi.distanceM);
    const yaw = Math.atan2(s.tangent.x, -s.tangent.z);
    const px = s.position.x + s.binormal.x * poi.lateralOffsetM;
    const pz = s.position.z + s.binormal.z * poi.lateralOffsetM;
    const py = s.position.y;

    const poiGroup = new THREE.Group();
    poiGroup.position.set(px, py, pz);
    poiGroup.rotation.y = yaw;

    const pole = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.1, 0.14, 6.2, 8)),
      materials.guardrailPostMaterial
    );
    pole.position.set(-3.8, 3.1, -4.5);
    const lampBulb = new THREE.Mesh(
      trackGeo(new THREE.SphereGeometry(0.32, 10, 8)),
      streetLampBulbMat
    );
    lampBulb.position.set(-3.8, 6.3, -4.5);
    poiGroup.add(pole, lampBulb);

    if (poi.type === 'fuel') {
      const canopy = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(6.5, 0.45, 9.5)),
        fuelCanopyMat
      );
      canopy.position.set(0, 4.4, 0);
      const col1 = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.22, 0.22, 4.4, 10)),
        materials.guardrailMetalMaterial
      );
      col1.position.set(-2.2, 2.2, -3.2);
      const col2 = col1.clone();
      col2.position.set(2.2, 2.2, 3.2);
      const pump = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.9, 1.8, 1.4)),
        workshopMat
      );
      pump.position.set(0, 0.9, 0);
      poiGroup.add(canopy, col1, col2, pump);
    } else if (poi.type === 'workshop') {
      const garageBay = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(7.5, 4.6, 8.5)),
        materials.yemeniStoneMaterial
      );
      garageBay.position.set(0, 2.3, 0);
      const signRoof = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(7.8, 0.7, 8.8)),
        workshopMat
      );
      signRoof.position.set(0, 4.8, 0);
      poiGroup.add(garageBay, signRoof);
    } else if (poi.type === 'car_wash') {
      const washArchLeft = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.5, 4.4, 6.5)),
        carWashArchMat
      );
      washArchLeft.position.set(-2.6, 2.2, 0);
      const washArchRight = washArchLeft.clone();
      washArchRight.position.set(2.6, 2.2, 0);
      const washRoofSign = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(6.2, 1.25, 0.4)),
        materials.carWashSignMaterial
      );
      washRoofSign.position.set(0, 4.8, -3.1);
      poiGroup.add(washArchLeft, washArchRight, washRoofSign);
    } else if (poi.type === 'village') {
      const prayerHall = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(8.5, 5.2, 8.5)),
        whiteDomeMat
      );
      prayerHall.position.set(0, 2.6, 0);
      const dome = new THREE.Mesh(
        trackGeo(new THREE.SphereGeometry(2.8, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5)),
        whiteDomeMat
      );
      dome.position.set(0, 5.2, 0);
      const minaret = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.75, 0.95, 14.5, 12)),
        materials.yemeniStoneMaterial
      );
      minaret.position.set(4.6, 7.25, 4.6);
      const minaretCap = new THREE.Mesh(
        trackGeo(new THREE.ConeGeometry(0.95, 2.4, 12)),
        whiteDomeMat
      );
      minaretCap.position.set(4.6, 15.6, 4.6);

      const shopBuilding = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(6.5, 4.2, 5.2)),
        materials.yemeniStoneMaterial
      );
      shopBuilding.position.set(0, 2.1, -9.2);
      const shopSign = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(5.8, 1.2, 0.3)),
        materials.marketSignMaterial
      );
      shopSign.position.set(0, 4.6, -6.5);

      poiGroup.add(prayerHall, dome, minaret, minaretCap, shopBuilding, shopSign);
    }

    chunkGroups[s.chunkId].add(poiGroup);
  }

  // 6. Instanced Trees, Highland Stone Towers & Mud-Brick Houses
  const dummy = new THREE.Object3D();

  const maxTrees = 720;
  const trunkGeo = trackGeo(new THREE.CylinderGeometry(0.18, 0.32, 2.4, 7));
  trunkGeo.translate(0, 1.2, 0);
  const canopyGeo = trackGeo(new THREE.DodecahedronGeometry(1.95, 1));
  canopyGeo.scale(1.38, 0.62, 1.38);
  canopyGeo.translate(0, 2.85, 0);

  const trunkInstanced = new THREE.InstancedMesh(
    trunkGeo,
    materials.treeTrunkMaterial,
    maxTrees
  );
  const canopyInstanced = new THREE.InstancedMesh(
    canopyGeo,
    materials.treeCanopyMaterial,
    maxTrees
  );

  for (let i = 0; i < maxTrees; i++) {
    const sIdx = Math.floor(((i * 43) % (numSamples - 20)) + 10);
    const s = samples[sIdx];
    const side = i % 2 === 0 ? -1 : 1;
    const lat = side * (9.8 + ((i * 19) % 38));
    const tx = s.position.x + s.binormal.x * lat;
    const tz = s.position.z + s.binormal.z * lat;
    const q = mountainRoad.queryGroundAtPoint(tx, tz, s.distanceM);

    const scale = 0.85 + ((i * 13) % 40) * 0.01;
    dummy.position.set(tx, q.groundHeightY - 0.15, tz);
    dummy.rotation.set(0, (i * 1.7) % (Math.PI * 2), 0);
    dummy.scale.set(scale, scale, scale);
    dummy.updateMatrix();
    trunkInstanced.setMatrixAt(i, dummy.matrix);
    canopyInstanced.setMatrixAt(i, dummy.matrix);
  }
  trunkInstanced.instanceMatrix.needsUpdate = true;
  canopyInstanced.instanceMatrix.needsUpdate = true;
  trunkInstanced.computeBoundingSphere();
  canopyInstanced.computeBoundingSphere();
  worldGroup.add(trunkInstanced, canopyInstanced);

  const maxStoneHouses = 85;
  const stoneHouseGeo = trackGeo(new THREE.BoxGeometry(6.4, 12.4, 6.4));
  stoneHouseGeo.translate(0, 6.2, 0);
  const stoneHouseInstanced = new THREE.InstancedMesh(
    stoneHouseGeo,
    materials.yemeniStoneMaterial,
    maxStoneHouses
  );
  for (let i = 0; i < maxStoneHouses; i++) {
    const sIdx = Math.floor(18 + i * ((numSamples * 0.56) / maxStoneHouses));
    const s = samples[sIdx];
    const side = i % 2 === 0 ? -1 : 1;
    const lat = side * (16 + (i % 4) * 6.5);
    const hx = s.position.x + s.binormal.x * lat;
    const hz = s.position.z + s.binormal.z * lat;
    const q = mountainRoad.queryGroundAtPoint(hx, hz, s.distanceM);
    const yaw = Math.atan2(s.tangent.x, s.tangent.z);
    dummy.position.set(hx, q.groundHeightY - 1.2, hz);
    dummy.rotation.set(0, yaw, 0);
    dummy.scale.set(
      0.9 + (i % 3) * 0.1,
      0.82 + (i % 4) * 0.16,
      0.9 + ((i + 1) % 3) * 0.1
    );
    dummy.updateMatrix();
    stoneHouseInstanced.setMatrixAt(i, dummy.matrix);
  }
  stoneHouseInstanced.instanceMatrix.needsUpdate = true;
  stoneHouseInstanced.computeBoundingSphere();
  worldGroup.add(stoneHouseInstanced);

  const maxMudHouses = 55;
  const mudHouseGeo = trackGeo(new THREE.BoxGeometry(7.2, 9.5, 6.8));
  mudHouseGeo.translate(0, 4.75, 0);
  const mudHouseInstanced = new THREE.InstancedMesh(
    mudHouseGeo,
    materials.yemeniMudBrickMaterial,
    maxMudHouses
  );
  for (let i = 0; i < maxMudHouses; i++) {
    const sIdx = Math.floor(
      numSamples * 0.45 + i * ((numSamples * 0.52) / maxMudHouses)
    );
    const s = samples[Math.min(numSamples - 1, sIdx)];
    const side = i % 2 === 0 ? 1 : -1;
    const lat = side * (17 + (i % 3) * 7.5);
    const hx = s.position.x + s.binormal.x * lat;
    const hz = s.position.z + s.binormal.z * lat;
    const q = mountainRoad.queryGroundAtPoint(hx, hz, s.distanceM);
    const yaw = Math.atan2(s.tangent.x, s.tangent.z);
    dummy.position.set(hx, q.groundHeightY - 1.0, hz);
    dummy.rotation.set(0, yaw, 0);
    dummy.scale.set(1.0, 0.78 + (i % 3) * 0.18, 1.0);
    dummy.updateMatrix();
    mudHouseInstanced.setMatrixAt(i, dummy.matrix);
  }
  mudHouseInstanced.instanceMatrix.needsUpdate = true;
  mudHouseInstanced.computeBoundingSphere();
  worldGroup.add(mudHouseInstanced);

  // Finish Archway
  const finishArchGroup = new THREE.Group();
  const pillarGeo = trackGeo(new THREE.BoxGeometry(0.65, 6.2, 0.65));
  pillarGeo.translate(0, 3.1, 0);
  const pillarMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.35 })
  );
  const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
  leftPillar.position.set(-ROAD_WIDTH_M * 0.5 - 0.4, 0, 0);
  const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
  rightPillar.position.set(ROAD_WIDTH_M * 0.5 + 0.4, 0, 0);
  const bannerMesh = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(ROAD_WIDTH_M + 1.6, 1.75, 0.35)),
    materials.finishBannerMaterial
  );
  bannerMesh.position.set(0, 5.4, 0);
  finishArchGroup.add(leftPillar, rightPillar, bannerMesh);
  worldGroup.add(finishArchGroup);

  const placeFinishArchAt = (distM: number) => {
    const fSample = mountainRoad.getSampleAtDistance(distM);
    finishArchGroup.position.copy(fSample.position);
    finishArchGroup.rotation.y = Math.atan2(fSample.tangent.x, -fSample.tangent.z);
  };
  placeFinishArchAt(PHASE2_MISSIONS[0].finishDistanceM);

  // 7. Celestial Sun/Moon, Stars & Clouds
  const celestialMat = trackMat(
    new THREE.MeshBasicMaterial({ color: 0xfef08a, fog: false })
  );
  const celestialDisc = new THREE.Mesh(
    trackGeo(new THREE.SphereGeometry(28, 16, 12)),
    celestialMat
  );
  worldGroup.add(celestialDisc);

  const starCount = 420;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const theta = (i * 2.39996) % (Math.PI * 2);
    const phi = Math.acos(1 - ((i + 0.5) / starCount) * 0.85);
    const r = 950;
    starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i * 3 + 1] = r * Math.cos(phi) + 120;
    starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const starGeo = trackGeo(new THREE.BufferGeometry());
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = trackMat(
    new THREE.PointsMaterial({
      color: 0xf8fafc,
      size: 2.8,
      transparent: true,
      opacity: 0.0,
      fog: false,
    })
  );
  const starsPoints = new THREE.Points(starGeo, starMat);
  worldGroup.add(starsPoints);

  const maxClouds = 42;
  const cloudGeo = trackGeo(new THREE.DodecahedronGeometry(18, 1));
  cloudGeo.scale(2.4, 0.42, 1.6);
  const cloudMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0xf8fafc,
      transparent: true,
      opacity: 0.35,
    })
  );
  const cloudsInstanced = new THREE.InstancedMesh(cloudGeo, cloudMat, maxClouds);
  cloudsInstanced.frustumCulled = false;
  worldGroup.add(cloudsInstanced);

  // 8. Weather Particles & Wheel Spray/Dust Plumes
  const maxParticles = 260;
  let activeParticleCount = 200;
  const particleGeo = trackGeo(new THREE.BoxGeometry(0.06, 0.85, 0.06));
  const particleMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0xcbd5e1,
      transparent: true,
      opacity: 0.0,
    })
  );
  const weatherParticles = new THREE.InstancedMesh(
    particleGeo,
    particleMat,
    maxParticles
  );
  weatherParticles.frustumCulled = false;
  worldGroup.add(weatherParticles);

  const maxWheelPlumes = 16;
  const plumeGeo = trackGeo(new THREE.DodecahedronGeometry(0.32, 0));
  const plumeMat = trackMat(
    new THREE.MeshBasicMaterial({
      color: 0xd6b06a,
      transparent: true,
      opacity: 0.0,
    })
  );
  const wheelPlumesInstanced = new THREE.InstancedMesh(
    plumeGeo,
    plumeMat,
    maxWheelPlumes
  );
  wheelPlumesInstanced.frustumCulled = false;
  worldGroup.add(wheelPlumesInstanced);

  // 9. Local AI Traffic & 3D AI Race Rival Vehicle
  const rivalGroup = new THREE.Group();
  const rivalBody = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.88, 0.95, 4.25)),
    trackMat(
      new THREE.MeshPhysicalMaterial({
        color: 0xeab308,
        metalness: 0.65,
        roughness: 0.2,
        clearcoat: 0.9,
      })
    )
  );
  rivalBody.position.set(0, 0.72, 0);
  const rivalCabin = new THREE.Mesh(
    trackGeo(new THREE.BoxGeometry(1.66, 0.52, 2.1)),
    trackMat(new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.15 }))
  );
  rivalCabin.position.set(0, 1.32, 0.15);
  rivalGroup.add(rivalBody, rivalCabin);
  rivalGroup.visible = false;
  worldGroup.add(rivalGroup);

  const maxTrafficAgents = 18;
  let activeTrafficCount = 14;
  let streamingChunkRadius = 3;
  const trafficAgents: TrafficVehicleAgent[] = [];
  const trafficColors = [
    new THREE.Color(0xf8fafc),
    new THREE.Color(0x0284c7),
    new THREE.Color(0xd97706),
    new THREE.Color(0xdc2626),
    new THREE.Color(0x16a34a),
    new THREE.Color(0x94a3b8),
  ];

  for (let i = 0; i < maxTrafficAgents; i++) {
    const dir = i % 2 === 0 ? 1 : -1;
    const types: TrafficVehicleAgent['type'][] = [
      'sedan',
      'pickup',
      'truck',
      'minibus',
    ];
    const tType = types[i % types.length];
    trafficAgents.push({
      distanceM: (i * 820 + 180) % 14800,
      speedMs: tType === 'truck' ? 10.5 : 14.5,
      baseSpeedMs: tType === 'truck' ? 10.5 : 14.5,
      direction: dir,
      laneOffsetM: dir === 1 ? 2.4 : -2.4,
      type: tType,
      color: trafficColors[i % trafficColors.length],
    });
  }

  const trafficBodyGeo = trackGeo(new THREE.BoxGeometry(1.85, 1.38, 4.2));
  trafficBodyGeo.translate(0, 0.85, 0);
  const trafficBodyMat = trackMat(
    new THREE.MeshStandardMaterial({ roughness: 0.32, metalness: 0.48 })
  );
  const trafficInstanced = new THREE.InstancedMesh(
    trafficBodyGeo,
    trafficBodyMat,
    maxTrafficAgents
  );
  trafficInstanced.frustumCulled = false;
  for (let i = 0; i < maxTrafficAgents; i++) {
    trafficInstanced.setColorAt(i, trafficAgents[i].color);
  }
  if (trafficInstanced.instanceColor) trafficInstanced.instanceColor.needsUpdate = true;
  worldGroup.add(trafficInstanced);

  let currentWeather: WeatherPreset = 'clear';
  let currentTimeOfDay: TimeOfDayPreset = 'morning';
  let lastFinishDistM = PHASE2_MISSIONS[0].finishDistanceM;
  let lastLightningTimeSec = 0;

  return {
    worldGroup,
    applyQuality: (quality: EffectiveGraphicsQuality) => {
      if (quality === 'low') {
        trunkInstanced.count = Math.floor(maxTrees * 0.35);
        canopyInstanced.count = Math.floor(maxTrees * 0.35);
        stoneHouseInstanced.count = Math.floor(maxStoneHouses * 0.45);
        mudHouseInstanced.count = Math.floor(maxMudHouses * 0.45);
        cloudsInstanced.count = 12;
        activeParticleCount = 80;
        activeTrafficCount = 6;
        streamingChunkRadius = 2;
      } else if (quality === 'medium') {
        trunkInstanced.count = Math.floor(maxTrees * 0.68);
        canopyInstanced.count = Math.floor(maxTrees * 0.68);
        stoneHouseInstanced.count = Math.floor(maxStoneHouses * 0.75);
        mudHouseInstanced.count = Math.floor(maxMudHouses * 0.75);
        cloudsInstanced.count = 24;
        activeParticleCount = 150;
        activeTrafficCount = 11;
        streamingChunkRadius = 3;
      } else if (quality === 'high') {
        trunkInstanced.count = Math.floor(maxTrees * 0.9);
        canopyInstanced.count = Math.floor(maxTrees * 0.9);
        stoneHouseInstanced.count = maxStoneHouses;
        mudHouseInstanced.count = maxMudHouses;
        cloudsInstanced.count = 34;
        activeParticleCount = 210;
        activeTrafficCount = 15;
        streamingChunkRadius = 4;
      } else {
        trunkInstanced.count = maxTrees;
        canopyInstanced.count = maxTrees;
        stoneHouseInstanced.count = maxStoneHouses;
        mudHouseInstanced.count = maxMudHouses;
        cloudsInstanced.count = maxClouds;
        activeParticleCount = maxParticles;
        activeTrafficCount = maxTrafficAgents;
        streamingChunkRadius = 5;
      }
      trafficInstanced.count = activeTrafficCount;
      weatherParticles.count = activeParticleCount;
    },
    applyAtmosphere: (timeOfDay, weather, scene, sunLight, hemiLight) => {
      currentWeather = weather;
      currentTimeOfDay = timeOfDay;

      const todPalettes: Record<
        TimeOfDayPreset,
        {
          sky: number;
          sunColor: number;
          sunIntensity: number;
          hemiIntensity: number;
          sunElev: number;
          nightGlow: number;
        }
      > = {
        dawn: {
          sky: 0x3b4d6b,
          sunColor: 0xfdba74,
          sunIntensity: 1.15,
          hemiIntensity: 0.58,
          sunElev: 25,
          nightGlow: 0.45,
        },
        sunrise: {
          sky: 0xd98a6c,
          sunColor: 0xfb923c,
          sunIntensity: 1.75,
          hemiIntensity: 0.72,
          sunElev: 45,
          nightGlow: 0.2,
        },
        morning: {
          sky: 0x87b8e2,
          sunColor: 0xfff4d6,
          sunIntensity: 2.2,
          hemiIntensity: 0.88,
          sunElev: 110,
          nightGlow: 0.05,
        },
        noon: {
          sky: 0x68bdf8,
          sunColor: 0xffffff,
          sunIntensity: 2.55,
          hemiIntensity: 0.96,
          sunElev: 180,
          nightGlow: 0.0,
        },
        afternoon: {
          sky: 0x81b6f5,
          sunColor: 0xfef08a,
          sunIntensity: 2.15,
          hemiIntensity: 0.84,
          sunElev: 105,
          nightGlow: 0.05,
        },
        sunset: {
          sky: 0xc87236,
          sunColor: 0xf97316,
          sunIntensity: 1.55,
          hemiIntensity: 0.62,
          sunElev: 28,
          nightGlow: 0.58,
        },
        night: {
          sky: 0x080d18,
          sunColor: 0x94a3b8,
          sunIntensity: 0.35,
          hemiIntensity: 0.28,
          sunElev: 85,
          nightGlow: 0.92,
        },
      };

      const p = todPalettes[timeOfDay];
      const finalSky = new THREE.Color(p.sky);
      let fogDensity = 0.0011;

      materials.setNightEmissiveIntensity(p.nightGlow);
      starMat.opacity = timeOfDay === 'night' ? 0.88 : timeOfDay === 'dawn' ? 0.32 : 0.0;
      celestialMat.color.setHex(timeOfDay === 'night' ? 0xe2e8f0 : p.sunColor);

      if (weather === 'cloudy') {
        finalSky.lerp(new THREE.Color(0x64748b), 0.45);
        fogDensity = 0.0018;
        materials.roadVertexMaterial.roughness = 0.82;
        materials.roadVertexMaterial.metalness = 0.06;
        particleMat.opacity = 0;
        cloudMat.opacity = 0.65;
      } else if (weather === 'light_rain') {
        finalSky.lerp(new THREE.Color(0x475569), 0.6);
        fogDensity = 0.0024;
        materials.roadVertexMaterial.roughness = 0.28;
        materials.roadVertexMaterial.metalness = 0.25;
        particleMat.color.setHex(0xcbd5e1);
        particleMat.opacity = 0.5;
        cloudMat.opacity = 0.72;
      } else if (weather === 'heavy_rain') {
        finalSky.lerp(new THREE.Color(0x283548), 0.78);
        fogDensity = 0.0036;
        materials.roadVertexMaterial.roughness = 0.16;
        materials.roadVertexMaterial.metalness = 0.38;
        particleMat.color.setHex(0xe2e8f0);
        particleMat.opacity = 0.76;
        cloudMat.opacity = 0.82;
      } else if (weather === 'mountain_fog') {
        finalSky.lerp(new THREE.Color(0xcbd5e1), timeOfDay === 'night' ? 0.15 : 0.72);
        fogDensity = 0.0052;
        materials.roadVertexMaterial.roughness = 0.62;
        materials.roadVertexMaterial.metalness = 0.1;
        particleMat.opacity = 0;
        cloudMat.opacity = 0.78;
      } else if (weather === 'sandstorm') {
        finalSky.lerp(new THREE.Color(0xc28549), 0.8);
        fogDensity = 0.0048;
        materials.roadVertexMaterial.roughness = 0.94;
        materials.roadVertexMaterial.metalness = 0.02;
        particleMat.color.setHex(0xd99b52);
        particleMat.opacity = 0.65;
        cloudMat.opacity = 0.5;
      } else {
        materials.roadVertexMaterial.roughness = 0.84;
        materials.roadVertexMaterial.metalness = 0.06;
        particleMat.opacity = 0;
        cloudMat.opacity = timeOfDay === 'night' ? 0.15 : 0.36;
      }

      scene.background = finalSky;
      scene.fog = new THREE.FogExp2(finalSky.getHex(), fogDensity);
      sunLight.color.setHex(p.sunColor);
      sunLight.intensity = p.sunIntensity;
      hemiLight.intensity = p.hemiIntensity;

      return finalSky.getHex();
    },
    updateWorldStreamingAndTraffic: (
      elapsedSec,
      dt,
      playerDistanceM,
      playerPos,
      playerSpeedKmh,
      playerSurface,
      playerWheels,
      finishDistanceM,
      aiRivalDistanceM
    ) => {
      if (Math.abs(finishDistanceM - lastFinishDistM) > 1) {
        lastFinishDistM = finishDistanceM;
        placeFinishArchAt(finishDistanceM);
      }

      // Position Horizon Mountain Ring, Celestial Disc & Stars relative to player
      horizonRingGroup.position.set(playerPos.x, playerPos.y - 45, playerPos.z);
      const sunAngle =
        currentTimeOfDay === 'sunset'
          ? -0.45
          : currentTimeOfDay === 'dawn' || currentTimeOfDay === 'sunrise'
          ? 0.45
          : 0.15;
      celestialDisc.position.set(
        playerPos.x + Math.sin(sunAngle) * 620,
        playerPos.y + (currentTimeOfDay === 'noon' ? 520 : 185),
        playerPos.z - 620
      );
      starsPoints.position.set(playerPos.x, playerPos.y, playerPos.z);

      // Update 3D AI Race Rival if active
      if (aiRivalDistanceM !== null && aiRivalDistanceM !== undefined) {
        rivalGroup.visible = true;
        const rSample = mountainRoad.getSampleAtDistance(aiRivalDistanceM);
        const rx = rSample.position.x - rSample.binormal.x * 1.9;
        const ry = rSample.position.y - rSample.binormal.y * 1.9;
        const rz = rSample.position.z - rSample.binormal.z * 1.9;
        rivalGroup.position.set(rx, ry, rz);
        rivalGroup.rotation.y = Math.atan2(rSample.tangent.x, -rSample.tangent.z);
      } else {
        rivalGroup.visible = false;
      }

      for (let c = 0; c < cloudsInstanced.count; c++) {
        const cx =
          playerPos.x +
          (((c * 113 + elapsedSec * 6.5) % 900) - 450);
        const cz = playerPos.z + (((c * 179) % 900) - 450);
        const cy = playerPos.y + 135 + (c % 5) * 18;
        dummy.position.set(cx, cy, cz);
        dummy.rotation.set(0, (c * 1.1) % Math.PI, 0);
        const cScale = 0.8 + (c % 4) * 0.35;
        dummy.scale.set(cScale, cScale, cScale);
        dummy.updateMatrix();
        cloudsInstanced.setMatrixAt(c, dummy.matrix);
      }
      cloudsInstanced.instanceMatrix.needsUpdate = true;

      const currentChunk = Math.floor(playerDistanceM / CHUNK_LENGTH_M);
      let loadedCount = 0;
      for (let cid = 0; cid < TOTAL_CHUNKS_COUNT; cid++) {
        const isNear = Math.abs(cid - currentChunk) <= streamingChunkRadius;
        chunkGroups[cid].visible = isNear;
        if (isNear) loadedCount++;
      }

      for (let i = 0; i < activeTrafficCount; i++) {
        const agent = trafficAgents[i];

        const relDist = agent.distanceM - playerDistanceM;
        if (relDist < -750) {
          agent.distanceM = Math.min(14900, playerDistanceM + 650 + ((i * 75) % 450));
        } else if (relDist > 1100) {
          agent.distanceM = Math.max(50, playerDistanceM - 550 - ((i * 65) % 350));
        }

        const s = mountainRoad.getSampleAtDistance(agent.distanceM);
        const slopeSlowdown = Math.abs(s.gradePct) > 8 ? 0.72 : 1.0;
        const distToPlayer = Math.abs(agent.distanceM - playerDistanceM);
        const playerProximityBrake = distToPlayer < 22 ? 0.25 : 1.0;

        agent.speedMs =
          agent.baseSpeedMs * slopeSlowdown * playerProximityBrake;
        agent.distanceM += agent.direction * agent.speedMs * dt;
        agent.distanceM = THREE.MathUtils.clamp(agent.distanceM, 30, 14950);

        const updatedSample = mountainRoad.getSampleAtDistance(agent.distanceM);
        const ax =
          updatedSample.position.x +
          updatedSample.binormal.x * agent.laneOffsetM;
        const ay =
          updatedSample.position.y +
          updatedSample.binormal.y * agent.laneOffsetM;
        const az =
          updatedSample.position.z +
          updatedSample.binormal.z * agent.laneOffsetM;

        const yaw =
          Math.atan2(updatedSample.tangent.x, -updatedSample.tangent.z) +
          (agent.direction === -1 ? Math.PI : 0);

        dummy.position.set(ax, ay, az);
        dummy.rotation.set(0, yaw, 0);
        if (agent.type === 'truck') {
          dummy.scale.set(1.18, 1.55, 1.48);
        } else if (agent.type === 'minibus') {
          dummy.scale.set(1.05, 1.32, 1.15);
        } else {
          dummy.scale.set(1.0, 1.0, 1.0);
        }
        dummy.updateMatrix();
        trafficInstanced.setMatrixAt(i, dummy.matrix);
      }
      trafficInstanced.instanceMatrix.needsUpdate = true;

      let lightningFlashTriggered = false;
      if (
        currentWeather === 'light_rain' ||
        currentWeather === 'heavy_rain' ||
        currentWeather === 'sandstorm'
      ) {
        weatherParticles.visible = true;
        const isSand = currentWeather === 'sandstorm';
        for (let i = 0; i < activeParticleCount; i++) {
          const ox = ((i * 17.3) % 44) - 22 + (isSand ? (elapsedSec * 18) % 22 : 0);
          const oz = ((i * 23.7) % 44) - 22;
          const oy = isSand
            ? ((i * 5.1 + elapsedSec * 4) % 9) + 0.3
            : 12 - ((i * 3.7 + elapsedSec * 22) % 12);

          dummy.position.set(playerPos.x + ox, playerPos.y + oy, playerPos.z + oz);
          dummy.rotation.set(0, 0, isSand ? 1.15 : 0.12);
          dummy.scale.set(isSand ? 2.5 : 1, isSand ? 0.35 : 1, isSand ? 2.5 : 1);
          dummy.updateMatrix();
          weatherParticles.setMatrixAt(i, dummy.matrix);
        }
        weatherParticles.instanceMatrix.needsUpdate = true;

        if (
          currentWeather === 'heavy_rain' &&
          elapsedSec - lastLightningTimeSec > 16 &&
          Math.sin(elapsedSec * 13.7) > 0.985
        ) {
          lastLightningTimeSec = elapsedSec;
          lightningFlashTriggered = true;
        }
      } else {
        weatherParticles.visible = false;
      }

      const isWetRoad =
        currentWeather === 'light_rain' || currentWeather === 'heavy_rain';
      const isDustySurface =
        playerSurface === 'dirt' ||
        playerSurface === 'sand' ||
        playerSurface === 'gravel' ||
        playerSurface === 'mud';

      if (playerSpeedKmh > 12 && (isDustySurface || isWetRoad)) {
        wheelPlumesInstanced.visible = true;
        if (isWetRoad && playerSurface === 'asphalt') {
          plumeMat.color.setHex(0xe2e8f0);
        } else if (playerSurface === 'mud') {
          plumeMat.color.setHex(0x5c422c);
        } else if (playerSurface === 'sand') {
          plumeMat.color.setHex(0xd4a253);
        } else {
          plumeMat.color.setHex(0x9c8265);
        }

        const speedFactor = THREE.MathUtils.clamp((playerSpeedKmh - 12) / 75, 0.1, 1.0);
        plumeMat.opacity = speedFactor * 0.42;

        const rearLeft = playerWheels[2];
        const rearRight = playerWheels[3];
        for (let p = 0; p < maxWheelPlumes; p++) {
          const wRef = p % 2 === 0 ? rearLeft : rearRight;
          const life = (elapsedSec * 3.5 + p * 0.19) % 1;
          dummy.position.set(
            wRef.worldX + Math.sin(p * 3.1) * 0.35 * life,
            wRef.worldY + 0.25 + life * 1.15 * speedFactor,
            wRef.worldZ + Math.cos(p * 2.7) * 0.35 * life
          );
          const sc = (0.35 + life * 1.45) * speedFactor;
          dummy.scale.set(sc, sc, sc);
          dummy.updateMatrix();
          wheelPlumesInstanced.setMatrixAt(p, dummy.matrix);
        }
        wheelPlumesInstanced.instanceMatrix.needsUpdate = true;
      } else {
        wheelPlumesInstanced.visible = false;
      }

      return {
        activeChunksCount: loadedCount,
        activeTrafficCount,
        lightningFlashTriggered,
      };
    },
    dispose: () => {
      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
    },
  };
}
