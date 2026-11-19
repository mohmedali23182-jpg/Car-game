import { RadioStationDefinition, RadioStationId } from './types';

/**
 * MASALIK — Procedural Lo-Fi Yemeni Instrumental Radio Engine (100% Offline Web Audio API)
 * Synthesizes authentic warm lo-fi Yemeni Oud, Qanun/Ney pads, Rhodes chords,
 * relaxed lo-fi Darbuka/Sharh/Adani percussion, subtle analog tape warmth & vinyl crackle.
 * Zero external audio URLs or network calls required.
 */

export const YEMENI_LOFI_STATIONS: RadioStationDefinition[] = [
  {
    id: 'taiz_oud_lofi',
    frequencyFm: '92.4 FM',
    nameAr: 'إذاعة تعز الجبلية',
    subtitleAr: 'عود صبري دافئ × Lo-Fi مسائي',
    cityAr: 'تعز — جبل صبر',
    maqamAr: 'مقام حجاز',
    bpm: 76,
    accentHex: '#f59e0b',
  },
  {
    id: 'sanaa_qamariya_chill',
    frequencyFm: '96.8 FM',
    nameAr: 'نسيم صنعاء القديمة',
    subtitleAr: 'قانون وناي صنعاني × Chillhop',
    cityAr: 'صنعاء — باب اليمن',
    maqamAr: 'مقام راست',
    bpm: 72,
    accentHex: '#38bdf8',
  },
  {
    id: 'ibb_rain_oud',
    frequencyFm: '101.2 FM',
    nameAr: 'ليالي إب الخضراء',
    subtitleAr: 'عود المدرجات والمطر الهادئ',
    cityAr: 'إب — نقيل سمارة',
    maqamAr: 'مقام بياتي',
    bpm: 68,
    accentHex: '#10b981',
  },
  {
    id: 'aden_coast_breeze',
    frequencyFm: '104.5 FM',
    nameAr: 'موج عدن الساحلي',
    subtitleAr: 'إيقاع عدني هادئ × Lo-Fi بحري',
    cityAr: 'عدن — خليج صيرة',
    maqamAr: 'مقام كرد',
    bpm: 82,
    accentHex: '#fb7185',
  },
  {
    id: 'hadramout_dan_lofi',
    frequencyFm: '107.9 FM',
    nameAr: 'صدى شبام وحضرموت',
    subtitleAr: 'دان حضرمي آلي × Ambient Lo-Fi',
    cityAr: 'شبام — وادي حضرموت',
    maqamAr: 'خماسي حضرمي',
    bpm: 74,
    accentHex: '#eab308',
  },
];

interface StationMusicalSpec {
  bpm: number;
  scaleHz: number[];
  oudPattern: number[];
  qanunPattern: number[];
  chordRootsHz: number[];
  chordIntervals: number[];
  kickSteps: number[];
  snareSteps: number[];
  darbukaTekSteps: number[];
  filterCutoffHz: number;
  hasRainShimmer?: boolean;
}

const STATION_SPECS: Record<RadioStationId, StationMusicalSpec> = {
  taiz_oud_lofi: {
    bpm: 76,
    // D Hijaz: D3, Eb3, F#3, G3, A3, Bb3, C#4, D4, Eb4, F#4
    scaleHz: [146.83, 155.56, 185.0, 196.0, 220.0, 233.08, 277.18, 293.66, 311.13, 369.99],
    oudPattern: [
      0, -1, 2, 3, 4, -1, 3, 2,
      3, -1, 4, 5, 4, 3, 2, -1,
      7, -1, 5, 4, 3, -1, 2, 1,
      0, -1, 1, 2, 0, -1, -1, -1,
    ],
    qanunPattern: [
      4, -1, -1, 7, -1, -1, 5, -1,
      4, -1, -1, 3, -1, -1, 2, -1,
      7, -1, -1, 9, -1, -1, 7, -1,
      4, -1, -1, 2, -1, -1, 0, -1,
    ],
    chordRootsHz: [146.83, 116.54, 130.81, 146.83],
    chordIntervals: [1, 1.26, 1.5],
    kickSteps: [0, 6, 8, 14],
    snareSteps: [4, 12],
    darbukaTekSteps: [2, 3, 7, 10, 11, 15],
    filterCutoffHz: 2150,
  },
  sanaa_qamariya_chill: {
    bpm: 72,
    // C Rast-inspired warm modal scale (slightly lowered 3rd/7th quarter-feel)
    scaleHz: [130.81, 146.83, 161.0, 174.61, 196.0, 220.0, 241.5, 261.63, 293.66, 322.0],
    oudPattern: [
      0, -1, 4, -1, 3, 2, 1, -1,
      2, -1, 4, 5, 7, -1, 5, 4,
      7, -1, 8, 7, 5, -1, 4, 3,
      2, 1, 0, -1, 4, -1, 0, -1,
    ],
    qanunPattern: [
      7, 5, -1, 4, -1, 7, -1, -1,
      5, 4, -1, 2, -1, 4, -1, -1,
      8, 7, -1, 5, -1, 4, -1, -1,
      4, 2, -1, 0, -1, -1, -1, -1,
    ],
    chordRootsHz: [130.81, 174.61, 146.83, 196.0],
    chordIntervals: [1, 1.23, 1.5],
    kickSteps: [0, 7, 8, 10],
    snareSteps: [4, 12],
    darbukaTekSteps: [2, 6, 9, 14, 15],
    filterCutoffHz: 2450,
  },
  ibb_rain_oud: {
    bpm: 68,
    // D Bayati-inspired gentle melancholy scale
    scaleHz: [146.83, 160.2, 174.61, 196.0, 220.0, 233.08, 261.63, 293.66, 320.4, 349.23],
    oudPattern: [
      0, -1, -1, 2, 3, -1, 2, 1,
      0, -1, 3, 4, 5, -1, 4, -1,
      7, -1, 6, 5, 4, -1, 3, 2,
      1, -1, 2, 1, 0, -1, -1, -1,
    ],
    qanunPattern: [
      -1, -1, 7, -1, -1, -1, 4, -1,
      -1, -1, 5, -1, -1, -1, 3, -1,
      -1, -1, 7, -1, -1, -1, 6, -1,
      -1, -1, 4, -1, -1, -1, 0, -1,
    ],
    chordRootsHz: [146.83, 174.61, 130.81, 146.83],
    chordIntervals: [1, 1.19, 1.5],
    kickSteps: [0, 8, 11],
    snareSteps: [4, 12],
    darbukaTekSteps: [3, 6, 10, 14],
    filterCutoffHz: 1850,
    hasRainShimmer: true,
  },
  aden_coast_breeze: {
    bpm: 82,
    // E Kurd coastal groove
    scaleHz: [164.81, 174.61, 196.0, 220.0, 246.94, 261.63, 293.66, 329.63, 349.23, 392.0],
    oudPattern: [
      0, 2, -1, 3, 4, -1, 3, 2,
      4, -1, 5, 4, 3, 2, 1, -1,
      7, -1, 6, 5, 4, 3, 2, -1,
      3, 4, 2, 1, 0, -1, 2, -1,
    ],
    qanunPattern: [
      4, -1, 7, -1, 5, -1, 4, -1,
      3, -1, 5, -1, 4, -1, 2, -1,
      7, -1, 9, -1, 7, -1, 5, -1,
      4, -1, 2, -1, 0, -1, -1, -1,
    ],
    chordRootsHz: [164.81, 130.81, 146.83, 164.81],
    chordIntervals: [1, 1.19, 1.5],
    kickSteps: [0, 3, 6, 8, 11],
    snareSteps: [4, 12, 14],
    darbukaTekSteps: [2, 5, 7, 10, 13, 15],
    filterCutoffHz: 2550,
  },
  hadramout_dan_lofi: {
    bpm: 74,
    // Hadrami pentatonic + Hijaz color
    scaleHz: [130.81, 146.83, 164.81, 196.0, 220.0, 261.63, 293.66, 329.63, 392.0, 440.0],
    oudPattern: [
      0, -1, 2, 3, -1, 4, 3, 2,
      3, -1, 5, -1, 4, 3, 2, -1,
      5, -1, 6, 5, 4, -1, 3, 2,
      0, -1, 3, 2, 0, -1, -1, -1,
    ],
    qanunPattern: [
      5, -1, -1, 8, -1, 7, -1, -1,
      5, -1, -1, 4, -1, 3, -1, -1,
      7, -1, -1, 8, -1, 5, -1, -1,
      3, -1, -1, 2, -1, 0, -1, -1,
    ],
    chordRootsHz: [130.81, 164.81, 196.0, 146.83],
    chordIntervals: [1, 1.25, 1.5],
    kickSteps: [0, 6, 10],
    snareSteps: [4, 12],
    darbukaTekSteps: [2, 3, 8, 11, 14, 15],
    filterCutoffHz: 2050,
  },
};

export class YemeniLofiRadioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private lofiFilter: BiquadFilterNode | null = null;
  private analyser: AnalyserNode | null = null;
  private freqData: Uint8Array<ArrayBuffer> | null = null;

  private vinylNode: AudioBufferSourceNode | null = null;
  private vinylGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private isPlaying = false;
  private stationId: RadioStationId = 'taiz_oud_lofi';
  private volume = 0.65;
  private globalMuted = false;
  private vinylEnabled = true;

  private stepIndex = 0;
  private stepTimer: number | null = null;

  private ensureContext(): boolean {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return true;
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new AudioCtx();

      this.lofiFilter = this.ctx.createBiquadFilter();
      this.lofiFilter.type = 'lowpass';
      this.lofiFilter.frequency.value = STATION_SPECS[this.stationId].filterCutoffHz;
      this.lofiFilter.Q.value = 0.85;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.globalMuted ? 0 : this.volume * 0.52;

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.78;
      this.freqData = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));

      this.lofiFilter.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // Build shared noise buffer for percussion brushes & rain shimmer
      const len = this.ctx.sampleRate * 2;
      this.noiseBuffer = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      // Build Lo-Fi Vinyl Crackle loop (warm pink-ish floor + gentle random vinyl dust pops)
      const vinylLen = this.ctx.sampleRate * 4;
      const vinylBuf = this.ctx.createBuffer(1, vinylLen, this.ctx.sampleRate);
      const vData = vinylBuf.getChannelData(0);
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      for (let i = 0; i < vinylLen; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.997 * b0 + white * 0.029;
        b1 = 0.985 * b1 + white * 0.032;
        b2 = 0.95 * b2 + white * 0.048;
        let sample = (b0 + b1 + b2) * 0.09;
        // Sparse warm vinyl pops
        if (Math.random() < 0.00045) {
          sample += (Math.random() * 2 - 1) * 0.65;
        }
        vData[i] = Math.max(-1, Math.min(1, sample));
      }

      this.vinylNode = this.ctx.createBufferSource();
      this.vinylNode.buffer = vinylBuf;
      this.vinylNode.loop = true;

      const vinylBand = this.ctx.createBiquadFilter();
      vinylBand.type = 'bandpass';
      vinylBand.frequency.value = 1950;
      vinylBand.Q.value = 0.7;

      this.vinylGain = this.ctx.createGain();
      this.vinylGain.gain.value = 0;

      this.vinylNode.connect(vinylBand);
      vinylBand.connect(this.vinylGain);
      this.vinylGain.connect(this.masterGain);
      this.vinylNode.start();

      return true;
    } catch {
      return false;
    }
  }

  public start(): void {
    if (!this.ensureContext()) return;
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.updateVinylGain();
    this.scheduleLoop();
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.stepTimer !== null) {
      window.clearInterval(this.stepTimer);
      this.stepTimer = null;
    }
    this.updateVinylGain();
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  public setStation(id: RadioStationId): void {
    this.stationId = id;
    this.stepIndex = 0;
    if (this.ctx && this.lofiFilter) {
      const spec = STATION_SPECS[id];
      this.lofiFilter.frequency.setTargetAtTime(
        spec.filterCutoffHz,
        this.ctx.currentTime,
        0.15
      );
    }
    if (this.isPlaying) {
      this.playTuningStaticBurst();
      this.scheduleLoop();
    }
  }

  public nextStation(): RadioStationId {
    const idx = YEMENI_LOFI_STATIONS.findIndex((s) => s.id === this.stationId);
    const next = YEMENI_LOFI_STATIONS[(idx + 1) % YEMENI_LOFI_STATIONS.length];
    this.setStation(next.id);
    return next.id;
  }

  public prevStation(): RadioStationId {
    const idx = YEMENI_LOFI_STATIONS.findIndex((s) => s.id === this.stationId);
    const prev =
      YEMENI_LOFI_STATIONS[
        (idx - 1 + YEMENI_LOFI_STATIONS.length) % YEMENI_LOFI_STATIONS.length
      ];
    this.setStation(prev.id);
    return prev.id;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    this.applyMasterGain();
  }

  public setGlobalMuted(muted: boolean): void {
    this.globalMuted = muted;
    this.applyMasterGain();
  }

  public setVinylEnabled(enabled: boolean): void {
    this.vinylEnabled = enabled;
    this.updateVinylGain();
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getFrequencyBars(barCount = 14): number[] {
    if (!this.isPlaying || !this.analyser || !this.freqData) {
      return new Array(barCount).fill(0.08);
    }
    this.analyser.getByteFrequencyData(this.freqData);
    const out: number[] = [];
    const usableBins = Math.min(this.freqData.length, 24);
    for (let i = 0; i < barCount; i++) {
      const binIdx = Math.min(
        usableBins - 1,
        Math.floor((i / barCount) * usableBins)
      );
      const val = this.freqData[binIdx] / 255;
      out.push(Math.max(0.08, Math.min(1, val * 1.15)));
    }
    return out;
  }

  private applyMasterGain(): void {
    if (!this.ctx || !this.masterGain) return;
    const target = this.globalMuted ? 0 : this.volume * 0.52;
    this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.06);
  }

  private updateVinylGain(): void {
    if (!this.ctx || !this.vinylGain) return;
    const spec = STATION_SPECS[this.stationId];
    const baseLevel = spec.hasRainShimmer ? 0.16 : 0.095;
    const target = this.isPlaying && this.vinylEnabled ? baseLevel : 0;
    this.vinylGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.12);
  }

  private playTuningStaticBurst(): void {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;
    const now = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const bp = this.ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1600, now);
    bp.frequency.exponentialRampToValueAtTime(600, now + 0.14);
    bp.Q.value = 1.4;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.14, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    src.connect(bp);
    bp.connect(g);
    g.connect(this.masterGain);
    src.start(now);
    src.stop(now + 0.16);
  }

  private scheduleLoop(): void {
    if (this.stepTimer !== null) {
      window.clearInterval(this.stepTimer);
      this.stepTimer = null;
    }
    const spec = STATION_SPECS[this.stationId];
    const sixteenthMs = (60 / spec.bpm / 4) * 1000;

    this.triggerStep();
    this.stepTimer = window.setInterval(() => {
      if (!this.isPlaying) return;
      this.triggerStep();
    }, sixteenthMs);
  }

  private triggerStep(): void {
    if (!this.ctx || !this.lofiFilter || this.ctx.state === 'suspended') return;
    const spec = STATION_SPECS[this.stationId];
    const step32 = this.stepIndex % 32;
    const step16 = this.stepIndex % 16;
    const now = this.ctx.currentTime;
    // Slight human lo-fi swing on odd 16th steps
    const swingOffset = step16 % 2 === 1 ? 0.018 : 0;
    const t = now + swingOffset;

    // 1. Warm Lo-Fi Chord Pad (every 8 steps = half bar)
    if (step32 % 8 === 0) {
      const chordIdx = Math.floor(step32 / 8) % spec.chordRootsHz.length;
      const root = spec.chordRootsHz[chordIdx];
      this.playWarmLofiChord(t, root, spec.chordIntervals, (60 / spec.bpm) * 2.05);
    }

    // 2. Plucked Yemeni Oud Melody (double-course acoustic pluck)
    const oudNote = spec.oudPattern[step32];
    if (oudNote >= 0) {
      const freq = spec.scaleHz[oudNote % spec.scaleHz.length];
      // Subtle organic tape detune wobble
      const wobble = 1 + Math.sin(this.stepIndex * 0.35) * 0.003;
      this.playOudPluck(t, freq * wobble, 0.23);
    }

    // 3. Delicate Qanun / Ney Counter-Harmony
    const qanunNote = spec.qanunPattern[step32];
    if (qanunNote >= 0) {
      const freq = spec.scaleHz[qanunNote % spec.scaleHz.length] * 2;
      this.playQanunShimmer(t + 0.012, freq, 0.085);
    }

    // 4. Soft Lo-Fi Percussion (Kick / Brushed Snare / Darbuka Tek)
    if (spec.kickSteps.includes(step16)) {
      this.playSoftKick(t);
    }
    if (spec.snareSteps.includes(step16)) {
      this.playLofiSnare(t);
    }
    if (spec.darbukaTekSteps.includes(step16)) {
      this.playDarbukaTek(t, step16 % 4 === 2 ? 0.06 : 0.038);
    }

    this.stepIndex++;
  }

  private playOudPluck(time: number, freq: number, gainAmp: number): void {
    if (!this.ctx || !this.lofiFilter) return;

    // Paired double-course strings typical of Yemeni Oud
    const oscA = this.ctx.createOscillator();
    const oscB = this.ctx.createOscillator();
    oscA.type = 'triangle';
    oscB.type = 'sawtooth';
    oscA.frequency.setValueAtTime(freq, time);
    oscB.frequency.setValueAtTime(freq * 1.003, time); // Warm micro-chorus

    // Wooden resonance chamber filter with fast pluck decay
    const bodyFilter = this.ctx.createBiquadFilter();
    bodyFilter.type = 'lowpass';
    bodyFilter.frequency.setValueAtTime(freq * 5.2, time);
    bodyFilter.frequency.exponentialRampToValueAtTime(freq * 1.65, time + 0.28);
    bodyFilter.Q.value = 1.9;

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.0008, time);
    env.gain.linearRampToValueAtTime(gainAmp, time + 0.014);
    env.gain.exponentialRampToValueAtTime(gainAmp * 0.32, time + 0.22);
    env.gain.exponentialRampToValueAtTime(0.0008, time + 0.72);

    const oscBGain = this.ctx.createGain();
    oscBGain.gain.value = 0.28;

    oscA.connect(bodyFilter);
    oscB.connect(oscBGain);
    oscBGain.connect(bodyFilter);
    bodyFilter.connect(env);
    env.connect(this.lofiFilter);

    oscA.start(time);
    oscB.start(time);
    oscA.stop(time + 0.76);
    oscB.stop(time + 0.76);
  }

  private playQanunShimmer(time: number, freq: number, gainAmp: number): void {
    if (!this.ctx || !this.lofiFilter) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.0008, time);
    env.gain.linearRampToValueAtTime(gainAmp, time + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0008, time + 0.45);

    osc.connect(env);
    env.connect(this.lofiFilter);
    osc.start(time);
    osc.stop(time + 0.48);
  }

  private playWarmLofiChord(
    time: number,
    rootHz: number,
    intervals: number[],
    durationSec: number
  ): void {
    if (!this.ctx || !this.lofiFilter) return;
    const chordGain = this.ctx.createGain();
    chordGain.gain.setValueAtTime(0.001, time);
    chordGain.gain.linearRampToValueAtTime(0.068, time + 0.16);
    chordGain.gain.setValueAtTime(0.056, time + durationSec * 0.65);
    chordGain.gain.exponentialRampToValueAtTime(0.0008, time + durationSec);

    const padFilter = this.ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.setValueAtTime(680, time);
    padFilter.Q.value = 0.7;

    padFilter.connect(chordGain);
    chordGain.connect(this.lofiFilter);

    for (const mult of intervals) {
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(rootHz * mult, time);
      osc.connect(padFilter);
      osc.start(time);
      osc.stop(time + durationSec + 0.05);
    }
  }

  private playSoftKick(time: number): void {
    if (!this.ctx || !this.lofiFilter) return;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(118, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.12);

    env.gain.setValueAtTime(0.24, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.19);

    osc.connect(env);
    env.connect(this.lofiFilter);
    osc.start(time);
    osc.stop(time + 0.21);
  }

  private playLofiSnare(time: number): void {
    if (!this.ctx || !this.lofiFilter || !this.noiseBuffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1150, time);
    filter.Q.value = 1.2;

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0.095, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.11);

    src.connect(filter);
    filter.connect(env);
    env.connect(this.lofiFilter);
    src.start(time);
    src.stop(time + 0.12);
  }

  private playDarbukaTek(time: number, amp: number): void {
    if (!this.ctx || !this.lofiFilter || !this.noiseBuffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, time);
    filter.Q.value = 3.6;

    const env = this.ctx.createGain();
    env.gain.setValueAtTime(amp, time);
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.055);

    src.connect(filter);
    filter.connect(env);
    env.connect(this.lofiFilter);
    src.start(time);
    src.stop(time + 0.065);
  }

  public dispose(): void {
    this.stop();
    try {
      this.vinylNode?.stop();
      this.ctx?.close();
    } catch {
      // Ignore cleanup errors
    }
    this.ctx = null;
  }
}
