export type GraphicsQuality = 'auto' | 'low' | 'medium' | 'high' | 'ultra';

export type EffectiveGraphicsQuality = 'low' | 'medium' | 'high' | 'ultra';

export type CameraMode =
  | 'chase_near'
  | 'chase_far'
  | 'cockpit'
  | 'hood'
  | 'cinematic_front'
  | 'free_photo';

export type CinematicSequenceType =
  | 'none'
  | 'intro_flyover'
  | 'vehicle_showcase'
  | 'mission_start'
  | 'viewpoint_arrival'
  | 'cargo_delivery'
  | 'victory_finish';

export type PhotoColorFilter =
  | 'natural'
  | 'golden_hour'
  | 'warm_copper'
  | 'highland_mist'
  | 'monochrome';

export type GameScreenState =
  | 'splash'
  | 'menu'
  | 'garage'
  | 'world_map'
  | 'control_studio'
  | 'playing'
  | 'paused'
  | 'photo_mode'
  | 'completed';

export type SurfaceType =
  | 'asphalt'
  | 'dirt'
  | 'gravel'
  | 'sand'
  | 'mud'
  | 'rock';

export type VehicleId =
  | 'shahiq'
  | 'saqr'
  | 'rahhal'
  | 'madina'
  | 'jabal'
  | 'barq'
  | 'hafilat'
  | 'munqidh'
  | 'badiya'
  | 'aseel';

export type DrivetrainMode = 'FWD' | 'RWD' | 'AWD' | '2H' | '4H' | '4L';

export type AutomaticShifterState = 'P' | 'R' | 'N' | 'D';

export type DrivingRealismMode = 'arcade' | 'sport' | 'simulation';

export type TireCompoundType =
  | 'all_terrain'
  | 'mud_rock'
  | 'sand_dune'
  | 'highway_sport';

export type GearRatioPreset = 'balanced' | 'crawler' | 'highway';

export type PaintFinishType = 'metallic' | 'matte' | 'pearl';

export type BullbarStyle = 'none' | 'steel_guard' | 'expedition_winch';

export type PickupAccessoryType = 'none' | 'roll_bar' | 'canopy_tent';

export type DecalStyleType =
  | 'none'
  | 'yemeni_stripe'
  | 'mountain_compass'
  | 'desert_falcon';

export type RegionId =
  | 'taiz_highlands'
  | 'naqil_sahab'
  | 'wadi_rayhan'
  | 'tihama_plains'
  | 'coastal_road'
  | 'masalik_desert';

export type TimeOfDayPreset =
  | 'dawn'
  | 'sunrise'
  | 'morning'
  | 'noon'
  | 'afternoon'
  | 'sunset'
  | 'night';

export type WeatherPreset =
  | 'clear'
  | 'cloudy'
  | 'light_rain'
  | 'heavy_rain'
  | 'mountain_fog'
  | 'sandstorm';

export type GameModeCategory =
  | 'free_roam'
  | 'story'
  | 'race'
  | 'passenger'
  | 'cargo'
  | 'rescue'
  | 'challenge'
  | 'daily';

export type MissionId = string;

export type TouchControlMode =
  | 'wheel'
  | 'buttons'
  | 'tilt'
  | 'joystick'
  | 'gamepad';

export type SteeringRotationRangeDeg = 180 | 270 | 360 | 540 | 900;

export interface SmartWheelSettings {
  rotationRangeDeg: SteeringRotationRangeDeg; // Total lock-to-lock degrees (default 270)
  sensitivity: number; // 0.5 to 2.0
  smoothing: number; // 0.1 to 1.0
  autoCenterEnabled: boolean;
  autoCenterSpeed: number; // 1.0 to 10.0
  deadZoneDeg: number; // 0 to 12 degrees
  steeringAssist: boolean;
}

export type HudWidgetId =
  | 'steering'
  | 'pedals'
  | 'shifter_handbrake'
  | 'speedometer'
  | 'minimap'
  | 'mission_card'
  | 'top_nav'
  | 'secondary_tools';

export interface HudWidgetTransform {
  id: HudWidgetId;
  labelAr: string;
  xPct: number; // 0 to 100 (% of viewport width)
  yPct: number; // 0 to 100 (% of viewport height)
  scale: number; // 0.6 to 1.6
  opacity: number; // 0.15 to 1.0
  visible: boolean;
}

export type ControlLayoutPresetId =
  | 'classic_wheel'
  | 'pro_compact'
  | 'cockpit_sim'
  | 'left_handed'
  | 'directional_buttons'
  | 'tilt_gyro';

export interface HudCustomizationSettings {
  controlMode: TouchControlMode;
  activePresetId: ControlLayoutPresetId;
  buttonScale: number; // 0.6 to 1.6
  hudOpacity: number; // 0.15 to 1.0
  pedalSpacingPx: number; // 8 to 36
  mirrorControlsHorizontally: boolean;
  showSecondaryDrawer: boolean;
  showMinimap: boolean;
  showDeveloperDiagnostics: boolean;
  cockpitSeatOffsetY: number; // -0.08 to +0.08
  cockpitFovDeg: number; // 55 to 78
  smartWheel: SmartWheelSettings;
  widgets: Record<HudWidgetId, HudWidgetTransform>;
}

export interface AudioMixerSettings {
  masterVolume: number; // 0..1
  engineVolume: number; // 0..1
  musicVolume: number; // 0..1
  environmentVolume: number; // 0..1
  sfxVolume: number; // 0..1
  uiVolume: number; // 0..1
  muted: boolean;
  musicEnabled: boolean;
}

export interface VehicleCustomization {
  // Cosmetic customizations (strictly visual — do not alter vehicle speed/physics)
  paintColorHex: string;
  paintFinish: PaintFinishType;
  rimColorHex: string;
  interiorColorHex: string;
  bullbarStyle: BullbarStyle;
  roofRackInstalled: boolean;
  roofCargoBoxInstalled: boolean;
  pickupAccessory: PickupAccessoryType;
  decalStyle: DecalStyleType;
  plateTextAr: string;
  auxLightsInstalled: boolean;

  // Mechanical customizations & upgrades (affect physics, torque, suspension & braking)
  tireType: TireCompoundType;
  rideHeightOffsetM: number; // -0.06 to +0.14
  gearPreset: GearRatioPreset;
  cargoLoadPct: number; // 0, 50, 100
  engineUpgradeLevel: number; // 1 to 5
  transmissionUpgradeLevel: number; // 1 to 5
  suspensionUpgradeLevel: number; // 1 to 5
  brakeUpgradeLevel: number; // 1 to 5
}

export interface VehicleSpec {
  id: VehicleId;
  nameAr: string;
  titleAr: string;
  categoryAr: string;
  descriptionAr: string;
  unlockPriceCoins: number;
  baseMassKg: number;
  maxCargoKg: number;
  passengerCapacity: number;
  centerOfMassOffsetY: number;
  wheelbaseM: number;
  trackWidthM: number;
  wheelRadiusM: number;
  wheelWidthM: number;
  suspensionRestLengthM: number;
  suspensionMaxTravelM: number;
  suspensionStiffness: number;
  suspensionDamping: number;
  antiRollStiffness: number;
  maxEngineTorqueNm: number;
  maxPowerHp: number;
  idleRpm: number;
  redlineRpm: number;
  maxBrakeForceN: number;
  maxReverseForceN: number;
  handbrakeForceN: number;
  maxSteerAngleRad: number;
  steerSpeedRadPerSec: number;
  defaultDrivetrain: DrivetrainMode;
  supportedDrivetrains: DrivetrainMode[];
  forwardGearsCount: number;
  fuelTankLiters: number;
  baseFuelBurnLPerMin: number;
  dragCoefficient: number;
  rollingResistance: number;
  engineBaseFreqHz: number;
  defaultPaintHex: string;
  defaultTireType: TireCompoundType;
}

export interface WheelTelemetry {
  id: 'FL' | 'FR' | 'RL' | 'RR';
  labelAr: string;
  grounded: boolean;
  compressionRatio: number;
  springForceN: number;
  surface: SurfaceType;
  slipRatio: number;
  worldX: number;
  worldY: number;
  worldZ: number;
  steerAngleRad: number;
  rotationRad: number;
}

export interface DamageState {
  engineHealthPct: number;
  tiresHealthPct: number;
  suspensionHealthPct: number;
  bodyHealthPct: number;
  cargoIntegrityPct: number;
  steeringPullBias: number;
  dirtMudLevel: number; // 0.0 (clean) to 1.0 (heavily muddied/dusty)
}

export interface ElectronicAssistsState {
  absEnabled: boolean;
  tcsEnabled: boolean;
  escEnabled: boolean;
  hdcEnabled: boolean;
}

export interface VehicleTelemetry {
  vehicleId: VehicleId;
  speedKmh: number;
  forwardSpeedMs: number;
  rpm: number;
  gear: string; // 'P', 'R', 'N', 'D1'..'D8', '1'..'8', 'L1'..'L4'
  autoShifter: AutomaticShifterState;
  transmissionMode: 'auto' | 'manual';
  drivetrainMode: DrivetrainMode;
  diffLockActive: boolean;
  engineRunning: boolean;
  headlightsOn: boolean;
  wipersOn: boolean;
  leftIndicatorOn: boolean;
  rightIndicatorOn: boolean;
  throttle: number;
  brake: number;
  clutch: number;
  handbrake: boolean;
  steeringInputNorm: number; // -1 to +1
  steeringWheelAngleDeg: number; // e.g., -135 to +135
  steeringAngleDeg: number; // front wheel angle in degrees
  altitudeM: number;
  pitchDeg: number;
  rollDeg: number;
  headingDeg: number;
  surface: SurfaceType;
  regionId: RegionId;
  regionNameAr: string;
  activeChunkId: number;
  loadedChunksCount: number;
  distanceAlongRoadM: number;
  totalDistanceDrivenM: number;
  lateralOffsetM: number;
  slopeGradePct: number;
  inTunnel: boolean;
  onBridge: boolean;
  fuelLiters: number;
  fuelTankCapacityL: number;
  lowFuelWarning: boolean;
  effectiveMassKg: number;
  cargoMassKg: number;
  damage: DamageState;
  assists: ElectronicAssistsState;
  stabilityWarning: boolean;
  nearServiceStation: 'fuel' | 'workshop' | 'car_wash' | 'rest_area' | null;
  discoveredPoiId: string | null;
  aiRivalDistanceM: number | null;
  playerRaceRank: 1 | 2;
  wheels: [WheelTelemetry, WheelTelemetry, WheelTelemetry, WheelTelemetry];
  position: { x: number; y: number; z: number };
}

export interface ControlsInput {
  throttle: number;
  brake: number;
  steer: number;
  handbrake: boolean;
  clutch?: number;
}

export interface PerformanceMetrics {
  fps: number;
  frameTimeMs: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  memoryEstimateMb: number;
  isSoftwareGl: boolean;
  gpuRenderer: string;
  activeChunks: number;
  activeTrafficCount: number;
  effectiveQuality: EffectiveGraphicsQuality;
}

export interface StoryChapterDefinition {
  chapterNumber: 1 | 2 | 3 | 4 | 5;
  id: string;
  titleAr: string;
  subtitleAr: string;
  narratorNameAr: string;
  introDialogueAr: string;
  regionId: RegionId;
  unlockRequirementCompletedMissions: number;
}

export interface MissionDefinition {
  id: MissionId;
  category: GameModeCategory;
  chapterNumber?: 1 | 2 | 3 | 4 | 5;
  titleAr: string;
  subtitleAr: string;
  descriptionAr: string;
  dialogueBriefAr?: string;
  recommendedVehicleId: VehicleId;
  startDistanceM: number;
  finishDistanceM: number;
  weatherPreset: WeatherPreset;
  timeOfDayPreset: TimeOfDayPreset;
  cargoRequiredPct: number;
  minCargoIntegrityPct: number;
  passengersCount?: number;
  hasAiRival?: boolean;
  aiRivalSpeedMs?: number;
  maxAllowedSpeedKmh?: number;
  maxFuelAllowedLiters?: number;
  zeroCollisionRequired?: boolean;
  requireParkingStopAtEnd?: boolean;
  targetTimeSec: number;
  rewardCoins: number;
  rewardXp: number;
}

export interface WorldPOI {
  id: string;
  nameAr: string;
  type: 'fuel' | 'workshop' | 'car_wash' | 'rest_area' | 'viewpoint' | 'landmark' | 'village';
  regionId: RegionId;
  distanceM: number;
  lateralOffsetM: number;
  descriptionAr: string;
}

export interface SaveGameSchemaV2 {
  schemaVersion: 2;
  timestampIso: string;
  playerNameAr: string;
  selectedVehicleId: VehicleId;
  unlockedVehicles: VehicleId[];
  masalikCoins: number;
  driverXp: number;
  drivingRealism: DrivingRealismMode;
  graphicsQuality: GraphicsQuality;
  hudSettings: HudCustomizationSettings;
  audioMixer: AudioMixerSettings;
  musicEnabled: boolean;
  musicVolume: number;
  timeOfDay: TimeOfDayPreset;
  weather: WeatherPreset;
  playerDistanceM: number;
  lastRegionId: RegionId;
  fuelByVehicle: Record<VehicleId, number>;
  damageByVehicle: Record<VehicleId, DamageState>;
  customizations: Record<VehicleId, VehicleCustomization>;
  discoveredPois: string[];
  missionBestTimesSec: Record<string, number>;
  missionCompletions: Record<string, number>;
  unlockedAchievements: string[];
  totalCareerDistanceM: number;
  legacyPhase1BestTimeSec: number | null;
}

export interface VehicleBenchmarkResult {
  vehicleId: VehicleId;
  nameAr: string;
  accel0to80Sec: number;
  topSpeedKmh: number;
  braking80to0M: number;
  maxClimbDeg: number;
  courseTimeSec: number;
  suspensionStabilityPct: number;
  rolloverOccurred: boolean;
}

export interface EngineeringTestResult {
  id: string;
  category: 'engineering' | 'physics' | 'world' | 'systems' | 'android';
  titleAr: string;
  passed: boolean;
  measuredValue: string;
  detailsAr: string;
}
