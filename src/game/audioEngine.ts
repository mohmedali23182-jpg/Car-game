import {
  VehicleId,
  WeatherPreset,
  SurfaceType,
  CameraMode,
  AudioMixerSettings,
} from './types';
import { VEHICLE_SPECS } from './vehicleFleet';

/**
 * MASALIK — Audio Experience Engine (100% Offline Procedural Web Audio API)
 * Supports:
 * - 6-Channel Independent Audio Mixer (Master, Engine, Music, Environment, SFX, UI)
 * - 10 Vehicle Acoustic Signatures linked to RPM + throttle load + turbo/diesel harmonics
 * - Surface-specific Tire Scrubbing & Gravel/Sand/Mud/Rock Audio
 * - Weather & Ambient Audio (Wind, Rain, Thunder Claps, Coastal Waves, Mountain Birds)
 * - Acoustic Tunnel Echo & Interior Cockpit Muffling
 * - Yemeni / Arabic Oud-inspired Procedural Soundtrack
 */

export const DEFAULT_AUDIO_MIXER: AudioMixerSettings = {
  masterVolume: 0.8,
  engineVolume: 0.85,
  musicVolume: 0.45,
  environmentVolume: 0.7,
  sfxVolume: 0.85,
  uiVolume: 0.75,
  muted: false,
  musicEnabled: true,
};

export class MasalikAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private cockpitFilter: BiquadFilterNode | null = null;

  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineSubOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;

  private tireNoiseNode: AudioBufferSourceNode | null = null;
  private tireFilter: BiquadFilterNode | null = null;
  private tireGain: GainNode | null = null;

  private windFilter: BiquadFilterNode | null = null;
  private windGain: GainNode | null = null;
  private rainFilter: BiquadFilterNode | null = null;
  private rainGain: GainNode | null = null;

  private musicTimer: number | null = null;
  private musicStep = 0;

  private isInitialized = false;
  private mixer: AudioMixerSettings = { ...DEFAULT_AUDIO_MIXER };
  private lastGear = 'D1';

  private readonly OUD_SCALE = [
    146.83,
    155.56,
    185.0,
    196.0,
    220.0,
    233.08,
    277.18,
    293.66,
    329.63,
    369.99,
  ];

  private readonly OUD_MELODY_PATTERN = [
    0, 2, 3, 4, 3, 2, 0, -1,
    4, 5, 7, 5, 4, 3, 2, 3,
    0, 3, 4, 7, 6, 5, 4, -1,
    3, 2, 1, 2, 0, -1, 0, -1,
  ];

  public init(): void {
    if (this.isInitialized) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.mixer.muted ? 0 : this.mixer.masterVolume;

      this.cockpitFilter = this.ctx.createBiquadFilter();
      this.cockpitFilter.type = 'lowpass';
      this.cockpitFilter.frequency.value = 18000;
      this.cockpitFilter.Q.value = 0.7;

      this.cockpitFilter.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.engineOsc1 = this.ctx.createOscillator();
      this.engineOsc2 = this.ctx.createOscillator();
      this.engineSubOsc = this.ctx.createOscillator();
      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineGain = this.ctx.createGain();

      this.engineOsc1.type = 'sawtooth';
      this.engineOsc2.type = 'triangle';
      this.engineSubOsc.type = 'sine';

      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.value = 260;
      this.engineFilter.Q.value = 2.8;

      this.engineGain.gain.value = 0.01;

      this.engineOsc1.connect(this.engineFilter);
      this.engineOsc2.connect(this.engineFilter);
      this.engineSubOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.cockpitFilter);

      this.engineOsc1.start();
      this.engineOsc2.start();
      this.engineSubOsc.start();

      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      this.tireNoiseNode = this.ctx.createBufferSource();
      this.tireNoiseNode.buffer = noiseBuffer;
      this.tireNoiseNode.loop = true;

      this.tireFilter = this.ctx.createBiquadFilter();
      this.tireFilter.type = 'bandpass';
      this.tireFilter.frequency.value = 950;
      this.tireFilter.Q.value = 3.2;

      this.tireGain = this.ctx.createGain();
      this.tireGain.gain.value = 0;

      this.tireNoiseNode.connect(this.tireFilter);
      this.tireFilter.connect(this.tireGain);
      this.tireGain.connect(this.cockpitFilter);
      this.tireNoiseNode.start();

      const windSource = this.ctx.createBufferSource();
      windSource.buffer = noiseBuffer;
      windSource.loop = true;

      this.windFilter = this.ctx.createBiquadFilter();
      this.windFilter.type = 'lowpass';
      this.windFilter.frequency.value = 220;

      this.windGain = this.ctx.createGain();
      this.windGain.gain.value = 0.015;

      windSource.connect(this.windFilter);
      this.windFilter.connect(this.windGain);
      this.windGain.connect(this.cockpitFilter);
      windSource.start();

      const rainSource = this.ctx.createBufferSource();
      rainSource.buffer = noiseBuffer;
      rainSource.loop = true;

      this.rainFilter = this.ctx.createBiquadFilter();
      this.rainFilter.type = 'bandpass';
      this.rainFilter.frequency.value = 2600;
      this.rainFilter.Q.value = 0.8;

      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.value = 0;

      rainSource.connect(this.rainFilter);
      this.rainFilter.connect(this.rainGain);
      this.rainGain.connect(this.cockpitFilter);
      rainSource.start();

      this.startProceduralOudMusic();
      this.isInitialized = true;
    } catch {
      // Ignore Web Audio blocks before first user gesture
    }
  }

  private startProceduralOudMusic(): void {
    if (this.musicTimer !== null) return;
    this.musicTimer = window.setInterval(() => {
      if (!this.isInitialized || !this.ctx || !this.masterGain) return;
      if (this.mixer.muted || !this.mixer.musicEnabled || this.mixer.musicVolume <= 0.01)
        return;
      if (this.ctx.state === 'suspended') return;

      const noteIndex =
        this.OUD_MELODY_PATTERN[this.musicStep % this.OUD_MELODY_PATTERN.length];
      this.musicStep++;

      if (noteIndex < 0) return;

      const freq = this.OUD_SCALE[noteIndex % this.OUD_SCALE.length];
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const bodyFilter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.998, now + 0.45);

      bodyFilter.type = 'bandpass';
      bodyFilter.frequency.setValueAtTime(freq * 2.4, now);
      bodyFilter.Q.value = 1.6;

      const vol = 0.055 * this.mixer.musicVolume;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.52);

      osc.connect(bodyFilter);
      bodyFilter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.55);
    }, 420);
  }

  public update(
    rpm: number,
    speedKmh: number,
    throttle: number,
    slipRatio: number,
    gear: string,
    vehicleId: VehicleId,
    weather: WeatherPreset,
    surface: SurfaceType,
    cameraMode: CameraMode = 'chase_near',
    inTunnel = false
  ): void {
    if (!this.isInitialized || !this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const now = this.ctx.currentTime;
    const spec = VEHICLE_SPECS[vehicleId] || VEHICLE_SPECS.shahiq;

    if (this.cockpitFilter) {
      let targetCutoff = 16000;
      let targetQ = 0.7;
      if (cameraMode === 'cockpit') {
        targetCutoff = 2200;
        targetQ = 1.2;
      } else if (inTunnel) {
        targetCutoff = 3800;
        targetQ = 4.2;
      }
      this.cockpitFilter.frequency.setTargetAtTime(targetCutoff, now, 0.08);
      this.cockpitFilter.Q.setTargetAtTime(targetQ, now, 0.08);
    }

    const rpmNorm =
      (rpm - spec.idleRpm) / Math.max(1000, spec.redlineRpm - spec.idleRpm);
    const baseFreq = spec.engineBaseFreqHz + rpmNorm * (spec.engineBaseFreqHz * 2.85);

    if (
      this.engineOsc1 &&
      this.engineOsc2 &&
      this.engineSubOsc &&
      this.engineFilter &&
      this.engineGain
    ) {
      const isHeavyDiesel =
        vehicleId === 'jabal' ||
        vehicleId === 'hafilat' ||
        vehicleId === 'munqidh' ||
        vehicleId === 'badiya';
      const isSportRally = vehicleId === 'barq';

      this.engineOsc1.type = 'sawtooth';
      this.engineOsc2.type = isSportRally
        ? 'sawtooth'
        : isHeavyDiesel
        ? 'square'
        : 'triangle';

      this.engineOsc1.frequency.setTargetAtTime(baseFreq, now, 0.035);
      this.engineOsc2.frequency.setTargetAtTime(
        baseFreq * (isHeavyDiesel ? 0.5 : isSportRally ? 2.0 : 1.5),
        now,
        0.035
      );
      this.engineSubOsc.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.04);

      const filterCutoff = 190 + rpmNorm * 1150 + throttle * 520;
      this.engineFilter.frequency.setTargetAtTime(filterCutoff, now, 0.05);

      const rawVol = 0.065 + rpmNorm * 0.085 + throttle * 0.055;
      this.engineGain.gain.setTargetAtTime(
        rawVol * this.mixer.engineVolume,
        now,
        0.05
      );
    }

    if (gear !== this.lastGear) {
      this.playGearShiftSound();
      this.lastGear = gear;
    }

    if (this.tireGain && this.tireFilter) {
      const speedNorm = Math.min(1, speedKmh / 110);
      let surfaceGain = 0;
      let surfaceFreq = 950;
      let surfaceQ = 3.0;

      if (surface === 'gravel' || surface === 'dirt') {
        surfaceFreq = 460 + speedKmh * 4;
        surfaceQ = 1.4;
        surfaceGain = speedNorm * 0.14 + Math.max(0, slipRatio - 0.1) * 0.12;
      } else if (surface === 'sand') {
        surfaceFreq = 1800 + speedKmh * 5;
        surfaceQ = 1.1;
        surfaceGain = speedNorm * 0.11 + Math.max(0, slipRatio - 0.1) * 0.1;
      } else if (surface === 'mud') {
        surfaceFreq = 320 + speedKmh * 3;
        surfaceQ = 2.2;
        surfaceGain = speedNorm * 0.16 + Math.max(0, slipRatio - 0.1) * 0.14;
      } else if (surface === 'rock') {
        surfaceFreq = 1350 + speedKmh * 6;
        surfaceQ = 2.5;
        surfaceGain = speedNorm * 0.12 + Math.max(0, slipRatio - 0.12) * 0.18;
      } else {
        const squealIntensity = Math.max(
          0,
          Math.min(1, (slipRatio - 0.18) * 2.2)
        );
        surfaceFreq = 860 + speedKmh * 3.5;
        surfaceQ = 4.2;
        surfaceGain = squealIntensity * 0.18 + speedNorm * 0.025;
      }

      this.tireFilter.frequency.setTargetAtTime(surfaceFreq, now, 0.05);
      this.tireFilter.Q.setTargetAtTime(surfaceQ, now, 0.05);
      this.tireGain.gain.setTargetAtTime(
        surfaceGain * this.mixer.sfxVolume,
        now,
        0.05
      );
    }

    if (this.windGain && this.windFilter) {
      const windSpeedFactor = Math.min(1, speedKmh / 120);
      const stormBoost =
        weather === 'sandstorm' || weather === 'heavy_rain' ? 0.08 : 0.015;
      this.windFilter.frequency.setTargetAtTime(
        180 + windSpeedFactor * 680,
        now,
        0.1
      );
      this.windGain.gain.setTargetAtTime(
        (stormBoost + windSpeedFactor * 0.09) * this.mixer.environmentVolume,
        now,
        0.1
      );
    }

    if (this.rainGain && this.rainFilter) {
      const isRaining = weather === 'heavy_rain' || weather === 'light_rain';
      const isSandstorm = weather === 'sandstorm';
      const rainVol =
        weather === 'heavy_rain'
          ? 0.13
          : weather === 'light_rain'
          ? 0.07
          : isSandstorm
          ? 0.07
          : 0;
      this.rainFilter.frequency.setTargetAtTime(
        isRaining ? 2600 : 1400,
        now,
        0.15
      );
      this.rainGain.gain.setTargetAtTime(
        rainVol * this.mixer.environmentVolume,
        now,
        0.2
      );
    }
  }

  private playGearShiftSound(): void {
    if (!this.ctx || !this.cockpitFilter || this.mixer.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(135, now);
    osc.frequency.exponentialRampToValueAtTime(52, now + 0.085);

    gain.gain.setValueAtTime(0.09 * this.mixer.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.cockpitFilter);

    osc.start(now);
    osc.stop(now + 0.095);
  }

  public playCollisionSound(impactSpeedMs: number): void {
    if (!this.ctx || !this.cockpitFilter || this.mixer.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 0.24);

    const vol =
      Math.min(0.45, (impactSpeedMs / 18) * 0.35) * this.mixer.sfxVolume;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    osc.connect(gain);
    gain.connect(this.cockpitFilter);

    osc.start(now);
    osc.stop(now + 0.27);
  }

  public playThunderClap(): void {
    if (!this.ctx || !this.cockpitFilter || this.mixer.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(68, now);
    osc.frequency.exponentialRampToValueAtTime(24, now + 1.4);

    const vol = 0.22 * this.mixer.environmentVolume;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    osc.connect(gain);
    gain.connect(this.cockpitFilter);

    osc.start(now);
    osc.stop(now + 1.55);
  }

  public playHorn(active: boolean, vehicleId: VehicleId = 'shahiq'): void {
    if (!this.ctx || !this.cockpitFilter || !active || this.mixer.muted) return;
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const isHeavy =
      vehicleId === 'jabal' || vehicleId === 'hafilat' || vehicleId === 'munqidh';
    const isEmergency = vehicleId === 'munqidh';

    osc1.type = isHeavy ? 'sawtooth' : 'square';
    osc2.type = isHeavy ? 'sawtooth' : 'square';

    osc1.frequency.setValueAtTime(isHeavy ? 185 : 390, now);
    osc2.frequency.setValueAtTime(
      isEmergency ? 580 : isHeavy ? 235 : 490,
      now
    );

    const vol = 0.08 * this.mixer.sfxVolume;
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.cockpitFilter);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.29);
    osc2.stop(now + 0.29);
  }

  public playUiClick(pitchMultiplier = 1.0): void {
    if (!this.ctx || !this.masterGain || this.mixer.muted) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520 * pitchMultiplier, now);
    osc.frequency.exponentialRampToValueAtTime(260 * pitchMultiplier, now + 0.045);

    gain.gain.setValueAtTime(0.055 * this.mixer.uiVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.055);
  }

  public setMixer(mixer: Partial<AudioMixerSettings>): void {
    this.mixer = { ...this.mixer, ...mixer };
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(
        this.mixer.muted ? 0 : this.mixer.masterVolume,
        this.ctx.currentTime,
        0.05
      );
    }
  }

  public getMixer(): AudioMixerSettings {
    return { ...this.mixer };
  }
}
