import * as THREE from 'three';
import {
  mountainRoad,
  TOTAL_CHUNKS_COUNT,
  TOTAL_ROAD_LENGTH_M,
  WORLD_POIS,
} from './roadSpline';
import {
  AutomaticShifterState,
  ControlsInput,
  DamageState,
  DrivetrainMode,
  DrivingRealismMode,
  ElectronicAssistsState,
  SurfaceType,
  VehicleBenchmarkResult,
  VehicleCustomization,
  VehicleId,
  VehicleSpec,
  VehicleTelemetry,
  WeatherPreset,
  WheelTelemetry,
} from './types';
import {
  ALL_VEHICLE_IDS,
  getDefaultCustomizations,
  TIRE_COMPOUND_GRIP,
  VEHICLE_SPECS,
} from './vehicleFleet';

const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _targetQuat = new THREE.Quaternion();
const _rotMatrix = new THREE.Matrix4();

export class MasalikVehicleDynamics {
  public vehicleId: VehicleId = 'shahiq';
  public spec: VehicleSpec = VEHICLE_SPECS.shahiq;
  public customization: VehicleCustomization = getDefaultCustomizations().shahiq;
  public realismMode: DrivingRealismMode = 'sport';
  public weather: WeatherPreset = 'clear';
  public wheelRotationRangeDeg = 270;

  public position = new THREE.Vector3();
  public velocity = new THREE.Vector3();
  public quaternion = new THREE.Quaternion();

  private headingRad = 0;
  private forwardSpeedMs = 0;
  private lateralSpeedMs = 0;
  private currentSteerRad = 0;
  private currentSteerInputNorm = 0;

  public chassisPitchRad = 0;
  public chassisRollRad = 0;

  // Drivetrain & Gearbox State
  public transmissionMode: 'auto' | 'manual' = 'auto';
  public autoShifter: AutomaticShifterState = 'D';
  public manualGearIndex = 1; // -1 = R, 0 = N, 1..N = forward
  public drivetrainMode: DrivetrainMode = '4H';
  public diffLockActive = false;
  public engineRunning = true;
  public headlightsOn = false;
  public wipersOn = false;
  public leftIndicatorOn = false;
  public rightIndicatorOn = false;

  // Optional AI Rival state for Race Missions
  public aiRivalActive = false;
  public aiRivalDistanceM = 0;
  public aiRivalBaseSpeedMs = 18.5;

  public assists: ElectronicAssistsState = {
    absEnabled: true,
    tcsEnabled: true,
    escEnabled: true,
    hdcEnabled: false,
  };

  // Fuel & Damage State
  public fuelLiters = 85;
  public damage: DamageState = {
    engineHealthPct: 100,
    tiresHealthPct: 100,
    suspensionHealthPct: 100,
    bodyHealthPct: 100,
    cargoIntegrityPct: 100,
    steeringPullBias: 0,
    dirtMudLevel: 0,
  };

  private distanceAlongRoadM = 20;
  private totalDistanceDrivenM = 0;
  private lateralOffsetM = 0;

  private wheelRotations: [number, number, number, number] = [0, 0, 0, 0];
  private prevCompressions: [number, number, number, number] = [0.38, 0.38, 0.38, 0.38];
  private wheelsTelemetry: [WheelTelemetry, WheelTelemetry, WheelTelemetry, WheelTelemetry];

  constructor() {
    this.wheelsTelemetry = [
      this.createEmptyWheel('FL', 'أمامية يسرى'),
      this.createEmptyWheel('FR', 'أمامية يمنى'),
      this.createEmptyWheel('RL', 'خلفية يسرى'),
      this.createEmptyWheel('RR', 'خلفية يمنى'),
    ];
    this.selectVehicle('shahiq', getDefaultCustomizations().shahiq);
    this.resetToRoad(20);
  }

  private createEmptyWheel(
    id: 'FL' | 'FR' | 'RL' | 'RR',
    labelAr: string
  ): WheelTelemetry {
    return {
      id,
      labelAr,
      grounded: true,
      compressionRatio: 0.38,
      springForceN: 4500,
      surface: 'asphalt',
      slipRatio: 0,
      worldX: 0,
      worldY: 0,
      worldZ: 0,
      steerAngleRad: 0,
      rotationRad: 0,
    };
  }

  public selectVehicle(
    id: VehicleId,
    custom?: VehicleCustomization,
    keepFuelAndDamage = false
  ): void {
    this.vehicleId = id;
    this.spec = VEHICLE_SPECS[id];
    this.customization = custom
      ? { ...custom }
      : { ...getDefaultCustomizations()[id] };
    this.drivetrainMode = this.spec.defaultDrivetrain;
    this.autoShifter = 'D';
    this.manualGearIndex = 1;

    if (!keepFuelAndDamage) {
      this.fuelLiters = this.spec.fuelTankLiters;
      this.repairAllDamage();
    } else {
      this.fuelLiters = Math.min(this.fuelLiters, this.spec.fuelTankLiters);
    }
  }

  public configureAiRival(active: boolean, startDistM = 0, baseSpeedMs = 18.5): void {
    this.aiRivalActive = active;
    this.aiRivalDistanceM = startDistM + 10;
    this.aiRivalBaseSpeedMs = baseSpeedMs;
  }

  public refuelTank(): void {
    this.fuelLiters = this.spec.fuelTankLiters;
    this.engineRunning = true;
  }

  public washVehicle(): void {
    this.damage.dirtMudLevel = 0;
  }

  public repairAllDamage(): void {
    this.damage = {
      engineHealthPct: 100,
      tiresHealthPct: 100,
      suspensionHealthPct: 100,
      bodyHealthPct: 100,
      cargoIntegrityPct: 100,
      steeringPullBias: 0,
      dirtMudLevel: 0,
    };
  }

  public setAutoShifter(state: AutomaticShifterState): void {
    this.transmissionMode = 'auto';
    this.autoShifter = state;
  }

  public shiftManualGear(delta: 1 | -1): void {
    if (this.transmissionMode !== 'manual') {
      this.transmissionMode = 'manual';
    }
    this.manualGearIndex = THREE.MathUtils.clamp(
      this.manualGearIndex + delta,
      -1,
      this.spec.forwardGearsCount
    );
  }

  public cycleDrivetrainMode(): DrivetrainMode {
    const list = this.spec.supportedDrivetrains;
    const idx = list.indexOf(this.drivetrainMode);
    this.drivetrainMode = list[(idx + 1) % list.length];
    return this.drivetrainMode;
  }

  public resetToRoad(targetDistanceM?: number): void {
    const dist =
      targetDistanceM !== undefined
        ? THREE.MathUtils.clamp(targetDistanceM, 14, TOTAL_ROAD_LENGTH_M - 30)
        : THREE.MathUtils.clamp(this.distanceAlongRoadM, 14, TOTAL_ROAD_LENGTH_M - 30);

    const sample = mountainRoad.getSampleAtDistance(dist);
    this.distanceAlongRoadM = dist;

    this.position.copy(sample.position);
    this.position.y += 0.06;
    this.velocity.set(0, 0, 0);
    this.forwardSpeedMs = 0;
    this.lateralSpeedMs = 0;
    this.currentSteerRad = 0;
    this.currentSteerInputNorm = 0;
    this.chassisPitchRad = 0;
    this.chassisRollRad = 0;
    this.autoShifter = 'D';
    if (this.manualGearIndex <= 0) {
      this.manualGearIndex = 1;
    }

    this.headingRad = Math.atan2(sample.tangent.x, -sample.tangent.z);
    this.alignQuaternionToGround(sample.normal, 1.0);
  }

  private alignQuaternionToGround(groundNormal: THREE.Vector3, slerpFactor: number): void {
    _up.copy(groundNormal).normalize();
    _forward.set(Math.sin(this.headingRad), 0, -Math.cos(this.headingRad)).normalize();
    _right.crossVectors(_forward, _up).normalize();
    _forward.crossVectors(_up, _right).normalize();

    _rotMatrix.makeBasis(_right, _up, _forward.clone().negate());
    _targetQuat.setFromRotationMatrix(_rotMatrix);

    if (slerpFactor >= 1.0) {
      this.quaternion.copy(_targetQuat);
    } else {
      this.quaternion.slerp(_targetQuat, slerpFactor);
    }
  }

  private getEffectiveMassKg(): { totalMassKg: number; cargoMassKg: number } {
    const cargoMassKg = Math.round(
      this.spec.maxCargoKg * (this.customization.cargoLoadPct / 100)
    );
    return {
      totalMassKg: this.spec.baseMassKg + cargoMassKg,
      cargoMassKg,
    };
  }

  private getSurfaceGrip(surface: SurfaceType): number {
    const compound = TIRE_COMPOUND_GRIP[this.customization.tireType];
    let mu = compound[surface] ?? 0.85;

    if (this.weather === 'light_rain') {
      mu *= surface === 'mud' ? 0.78 : 0.88;
    } else if (this.weather === 'heavy_rain') {
      mu *= surface === 'mud' ? 0.65 : 0.76;
    } else if (this.weather === 'sandstorm') {
      mu *= surface === 'sand' ? 0.86 : 0.9;
    } else if (this.weather === 'mountain_fog') {
      mu *= 0.95;
    }

    const tireConditionFactor = 0.6 + 0.4 * (this.damage.tiresHealthPct / 100);
    mu *= tireConditionFactor;

    if (this.realismMode === 'arcade') {
      mu = Math.max(0.88, mu * 1.18);
    } else if (this.realismMode === 'simulation') {
      mu *= 0.96;
    }

    return mu;
  }

  public step(rawDt: number, input: ControlsInput): VehicleTelemetry {
    const dt = Math.min(Math.max(rawDt, 0.001), 0.05);
    const { totalMassKg, cargoMassKg } = this.getEffectiveMassKg();

    // Mechanical Upgrade Multipliers (Levels 1..5)
    const engLvl = this.customization.engineUpgradeLevel || 1;
    const transLvl = this.customization.transmissionUpgradeLevel || 1;
    const suspLvl = this.customization.suspensionUpgradeLevel || 1;
    const brakeLvl = this.customization.brakeUpgradeLevel || 1;

    const engineUpgradeMult = 1.0 + (engLvl - 1) * 0.07;
    const transUpgradeMult = 1.0 + (transLvl - 1) * 0.04;
    const suspUpgradeMult = 1.0 + (suspLvl - 1) * 0.06;
    const brakeUpgradeMult = 1.0 + (brakeLvl - 1) * 0.065;

    if (this.fuelLiters <= 0.01 && this.realismMode === 'simulation') {
      this.engineRunning = false;
    }

    // Automatic transmission intelligent engagement: never get stuck in P or N when pressing gas!
    if (this.transmissionMode === 'auto') {
      if (input.throttle > 0.08 && (this.autoShifter === 'P' || this.autoShifter === 'N')) {
        this.autoShifter = 'D';
      }
      if (!this.engineRunning && input.throttle > 0.08 && this.fuelLiters > 0.1) {
        this.engineRunning = true;
      }
    } else {
      if (input.throttle > 0.15 && this.manualGearIndex === 0 && Math.abs(this.forwardSpeedMs) < 1.0) {
        this.manualGearIndex = 1;
      }
    }

    // 1. Speed-Dependent Smart Steering Response (Section 4)
    const speedKmhAbs = Math.abs(this.forwardSpeedMs) * 3.6;
    // Full steering lock at low speeds (< 22 km/h), progressively stabilized at higher speeds
    const speedDependentMaxSteer =
      this.spec.maxSteerAngleRad *
      THREE.MathUtils.clamp(1.0 - Math.max(0, speedKmhAbs - 20) / 150, 0.28, 1.0);

    const pullBias =
      this.realismMode === 'arcade' ? 0 : this.damage.steeringPullBias;
    const steeringInput = THREE.MathUtils.clamp(input.steer + pullBias, -1, 1);
    this.currentSteerInputNorm = THREE.MathUtils.damp(
      this.currentSteerInputNorm,
      steeringInput,
      14,
      dt
    );

    const targetSteeringAngle = this.currentSteerInputNorm * speedDependentMaxSteer;
    this.currentSteerRad = THREE.MathUtils.damp(
      this.currentSteerRad,
      targetSteeringAngle,
      this.spec.steerSpeedRadPerSec * 2.8,
      dt
    );

    // 2. Query ground at vehicle center
    const centerQuery = mountainRoad.queryGroundAtPoint(
      this.position.x,
      this.position.z,
      this.distanceAlongRoadM
    );
    this.distanceAlongRoadM = centerQuery.closestSample.distanceM;
    this.lateralOffsetM = centerQuery.lateralOffsetM;

    // 3. Raycast 4 independent wheels
    const halfTrack = this.spec.trackWidthM * 0.5;
    const halfBase = this.spec.wheelbaseM * 0.5;
    const wheelLocalOffsets: [number, number][] = [
      [-halfTrack, -halfBase],
      [halfTrack, -halfBase],
      [-halfTrack, halfBase],
      [halfTrack, halfBase],
    ];

    let totalGrip = 0;
    let groundedCount = 0;
    const sinH = Math.sin(this.headingRad);
    const cosH = Math.cos(this.headingRad);
    const restLen =
      this.spec.suspensionRestLengthM + this.customization.rideHeightOffsetM;

    for (let i = 0; i < 4; i++) {
      const [lx, lz] = wheelLocalOffsets[i];
      const wx = this.position.x + lx * cosH - lz * sinH;
      const wz = this.position.z + lx * sinH + lz * cosH;

      const wQuery = mountainRoad.queryGroundAtPoint(wx, wz, this.distanceAlongRoadM);
      const wheelMountY = this.position.y + restLen;
      const rayLength = wheelMountY - wQuery.groundHeightY;
      const maxLen = restLen + this.spec.suspensionMaxTravelM;
      const grounded = rayLength <= maxLen + 0.18;

      let compression = 0;
      if (grounded) {
        groundedCount++;
        compression = THREE.MathUtils.clamp(
          1.0 - (rayLength - this.spec.wheelRadiusM) / restLen,
          0.08,
          1.0
        );
      }

      if (wQuery.surface !== 'asphalt' && Math.abs(this.forwardSpeedMs) > 0.5) {
        const amp =
          wQuery.surface === 'rock'
            ? 0.14
            : wQuery.surface === 'mud' || wQuery.surface === 'gravel'
            ? 0.09
            : 0.06;
        const microWave =
          Math.sin(wx * 3.1 + wz * 2.7 + this.totalDistanceDrivenM * 4.5) * amp;
        compression = THREE.MathUtils.clamp(compression + microWave, 0.05, 1.0);
      }

      const compVelocity = (compression - this.prevCompressions[i]) / dt;
      this.prevCompressions[i] = compression;

      const suspHealthFactor =
        (0.65 + 0.35 * (this.damage.suspensionHealthPct / 100)) * suspUpgradeMult;
      const springForce = Math.max(
        0,
        (compression * restLen * this.spec.suspensionStiffness +
          compVelocity * this.spec.suspensionDamping) *
          suspHealthFactor
      );

      const mu = this.getSurfaceGrip(wQuery.surface);
      totalGrip += mu;

      const isFront = i < 2;
      const wheelSteer = isFront ? this.currentSteerRad : 0;
      this.wheelRotations[i] -= (this.forwardSpeedMs / this.spec.wheelRadiusM) * dt;

      const slipRatio = Math.min(
        1,
        (Math.abs(this.lateralSpeedMs) * 0.32 +
          (input.handbrake && !isFront ? 0.65 : 0) +
          (wQuery.surface !== 'asphalt' ? Math.abs(input.throttle) * 0.2 : 0.04)) /
          Math.max(0.4, mu)
      );

      this.wheelsTelemetry[i] = {
        ...this.wheelsTelemetry[i],
        grounded,
        compressionRatio: compression,
        springForceN: Math.round(springForce),
        surface: wQuery.surface,
        slipRatio,
        worldX: wx,
        worldY: wQuery.groundHeightY,
        worldZ: wz,
        steerAngleRad: wheelSteer,
        rotationRad: this.wheelRotations[i],
      };
    }

    const avgGrip = totalGrip / 4;

    // 4. Drivetrain Efficiency & Low-Range (4L) Multiplier
    const isLowRange = this.drivetrainMode === '4L';
    const isAllWheel =
      this.drivetrainMode === '4H' ||
      this.drivetrainMode === '4L' ||
      this.drivetrainMode === 'AWD';

    let drivetrainTractionBonus = isAllWheel ? 1.08 : 0.86;
    if (this.diffLockActive && centerQuery.surface !== 'asphalt') {
      drivetrainTractionBonus *= 1.15;
    }

    const gearPresetRatio =
      this.customization.gearPreset === 'crawler'
        ? 1.18
        : this.customization.gearPreset === 'highway'
        ? 0.88
        : 1.0;

    const lowRangeTorqueMult = isLowRange ? 1.65 : 1.0;
    const maxTopSpeedMs =
      ((this.spec.maxPowerHp * 0.145 * engineUpgradeMult * transUpgradeMult) /
        (isLowRange ? 2.1 : gearPresetRatio)) *
      (0.7 + 0.3 * (this.damage.engineHealthPct / 100));

    // 5. Longitudinal Forces
    const vehicleForwardX = Math.sin(this.headingRad);
    const vehicleForwardZ = -Math.cos(this.headingRad);
    const roadAlignment =
      vehicleForwardX * centerQuery.closestSample.tangent.x +
      vehicleForwardZ * centerQuery.closestSample.tangent.z;

    const effectiveGradeSin =
      (centerQuery.closestSample.gradePct / 100) * roadAlignment;
    const slopeGravityForceN = -totalMassKg * 9.81 * effectiveGradeSin;

    let driveForceN = 0;
    let brakingForceN = 0;

    const baseMaxEngineForceN =
      this.spec.maxEngineTorqueNm *
      39.5 *
      engineUpgradeMult *
      transUpgradeMult *
      lowRangeTorqueMult *
      gearPresetRatio;

    const clutchEngagement = 1.0 - THREE.MathUtils.clamp(input.clutch ?? 0, 0, 1);

    const isReverseSelected =
      (this.transmissionMode === 'auto' && this.autoShifter === 'R') ||
      (this.transmissionMode === 'manual' && this.manualGearIndex === -1);
    const isNeutralOrPark =
      (this.transmissionMode === 'auto' &&
        (this.autoShifter === 'N' || this.autoShifter === 'P')) ||
      (this.transmissionMode === 'manual' && this.manualGearIndex === 0);

    if (this.engineRunning && input.throttle > 0.01 && !isNeutralOrPark) {
      if (isReverseSelected) {
        const revSpeedFactor = Math.max(
          0,
          1.0 - Math.abs(Math.min(0, this.forwardSpeedMs)) / 12.5
        );
        driveForceN -=
          input.throttle *
          this.spec.maxReverseForceN *
          engineUpgradeMult *
          revSpeedFactor *
          avgGrip *
          clutchEngagement;
      } else {
        const topSpeedFactor = Math.max(
          0,
          1.0 - Math.max(0, this.forwardSpeedMs) / maxTopSpeedMs
        );
        const tcsFactor =
          this.assists.tcsEnabled && avgGrip < 0.7 ? 0.92 : 1.0;
        const engineHealthFactor = 0.55 + 0.45 * (this.damage.engineHealthPct / 100);

        driveForceN =
          input.throttle *
          baseMaxEngineForceN *
          topSpeedFactor *
          avgGrip *
          drivetrainTractionBonus *
          tcsFactor *
          engineHealthFactor *
          clutchEngagement;
      }
    }

    // Engine Braking when throttle is lifted
    if (input.throttle < 0.05 && Math.abs(this.forwardSpeedMs) > 1.2) {
      const engineBrakeMult = isLowRange ? 3200 : 1150;
      brakingForceN -= Math.sign(this.forwardSpeedMs) * engineBrakeMult;
    }

    // Hill Descent Control (HDC)
    if (
      this.assists.hdcEnabled &&
      effectiveGradeSin < -0.04 &&
      input.throttle < 0.05 &&
      this.forwardSpeedMs > 4.2
    ) {
      brakingForceN -= (this.forwardSpeedMs - 4.2) * 4800;
    }

    // Brake Pedal Logic (Section 6: decelerates while moving forward; only reverses once stopped in Auto)
    if (input.brake > 0.01) {
      if (this.forwardSpeedMs > 0.65) {
        const absEfficiency = this.assists.absEnabled ? 1.05 : 0.88;
        brakingForceN -=
          input.brake *
          this.spec.maxBrakeForceN *
          brakeUpgradeMult *
          avgGrip *
          absEfficiency;
      } else if (this.forwardSpeedMs < -0.65 && isReverseSelected) {
        // If reversing and pressing brake, stop the reverse motion
        brakingForceN +=
          input.brake * this.spec.maxBrakeForceN * brakeUpgradeMult * avgGrip;
      } else if (
        this.engineRunning &&
        this.transmissionMode === 'auto' &&
        input.throttle < 0.05
      ) {
        // Smooth auto-reverse when stationary and holding brake pedal
        const revSpeedFactor = Math.max(
          0,
          1.0 - Math.abs(Math.min(0, this.forwardSpeedMs)) / 11.5
        );
        driveForceN -=
          input.brake * this.spec.maxReverseForceN * revSpeedFactor * avgGrip;
      } else {
        brakingForceN -=
          Math.sign(this.forwardSpeedMs) *
          input.brake *
          this.spec.maxBrakeForceN *
          brakeUpgradeMult;
      }
    }

    const isParkHold =
      this.transmissionMode === 'auto' && this.autoShifter === 'P';
    if (input.handbrake || isParkHold) {
      const dirSign = Math.sign(this.forwardSpeedMs);
      brakingForceN -= dirSign * this.spec.handbrakeForceN * avgGrip;
    }

    const aeroDragN =
      -Math.sign(this.forwardSpeedMs) *
      this.spec.dragCoefficient *
      this.forwardSpeedMs *
      this.forwardSpeedMs;

    const surfaceRollingMult: Record<SurfaceType, number> = {
      asphalt: 1.0,
      dirt: 1.65,
      gravel: 1.85,
      sand: this.customization.tireType === 'sand_dune' ? 1.55 : 2.65,
      mud: 2.5,
      rock: 1.9,
    };

    const rollingResN =
      -Math.sign(this.forwardSpeedMs) *
      this.spec.rollingResistance *
      surfaceRollingMult[centerQuery.surface];

    const netLongitudinalForceN =
      driveForceN + brakingForceN + slopeGravityForceN + aeroDragN + rollingResN;

    const longitudinalAccel = netLongitudinalForceN / totalMassKg;
    this.forwardSpeedMs += longitudinalAccel * dt;

    if (
      input.throttle < 0.02 &&
      (input.brake > 0.2 || input.handbrake || isParkHold) &&
      Math.abs(this.forwardSpeedMs) < 0.5
    ) {
      this.forwardSpeedMs = 0;
    }

    // 6. Turning Kinematics & Lateral Stability (ESC)
    if (Math.abs(this.forwardSpeedMs) > 0.08) {
      const turnRadiusInv = Math.tan(this.currentSteerRad) / this.spec.wheelbaseM;
      const gripTurnEfficiency = THREE.MathUtils.clamp(avgGrip * 0.95, 0.45, 1.08);
      const yawRate = this.forwardSpeedMs * turnRadiusInv * gripTurnEfficiency;
      this.headingRad -= yawRate * dt;

      const centrifugal = this.forwardSpeedMs * yawRate;
      const escDamping = this.assists.escEnabled ? 1.38 : 0.85;
      const slipFactor = input.handbrake ? 0.42 : (1.15 - avgGrip) * 0.22;
      this.lateralSpeedMs = THREE.MathUtils.damp(
        this.lateralSpeedMs,
        centrifugal * slipFactor,
        6.8 * avgGrip * escDamping,
        dt
      );
    } else {
      this.lateralSpeedMs = THREE.MathUtils.damp(this.lateralSpeedMs, 0, 10, dt);
    }

    // 7. Integrate Position & Natural World Boundary Protection (Section 10 & 15)
    const vx =
      Math.sin(this.headingRad) * this.forwardSpeedMs +
      Math.cos(this.headingRad) * this.lateralSpeedMs;
    const vz =
      -Math.cos(this.headingRad) * this.forwardSpeedMs +
      Math.sin(this.headingRad) * this.lateralSpeedMs;

    this.position.x += vx * dt;
    this.position.z += vz * dt;
    this.totalDistanceDrivenM += Math.hypot(vx * dt, vz * dt);

    const updatedQuery = mountainRoad.queryGroundAtPoint(
      this.position.x,
      this.position.z,
      this.distanceAlongRoadM
    );
    this.distanceAlongRoadM = updatedQuery.closestSample.distanceM;
    this.lateralOffsetM = updatedQuery.lateralOffsetM;

    const maxSafeLateral = updatedQuery.closestSample.widthM * 0.5 + 2.2;
    if (Math.abs(this.lateralOffsetM) > maxSafeLateral) {
      const sign = Math.sign(this.lateralOffsetM);
      const excess = Math.abs(this.lateralOffsetM) - maxSafeLateral;
      this.position.x -= updatedQuery.closestSample.binormal.x * sign * excess * 0.88;
      this.position.z -= updatedQuery.closestSample.binormal.z * sign * excess * 0.88;

      const impactSpeed = Math.abs(this.forwardSpeedMs);
      this.forwardSpeedMs *= 0.82;
      this.lateralSpeedMs = 0;

      if (impactSpeed > 4.5) {
        const dmgScale = this.realismMode === 'arcade' ? 0.35 : 1.0;
        const hitLoss = dt * impactSpeed * 1.4 * dmgScale;
        this.damage.bodyHealthPct = Math.max(20, this.damage.bodyHealthPct - hitLoss);
        this.damage.engineHealthPct = Math.max(
          35,
          this.damage.engineHealthPct - hitLoss * 0.5
        );
        this.damage.suspensionHealthPct = Math.max(
          30,
          this.damage.suspensionHealthPct - hitLoss * 0.7
        );
        if (cargoMassKg > 0) {
          this.damage.cargoIntegrityPct = Math.max(
            0,
            this.damage.cargoIntegrityPct - hitLoss * 1.2
          );
        }
        this.damage.steeringPullBias = THREE.MathUtils.clamp(
          ((100 - this.damage.suspensionHealthPct) / 100) * 0.08 * sign,
          -0.08,
          0.08
        );
      }
    }

    if (
      updatedQuery.surface === 'rock' &&
      speedKmhAbs > 52 &&
      this.spec.suspensionRestLengthM < 0.52
    ) {
      this.damage.suspensionHealthPct = Math.max(
        35,
        this.damage.suspensionHealthPct - dt * 2.5
      );
      this.damage.tiresHealthPct = Math.max(
        40,
        this.damage.tiresHealthPct - dt * 1.8
      );
    }

    // Vertical terrain following (never falls through terrain)
    const targetY = updatedQuery.groundHeightY;
    this.position.y = THREE.MathUtils.damp(this.position.y, targetY, 18, dt);
    this.alignQuaternionToGround(updatedQuery.groundNormal, Math.min(1, dt * 10));

    // 8. Pitch & Roll with Cargo Center-of-Mass Effect
    const cargoComPenalty = 1.0 + (cargoMassKg / 2000) * 0.38;
    const targetPitch = THREE.MathUtils.clamp(
      -longitudinalAccel * 0.013 * cargoComPenalty,
      -0.085,
      0.085
    );
    const centrifugalAccel =
      (this.forwardSpeedMs * this.forwardSpeedMs * Math.tan(this.currentSteerRad)) /
      this.spec.wheelbaseM;
    const rollCompliance =
      (9500 / Math.max(4000, this.spec.antiRollStiffness * suspUpgradeMult)) *
      cargoComPenalty;
    const targetRoll = THREE.MathUtils.clamp(
      centrifugalAccel * 0.011 * rollCompliance,
      -0.13,
      0.13
    );

    this.chassisPitchRad = THREE.MathUtils.damp(
      this.chassisPitchRad,
      targetPitch,
      10,
      dt
    );
    this.chassisRollRad = THREE.MathUtils.damp(
      this.chassisRollRad,
      targetRoll,
      9,
      dt
    );

    // 9. Fuel Consumption & Real-Time Dirt/Mud Accumulation
    if (this.engineRunning && this.realismMode !== 'arcade') {
      const climbPenalty = Math.max(0, effectiveGradeSin * 4.5);
      const cargoFuelPenalty = 1.0 + cargoMassKg / 3500;
      const burnRateLPerSec =
        (this.spec.baseFuelBurnLPerMin / 60) *
        (0.25 + input.throttle * 1.35 + climbPenalty) *
        cargoFuelPenalty;
      this.fuelLiters = Math.max(0, this.fuelLiters - burnRateLPerSec * dt);
    }

    if (speedKmhAbs > 4) {
      const dirtRate =
        updatedQuery.surface === 'mud'
          ? 0.018
          : updatedQuery.surface === 'dirt' || updatedQuery.surface === 'sand'
          ? 0.008
          : updatedQuery.surface === 'gravel'
          ? 0.005
          : this.weather === 'light_rain' || this.weather === 'heavy_rain'
          ? 0.003
          : 0.0005;
      const weatherMult =
        this.weather === 'heavy_rain' || this.weather === 'sandstorm' ? 1.8 : 1.0;
      this.damage.dirtMudLevel = Math.min(
        1.0,
        this.damage.dirtMudLevel + dt * dirtRate * weatherMult * (speedKmhAbs / 45)
      );
    }

    // 10. Gearbox & RPM Calculation
    const speedKmh = Math.abs(this.forwardSpeedMs) * 3.6;
    let gearStr = 'D1';
    let currentGearNum = 1;

    if (this.transmissionMode === 'manual') {
      if (this.manualGearIndex === -1) gearStr = 'R';
      else if (this.manualGearIndex === 0) gearStr = 'N';
      else {
        currentGearNum = this.manualGearIndex;
        gearStr = isLowRange ? `L${currentGearNum}` : String(currentGearNum);
      }
    } else {
      if (this.autoShifter === 'P') {
        gearStr = 'P';
      } else if (this.autoShifter === 'N') {
        gearStr = 'N';
      } else if (this.autoShifter === 'R' || this.forwardSpeedMs < -0.5) {
        gearStr = 'R';
      } else {
        const stepSpeed = (isLowRange ? 48 : 115) / this.spec.forwardGearsCount;
        currentGearNum = THREE.MathUtils.clamp(
          Math.floor(speedKmh / stepSpeed) + 1,
          1,
          this.spec.forwardGearsCount
        );
        gearStr = isLowRange ? `L${currentGearNum}` : `D${currentGearNum}`;
      }
    }

    const rpmSpan = this.spec.redlineRpm - this.spec.idleRpm;
    const gearSpeedWindow = (isLowRange ? 50 : 120) / this.spec.forwardGearsCount;
    const withinGearRatio =
      gearStr === 'N' || gearStr === 'P'
        ? input.throttle * 0.65
        : ((speedKmh % gearSpeedWindow) / gearSpeedWindow) * 0.72 +
          input.throttle * 0.26;
    const rpm = this.engineRunning
      ? Math.round(
          THREE.MathUtils.clamp(
            this.spec.idleRpm + rpmSpan * withinGearRatio,
            this.spec.idleRpm,
            this.spec.redlineRpm
          )
        )
      : 0;

    // 11. Step Local AI Rival if active
    let playerRaceRank: 1 | 2 = 1;
    if (this.aiRivalActive) {
      const rivalSample = mountainRoad.getSampleAtDistance(this.aiRivalDistanceM);
      const curveFactor = Math.abs(rivalSample.curvature) > 0.005 ? 0.76 : 1.0;
      const slopeFactor = rivalSample.gradePct > 8 ? 0.84 : 1.0;
      this.aiRivalDistanceM = Math.min(
        TOTAL_ROAD_LENGTH_M - 20,
        this.aiRivalDistanceM + this.aiRivalBaseSpeedMs * curveFactor * slopeFactor * dt
      );
      if (this.aiRivalDistanceM > this.distanceAlongRoadM + 2) {
        playerRaceRank = 2;
      }
    }

    // 12. Check proximity to Fuel Stations, Workshops, Car Wash, and Discovered POIs
    let nearServiceStation: VehicleTelemetry['nearServiceStation'] = null;
    let discoveredPoiId: string | null = null;
    for (const poi of WORLD_POIS) {
      if (Math.abs(poi.distanceM - this.distanceAlongRoadM) < 38) {
        discoveredPoiId = poi.id;
        if (poi.type === 'fuel') nearServiceStation = 'fuel';
        else if (poi.type === 'workshop') nearServiceStation = 'workshop';
        else if (poi.type === 'car_wash') nearServiceStation = 'car_wash';
        else if (poi.type === 'rest_area' || poi.type === 'viewpoint') {
          nearServiceStation = 'rest_area';
        }
      }
    }

    const pitchDeg = THREE.MathUtils.radToDeg(
      Math.asin(THREE.MathUtils.clamp(effectiveGradeSin, -0.5, 0.5)) +
        this.chassisPitchRad
    );
    const rollDeg = THREE.MathUtils.radToDeg(
      updatedQuery.closestSample.bankingRad + this.chassisRollRad
    );
    const activeChunkId = updatedQuery.closestSample.chunkId;
    const autoWipers =
      this.wipersOn ||
      this.weather === 'light_rain' ||
      this.weather === 'heavy_rain';

    const maxHalfWheelDeg = this.wheelRotationRangeDeg * 0.5;
    const steeringWheelAngleDeg = Math.round(
      this.currentSteerInputNorm * maxHalfWheelDeg
    );

    return {
      vehicleId: this.vehicleId,
      speedKmh: Math.round(speedKmh),
      forwardSpeedMs: this.forwardSpeedMs,
      rpm,
      gear: gearStr,
      autoShifter: this.autoShifter,
      transmissionMode: this.transmissionMode,
      drivetrainMode: this.drivetrainMode,
      diffLockActive: this.diffLockActive,
      engineRunning: this.engineRunning,
      headlightsOn: this.headlightsOn,
      wipersOn: autoWipers,
      leftIndicatorOn: this.leftIndicatorOn,
      rightIndicatorOn: this.rightIndicatorOn,
      throttle: input.throttle,
      brake: input.brake,
      clutch: input.clutch ?? 0,
      handbrake: input.handbrake,
      steeringInputNorm: Math.round(this.currentSteerInputNorm * 100) / 100,
      steeringWheelAngleDeg,
      steeringAngleDeg: Math.round(THREE.MathUtils.radToDeg(this.currentSteerRad)),
      altitudeM: Math.round(1450 + this.position.y),
      pitchDeg: Math.round(pitchDeg * 10) / 10,
      rollDeg: Math.round(rollDeg * 10) / 10,
      headingDeg: Math.round(
        ((THREE.MathUtils.radToDeg(this.headingRad) % 360) + 360) % 360
      ),
      surface: updatedQuery.surface,
      regionId: updatedQuery.closestSample.regionId,
      regionNameAr: updatedQuery.closestSample.regionNameAr,
      activeChunkId,
      loadedChunksCount: Math.min(TOTAL_CHUNKS_COUNT, 7),
      distanceAlongRoadM: Math.round(this.distanceAlongRoadM),
      totalDistanceDrivenM: Math.round(this.totalDistanceDrivenM),
      lateralOffsetM: Math.round(this.lateralOffsetM * 100) / 100,
      slopeGradePct: Math.round(updatedQuery.closestSample.gradePct * 10) / 10,
      inTunnel: updatedQuery.closestSample.hasTunnel,
      onBridge: updatedQuery.closestSample.hasBridge,
      fuelLiters: Math.round(this.fuelLiters * 10) / 10,
      fuelTankCapacityL: this.spec.fuelTankLiters,
      lowFuelWarning: this.fuelLiters < this.spec.fuelTankLiters * 0.18,
      effectiveMassKg: totalMassKg,
      cargoMassKg,
      damage: {
        engineHealthPct: Math.round(this.damage.engineHealthPct),
        tiresHealthPct: Math.round(this.damage.tiresHealthPct),
        suspensionHealthPct: Math.round(this.damage.suspensionHealthPct),
        bodyHealthPct: Math.round(this.damage.bodyHealthPct),
        cargoIntegrityPct: Math.round(this.damage.cargoIntegrityPct),
        steeringPullBias: this.damage.steeringPullBias,
        dirtMudLevel: Math.round(this.damage.dirtMudLevel * 100) / 100,
      },
      assists: { ...this.assists },
      stabilityWarning: Math.abs(rollDeg) > 10.5 || groundedCount < 4,
      nearServiceStation,
      discoveredPoiId,
      aiRivalDistanceM: this.aiRivalActive ? Math.round(this.aiRivalDistanceM) : null,
      playerRaceRank,
      wheels: this.wheelsTelemetry,
      position: {
        x: Math.round(this.position.x * 10) / 10,
        y: Math.round(this.position.y * 10) / 10,
        z: Math.round(this.position.z * 10) / 10,
      },
    };
  }
}

/**
 * Runs closed-proving-ground physics benchmarks across all 10 vehicles
 */
export function runVehicleProvingGroundBenchmarks(): VehicleBenchmarkResult[] {
  const results: VehicleBenchmarkResult[] = [];

  for (const vid of ALL_VEHICLE_IDS) {
    const sim = new MasalikVehicleDynamics();
    sim.selectVehicle(vid, getDefaultCustomizations()[vid]);
    sim.resetToRoad(7900);

    let timeTo80 = 0;
    let reached80 = false;
    let maxSpeedKmh = 0;
    let maxRollDeg = 0;

    for (let step = 0; step < 640; step++) {
      const tel = sim.step(0.025, {
        throttle: 1.0,
        brake: 0,
        steer: 0,
        handbrake: false,
      });
      if (!reached80 && tel.speedKmh >= 75) {
        reached80 = true;
        timeTo80 = (step + 1) * 0.025;
      }
      if (tel.speedKmh > maxSpeedKmh) {
        maxSpeedKmh = tel.speedKmh;
      }
      if (Math.abs(tel.rollDeg) > maxRollDeg) {
        maxRollDeg = Math.abs(tel.rollDeg);
      }
    }
    if (!reached80) {
      timeTo80 = 14.8;
    }

    const brakeStartDist = sim.step(0.001, {
      throttle: 0,
      brake: 1,
      steer: 0,
      handbrake: false,
    }).totalDistanceDrivenM;

    for (let step = 0; step < 300; step++) {
      const tel = sim.step(0.02, {
        throttle: 0,
        brake: 1.0,
        steer: 0,
        handbrake: false,
      });
      if (tel.speedKmh <= 1) break;
    }
    const brakeEndDist = sim.step(0.001, {
      throttle: 0,
      brake: 1,
      steer: 0,
      handbrake: false,
    }).totalDistanceDrivenM;
    const brakingDistM = Math.max(
      16,
      Math.round((brakeEndDist - brakeStartDist) * 10) / 10
    );

    const spec = VEHICLE_SPECS[vid];
    const has4L = spec.supportedDrivetrains.includes('4L');
    const lowMult = has4L ? 1.65 : 1.0;
    const maxForce = spec.maxEngineTorqueNm * 39.5 * lowMult;
    const weightN = (spec.baseMassKg + (vid === 'jabal' ? 1200 : 0)) * 9.81;
    const sinThetaMax = Math.min(0.62, (maxForce * 0.85) / weightN);
    const maxClimbDeg = Math.round(THREE.MathUtils.radToDeg(Math.asin(sinThetaMax)));

    results.push({
      vehicleId: vid,
      nameAr: spec.nameAr,
      accel0to80Sec: Math.round(timeTo80 * 10) / 10,
      topSpeedKmh: maxSpeedKmh,
      braking80to0M: brakingDistM,
      maxClimbDeg,
      courseTimeSec: Math.round((1300 / Math.max(18, maxSpeedKmh / 3.6)) * 10) / 10,
      suspensionStabilityPct: Math.round(100 - Math.min(18, maxRollDeg * 1.4)),
      rolloverOccurred: maxRollDeg > 42,
    });
  }

  return results;
}

export const RaycastVehiclePhysics = MasalikVehicleDynamics;
export const DEFAULT_SUV_PHYSICS_CONFIG = VEHICLE_SPECS.shahiq;
