import React, { useEffect, useState } from 'react';
import { RadioPlayerSettings, RadioStationId } from '../game/types';
import {
  YEMENI_LOFI_STATIONS,
  YemeniLofiRadioEngine,
} from '../game/yemeniLofiRadioEngine';
import {
  Radio,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Disc3,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';

interface YemeniRadioPlayerProps {
  settings: RadioPlayerSettings;
  radioEngine: YemeniLofiRadioEngine | null;
  onTogglePlay: () => void;
  onSelectStation: (id: RadioStationId) => void;
  onNextStation: () => void;
  onPrevStation: () => void;
  onChangeVolume: (vol: number) => void;
  onToggleVinyl: () => void;
  onClose: () => void;
}

export const YemeniRadioPlayer: React.FC<YemeniRadioPlayerProps> = ({
  settings,
  radioEngine,
  onTogglePlay,
  onSelectStation,
  onNextStation,
  onPrevStation,
  onChangeVolume,
  onToggleVinyl,
  onClose,
}) => {
  const [bars, setBars] = useState<number[]>(() => new Array(16).fill(0.12));
  const [stationsOpen, setStationsOpen] = useState<boolean>(false);

  const currentStation =
    YEMENI_LOFI_STATIONS.find((s) => s.id === settings.stationId) ||
    YEMENI_LOFI_STATIONS[0];

  useEffect(() => {
    if (!settings.isPlaying || !radioEngine) {
      setBars(new Array(16).fill(0.1));
      return;
    }
    let raf = 0;
    let lastUpdate = 0;
    const tick = (now: number) => {
      if (now - lastUpdate >= 65) {
        lastUpdate = now;
        setBars(radioEngine.getFrequencyBars(16));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [settings.isPlaying, radioEngine]);

  return (
    <div
      dir="rtl"
      onPointerDown={(e) => e.stopPropagation()}
      className="fixed top-[76px] left-3 z-30 w-[292px] sm:w-[310px] rounded-2xl bg-slate-950/92 border border-amber-500/45 shadow-2xl text-stone-100 select-none overflow-hidden"
    >
      {/* Top Stereo Bezel */}
      <div className="px-3.5 py-2 bg-stone-900/95 border-b border-stone-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Radio
            className="w-4 h-4 shrink-0"
            style={{ color: currentStation.accentHex }}
          />
          <span className="text-[11px] font-bold tracking-wide text-amber-300 truncate">
            راديو مَسَالِك · لو-فاي يمني
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            dir="ltr"
            className="font-mono-num tabular-nums text-[11px] font-black px-1.5 py-0.5 rounded bg-slate-950 border border-stone-700 text-amber-300"
          >
            {currentStation.frequencyFm}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300"
            title="إخفاء مشغل الراديو (يبقى الصوت يعمل إذا كان قيد التشغيل)"
            aria-label="إخفاء الراديو"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main LCD Display + Spectrum */}
      <div className="p-3.5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm font-black text-stone-50 truncate">
              {currentStation.nameAr}
            </div>
            <div className="text-[11px] text-amber-300/90 truncate mt-0.5">
              {currentStation.subtitleAr}
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5 flex items-center gap-1.5">
              <span>{currentStation.cityAr}</span>
              <span>·</span>
              <span>{currentStation.maqamAr}</span>
              <span>·</span>
              <span dir="ltr" className="font-mono-num tabular-nums">
                {currentStation.bpm} BPM
              </span>
            </div>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 whitespace-nowrap ${
              settings.isPlaying
                ? 'bg-emerald-500/20 border-emerald-400/70 text-emerald-300'
                : 'bg-stone-900 border-stone-700 text-stone-400'
            }`}
          >
            {settings.isPlaying ? 'يبث الآن' : 'متوقف'}
          </span>
        </div>

        {/* Live 16-Bar FFT Spectrum Visualizer */}
        <div
          dir="ltr"
          className="h-10 px-2 py-1.5 rounded-xl bg-slate-900 border border-stone-800/90 flex items-end justify-between gap-1"
        >
          {bars.map((val, idx) => (
            <div
              key={idx}
              className="flex-1 rounded-sm transition-all duration-75"
              style={{
                height: `${Math.max(12, Math.round(val * 100))}%`,
                backgroundColor: settings.isPlaying
                  ? currentStation.accentHex
                  : '#334155',
                opacity: settings.isPlaying ? 0.5 + val * 0.5 : 0.45,
              }}
            />
          ))}
        </div>

        {/* Playback Transport Controls */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onPrevStation}
              className="w-9 h-9 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-200"
              title="المحطة السابقة"
              aria-label="المحطة السابقة"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onTogglePlay}
              className={`px-4 h-9 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition whitespace-nowrap ${
                settings.isPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-300'
              }`}
            >
              {settings.isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  إيقاف
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  تشغيل
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onNextStation}
              className="w-9 h-9 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-200"
              title="المحطة التالية"
              aria-label="المحطة التالية"
            >
              <SkipBack className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleVinyl}
            className={`px-2.5 h-9 rounded-xl text-[10px] font-bold border flex items-center gap-1 whitespace-nowrap ${
              settings.lofiVinylEnabled
                ? 'bg-amber-500/20 border-amber-400/80 text-amber-300'
                : 'bg-stone-900 border-stone-700 text-stone-400'
            }`}
            title="تشغيل/إيقاف دفء وخشخشة شريط لو-فاي الكلاسيكي"
          >
            <Disc3 className="w-3.5 h-3.5" />
            فينيل
          </button>
        </div>

        {/* Radio Volume Slider */}
        <div className="flex items-center gap-2 pt-0.5">
          <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.volume}
            onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
            className="flex-1 accent-amber-500 h-1.5"
            aria-label="مستوى صوت الراديو"
          />
          <span className="font-mono-num tabular-nums text-[10px] text-stone-300 w-8 text-left">
            {Math.round(settings.volume * 100)}%
          </span>
        </div>

        {/* Station List Toggle */}
        <button
          type="button"
          onClick={() => setStationsOpen((v) => !v)}
          className="w-full py-1.5 px-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-[11px] font-bold text-stone-300 flex items-center justify-between"
        >
          <span>المحطات اليمنية ({YEMENI_LOFI_STATIONS.length} محطات دون إنترنت)</span>
          {stationsOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
          )}
        </button>

        {stationsOpen && (
          <div className="space-y-1 max-h-40 overflow-y-auto pt-0.5">
            {YEMENI_LOFI_STATIONS.map((st) => {
              const active = st.id === settings.stationId;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => onSelectStation(st.id)}
                  className={`w-full px-2.5 py-1.5 rounded-xl text-right border transition flex items-center justify-between gap-2 ${
                    active
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-slate-900/90 border-stone-800 text-stone-300 hover:border-stone-600'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold truncate">{st.nameAr}</div>
                    <div className="text-[9px] text-stone-400 truncate">
                      {st.subtitleAr}
                    </div>
                  </div>
                  <span
                    dir="ltr"
                    className="font-mono-num tabular-nums text-[10px] text-amber-400 shrink-0"
                  >
                    {st.frequencyFm}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
