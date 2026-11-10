import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  CameraMode,
  DrivetrainMode,
  MissionDefinition,
  SaveGameSchemaV2,
  VehicleTelemetry,
  VehicleId,
  AutomaticShifterState,
  EffectiveGraphicsQuality,
} from './game/types';
import { MasalikVehicleDynamics } from './game/physicsEngine';
import { buildHighlandWorld, HighlandWorld } from './game/worldBuilder';
import { createMaterialLibrary } from './game/materials';
import {
  createFleetVehicleVisuals,
  FleetVehicleVisuals,
  VEHICLE_SPECS,
} from './game/vehicleFleet';
import { MasalikAudioEngine } from './game/audioEngine';
import { PersistenceManager } from './game/persistenceManager';
import { WORLD_POIS, mountainRoad } from './game/roadSpline';
import { ALL_OFFLINE_MISSIONS, getDriverRankTitleAr } from './game/missionsCatalog';
import { SmartSteeringWheel } from './components/SmartSteeringWheel';
import { ControlStudioModal } from './components/ControlStudioModal';
import { GarageShowroomModal } from './components/GarageShowroomModal';
import { MissionsAndStoryModal } from './components/MissionsAndStoryModal';
import { SettingsAndSaveModal } from './components/SettingsAndSaveModal';
import {
  Pause,
  Play,
  Camera,
  Sliders,
  Car,
  Flag,
  Settings,
  Eye,
  EyeOff,
  RotateCcw,
  Lightbulb,
  Navigation,
  Sparkles,
  Wrench,
  Fuel,
  Aperture,
  Download,
  Volume2,
  VolumeX,
} from 'lucide-react';

const CAMERA_LABELS_AR: Record<CameraMode, string> = {
  chase_near: 'قريبة',
  chase_far: 'بعيدة',
  cockpit: 'المقصورة 3D',
  hood: 'غطاء المحرك',
  cinematic_front: 'أمامية',
  free_photo: 'حرة 360°',
};

const CAMERA_MODES: CameraMode[] = [
  'chase_near',
  'chase_far',
  'cockpit',
  'hood',
  'cinematic_front',
  'free_photo',
];

export default function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const worldRef = useRef<HighlandWorld | null>(null);
  const vehicleVisualsRef = useRef<FleetVehicleVisuals | null>(null);
  const physicsRef = useRef<MasalikVehicleDynamics | null>(null);
  const audioRef = useRef<MasalikAudioEngine | null>(null);

  const [saveState, setSaveState] = useState<SaveGameSchemaV2>(() =>
    PersistenceManager.load()
  );
  const saveStateRef = useRef<SaveGameSchemaV2>(saveState);
  saveStateRef.current = saveState;

  const [activeModal, setActiveModal] = useState<
    'none' | 'pause' | 'garage' | 'missions' | 'control_studio' | 'settings' | 'photo'
  >('none');
  const activeModalRef = useRef(activeModal);
  activeModalRef.current = activeModal;

  const [cameraMode, setCameraMode] = useState<CameraMode>('chase_near');
  const cameraModeRef = useRef<CameraMode>(cameraMode);
  cameraModeRef.current = cameraMode;

  const [cleanCinematicHud, setCleanCinematicHud] = useState<boolean>(false);

  const [previewVehicleId, setPreviewVehicleId] = useState<VehicleId>(
    saveState.selectedVehicleId
  );
  const showroomOrbitRadRef = useRef<number>(0.65);

  const [activeMission, setActiveMission] = useState<MissionDefinition | null>(
    () => ALL_OFFLINE_MISSIONS[0]
  );
  const activeMissionRef = useRef<MissionDefinition | null>(activeMission);
  activeMissionRef.current = activeMission;
  const missionElapsedRef = useRef<number>(0);
  const [missionTimeRemaining, setMissionTimeRemaining] = useState<number>(85);
  const [missionBannerAr, setMissionBannerAr] = useState<string | null>(null);

  const [photoFilter, setPhotoFilter] = useState<
    'none' | 'warm' | 'golden' | 'dramatic'
  >('none');
  const [photoFov, setPhotoFov] = useState<number>(58);

  const [minimapExpanded, setMinimapExpanded] = useState<boolean>(false);
  const [toolsExpanded, setToolsExpanded] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const touchInputsRef = useRef({
    steerNorm: 0,
    wheelGrabbed: false,
    throttle: 0,
    brake: 0,
    handbrake: false,
  });

  const keyStateRef = useRef<{ [key: string]: boolean }>({});

  const [telemetry, setTelemetry] = useState<VehicleTelemetry | null>(null);
  const [throttleUiPct, setThrottleUiPct] = useState<number>(0);
  const [brakeUiPct, setBrakeUiPct] = useState<number>(0);
  const [fpsCount, setFpsCount] = useState<number>(60);

  const gasPointerIdRef = useRef<number | null>(null);
  const brakePointerIdRef = useRef<number | null>(null);

  const updateAndSave = useCallback(
    (updater: (prev: SaveGameSchemaV2) => SaveGameSchemaV2) => {
      setSaveState((prev) => {
        const next = updater(prev);
        PersistenceManager.save(next);
        return next;
      });
    },
    []
  );

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (saveStateRef.current.hudSettings.controlMode !== 'tilt') return;
      const tiltDeg =
        e.beta !== null && Math.abs(e.beta) < 75 ? e.beta : e.gamma || 0;
      const sens = saveStateRef.current.hudSettings.smartWheel.sensitivity || 1.0;
      const norm = Math.max(-1, Math.min(1, (-tiltDeg / 28) * sens));
      touchInputsRef.current.steerNorm = norm;
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const initialSave = saveStateRef.current;
    const vid = initialSave.selectedVehicleId;
    const custom = initialSave.customizations[vid];

    const renderer = new THREE.WebGLRenderer({
      antialias: initialSave.graphicsQuality !== 'low',
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        initialSave.graphicsQuality === 'ultra' ? 2 : 1.5
      )
    );
    renderer.shadowMap.enabled = initialSave.graphicsQuality !== 'low';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2b6cb0);

    const camera = new THREE.PerspectiveCamera(
      58,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.2,
      2000
    );

    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x44403c, 0.78);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffbeb, 2.2);
    sunLight.position.set(120, 220, 90);
    sunLight.castShadow = initialSave.graphicsQuality !== 'low';
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.shadow.camera.near = 2;
    sunLight.shadow.camera.far = 350;
    const d = 65;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);
    scene.add(sunLight.target);

    const materials = createMaterialLibrary(renderer);
    const world = buildHighlandWorld(materials, false);
    scene.add(world.worldGroup);

    const vehicleVisuals = createFleetVehicleVisuals(false);
    vehicleVisuals.rebuildForVehicle(vid, custom);
    scene.add(vehicleVisuals.rootGroup);

    const physics = new MasalikVehicleDynamics();
    physics.selectVehicle(vid, custom);
    physics.wheelRotationRangeDeg = initialSave.hudSettings.smartWheel.rotationRangeDeg;
    physics.weather = initialSave.weather;

    if (activeMissionRef.current) {
      physics.resetToRoad(activeMissionRef.current.startDistanceM);
      missionElapsedRef.current = 0;
    }

    const audio = new MasalikAudioEngine();
    audio.setMixer(initialSave.audioMixer);

    rendererRef.current = renderer;
    cameraRef.current = camera;
    worldRef.current = world;
    vehicleVisualsRef.current = vehicleVisuals;
    physicsRef.current = physics;
    audioRef.current = audio;

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = Math.max(1, mountRef.current.clientHeight);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const onKeyDown = (e: KeyboardEvent) => {
      keyStateRef.current[e.code] = true;
      audio.init();
      if (e.code === 'Escape') {
        setActiveModal((m) => (m === 'none' ? 'pause' : 'none'));
      } else if (e.code === 'KeyR') {
        physics.resetToRoad();
      } else if (e.code === 'KeyH') {
        audio.playHorn(true, physics.vehicleId);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keyStateRef.current[e.code] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    let rafId = 0;
    let lastTime = performance.now();
    let elapsedSec = 0;
    let frameCounter = 0;
    let fpsTimer = performance.now();
    let uiSyncTimer = 0;
    let prevSpeedMs = 0;

    const camLookTarget = new THREE.Vector3();
    const desiredCamPos = new THREE.Vector3();
    const worldAnchorPos = new THREE.Vector3();

    const animate = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      elapsedSec += dt;
      frameCounter++;

      if (now - fpsTimer >= 1000) {
        setFpsCount(frameCounter);
        frameCounter = 0;
        fpsTimer = now;
      }

      const modal = activeModalRef.current;
      const isPaused =
        modal === 'pause' ||
        modal === 'missions' ||
        modal === 'control_studio' ||
        modal === 'settings';

      let gpThrottle = 0;
      let gpBrake = 0;
      let gpSteer = 0;
      let gpHandbrake = false;
      if (navigator.getGamepads) {
        const pad = navigator.getGamepads()?.[0];
        if (pad) {
          gpSteer = Math.abs(pad.axes[0]) > 0.08 ? -pad.axes[0] : 0;
          gpThrottle = pad.buttons[7]?.value || 0;
          gpBrake = pad.buttons[6]?.value || 0;
          gpHandbrake = Boolean(pad.buttons[0]?.pressed);
        }
      }

      const keys = keyStateRef.current;
      const kbThrottle = keys['KeyW'] || keys['ArrowUp'] ? 1 : 0;
      const kbBrake = keys['KeyS'] || keys['ArrowDown'] ? 1 : 0;
      const kbLeft = keys['KeyA'] || keys['ArrowLeft'] ? 1 : 0;
      const kbRight = keys['KeyD'] || keys['ArrowRight'] ? 1 : 0;
      const kbSteer = kbLeft - kbRight;
      const kbHandbrake = Boolean(keys['Space']);

      const throttle = Math.max(
        touchInputsRef.current.throttle,
        kbThrottle,
        gpThrottle
      );
      const brake = Math.max(touchInputsRef.current.brake, kbBrake, gpBrake);
      const steer =
        Math.abs(touchInputsRef.current.steerNorm) > 0.005 ||
        touchInputsRef.current.wheelGrabbed
          ? touchInputsRef.current.steerNorm
          : Math.abs(kbSteer) > 0
          ? kbSteer
          : gpSteer;
      const handbrake =
        touchInputsRef.current.handbrake || kbHandbrake || gpHandbrake;

      let snap: VehicleTelemetry;
      if (!isPaused && modal !== 'garage' && modal !== 'photo') {
        snap = physics.step(dt, { throttle, brake, steer, handbrake });

        // Detect sharp impact deceleration for collision audio
        const decelMs = prevSpeedMs - snap.forwardSpeedMs;
        if (decelMs > 4.5) {
          audio.playCollisionSound(decelMs);
        }
        prevSpeedMs = snap.forwardSpeedMs;

        // Check active mission progress
        const curMission = activeMissionRef.current;
        if (curMission) {
          missionElapsedRef.current += dt;
          const remSec = Math.max(
            0,
            curMission.targetTimeSec - missionElapsedRef.current
          );
          if (snap.distanceAlongRoadM >= curMission.finishDistanceM) {
            const reward = curMission.rewardCoins;
            const xp = curMission.rewardXp;
            setMissionBannerAr(
              `تم إنجاز المهمة «${curMission.titleAr}» بنجاح! المكافأة: +${reward.toLocaleString()} ر.ي`
            );
            updateAndSave((prev) => ({
              ...prev,
              masalikCoins: prev.masalikCoins + reward,
              driverXp: prev.driverXp + xp,
              missionCompletions: {
                ...prev.missionCompletions,
                [curMission.id]: (prev.missionCompletions?.[curMission.id] || 0) + 1,
              },
            }));
            activeMissionRef.current = null;
            setActiveMission(null);
          } else if (remSec <= 0) {
            setMissionBannerAr(
              `انتهى وقت المهمة «${curMission.titleAr}» — يمكنك إعادة المحاولة في أي وقت.`
            );
            activeMissionRef.current = null;
            setActiveMission(null);
          }
        }
      } else {
        snap = physics.step(0.0001, {
          throttle: 0,
          brake: 0,
          steer: 0,
          handbrake: true,
        });
      }

      const curSave = saveStateRef.current;
      const skyHex = world.applyAtmosphere(
        curSave.timeOfDay,
        curSave.weather,
        scene,
        sunLight,
        hemiLight
      );

      const finishDist = activeMissionRef.current
        ? activeMissionRef.current.finishDistanceM
        : 3850;

      const worldStep = world.updateWorldStreamingAndTraffic(
        elapsedSec,
        dt,
        snap.distanceAlongRoadM,
        physics.position,
        snap.speedKmh,
        snap.surface,
        snap.wheels,
        finishDist,
        snap.aiRivalDistanceM
      );

      if (worldStep.lightningFlashTriggered) {
        audio.playThunderClap();
      }

      // Update 3D Vehicle Visuals (including 3D cockpit wheel & gauges)
      const camDist = camera.position.distanceTo(physics.position);
      vehicleVisuals.updateVisuals(
        physics.position,
        physics.quaternion,
        physics.chassisPitchRad,
        physics.chassisRollRad,
        THREE.MathUtils.degToRad(snap.steeringAngleDeg),
        brake > 0.1,
        snap.autoShifter === 'R' || snap.forwardSpeedMs < -0.5,
        snap.headlightsOn,
        snap.wipersOn,
        snap.leftIndicatorOn,
        snap.rightIndicatorOn,
        snap.engineRunning,
        snap.speedKmh,
        snap.rpm,
        snap.fuelLiters,
        snap.damage,
        skyHex,
        camDist,
        curSave.hudSettings.cockpitSeatOffsetY,
        elapsedSec,
        snap.wheels
      );

      // Update Sun Shadow Target to follow player
      sunLight.position.set(
        physics.position.x + 85,
        physics.position.y + 140,
        physics.position.z + 65
      );
      sunLight.target.position.copy(physics.position);

      // Camera Positioning
      const cMode = cameraModeRef.current;
      if (modal === 'garage' || cMode === 'free_photo') {
        showroomOrbitRadRef.current += dt * (modal === 'garage' ? 0.22 : 0.12);
        const dist = 6.2;
        camera.position.set(
          physics.position.x + Math.cos(showroomOrbitRadRef.current) * dist,
          physics.position.y + 2.15,
          physics.position.z + Math.sin(showroomOrbitRadRef.current) * dist
        );
        camera.lookAt(
          physics.position.x,
          physics.position.y + 0.9,
          physics.position.z
        );
      } else if (cMode === 'cockpit') {
        vehicleVisuals.cockpitCameraAnchor.getWorldPosition(worldAnchorPos);
        camera.position.copy(worldAnchorPos);
        const forwardVec = new THREE.Vector3(0, -0.05, -10).applyQuaternion(
          physics.quaternion
        );
        camLookTarget.copy(worldAnchorPos).add(forwardVec);
        camera.lookAt(camLookTarget);
      } else if (cMode === 'hood') {
        vehicleVisuals.hoodCameraAnchor.getWorldPosition(worldAnchorPos);
        camera.position.copy(worldAnchorPos);
        const forwardVec = new THREE.Vector3(0, -0.04, -15).applyQuaternion(
          physics.quaternion
        );
        camLookTarget.copy(worldAnchorPos).add(forwardVec);
        camera.lookAt(camLookTarget);
      } else {
        const isFar = cMode === 'chase_far';
        const isFront = cMode === 'cinematic_front';
        const offsetVec = new THREE.Vector3(
          0,
          isFar ? 3.5 : 2.55,
          isFront ? -6.8 : isFar ? 8.6 : 6.4
        ).applyQuaternion(physics.quaternion);
        desiredCamPos.copy(physics.position).add(offsetVec);
        camera.position.lerp(desiredCamPos, Math.min(1, dt * 8.5));
        camLookTarget.set(
          physics.position.x,
          physics.position.y + 1.15,
          physics.position.z
        );
        camera.lookAt(camLookTarget);
      }

      // Update Procedural Audio
      const avgSlip =
        (snap.wheels[0].slipRatio +
          snap.wheels[1].slipRatio +
          snap.wheels[2].slipRatio +
          snap.wheels[3].slipRatio) *
        0.25;

      audio.update(
        snap.rpm,
        snap.speedKmh,
        throttle,
        avgSlip,
        snap.gear,
        physics.vehicleId,
        curSave.weather,
        snap.surface,
        cMode,
        snap.inTunnel
      );

      renderer.render(scene, camera);

      if (now - uiSyncTimer > 55) {
        uiSyncTimer = now;
        setTelemetry(snap);
        setThrottleUiPct(Math.round(throttle * 100));
        setBrakeUiPct(Math.round(brake * 100));
        if (activeMissionRef.current) {
          setMissionTimeRemaining(
            Math.max(
              0,
              Math.ceil(
                activeMissionRef.current.targetTimeSec - missionElapsedRef.current
              )
            )
          );
        }
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      world.dispose();
      vehicleVisuals.dispose();
      materials.dispose();
      renderer.dispose();
    };
  }, [updateAndSave]);

  useEffect(() => {
    if (physicsRef.current) {
      physicsRef.current.wheelRotationRangeDeg =
        saveState.hudSettings.smartWheel.rotationRangeDeg;
      physicsRef.current.weather = saveState.weather;
    }
    if (audioRef.current) {
      audioRef.current.setMixer(saveState.audioMixer);
    }
    if (worldRef.current) {
      const q: EffectiveGraphicsQuality =
        saveState.graphicsQuality === 'auto' ? 'high' : saveState.graphicsQuality;
      worldRef.current.applyQuality(q);
    }
  }, [saveState]);

  const cycleCameraMode = () => {
    audioRef.current?.init();
    audioRef.current?.playUiClick(1.1);
    setCameraMode((prev) => {
      const idx = CAMERA_MODES.indexOf(prev);
      return CAMERA_MODES[(idx + 1) % CAMERA_MODES.length];
    });
  };

  const handleSteerChange = useCallback(
    (steerNorm: number, activeTouch: boolean) => {
      touchInputsRef.current.steerNorm = steerNorm;
      touchInputsRef.current.wheelGrabbed = activeTouch;
    },
    []
  );

  const computePedalRatio = (e: React.PointerEvent<HTMLDivElement>): number => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relY = 1 - (e.clientY - rect.top) / Math.max(1, rect.height);
    return Math.max(0.35, Math.min(1.0, 0.35 + relY * 0.7));
  };

  const handleStartMission = (mission: MissionDefinition) => {
    audioRef.current?.init();
    audioRef.current?.playUiClick(1.2);
    setActiveMission(mission);
    activeMissionRef.current = mission;
    missionElapsedRef.current = 0;

    const vid = saveState.unlockedVehicles.includes(mission.recommendedVehicleId)
      ? mission.recommendedVehicleId
      : saveState.selectedVehicleId;
    const custom = saveState.customizations[vid];

    physicsRef.current?.selectVehicle(vid, custom);
    physicsRef.current?.resetToRoad(mission.startDistanceM);
    physicsRef.current?.configureAiRival(
      Boolean(mission.hasAiRival),
      mission.startDistanceM,
      mission.aiRivalSpeedMs || 18.5
    );
    vehicleVisualsRef.current?.rebuildForVehicle(vid, custom);

    updateAndSave((prev) => ({
      ...prev,
      selectedVehicleId: vid,
      weather: mission.weatherPreset,
      timeOfDay: mission.timeOfDayPreset,
    }));

    setActiveModal('none');
    setMissionBannerAr(`بدأت المهمة: ${mission.titleAr}`);
    setTimeout(() => setMissionBannerAr(null), 4000);
  };

  const nearbyPoi = (() => {
    if (!telemetry) return null;
    return (
      WORLD_POIS.find(
        (p) => Math.abs(p.distanceM - telemetry.distanceAlongRoadM) < 75
      ) || null
    );
  })();

  const nextTurnInfo = (() => {
    if (!telemetry) return { dir: 'straight' };
    const curSample = mountainRoad.getSampleAtDistance(telemetry.distanceAlongRoadM);
    const aheadSample = mountainRoad.getSampleAtDistance(
      telemetry.distanceAlongRoadM + 85
    );
    const crossY =
      curSample.tangent.x * aheadSample.tangent.z -
      curSample.tangent.z * aheadSample.tangent.x;
    const dir =
      crossY > 0.14 ? 'right' : crossY < -0.14 ? 'left' : 'straight';
    return { dir };
  })();

  const hud = saveState.hudSettings;
  const wLayout = hud.widgets;
  const spec = VEHICLE_SPECS[saveState.selectedVehicleId];
  const rankInfo = getDriverRankTitleAr(saveState.driverXp);

  const filterCss =
    photoFilter === 'golden'
      ? 'sepia(0.28) saturate(1.45) contrast(1.08)'
      : photoFilter === 'warm'
      ? 'saturate(1.25) contrast(1.05)'
      : photoFilter === 'dramatic'
      ? 'contrast(1.22) brightness(0.92) saturate(0.85)'
      : 'none';

  return (
    <div
      dir="rtl"
      onPointerDown={() => audioRef.current?.init()}
      className="relative w-screen h-screen overflow-hidden bg-[#090d16] select-none touch-none"
    >
      {/* 3D WebGL Viewport Container */}
      <div
        ref={mountRef}
        style={{ filter: filterCss }}
        className="inset-0 absolute w-full h-full z-0"
      />

      {/* Mission Status / Toast Banner */}
      {missionBannerAr && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-30 px-5 py-2 rounded-2xl bg-slate-950/90 border border-amber-400/80 text-amber-300 text-xs font-bold shadow-2xl flex items-center gap-2">
          <span>{missionBannerAr}</span>
          <button
            type="button"
            onClick={() => setMissionBannerAr(null)}
            className="text-stone-400 hover:text-white mr-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Nearby Service Station Interactive Prompt */}
      {nearbyPoi && activeModal === 'none' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-2xl bg-slate-950/85 border border-emerald-400/70 backdrop-blur-md flex items-center gap-3 shadow-xl">
          <div className="text-xs">
            <span className="text-emerald-300 font-bold">{nearbyPoi.nameAr}</span>
            <span className="text-stone-400 mx-1.5">—</span>
            <span className="text-stone-200">{nearbyPoi.descriptionAr}</span>
          </div>
          {nearbyPoi.type === 'fuel' && (
            <button
              type="button"
              onClick={() => {
                physicsRef.current?.refuelTank();
                audioRef.current?.playUiClick(1.3);
                setMissionBannerAr('تمت تعبئة خزان الوقود بالكامل!');
                setTimeout(() => setMissionBannerAr(null), 2500);
              }}
              className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1"
            >
              <Fuel className="w-3.5 h-3.5" />
              تعبئة الوقود
            </button>
          )}
          {nearbyPoi.type === 'workshop' && (
            <button
              type="button"
              onClick={() => {
                physicsRef.current?.repairAllDamage();
                audioRef.current?.playUiClick(1.3);
                setMissionBannerAr('تم إصلاح المحرك ونظام التعليق بالكامل!');
                setTimeout(() => setMissionBannerAr(null), 2500);
              }}
              className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1"
            >
              <Wrench className="w-3.5 h-3.5" />
              إصلاح المركبة
            </button>
          )}
          {nearbyPoi.type === 'car_wash' && (
            <button
              type="button"
              onClick={() => {
                physicsRef.current?.washVehicle();
                audioRef.current?.playUiClick(1.3);
                setMissionBannerAr('تم غسيل وتلميع المركبة من الغبار والطين!');
                setTimeout(() => setMissionBannerAr(null), 2500);
              }}
              className="px-3 py-1 rounded-xl bg-sky-400 text-slate-950 text-xs font-bold flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              غسيل المركبة
            </button>
          )}
        </div>
      )}

      {/* =====================================================================
          MASALIK PROFESSIONAL DRIVING HUD (Unobstructed 3D Center View)
         ===================================================================== */}
      {activeModal === 'none' && !cleanCinematicHud && telemetry && (
        <div dir="ltr" className="inset-0 fixed pointer-events-none z-20">
          {/* 1. TOP-LEFT: Pause + Compact Mission / Timer / Distance Card */}
          {wLayout.mission_card.visible && (
            <div
              dir="rtl"
              style={{
                left: `${wLayout.mission_card.xPct}%`,
                top: `${wLayout.mission_card.yPct}%`,
                transform: `translate(-50%, -50%) scale(${wLayout.mission_card.scale})`,
                opacity: wLayout.mission_card.opacity,
              }}
              className="absolute pointer-events-auto flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => {
                  audioRef.current?.playUiClick();
                  setActiveModal('pause');
                }}
                className="w-10 h-10 rounded-xl bg-slate-950/80 border border-stone-700/80 backdrop-blur-md flex items-center justify-center text-stone-100 hover:border-amber-400 shadow-lg"
                title="إيقاف مؤقت"
              >
                <Pause className="w-4 h-4" />
              </button>

              <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/75 border border-stone-700/70 backdrop-blur-md shadow-lg">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="font-bold text-amber-300 truncate max-w-[140px]">
                    {activeMission ? activeMission.titleAr : 'قيادة حرة في دروب اليمن'}
                  </span>
                  <span className="text-stone-500">|</span>
                  <span className="font-mono-num text-stone-200 font-bold">
                    {activeMission
                      ? `${missionTimeRemaining}ث`
                      : `${(telemetry.distanceAlongRoadM / 1000).toFixed(2)} كم`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-0.5">
                  <span>{telemetry.regionNameAr}</span>
                  <span>·</span>
                  <span className="text-amber-400 font-mono-num">
                    {saveState.masalikCoins.toLocaleString()} ر.ي
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 2. TOP-CENTER: Next-Turn GPS & Quick Bar */}
          {wLayout.top_nav.visible && (
            <div
              dir="rtl"
              style={{
                left: `${wLayout.top_nav.xPct}%`,
                top: `${wLayout.top_nav.yPct}%`,
                transform: `translate(-50%, -50%) scale(${wLayout.top_nav.scale})`,
                opacity: wLayout.top_nav.opacity,
              }}
              className="absolute pointer-events-auto flex items-center gap-1.5"
            >
              <div className="px-3 py-1.5 rounded-xl bg-slate-950/75 border border-stone-700/70 backdrop-blur-md flex items-center gap-2 shadow-lg">
                <Navigation
                  className={`w-4 h-4 text-amber-400 transition-transform ${
                    nextTurnInfo.dir === 'right'
                      ? 'rotate-45'
                      : nextTurnInfo.dir === 'left'
                      ? '-rotate-45'
                      : 'rotate-0'
                  }`}
                />
                <span className="text-[11px] font-bold text-stone-200">
                  {nextTurnInfo.dir === 'right'
                    ? 'منعطف يمين'
                    : nextTurnInfo.dir === 'left'
                    ? 'منعطف يسار'
                    : 'مسار مستقيم'}
                </span>
                {activeMission && (
                  <span className="text-[11px] font-mono-num text-emerald-400 font-bold">
                    {Math.max(
                      0,
                      Math.round(
                        activeMission.finishDistanceM - telemetry.distanceAlongRoadM
                      )
                    )}
                    م
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={cycleCameraMode}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950/75 border border-stone-700/70 backdrop-blur-md text-[11px] font-bold text-stone-200 hover:border-amber-400 flex items-center gap-1 shadow-lg"
                title="تغيير زاوية الكاميرا"
              >
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">
                  {CAMERA_LABELS_AR[cameraMode]}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  audioRef.current?.playUiClick();
                  setPreviewVehicleId(saveState.selectedVehicleId);
                  setActiveModal('garage');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950/75 border border-stone-700/70 backdrop-blur-md text-[11px] font-bold text-amber-300 hover:border-amber-400 flex items-center gap-1 shadow-lg"
                title="معرض المركبات والورشة"
              >
                <Car className="w-3.5 h-3.5" />
                <span className="hidden md:inline">الكراج (10)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  audioRef.current?.playUiClick();
                  setActiveModal('missions');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950/75 border border-stone-700/70 backdrop-blur-md text-[11px] font-bold text-stone-200 hover:border-amber-400 flex items-center gap-1 shadow-lg"
                title="المهمات وفصول القصة"
              >
                <Flag className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden md:inline">المهمات (65)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  audioRef.current?.playUiClick();
                  setActiveModal('control_studio');
                }}
                className="p-1.5 rounded-xl bg-slate-950/75 border border-stone-700/70 backdrop-blur-md text-stone-200 hover:border-amber-400 shadow-lg"
                title="تخصيص أماكن وأحجام أدوات القيادة"
              >
                <Sliders className="w-4 h-4 text-amber-400" />
              </button>

              <button
                type="button"
                onClick={() => setToolsExpanded((v) => !v)}
                className={`px-2.5 py-1.5 rounded-xl border backdrop-blur-md text-[11px] font-bold shadow-lg ${
                  toolsExpanded
                    ? 'bg-amber-500 text-slate-950 border-amber-300'
                    : 'bg-slate-950/75 text-stone-200 border-stone-700/70'
                }`}
              >
                أدوات ▾
              </button>
            </div>
          )}

          {/* Secondary Collapsible Tools Drawer */}
          {toolsExpanded && (
            <div
              dir="rtl"
              className="fixed top-16 left-1/2 -translate-x-1/2 pointer-events-auto px-3 py-2 rounded-2xl bg-slate-950/90 border border-stone-700 backdrop-blur-md flex flex-wrap items-center gap-2 shadow-2xl z-30"
            >
              <button
                type="button"
                onClick={() => {
                  if (!physicsRef.current) return;
                  physicsRef.current.headlightsOn = !physicsRef.current.headlightsOn;
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 border ${
                  telemetry.headlightsOn
                    ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                    : 'bg-stone-900 border-stone-700 text-stone-400'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                الأنوار: {telemetry.headlightsOn ? 'مشتغلة' : 'مطفأة'}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!physicsRef.current) return;
                  const next = !physicsRef.current.leftIndicatorOn;
                  physicsRef.current.leftIndicatorOn = next;
                  physicsRef.current.rightIndicatorOn = next;
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                  telemetry.leftIndicatorOn && telemetry.rightIndicatorOn
                    ? 'bg-rose-500/30 border-rose-400 text-rose-300'
                    : 'bg-stone-900 border-stone-700 text-stone-400'
                }`}
              >
                فلشر رباعي △
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!physicsRef.current) return;
                  physicsRef.current.wipersOn = !physicsRef.current.wipersOn;
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                  telemetry.wipersOn
                    ? 'bg-sky-500/25 border-sky-400 text-sky-300'
                    : 'bg-stone-900 border-stone-700 text-stone-400'
                }`}
              >
                المسّاحات
              </button>

              {(['2H', '4H', '4L'] as DrivetrainMode[]).map((dtMode) => (
                <button
                  key={dtMode}
                  type="button"
                  onClick={() => {
                    if (physicsRef.current) {
                      physicsRef.current.drivetrainMode = dtMode;
                    }
                  }}
                  className={`px-2 py-1 rounded-lg font-mono-num text-[11px] font-bold border ${
                    telemetry.drivetrainMode === dtMode
                      ? 'bg-amber-500 text-slate-950 border-amber-300'
                      : 'bg-stone-900 border-stone-700 text-stone-300'
                  }`}
                >
                  {dtMode}
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  if (physicsRef.current) {
                    physicsRef.current.diffLockActive =
                      !physicsRef.current.diffLockActive;
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                  telemetry.diffLockActive
                    ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                    : 'bg-stone-900 border-stone-700 text-stone-400'
                }`}
              >
                قفل تفاضلي (Diff)
              </button>

              <button
                type="button"
                onClick={() => {
                  physicsRef.current?.resetToRoad();
                  setToolsExpanded(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] font-bold flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                إعادة للمسار
              </button>

              <button
                type="button"
                onClick={() => {
                  setToolsExpanded(false);
                  setActiveModal('photo');
                }}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-[11px] font-bold flex items-center gap-1"
              >
                <Aperture className="w-3.5 h-3.5" />
                وضع التصوير
              </button>

              <button
                type="button"
                onClick={() =>
                  updateAndSave((prev) => ({
                    ...prev,
                    audioMixer: {
                      ...prev.audioMixer,
                      muted: !prev.audioMixer.muted,
                    },
                  }))
                }
                className="p-1.5 rounded-lg bg-stone-800 text-stone-200"
              >
                {saveState.audioMixer.muted ? (
                  <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setToolsExpanded(false);
                  setActiveModal('settings');
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-bold flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                الإعدادات
              </button>
            </div>
          )}

          {/* 3. TOP-RIGHT: Interactive Rotating GPS Mini-Map */}
          {wLayout.minimap.visible && (
            <div
              style={{
                left: `${wLayout.minimap.xPct}%`,
                top: `${wLayout.minimap.yPct}%`,
                transform: `translate(-50%, -50%) scale(${wLayout.minimap.scale})`,
                opacity: wLayout.minimap.opacity,
              }}
              className="absolute pointer-events-auto"
            >
              <div
                onClick={() => setMinimapExpanded((v) => !v)}
                className={`rounded-2xl bg-slate-950/80 border-2 border-stone-700/80 backdrop-blur-md overflow-hidden shadow-2xl cursor-pointer transition-all ${
                  minimapExpanded ? 'w-44 h-44' : 'w-28 h-28'
                } relative flex items-center justify-center`}
                title="اضغط لتكبير/تصغير الخريطة"
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <rect width="100" height="100" fill="#090d16" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="24"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <path
                    d="M 50 95 Q 56 68 50 50 Q 42 30 55 8"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                  />
                  {telemetry.aiRivalDistanceM !== null && (
                    <circle
                      cx="50"
                      cy={Math.max(
                        12,
                        Math.min(
                          88,
                          50 -
                            ((telemetry.aiRivalDistanceM -
                              telemetry.distanceAlongRoadM) /
                              120) *
                              35
                        )
                      )}
                      r="3.5"
                      fill="#ef4444"
                    />
                  )}
                  <polygon points="50,42 44,56 50,52 56,56" fill="#38bdf8" />
                </svg>
                <div className="bottom-1 inset-x-1.5 absolute flex justify-between text-[9px] font-mono-num text-stone-300 bg-slate-950/80 px-1.5 py-0.5 rounded">
                  <span>{Math.round(telemetry.altitudeM)}م</span>
                  <span className="text-amber-400">
                    {(telemetry.distanceAlongRoadM / 1000).toFixed(1)}كم
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. BOTTOM-LEFT: MASALIK Smart Steering Wheel */}
          {wLayout.steering.visible && (
            <div
              style={{
                left: `${wLayout.steering.xPct}%`,
                top: `${wLayout.steering.yPct}%`,
                transform: `translate(-50%, -50%)`,
              }}
              className="absolute pointer-events-auto"
            >
              <SmartSteeringWheel
                mode={hud.controlMode}
                wheelSettings={hud.smartWheel}
                currentSteerNorm={telemetry.steeringInputNorm}
                onSteerChange={handleSteerChange}
                scale={wLayout.steering.scale}
                opacity={wLayout.steering.opacity}
              />
            </div>
          )}

          {/* 5. HORN BUTTON (Secondary Tools Widget) */}
          {wLayout.secondary_tools.visible && (
            <div
              style={{
                left: `${wLayout.secondary_tools.xPct}%`,
                top: `${wLayout.secondary_tools.yPct}%`,
                transform: `translate(-50%, -50%) scale(${wLayout.secondary_tools.scale})`,
                opacity: wLayout.secondary_tools.opacity,
              }}
              className="absolute pointer-events-auto"
            >
              <button
                type="button"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  audioRef.current?.init();
                  audioRef.current?.playHorn(true, saveState.selectedVehicleId);
                }}
                className="w-12 h-12 rounded-full bg-slate-950/80 border-2 border-stone-600/80 active:border-amber-400 active:scale-95 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-xl"
                aria-label="بوق المركبة"
              >
                📯
              </button>
            </div>
          )}

          {/* 6. BOTTOM-CENTER: Compact Translucent Speedometer, Gear, RPM & Fuel Cluster */}
          {wLayout.speedometer.visible && (
            <div
              dir="rtl"
              style={{
                left: `${wLayout.speedometer.xPct}%`,
                top: `${wLayout.speedometer.yPct}%`,
                transform: `translate(-50%, -50%) scale(${wLayout.speedometer.scale})`,
                opacity: wLayout.speedometer.opacity,
              }}
              className="absolute pointer-events-auto"
            >
              <div className="px-4 py-2 rounded-2xl bg-slate-950/78 border border-stone-700/80 backdrop-blur-md shadow-2xl flex items-center gap-4 min-w-[230px]">
                <div className="text-center">
                  <div className="text-2xl font-black font-display-num text-stone-100 leading-none">
                    {telemetry.speedKmh}
                  </div>
                  <div className="text-[9px] text-stone-400 font-bold mt-0.5">
                    كم/س
                  </div>
                </div>

                <div className="w-10 h-9 rounded-xl bg-amber-500/20 border border-amber-400/70 flex flex-col items-center justify-center">
                  <span className="text-sm font-black font-mono-num text-amber-300 leading-none">
                    {telemetry.gear}
                  </span>
                  <span className="text-[8px] text-amber-200/80 font-mono-num">
                    {telemetry.drivetrainMode}
                  </span>
                </div>

                <div className="flex-1 space-y-1.5 min-w-[95px]">
                  <div>
                    <div className="flex justify-between text-[9px] text-stone-400 font-mono-num">
                      <span>RPM</span>
                      <span>{telemetry.rpm}</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          telemetry.rpm > spec.redlineRpm * 0.85
                            ? 'bg-rose-500'
                            : 'bg-amber-400'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (telemetry.rpm / spec.redlineRpm) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono-num">
                    <span className="text-amber-300">
                      ⛽ {Math.round(telemetry.fuelLiters)}L
                    </span>
                    <span
                      className={
                        telemetry.damage.bodyHealthPct < 60
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }
                    >
                      🔧 {Math.round(telemetry.damage.bodyHealthPct)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 7. SHIFTER (P/R/N/D) + HANDBRAKE CLUSTER */}
          {wLayout.shifter_handbrake.visible && (
            <div
              style={{
                left: `${wLayout.shifter_handbrake.xPct}%`,
                top: `${wLayout.shifter_handbrake.yPct}%`,
                transform: `translate(-50%, -50%) scale(${wLayout.shifter_handbrake.scale})`,
                opacity: wLayout.shifter_handbrake.opacity,
              }}
              className="absolute pointer-events-auto flex flex-col items-center gap-2"
            >
              <div className="flex flex-col gap-1 p-1 rounded-xl bg-slate-950/80 border border-stone-700/80 backdrop-blur-md shadow-xl">
                {(['D', 'N', 'R', 'P'] as AutomaticShifterState[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      physicsRef.current?.setAutoShifter(st);
                      audioRef.current?.playUiClick(st === 'D' ? 1.2 : 0.9);
                    }}
                    className={`w-8 h-6 rounded-lg font-mono-num text-xs font-black transition ${
                      telemetry.autoShifter === st
                        ? 'bg-amber-500 text-slate-950 shadow'
                        : 'text-stone-400 hover:bg-stone-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  e.currentTarget.setPointerCapture(e.pointerId);
                  touchInputsRef.current.handbrake = true;
                }}
                onPointerUp={(e) => {
                  e.stopPropagation();
                  touchInputsRef.current.handbrake = false;
                }}
                onPointerCancel={() => {
                  touchInputsRef.current.handbrake = false;
                }}
                className={`w-12 h-12 rounded-2xl border-2 font-mono-num text-xs font-black flex flex-col items-center justify-center transition backdrop-blur-md shadow-xl ${
                  telemetry.handbrake
                    ? 'bg-rose-600 border-rose-300 text-white scale-95'
                    : 'bg-slate-950/80 border-stone-600/80 text-rose-400'
                }`}
              >
                <span className="text-xs leading-none">(P)</span>
                <span className="text-[9px] font-arabic mt-0.5">جلنط</span>
              </button>
            </div>
          )}

          {/* 8. BOTTOM-RIGHT: Proportional Vertical Accelerator & Brake Pedals */}
          {wLayout.pedals.visible && (
            <div
              style={{
                left: `${wLayout.pedals.xPct}%`,
                top: `${wLayout.pedals.yPct}%`,
                transform: `translate(-50%, -50%) scale(${wLayout.pedals.scale})`,
                opacity: wLayout.pedals.opacity,
              }}
              className="absolute pointer-events-auto flex items-end gap-3.5 select-none touch-none"
            >
              {/* Brake Pedal */}
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  brakePointerIdRef.current = e.pointerId;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  touchInputsRef.current.brake = computePedalRatio(e);
                }}
                onPointerMove={(e) => {
                  if (brakePointerIdRef.current !== e.pointerId) return;
                  touchInputsRef.current.brake = computePedalRatio(e);
                }}
                onPointerUp={(e) => {
                  if (brakePointerIdRef.current !== e.pointerId) return;
                  brakePointerIdRef.current = null;
                  touchInputsRef.current.brake = 0;
                }}
                onPointerCancel={() => {
                  brakePointerIdRef.current = null;
                  touchInputsRef.current.brake = 0;
                }}
                className={`w-16 h-28 rounded-2xl border-2 relative overflow-hidden backdrop-blur-md flex flex-col justify-between p-2 transition-transform shadow-2xl ${
                  brakeUiPct > 0
                    ? 'border-rose-400 scale-95 bg-slate-950/90'
                    : 'border-stone-600/80 bg-slate-950/78'
                }`}
              >
                <div
                  className="inset-x-0 bottom-0 absolute bg-gradient-to-t from-rose-600/75 to-rose-400/40 pointer-events-none transition-all duration-75"
                  style={{ height: `${brakeUiPct}%` }}
                />
                <div className="relative z-10 text-[10px] font-mono-num text-rose-300 text-center font-bold">
                  {brakeUiPct > 0 ? `${brakeUiPct}%` : ''}
                </div>
                <div className="relative z-10 space-y-1.5 my-auto px-1">
                  <div className="h-1 rounded bg-stone-500/60" />
                  <div className="h-1 rounded bg-stone-500/60" />
                  <div className="h-1 rounded bg-stone-500/60" />
                </div>
                <div className="relative z-10 text-[11px] font-bold text-stone-200 text-center">
                  فرامل
                </div>
              </div>

              {/* Gas Pedal */}
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  gasPointerIdRef.current = e.pointerId;
                  e.currentTarget.setPointerCapture(e.pointerId);
                  touchInputsRef.current.throttle = computePedalRatio(e);
                }}
                onPointerMove={(e) => {
                  if (gasPointerIdRef.current !== e.pointerId) return;
                  touchInputsRef.current.throttle = computePedalRatio(e);
                }}
                onPointerUp={(e) => {
                  if (gasPointerIdRef.current !== e.pointerId) return;
                  gasPointerIdRef.current = null;
                  touchInputsRef.current.throttle = 0;
                }}
                onPointerCancel={() => {
                  gasPointerIdRef.current = null;
                  touchInputsRef.current.throttle = 0;
                }}
                className={`w-16 h-36 rounded-2xl border-2 relative overflow-hidden backdrop-blur-md flex flex-col justify-between p-2 transition-transform shadow-2xl ${
                  throttleUiPct > 0
                    ? 'border-emerald-400 scale-95 bg-slate-950/90'
                    : 'border-stone-600/80 bg-slate-950/78'
                }`}
              >
                <div
                  className="inset-x-0 bottom-0 absolute bg-gradient-to-t from-emerald-600/75 to-amber-400/45 pointer-events-none transition-all duration-75"
                  style={{ height: `${throttleUiPct}%` }}
                />
                <div className="relative z-10 text-[10px] font-mono-num text-emerald-300 text-center font-bold">
                  {throttleUiPct > 0 ? `${throttleUiPct}%` : ''}
                </div>
                <div className="relative z-10 space-y-1.5 my-auto px-1">
                  <div className="h-1 rounded bg-stone-500/60" />
                  <div className="h-1 rounded bg-stone-500/60" />
                  <div className="h-1 rounded bg-stone-500/60" />
                  <div className="h-1 rounded bg-stone-500/60" />
                </div>
                <div className="relative z-10 text-[11px] font-bold text-stone-100 text-center">
                  وقود
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Clean Cinematic UI Toggle Pill */}
      {activeModal === 'none' && (
        <button
          type="button"
          onClick={() => setCleanCinematicHud((v) => !v)}
          className="fixed bottom-2 left-2 z-30 px-2.5 py-1 rounded-full bg-slate-950/60 hover:bg-slate-950/90 border border-stone-700/60 text-[10px] text-stone-300 flex items-center gap-1"
          title="إخفاء/إظهار الواجهة للرؤية السينمائية"
        >
          {cleanCinematicHud ? (
            <>
              <Eye className="w-3 h-3 text-amber-400" />
              إظهار أدوات القيادة
            </>
          ) : (
            <>
              <EyeOff className="w-3 h-3 text-stone-400" />
              سينمائي
            </>
          )}
        </button>
      )}

      {/* Optional Developer Diagnostics Strip (Hidden by default) */}
      {hud.showDeveloperDiagnostics && telemetry && (
        <div
          dir="ltr"
          className="fixed bottom-2 right-2 z-30 px-3 py-1 rounded-lg bg-slate-950/85 border border-amber-500/40 text-[10px] font-mono-num text-amber-300 pointer-events-none"
        >
          FPS: {fpsCount} | Surface: {telemetry.surface} | Pitch:{' '}
          {telemetry.pitchDeg}° | WheelDeg:{' '}
          {Math.round(telemetry.steeringWheelAngleDeg)}° | Dirt:{' '}
          {Math.round(telemetry.damage.dirtMudLevel * 100)}%
        </div>
      )}

      {/* PAUSE MODAL */}
      {activeModal === 'pause' && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-stone-800 p-6 space-y-4 shadow-2xl text-center">
            <div className="text-xs font-bold text-amber-400">
              مَسَالِك — دروب اليمن | MASALIK v1.0.0 Offline
            </div>
            <h2 className="text-xl font-black text-stone-100">
              اللعبة متوقفة مؤقتًا
            </h2>
            <p className="text-xs text-stone-400">
              {rankInfo.rankTitleAr} · الرصيد:{' '}
              {saveState.masalikCoins.toLocaleString()} ر.ي
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal('none')}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                استئناف القيادة
              </button>

              <button
                type="button"
                onClick={() => setActiveModal('control_studio')}
                className="w-full py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Sliders className="w-4 h-4" />
                تعديل أماكن وأحجام أدوات القيادة (Control Studio)
              </button>

              <button
                type="button"
                onClick={() => {
                  setPreviewVehicleId(saveState.selectedVehicleId);
                  setActiveModal('garage');
                }}
                className="w-full py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Car className="w-4 h-4 text-amber-400" />
                معرض المركبات والترقيات الميكانيكية (10 مركبات)
              </button>

              <button
                type="button"
                onClick={() => setActiveModal('missions')}
                className="w-full py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Flag className="w-4 h-4 text-emerald-400" />
                المهمات وفصول القصة ({ALL_OFFLINE_MISSIONS.length} مهمة)
              </button>

              <button
                type="button"
                onClick={() => setActiveModal('settings')}
                className="w-full py-2.5 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4 text-sky-400" />
                الإعدادات، الميكسر الصوتي والحفظ الاحتياطي
              </button>
            </div>

            <div className="pt-3 border-t border-stone-800 text-[11px] text-stone-500">
              برمجة وتطوير معتز العلقمي – تعز – اليمن – 2026م
            </div>
          </div>
        </div>
      )}

      {/* PHOTO MODE OVERLAY */}
      {activeModal === 'photo' && (
        <div className="fixed inset-0 z-40 pointer-events-none flex flex-col justify-between p-5">
          <div className="pointer-events-auto flex items-center justify-between bg-slate-950/80 border border-stone-800 backdrop-blur-md px-5 py-3 rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-amber-300">
                استوديو التصوير الفوتوغرافي — MASALIK Photo Mode
              </h3>
              <p className="text-xs text-stone-400">
                اختر الفلتر السينمائي وزاوية العدسة والتقط صورة تذكارية في جبال اليمن
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!rendererRef.current) return;
                  const dataUrl =
                    rendererRef.current.domElement.toDataURL('image/png');
                  const a = document.createElement('a');
                  a.href = dataUrl;
                  a.download = `masalik-yemen-${Date.now()}.png`;
                  a.click();
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                حفظ لقطة الشاشة (PNG)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhotoFilter('none');
                  setActiveModal('none');
                }}
                className="px-4 py-2 rounded-xl bg-stone-800 text-stone-200 text-xs font-bold"
              >
                عودة للقيادة
              </button>
            </div>
          </div>

          <div className="pointer-events-auto self-center bg-slate-950/85 border border-stone-800 backdrop-blur-md px-5 py-3 rounded-2xl flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              {(
                [
                  ['none', 'طبيعي'],
                  ['golden', 'غروب تعز الذهبي'],
                  ['warm', 'سينمائي دافئ'],
                  ['dramatic', 'ضباب إب الدرامي'],
                ] as const
              ).map(([f, label]) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setPhotoFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    photoFilter === f
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-stone-900 text-stone-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-400">العدسة (FOV):</span>
              <input
                type="range"
                min={35}
                max={85}
                value={photoFov}
                onChange={(e) => {
                  const fov = parseInt(e.target.value, 10);
                  setPhotoFov(fov);
                  if (cameraRef.current) {
                    cameraRef.current.fov = fov;
                    cameraRef.current.updateProjectionMatrix();
                  }
                }}
                className="w-28 accent-amber-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* CONTROL STUDIO MODAL */}
      {activeModal === 'control_studio' && (
        <ControlStudioModal
          hudSettings={saveState.hudSettings}
          onSaveHudSettings={(updatedHud) => {
            updateAndSave((prev) => ({
              ...prev,
              hudSettings: updatedHud,
            }));
          }}
          onClose={() => setActiveModal('none')}
        />
      )}

      {/* GARAGE & 10-VEHICLE FLEET SHOWROOM */}
      {activeModal === 'garage' && (
        <GarageShowroomModal
          saveState={saveState}
          previewVehicleId={previewVehicleId}
          onSelectPreviewVehicle={(vid) => {
            audioRef.current?.playUiClick();
            setPreviewVehicleId(vid);
            const custom = saveState.customizations[vid];
            vehicleVisualsRef.current?.rebuildForVehicle(vid, custom);
          }}
          onConfirmSelectVehicle={(vid) => {
            audioRef.current?.playUiClick(1.2);
            const custom = saveState.customizations[vid];
            physicsRef.current?.selectVehicle(vid, custom);
            vehicleVisualsRef.current?.rebuildForVehicle(vid, custom);
            updateAndSave((prev) => ({
              ...prev,
              selectedVehicleId: vid,
            }));
          }}
          onUnlockVehicle={(vid, price) => {
            audioRef.current?.playUiClick(1.3);
            updateAndSave((prev) => {
              if (prev.masalikCoins < price) return prev;
              return {
                ...prev,
                masalikCoins: prev.masalikCoins - price,
                selectedVehicleId: vid,
                unlockedVehicles: Array.from(
                  new Set([...prev.unlockedVehicles, vid])
                ),
              };
            });
            const custom = saveState.customizations[vid];
            physicsRef.current?.selectVehicle(vid, custom);
            vehicleVisualsRef.current?.rebuildForVehicle(vid, custom);
          }}
          onUpdateCustomization={(vid, custom) => {
            vehicleVisualsRef.current?.rebuildForVehicle(vid, custom);
            if (vid === saveState.selectedVehicleId && physicsRef.current) {
              physicsRef.current.customization = { ...custom };
            }
            updateAndSave((prev) => ({
              ...prev,
              customizations: {
                ...prev.customizations,
                [vid]: custom,
              },
            }));
          }}
          onUpgradeMechanical={(vid, part, cost) => {
            audioRef.current?.playUiClick(1.25);
            updateAndSave((prev) => {
              const curCustom = prev.customizations[vid];
              if (!curCustom || prev.masalikCoins < cost) return prev;
              const curLvl = curCustom[part] || 1;
              if (curLvl >= 5) return prev;
              const nextCustom = {
                ...curCustom,
                [part]: curLvl + 1,
              };
              if (vid === prev.selectedVehicleId && physicsRef.current) {
                physicsRef.current.customization = nextCustom;
              }
              return {
                ...prev,
                masalikCoins: prev.masalikCoins - cost,
                driverXp: prev.driverXp + 65,
                customizations: {
                  ...prev.customizations,
                  [vid]: nextCustom,
                },
              };
            });
          }}
          onRepairVehicle={(vid, cost) => {
            audioRef.current?.playUiClick(1.2);
            if (vid === saveState.selectedVehicleId) {
              physicsRef.current?.repairAllDamage();
            }
            updateAndSave((prev) => ({
              ...prev,
              masalikCoins: Math.max(0, prev.masalikCoins - cost),
              damageByVehicle: {
                ...prev.damageByVehicle,
                [vid]: {
                  ...prev.damageByVehicle[vid],
                  engineHealthPct: 100,
                  tiresHealthPct: 100,
                  suspensionHealthPct: 100,
                  bodyHealthPct: 100,
                },
              },
            }));
          }}
          onRefuelVehicle={(vid, cost) => {
            audioRef.current?.playUiClick(1.2);
            if (vid === saveState.selectedVehicleId) {
              physicsRef.current?.refuelTank();
            }
            updateAndSave((prev) => ({
              ...prev,
              masalikCoins: Math.max(0, prev.masalikCoins - cost),
              fuelByVehicle: {
                ...prev.fuelByVehicle,
                [vid]: VEHICLE_SPECS[vid].fuelTankLiters,
              },
            }));
          }}
          onWashVehicle={(vid, cost) => {
            audioRef.current?.playUiClick(1.2);
            if (vid === saveState.selectedVehicleId) {
              physicsRef.current?.washVehicle();
            }
            updateAndSave((prev) => ({
              ...prev,
              masalikCoins: Math.max(0, prev.masalikCoins - cost),
              damageByVehicle: {
                ...prev.damageByVehicle,
                [vid]: {
                  ...prev.damageByVehicle[vid],
                  dirtMudLevel: 0,
                },
              },
            }));
          }}
          onOrbitDelta={(deltaRad) => {
            showroomOrbitRadRef.current += deltaRad;
          }}
          onClose={() => {
            const activeVid = saveStateRef.current.selectedVehicleId;
            const custom = saveStateRef.current.customizations[activeVid];
            vehicleVisualsRef.current?.rebuildForVehicle(activeVid, custom);
            setActiveModal('none');
          }}
        />
      )}

      {/* MISSIONS & STORY MODAL */}
      {activeModal === 'missions' && (
        <MissionsAndStoryModal
          saveState={saveState}
          onStartMission={handleStartMission}
          onClose={() => setActiveModal('none')}
        />
      )}

      {/* SETTINGS & SAVE MODAL */}
      {activeModal === 'settings' && (
        <SettingsAndSaveModal
          saveState={saveState}
          onUpdateSaveState={(next) => {
            PersistenceManager.save(next);
            setSaveState(next);
          }}
          onOpenControlStudio={() => setActiveModal('control_studio')}
          deferredInstallPrompt={deferredPrompt}
          onTriggerPwaInstall={async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            setDeferredPrompt(null);
          }}
          onClose={() => setActiveModal('none')}
        />
      )}
    </div>
  );
}
