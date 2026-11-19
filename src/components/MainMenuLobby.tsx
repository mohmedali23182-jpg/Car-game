import React from 'react';
import { SaveGameSchemaV2 } from '../game/types';
import { VEHICLE_SPECS } from '../game/vehicleFleet';
import { ALL_OFFLINE_MISSIONS, getDriverRankTitleAr } from '../game/missionsCatalog';
import { YEMEN_CITY_HUBS, TOTAL_ROAD_LENGTH_M } from '../game/roadSpline';
import {
  Play,
  MapPin,
  Car,
  Flag,
  Sliders,
  Settings,
  Radio,
  Smartphone,
  Compass,
} from 'lucide-react';

interface MainMenuLobbyProps {
  saveState: SaveGameSchemaV2;
  radioPlaying: boolean;
  onStartDriving: () => void;
  onOpenWorldMap: () => void;
  onOpenMissions: () => void;
  onOpenGarage: () => void;
  onOpenControlStudio: () => void;
  onOpenSettings: () => void;
  onToggleRadioFromLobby: () => void;
}

export const MainMenuLobby: React.FC<MainMenuLobbyProps> = ({
  saveState,
  radioPlaying,
  onStartDriving,
  onOpenWorldMap,
  onOpenMissions,
  onOpenGarage,
  onOpenControlStudio,
  onOpenSettings,
  onToggleRadioFromLobby,
}) => {
  const rankInfo = getDriverRankTitleAr(saveState.driverXp);
  const currentVehicle = VEHICLE_SPECS[saveState.selectedVehicleId];
  const completedMissionsCount = Object.values(
    saveState.missionCompletions || {}
  ).filter((c) => c > 0).length;
  const visitedCitiesCount = (saveState.visitedCities || []).length;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-40 pointer-events-none flex flex-col justify-between p-4 sm:p-6"
      style={{
        background:
          'linear-gradient(90deg, rgba(9,13,22,0.18) 0%, rgba(9,13,22,0.52) 55%, rgba(9,13,22,0.88) 100%)',
      }}
    >
      {/* Top Status Bar */}
      <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-3">
        <div className="px-4 py-2 rounded-2xl bg-slate-950/88 border border-stone-800 flex items-center gap-3 text-xs text-stone-200 shadow-xl">
          <div className="flex items-center gap-1.5 text-amber-300 font-bold">
            <Compass className="w-4 h-4" />
            <span>{rankInfo.rankTitleAr}</span>
          </div>
          <span className="text-stone-600">·</span>
          <span className="font-mono-num tabular-nums font-bold text-amber-400">
            {saveState.masalikCoins.toLocaleString()} ر.ي
          </span>
          <span className="text-stone-600 hidden sm:inline">·</span>
          <span className="text-stone-300 hidden sm:inline font-mono-num tabular-nums">
            {(saveState.totalCareerDistanceM / 1000).toFixed(1)} كم مقطوعة
          </span>
          <span className="text-stone-600 hidden md:inline">·</span>
          <span className="text-emerald-400 hidden md:inline flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 inline ml-1" />
            قاعدة بيانات الهاتف (محلي 100%)
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleRadioFromLobby}
          className={`px-3.5 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 transition shadow-xl ${
            radioPlaying
              ? 'bg-amber-500 text-slate-950 border-amber-300'
              : 'bg-slate-950/88 text-stone-200 border-stone-700 hover:border-amber-400'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>{radioPlaying ? 'راديو Lo-Fi يمني يعمل' : 'تشغيل راديو Lo-Fi يمني'}</span>
        </button>
      </div>

      {/* Right-aligned AAA Editorial Hero & Navigation Panel (leaves left 3D vehicle showcase clear) */}
      <div className="pointer-events-auto my-auto w-full max-w-md ml-auto space-y-5">
        <div className="space-y-2">
          <div className="text-[11px] font-bold tracking-widest text-amber-400 uppercase">
            MASALIK — ROADS OF YEMEN · v2.0 OFFLINE
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-stone-50 leading-tight">
            مَسَالِك
            <span className="block text-xl sm:text-2xl font-bold text-amber-300 mt-1">
              دروب اليمن الجبلية المفتوحة
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            محاكاة قيادة واقعية ثلاثية الأبعاد عبر {(TOTAL_ROAD_LENGTH_M / 1000).toFixed(0)} كم من جبال
            تعز ونقيل سمارة وإب وصنعاء القديمة ومأرب وعدن وشبام حضرموت — بقاعدة بيانات محلية على الهاتف.
          </p>
        </div>

        {/* Active Vehicle Summary Line */}
        <div className="px-4 py-2.5 rounded-2xl bg-slate-950/88 border border-stone-800 flex items-center justify-between text-xs">
          <div>
            <div className="text-[10px] text-stone-400">المركبة الجاهزة للانطلاق</div>
            <div className="font-bold text-stone-100 mt-0.5">
              {currentVehicle.nameAr} · {currentVehicle.categoryAr}
            </div>
          </div>
          <div className="text-left font-mono-num tabular-nums">
            <div className="text-amber-400 font-bold">{currentVehicle.maxPowerHp} HP</div>
            <div className="text-[10px] text-stone-400">
              {saveState.unlockedVehicles.length}/10 مركبات
            </div>
          </div>
        </div>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={onStartDriving}
          className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-slate-950 font-black text-base flex items-center justify-center gap-2.5 shadow-2xl transition"
        >
          <Play className="w-5 h-5 fill-current" />
          انطلق للقيادة الآن
        </button>

        {/* Structured AAA Navigation Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onOpenWorldMap}
            className="p-3 rounded-2xl bg-slate-950/88 hover:bg-slate-900 border border-stone-800 hover:border-amber-400/70 text-right transition group"
          >
            <div className="flex items-center justify-between">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="font-mono-num tabular-nums text-[10px] text-stone-400">
                {visitedCitiesCount}/{YEMEN_CITY_HUBS.length}
              </span>
            </div>
            <div className="text-xs font-bold text-stone-100 mt-2">
              خريطة مدن اليمن
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">
              انتقال سريع عبر 10 مدن وجبال
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenMissions}
            className="p-3 rounded-2xl bg-slate-950/88 hover:bg-slate-900 border border-stone-800 hover:border-amber-400/70 text-right transition"
          >
            <div className="flex items-center justify-between">
              <Flag className="w-4 h-4 text-amber-400" />
              <span className="font-mono-num tabular-nums text-[10px] text-stone-400">
                {completedMissionsCount}/{ALL_OFFLINE_MISSIONS.length}
              </span>
            </div>
            <div className="text-xs font-bold text-stone-100 mt-2">
              طور القصة والمهمات
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">
              5 فصول و65 مهمة دون إنترنت
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenGarage}
            className="p-3 rounded-2xl bg-slate-950/88 hover:bg-slate-900 border border-stone-800 hover:border-amber-400/70 text-right transition"
          >
            <div className="flex items-center justify-between">
              <Car className="w-4 h-4 text-sky-400" />
              <span className="font-mono-num tabular-nums text-[10px] text-stone-400">
                10 مركبات
              </span>
            </div>
            <div className="text-xs font-bold text-stone-100 mt-2">
              الكراج والورشة 3D
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">
              ترقيات ميكانيكية وطلاء وإطارات
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenControlStudio}
            className="p-3 rounded-2xl bg-slate-950/88 hover:bg-slate-900 border border-stone-800 hover:border-amber-400/70 text-right transition"
          >
            <div className="flex items-center justify-between">
              <Sliders className="w-4 h-4 text-rose-400" />
              <span className="text-[10px] text-stone-400">HUD Studio</span>
            </div>
            <div className="text-xs font-bold text-stone-100 mt-2">
              استوديو التحكم
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">
              تخصيص المقود والدواسات للهاتف
            </div>
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full py-2.5 px-4 rounded-2xl bg-slate-950/88 hover:bg-slate-900 border border-stone-800 text-stone-200 text-xs font-bold flex items-center justify-center gap-2 transition"
        >
          <Settings className="w-4 h-4 text-amber-400" />
          الإعدادات، الطقس، الميكسر الصوتي وقاعدة بيانات الهاتف
        </button>
      </div>

      {/* Footer Credits */}
      <div className="pointer-events-auto flex items-center justify-between text-[11px] text-stone-400">
        <span>برمجة وتطوير معتز العلقمي – تعز – اليمن – 2026م</span>
        <span className="hidden sm:inline font-mono-num">
          100% OFFLINE · 3D REALISTIC SIMULATION
        </span>
      </div>
    </div>
  );
};
