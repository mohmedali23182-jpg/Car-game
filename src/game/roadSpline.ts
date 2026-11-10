import * as THREE from 'three';
import {
  MissionDefinition,
  RegionId,
  SurfaceType,
  WorldPOI,
} from './types';

export interface RoadSample {
  distanceM: number;
  position: THREE.Vector3;
  tangent: THREE.Vector3;
  normal: THREE.Vector3;
  binormal: THREE.Vector3;
  surface: SurfaceType;
  regionId: RegionId;
  regionNameAr: string;
  chunkId: number;
  widthM: number;
  gradePct: number;
  bankingRad: number;
  curvature: number;
  hasTunnel: boolean;
  hasBridge: boolean;
  zoneNameAr: string;
}

export const TOTAL_ROAD_LENGTH_M = 15000; // 15.0 km Open World network
export const CHUNK_LENGTH_M = 500;        // 30 streaming chunks of 500m each
export const TOTAL_CHUNKS_COUNT = Math.ceil(TOTAL_ROAD_LENGTH_M / CHUNK_LENGTH_M);
export const MISSION_FINISH_DISTANCE_M = 1920; // Legacy Phase 1 finish marker kept intact
export const ROAD_WIDTH_M = 10.2;

export interface RegionMetadata {
  id: RegionId;
  nameAr: string;
  subtitleAr: string;
  startM: number;
  endM: number;
  baseAltitudeM: number;
  statusAr: 'مكتملة بالكامل (Full Playable)' | 'مكتملة وقابلة للقيادة (Playable)';
  dominantSurfaces: SurfaceType[];
}

export const YEMEN_REGIONS: RegionMetadata[] = [
  {
    id: 'taiz_highlands',
    nameAr: 'مرتفعات تعز (طريق القمم)',
    subtitleAr: 'مدرجات زراعية وقرى حجرية وضباب صباحي',
    startM: 0,
    endM: 2500,
    baseAltitudeM: 1450,
    statusAr: 'مكتملة بالكامل (Full Playable)',
    dominantSurfaces: ['asphalt', 'dirt'],
  },
  {
    id: 'naqil_sahab',
    nameAr: 'نقيل السحاب',
    subtitleAr: 'عقبة جبلية شاهقة وأنفاق صخرية وجسور أودية',
    startM: 2500,
    endM: 5200,
    baseAltitudeM: 1850,
    statusAr: 'مكتملة بالكامل (Full Playable)',
    dominantSurfaces: ['asphalt', 'rock', 'gravel'],
  },
  {
    id: 'wadi_rayhan',
    nameAr: 'وادي الريحان',
    subtitleAr: 'وادٍ صخري ومجارٍ مائية وطرق حصوية وطينية',
    startM: 5200,
    endM: 7800,
    baseAltitudeM: 1120,
    statusAr: 'مكتملة بالكامل (Full Playable)',
    dominantSurfaces: ['gravel', 'mud', 'rock'],
  },
  {
    id: 'tihama_plains',
    nameAr: 'سهول تهامة',
    subtitleAr: 'طريق تجاري واسع ومزارع سهلية وحركة شاحنات',
    startM: 7800,
    endM: 10200,
    baseAltitudeM: 220,
    statusAr: 'مكتملة وقابلة للقيادة (Playable)',
    dominantSurfaces: ['asphalt', 'sand'],
  },
  {
    id: 'coastal_road',
    nameAr: 'الطريق الساحلي',
    subtitleAr: 'طريق إسفلتي بمحاذاة البحر ومرافئ صخرية',
    startM: 10200,
    endM: 12600,
    baseAltitudeM: 18,
    statusAr: 'مكتملة وقابلة للقيادة (Playable)',
    dominantSurfaces: ['asphalt', 'sand'],
  },
  {
    id: 'masalik_desert',
    nameAr: 'صحراء المسالك',
    subtitleAr: 'كثبان رملية مفتوحة وعواصف غبار وممرات جافة',
    startM: 12600,
    endM: 15000,
    baseAltitudeM: 480,
    statusAr: 'مكتملة بالكامل (Full Playable)',
    dominantSurfaces: ['sand', 'gravel', 'rock'],
  },
];

export const WORLD_POIS: WorldPOI[] = [
  {
    id: 'poi_taiz_start_fuel',
    nameAr: 'محطة وقود سفح القمم',
    type: 'fuel',
    regionId: 'taiz_highlands',
    distanceM: 90,
    lateralOffsetM: 8.5,
    descriptionAr: 'محطة تزود بالوقود عند مدخل مرتفعات تعز.',
  },
  {
    id: 'poi_taiz_car_wash',
    nameAr: 'مغسلة ومركز العناية بالمركبات — تعز',
    type: 'car_wash',
    regionId: 'taiz_highlands',
    distanceM: 540,
    lateralOffsetM: -8.8,
    descriptionAr: 'مغسلة ضغط عالٍ لإزالة الطين والغبار الجبلي وتلميع هيكل المركبة.',
  },
  {
    id: 'poi_taiz_village',
    nameAr: 'قرية الحصن وسوق القمم الشعبي',
    type: 'village',
    regionId: 'taiz_highlands',
    distanceM: 1050,
    lateralOffsetM: -14.0,
    descriptionAr: 'قرية يمنية حجرية بالقمريات الملونة وسوق محلي يطل على المدرجات الخضراء.',
  },
  {
    id: 'poi_summit_1_workshop',
    nameAr: 'ورشة صيانة القمم',
    type: 'workshop',
    regionId: 'taiz_highlands',
    distanceM: 1950,
    lateralOffsetM: 9.0,
    descriptionAr: 'ورشة إصلاح وصيانة ميكانيكية وهيكلية بعد اجتياز طريق القمم الأول.',
  },
  {
    id: 'poi_naqil_viewpoint',
    nameAr: 'مطل نقيل السحاب البانورامي',
    type: 'viewpoint',
    regionId: 'naqil_sahab',
    distanceM: 3450,
    lateralOffsetM: 10.5,
    descriptionAr: 'نقطة استراحة وتصوير سينمائي تطل على الأودية السحيقة والغيوم.',
  },
  {
    id: 'poi_naqil_fuel',
    nameAr: 'محطة وقود واستراحة النقيل',
    type: 'fuel',
    regionId: 'naqil_sahab',
    distanceM: 4850,
    lateralOffsetM: -9.0,
    descriptionAr: 'تزود بالوقود وفحص الفرامل قبل النزول إلى وادي الريحان.',
  },
  {
    id: 'poi_wadi_bridge_landmark',
    nameAr: 'جسر وادي الريحان الحجري',
    type: 'landmark',
    regionId: 'wadi_rayhan',
    distanceM: 6350,
    lateralOffsetM: 0.0,
    descriptionAr: 'جسر حجري مقوس يعبر المجرى المائي الصخري للوادي.',
  },
  {
    id: 'poi_wadi_car_wash',
    nameAr: 'مغسلة وادي الريحان للمركبات',
    type: 'car_wash',
    regionId: 'wadi_rayhan',
    distanceM: 6950,
    lateralOffsetM: -9.0,
    descriptionAr: 'غسيل فوري للمركبات والإطارات بعد عبور الممرات الطينية بالوادي.',
  },
  {
    id: 'poi_wadi_workshop',
    nameAr: 'ورشة الوادي الأخضر',
    type: 'workshop',
    regionId: 'wadi_rayhan',
    distanceM: 7450,
    lateralOffsetM: 9.2,
    descriptionAr: 'إصلاح التعليق والإطارات والهيكل بعد الممرات الصخرية والطينية.',
  },
  {
    id: 'poi_tihama_hub',
    nameAr: 'سوق ومحطة وقود تهامة التجاري',
    type: 'fuel',
    regionId: 'tihama_plains',
    distanceM: 9100,
    lateralOffsetM: 10.0,
    descriptionAr: 'مركز تجمع الشاحنات والسوق الشعبي والتزود بالوقود في سهول تهامة.',
  },
  {
    id: 'poi_coast_harbor',
    nameAr: 'مرفأ ومطل الساحل الغربي',
    type: 'viewpoint',
    regionId: 'coastal_road',
    distanceM: 11450,
    lateralOffsetM: 11.0,
    descriptionAr: 'إطلالة ساحلية مباشرة على البحر الأحمر وقت الغروب.',
  },
  {
    id: 'poi_desert_oasis_workshop',
    nameAr: 'واحة وورشة ومغسلة صحراء المسالك',
    type: 'workshop',
    regionId: 'masalik_desert',
    distanceM: 13600,
    lateralOffsetM: -9.5,
    descriptionAr: 'محطة صيانة شاملة وغسيل وإصلاح وسط الكثبان الرملية.',
  },
];

export const PHASE2_MISSIONS: MissionDefinition[] = [
  {
    id: 'mission_1_cloud_trip',
    category: 'story',
    titleAr: '1. رحلة السحاب (طريق القمم ونقيل السحاب)',
    subtitleAr: 'قيادة «الشاهق» 4×4 عبر العقبة الجبلية إلى قمة النقيل',
    descriptionAr:
      'انطلق بمركبة الدفع الرباعي «الشاهق» من مرتفعات تعز، واستخدم الدفع الرباعي لتسلق منعطفات نقيل السحاب الحادة حتى القمة.',
    recommendedVehicleId: 'shahiq',
    startDistanceM: 1850,
    finishDistanceM: 3850,
    weatherPreset: 'mountain_fog',
    timeOfDayPreset: 'morning',
    cargoRequiredPct: 0,
    minCargoIntegrityPct: 0,
    targetTimeSec: 135,
    rewardCoins: 850,
    rewardXp: 200,
  },
  {
    id: 'mission_2_valley_cargo',
    category: 'cargo',
    titleAr: '2. حمولة الوادي (نقل بضائع بوادي الريحان)',
    subtitleAr: 'نقل صناديق الإمدادات بمركبة «الصقر» البيك أب دون إتلافها',
    descriptionAr:
      'قد مركبة «الصقر» بحمولة كاملة عبر الطرق الحصوية والطينية في وادي الريحان وحافظ على سلامة الحمولة فوق 80%.',
    recommendedVehicleId: 'saqr',
    startDistanceM: 5300,
    finishDistanceM: 7400,
    weatherPreset: 'cloudy',
    timeOfDayPreset: 'afternoon',
    cargoRequiredPct: 100,
    minCargoIntegrityPct: 80,
    targetTimeSec: 145,
    rewardCoins: 1100,
    rewardXp: 250,
  },
  {
    id: 'mission_3_safe_descent',
    category: 'cargo',
    titleAr: '3. النزول الآمن (شاحنة «الجبل» الثقيلة)',
    subtitleAr: 'قيادة شاحنة محملة على منحدر هابط باستخدام الغيارات المنخفضة والفرامل',
    descriptionAr:
      'تحكم بشاحنة «الجبل» المحملة بـ 2.4 طن أثناء النزول من قمة النقيل باتجاه الوادي دون فقدان السيطرة أو تجاوز السرعة الآمنة.',
    recommendedVehicleId: 'jabal',
    startDistanceM: 3900,
    finishDistanceM: 5650,
    weatherPreset: 'clear',
    timeOfDayPreset: 'sunrise',
    cargoRequiredPct: 100,
    minCargoIntegrityPct: 85,
    targetTimeSec: 150,
    rewardCoins: 1450,
    rewardXp: 300,
  },
  {
    id: 'mission_4_sandstorm',
    category: 'challenge',
    titleAr: '4. عاصفة الرمال (صحراء المسالك)',
    subtitleAr: 'اجتياز الكثبان الرملية بمركبة «الرحّال» وسط عاصفة غبار',
    descriptionAr:
      'استثمر الإطارات الرملية العريضة وعزم مركبة «الرحّال» لاجتياز مسار صحراء المسالك في ظل انخفاض مدى الرؤية والجر.',
    recommendedVehicleId: 'rahhal',
    startDistanceM: 12700,
    finishDistanceM: 14750,
    weatherPreset: 'sandstorm',
    timeOfDayPreset: 'sunset',
    cargoRequiredPct: 0,
    minCargoIntegrityPct: 0,
    targetTimeSec: 130,
    rewardCoins: 1250,
    rewardXp: 280,
  },
  {
    id: 'mission_5_rain_journey',
    category: 'challenge',
    titleAr: '5. رحلة تحت المطر (مرتفعات تعز المبتلة)',
    subtitleAr: 'القيادة في طريق جبلي زلق تحت الأمطار الغزيرة حتى المحطة الآمنة',
    descriptionAr:
      'قد بحذر تحت المطر الغزير حيث ينخفض تماسك الإطارات على الأسفلت المبتل والمنعطفات الجبلية الصاعدة.',
    recommendedVehicleId: 'shahiq',
    startDistanceM: 30,
    finishDistanceM: 1920,
    weatherPreset: 'heavy_rain',
    timeOfDayPreset: 'dawn',
    cargoRequiredPct: 0,
    minCargoIntegrityPct: 0,
    targetTimeSec: 140,
    rewardCoins: 950,
    rewardXp: 220,
  },
];

class OpenWorldRoadNetwork {
  private samples: RoadSample[] = [];
  private sampleStepM = 4.0; // 4m resolution across 15,000m = 3,751 continuous 3D road samples

  constructor() {
    this.buildNetwork();
  }

  public getRegionForDistance(s: number): RegionMetadata {
    for (const r of YEMEN_REGIONS) {
      if (s >= r.startM && s <= r.endM) return r;
    }
    return YEMEN_REGIONS[YEMEN_REGIONS.length - 1];
  }

  private getSurfaceAtDistance(s: number): SurfaceType {
    if (s < 2500) {
      // Taiz Highlands: alternating paved asphalt & dirt mountain cuts
      if ((s >= 380 && s <= 720) || (s >= 1180 && s <= 1560) || (s >= 2100 && s <= 2400)) {
        return 'dirt';
      }
      return 'asphalt';
    }
    if (s < 5200) {
      // Naqil Al-Sahab: steep paved switchbacks, rock ledges, and gravel shoulders
      if (s >= 3100 && s <= 3550) return 'rock';
      if (s >= 4150 && s <= 4550) return 'gravel';
      return 'asphalt';
    }
    if (s < 7800) {
      // Wadi Al-Rayhan: gravel beds, mud flats, and rock crossings
      if (s >= 5850 && s <= 6300) return 'mud';
      if (s >= 6800 && s <= 7150) return 'rock';
      return 'gravel';
    }
    if (s < 10200) {
      // Tihama Plains: long wide asphalt with sandy village crossings
      if (s >= 8650 && s <= 9000) return 'sand';
      return 'asphalt';
    }
    if (s < 12600) {
      // Coastal Road: smooth coastal asphalt with brief beach sand causeways
      if (s >= 11300 && s <= 11600) return 'sand';
      return 'asphalt';
    }
    // Masalik Desert: sand dunes, desert gravel, and dry rock canyons
    if (s >= 13450 && s <= 13850) return 'gravel';
    if (s >= 14200 && s <= 14450) return 'rock';
    return 'sand';
  }

  private buildNetwork(): void {
    const count = Math.floor(TOTAL_ROAD_LENGTH_M / this.sampleStepM) + 1;
    const rawPositions: THREE.Vector3[] = [];
    const curvatures: number[] = [];

    let x = 0;
    let z = 0;
    let heading = 0;

    for (let i = 0; i < count; i++) {
      const s = i * this.sampleStepM;
      const reg = this.getRegionForDistance(s);

      // Region-characteristic curvature
      let curv = 0;
      if (reg.id === 'taiz_highlands') {
        curv =
          0.0045 * Math.sin(s * 0.0085) +
          0.006 * Math.sin(s * 0.019 + 0.7) +
          0.0035 * Math.cos(s * 0.031 - 1.2);
      } else if (reg.id === 'naqil_sahab') {
        // Tight dramatic mountain switchbacks
        curv =
          0.0082 * Math.sin(s * 0.016) +
          0.0048 * Math.cos(s * 0.029);
      } else if (reg.id === 'wadi_rayhan') {
        // Winding valley river bed
        curv = 0.0052 * Math.sin(s * 0.011) + 0.0032 * Math.sin(s * 0.024);
      } else if (reg.id === 'tihama_plains') {
        // Long gentle highway curves
        curv = 0.0014 * Math.sin(s * 0.0045);
      } else if (reg.id === 'coastal_road') {
        // Sweeping coastal curves
        curv = 0.0028 * Math.sin(s * 0.0065) + 0.0018 * Math.cos(s * 0.014);
      } else {
        // Desert dune S-sweeps
        curv = 0.0036 * Math.sin(s * 0.0075) + 0.0024 * Math.cos(s * 0.018);
      }

      curvatures.push(curv);
      heading += curv * this.sampleStepM;

      // Continuous elevation profile across the 6 regions
      let y = 0;
      if (s <= 2500) {
        // Climb from 0m to +230m in Taiz Highlands
        y =
          (s / 2500) * 230 +
          12 * Math.sin(s * 0.007) -
          6 * Math.cos(s * 0.015);
      } else if (s <= 3900) {
        // Steep ascent up Naqil Al-Sahab to peak (+410m)
        const t = (s - 2500) / 1400;
        y = 230 + t * 180 + 14 * Math.sin(s * 0.01);
      } else if (s <= 5200) {
        // High mountain descent from peak (+410m down to +240m) — Mission 3 truck descent!
        const t = (s - 3900) / 1300;
        y = 410 - t * 170 + 8 * Math.sin(s * 0.012);
      } else if (s <= 7800) {
        // Wadi Al-Rayhan descent from +240m to +65m with valley undulations
        const t = (s - 5200) / 2600;
        y = 240 - t * 175 + 9 * Math.sin(s * 0.018);
      } else if (s <= 10200) {
        // Tihama Plains gentle slope from +65m to +12m
        const t = (s - 7800) / 2400;
        y = 65 - t * 53 + 2.5 * Math.sin(s * 0.008);
      } else if (s <= 12600) {
        // Coastal Road along sea level (+12m to +24m)
        y = 12 + 8 * Math.sin((s - 10200) * 0.006);
      } else {
        // Masalik Desert rolling dunes (+16m up to +145m)
        const t = (s - 12600) / 2400;
        y =
          16 +
          t * 115 +
          16 * Math.sin((s - 12600) * 0.015) +
          7 * Math.cos((s - 12600) * 0.032);
      }

      rawPositions.push(new THREE.Vector3(x, y, z));
      x += Math.sin(heading) * this.sampleStepM;
      z -= Math.cos(heading) * this.sampleStepM;
    }

    const worldUp = new THREE.Vector3(0, 1, 0);

    for (let i = 0; i < count; i++) {
      const s = i * this.sampleStepM;
      const prev = rawPositions[Math.max(0, i - 1)];
      const next = rawPositions[Math.min(count - 1, i + 1)];
      const curr = rawPositions[i].clone();

      const tangent = next.clone().sub(prev).normalize();
      const horiz = Math.hypot(next.x - prev.x, next.z - prev.z) || 1;
      const gradePct = ((next.y - prev.y) / horiz) * 100;

      const bankingRad = THREE.MathUtils.clamp(-curvatures[i] * 8.5, -0.075, 0.075);
      const binormal = new THREE.Vector3().crossVectors(tangent, worldUp).normalize();
      binormal.applyAxisAngle(tangent, bankingRad).normalize();
      const normal = new THREE.Vector3().crossVectors(binormal, tangent).normalize();

      const reg = this.getRegionForDistance(s);
      const chunkId = Math.min(
        TOTAL_CHUNKS_COUNT - 1,
        Math.floor(s / CHUNK_LENGTH_M)
      );

      // Rock-cut tunnels in Naqil Al-Sahab and bridges in Naqil / Wadi Rayhan
      const hasTunnel =
        (s >= 2880 && s <= 3020) || (s >= 4320 && s <= 4440);
      const hasBridge =
        (s >= 3580 && s <= 3700) || (s >= 6290 && s <= 6410);

      this.samples.push({
        distanceM: s,
        position: curr,
        tangent,
        normal,
        binormal,
        surface: this.getSurfaceAtDistance(s),
        regionId: reg.id,
        regionNameAr: reg.nameAr,
        chunkId,
        widthM: reg.id === 'tihama_plains' ? 12.0 : ROAD_WIDTH_M,
        gradePct,
        bankingRad,
        curvature: curvatures[i],
        hasTunnel,
        hasBridge,
        zoneNameAr: reg.nameAr,
      });
    }
  }

  public getAllSamples(): RoadSample[] {
    return this.samples;
  }

  public getSamplesForChunk(chunkId: number): RoadSample[] {
    const startM = chunkId * CHUNK_LENGTH_M;
    const endM = (chunkId + 1) * CHUNK_LENGTH_M;
    const startIdx = Math.max(0, Math.floor(startM / this.sampleStepM));
    const endIdx = Math.min(
      this.samples.length - 1,
      Math.ceil(endM / this.sampleStepM)
    );
    return this.samples.slice(startIdx, endIdx + 1);
  }

  public getSampleAtDistance(distanceM: number): RoadSample {
    const clamped = THREE.MathUtils.clamp(distanceM, 0, TOTAL_ROAD_LENGTH_M);
    const exactIdx = clamped / this.sampleStepM;
    const idx0 = Math.floor(exactIdx);
    const idx1 = Math.min(this.samples.length - 1, idx0 + 1);
    const alpha = exactIdx - idx0;

    const s0 = this.samples[idx0];
    const s1 = this.samples[idx1];

    return {
      ...s0,
      distanceM: clamped,
      position: s0.position.clone().lerp(s1.position, alpha),
      tangent: s0.tangent.clone().lerp(s1.tangent, alpha).normalize(),
      normal: s0.normal.clone().lerp(s1.normal, alpha).normalize(),
      binormal: s0.binormal.clone().lerp(s1.binormal, alpha).normalize(),
      gradePct: THREE.MathUtils.lerp(s0.gradePct, s1.gradePct, alpha),
      bankingRad: THREE.MathUtils.lerp(s0.bankingRad, s1.bankingRad, alpha),
    };
  }

  public queryGroundAtPoint(
    worldX: number,
    worldZ: number,
    hintDistanceM?: number
  ): {
    closestSample: RoadSample;
    lateralOffsetM: number;
    groundHeightY: number;
    groundNormal: THREE.Vector3;
    surface: SurfaceType;
  } {
    let bestIdx = 0;
    let bestDistSq = Infinity;

    if (hintDistanceM !== undefined) {
      const centerIdx = Math.floor(
        THREE.MathUtils.clamp(hintDistanceM, 0, TOTAL_ROAD_LENGTH_M) / this.sampleStepM
      );
      const searchRadius = 40;
      const start = Math.max(0, centerIdx - searchRadius);
      const end = Math.min(this.samples.length - 1, centerIdx + searchRadius);
      for (let i = start; i <= end; i++) {
        const p = this.samples[i].position;
        const dSq = (worldX - p.x) * (worldX - p.x) + (worldZ - p.z) * (worldZ - p.z);
        if (dSq < bestDistSq) {
          bestDistSq = dSq;
          bestIdx = i;
        }
      }
    }

    if (bestDistSq > 1200) {
      for (let i = 0; i < this.samples.length; i += 6) {
        const p = this.samples[i].position;
        const dSq = (worldX - p.x) * (worldX - p.x) + (worldZ - p.z) * (worldZ - p.z);
        if (dSq < bestDistSq) {
          bestDistSq = dSq;
          bestIdx = i;
        }
      }
      const start = Math.max(0, bestIdx - 8);
      const end = Math.min(this.samples.length - 1, bestIdx + 8);
      for (let i = start; i <= end; i++) {
        const p = this.samples[i].position;
        const dSq = (worldX - p.x) * (worldX - p.x) + (worldZ - p.z) * (worldZ - p.z);
        if (dSq < bestDistSq) {
          bestDistSq = dSq;
          bestIdx = i;
        }
      }
    }

    const sBase = this.samples[bestIdx];
    const dx = worldX - sBase.position.x;
    const dz = worldZ - sBase.position.z;
    const alongDelta = dx * sBase.tangent.x + dz * sBase.tangent.z;
    const exactDistanceM = THREE.MathUtils.clamp(
      sBase.distanceM + alongDelta,
      0,
      TOTAL_ROAD_LENGTH_M
    );

    const sample = this.getSampleAtDistance(exactDistanceM);
    const relX = worldX - sample.position.x;
    const relZ = worldZ - sample.position.z;
    const lateralOffsetM = relX * sample.binormal.x + relZ * sample.binormal.z;
    const absLat = Math.abs(lateralOffsetM);

    const halfRoad = sample.widthM * 0.5;
    const bankingY = lateralOffsetM * sample.binormal.y;

    let groundHeightY = sample.position.y + bankingY;
    let surface: SurfaceType = sample.surface;
    const groundNormal = sample.normal.clone();

    // Micro-roughness based on surface type
    if (surface !== 'asphalt' && absLat <= halfRoad + 1.5) {
      const amp =
        surface === 'rock'
          ? 0.065
          : surface === 'gravel' || surface === 'dirt'
          ? 0.038
          : surface === 'mud'
          ? 0.045
          : 0.025;
      const bump =
        Math.sin(exactDistanceM * 1.4 + lateralOffsetM * 2.1) * amp +
        Math.cos(exactDistanceM * 2.9 - lateralOffsetM * 2.5) * (amp * 0.6);
      groundHeightY += bump;
    }

    if (absLat > halfRoad) {
      const outsideDist = absLat - halfRoad;
      if (sample.regionId === 'masalik_desert') {
        surface = 'sand';
        const duneWave =
          Math.sin(worldX * 0.04 + worldZ * 0.05) * 3.8 +
          Math.cos(worldX * 0.09 - worldZ * 0.07) * 1.6;
        groundHeightY += Math.min(1, outsideDist / 14) * duneWave;
      } else if (sample.regionId === 'tihama_plains') {
        surface = outsideDist < 3 ? 'gravel' : 'sand';
        groundHeightY += Math.sin(worldX * 0.03 + worldZ * 0.03) * 0.45;
      } else if (sample.regionId === 'coastal_road') {
        if (lateralOffsetM > 0) {
          // Sea side gentle beach slope toward water
          surface = 'sand';
          groundHeightY -= Math.min(8, outsideDist * 0.22);
        } else {
          // Coastal rocky bluff
          surface = 'rock';
          groundHeightY += Math.min(28, outsideDist * 0.55);
        }
      } else {
        // Highland / Naqil / Wadi terraced slopes
        surface = outsideDist <= 2.2 ? 'gravel' : 'rock';
        if (lateralOffsetM < 0) {
          const terraceStep = Math.floor(outsideDist / 6.5);
          const withinStep = outsideDist % 6.5;
          groundHeightY += terraceStep * 4.2 + Math.min(1, withinStep / 2.5) * 4.2;
          groundNormal.set(sample.binormal.x * 0.45, 0.88, sample.binormal.z * 0.45).normalize();
        } else {
          if (outsideDist < 1.6) {
            groundHeightY += Math.sin((outsideDist / 1.6) * Math.PI) * 0.35;
          } else {
            const dropDist = outsideDist - 1.6;
            groundHeightY -= Math.floor(dropDist / 8.0) * 3.8 + (dropDist % 8.0) * 0.48;
            groundNormal.set(-sample.binormal.x * 0.38, 0.92, -sample.binormal.z * 0.38).normalize();
          }
        }
      }
    }

    return {
      closestSample: sample,
      lateralOffsetM,
      groundHeightY,
      groundNormal,
      surface,
    };
  }

  /**
   * GPS Pathfinding & Turn-by-Turn Route Advisor over the road graph
   */
  public computeGpsNavigation(
    currentDistanceM: number,
    targetDistanceM: number,
    currentSpeedMs: number
  ): {
    remainingDistanceM: number;
    etaSeconds: number;
    directionAr: string;
    nextTurnWarningAr: string;
  } {
    const rem = Math.abs(targetDistanceM - currentDistanceM);
    const dirForward = targetDistanceM >= currentDistanceM;
    const lookAheadDist = THREE.MathUtils.clamp(
      currentDistanceM + (dirForward ? 95 : -95),
      0,
      TOTAL_ROAD_LENGTH_M
    );
    const aheadSample = this.getSampleAtDistance(lookAheadDist);

    let nextTurnWarningAr = 'طريق مستقيم — حافظ على مسارك';
    if (aheadSample.hasTunnel) {
      nextTurnWarningAr = 'تحذير: نفق جبلي قادم على بعد 90م';
    } else if (aheadSample.hasBridge) {
      nextTurnWarningAr = 'تحذير: جسر وادٍ ضيق قادم';
    } else if (Math.abs(aheadSample.curvature) > 0.0055) {
      nextTurnWarningAr =
        aheadSample.curvature > 0
          ? 'منعطف جبلي حاد لليمين ↱'
          : 'منعطف جبلي حاد لليسار ↰';
    } else if (Math.abs(aheadSample.gradePct) > 9.5) {
      nextTurnWarningAr =
        aheadSample.gradePct > 0
          ? `صعود حاد (+${Math.round(aheadSample.gradePct)}%) — يفضل 4H/4L`
          : `منحدر هابط (${Math.round(aheadSample.gradePct)}%) — استخدم الغيار المنخفض`;
    }

    const effectiveSpeed = Math.max(8, Math.abs(currentSpeedMs));
    return {
      remainingDistanceM: Math.round(rem),
      etaSeconds: Math.round(rem / effectiveSpeed),
      directionAr: dirForward ? 'للأمام باتجاه الوجهة ▲' : 'خلفك — اعكس الاتجاه ▼',
      nextTurnWarningAr,
    };
  }
}

export const mountainRoad = new OpenWorldRoadNetwork();
