import * as THREE from 'three';
import { LIVING_MOUNTAINS_PALETTE, MaterialLibrary } from './materials';
import {
  CHUNK_LENGTH_M,
  mountainRoad,
  PHASE2_MISSIONS,
  ROAD_WIDTH_M,
  RoadSample,
  TOTAL_CHUNKS_COUNT,
  TOTAL_ROAD_LENGTH_M,
  WORLD_POIS,
} from './roadSpline';
import {
  EffectiveGraphicsQuality,
  NearbyTrafficSignalInfo,
  SurfaceType,
  TimeOfDayPreset,
  TrafficSignalPhase,
  WeatherPreset,
  WheelTelemetry,
} from './types';

export function presetToWorldTimeHours(preset: TimeOfDayPreset): number {
  switch (preset) {
    case 'dawn':
      return 5.4;
    case 'sunrise':
      return 6.35;
    case 'morning':
      return 9.0;
    case 'noon':
      return 12.75;
    case 'afternoon':
      return 15.75;
    case 'sunset':
      return 18.0;
    case 'night':
      return 22.4;
  }
}

export function worldTimeHoursToPreset(rawHours: number): TimeOfDayPreset {
  const h = ((rawHours % 24) + 24) % 24;
  if (h >= 4.8 && h < 5.9) return 'dawn';
  if (h >= 5.9 && h < 7.2) return 'sunrise';
  if (h >= 7.2 && h < 11.2) return 'morning';
  if (h >= 11.2 && h < 14.5) return 'noon';
  if (h >= 14.5 && h < 17.2) return 'afternoon';
  if (h >= 17.2 && h < 19.3) return 'sunset';
  return 'night';
}

export function formatWorldTimeHours(rawHours: number): string {
  const h = ((rawHours % 24) + 24) % 24;
  const hh = Math.floor(h);
  const mm = Math.floor((h - hh) * 60);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

interface AtmosphereKeyframe {
  hour: number;
  sky: number;
  sunColor: number;
  sunIntensity: number;
  hemiIntensity: number;
  nightFactor: number;
  starOpacity: number;
}

const ATMOSPHERE_KEYFRAMES: AtmosphereKeyframe[] = [
  { hour: 0.0, sky: 0x060b16, sunColor: 0x94a3b8, sunIntensity: 0.34, hemiIntensity: 0.28, nightFactor: 1.0, starOpacity: 0.92 },
  { hour: 4.8, sky: 0x162238, sunColor: 0x94a3b8, sunIntensity: 0.45, hemiIntensity: 0.34, nightFactor: 0.85, starOpacity: 0.65 },
  { hour: 5.8, sky: 0x4b5578, sunColor: 0xfdba74, sunIntensity: 1.12, hemiIntensity: 0.56, nightFactor: 0.45, starOpacity: 0.25 },
  { hour: 6.7, sky: 0xd98a6c, sunColor: 0xfb923c, sunIntensity: 1.78, hemiIntensity: 0.72, nightFactor: 0.16, starOpacity: 0.0 },
  { hour: 8.8, sky: 0x82b6e4, sunColor: 0xfff4d6, sunIntensity: 2.25, hemiIntensity: 0.88, nightFactor: 0.0, starOpacity: 0.0 },
  { hour: 12.6, sky: 0x5eb8f8, sunColor: 0xffffff, sunIntensity: 2.55, hemiIntensity: 0.96, nightFactor: 0.0, starOpacity: 0.0 },
  { hour: 16.0, sky: 0x7db3f0, sunColor: 0xfef08a, sunIntensity: 2.15, hemiIntensity: 0.84, nightFactor: 0.0, starOpacity: 0.0 },
  { hour: 17.9, sky: 0xc86d32, sunColor: 0xf97316, sunIntensity: 1.52, hemiIntensity: 0.62, nightFactor: 0.52, starOpacity: 0.05 },
  { hour: 19.3, sky: 0x18233a, sunColor: 0xf59e0b, sunIntensity: 0.58, hemiIntensity: 0.38, nightFactor: 0.88, starOpacity: 0.58 },
  { hour: 21.2, sky: 0x080d18, sunColor: 0x94a3b8, sunIntensity: 0.36, hemiIntensity: 0.29, nightFactor: 1.0, starOpacity: 0.9 },
  { hour: 24.0, sky: 0x060b16, sunColor: 0x94a3b8, sunIntensity: 0.34, hemiIntensity: 0.28, nightFactor: 1.0, starOpacity: 0.92 },
];

export function sampleContinuousAtmosphere(rawHours: number): {
  skyColor: THREE.Color;
  sunColor: THREE.Color;
  sunIntensity: number;
  hemiIntensity: number;
  nightFactor: number;
  starOpacity: number;
} {
  const h = ((rawHours % 24) + 24) % 24;
  let k0 = ATMOSPHERE_KEYFRAMES[0];
  let k1 = ATMOSPHERE_KEYFRAMES[ATMOSPHERE_KEYFRAMES.length - 1];
  for (let i = 0; i < ATMOSPHERE_KEYFRAMES.length - 1; i++) {
    if (h >= ATMOSPHERE_KEYFRAMES[i].hour && h <= ATMOSPHERE_KEYFRAMES[i + 1].hour) {
      k0 = ATMOSPHERE_KEYFRAMES[i];
      k1 = ATMOSPHERE_KEYFRAMES[i + 1];
      break;
    }
  }
  const span = Math.max(0.001, k1.hour - k0.hour);
  const t = THREE.MathUtils.clamp((h - k0.hour) / span, 0, 1);
  const smoothT = t * t * (3 - 2 * t);

  const skyColor = new THREE.Color(k0.sky).lerp(new THREE.Color(k1.sky), smoothT);
  const sunColor = new THREE.Color(k0.sunColor).lerp(new THREE.Color(k1.sunColor), smoothT);
  return {
    skyColor,
    sunColor,
    sunIntensity: THREE.MathUtils.lerp(k0.sunIntensity, k1.sunIntensity, smoothT),
    hemiIntensity: THREE.MathUtils.lerp(k0.hemiIntensity, k1.hemiIntensity, smoothT),
    nightFactor: THREE.MathUtils.lerp(k0.nightFactor, k1.nightFactor, smoothT),
    starOpacity: THREE.MathUtils.lerp(k0.starOpacity, k1.starOpacity, smoothT),
  };
}

interface TrafficVehicleAgent {
  distanceM: number;
  speedMs: number;
  baseSpeedMs: number;
  direction: 1 | -1;
  laneOffsetM: number;
  type: 'sedan' | 'pickup' | 'truck' | 'minibus';
  color: THREE.Color;
}

interface TrafficSignalNode {
  id: string;
  nameAr: string;
  distanceM: number;
  offsetSec: number;
  phase: TrafficSignalPhase;
  secondsRemaining: number;
  redMat: THREE.MeshStandardMaterial;
  yellowMat: THREE.MeshStandardMaterial;
  greenMat: THREE.MeshStandardMaterial;
}

export interface HighlandWorld {
  worldGroup: THREE.Group;
  applyQuality: (quality: EffectiveGraphicsQuality) => void;
  applyAtmosphere: (
    timeOfDayOrHours: TimeOfDayPreset | number,
    weather: WeatherPreset,
    scene: THREE.Scene,
    sunLight: THREE.DirectionalLight,
    hemiLight: THREE.HemisphereLight
  ) => { skyHex: number; nightFactor: number };
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
    nearbyTrafficSignal: NearbyTrafficSignalInfo | null;
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
          } else if (s.regionId === 'ibb_green_peaks') {
            tempColor.copy(c % 3 === 0 ? wadiLushCol : terraceGreenCol);
          } else if (s.regionId === 'sanaa_highlands') {
            tempColor.copy(cliffStoneCol).lerp(copperStrataCol, c % 2 === 0 ? 0.35 : 0.12);
          } else if (s.regionId === 'shibam_hadramout') {
            tempColor.copy(desertSandCol).lerp(copperStrataCol, 0.22);
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

  // Shibam Hadramout Iconic Mud-Brick Skyscrapers ("Manhattan of the Desert") & Sana'a Qamariya Towers
  const shibamTowerCount = 34;
  const shibamTowerGeo = trackGeo(new THREE.BoxGeometry(7.4, 24.0, 6.8));
  shibamTowerGeo.translate(0, 12.0, 0);
  const shibamTowersInstanced = new THREE.InstancedMesh(
    shibamTowerGeo,
    materials.yemeniMudBrickMaterial,
    shibamTowerCount
  );
  for (let i = 0; i < shibamTowerCount; i++) {
    const distM = 19950 + i * 56;
    const s = mountainRoad.getSampleAtDistance(distM);
    const side = i % 2 === 0 ? -1 : 1;
    const lat = side * (16.5 + (i % 4) * 6.2);
    const tx = s.position.x + s.binormal.x * lat;
    const tz = s.position.z + s.binormal.z * lat;
    const q = mountainRoad.queryGroundAtPoint(tx, tz, s.distanceM);
    const yaw = Math.atan2(s.tangent.x, s.tangent.z);
    dummy.position.set(tx, q.groundHeightY - 1.2, tz);
    dummy.rotation.set(0, yaw, 0);
    dummy.scale.set(
      0.85 + (i % 3) * 0.14,
      0.88 + (i % 4) * 0.19,
      0.85 + ((i + 1) % 3) * 0.12
    );
    dummy.updateMatrix();
    shibamTowersInstanced.setMatrixAt(i, dummy.matrix);
  }
  shibamTowersInstanced.instanceMatrix.needsUpdate = true;
  shibamTowersInstanced.computeBoundingSphere();
  worldGroup.add(shibamTowersInstanced);

  // Sana'a Highland Basalt & Qamariya Stone Towers (15.1km - 17.3km)
  const sanaaTowerCount = 28;
  const sanaaTowerGeo = trackGeo(new THREE.BoxGeometry(6.8, 16.5, 6.8));
  sanaaTowerGeo.translate(0, 8.25, 0);
  const sanaaTowersInstanced = new THREE.InstancedMesh(
    sanaaTowerGeo,
    materials.yemeniStoneMaterial,
    sanaaTowerCount
  );
  for (let i = 0; i < sanaaTowerCount; i++) {
    const distM = 15120 + i * 78;
    const s = mountainRoad.getSampleAtDistance(distM);
    const side = i % 2 === 0 ? -1 : 1;
    const lat = side * (15.5 + (i % 3) * 6.5);
    const tx = s.position.x + s.binormal.x * lat;
    const tz = s.position.z + s.binormal.z * lat;
    const q = mountainRoad.queryGroundAtPoint(tx, tz, s.distanceM);
    const yaw = Math.atan2(s.tangent.x, s.tangent.z);
    dummy.position.set(tx, q.groundHeightY - 1.2, tz);
    dummy.rotation.set(0, yaw, 0);
    dummy.scale.set(0.95, 0.85 + (i % 4) * 0.14, 0.95);
    dummy.updateMatrix();
    sanaaTowersInstanced.setMatrixAt(i, dummy.matrix);
  }
  sanaaTowersInstanced.instanceMatrix.needsUpdate = true;
  sanaaTowersInstanced.computeBoundingSphere();
  worldGroup.add(sanaaTowersInstanced);

  // 6B. REAL URBAN STREETS: Illuminated 3D Street Lamps + Warm Ground Glow Pools + Crosswalks
  const urbanLampSpecs: { x: number; y: number; z: number; yaw: number; side: number; halfW: number }[] = [];
  const urbanStreetZones: [number, number, number][] = [
    [50, 1520, 40],      // Taiz City Avenue
    [5050, 5780, 44],    // Wadi Rayhan Town Street
    [8050, 9220, 40],    // Tihama Boulevard
    [10650, 12280, 38],  // Aden Coastal Corniche
    [15050, 16420, 38],  // Sana'a Old City Boulevard
    [17420, 18460, 42],  // Ibb Green City Avenue
    [19920, 21520, 40],  // Shibam Hadramout Boulevard
  ];

  for (const [startM, endM, stepM] of urbanStreetZones) {
    let toggleSide = 0;
    for (let d = startM; d <= endM; d += stepM) {
      const s = mountainRoad.getSampleAtDistance(d);
      if (s.hasTunnel) continue;
      const yaw = Math.atan2(s.tangent.x, -s.tangent.z);
      const halfW = s.widthM * 0.5;
      // Place paired lamps on boulevards and staggered along avenues
      const sides = toggleSide % 2 === 0 ? [-1, 1] : [1];
      for (const side of sides) {
        const lat = side * (halfW + 1.05);
        urbanLampSpecs.push({
          x: s.position.x + s.binormal.x * lat,
          y: s.position.y + s.binormal.y * lat,
          z: s.position.z + s.binormal.z * lat,
          yaw,
          side,
          halfW,
        });
      }
      toggleSide++;
    }
  }

  const lampCount = urbanLampSpecs.length;
  const lampPoleGeo = trackGeo(new THREE.CylinderGeometry(0.08, 0.13, 6.8, 7));
  lampPoleGeo.translate(0, 3.4, 0);
  const lampArmGeo = trackGeo(new THREE.BoxGeometry(1.75, 0.11, 0.14));
  const lampHeadGeo = trackGeo(new THREE.BoxGeometry(0.58, 0.14, 0.28));

  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = 64;
  glowCanvas.height = 64;
  const gCtx = glowCanvas.getContext('2d');
  if (gCtx) {
    const gr = gCtx.createRadialGradient(32, 32, 2, 32, 32, 30);
    gr.addColorStop(0, 'rgba(255, 224, 145, 0.92)');
    gr.addColorStop(0.5, 'rgba(251, 191, 36, 0.36)');
    gr.addColorStop(1, 'rgba(251, 191, 36, 0.0)');
    gCtx.fillStyle = gr;
    gCtx.fillRect(0, 0, 64, 64);
  }
  const lampGlowTex = new THREE.CanvasTexture(glowCanvas);

  const urbanPoleMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.72, roughness: 0.38 })
  );
  const urbanLampHeadMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      emissive: new THREE.Color(0xfbbf24),
      emissiveIntensity: 0.2,
      roughness: 0.25,
    })
  );
  const urbanGroundGlowMat = trackMat(
    new THREE.MeshBasicMaterial({
      map: lampGlowTex,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  const lampGlowPoolGeo = trackGeo(new THREE.PlaneGeometry(8.5, 8.5));
  lampGlowPoolGeo.rotateX(-Math.PI * 0.5);

  const streetLampPolesInstanced = new THREE.InstancedMesh(lampPoleGeo, urbanPoleMat, lampCount);
  const streetLampArmsInstanced = new THREE.InstancedMesh(lampArmGeo, urbanPoleMat, lampCount);
  const streetLampHeadsInstanced = new THREE.InstancedMesh(lampHeadGeo, urbanLampHeadMat, lampCount);
  const streetLampGlowsInstanced = new THREE.InstancedMesh(lampGlowPoolGeo, urbanGroundGlowMat, lampCount);

  for (let i = 0; i < lampCount; i++) {
    const lp = urbanLampSpecs[i];
    const inward = -lp.side;
    const cosY = Math.cos(lp.yaw);
    const sinY = Math.sin(lp.yaw);

    // Pole
    dummy.position.set(lp.x, lp.y - 0.1, lp.z);
    dummy.rotation.set(0, lp.yaw, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    streetLampPolesInstanced.setMatrixAt(i, dummy.matrix);

    // Cantilever arm reaching over the street lane
    const armOffsetX = inward * 0.82;
    dummy.position.set(
      lp.x + armOffsetX * cosY,
      lp.y + 6.65,
      lp.z - armOffsetX * sinY
    );
    dummy.rotation.set(0, lp.yaw, 0);
    dummy.updateMatrix();
    streetLampArmsInstanced.setMatrixAt(i, dummy.matrix);

    // Emissive luminaire fixture
    const headOffsetX = inward * 1.55;
    dummy.position.set(
      lp.x + headOffsetX * cosY,
      lp.y + 6.52,
      lp.z - headOffsetX * sinY
    );
    dummy.rotation.set(0, lp.yaw, 0);
    dummy.updateMatrix();
    streetLampHeadsInstanced.setMatrixAt(i, dummy.matrix);

    // Soft warm amber light pool projected onto the asphalt below
    const poolOffsetX = inward * 2.15;
    dummy.position.set(
      lp.x + poolOffsetX * cosY,
      lp.y + 0.12,
      lp.z - poolOffsetX * sinY
    );
    dummy.rotation.set(0, lp.yaw, 0);
    dummy.updateMatrix();
    streetLampGlowsInstanced.setMatrixAt(i, dummy.matrix);
  }
  streetLampPolesInstanced.instanceMatrix.needsUpdate = true;
  streetLampArmsInstanced.instanceMatrix.needsUpdate = true;
  streetLampHeadsInstanced.instanceMatrix.needsUpdate = true;
  streetLampGlowsInstanced.instanceMatrix.needsUpdate = true;
  streetLampPolesInstanced.computeBoundingSphere();
  streetLampArmsInstanced.computeBoundingSphere();
  streetLampHeadsInstanced.computeBoundingSphere();
  streetLampGlowsInstanced.computeBoundingSphere();
  worldGroup.add(
    streetLampPolesInstanced,
    streetLampArmsInstanced,
    streetLampHeadsInstanced,
    streetLampGlowsInstanced
  );

  // 6C. WORKING 3D TRAFFIC LIGHT INTERSECTIONS & CROSSWALKS (7 Yemeni City Crossings)
  const signalDefinitions: { id: string; nameAr: string; distanceM: number }[] = [
    { id: 'sig_taiz', nameAr: 'تقاطع جولة تعز', distanceM: 640 },
    { id: 'sig_wadi', nameAr: 'تقاطع وادي ريحان', distanceM: 5360 },
    { id: 'sig_tihama', nameAr: 'تقاطع شارع تهامة', distanceM: 8480 },
    { id: 'sig_aden', nameAr: 'تقاطع كورنيش عدن', distanceM: 11320 },
    { id: 'sig_sanaa', nameAr: 'تقاطع باب صنعاء', distanceM: 15520 },
    { id: 'sig_ibb', nameAr: 'تقاطع بوابة إب الخضراء', distanceM: 17820 },
    { id: 'sig_shibam', nameAr: 'تقاطع شبام حضرموت', distanceM: 20450 },
  ];

  const signalHousingMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.6 })
  );
  const crosswalkMat = trackMat(
    new THREE.MeshBasicMaterial({ color: 0xf8fafc, transparent: true, opacity: 0.85 })
  );
  const signalPoleGeo = trackGeo(new THREE.CylinderGeometry(0.14, 0.18, 6.4, 8));
  const signalCantileverGeo = trackGeo(new THREE.BoxGeometry(6.8, 0.22, 0.22));
  const signalBoxGeo = trackGeo(new THREE.BoxGeometry(0.62, 1.65, 0.42));
  const signalLensGeo = trackGeo(new THREE.CircleGeometry(0.18, 12));
  const crosswalkStripeGeo = trackGeo(new THREE.PlaneGeometry(0.75, 2.8));
  crosswalkStripeGeo.rotateX(-Math.PI * 0.5);

  const trafficSignals: TrafficSignalNode[] = [];

  signalDefinitions.forEach((def, idx) => {
    const s = mountainRoad.getSampleAtDistance(def.distanceM);
    const yaw = Math.atan2(s.tangent.x, -s.tangent.z);
    const halfW = s.widthM * 0.5;

    const redMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x7f1d1d,
        emissive: new THREE.Color(0xef4444),
        emissiveIntensity: 0.1,
      })
    );
    const yellowMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x78350f,
        emissive: new THREE.Color(0xf59e0b),
        emissiveIntensity: 0.1,
      })
    );
    const greenMat = trackMat(
      new THREE.MeshStandardMaterial({
        color: 0x14532d,
        emissive: new THREE.Color(0x22c55e),
        emissiveIntensity: 2.2,
      })
    );

    const gGroup = new THREE.Group();
    gGroup.position.copy(s.position);
    gGroup.rotation.y = yaw;

    // Right-side vertical gantry pole & overhead beam
    const rPole = new THREE.Mesh(signalPoleGeo, urbanPoleMat);
    rPole.position.set(halfW + 0.85, 3.2, 0);
    const lPole = new THREE.Mesh(signalPoleGeo, urbanPoleMat);
    lPole.position.set(-(halfW + 0.85), 3.2, 0);

    const overheadBeam = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(s.widthM + 2.1, 0.26, 0.26)),
      urbanPoleMat
    );
    overheadBeam.position.set(0, 6.2, 0);
    gGroup.add(rPole, lPole, overheadBeam);

    // Mount two overhead signal heads (one per travel lane, visible from both directions)
    const laneXs = [2.1, -2.1];
    for (const lx of laneXs) {
      const box = new THREE.Mesh(signalBoxGeo, signalHousingMat);
      box.position.set(lx, 5.45, 0);
      gGroup.add(box);

      // Front-facing (+Z faces approaching forward player) & rear-facing (-Z) lenses
      const faceZOffsets = [0.22, -0.22];
      for (const fz of faceZOffsets) {
        const rotY = fz > 0 ? 0 : Math.PI;
        const rLens = new THREE.Mesh(signalLensGeo, redMat);
        rLens.position.set(lx, 5.88, fz);
        rLens.rotation.y = rotY;

        const yLens = new THREE.Mesh(signalLensGeo, yellowMat);
        yLens.position.set(lx, 5.45, fz);
        yLens.rotation.y = rotY;

        const gLens = new THREE.Mesh(signalLensGeo, greenMat);
        gLens.position.set(lx, 5.02, fz);
        gLens.rotation.y = rotY;

        gGroup.add(rLens, yLens, gLens);
      }
    }

    // Zebra crosswalk stripes on road surface right before the gantry
    for (let sx = -halfW + 0.9; sx <= halfW - 0.9; sx += 1.45) {
      const stripe = new THREE.Mesh(crosswalkStripeGeo, crosswalkMat);
      stripe.position.set(sx, 0.08, 3.2);
      gGroup.add(stripe);
    }

    // Also add unused cantilever reference disposal coverage
    if (idx === -1) {
      gGroup.add(new THREE.Mesh(signalCantileverGeo, urbanPoleMat));
    }

    chunkGroups[s.chunkId].add(gGroup);

    trafficSignals.push({
      id: def.id,
      nameAr: def.nameAr,
      distanceM: def.distanceM,
      offsetSec: idx * 7.5,
      phase: 'green',
      secondsRemaining: 12,
      redMat,
      yellowMat,
      greenMat,
    });
  });

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

  const maxTrafficAgents = 28;
  let activeTrafficCount = 22;
  let streamingChunkRadius = 3;
  const trafficAgents: TrafficVehicleAgent[] = [];
  const trafficColors = [
    new THREE.Color(0xf8fafc),
    new THREE.Color(0x0284c7),
    new THREE.Color(0xd97706),
    new THREE.Color(0xdc2626),
    new THREE.Color(0x16a34a),
    new THREE.Color(0x94a3b8),
    new THREE.Color(0x475569),
    new THREE.Color(0xeab308),
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
      distanceM: (i * 760 + 160) % (TOTAL_ROAD_LENGTH_M - 180),
      speedMs: tType === 'truck' ? 10.5 : tType === 'minibus' ? 12.5 : 15.0,
      baseSpeedMs: tType === 'truck' ? 10.5 : tType === 'minibus' ? 12.5 : 15.0,
      direction: dir,
      laneOffsetM: dir === 1 ? 2.45 : -2.45,
      type: tType,
      color: trafficColors[i % trafficColors.length],
    });
  }

  // Multi-Part Lively AI Traffic: Body + Tinted Cabin + Headlights + Glowing Taillights
  const trafficBodyGeo = trackGeo(new THREE.BoxGeometry(1.88, 0.82, 4.25));
  trafficBodyGeo.translate(0, 0.62, 0);
  const trafficBodyMat = trackMat(
    new THREE.MeshStandardMaterial({ roughness: 0.28, metalness: 0.52 })
  );
  const trafficInstanced = new THREE.InstancedMesh(
    trafficBodyGeo,
    trafficBodyMat,
    maxTrafficAgents
  );
  trafficInstanced.frustumCulled = false;

  const trafficCabinGeo = trackGeo(new THREE.BoxGeometry(1.66, 0.62, 2.25));
  trafficCabinGeo.translate(0, 1.32, 0.12);
  const trafficCabinMat = trackMat(
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.16, metalness: 0.72 })
  );
  const trafficCabinInstanced = new THREE.InstancedMesh(
    trafficCabinGeo,
    trafficCabinMat,
    maxTrafficAgents
  );
  trafficCabinInstanced.frustumCulled = false;

  const trafficHeadlightGeo = trackGeo(new THREE.BoxGeometry(1.52, 0.2, 0.12));
  trafficHeadlightGeo.translate(0, 0.76, -2.14);
  const trafficHeadlightMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0xfffbeb,
      emissive: new THREE.Color(0xfef3c7),
      emissiveIntensity: 0.65,
    })
  );
  const trafficHeadlightsInstanced = new THREE.InstancedMesh(
    trafficHeadlightGeo,
    trafficHeadlightMat,
    maxTrafficAgents
  );
  trafficHeadlightsInstanced.frustumCulled = false;

  const trafficTaillightGeo = trackGeo(new THREE.BoxGeometry(1.54, 0.2, 0.12));
  trafficTaillightGeo.translate(0, 0.78, 2.14);
  const trafficTaillightMat = trackMat(
    new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      emissive: new THREE.Color(0xef4444),
      emissiveIntensity: 0.75,
    })
  );
  const trafficTaillightsInstanced = new THREE.InstancedMesh(
    trafficTaillightGeo,
    trafficTaillightMat,
    maxTrafficAgents
  );
  trafficTaillightsInstanced.frustumCulled = false;

  for (let i = 0; i < maxTrafficAgents; i++) {
    trafficInstanced.setColorAt(i, trafficAgents[i].color);
  }
  if (trafficInstanced.instanceColor) trafficInstanced.instanceColor.needsUpdate = true;
  worldGroup.add(
    trafficInstanced,
    trafficCabinInstanced,
    trafficHeadlightsInstanced,
    trafficTaillightsInstanced
  );

  let currentWeather: WeatherPreset = 'clear';
  let currentWorldHours = 8.75;
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
        activeTrafficCount = 10;
        streamingChunkRadius = 2;
      } else if (quality === 'medium') {
        trunkInstanced.count = Math.floor(maxTrees * 0.68);
        canopyInstanced.count = Math.floor(maxTrees * 0.68);
        stoneHouseInstanced.count = Math.floor(maxStoneHouses * 0.75);
        mudHouseInstanced.count = Math.floor(maxMudHouses * 0.75);
        cloudsInstanced.count = 24;
        activeParticleCount = 150;
        activeTrafficCount = 16;
        streamingChunkRadius = 3;
      } else if (quality === 'high') {
        trunkInstanced.count = Math.floor(maxTrees * 0.9);
        canopyInstanced.count = Math.floor(maxTrees * 0.9);
        stoneHouseInstanced.count = maxStoneHouses;
        mudHouseInstanced.count = maxMudHouses;
        cloudsInstanced.count = 34;
        activeParticleCount = 210;
        activeTrafficCount = 22;
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
      trafficCabinInstanced.count = activeTrafficCount;
      trafficHeadlightsInstanced.count = activeTrafficCount;
      trafficTaillightsInstanced.count = activeTrafficCount;
      weatherParticles.count = activeParticleCount;
    },
    applyAtmosphere: (timeOfDayOrHours, weather, scene, sunLight, hemiLight) => {
      currentWeather = weather;
      const hours =
        typeof timeOfDayOrHours === 'number'
          ? ((timeOfDayOrHours % 24) + 24) % 24
          : presetToWorldTimeHours(timeOfDayOrHours);
      currentWorldHours = hours;

      const atm = sampleContinuousAtmosphere(hours);
      const finalSky = atm.skyColor.clone();
      let fogDensity = 0.00105;

      // Smooth night glow across buildings, street lamps, and AI traffic lights
      materials.setNightEmissiveIntensity(atm.nightFactor * 0.96);
      starMat.opacity = atm.starOpacity;
      celestialMat.color.copy(atm.nightFactor > 0.72 ? new THREE.Color(0xe2e8f0) : atm.sunColor);

      const streetLampGlow = THREE.MathUtils.clamp((atm.nightFactor - 0.18) / 0.55, 0, 1);
      urbanLampHeadMat.emissiveIntensity = 0.25 + streetLampGlow * 3.1;
      urbanGroundGlowMat.opacity = streetLampGlow * 0.52;
      streetLampGlowsInstanced.visible = streetLampGlow > 0.04;

      trafficHeadlightMat.emissiveIntensity = 0.45 + streetLampGlow * 2.8;
      trafficTaillightMat.emissiveIntensity = 0.65 + streetLampGlow * 2.2;

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
        finalSky.lerp(new THREE.Color(0xcbd5e1), atm.nightFactor > 0.6 ? 0.18 : 0.72);
        fogDensity = 0.005;
        materials.roadVertexMaterial.roughness = 0.62;
        materials.roadVertexMaterial.metalness = 0.1;
        particleMat.opacity = 0;
        cloudMat.opacity = 0.78;
      } else if (weather === 'sandstorm') {
        finalSky.lerp(new THREE.Color(0xc28549), 0.78);
        fogDensity = 0.0046;
        materials.roadVertexMaterial.roughness = 0.94;
        materials.roadVertexMaterial.metalness = 0.02;
        particleMat.color.setHex(0xd99b52);
        particleMat.opacity = 0.65;
        cloudMat.opacity = 0.5;
      } else {
        materials.roadVertexMaterial.roughness = 0.84;
        materials.roadVertexMaterial.metalness = 0.06;
        particleMat.opacity = 0;
        cloudMat.opacity = atm.nightFactor > 0.65 ? 0.14 : 0.36;
      }

      scene.background = finalSky;
      scene.fog = new THREE.FogExp2(finalSky.getHex(), fogDensity);
      sunLight.color.copy(atm.sunColor);
      sunLight.intensity = atm.sunIntensity;
      hemiLight.intensity = atm.hemiIntensity;

      return { skyHex: finalSky.getHex(), nightFactor: atm.nightFactor };
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

      // Position Horizon Mountain Ring, Continuous 24h Celestial Arc (Sun/Moon) & Stars
      horizonRingGroup.position.set(playerPos.x, playerPos.y - 45, playerPos.z);
      const isNightDisc = currentWorldHours < 5.6 || currentWorldHours >= 19.2;
      const arcProgress = isNightDisc
        ? (((currentWorldHours + 4.8) % 24) / 10.4)
        : THREE.MathUtils.clamp((currentWorldHours - 5.6) / 13.6, 0, 1);
      const arcAngle = (arcProgress - 0.5) * Math.PI * 0.88;
      celestialDisc.position.set(
        playerPos.x + Math.sin(arcAngle) * 640,
        playerPos.y + 95 + Math.cos(arcAngle) * 440,
        playerPos.z - 620
      );
      starsPoints.position.set(playerPos.x, playerPos.y, playerPos.z);

      // Update Working 3D Traffic Signal Intersections (14s Green -> 3s Yellow -> 11s Red)
      let nearbyTrafficSignal: NearbyTrafficSignalInfo | null = null;
      let nearestSignalDist = 215;
      const cycleTotal = 28;
      for (const sig of trafficSignals) {
        const t = (elapsedSec + sig.offsetSec) % cycleTotal;
        if (t < 14) {
          sig.phase = 'green';
          sig.secondsRemaining = Math.ceil(14 - t);
          sig.greenMat.emissiveIntensity = 2.8;
          sig.yellowMat.emissiveIntensity = 0.08;
          sig.redMat.emissiveIntensity = 0.08;
        } else if (t < 17) {
          sig.phase = 'yellow';
          sig.secondsRemaining = Math.ceil(17 - t);
          sig.greenMat.emissiveIntensity = 0.08;
          sig.yellowMat.emissiveIntensity = 2.8;
          sig.redMat.emissiveIntensity = 0.08;
        } else {
          sig.phase = 'red';
          sig.secondsRemaining = Math.ceil(28 - t);
          sig.greenMat.emissiveIntensity = 0.08;
          sig.yellowMat.emissiveIntensity = 0.08;
          sig.redMat.emissiveIntensity = 3.0;
        }

        const aheadM = sig.distanceM - playerDistanceM;
        if (aheadM > -8 && aheadM < nearestSignalDist) {
          nearestSignalDist = aheadM;
          nearbyTrafficSignal = {
            id: sig.id,
            nameAr: sig.nameAr,
            distanceAheadM: Math.max(0, Math.round(aheadM)),
            phase: sig.phase,
            secondsRemaining: sig.secondsRemaining,
          };
        }
      }

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

      const maxRoadDist = TOTAL_ROAD_LENGTH_M - 60;
      for (let i = 0; i < activeTrafficCount; i++) {
        const agent = trafficAgents[i];

        const relDist = agent.distanceM - playerDistanceM;
        if (relDist < -680) {
          agent.distanceM = Math.min(maxRoadDist, playerDistanceM + 580 + ((i * 73) % 460));
        } else if (relDist > 1050) {
          agent.distanceM = Math.max(45, playerDistanceM - 520 - ((i * 61) % 360));
        }

        const s = mountainRoad.getSampleAtDistance(agent.distanceM);
        const slopeSlowdown = Math.abs(s.gradePct) > 8 ? 0.76 : 1.0;
        const distToPlayer = Math.abs(agent.distanceM - playerDistanceM);
        const playerProximityBrake = distToPlayer < 24 ? 0.22 : 1.0;

        // Obey Red / Yellow traffic signals smoothly before the crosswalk stop line
        let signalFactor = 1.0;
        for (const sig of trafficSignals) {
          const distToSignal = (sig.distanceM - agent.distanceM) * agent.direction;
          if (distToSignal > 4 && distToSignal < 36 && sig.phase !== 'green') {
            signalFactor = distToSignal < 14 ? 0.0 : THREE.MathUtils.clamp((distToSignal - 10) / 26, 0, 1);
            break;
          }
        }

        const desiredSpeed =
          agent.baseSpeedMs * slopeSlowdown * playerProximityBrake * signalFactor;
        agent.speedMs = THREE.MathUtils.damp(agent.speedMs, desiredSpeed, 4.5, dt);
        agent.distanceM += agent.direction * agent.speedMs * dt;
        if (agent.distanceM > maxRoadDist) agent.distanceM = 45;
        if (agent.distanceM < 35) agent.distanceM = maxRoadDist - 30;

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
          dummy.scale.set(1.18, 1.52, 1.46);
        } else if (agent.type === 'minibus') {
          dummy.scale.set(1.06, 1.32, 1.16);
        } else if (agent.type === 'pickup') {
          dummy.scale.set(1.02, 1.08, 1.06);
        } else {
          dummy.scale.set(0.98, 0.94, 0.98);
        }
        dummy.updateMatrix();
        trafficInstanced.setMatrixAt(i, dummy.matrix);
        trafficCabinInstanced.setMatrixAt(i, dummy.matrix);
        trafficHeadlightsInstanced.setMatrixAt(i, dummy.matrix);
        trafficTaillightsInstanced.setMatrixAt(i, dummy.matrix);
      }
      trafficInstanced.instanceMatrix.needsUpdate = true;
      trafficCabinInstanced.instanceMatrix.needsUpdate = true;
      trafficHeadlightsInstanced.instanceMatrix.needsUpdate = true;
      trafficTaillightsInstanced.instanceMatrix.needsUpdate = true;

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
        nearbyTrafficSignal,
      };
    },
    dispose: () => {
      lampGlowTex.dispose();
      geometriesToDispose.forEach((g) => g.dispose());
      materialsToDispose.forEach((m) => m.dispose());
    },
  };
}
