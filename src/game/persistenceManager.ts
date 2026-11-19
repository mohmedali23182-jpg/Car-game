import {
  SaveGameSchemaV2,
  VehicleId,
  HudCustomizationSettings,
  HudWidgetTransform,
  HudWidgetId,
  ControlLayoutPresetId,
  SmartWheelSettings,
  DamageState,
  RadioPlayerSettings,
  DrivingTripLogEntry,
  PhoneDatabaseStats,
} from './types';
import {
  VEHICLE_SPECS,
  ALL_VEHICLE_IDS,
  getDefaultCustomizations,
} from './vehicleFleet';
import { DEFAULT_AUDIO_MIXER } from './audioEngine';

/**
 * MASALIK — On-Device Phone-First Local Database (v2.0 — 100% OFFLINE)
 * Stores all game data locally on the user's phone/device using:
 * 1) Multi-Store IndexedDB ('masalik_phone_db' v2) with 6 normalized tables:
 *    - player_profile
 *    - garage_fleet
 *    - mission_records
 *    - settings_hud
 *    - radio_preferences
 *    - driving_logs
 * 2) Atomic Primary + Backup localStorage mirror for zero-latency boot
 * 3) Persistent Storage Lock (navigator.storage.persist) & Real Quota Telemetry
 */

const SAVE_KEY_PRIMARY = 'masalik_save_v2_primary';
const SAVE_KEY_BACKUP = 'masalik_save_v2_backup';
const TRIP_LOGS_CACHE_KEY = 'masalik_phone_trip_logs_v1';

const PHONE_DB_NAME = 'masalik_phone_db';
const PHONE_DB_VERSION = 2;

const STORE_NAMES = [
  'player_profile',
  'garage_fleet',
  'mission_records',
  'settings_hud',
  'radio_preferences',
  'driving_logs',
] as const;

export const DEFAULT_RADIO_SETTINGS: RadioPlayerSettings = {
  isOpen: false,
  isPlaying: false,
  stationId: 'taiz_oud_lofi',
  volume: 0.65,
  lofiVinylEnabled: true,
};

export const DEFAULT_SMART_WHEEL_SETTINGS: SmartWheelSettings = {
  rotationRangeDeg: 270,
  sensitivity: 1.0,
  smoothing: 0.78,
  autoCenterEnabled: true,
  autoCenterSpeed: 4.5,
  deadZoneDeg: 1.5,
  steeringAssist: true,
};

export function getControlLayoutPreset(
  presetId: ControlLayoutPresetId
): Record<HudWidgetId, HudWidgetTransform> {
  const base: Record<HudWidgetId, HudWidgetTransform> = {
    steering: {
      id: 'steering',
      labelAr: 'المقود الذكي / التوجيه',
      xPct: 14,
      yPct: 73,
      scale: 1.05,
      opacity: 0.94,
      visible: true,
    },
    pedals: {
      id: 'pedals',
      labelAr: 'دواسة الوقود والفرامل',
      xPct: 88,
      yPct: 74,
      scale: 1.05,
      opacity: 0.94,
      visible: true,
    },
    shifter_handbrake: {
      id: 'shifter_handbrake',
      labelAr: 'القير وجلنط اليد (P/R/N/D)',
      xPct: 75,
      yPct: 74,
      scale: 0.98,
      opacity: 0.92,
      visible: true,
    },
    speedometer: {
      id: 'speedometer',
      labelAr: 'عداد السرعة والوقود',
      xPct: 50,
      yPct: 89,
      scale: 0.96,
      opacity: 0.92,
      visible: true,
    },
    minimap: {
      id: 'minimap',
      labelAr: 'الخريطة المصغرة (GPS)',
      xPct: 90,
      yPct: 16,
      scale: 0.95,
      opacity: 0.92,
      visible: true,
    },
    mission_card: {
      id: 'mission_card',
      labelAr: 'بطاقة المهمة والوقت',
      xPct: 16,
      yPct: 10,
      scale: 0.94,
      opacity: 0.9,
      visible: true,
    },
    top_nav: {
      id: 'top_nav',
      labelAr: 'مؤشر المنعطف القادم والأدوات',
      xPct: 50,
      yPct: 8,
      scale: 0.94,
      opacity: 0.9,
      visible: true,
    },
    secondary_tools: {
      id: 'secondary_tools',
      labelAr: 'البوق (الهرن) والأدوات المساعدة',
      xPct: 26,
      yPct: 84,
      scale: 0.95,
      opacity: 0.9,
      visible: true,
    },
  };

  switch (presetId) {
    case 'classic_wheel':
      return base;
    case 'pro_compact':
      return {
        ...base,
        steering: { ...base.steering, scale: 1.15, xPct: 15, yPct: 73 },
        pedals: { ...base.pedals, scale: 1.12, xPct: 87, yPct: 73 },
        speedometer: { ...base.speedometer, scale: 0.9, yPct: 90 },
      };
    case 'cockpit_sim':
      return {
        ...base,
        steering: { ...base.steering, scale: 0.85, opacity: 0.55, yPct: 78 },
        pedals: { ...base.pedals, scale: 0.88, opacity: 0.55, yPct: 78 },
        speedometer: { ...base.speedometer, visible: false },
        minimap: { ...base.minimap, scale: 0.82, opacity: 0.65 },
      };
    case 'left_handed': {
      const mirrored = {} as Record<HudWidgetId, HudWidgetTransform>;
      (Object.keys(base) as HudWidgetId[]).forEach((k) => {
        mirrored[k] = {
          ...base[k],
          xPct: 100 - base[k].xPct,
        };
      });
      return mirrored;
    }
    case 'directional_buttons':
      return {
        ...base,
        steering: { ...base.steering, xPct: 15, yPct: 78, scale: 1.02 },
      };
    case 'tilt_gyro':
      return {
        ...base,
        steering: { ...base.steering, xPct: 12, yPct: 82, scale: 0.8, opacity: 0.6 },
      };
  }
}

export const CONTROL_LAYOUT_PRESET_LABELS: Record<
  ControlLayoutPresetId,
  { nameAr: string; descAr: string }
> = {
  classic_wheel: {
    nameAr: 'قيادة المقود الذكي المتوازن',
    descAr: 'دركسون تفاعلي على اليسار ودواسات متناسبة على اليمين مع رؤية بانورامية للطريق.',
  },
  pro_compact: {
    nameAr: 'وضع الشاشات المدمجة (مكبر)',
    descAr: 'تكبير المقود والدواسات بنسبة 115% لسهولة التحكم باللمس على الهواتف.',
  },
  cockpit_sim: {
    nameAr: 'محاكاة المقصورة السينمائية',
    descAr: 'شفافية عالية وإخفاء عداد الشاشة للاعتماد على عدادات المقصورة ثلاثية الأبعاد.',
  },
  left_handed: {
    nameAr: 'وضع اليد اليسرى (معكوس)',
    descAr: 'نقل المقود لليمين والدواسات لليسار لراحة مستخدمي اليد اليسرى.',
  },
  directional_buttons: {
    nameAr: 'قيادة الأزرار الكلاسيكية',
    descAr: 'توزيع مريح لأزرار الانعطاف اليمنى واليسرى مع استجابة سريعة.',
  },
  tilt_gyro: {
    nameAr: 'قيادة الإمالة الحرة (الجيروسكوب)',
    descAr: 'واجهة صافية تعتمد على إمالة الهاتف للتوجيه.',
  },
};

export function createDefaultHudSettings(): HudCustomizationSettings {
  return {
    controlMode: 'wheel',
    activePresetId: 'classic_wheel',
    buttonScale: 1.0,
    hudOpacity: 0.92,
    pedalSpacingPx: 14,
    mirrorControlsHorizontally: false,
    showSecondaryDrawer: false,
    showMinimap: true,
    showDeveloperDiagnostics: false,
    cockpitSeatOffsetY: 0,
    cockpitFovDeg: 62,
    smartWheel: { ...DEFAULT_SMART_WHEEL_SETTINGS },
    widgets: getControlLayoutPreset('classic_wheel'),
  };
}

export function createDefaultSaveStateV2(): SaveGameSchemaV2 {
  const fuelByVehicle = {} as Record<VehicleId, number>;
  const damageByVehicle = {} as Record<VehicleId, DamageState>;

  for (const id of ALL_VEHICLE_IDS) {
    fuelByVehicle[id] = VEHICLE_SPECS[id].fuelTankLiters;
    damageByVehicle[id] = {
      engineHealthPct: 100,
      tiresHealthPct: 100,
      suspensionHealthPct: 100,
      bodyHealthPct: 100,
      cargoIntegrityPct: 100,
      steeringPullBias: 0,
      dirtMudLevel: 0.05,
    };
  }

  return {
    schemaVersion: 2,
    timestampIso: new Date().toISOString(),
    playerNameAr: 'سائق المسالك',
    selectedVehicleId: 'shahiq',
    unlockedVehicles: ['shahiq', 'saqr', 'madina', 'rahhal', 'aseel'],
    masalikCoins: 28500,
    driverXp: 550,
    drivingRealism: 'sport',
    graphicsQuality: 'high',
    hudSettings: createDefaultHudSettings(),
    audioMixer: { ...DEFAULT_AUDIO_MIXER },
    radioSettings: { ...DEFAULT_RADIO_SETTINGS },
    musicEnabled: true,
    musicVolume: 0.45,
    timeOfDay: 'morning',
    autoTimeCycleEnabled: true,
    worldTimeHours: 8.75,
    weather: 'clear',
    playerDistanceM: 40,
    lastRegionId: 'taiz_highlands',
    visitedCities: ['city_taiz_sabir'],
    fuelByVehicle,
    damageByVehicle,
    customizations: getDefaultCustomizations(),
    discoveredPois: ['poi_taiz_start_fuel'],
    missionBestTimesSec: {},
    missionCompletions: { story_c1_m1: 1 },
    unlockedAchievements: ['first_climb'],
    totalCareerDistanceM: 4500,
    legacyPhase1BestTimeSec: null,
  };
}

function openPhoneDatabase(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') {
        resolve(null);
        return;
      }
      const req = indexedDB.open(PHONE_DB_NAME, PHONE_DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        for (const storeName of STORE_NAMES) {
          if (!db.objectStoreNames.contains(storeName)) {
            if (storeName === 'driving_logs') {
              db.createObjectStore(storeName, {
                keyPath: 'id',
                autoIncrement: true,
              });
            } else {
              db.createObjectStore(storeName);
            }
          }
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function syncNormalizedPhoneDatabase(save: SaveGameSchemaV2): void {
  openPhoneDatabase()
    .then((db) => {
      if (!db) return;
      try {
        const tx = db.transaction(
          [
            'player_profile',
            'garage_fleet',
            'mission_records',
            'settings_hud',
            'radio_preferences',
          ],
          'readwrite'
        );

        tx.objectStore('player_profile').put(
          {
            playerNameAr: save.playerNameAr,
            masalikCoins: save.masalikCoins,
            driverXp: save.driverXp,
            selectedVehicleId: save.selectedVehicleId,
            unlockedVehicles: save.unlockedVehicles,
            totalCareerDistanceM: save.totalCareerDistanceM,
            playerDistanceM: save.playerDistanceM,
            lastRegionId: save.lastRegionId,
            visitedCities: save.visitedCities,
            timestampIso: save.timestampIso,
          },
          'primary'
        );

        const garageStore = tx.objectStore('garage_fleet');
        for (const vid of ALL_VEHICLE_IDS) {
          garageStore.put(
            {
              vehicleId: vid,
              unlocked: save.unlockedVehicles.includes(vid),
              fuelLiters: save.fuelByVehicle[vid],
              damage: save.damageByVehicle[vid],
              customization: save.customizations[vid],
            },
            vid
          );
        }

        tx.objectStore('mission_records').put(
          {
            missionCompletions: save.missionCompletions,
            missionBestTimesSec: save.missionBestTimesSec,
            unlockedAchievements: save.unlockedAchievements,
            discoveredPois: save.discoveredPois,
          },
          'career'
        );

        tx.objectStore('settings_hud').put(
          {
            drivingRealism: save.drivingRealism,
            graphicsQuality: save.graphicsQuality,
            hudSettings: save.hudSettings,
            audioMixer: save.audioMixer,
            timeOfDay: save.timeOfDay,
            autoTimeCycleEnabled: save.autoTimeCycleEnabled,
            worldTimeHours: save.worldTimeHours,
            weather: save.weather,
          },
          'preferences'
        );

        tx.objectStore('radio_preferences').put(
          save.radioSettings || DEFAULT_RADIO_SETTINGS,
          'lofi_radio'
        );
      } catch {
        // LocalStorage fallback already committed
      }
    })
    .catch(() => {});
}

export function recordDrivingTripToPhoneDb(entry: DrivingTripLogEntry): void {
  // 1) Mirror last 15 trips to localStorage for instant access
  try {
    const raw = localStorage.getItem(TRIP_LOGS_CACHE_KEY);
    const list: DrivingTripLogEntry[] = raw ? JSON.parse(raw) : [];
    list.unshift(entry);
    localStorage.setItem(TRIP_LOGS_CACHE_KEY, JSON.stringify(list.slice(0, 15)));
  } catch {
    // Ignore
  }

  // 2) Persist in IndexedDB driving_logs store
  openPhoneDatabase()
    .then((db) => {
      if (!db) return;
      try {
        const tx = db.transaction('driving_logs', 'readwrite');
        tx.objectStore('driving_logs').add(entry);
      } catch {
        // Ignore
      }
    })
    .catch(() => {});
}

export async function requestPhonePersistentStorage(): Promise<boolean> {
  try {
    if (navigator.storage && typeof navigator.storage.persist === 'function') {
      return await navigator.storage.persist();
    }
  } catch {
    // Ignore
  }
  return false;
}

export async function getPhoneDatabaseStats(): Promise<PhoneDatabaseStats> {
  const storeRecordCounts: Record<string, number> = {
    player_profile: 1,
    garage_fleet: ALL_VEHICLE_IDS.length,
    mission_records: 1,
    settings_hud: 1,
    radio_preferences: 1,
    driving_logs: 0,
  };
  let recentTrips: DrivingTripLogEntry[] = [];
  let persisted = false;
  let storageUsedKb = 24;
  let storageQuotaMb = 512;

  try {
    const cachedTripsRaw = localStorage.getItem(TRIP_LOGS_CACHE_KEY);
    if (cachedTripsRaw) {
      recentTrips = JSON.parse(cachedTripsRaw);
      storeRecordCounts.driving_logs = recentTrips.length;
    }
  } catch {
    // Ignore
  }

  try {
    if (navigator.storage?.persisted) {
      persisted = await navigator.storage.persisted();
    }
    if (navigator.storage?.estimate) {
      const est = await navigator.storage.estimate();
      if (est.usage !== undefined) {
        storageUsedKb = Math.max(12, Math.round(est.usage / 1024));
      }
      if (est.quota !== undefined) {
        storageQuotaMb = Math.max(64, Math.round(est.quota / (1024 * 1024)));
      }
    }
  } catch {
    // Ignore
  }

  const db = await openPhoneDatabase();
  if (db) {
    try {
      await Promise.all(
        STORE_NAMES.map(
          (storeName) =>
            new Promise<void>((resolve) => {
              const tx = db.transaction(storeName, 'readonly');
              const req = tx.objectStore(storeName).count();
              req.onsuccess = () => {
                storeRecordCounts[storeName] = req.result;
                resolve();
              };
              req.onerror = () => resolve();
            })
        )
      );
    } catch {
      // Ignore
    }
  }

  const primaryRaw = localStorage.getItem(SAVE_KEY_PRIMARY);
  let lastSavedIso = new Date().toISOString();
  if (primaryRaw) {
    try {
      const p = JSON.parse(primaryRaw);
      if (p?.timestampIso) lastSavedIso = p.timestampIso;
    } catch {
      // Ignore
    }
  }

  return {
    dbName: PHONE_DB_NAME,
    schemaVersion: PHONE_DB_VERSION,
    engineLabelAr: 'IndexedDB Phone DB (6 جداول محلية) + LocalStorage Atomic',
    indexedDbSupported: typeof indexedDB !== 'undefined',
    persisted,
    storageUsedKb,
    storageQuotaMb,
    storeRecordCounts,
    recentTrips: recentTrips.slice(0, 8),
    lastSavedIso,
  };
}

export function saveStateAtomicV2(state: SaveGameSchemaV2): boolean {
  try {
    state.timestampIso = new Date().toISOString();
    const serialized = JSON.stringify(state);
    const prevPrimary = localStorage.getItem(SAVE_KEY_PRIMARY);
    if (prevPrimary) {
      localStorage.setItem(SAVE_KEY_BACKUP, prevPrimary);
    }
    localStorage.setItem(SAVE_KEY_PRIMARY, serialized);
    syncNormalizedPhoneDatabase(state);
    return true;
  } catch {
    return false;
  }
}

export function loadSaveStateV2(): SaveGameSchemaV2 {
  const defaults = createDefaultSaveStateV2();
  try {
    const raw = localStorage.getItem(SAVE_KEY_PRIMARY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.schemaVersion === 2) {
        const merged = mergeWithDefaults(parsed, defaults);
        syncNormalizedPhoneDatabase(merged);
        return merged;
      }
    }
  } catch {
    // Try backup
  }

  try {
    const rawBackup = localStorage.getItem(SAVE_KEY_BACKUP);
    if (rawBackup) {
      const parsed = JSON.parse(rawBackup);
      if (parsed && parsed.schemaVersion === 2) {
        localStorage.setItem(SAVE_KEY_PRIMARY, rawBackup);
        const merged = mergeWithDefaults(parsed, defaults);
        syncNormalizedPhoneDatabase(merged);
        return merged;
      }
    }
  } catch {
    // Return defaults
  }

  saveStateAtomicV2(defaults);
  return defaults;
}

function mergeWithDefaults(
  loaded: Partial<SaveGameSchemaV2>,
  defaults: SaveGameSchemaV2
): SaveGameSchemaV2 {
  const mergedCustom = { ...defaults.customizations };
  if (loaded.customizations) {
    for (const id of ALL_VEHICLE_IDS) {
      if (loaded.customizations[id]) {
        mergedCustom[id] = {
          ...defaults.customizations[id],
          ...loaded.customizations[id],
        };
      }
    }
  }

  return {
    ...defaults,
    ...loaded,
    visitedCities: Array.isArray(loaded.visitedCities)
      ? loaded.visitedCities
      : defaults.visitedCities,
    fuelByVehicle: { ...defaults.fuelByVehicle, ...(loaded.fuelByVehicle || {}) },
    damageByVehicle: {
      ...defaults.damageByVehicle,
      ...(loaded.damageByVehicle || {}),
    },
    customizations: mergedCustom,
    audioMixer: { ...defaults.audioMixer, ...(loaded.audioMixer || {}) },
    radioSettings: {
      ...defaults.radioSettings,
      ...(loaded.radioSettings || {}),
    },
    hudSettings: {
      ...defaults.hudSettings,
      ...(loaded.hudSettings || {}),
      smartWheel: {
        ...defaults.hudSettings.smartWheel,
        ...(loaded.hudSettings?.smartWheel || {}),
      },
      widgets: {
        ...defaults.hudSettings.widgets,
        ...(loaded.hudSettings?.widgets || {}),
      },
    },
  };
}

export const PersistenceManager = {
  load: loadSaveStateV2,
  save: saveStateAtomicV2,
  recordTrip: recordDrivingTripToPhoneDb,
  getPhoneDbStats: getPhoneDatabaseStats,
  requestPersistentStorage: requestPhonePersistentStorage,
  reset(): SaveGameSchemaV2 {
    const fresh = createDefaultSaveStateV2();
    try {
      localStorage.removeItem(SAVE_KEY_PRIMARY);
      localStorage.removeItem(SAVE_KEY_BACKUP);
      localStorage.removeItem(TRIP_LOGS_CACHE_KEY);
    } catch {
      // Ignore
    }
    saveStateAtomicV2(fresh);
    return fresh;
  },
  exportSaveToJsonString(save: SaveGameSchemaV2): string {
    return JSON.stringify(save, null, 2);
  },
  importSaveFromJsonString(jsonStr: string): {
    ok: boolean;
    save?: SaveGameSchemaV2;
    errorAr?: string;
  } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (
        !parsed ||
        parsed.schemaVersion !== 2 ||
        typeof parsed.masalikCoins !== 'number'
      ) {
        return {
          ok: false,
          errorAr: 'ملف الحفظ غير صالح أو لا يتوافق مع بنية مَسَالِك (الإصدار 2).',
        };
      }
      const merged = mergeWithDefaults(parsed, createDefaultSaveStateV2());
      saveStateAtomicV2(merged);
      return { ok: true, save: merged };
    } catch {
      return {
        ok: false,
        errorAr:
          'تعذر قراءة ملف JSON. تأكد من اختيار ملف حفظ صحيح (.masalik.json).',
      };
    }
  },
};
