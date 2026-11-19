import * as THREE from 'three';
import {
  MissionDefinition,
  RegionId,
  SurfaceType,
  WorldPOI,
  YemenCityHub,
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

export const TOTAL_ROAD_LENGTH_M = 22000; // 22.0 km Open World Yemen network (9 Regions, 10 City Hubs)
export const CHUNK_LENGTH_M = 500;        // 44 streaming chunks of 500m each
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
    nameAr: 'صحراء المسالك وسد مأرب',
    subtitleAr: 'كثبان رملية مفتوحة وواحات مأرب التاريخية وعواصف غبار',
    startM: 12600,
    endM: 15000,
    baseAltitudeM: 480,
    statusAr: 'مكتملة بالكامل (Full Playable)',
    dominantSurfaces: ['sand', 'gravel', 'rock'],
  },
  {
    id: 'sanaa_highlands',
    nameAr: 'صنعاء القديمة ونقيل يسلح',
    subtitleAr: 'طريق جبلي شاهق بعمارة القمريات وباب اليمن والقمم السحابية',
    startM: 15000,
    endM: 17500,
    baseAltitudeM: 2250,
    statusAr: 'مكتملة بالكامل (Full Playable)',
    dominantSurfaces: ['asphalt', 'rock', 'gravel'],
  },
  {
    id: 'ibb_green_peaks',
    nameAr: 'مدرجات إب وريمة الخضراء',
    subtitleAr: 'شلالات جبلية وضباب كثيف ومنعطفات حادة وسط المدرجات الخضراء',
    startM: 17500,
    endM: 19800,
    baseAltitudeM: 2050,
    statusAr: 'مكتملة بالكامل (Full Playable)',
    dominantSurfaces: ['asphalt', 'mud', 'dirt'],
  },
  {
    id: 'shibam_hadramout',
    nameAr: 'شبام وحضرموت (وادي النخيل)',
    subtitleAr: 'ناطحات السحاب الطينية التاريخية وممرات الوادي الحجرية والرملية',
    startM: 19800,
    endM: 22000,
    baseAltitudeM: 690,
    statusAr: 'مكتملة بالكامل (Full Playable)',
    dominantSurfaces: ['asphalt', 'sand', 'gravel'],
  },
];

export const YEMEN_CITY_HUBS: YemenCityHub[] = [
  {
    id: 'city_taiz_sabir',
    nameAr: 'تعز — جبل صبر وقلعة القاهرة',
    governorateAr: 'محافظة تعز',
    subtitleAr: 'نقطة الانطلاق الرئيسية فوق مدرجات جبل صبر وسوق القمم.',
    regionId: 'taiz_highlands',
    distanceM: 60,
    altitudeM: 1450,
    defaultWeather: 'clear',
    defaultTimeOfDay: 'morning',
    mapX: 28,
    mapY: 72,
    highlightsAr: ['مدرجات جبل صبر', 'قرية الحصن الحجرية', 'محطة سفح القمم'],
  },
  {
    id: 'city_naqil_sumarah',
    nameAr: 'نقيل السحاب وسمارة',
    governorateAr: 'ممر إب — تعز الجبلي',
    subtitleAr: 'عقبة جبلية شاهقة بمنعطفات حادة وأنفاق صخرية وسط الغيوم.',
    regionId: 'naqil_sahab',
    distanceM: 3250,
    altitudeM: 1860,
    defaultWeather: 'mountain_fog',
    defaultTimeOfDay: 'sunrise',
    mapX: 35,
    mapY: 57,
    highlightsAr: ['أنفاق صخرية', 'مطل السحاب البانورامي', 'منعطفات 4×4'],
  },
  {
    id: 'city_wadi_rayhan',
    nameAr: 'إب — وادي الريحان والمشنة',
    governorateAr: 'محافظة إب',
    subtitleAr: 'وادٍ خصب ومجارٍ مائية وجسور حجرية وطرق حصوية وطينية.',
    regionId: 'wadi_rayhan',
    distanceM: 6250,
    altitudeM: 1120,
    defaultWeather: 'light_rain',
    defaultTimeOfDay: 'afternoon',
    mapX: 39,
    mapY: 64,
    highlightsAr: ['جسر الوادي الحجري', 'مغسلة الطين', 'ورشة الوادي'],
  },
  {
    id: 'city_tihama_zabid',
    nameAr: 'سهول تهامة وزبيد التاريخية',
    governorateAr: 'سهل تهامة — الحديدة',
    subtitleAr: 'طريق تجاري سريع واسع بمحاذاة المزارع والسوق الشعبي.',
    regionId: 'tihama_plains',
    distanceM: 8850,
    altitudeM: 220,
    defaultWeather: 'clear',
    defaultTimeOfDay: 'noon',
    mapX: 16,
    mapY: 54,
    highlightsAr: ['طريق الشاحنات التجاري', 'سوق تهامة', 'اختبارات السرعة القصوى'],
  },
  {
    id: 'city_aden_mokha_coast',
    nameAr: 'الساحل الغربي — المخا وخليج عدن',
    governorateAr: 'عدن — الساحل الغربي',
    subtitleAr: 'طريق ساحلي مفتوح بمحاذاة البحر الأحمر والمرافئ الصخرية.',
    regionId: 'coastal_road',
    distanceM: 11200,
    altitudeM: 18,
    defaultWeather: 'clear',
    defaultTimeOfDay: 'sunset',
    mapX: 33,
    mapY: 86,
    highlightsAr: ['مرفأ الساحل الغربي', 'غروب البحر الأحمر', 'طريق ساحلي سريع'],
  },
  {
    id: 'city_marib_desert',
    nameAr: 'مأرب — سد مأرب وصحراء المسالك',
    governorateAr: 'محافظة مأرب',
    subtitleAr: 'كثبان رملية مفتوحة وواحة صيانة وسط عواصف الصحراء.',
    regionId: 'masalik_desert',
    distanceM: 13450,
    altitudeM: 480,
    defaultWeather: 'sandstorm',
    defaultTimeOfDay: 'afternoon',
    mapX: 55,
    mapY: 42,
    highlightsAr: ['كثبان مأرب الرملية', 'واحة المسالك', 'تحديات الدفع الرباعي 4L'],
  },
  {
    id: 'city_sanaa_old',
    nameAr: 'صنعاء القديمة — باب اليمن',
    governorateAr: 'أمانة العاصمة صنعاء',
    subtitleAr: 'الارتفاع الأعلى باللعبة وسط العمارة الصنعانية والقمريات الملونة.',
    regionId: 'sanaa_highlands',
    distanceM: 15400,
    altitudeM: 2250,
    defaultWeather: 'cloudy',
    defaultTimeOfDay: 'morning',
    mapX: 38,
    mapY: 38,
    highlightsAr: ['بوابة صنعاء التاريخية', 'مطل جبل نقم', 'نفق نقيل يسلح'],
  },
  {
    id: 'city_naqil_yaslah',
    nameAr: 'نقيل يسلح — قمة الغيوم',
    governorateAr: 'صنعاء — ذمار',
    subtitleAr: 'أحد أخطر وأجمل الطرق الجبلية المعلقة فوق السحاب.',
    regionId: 'sanaa_highlands',
    distanceM: 16950,
    altitudeM: 2490,
    defaultWeather: 'mountain_fog',
    defaultTimeOfDay: 'dawn',
    mapX: 43,
    mapY: 48,
    highlightsAr: ['ارتفاع 2490م', 'جسر الغيوم المعلق', 'محطة استراحة القمة'],
  },
  {
    id: 'city_ibb_raymah',
    nameAr: 'مدرجات ريمة وإب الخضراء',
    governorateAr: 'ريمة — إب اللواء الأخضر',
    subtitleAr: 'طرق ضبابية ماطرة تخترق المدرجات الزراعية الجبلية الشاهقة.',
    regionId: 'ibb_green_peaks',
    distanceM: 18450,
    altitudeM: 2080,
    defaultWeather: 'heavy_rain',
    defaultTimeOfDay: 'morning',
    mapX: 25,
    mapY: 46,
    highlightsAr: ['شلالات المدرجات', 'طرق طينية زلقة', 'قرية الضباب الجبلية'],
  },
  {
    id: 'city_shibam_hadramout',
    nameAr: 'شبام حضرموت — ناطحات الطين',
    governorateAr: 'محافظة حضرموت',
    subtitleAr: 'وادي حضرموت الساحر بناطحات السحاب الطينية الشاهقة وواحات النخيل.',
    regionId: 'shibam_hadramout',
    distanceM: 20600,
    altitudeM: 690,
    defaultWeather: 'clear',
    defaultTimeOfDay: 'sunset',
    mapX: 78,
    mapY: 36,
    highlightsAr: ['ناطحات طين شبام 3D', 'وادي حضرموت', 'استراحة وسوق الدان'],
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
    nameAr: 'واحة وورشة ومغسلة صحراء مأرب',
    type: 'workshop',
    regionId: 'masalik_desert',
    distanceM: 13600,
    lateralOffsetM: -9.5,
    descriptionAr: 'محطة صيانة شاملة وغسيل وإصلاح وسط كثبان مأرب.',
  },
  {
    id: 'poi_sanaa_gate',
    nameAr: 'بوابة صنعاء القديمة ومطل القمريات',
    type: 'landmark',
    regionId: 'sanaa_highlands',
    distanceM: 15450,
    lateralOffsetM: -11.0,
    descriptionAr: 'معلم معماري صنعاني بالقمريات والحجر الحبشي على ارتفاع 2250م.',
  },
  {
    id: 'poi_sanaa_fuel',
    nameAr: 'محطة وقود واستراحة نقيل يسلح',
    type: 'fuel',
    regionId: 'sanaa_highlands',
    distanceM: 16400,
    lateralOffsetM: 9.2,
    descriptionAr: 'تزود بالوقود قبل عبور قمة نقيل يسلح السحابية.',
  },
  {
    id: 'poi_yaslah_viewpoint',
    nameAr: 'مطل نقيل يسلح فوق السحاب',
    type: 'viewpoint',
    regionId: 'sanaa_highlands',
    distanceM: 17150,
    lateralOffsetM: 10.5,
    descriptionAr: 'أعلى إطلالة جبلية في شبكة دروب اليمن.',
  },
  {
    id: 'poi_ibb_terraces_village',
    nameAr: 'قرية مدرجات ريمة وإب الخضراء',
    type: 'village',
    regionId: 'ibb_green_peaks',
    distanceM: 18350,
    lateralOffsetM: -13.0,
    descriptionAr: 'قرية جبلية تحيط بها المدرجات الزراعية والضباب الكثيف.',
  },
  {
    id: 'poi_ibb_car_wash',
    nameAr: 'مغسلة شلالات اللواء الأخضر',
    type: 'car_wash',
    regionId: 'ibb_green_peaks',
    distanceM: 19200,
    lateralOffsetM: 8.8,
    descriptionAr: 'تنظيف فوري للطين والمطر بعد الطرق الجبلية المبتلة.',
  },
  {
    id: 'poi_shibam_towers_landmark',
    nameAr: 'ناطحات السحاب الطينية — شبام حضرموت',
    type: 'landmark',
    regionId: 'shibam_hadramout',
    distanceM: 20650,
    lateralOffsetM: -12.5,
    descriptionAr: 'مدينة شبام التاريخية «مانهاتن الصحراء» في قلب وادي حضرموت.',
  },
  {
    id: 'poi_hadramout_fuel_hub',
    nameAr: 'محطة وورشة وادي حضرموت الكبرى',
    type: 'fuel',
    regionId: 'shibam_hadramout',
    distanceM: 21550,
    lateralOffsetM: 9.5,
    descriptionAr: 'نقطة التزود والصيانة الشاملة في نهاية المسار الشرقي.',
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
    if (s < 15000) {
      // Masalik Desert: sand dunes, desert gravel, and dry rock canyons
      if (s >= 13450 && s <= 13850) return 'gravel';
      if (s >= 14200 && s <= 14450) return 'rock';
      return 'sand';
    }
    if (s < 17500) {
      // Sana'a Highlands & Naqil Yaslah: stone-paved / high mountain asphalt & basalt rock
      if (s >= 16150 && s <= 16450) return 'rock';
      if (s >= 16850 && s <= 17150) return 'gravel';
      return 'asphalt';
    }
    if (s < 19800) {
      // Ibb & Raymah Green Peaks: misty asphalt, wet mud & highland dirt
      if (s >= 18050 && s <= 18450) return 'mud';
      if (s >= 18900 && s <= 19300) return 'dirt';
      return 'asphalt';
    }
    // Shibam Hadramout Valley: sandstone asphalt, wadi gravel & golden sand
    if (s >= 20300 && s <= 20750) return 'gravel';
    if (s >= 21100 && s <= 21450) return 'sand';
    return 'asphalt';
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
        curv = 0.0082 * Math.sin(s * 0.016) + 0.0048 * Math.cos(s * 0.029);
      } else if (reg.id === 'wadi_rayhan') {
        curv = 0.0052 * Math.sin(s * 0.011) + 0.0032 * Math.sin(s * 0.024);
      } else if (reg.id === 'tihama_plains') {
        curv = 0.0014 * Math.sin(s * 0.0045);
      } else if (reg.id === 'coastal_road') {
        curv = 0.0028 * Math.sin(s * 0.0065) + 0.0018 * Math.cos(s * 0.014);
      } else if (reg.id === 'masalik_desert') {
        curv = 0.0036 * Math.sin(s * 0.0075) + 0.0024 * Math.cos(s * 0.018);
      } else if (reg.id === 'sanaa_highlands') {
        // Dramatic Naqil Yaslah mountain bends
        curv = 0.0068 * Math.sin(s * 0.014) + 0.0042 * Math.cos(s * 0.026);
      } else if (reg.id === 'ibb_green_peaks') {
        // Tight terraced hillside switchbacks
        curv = 0.0074 * Math.sin(s * 0.017) + 0.0038 * Math.cos(s * 0.03);
      } else {
        // Shibam Hadramout wide canyon sweeps
        curv = 0.0026 * Math.sin(s * 0.007) + 0.0016 * Math.cos(s * 0.015);
      }

      curvatures.push(curv);
      heading += curv * this.sampleStepM;

      // Strictly C1-continuous elevation profile across all 9 Yemeni regions (zero seams!)
      const elevStops: [number, number][] = [
        [0, 0],
        [2500, 230],
        [3900, 410],
        [5200, 240],
        [7800, 65],
        [10200, 14],
        [12600, 16],
        [15000, 132],
        [17500, 465],
        [19800, 285],
        [22000, 145],
      ];
      let baseElev = 0;
      for (let eIdx = 0; eIdx < elevStops.length - 1; eIdx++) {
        const [s0, y0] = elevStops[eIdx];
        const [s1, y1] = elevStops[eIdx + 1];
        if (s >= s0 && s <= s1) {
          const u = THREE.MathUtils.clamp((s - s0) / (s1 - s0), 0, 1);
          const smoothU = u * u * (3 - 2 * u);
          baseElev = THREE.MathUtils.lerp(y0, y1, smoothU);
          break;
        }
      }
      // Smooth global terrain undulation (zero discontinuity anywhere on 22 km)
      const plainBlendIn = THREE.MathUtils.smoothstep(s, 7400, 8200);
      const plainBlendOut = 1.0 - THREE.MathUtils.smoothstep(s, 12200, 13000);
      const undulationScale = 1.0 - 0.65 * plainBlendIn * plainBlendOut;
      const y =
        baseElev +
        (8.5 * Math.sin(s * 0.0065) + 4.2 * Math.sin(s * 0.0145)) * undulationScale;

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

      // Rock-cut tunnels in Naqil Al-Sahab & Naqil Yaslah; bridges across valleys
      const hasTunnel =
        (s >= 2880 && s <= 3020) ||
        (s >= 4320 && s <= 4440) ||
        (s >= 16520 && s <= 16660);
      const hasBridge =
        (s >= 3580 && s <= 3700) ||
        (s >= 6290 && s <= 6410) ||
        (s >= 18650 && s <= 18790);

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
        widthM:
          reg.id === 'tihama_plains' || reg.id === 'shibam_hadramout'
            ? 12.0
            : ROAD_WIDTH_M,
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
