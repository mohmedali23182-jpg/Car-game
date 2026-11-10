import * as THREE from 'three';
import {
  DamageState,
  TireCompoundType,
  VehicleCustomization,
  VehicleId,
  VehicleSpec,
  WheelTelemetry,
} from './types';

export const ALL_VEHICLE_IDS: VehicleId[] = [
  'shahiq',
  'saqr',
  'rahhal',
  'madina',
  'jabal',
  'barq',
  'hafilat',
  'munqidh',
  'badiya',
  'aseel',
];

export const VEHICLE_SPECS: Record<VehicleId, VehicleSpec> = {
  shahiq: {
    id: 'shahiq',
    nameAr: 'الشاهق',
    titleAr: 'الشاهق — دفع رباعي جبلي 4×4',
    categoryAr: 'طرق وعرة ومرتفعات',
    descriptionAr:
      'سيارة دفع رباعي مخصصة للمرتفعات الوعرة، مزودة بتعليق طويل الحركة ونظام غيارات ثقيلة (4L) وقفل تفاضلي ومقصورة قيادة متكاملة.',
    unlockPriceCoins: 0,
    baseMassKg: 1920,
    maxCargoKg: 250,
    passengerCapacity: 5,
    centerOfMassOffsetY: -0.36,
    wheelbaseM: 2.72,
    trackWidthM: 1.94,
    wheelRadiusM: 0.45,
    wheelWidthM: 0.32,
    suspensionRestLengthM: 0.64,
    suspensionMaxTravelM: 0.35,
    suspensionStiffness: 43000,
    suspensionDamping: 5500,
    antiRollStiffness: 9400,
    maxEngineTorqueNm: 450,
    maxPowerHp: 285,
    idleRpm: 800,
    redlineRpm: 6000,
    maxBrakeForceN: 24000,
    maxReverseForceN: 12500,
    handbrakeForceN: 19000,
    maxSteerAngleRad: THREE.MathUtils.degToRad(33),
    steerSpeedRadPerSec: 3.4,
    defaultDrivetrain: '4H',
    supportedDrivetrains: ['2H', '4H', '4L'],
    forwardGearsCount: 6,
    fuelTankLiters: 85,
    baseFuelBurnLPerMin: 1.35,
    dragCoefficient: 0.42,
    rollingResistance: 220,
    engineBaseFreqHz: 46,
    defaultPaintHex: '#c87236',
    defaultTireType: 'all_terrain',
  },
  saqr: {
    id: 'saqr',
    nameAr: 'الصقر',
    titleAr: 'الصقر — بيك أب نقل جبلي',
    categoryAr: 'نقل بضائع وطرق ريفية',
    descriptionAr:
      'مركبة بيك أب بحوض تحميل خلفي متين لنقل الصناديق والمحاصيل عبر القرى والأودية مع تعليق خلفي معزز للحمولات.',
    unlockPriceCoins: 1100,
    baseMassKg: 1780,
    maxCargoKg: 750,
    passengerCapacity: 3,
    centerOfMassOffsetY: -0.32,
    wheelbaseM: 3.05,
    trackWidthM: 1.88,
    wheelRadiusM: 0.43,
    wheelWidthM: 0.29,
    suspensionRestLengthM: 0.62,
    suspensionMaxTravelM: 0.32,
    suspensionStiffness: 46000,
    suspensionDamping: 5800,
    antiRollStiffness: 9000,
    maxEngineTorqueNm: 420,
    maxPowerHp: 240,
    idleRpm: 780,
    redlineRpm: 5600,
    maxBrakeForceN: 23000,
    maxReverseForceN: 11800,
    handbrakeForceN: 18500,
    maxSteerAngleRad: THREE.MathUtils.degToRad(31),
    steerSpeedRadPerSec: 3.1,
    defaultDrivetrain: '4H',
    supportedDrivetrains: ['2H', '4H', '4L'],
    forwardGearsCount: 5,
    fuelTankLiters: 80,
    baseFuelBurnLPerMin: 1.28,
    dragCoefficient: 0.44,
    rollingResistance: 230,
    engineBaseFreqHz: 42,
    defaultPaintHex: '#2b6cb0',
    defaultTireType: 'all_terrain',
  },
  rahhal: {
    id: 'rahhal',
    nameAr: 'الرحّال',
    titleAr: 'الرحّال — مركبة الكثبان والصحراء',
    categoryAr: 'صحاري وطرق رملية',
    descriptionAr:
      'مركبة صحراوية بإطارات بالونية عريضة وعزم دوران فوري وثبات استثنائي فوق الكثبان الرملية والسهول.',
    unlockPriceCoins: 2200,
    baseMassKg: 1640,
    maxCargoKg: 180,
    passengerCapacity: 2,
    centerOfMassOffsetY: -0.4,
    wheelbaseM: 2.65,
    trackWidthM: 2.08,
    wheelRadiusM: 0.48,
    wheelWidthM: 0.42,
    suspensionRestLengthM: 0.68,
    suspensionMaxTravelM: 0.4,
    suspensionStiffness: 39000,
    suspensionDamping: 5100,
    antiRollStiffness: 10500,
    maxEngineTorqueNm: 490,
    maxPowerHp: 330,
    idleRpm: 900,
    redlineRpm: 6600,
    maxBrakeForceN: 22500,
    maxReverseForceN: 13000,
    handbrakeForceN: 20000,
    maxSteerAngleRad: THREE.MathUtils.degToRad(35),
    steerSpeedRadPerSec: 4.0,
    defaultDrivetrain: 'AWD',
    supportedDrivetrains: ['RWD', 'AWD', '4L'],
    forwardGearsCount: 6,
    fuelTankLiters: 90,
    baseFuelBurnLPerMin: 1.55,
    dragCoefficient: 0.39,
    rollingResistance: 195,
    engineBaseFreqHz: 54,
    defaultPaintHex: '#d4a253',
    defaultTireType: 'sand_dune',
  },
  madina: {
    id: 'madina',
    nameAr: 'المدينة',
    titleAr: 'المدينة — سيدان الطرق المعبدة',
    categoryAr: 'طرق إسفلتية وساحلية',
    descriptionAr:
      'سيارة سيدان انسيابية بمركز ثقل منخفض وتسارع سريع وتوجيه دقيق واستهلاك وقود اقتصادي على الطرق المعبدة.',
    unlockPriceCoins: 1500,
    baseMassKg: 1380,
    maxCargoKg: 120,
    passengerCapacity: 4,
    centerOfMassOffsetY: -0.45,
    wheelbaseM: 2.68,
    trackWidthM: 1.82,
    wheelRadiusM: 0.36,
    wheelWidthM: 0.25,
    suspensionRestLengthM: 0.46,
    suspensionMaxTravelM: 0.2,
    suspensionStiffness: 48000,
    suspensionDamping: 6100,
    antiRollStiffness: 12000,
    maxEngineTorqueNm: 340,
    maxPowerHp: 255,
    idleRpm: 750,
    redlineRpm: 6800,
    maxBrakeForceN: 25500,
    maxReverseForceN: 10500,
    handbrakeForceN: 17000,
    maxSteerAngleRad: THREE.MathUtils.degToRad(34),
    steerSpeedRadPerSec: 4.4,
    defaultDrivetrain: 'FWD',
    supportedDrivetrains: ['FWD', 'AWD'],
    forwardGearsCount: 6,
    fuelTankLiters: 60,
    baseFuelBurnLPerMin: 0.85,
    dragCoefficient: 0.29,
    rollingResistance: 155,
    engineBaseFreqHz: 62,
    defaultPaintHex: '#3f6a3c',
    defaultTireType: 'highway_sport',
  },
  jabal: {
    id: 'jabal',
    nameAr: 'الجبل',
    titleAr: 'الجبل — شاحنة النقل الثقيل',
    categoryAr: 'شحن ثقيل وعقبات جبلية',
    descriptionAr:
      'شاحنة نقل متوسطة عالية التحمل بناقل حركة 8 غيارات وفرامل محرك جبلية مخصصة لنقل البضائع الثقيلة عبر النقيل.',
    unlockPriceCoins: 3000,
    baseMassKg: 4400,
    maxCargoKg: 2400,
    passengerCapacity: 3,
    centerOfMassOffsetY: -0.22,
    wheelbaseM: 3.9,
    trackWidthM: 2.26,
    wheelRadiusM: 0.54,
    wheelWidthM: 0.36,
    suspensionRestLengthM: 0.72,
    suspensionMaxTravelM: 0.34,
    suspensionStiffness: 92000,
    suspensionDamping: 11800,
    antiRollStiffness: 18500,
    maxEngineTorqueNm: 1120,
    maxPowerHp: 380,
    idleRpm: 650,
    redlineRpm: 3800,
    maxBrakeForceN: 46000,
    maxReverseForceN: 24000,
    handbrakeForceN: 38000,
    maxSteerAngleRad: THREE.MathUtils.degToRad(28),
    steerSpeedRadPerSec: 2.3,
    defaultDrivetrain: '4H',
    supportedDrivetrains: ['RWD', '4H', '4L'],
    forwardGearsCount: 8,
    fuelTankLiters: 160,
    baseFuelBurnLPerMin: 2.35,
    dragCoefficient: 0.68,
    rollingResistance: 460,
    engineBaseFreqHz: 31,
    defaultPaintHex: '#b91c1c',
    defaultTireType: 'mud_rock',
  },
  barq: {
    id: 'barq',
    nameAr: 'البرق',
    titleAr: 'البرق — سيارة سباق رالي جبلية AWD',
    categoryAr: 'سباقات الرالي والمنعطفات',
    descriptionAr:
      'سيارة سباق ريفية خفيفة الوزن بدفع رباعي دائم وتوربو مزدوج وتعليق رياضي للثبات الفائق في المنعطفات الجبلية والترابية.',
    unlockPriceCoins: 3600,
    baseMassKg: 1320,
    maxCargoKg: 80,
    passengerCapacity: 2,
    centerOfMassOffsetY: -0.44,
    wheelbaseM: 2.58,
    trackWidthM: 1.92,
    wheelRadiusM: 0.38,
    wheelWidthM: 0.3,
    suspensionRestLengthM: 0.52,
    suspensionMaxTravelM: 0.28,
    suspensionStiffness: 52000,
    suspensionDamping: 6800,
    antiRollStiffness: 14500,
    maxEngineTorqueNm: 520,
    maxPowerHp: 390,
    idleRpm: 950,
    redlineRpm: 7400,
    maxBrakeForceN: 28500,
    maxReverseForceN: 13500,
    handbrakeForceN: 22500,
    maxSteerAngleRad: THREE.MathUtils.degToRad(36),
    steerSpeedRadPerSec: 4.8,
    defaultDrivetrain: 'AWD',
    supportedDrivetrains: ['AWD', 'RWD'],
    forwardGearsCount: 6,
    fuelTankLiters: 68,
    baseFuelBurnLPerMin: 1.65,
    dragCoefficient: 0.31,
    rollingResistance: 170,
    engineBaseFreqHz: 68,
    defaultPaintHex: '#eab308',
    defaultTireType: 'all_terrain',
  },
  hafilat: {
    id: 'hafilat',
    nameAr: 'الحافلة الجبلية',
    titleAr: 'الحافلة — باص نقل الركاب بين القرى',
    categoryAr: 'نقل الركاب والرحلات الجماعية',
    descriptionAr:
      'حافلة ركاب يمنية تتسع لـ 14 راكبًا مع رف أمتعة علوي، مصممة لنقل المسافرين بأمان عبر العقبات والقرى والساحل.',
    unlockPriceCoins: 2100,
    baseMassKg: 2650,
    maxCargoKg: 650,
    passengerCapacity: 14,
    centerOfMassOffsetY: -0.28,
    wheelbaseM: 3.35,
    trackWidthM: 1.96,
    wheelRadiusM: 0.44,
    wheelWidthM: 0.28,
    suspensionRestLengthM: 0.6,
    suspensionMaxTravelM: 0.3,
    suspensionStiffness: 58000,
    suspensionDamping: 7200,
    antiRollStiffness: 11200,
    maxEngineTorqueNm: 540,
    maxPowerHp: 230,
    idleRpm: 720,
    redlineRpm: 4800,
    maxBrakeForceN: 31000,
    maxReverseForceN: 14000,
    handbrakeForceN: 25000,
    maxSteerAngleRad: THREE.MathUtils.degToRad(30),
    steerSpeedRadPerSec: 2.8,
    defaultDrivetrain: '4H',
    supportedDrivetrains: ['RWD', '4H', '4L'],
    forwardGearsCount: 6,
    fuelTankLiters: 110,
    baseFuelBurnLPerMin: 1.48,
    dragCoefficient: 0.52,
    rollingResistance: 290,
    engineBaseFreqHz: 38,
    defaultPaintHex: '#0284c7',
    defaultTireType: 'all_terrain',
  },
  munqidh: {
    id: 'munqidh',
    nameAr: 'المنقذ',
    titleAr: 'المنقذ — مركبة الإنقاذ والسحب الجبلي',
    categoryAr: 'مهمات الإنقاذ والطوارئ الوعرة',
    descriptionAr:
      'مركبة إنقاذ ثقيلة رباعية الدفع مجهزة بونش سحب أمامي وذراع قطر خلفي ومنارة طوارئ لإسعاف وسحب المركبات العالقة.',
    unlockPriceCoins: 2800,
    baseMassKg: 2880,
    maxCargoKg: 1100,
    passengerCapacity: 4,
    centerOfMassOffsetY: -0.34,
    wheelbaseM: 3.2,
    trackWidthM: 2.06,
    wheelRadiusM: 0.5,
    wheelWidthM: 0.35,
    suspensionRestLengthM: 0.68,
    suspensionMaxTravelM: 0.36,
    suspensionStiffness: 66000,
    suspensionDamping: 8200,
    antiRollStiffness: 13200,
    maxEngineTorqueNm: 760,
    maxPowerHp: 340,
    idleRpm: 700,
    redlineRpm: 4600,
    maxBrakeForceN: 36000,
    maxReverseForceN: 18500,
    handbrakeForceN: 29000,
    maxSteerAngleRad: THREE.MathUtils.degToRad(31),
    steerSpeedRadPerSec: 2.9,
    defaultDrivetrain: '4H',
    supportedDrivetrains: ['2H', '4H', '4L'],
    forwardGearsCount: 6,
    fuelTankLiters: 130,
    baseFuelBurnLPerMin: 1.78,
    dragCoefficient: 0.49,
    rollingResistance: 320,
    engineBaseFreqHz: 35,
    defaultPaintHex: '#ea580c',
    defaultTireType: 'mud_rock',
  },
  badiya: {
    id: 'badiya',
    nameAr: 'البادية',
    titleAr: 'البادية — شاص صحراوي طويل القاعدة',
    categoryAr: 'نقل صحراوي وجبلي ثقيل',
    descriptionAr:
      'بيك أب شاص طويل القاعدة ذو عزم جبار وخزان وقود مزدوج لعبور صحراء المسالك والعقبات الصخرية بأثقل الحمولات.',
    unlockPriceCoins: 2600,
    baseMassKg: 2150,
    maxCargoKg: 1200,
    passengerCapacity: 3,
    centerOfMassOffsetY: -0.35,
    wheelbaseM: 3.18,
    trackWidthM: 1.92,
    wheelRadiusM: 0.46,
    wheelWidthM: 0.31,
    suspensionRestLengthM: 0.66,
    suspensionMaxTravelM: 0.35,
    suspensionStiffness: 54000,
    suspensionDamping: 6600,
    antiRollStiffness: 10800,
    maxEngineTorqueNm: 530,
    maxPowerHp: 295,
    idleRpm: 760,
    redlineRpm: 5500,
    maxBrakeForceN: 27000,
    maxReverseForceN: 14200,
    handbrakeForceN: 22000,
    maxSteerAngleRad: THREE.MathUtils.degToRad(32),
    steerSpeedRadPerSec: 3.2,
    defaultDrivetrain: '4H',
    supportedDrivetrains: ['2H', '4H', '4L'],
    forwardGearsCount: 6,
    fuelTankLiters: 140,
    baseFuelBurnLPerMin: 1.42,
    dragCoefficient: 0.45,
    rollingResistance: 240,
    engineBaseFreqHz: 40,
    defaultPaintHex: '#d6b06a',
    defaultTireType: 'sand_dune',
  },
  aseel: {
    id: 'aseel',
    nameAr: 'الأصيل',
    titleAr: 'الأصيل — أيقونة العقبات الكلاسيكية 4×4',
    categoryAr: 'تسلق صخور ودروب تراثية',
    descriptionAr:
      'مركبة دفع رباعي كلاسيكية قصيرة القاعدة بقدرة مناورة مذهلة وزوايا اقتراب ومغادرة عالية لتسلق أصعب الصخور الجبلية.',
    unlockPriceCoins: 1900,
    baseMassKg: 1580,
    maxCargoKg: 200,
    passengerCapacity: 4,
    centerOfMassOffsetY: -0.37,
    wheelbaseM: 2.38,
    trackWidthM: 1.84,
    wheelRadiusM: 0.45,
    wheelWidthM: 0.32,
    suspensionRestLengthM: 0.65,
    suspensionMaxTravelM: 0.38,
    suspensionStiffness: 41000,
    suspensionDamping: 5300,
    antiRollStiffness: 9200,
    maxEngineTorqueNm: 410,
    maxPowerHp: 235,
    idleRpm: 750,
    redlineRpm: 5400,
    maxBrakeForceN: 22000,
    maxReverseForceN: 12000,
    handbrakeForceN: 19500,
    maxSteerAngleRad: THREE.MathUtils.degToRad(36),
    steerSpeedRadPerSec: 3.6,
    defaultDrivetrain: '4L',
    supportedDrivetrains: ['2H', '4H', '4L'],
    forwardGearsCount: 5,
    fuelTankLiters: 75,
    baseFuelBurnLPerMin: 1.2,
    dragCoefficient: 0.46,
    rollingResistance: 210,
    engineBaseFreqHz: 44,
    defaultPaintHex: '#4d7c0f',
    defaultTireType: 'mud_rock',
  },
};

export const TIRE_COMPOUND_GRIP: Record<
  TireCompoundType,
  {
    labelAr: string;
    priceCoins: number;
    asphalt: number;
    dirt: number;
    gravel: number;
    sand: number;
    mud: number;
    rock: number;
  }
> = {
  all_terrain: {
    labelAr: 'متعدد التضاريس (A/T)',
    priceCoins: 0,
    asphalt: 1.04,
    dirt: 0.86,
    gravel: 0.82,
    sand: 0.76,
    mud: 0.72,
    rock: 0.88,
  },
  mud_rock: {
    labelAr: 'جبلي صخري وطيني (M/T)',
    priceCoins: 450,
    asphalt: 0.92,
    dirt: 0.96,
    gravel: 0.94,
    sand: 0.74,
    mud: 0.92,
    rock: 1.05,
  },
  sand_dune: {
    labelAr: 'رملي عريض للكثبان (Sand)',
    priceCoins: 450,
    asphalt: 0.94,
    dirt: 0.88,
    gravel: 0.84,
    sand: 1.06,
    mud: 0.68,
    rock: 0.82,
  },
  highway_sport: {
    labelAr: 'إسفلتي رياضي (Highway)',
    priceCoins: 400,
    asphalt: 1.18,
    dirt: 0.64,
    gravel: 0.58,
    sand: 0.48,
    mud: 0.44,
    rock: 0.62,
  },
};

function makeDefaultCustom(
  id: VehicleId,
  plate: string,
  finish: VehicleCustomization['paintFinish'] = 'metallic',
  decal: VehicleCustomization['decalStyle'] = 'mountain_compass',
  cargo = 0
): VehicleCustomization {
  const s = VEHICLE_SPECS[id];
  return {
    paintColorHex: s.defaultPaintHex,
    paintFinish: finish,
    rimColorHex: '#cbd5e1',
    interiorColorHex: '#78350f',
    bullbarStyle: id === 'madina' || id === 'barq' ? 'none' : 'expedition_winch',
    roofRackInstalled: id !== 'madina',
    roofCargoBoxInstalled: id === 'shahiq' || id === 'hafilat',
    pickupAccessory: id === 'saqr' || id === 'badiya' ? 'roll_bar' : 'none',
    decalStyle: decal,
    plateTextAr: plate,
    auxLightsInstalled: id !== 'madina',
    tireType: s.defaultTireType,
    rideHeightOffsetM: 0.02,
    gearPreset: id === 'jabal' || id === 'aseel' ? 'crawler' : id === 'madina' || id === 'barq' ? 'highway' : 'balanced',
    cargoLoadPct: cargo,
    engineUpgradeLevel: 1,
    transmissionUpgradeLevel: 1,
    suspensionUpgradeLevel: 1,
    brakeUpgradeLevel: 1,
  };
}

export function getDefaultCustomizations(): Record<VehicleId, VehicleCustomization> {
  return {
    shahiq: makeDefaultCustom('shahiq', 'تعز ٤٠٢١', 'metallic', 'mountain_compass', 0),
    saqr: makeDefaultCustom('saqr', 'إب ٢١٩٠', 'metallic', 'yemeni_stripe', 50),
    rahhal: makeDefaultCustom('rahhal', 'مأرب ٧٧٣٠', 'pearl', 'desert_falcon', 0),
    madina: makeDefaultCustom('madina', 'عدن ٥٥١٢', 'pearl', 'none', 0),
    jabal: makeDefaultCustom('jabal', 'صنعاء ٩٠٨٤', 'matte', 'yemeni_stripe', 50),
    barq: makeDefaultCustom('barq', 'تعز ١٠٩٩', 'pearl', 'desert_falcon', 0),
    hafilat: makeDefaultCustom('hafilat', 'الحديدة ٣٣٤٠', 'metallic', 'yemeni_stripe', 25),
    munqidh: makeDefaultCustom('munqidh', 'طوارئ ٩٩١١', 'matte', 'mountain_compass', 25),
    badiya: makeDefaultCustom('badiya', 'شبوة ٦٦٢٠', 'matte', 'yemeni_stripe', 50),
    aseel: makeDefaultCustom('aseel', 'حجة ٨٨٠٥', 'metallic', 'mountain_compass', 0),
  };
}

function createLicensePlateTexture(plateTextAr: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 256, 64);

  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(0, 0, 256, 16);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px Cairo, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('اليمن — YEMEN · مَسَالِك', 128, 12);

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 252, 60);

  ctx.direction = 'rtl';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 28px Cairo, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(plateTextAr || 'تعز ٤٠٢١', 128, 41);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export interface FleetVehicleVisuals {
  rootGroup: THREE.Group;
  chassisGroup: THREE.Group;
  steeringWheelGroup: THREE.Group;
  cockpitCameraAnchor: THREE.Object3D;
  hoodCameraAnchor: THREE.Object3D;
  headlightSpotLeft: THREE.SpotLight;
  headlightSpotRight: THREE.SpotLight;
  rebuildForVehicle: (
    vehicleId: VehicleId,
    customization: VehicleCustomization
  ) => void;
  updateVisuals: (
    position: THREE.Vector3,
    quaternion: THREE.Quaternion,
    chassisPitchRad: number,
    chassisRollRad: number,
    steeringAngleRad: number,
    braking: boolean,
    reversing: boolean,
    headlightsOn: boolean,
    wipersOn: boolean,
    leftIndicatorOn: boolean,
    rightIndicatorOn: boolean,
    engineRunning: boolean,
    speedKmh: number,
    rpm: number,
    fuelLiters: number,
    damage: DamageState,
    skyColorHex: number,
    cameraDistanceM: number,
    cockpitSeatOffsetY: number,
    elapsedSec: number,
    wheels: [WheelTelemetry, WheelTelemetry, WheelTelemetry, WheelTelemetry]
  ) => void;
  dispose: () => void;
}

export function createFleetVehicleVisuals(isSoftwareGl: boolean): FleetVehicleVisuals {
  const rootGroup = new THREE.Group();
  const chassisGroup = new THREE.Group();
  rootGroup.add(chassisGroup);

  const interiorGroup = new THREE.Group();
  const exteriorDetailGroup = new THREE.Group();
  const wipersGroup = new THREE.Group();
  const wiperPivotLeft = new THREE.Group();
  const wiperPivotRight = new THREE.Group();
  const smokePuffsGroup = new THREE.Group();
  const frontBumperGroup = new THREE.Group();
  const hoodPanelGroup = new THREE.Group();

  const steeringWheelGroup = new THREE.Group();
  const speedNeedlePivot = new THREE.Group();
  const rpmNeedlePivot = new THREE.Group();
  const fuelNeedlePivot = new THREE.Group();

  const cockpitCameraAnchor = new THREE.Object3D();
  const hoodCameraAnchor = new THREE.Object3D();
  const baseCockpitPos = new THREE.Vector3(-0.42, 1.56, 0.05);

  const headlightSpotLeft = new THREE.SpotLight(0xfffbeb, 0, 82, Math.PI / 4.8, 0.45, 1.4);
  const headlightSpotRight = new THREE.SpotLight(0xfffbeb, 0, 82, Math.PI / 4.8, 0.45, 1.4);
  rootGroup.add(headlightSpotLeft, headlightSpotRight);
  rootGroup.add(headlightSpotLeft.target, headlightSpotRight.target);

  let currentSpec: VehicleSpec = VEHICLE_SPECS.shahiq;
  let currentCustom: VehicleCustomization = getDefaultCustomizations().shahiq;

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
  const suspensionStrutGroups: [THREE.Group, THREE.Group, THREE.Group, THREE.Group] = [
    new THREE.Group(),
    new THREE.Group(),
    new THREE.Group(),
    new THREE.Group(),
  ];

  for (let i = 0; i < 4; i++) {
    wheelSteeringGroups[i].add(wheelSpinGroups[i]);
    rootGroup.add(wheelSteeringGroups[i]);
    rootGroup.add(suspensionStrutGroups[i]);
  }

  const bodyPaintMat = new THREE.MeshPhysicalMaterial({
    color: 0xc87236,
    metalness: 0.58,
    roughness: 0.24,
    clearcoat: 0.88,
    clearcoatRoughness: 0.12,
  });
  const dirtOverlayMat = new THREE.MeshStandardMaterial({
    color: 0x6b533b,
    roughness: 0.96,
    metalness: 0.02,
    transparent: true,
    opacity: 0.0,
  });
  const secondaryBodyMat = new THREE.MeshStandardMaterial({
    color: 0xf1ede4,
    metalness: 0.2,
    roughness: 0.45,
  });
  const decalAccentMat = new THREE.MeshStandardMaterial({
    color: 0xd4a253,
    metalness: 0.35,
    roughness: 0.35,
  });
  const darkTrimMat = new THREE.MeshStandardMaterial({
    color: 0x1c212b,
    metalness: 0.42,
    roughness: 0.68,
  });
  const interiorLeatherMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    metalness: 0.08,
    roughness: 0.72,
  });
  const dashPlasticMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    metalness: 0.15,
    roughness: 0.65,
  });
  const mirrorReflectMat = new THREE.MeshPhysicalMaterial({
    color: 0x9ec5e8,
    metalness: 0.92,
    roughness: 0.06,
    clearcoat: 1.0,
  });
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    metalness: 0.84,
    roughness: 0.26,
  });
  const coilSpringMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.7,
    roughness: 0.3,
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e293b,
    metalness: 0.1,
    roughness: 0.08,
    transmission: isSoftwareGl ? 0 : 0.72,
    transparent: true,
    opacity: isSoftwareGl ? 0.45 : 0.84,
    depthWrite: false,
  });
  const crackedWindshieldMat = new THREE.MeshBasicMaterial({
    color: 0xe2e8f0,
    wireframe: true,
    transparent: true,
    opacity: 0.0,
  });
  const tireRubberMat = new THREE.MeshStandardMaterial({
    color: 0x17191e,
    metalness: 0.08,
    roughness: 0.88,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    metalness: 0.85,
    roughness: 0.22,
  });
  const caliperMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    metalness: 0.6,
    roughness: 0.35,
  });
  const woodCargoMat = new THREE.MeshStandardMaterial({
    color: 0x925f36,
    metalness: 0.05,
    roughness: 0.82,
  });
  const headlightMat = new THREE.MeshStandardMaterial({
    color: 0xfffbeb,
    emissive: new THREE.Color(0xfef3c7),
    emissiveIntensity: 1.5,
  });
  const brakeLightMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b,
    emissive: new THREE.Color(0xef4444),
    emissiveIntensity: 0.35,
  });
  const reverseLightMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.0,
  });
  const indicatorLeftMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    emissive: new THREE.Color(0xf59e0b),
    emissiveIntensity: 0.1,
  });
  const indicatorRightMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    emissive: new THREE.Color(0xf59e0b),
    emissiveIntensity: 0.1,
  });
  const gaugeNeedleMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
  const gaugeFaceMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
  const smokeMat = new THREE.MeshBasicMaterial({
    color: 0x94a3b8,
    transparent: true,
    opacity: 0.0,
  });
  const licensePlateMat = new THREE.MeshStandardMaterial({
    roughness: 0.35,
    metalness: 0.15,
  });

  let currentPlateTex: THREE.CanvasTexture | null = null;
  const activeGeometries: THREE.BufferGeometry[] = [];
  const clearActiveGeometries = () => {
    while (activeGeometries.length > 0) {
      activeGeometries.pop()?.dispose();
    }
  };
  const trackGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    activeGeometries.push(g);
    return g;
  };

  const clearGroup = (grp: THREE.Group) => {
    while (grp.children.length > 0) {
      grp.remove(grp.children[0]);
    }
  };

  const rebuildForVehicle = (
    vehicleId: VehicleId,
    customization: VehicleCustomization
  ) => {
    currentSpec = VEHICLE_SPECS[vehicleId];
    currentCustom = customization;

    bodyPaintMat.color.set(customization.paintColorHex);
    if (customization.paintFinish === 'matte') {
      bodyPaintMat.metalness = 0.18;
      bodyPaintMat.roughness = 0.62;
      bodyPaintMat.clearcoat = 0.1;
    } else if (customization.paintFinish === 'pearl') {
      bodyPaintMat.metalness = 0.45;
      bodyPaintMat.roughness = 0.18;
      bodyPaintMat.clearcoat = 1.0;
    } else {
      bodyPaintMat.metalness = 0.68;
      bodyPaintMat.roughness = 0.22;
      bodyPaintMat.clearcoat = 0.85;
    }

    rimMat.color.set(customization.rimColorHex || '#cbd5e1');
    interiorLeatherMat.color.set(customization.interiorColorHex || '#78350f');

    if (currentPlateTex) currentPlateTex.dispose();
    currentPlateTex = createLicensePlateTexture(customization.plateTextAr || 'تعز ٤٠٢١');
    licensePlateMat.map = currentPlateTex;
    licensePlateMat.needsUpdate = true;

    clearActiveGeometries();
    clearGroup(chassisGroup);
    clearGroup(interiorGroup);
    clearGroup(exteriorDetailGroup);
    clearGroup(wipersGroup);
    clearGroup(wiperPivotLeft);
    clearGroup(wiperPivotRight);
    clearGroup(smokePuffsGroup);
    clearGroup(frontBumperGroup);
    clearGroup(hoodPanelGroup);
    clearGroup(steeringWheelGroup);
    clearGroup(speedNeedlePivot);
    clearGroup(rpmNeedlePivot);
    clearGroup(fuelNeedlePivot);

    for (let i = 0; i < 4; i++) {
      clearGroup(wheelSpinGroups[i]);
      clearGroup(suspensionStrutGroups[i]);
    }

    // Build Distinct 3D Silhouettes for all 10 Playable Vehicles
    if (vehicleId === 'shahiq' || vehicleId === 'aseel') {
      // 1. الشاهق (Expedition SUV) & 10. الأصيل (Short-Wheelbase Classic 4x4 Crawler)
      const isShort = vehicleId === 'aseel';
      const lenZ = isShort ? 3.85 : 4.35;
      const lowerHull = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.9, 0.72, lenZ)),
        bodyPaintMat
      );
      lowerHull.position.set(0, 0.78, 0);
      lowerHull.castShadow = !isSoftwareGl;

      const mudSkirt = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.94, 0.36, lenZ + 0.04)),
        dirtOverlayMat
      );
      mudSkirt.position.set(0, 0.62, 0);

      const hoodMesh = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.74, 0.12, 1.25)),
        bodyPaintMat
      );
      hoodPanelGroup.add(hoodMesh);
      hoodPanelGroup.position.set(0, 1.16, -lenZ * 0.32);

      const cabin = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.76, 0.68, lenZ * 0.58)),
        isShort ? secondaryBodyMat : bodyPaintMat
      );
      cabin.position.set(0, 1.46, 0.36);
      cabin.castShadow = !isSoftwareGl;

      const roofCap = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.78, 0.1, lenZ * 0.59)),
        secondaryBodyMat
      );
      roofCap.position.set(0, 1.84, 0.36);

      const glassBox = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.8, 0.52, lenZ * 0.55)),
        glassMat
      );
      glassBox.position.set(0, 1.48, 0.35);
      glassBox.renderOrder = 2;

      const crackOverlay = new THREE.Mesh(
        trackGeo(new THREE.PlaneGeometry(1.6, 0.48, 5, 3)),
        crackedWindshieldMat
      );
      crackOverlay.position.set(0, 1.48, -0.78);
      crackOverlay.rotation.y = Math.PI;

      const grille = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.36, 0.36, 0.08)),
        darkTrimMat
      );
      grille.position.set(0, 0.88, -lenZ * 0.5 - 0.01);

      const spareWheel = new THREE.Mesh(
        trackGeo(new THREE.CylinderGeometry(0.42, 0.42, 0.28, 18)),
        tireRubberMat
      );
      spareWheel.rotation.x = Math.PI * 0.5;
      spareWheel.position.set(0.22, 1.12, lenZ * 0.5 + 0.1);

      chassisGroup.add(
        lowerHull,
        mudSkirt,
        hoodPanelGroup,
        cabin,
        roofCap,
        glassBox,
        crackOverlay,
        grille,
        spareWheel
      );
      baseCockpitPos.set(-0.42, 1.54, 0.02);
      hoodCameraAnchor.position.set(0, 1.32, -0.95);
    } else if (vehicleId === 'saqr' || vehicleId === 'badiya' || vehicleId === 'munqidh') {
      // 2. الصقر (Pickup), 8. المنقذ (Heavy Rescue Tow Rig), 9. البادية (Long-Bed Desert Pickup)
      const isLong = vehicleId === 'badiya' || vehicleId === 'munqidh';
      const frontChassis = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.88, 0.7, 2.45)),
        bodyPaintMat
      );
      frontChassis.position.set(0, 0.76, -1.08);
      frontChassis.castShadow = !isSoftwareGl;

      const mudSkirt = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.92, 0.34, isLong ? 4.85 : 4.45)),
        dirtOverlayMat
      );
      mudSkirt.position.set(0, 0.58, 0.08);

      const hoodMesh = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.74, 0.1, 1.25)),
        bodyPaintMat
      );
      hoodPanelGroup.add(hoodMesh);
      hoodPanelGroup.position.set(0, 1.14, -1.55);

      const cab = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.78, 0.72, 1.38)),
        bodyPaintMat
      );
      cab.position.set(0, 1.44, -0.48);
      cab.castShadow = !isSoftwareGl;

      const cabGlass = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.82, 0.52, 1.26)),
        glassMat
      );
      cabGlass.position.set(0, 1.47, -0.48);
      cabGlass.renderOrder = 2;

      const bedLen = isLong ? 2.45 : 2.15;
      const bedFloor = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.88, 0.22, bedLen)),
        darkTrimMat
      );
      bedFloor.position.set(0, 0.58, 1.28);

      const bedWallLeft = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.12, 0.52, bedLen)),
        bodyPaintMat
      );
      bedWallLeft.position.set(-0.88, 0.9, 1.28);

      const bedWallRight = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.12, 0.52, bedLen)),
        bodyPaintMat
      );
      bedWallRight.position.set(0.88, 0.9, 1.28);

      const tailgate = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.88, 0.52, 0.12)),
        bodyPaintMat
      );
      tailgate.position.set(0, 0.9, 1.28 + bedLen * 0.5 - 0.06);

      chassisGroup.add(
        frontChassis,
        mudSkirt,
        hoodPanelGroup,
        cab,
        cabGlass,
        bedFloor,
        bedWallLeft,
        bedWallRight,
        tailgate
      );

      if (vehicleId === 'munqidh') {
        // Rescue Tow Crane Boom & Emergency Amber Lightbar
        const craneBoom = new THREE.Mesh(
          trackGeo(new THREE.CylinderGeometry(0.09, 0.12, 2.3, 10)),
          caliperMat
        );
        craneBoom.rotation.x = -0.65;
        craneBoom.position.set(0, 1.45, 1.15);

        const emergencyBeacon = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(1.15, 0.14, 0.24)),
          indicatorLeftMat
        );
        emergencyBeacon.position.set(0, 1.88, -0.48);
        chassisGroup.add(craneBoom, emergencyBeacon);
      } else if (customization.pickupAccessory === 'roll_bar') {
        const rbArch = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(1.68, 0.65, 0.12)),
          steelMat
        );
        rbArch.position.set(0, 1.42, 0.35);
        exteriorDetailGroup.add(rbArch);
      } else if (customization.pickupAccessory === 'canopy_tent') {
        const canopyCover = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(1.78, 0.68, bedLen - 0.1)),
          secondaryBodyMat
        );
        canopyCover.position.set(0, 1.44, 1.28);
        exteriorDetailGroup.add(canopyCover);
      }

      if (customization.cargoLoadPct > 0) {
        const crate1 = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(1.42, 0.58, 0.88)),
          woodCargoMat
        );
        crate1.position.set(0, 0.96, 0.78);
        chassisGroup.add(crate1);

        if (customization.cargoLoadPct >= 80) {
          const crate2 = new THREE.Mesh(
            trackGeo(new THREE.BoxGeometry(1.36, 0.62, 0.88)),
            woodCargoMat
          );
          crate2.position.set(0, 0.98, 1.72);
          chassisGroup.add(crate2);
        }
      }

      baseCockpitPos.set(-0.4, 1.52, -0.38);
      hoodCameraAnchor.position.set(0, 1.25, -1.2);
    } else if (vehicleId === 'rahhal') {
      // 3. الرحّال — Desert Raid Buggy / Dune Cruiser
      const buggyBody = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.82, 0.56, 4.05)),
        bodyPaintMat
      );
      buggyBody.position.set(0, 0.82, 0);
      buggyBody.castShadow = !isSoftwareGl;

      const mudSkirt = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.86, 0.32, 4.08)),
        dirtOverlayMat
      );
      mudSkirt.position.set(0, 0.68, 0);

      const slopedRoof = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.56, 0.58, 2.1)),
        darkTrimMat
      );
      slopedRoof.position.set(0, 1.38, 0.15);

      const buggyGlass = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.6, 0.44, 1.85)),
        glassMat
      );
      buggyGlass.position.set(0, 1.38, 0.12);
      buggyGlass.renderOrder = 2;

      const roofScoop = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(0.68, 0.18, 0.85)),
        bodyPaintMat
      );
      roofScoop.position.set(0, 1.72, 0.1);

      const rearSpoiler = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.74, 0.1, 0.42)),
        steelMat
      );
      rearSpoiler.position.set(0, 1.62, 1.85);

      chassisGroup.add(buggyBody, mudSkirt, slopedRoof, buggyGlass, roofScoop, rearSpoiler);
      baseCockpitPos.set(-0.38, 1.44, 0.02);
      hoodCameraAnchor.position.set(0, 1.2, -0.95);
    } else if (vehicleId === 'madina' || vehicleId === 'barq') {
      // 4. المدينة (Touring Sedan) & 6. البرق (Rally Sport AWD with Rear Wing & Hood Vent)
      const isRally = vehicleId === 'barq';
      const sedanLower = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(isRally ? 1.88 : 1.8, 0.52, isRally ? 4.22 : 4.48)),
        bodyPaintMat
      );
      sedanLower.position.set(0, 0.56, 0);
      sedanLower.castShadow = !isSoftwareGl;

      const mudSkirt = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.9, 0.25, 4.35)),
        dirtOverlayMat
      );
      mudSkirt.position.set(0, 0.42, 0);

      const sedanCabin = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.64, 0.52, 2.18)),
        bodyPaintMat
      );
      sedanCabin.position.set(0, 1.06, 0.12);
      sedanCabin.castShadow = !isSoftwareGl;

      const sedanGlass = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.68, 0.42, 2.08)),
        glassMat
      );
      sedanGlass.position.set(0, 1.06, 0.12);
      sedanGlass.renderOrder = 2;

      chassisGroup.add(sedanLower, mudSkirt, sedanCabin, sedanGlass);

      if (isRally) {
        const rallyWing = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(1.76, 0.08, 0.36)),
          darkTrimMat
        );
        rallyWing.position.set(0, 1.18, 1.92);
        const hoodScoop = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(0.62, 0.12, 0.55)),
          darkTrimMat
        );
        hoodScoop.position.set(0, 0.86, -1.25);
        chassisGroup.add(rallyWing, hoodScoop);
      }

      baseCockpitPos.set(-0.38, 1.14, 0.02);
      hoodCameraAnchor.position.set(0, 0.94, -1.05);
    } else if (vehicleId === 'hafilat') {
      // 7. الحافلة الجبلية — 14-Seater Yemeni Highland Passenger Minibus
      const busLower = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(2.02, 0.85, 5.15)),
        bodyPaintMat
      );
      busLower.position.set(0, 0.86, 0);
      busLower.castShadow = !isSoftwareGl;

      const busUpper = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.98, 0.88, 5.05)),
        secondaryBodyMat
      );
      busUpper.position.set(0, 1.72, 0.02);
      busUpper.castShadow = !isSoftwareGl;

      const busWindows = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(2.02, 0.56, 4.82)),
        glassMat
      );
      busWindows.position.set(0, 1.74, 0.02);
      busWindows.renderOrder = 2;

      const mudSkirt = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(2.05, 0.34, 5.18)),
        dirtOverlayMat
      );
      mudSkirt.position.set(0, 0.58, 0);

      chassisGroup.add(busLower, busUpper, busWindows, mudSkirt);
      baseCockpitPos.set(-0.48, 1.82, -1.78);
      hoodCameraAnchor.position.set(0, 1.95, -2.42);
    } else {
      // 5. الجبل — Heavy Mountain Cargo Truck
      const truckFrame = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(2.22, 0.48, 6.2)),
        darkTrimMat
      );
      truckFrame.position.set(0, 0.72, 0.25);

      const mudSkirt = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(2.26, 0.42, 6.22)),
        dirtOverlayMat
      );
      mudSkirt.position.set(0, 0.68, 0.25);

      const truckCab = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(2.24, 1.68, 1.85)),
        bodyPaintMat
      );
      truckCab.position.set(0, 1.72, -1.85);
      truckCab.castShadow = !isSoftwareGl;

      const truckGlass = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(2.28, 0.66, 1.65)),
        glassMat
      );
      truckGlass.position.set(0, 2.05, -1.88);
      truckGlass.renderOrder = 2;

      const cargoBoxWall = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(2.3, 1.25, 3.95)),
        secondaryBodyMat
      );
      cargoBoxWall.position.set(0, 1.58, 1.22);
      cargoBoxWall.castShadow = !isSoftwareGl;

      chassisGroup.add(truckFrame, mudSkirt, truckCab, truckGlass, cargoBoxWall);

      if (customization.cargoLoadPct > 0) {
        const heavyCargo = new THREE.Mesh(
          trackGeo(
            new THREE.BoxGeometry(
              2.05,
              0.65 + (customization.cargoLoadPct / 100) * 0.65,
              3.55
            )
          ),
          woodCargoMat
        );
        heavyCargo.position.set(0, 2.25, 1.22);
        chassisGroup.add(heavyCargo);
      }

      baseCockpitPos.set(-0.55, 2.16, -2.02);
      hoodCameraAnchor.position.set(0, 2.58, -2.35);
    }

    // Mirrors, Handles, Decals & Plates
    const bodyHalfW = vehicleId === 'jabal' ? 1.13 : vehicleId === 'hafilat' ? 1.02 : 0.94;
    const mirrorY =
      vehicleId === 'jabal'
        ? 2.05
        : vehicleId === 'hafilat'
        ? 1.68
        : vehicleId === 'madina' || vehicleId === 'barq'
        ? 0.96
        : 1.38;
    const mirrorZ =
      vehicleId === 'jabal' ? -2.45 : vehicleId === 'hafilat' ? -2.25 : -0.78;

    const mirrorHousingGeo = trackGeo(new THREE.BoxGeometry(0.22, 0.15, 0.12));
    const mirrorGlassGeo = trackGeo(new THREE.PlaneGeometry(0.18, 0.12));

    const leftMirrorGrp = new THREE.Group();
    leftMirrorGrp.position.set(-bodyHalfW - 0.1, mirrorY, mirrorZ);
    const lmHouse = new THREE.Mesh(mirrorHousingGeo, darkTrimMat);
    const lmGlass = new THREE.Mesh(mirrorGlassGeo, mirrorReflectMat);
    lmGlass.position.set(0, 0, 0.065);
    leftMirrorGrp.add(lmHouse, lmGlass);

    const rightMirrorGrp = new THREE.Group();
    rightMirrorGrp.position.set(bodyHalfW + 0.1, mirrorY, mirrorZ);
    const rmHouse = new THREE.Mesh(mirrorHousingGeo, darkTrimMat);
    const rmGlass = new THREE.Mesh(mirrorGlassGeo, mirrorReflectMat);
    rmGlass.position.set(0, 0, 0.065);
    rightMirrorGrp.add(rmHouse, rmGlass);

    const handleGeo = trackGeo(new THREE.BoxGeometry(0.05, 0.05, 0.22));
    const handleY = mirrorY - 0.34;
    const handleL = new THREE.Mesh(handleGeo, steelMat);
    handleL.position.set(-bodyHalfW - 0.02, handleY, mirrorZ + 0.55);
    const handleR = new THREE.Mesh(handleGeo, steelMat);
    handleR.position.set(bodyHalfW + 0.02, handleY, mirrorZ + 0.55);

    exteriorDetailGroup.add(leftMirrorGrp, rightMirrorGrp, handleL, handleR);

    if (customization.decalStyle !== 'none') {
      decalAccentMat.color.setHex(
        customization.decalStyle === 'yemeni_stripe'
          ? 0xd4a253
          : customization.decalStyle === 'mountain_compass'
          ? 0xf59e0b
          : 0x38bdf8
      );
      const stripeGeo = trackGeo(new THREE.BoxGeometry(0.02, 0.14, 2.8));
      const stripeL = new THREE.Mesh(stripeGeo, decalAccentMat);
      stripeL.position.set(-bodyHalfW - 0.015, handleY - 0.08, 0);
      const stripeR = new THREE.Mesh(stripeGeo, decalAccentMat);
      stripeR.position.set(bodyHalfW + 0.015, handleY - 0.08, 0);
      exteriorDetailGroup.add(stripeL, stripeR);
    }

    const frontZ =
      vehicleId === 'jabal' ? -2.78 : vehicleId === 'hafilat' ? -2.58 : -2.22;
    const rearZ =
      vehicleId === 'jabal' ? 3.22 : vehicleId === 'hafilat' ? 2.58 : 2.22;
    const lightY =
      vehicleId === 'madina' || vehicleId === 'barq'
        ? 0.64
        : vehicleId === 'jabal'
        ? 1.15
        : 0.88;

    if (customization.bullbarStyle !== 'none') {
      const bbWidth = vehicleId === 'jabal' ? 2.22 : 1.94;
      const bbBar = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(bbWidth, 0.32, 0.22)),
        steelMat
      );
      bbBar.position.set(0, lightY - 0.2, frontZ - 0.08);
      frontBumperGroup.add(bbBar);

      if (customization.bullbarStyle === 'expedition_winch') {
        const winchDrum = new THREE.Mesh(
          trackGeo(new THREE.CylinderGeometry(0.11, 0.11, 0.46, 12)),
          caliperMat
        );
        winchDrum.rotation.z = Math.PI * 0.5;
        winchDrum.position.set(0, lightY - 0.16, frontZ - 0.18);
        frontBumperGroup.add(winchDrum);
      }
    }
    chassisGroup.add(frontBumperGroup);

    const plateGeo = trackGeo(new THREE.BoxGeometry(0.52, 0.14, 0.03));
    const frontPlate = new THREE.Mesh(plateGeo, licensePlateMat);
    frontPlate.position.set(0, lightY - 0.28, frontZ - 0.12);
    const rearPlate = new THREE.Mesh(plateGeo, licensePlateMat);
    rearPlate.position.set(0, lightY - 0.22, rearZ + 0.04);
    exteriorDetailGroup.add(frontPlate, rearPlate);

    const roofY =
      vehicleId === 'jabal'
        ? 2.62
        : vehicleId === 'hafilat'
        ? 2.2
        : vehicleId === 'madina' || vehicleId === 'barq'
        ? 1.36
        : 1.92;
    const roofZ = vehicleId === 'jabal' ? -1.9 : 0.35;
    if (customization.roofRackInstalled) {
      const rackFrame = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.52, 0.07, 1.85)),
        steelMat
      );
      rackFrame.position.set(0, roofY, roofZ);
      exteriorDetailGroup.add(rackFrame);

      if (customization.roofCargoBoxInstalled) {
        const cargoPod = new THREE.Mesh(
          trackGeo(new THREE.BoxGeometry(0.88, 0.28, 1.45)),
          darkTrimMat
        );
        cargoPod.position.set(0.24, roofY + 0.17, roofZ);
        exteriorDetailGroup.add(cargoPod);
      }
    }

    // Windshield Wipers
    const wiperZ =
      vehicleId === 'jabal' ? -2.72 : vehicleId === 'hafilat' ? -2.52 : -0.86;
    const wiperY =
      vehicleId === 'jabal'
        ? 1.75
        : vehicleId === 'hafilat'
        ? 1.52
        : vehicleId === 'madina' || vehicleId === 'barq'
        ? 0.92
        : 1.26;
    const bladeGeo = trackGeo(new THREE.BoxGeometry(0.46, 0.03, 0.03));
    bladeGeo.translate(0.23, 0, 0);

    const bladeL = new THREE.Mesh(bladeGeo, darkTrimMat);
    wiperPivotLeft.add(bladeL);
    wiperPivotLeft.position.set(-0.52, wiperY, wiperZ);

    const bladeR = new THREE.Mesh(bladeGeo, darkTrimMat);
    wiperPivotRight.add(bladeR);
    wiperPivotRight.position.set(0.08, wiperY, wiperZ);

    wipersGroup.add(wiperPivotLeft, wiperPivotRight);
    exteriorDetailGroup.add(wipersGroup);

    // Exterior Lights
    const hlGeo = trackGeo(new THREE.BoxGeometry(0.28, 0.18, 0.08));
    const hlL = new THREE.Mesh(hlGeo, headlightMat);
    hlL.position.set(-0.68, lightY, frontZ);
    const hlR = new THREE.Mesh(hlGeo, headlightMat);
    hlR.position.set(0.68, lightY, frontZ);

    const tlL = new THREE.Mesh(hlGeo, brakeLightMat);
    tlL.position.set(-0.72, lightY, rearZ);
    const tlR = new THREE.Mesh(hlGeo, brakeLightMat);
    tlR.position.set(0.72, lightY, rearZ);

    const revGeo = trackGeo(new THREE.BoxGeometry(0.16, 0.1, 0.09));
    const revL = new THREE.Mesh(revGeo, reverseLightMat);
    revL.position.set(-0.48, lightY, rearZ);
    const revR = new THREE.Mesh(revGeo, reverseLightMat);
    revR.position.set(0.48, lightY, rearZ);

    const indGeo = trackGeo(new THREE.BoxGeometry(0.14, 0.14, 0.09));
    const indFL = new THREE.Mesh(indGeo, indicatorLeftMat);
    indFL.position.set(-0.88, lightY, frontZ);
    const indFR = new THREE.Mesh(indGeo, indicatorRightMat);
    indFR.position.set(0.88, lightY, frontZ);
    const indRL = new THREE.Mesh(indGeo, indicatorLeftMat);
    indRL.position.set(-0.9, lightY, rearZ);
    const indRR = new THREE.Mesh(indGeo, indicatorRightMat);
    indRR.position.set(0.9, lightY, rearZ);

    chassisGroup.add(hlL, hlR, tlL, tlR, revL, revR, indFL, indFR, indRL, indRR);

    if (customization.auxLightsInstalled) {
      const barMesh = new THREE.Mesh(
        trackGeo(new THREE.BoxGeometry(1.28, 0.12, 0.14)),
        headlightMat
      );
      barMesh.position.set(
        0,
        roofY + 0.05,
        vehicleId === 'jabal' || vehicleId === 'hafilat' ? -2.45 : -0.45
      );
      exteriorDetailGroup.add(barMesh);
    }

    // 3D Interior Cockpit
    const cx = baseCockpitPos.x;
    const cy = baseCockpitPos.y;
    const cz = baseCockpitPos.z;

    const seatBackGeo = trackGeo(new THREE.BoxGeometry(0.48, 0.62, 0.12));
    const seatBaseGeo = trackGeo(new THREE.BoxGeometry(0.48, 0.12, 0.48));
    const driverSeatBack = new THREE.Mesh(seatBackGeo, interiorLeatherMat);
    driverSeatBack.position.set(cx, cy - 0.18, cz + 0.22);
    const driverSeatBase = new THREE.Mesh(seatBaseGeo, interiorLeatherMat);
    driverSeatBase.position.set(cx, cy - 0.46, cz + 0.02);

    const passSeatBack = new THREE.Mesh(seatBackGeo, interiorLeatherMat);
    passSeatBack.position.set(-cx, cy - 0.18, cz + 0.22);
    const passSeatBase = new THREE.Mesh(seatBaseGeo, interiorLeatherMat);
    passSeatBase.position.set(-cx, cy - 0.46, cz + 0.02);

    const dashBoard = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(1.58, 0.28, 0.42)),
      dashPlasticMat
    );
    dashBoard.position.set(0, cy - 0.28, cz - 0.52);

    const gaugePod = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.46, 0.18, 0.12)),
      gaugeFaceMat
    );
    gaugePod.position.set(cx, cy - 0.14, cz - 0.46);

    const needleGeo = trackGeo(new THREE.BoxGeometry(0.012, 0.065, 0.01));
    needleGeo.translate(0, 0.028, 0);

    const speedNeedle = new THREE.Mesh(needleGeo, gaugeNeedleMat);
    speedNeedlePivot.add(speedNeedle);
    speedNeedlePivot.position.set(cx + 0.1, cy - 0.15, cz - 0.39);

    const rpmNeedle = new THREE.Mesh(needleGeo, gaugeNeedleMat);
    rpmNeedlePivot.add(rpmNeedle);
    rpmNeedlePivot.position.set(cx - 0.1, cy - 0.15, cz - 0.39);

    const fuelNeedle = new THREE.Mesh(needleGeo, headlightMat);
    fuelNeedle.scale.set(0.8, 0.65, 1);
    fuelNeedlePivot.add(fuelNeedle);
    fuelNeedlePivot.position.set(cx, cy - 0.17, cz - 0.39);

    const rearViewMirror = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.28, 0.08, 0.04)),
      mirrorReflectMat
    );
    rearViewMirror.position.set(0, cy + 0.16, cz - 0.42);

    const swRing = new THREE.Mesh(
      trackGeo(new THREE.TorusGeometry(0.18, 0.026, 10, 24)),
      interiorLeatherMat
    );
    const swBar = new THREE.Mesh(
      trackGeo(new THREE.BoxGeometry(0.33, 0.032, 0.022)),
      rimMat
    );
    const swCenterHub = new THREE.Mesh(
      trackGeo(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 12)),
      darkTrimMat
    );
    swCenterHub.rotation.x = Math.PI * 0.5;
    steeringWheelGroup.add(swRing, swBar, swCenterHub);
    steeringWheelGroup.position.set(cx, cy - 0.24, cz - 0.32);
    steeringWheelGroup.rotation.x = -0.34;

    interiorGroup.add(
      driverSeatBack,
      driverSeatBase,
      passSeatBack,
      passSeatBase,
      dashBoard,
      gaugePod,
      speedNeedlePivot,
      rpmNeedlePivot,
      fuelNeedlePivot,
      rearViewMirror,
      steeringWheelGroup
    );

    const puffGeo = trackGeo(new THREE.DodecahedronGeometry(0.22, 0));
    for (let p = 0; p < 5; p++) {
      const puff = new THREE.Mesh(puffGeo, smokeMat);
      puff.position.set((p - 2) * 0.18, lightY + 0.35, frontZ + 0.35);
      smokePuffsGroup.add(puff);
    }

    chassisGroup.add(
      exteriorDetailGroup,
      interiorGroup,
      smokePuffsGroup,
      cockpitCameraAnchor,
      hoodCameraAnchor
    );

    const r = currentSpec.wheelRadiusM;
    const w =
      currentSpec.wheelWidthM *
      (customization.tireType === 'sand_dune' ? 1.22 : 1.0);
    const tireGeo = trackGeo(new THREE.CylinderGeometry(r, r, w, 24));
    tireGeo.rotateZ(Math.PI * 0.5);
    const wheelRimGeo = trackGeo(
      new THREE.CylinderGeometry(r * 0.6, r * 0.6, w + 0.02, 16)
    );
    wheelRimGeo.rotateZ(Math.PI * 0.5);
    const spokeGeo1 = trackGeo(new THREE.BoxGeometry(w + 0.04, 0.055, r * 1.1));
    const spokeGeo2 = trackGeo(new THREE.BoxGeometry(w + 0.04, r * 1.1, 0.055));
    const caliperGeo = trackGeo(new THREE.BoxGeometry(w * 0.55, r * 0.38, r * 0.28));

    const strutRodGeo = trackGeo(new THREE.CylinderGeometry(0.045, 0.045, 0.55, 8));
    const coilGeo = trackGeo(new THREE.CylinderGeometry(0.095, 0.095, 0.38, 10));

    for (let i = 0; i < 4; i++) {
      const tMesh = new THREE.Mesh(tireGeo, tireRubberMat);
      tMesh.castShadow = !isSoftwareGl;
      const rMesh = new THREE.Mesh(wheelRimGeo, rimMat);
      const sMesh1 = new THREE.Mesh(spokeGeo1, darkTrimMat);
      const sMesh2 = new THREE.Mesh(spokeGeo2, darkTrimMat);
      wheelSpinGroups[i].add(tMesh, rMesh, sMesh1, sMesh2);

      const calMesh = new THREE.Mesh(caliperGeo, caliperMat);
      calMesh.position.set(0, r * 0.25, -r * 0.25);
      wheelSteeringGroups[i].add(calMesh);

      const strutRod = new THREE.Mesh(strutRodGeo, steelMat);
      const coilMesh = new THREE.Mesh(coilGeo, coilSpringMat);
      suspensionStrutGroups[i].add(strutRod, coilMesh);
    }
  };

  rebuildForVehicle('shahiq', currentCustom);

  return {
    rootGroup,
    chassisGroup,
    steeringWheelGroup,
    cockpitCameraAnchor,
    hoodCameraAnchor,
    headlightSpotLeft,
    headlightSpotRight,
    rebuildForVehicle,
    updateVisuals: (
      position,
      quaternion,
      chassisPitchRad,
      chassisRollRad,
      steeringAngleRad,
      braking,
      reversing,
      headlightsOn,
      wipersOn,
      leftIndicatorOn,
      rightIndicatorOn,
      engineRunning,
      speedKmh,
      rpm,
      fuelLiters,
      damage,
      skyColorHex,
      cameraDistanceM,
      cockpitSeatOffsetY,
      elapsedSec,
      wheels
    ) => {
      rootGroup.position.copy(position);
      rootGroup.quaternion.copy(quaternion);

      interiorGroup.visible = cameraDistanceM < 38;
      exteriorDetailGroup.visible = cameraDistanceM < 95;
      for (let i = 0; i < 4; i++) {
        suspensionStrutGroups[i].visible = cameraDistanceM < 45;
      }

      const rideOffset = currentCustom.rideHeightOffsetM;
      chassisGroup.position.set(0, rideOffset, 0);
      chassisGroup.rotation.set(chassisPitchRad, 0, chassisRollRad);

      const engineVibY =
        engineRunning ? Math.sin(elapsedSec * 48) * 0.0018 : 0;
      cockpitCameraAnchor.position.set(
        baseCockpitPos.x,
        baseCockpitPos.y + cockpitSeatOffsetY + engineVibY,
        baseCockpitPos.z
      );

      // Link 3D cockpit steering wheel directly to the steering angle
      steeringWheelGroup.rotation.z =
        -steeringAngleRad * 6.5 + (engineRunning ? Math.sin(elapsedSec * 55) * 0.006 : 0);

      const speedRatio = THREE.MathUtils.clamp(speedKmh / 160, 0, 1);
      speedNeedlePivot.rotation.z = THREE.MathUtils.lerp(2.1, -2.1, speedRatio);

      const rpmRatio = THREE.MathUtils.clamp(
        rpm / Math.max(4000, currentSpec.redlineRpm),
        0,
        1
      );
      rpmNeedlePivot.rotation.z = THREE.MathUtils.lerp(2.1, -2.1, rpmRatio);

      const fuelRatio = THREE.MathUtils.clamp(
        fuelLiters / Math.max(10, currentSpec.fuelTankLiters),
        0,
        1
      );
      fuelNeedlePivot.rotation.z = THREE.MathUtils.lerp(1.4, -1.4, fuelRatio);

      mirrorReflectMat.color.setHex(skyColorHex);

      if (wipersOn) {
        const sweepAngle = (Math.sin(elapsedSec * 7.5) * 0.5 + 0.5) * 1.25;
        wiperPivotLeft.rotation.z = sweepAngle;
        wiperPivotRight.rotation.z = sweepAngle;
      } else {
        wiperPivotLeft.rotation.z = 0.08;
        wiperPivotRight.rotation.z = 0.08;
      }

      dirtOverlayMat.opacity = THREE.MathUtils.clamp(damage.dirtMudLevel * 0.85, 0, 0.85);
      bodyPaintMat.roughness =
        (currentCustom.paintFinish === 'matte' ? 0.62 : 0.22) +
        damage.dirtMudLevel * 0.35;

      const bodyDmgRatio = THREE.MathUtils.clamp(
        (100 - damage.bodyHealthPct) / 100,
        0,
        1
      );
      frontBumperGroup.rotation.z = bodyDmgRatio * 0.09;
      frontBumperGroup.rotation.x = bodyDmgRatio * 0.07;
      hoodPanelGroup.rotation.x = -bodyDmgRatio * 0.11;
      crackedWindshieldMat.opacity = damage.bodyHealthPct < 68 ? bodyDmgRatio * 0.65 : 0;

      if (damage.engineHealthPct < 68) {
        smokePuffsGroup.visible = true;
        const smokeSeverity = (68 - damage.engineHealthPct) / 68;
        smokeMat.opacity = THREE.MathUtils.clamp(smokeSeverity * 0.55, 0.1, 0.55);
        smokePuffsGroup.children.forEach((child, idx) => {
          const cycle = (elapsedSec * 1.8 + idx * 0.22) % 1;
          child.position.y = 1.05 + cycle * 1.35;
          const sc = 0.5 + cycle * 1.4;
          child.scale.set(sc, sc, sc);
        });
      } else {
        smokePuffsGroup.visible = false;
      }

      const damagedFlicker =
        damage.bodyHealthPct < 48 && Math.sin(elapsedSec * 29) > 0.3 ? 0.2 : 1.0;
      brakeLightMat.emissiveIntensity = braking ? 2.8 : headlightsOn ? 0.75 : 0.25;
      reverseLightMat.emissiveIntensity = reversing ? 2.4 : 0.0;
      headlightMat.emissiveIntensity = headlightsOn ? 2.5 * damagedFlicker : 0.35;

      const spotIntensity =
        headlightsOn && !isSoftwareGl
          ? (currentCustom.auxLightsInstalled ? 5.8 : 3.5) * damagedFlicker
          : 0;
      headlightSpotLeft.intensity = spotIntensity;
      headlightSpotRight.intensity = spotIntensity * (damage.bodyHealthPct < 42 ? 0.25 : 1);
      if (spotIntensity > 0) {
        headlightSpotLeft.position.set(-0.65, 1.1, -2.1);
        headlightSpotRight.position.set(0.65, 1.1, -2.1);
        headlightSpotLeft.target.position.set(-1.2, 0.2, -30);
        headlightSpotRight.target.position.set(1.2, 0.2, -30);
      }

      const blinkOn = Math.floor(elapsedSec * 3.2) % 2 === 0;
      indicatorLeftMat.emissiveIntensity = leftIndicatorOn && blinkOn ? 2.6 : 0.1;
      indicatorRightMat.emissiveIntensity = rightIndicatorOn && blinkOn ? 2.6 : 0.1;

      const halfTrack = currentSpec.trackWidthM * 0.5;
      const halfBase = currentSpec.wheelbaseM * 0.5;
      const wheelBasePositions: [number, number, number][] = [
        [-halfTrack, currentSpec.wheelRadiusM, -halfBase],
        [halfTrack, currentSpec.wheelRadiusM, -halfBase],
        [-halfTrack, currentSpec.wheelRadiusM, halfBase],
        [halfTrack, currentSpec.wheelRadiusM, halfBase],
      ];

      for (let i = 0; i < 4; i++) {
        const w = wheels[i];
        const [bx, by, bz] = wheelBasePositions[i];
        const travelY = (w.compressionRatio - 0.38) * 0.26;
        wheelSteeringGroups[i].position.set(bx, by + travelY, bz);
        wheelSteeringGroups[i].rotation.y = w.steerAngleRad;
        wheelSpinGroups[i].rotation.x = w.rotationRad;

        suspensionStrutGroups[i].position.set(
          bx * 0.86,
          by + 0.28 + travelY * 0.5,
          bz
        );
        const springScaleY = THREE.MathUtils.clamp(1.15 - w.compressionRatio * 0.45, 0.6, 1.3);
        suspensionStrutGroups[i].scale.set(1, springScaleY, 1);
      }
    },
    dispose: () => {
      clearActiveGeometries();
      if (currentPlateTex) currentPlateTex.dispose();
      bodyPaintMat.dispose();
      dirtOverlayMat.dispose();
      secondaryBodyMat.dispose();
      decalAccentMat.dispose();
      darkTrimMat.dispose();
      interiorLeatherMat.dispose();
      dashPlasticMat.dispose();
      mirrorReflectMat.dispose();
      steelMat.dispose();
      coilSpringMat.dispose();
      glassMat.dispose();
      crackedWindshieldMat.dispose();
      tireRubberMat.dispose();
      rimMat.dispose();
      caliperMat.dispose();
      woodCargoMat.dispose();
      headlightMat.dispose();
      brakeLightMat.dispose();
      reverseLightMat.dispose();
      indicatorLeftMat.dispose();
      indicatorRightMat.dispose();
      gaugeNeedleMat.dispose();
      gaugeFaceMat.dispose();
      smokeMat.dispose();
      licensePlateMat.dispose();
    },
  };
}
