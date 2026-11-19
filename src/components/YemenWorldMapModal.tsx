import React, { useState } from 'react';
import { YemenCityHub } from '../game/types';
import {
  YEMEN_CITY_HUBS,
  YEMEN_REGIONS,
  TOTAL_ROAD_LENGTH_M,
} from '../game/roadSpline';
import {
  MapPin,
  Navigation,
  Mountain,
  CloudSun,
  X,
  CheckCircle2,
  Compass,
} from 'lucide-react';

interface YemenWorldMapModalProps {
  currentDistanceM: number;
  visitedCities: string[];
  onFastTravelToCity: (city: YemenCityHub) => void;
  onClose: () => void;
}

const WEATHER_LABELS_AR: Record<string, string> = {
  clear: 'صحو مشمس',
  cloudy: 'غائم جبلي',
  mountain_fog: 'ضباب كثيف',
  light_rain: 'مطر خفيف',
  heavy_rain: 'أمطار غزيرة',
  sandstorm: 'عاصفة رملية',
};

export const YemenWorldMapModal: React.FC<YemenWorldMapModalProps> = ({
  currentDistanceM,
  visitedCities,
  onFastTravelToCity,
  onClose,
}) => {
  const nearestCity = YEMEN_CITY_HUBS.reduce((best, c) =>
    Math.abs(c.distanceM - currentDistanceM) <
    Math.abs(best.distanceM - currentDistanceM)
      ? c
      : best
  );

  const [selectedCity, setSelectedCity] = useState<YemenCityHub>(nearestCity);

  // Build SVG polyline path through all 10 Yemeni cities in road order
  const routePolyline = YEMEN_CITY_HUBS.map((c) => `${c.mapX},${c.mapY}`).join(
    ' '
  );

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 bg-slate-950/94 flex flex-col text-stone-100 select-none"
    >
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-900 border-b border-stone-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-amber-300">
              خريطة دروب ومدن اليمن المفتوحة ({(TOTAL_ROAD_LENGTH_M / 1000).toFixed(0)} كم ·{' '}
              {YEMEN_REGIONS.length} مناطق)
            </h2>
            <p className="text-xs text-stone-400">
              اختر أي مدينة أو نقيل جبلي للانتقال السريع فورًا واستكشاف تضاريس اليمن
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-200 flex items-center gap-1.5"
        >
          <X className="w-4 h-4" />
          إغلاق
        </button>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-6xl mx-auto w-full">
        {/* Stylized Interactive Map of Yemen (Left/Top) */}
        <div className="lg:col-span-7 rounded-3xl bg-slate-900 border border-stone-800 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-stone-200">
              مسار الطريق الجبلي والصحراوي والساحلي
            </span>
            <span className="font-mono-num tabular-nums text-amber-400">
              موقعك الحالي: {(currentDistanceM / 1000).toFixed(2)} كم
            </span>
          </div>

          <div className="relative w-full aspect-[16/10] rounded-2xl bg-[#0a1324] border border-stone-800 overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Topographic Grid */}
              <defs>
                <pattern
                  id="yemenGrid"
                  width="10"
                  height="10"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 10 0 L 0 0 0 10"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="0.3"
                  />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#yemenGrid)" />

              {/* Stylized Yemen Peninsula Landmass Contour */}
              <path
                d="M 12 22 L 42 18 L 88 18 L 93 48 L 76 62 L 56 72 L 38 89 L 19 88 L 13 62 L 10 42 Z"
                fill="#152238"
                stroke="#334155"
                strokeWidth="0.8"
              />

              {/* Red Sea / Gulf of Aden Labels */}
              <text
                x="5"
                y="70"
                fill="#38bdf8"
                opacity="0.45"
                fontSize="2.7"
                fontWeight="bold"
              >
                البحر الأحمر
              </text>
              <text
                x="54"
                y="90"
                fill="#38bdf8"
                opacity="0.45"
                fontSize="2.7"
                fontWeight="bold"
              >
                خليج عدن والبحر العربي
              </text>

              {/* Connecting Highway Network */}
              <polyline
                points={routePolyline}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.2"
                strokeDasharray="2 1.2"
                opacity="0.75"
              />

              {/* Interactive City Hub Pins */}
              {YEMEN_CITY_HUBS.map((city) => {
                const isSelected = selectedCity.id === city.id;
                const isVisited = visitedCities.includes(city.id);
                const isCurrent = nearestCity.id === city.id;
                return (
                  <g
                    key={city.id}
                    onClick={() => setSelectedCity(city)}
                    className="cursor-pointer"
                  >
                    {isSelected && (
                      <circle
                        cx={city.mapX}
                        cy={city.mapY}
                        r="4.6"
                        fill="#f59e0b"
                        opacity="0.24"
                      />
                    )}
                    <circle
                      cx={city.mapX}
                      cy={city.mapY}
                      r={isSelected ? 2.6 : 2.0}
                      fill={
                        isCurrent
                          ? '#38bdf8'
                          : isSelected
                          ? '#f59e0b'
                          : isVisited
                          ? '#10b981'
                          : '#94a3b8'
                      }
                      stroke="#090d16"
                      strokeWidth="0.6"
                    />
                    <text
                      x={city.mapX}
                      y={city.mapY - 3.6}
                      textAnchor="middle"
                      fill={isSelected ? '#fcd34d' : '#cbd5e1'}
                      fontSize={isSelected ? '3.1' : '2.5'}
                      fontWeight="bold"
                    >
                      {city.nameAr.split('—')[0].trim()}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Elevation Profile Bar */}
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="p-2 rounded-xl bg-slate-950 border border-stone-800">
              <div className="text-stone-400">أعلى قمة</div>
              <div className="font-mono-num tabular-nums font-bold text-amber-300">
                2,490م (نقيل يسلح)
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-stone-800">
              <div className="text-stone-400">أدنى نقطة</div>
              <div className="font-mono-num tabular-nums font-bold text-sky-300">
                18م (ساحل عدن)
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-stone-800">
              <div className="text-stone-400">المدن المكتشفة</div>
              <div className="font-mono-num tabular-nums font-bold text-emerald-400">
                {visitedCities.length} / {YEMEN_CITY_HUBS.length}
              </div>
            </div>
          </div>
        </div>

        {/* Selected City Inspector + City Directory (Right/Bottom) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Selected City Detail Card */}
          <div className="p-4 rounded-3xl bg-slate-900 border border-amber-500/40 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] font-bold text-amber-400">
                  {selectedCity.governorateAr}
                </div>
                <h3 className="text-base font-black text-stone-50 mt-0.5">
                  {selectedCity.nameAr}
                </h3>
              </div>
              {visitedCities.includes(selectedCity.id) && (
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 text-[10px] font-bold flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                  مكتشفة
                </span>
              )}
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              {selectedCity.subtitleAr}
            </p>

            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="p-2 rounded-xl bg-slate-950 border border-stone-800">
                <div className="text-stone-400 flex items-center gap-1">
                  <Mountain className="w-3 h-3 text-amber-400" />
                  الارتفاع
                </div>
                <div className="font-mono-num tabular-nums font-bold text-stone-100 mt-0.5">
                  {selectedCity.altitudeM}م
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-stone-800">
                <div className="text-stone-400 flex items-center gap-1">
                  <CloudSun className="w-3 h-3 text-sky-400" />
                  الأجواء
                </div>
                <div className="font-bold text-stone-100 mt-0.5 truncate">
                  {WEATHER_LABELS_AR[selectedCity.defaultWeather] || 'صحو'}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-stone-800">
                <div className="text-stone-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  المسافة
                </div>
                <div className="font-mono-num tabular-nums font-bold text-stone-100 mt-0.5">
                  {(selectedCity.distanceM / 1000).toFixed(1)} كم
                </div>
              </div>
            </div>

            <div className="text-[11px] text-stone-400">
              أبرز المعالم:{' '}
              <span className="text-stone-200 font-semibold">
                {selectedCity.highlightsAr.join(' · ')}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onFastTravelToCity(selectedCity)}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition shadow-lg"
            >
              <Navigation className="w-4 h-4" />
              انتقال سريع والقيادة في {selectedCity.nameAr.split('—')[0].trim()}
            </button>
          </div>

          {/* All 10 Yemeni Cities List */}
          <div className="flex-1 rounded-3xl bg-slate-900 border border-stone-800 p-3 space-y-1.5 max-h-[280px] overflow-y-auto">
            {YEMEN_CITY_HUBS.map((city) => {
              const active = city.id === selectedCity.id;
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => setSelectedCity(city)}
                  className={`w-full px-3 py-2 rounded-xl border text-right flex items-center justify-between gap-2 transition ${
                    active
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-slate-950/75 border-stone-800 text-stone-300 hover:border-stone-600'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">{city.nameAr}</div>
                    <div className="text-[10px] text-stone-400 truncate">
                      {city.governorateAr} · ارتفاع {city.altitudeM}م
                    </div>
                  </div>
                  <span className="font-mono-num tabular-nums text-[10px] text-amber-400 shrink-0">
                    {(city.distanceM / 1000).toFixed(1)} كم
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
