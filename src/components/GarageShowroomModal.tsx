import React, { useState, useRef } from 'react';
import {
  VehicleId,
  SaveGameSchemaV2,
  VehicleCustomization,
  PaintFinishType,
} from '../game/types';
import { ALL_VEHICLE_IDS, VEHICLE_SPECS } from '../game/vehicleFleet';
import {
  Car,
  Wrench,
  Palette,
  Sparkles,
  Fuel,
  ShieldCheck,
  Lock,
  Check,
  RotateCw,
  X,
} from 'lucide-react';

interface GarageShowroomModalProps {
  saveState: SaveGameSchemaV2;
  previewVehicleId: VehicleId;
  onSelectPreviewVehicle: (id: VehicleId) => void;
  onConfirmSelectVehicle: (id: VehicleId) => void;
  onUnlockVehicle: (id: VehicleId, price: number) => void;
  onUpdateCustomization: (id: VehicleId, custom: VehicleCustomization) => void;
  onUpgradeMechanical: (
    id: VehicleId,
    part:
      | 'engineUpgradeLevel'
      | 'transmissionUpgradeLevel'
      | 'suspensionUpgradeLevel'
      | 'brakeUpgradeLevel',
    cost: number
  ) => void;
  onRepairVehicle: (id: VehicleId, cost: number) => void;
  onRefuelVehicle: (id: VehicleId, cost: number) => void;
  onWashVehicle: (id: VehicleId, cost: number) => void;
  onOrbitDelta: (deltaRad: number) => void;
  onClose: () => void;
}

const YEMENI_PAINT_SWATCHES: {
  id: string;
  nameAr: string;
  hex: string;
  finish: PaintFinishType;
}[] = [
  { id: 'copper', nameAr: 'نحاسي تعز', hex: '#c87236', finish: 'metallic' },
  { id: 'sky', nameAr: 'أزرق الساحل', hex: '#2b6cb0', finish: 'metallic' },
  { id: 'sand', nameAr: 'ذهبي مأرب', hex: '#d4a253', finish: 'matte' },
  { id: 'green', nameAr: 'أخضر مدرجات إب', hex: '#3f6a3c', finish: 'metallic' },
  { id: 'pearl', nameAr: 'لؤلؤي صنعاء', hex: '#f8fafc', finish: 'pearl' },
  { id: 'crimson', nameAr: 'أحمر عقيق يمني', hex: '#b91c1c', finish: 'metallic' },
  { id: 'slate', nameAr: 'رمادي صخور النقيل', hex: '#334155', finish: 'matte' },
  { id: 'rescue', nameAr: 'برتقالي طوارئ', hex: '#ea580c', finish: 'pearl' },
  { id: 'olive', nameAr: 'زيتوني الأصيل', hex: '#4d7c0f', finish: 'matte' },
  { id: 'obsidian', nameAr: 'أسود بازلتي', hex: '#18181b', finish: 'metallic' },
];

const YEMENI_PLATES = [
  'تعز ٤٠٢١',
  'صنعاء ٩٠٨٤',
  'عدن ٥٥١٢',
  'إب ٢١٩٠',
  'مأرب ٧٧٣٠',
  'حضرموت ٣٣١٠',
];

export const GarageShowroomModal: React.FC<GarageShowroomModalProps> = ({
  saveState,
  previewVehicleId,
  onSelectPreviewVehicle,
  onConfirmSelectVehicle,
  onUnlockVehicle,
  onUpdateCustomization,
  onUpgradeMechanical,
  onRepairVehicle,
  onRefuelVehicle,
  onWashVehicle,
  onOrbitDelta,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<
    'specs' | 'upgrades' | 'cosmetics' | 'service'
  >('specs');
  const dragPointerId = useRef<number | null>(null);
  const lastDragX = useRef<number>(0);

  const spec = VEHICLE_SPECS[previewVehicleId];
  const isUnlocked = saveState.unlockedVehicles.includes(previewVehicleId);
  const isSelected = saveState.selectedVehicleId === previewVehicleId;
  const custom = saveState.customizations[previewVehicleId];
  const dmg = saveState.damageByVehicle[previewVehicleId];

  const engLvl = custom?.engineUpgradeLevel || 1;
  const transLvl = custom?.transmissionUpgradeLevel || 1;

  const effectiveHp = Math.round(spec.maxPowerHp * (1 + (engLvl - 1) * 0.06));
  const effectiveTorque = Math.round(
    spec.maxEngineTorqueNm * (1 + (engLvl - 1) * 0.07)
  );
  const effectiveTopSpeed = Math.round(
    (135 + spec.maxPowerHp * 0.16) * (1 + (transLvl - 1) * 0.04)
  );

  const healthPct = Math.round(dmg?.bodyHealthPct ?? 100);
  const dirtPct = Math.round((dmg?.dirtMudLevel ?? 0) * 100);
  const fuelLiters = Math.round(
    saveState.fuelByVehicle[previewVehicleId] ?? spec.fuelTankLiters
  );

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-40 pointer-events-none flex flex-col justify-between text-stone-100 select-none"
    >
      <div className="pointer-events-auto flex items-center justify-between px-5 py-3 bg-slate-950/85 border-b border-stone-800/90 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-amber-300">
              معرض وورشة مَسَالِك — الأسطول الكامل (10 مركبات ثلاثية الأبعاد)
            </h2>
            <p className="text-xs text-stone-400 flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 text-amber-400" />
              اسحب في منتصف الشاشة لتدوير الكاميرا 360° حول المركبة ومعاينة التعديلات مباشرة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-stone-900 border border-amber-500/40 text-xs font-bold flex items-center gap-2">
            <span className="text-stone-400">الرصيد:</span>
            <span className="text-amber-400 font-mono-num text-sm">
              {saveState.masalikCoins.toLocaleString()} ر.ي
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-200 flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            العودة للقيادة
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <div
          onPointerDown={(e) => {
            dragPointerId.current = e.pointerId;
            lastDragX.current = e.clientX;
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (dragPointerId.current !== e.pointerId) return;
            const dx = e.clientX - lastDragX.current;
            lastDragX.current = e.clientX;
            onOrbitDelta(dx * 0.011);
          }}
          onPointerUp={(e) => {
            if (dragPointerId.current === e.pointerId) {
              dragPointerId.current = null;
            }
          }}
          className="flex-1 pointer-events-auto cursor-grab active:cursor-grabbing flex flex-col justify-between p-5"
        >
          <div className="self-start bg-slate-950/80 border border-stone-700/80 backdrop-blur-md rounded-2xl px-4 py-3 max-w-md shadow-xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[11px] font-bold">
                {spec.categoryAr}
              </span>
              <span className="text-xs text-stone-400 font-mono-num">
                {spec.defaultDrivetrain} · {spec.forwardGearsCount} غيارات
              </span>
            </div>
            <h3 className="text-xl font-bold text-stone-100 mt-1">
              {spec.titleAr}
            </h3>
            <p className="text-xs text-stone-300 mt-1 leading-relaxed">
              {spec.descriptionAr}
            </p>
          </div>

          <div className="self-start flex items-center gap-3">
            {isUnlocked ? (
              <button
                type="button"
                onClick={() => {
                  onConfirmSelectVehicle(previewVehicleId);
                  onClose();
                }}
                className={`px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-xl transition ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                <Check className="w-4 h-4" />
                {isSelected
                  ? 'المركبة المختارة حاليًا — انطلق للطريق'
                  : 'اعتماد هذه المركبة للقيادة'}
              </button>
            ) : (
              <button
                type="button"
                disabled={saveState.masalikCoins < spec.unlockPriceCoins}
                onClick={() =>
                  onUnlockVehicle(previewVehicleId, spec.unlockPriceCoins)
                }
                className={`px-6 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-xl transition ${
                  saveState.masalikCoins >= spec.unlockPriceCoins
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                }`}
              >
                <Lock className="w-4 h-4" />
                شراء المركبة مقابل {spec.unlockPriceCoins.toLocaleString()} ر.ي
              </button>
            )}
          </div>
        </div>

        <div className="pointer-events-auto w-96 bg-slate-950/90 border-r border-stone-800 backdrop-blur-md flex flex-col overflow-hidden">
          <div className="grid grid-cols-4 gap-1 p-2 bg-slate-900 border-b border-stone-800">
            {[
              { id: 'specs', label: 'المواصفات', icon: Car },
              { id: 'upgrades', label: 'الترقيات', icon: Wrench },
              { id: 'cosmetics', label: 'المظهر', icon: Palette },
              { id: 'service', label: 'الصيانة', icon: Sparkles },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as typeof activeTab)}
                  className={`py-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition ${
                    activeTab === t.id
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-stone-400 hover:bg-stone-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {activeTab === 'specs' && (
              <div className="space-y-3">
                {[
                  {
                    label: 'القوة الحصانية',
                    val: `${effectiveHp} حصان`,
                    pct: Math.min(100, (effectiveHp / 450) * 100),
                  },
                  {
                    label: 'عزم الدوران الجبلي',
                    val: `${effectiveTorque} نيوتن.م`,
                    pct: Math.min(100, (effectiveTorque / 1200) * 100),
                  },
                  {
                    label: 'السرعة القصوى التقريبية',
                    val: `${effectiveTopSpeed} كم/س`,
                    pct: Math.min(100, (effectiveTopSpeed / 220) * 100),
                  },
                  {
                    label: 'الوزن الأساسي',
                    val: `${spec.baseMassKg} كجم`,
                    pct: Math.min(100, (spec.baseMassKg / 4800) * 100),
                  },
                  {
                    label: 'سعة خزان الوقود',
                    val: `${spec.fuelTankLiters} لتر`,
                    pct: Math.min(100, (spec.fuelTankLiters / 170) * 100),
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="bg-slate-900/90 p-3 rounded-xl border border-stone-800"
                  >
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-stone-300 font-bold">{row.label}</span>
                      <span className="text-amber-400 font-mono-num font-bold">
                        {row.val}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-l from-amber-400 to-amber-600 rounded-full"
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'upgrades' && custom && (
              <div className="space-y-2.5">
                {(
                  [
                    {
                      key: 'engineUpgradeLevel',
                      nameAr: 'ترقية المحرك والتيربو',
                      descAr: 'يزيد القوة الحصانية وعزم الصعود الجبلي (+7% لكل مستوى)',
                      baseCost: 1400,
                    },
                    {
                      key: 'transmissionUpgradeLevel',
                      nameAr: 'ترقية ناقل الحركة والتفاضل',
                      descAr: 'يرفع السرعة القصوى ويحسّن استجابة التبديل',
                      baseCost: 1200,
                    },
                    {
                      key: 'suspensionUpgradeLevel',
                      nameAr: 'ترقية نظام التعليق الجبلي',
                      descAr: 'يمتص صدمات الصخور والمدرجات ويزيد الثبات',
                      baseCost: 1100,
                    },
                    {
                      key: 'brakeUpgradeLevel',
                      nameAr: 'ترقية المكابح المهواة',
                      descAr: 'يقلل مسافة التوقف في المنحدرات الحادة (+8% لكل مستوى)',
                      baseCost: 1000,
                    },
                  ] as const
                ).map((u) => {
                  const lvl = custom[u.key] || 1;
                  const nextCost = u.baseCost * lvl;
                  const isMax = lvl >= 5;
                  return (
                    <div
                      key={u.key}
                      className="p-3 rounded-xl bg-slate-900/90 border border-stone-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-stone-100">
                            {u.nameAr}
                          </div>
                          <div className="text-[10px] text-stone-400">{u.descAr}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono-num text-xs font-bold">
                          مستوى {lvl}/5
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((step) => (
                          <div
                            key={step}
                            className={`h-1.5 flex-1 rounded-full ${
                              step <= lvl ? 'bg-amber-400' : 'bg-stone-800'
                            }`}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        disabled={
                          !isUnlocked ||
                          isMax ||
                          saveState.masalikCoins < nextCost
                        }
                        onClick={() =>
                          onUpgradeMechanical(previewVehicleId, u.key, nextCost)
                        }
                        className={`w-full py-1.5 rounded-lg text-xs font-bold transition ${
                          isMax
                            ? 'bg-emerald-500/20 text-emerald-300 cursor-default'
                            : isUnlocked && saveState.masalikCoins >= nextCost
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                            : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                        }`}
                      >
                        {isMax
                          ? 'تم الوصول للحد الأقصى (5/5)'
                          : `ترقية للمستوى ${lvl + 1} (${nextCost.toLocaleString()} ر.ي)`}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'cosmetics' && custom && (
              <div className="space-y-3">
                <div className="bg-slate-900/90 p-3 rounded-xl border border-stone-800">
                  <div className="text-xs font-bold text-stone-200 mb-2">
                    طلاء الهيكل (ألوان الهوية اليمنية)
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {YEMENI_PAINT_SWATCHES.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          onUpdateCustomization(previewVehicleId, {
                            ...custom,
                            paintColorHex: p.hex,
                            paintFinish: p.finish,
                          })
                        }
                        title={p.nameAr}
                        style={{ backgroundColor: p.hex }}
                        className={`h-8 rounded-lg border-2 transition ${
                          custom.paintColorHex === p.hex
                            ? 'border-amber-300 scale-105 shadow-md'
                            : 'border-stone-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-stone-800 space-y-2">
                  <div className="text-xs font-bold text-stone-200">
                    لوحة المركبة اليمنية (المحافظة والرقم)
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {YEMENI_PLATES.map((plate) => (
                      <button
                        key={plate}
                        type="button"
                        onClick={() =>
                          onUpdateCustomization(previewVehicleId, {
                            ...custom,
                            plateTextAr: plate,
                          })
                        }
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border ${
                          custom.plateTextAr === plate
                            ? 'bg-amber-500 text-slate-950 border-amber-300'
                            : 'bg-slate-950 text-stone-300 border-stone-800'
                        }`}
                      >
                        {plate}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-stone-800 space-y-2">
                  <div className="text-xs font-bold text-stone-200">
                    التجهيزات الجبلية والزخارف
                  </div>
                  <label className="flex items-center justify-between text-xs text-stone-300 py-1 cursor-pointer">
                    <span>شبك سقف علوي للرحلات</span>
                    <input
                      type="checkbox"
                      checked={custom.roofRackInstalled}
                      onChange={(e) =>
                        onUpdateCustomization(previewVehicleId, {
                          ...custom,
                          roofRackInstalled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-amber-500"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-stone-300 py-1 cursor-pointer">
                    <span>صندوق أمتعة علوي (Roof Box)</span>
                    <input
                      type="checkbox"
                      checked={custom.roofCargoBoxInstalled}
                      onChange={(e) =>
                        onUpdateCustomization(previewVehicleId, {
                          ...custom,
                          roofCargoBoxInstalled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-amber-500"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-stone-300 py-1 cursor-pointer">
                    <span>كشافات ضباب جبلية إضافية</span>
                    <input
                      type="checkbox"
                      checked={custom.auxLightsInstalled}
                      onChange={(e) =>
                        onUpdateCustomization(previewVehicleId, {
                          ...custom,
                          auxLightsInstalled: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-amber-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'service' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-stone-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-stone-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      سلامة الهيكل والمحرك
                    </span>
                    <span className="font-mono-num text-emerald-400 font-bold">
                      {healthPct}%
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={healthPct >= 100 || saveState.masalikCoins < 350}
                    onClick={() => onRepairVehicle(previewVehicleId, 350)}
                    className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-800 disabled:text-stone-500 text-slate-950 text-xs font-bold"
                  >
                    {healthPct >= 100
                      ? 'المركبة بحالة ممتازة (100%)'
                      : 'إصلاح شامل في الورشة (350 ر.ي)'}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-stone-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-stone-200 flex items-center gap-1.5">
                      <Fuel className="w-4 h-4 text-amber-400" />
                      مستوى الوقود الحالي
                    </span>
                    <span className="font-mono-num text-amber-400 font-bold">
                      {fuelLiters} / {spec.fuelTankLiters} لتر
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={
                      fuelLiters >= spec.fuelTankLiters ||
                      saveState.masalikCoins < 200
                    }
                    onClick={() => onRefuelVehicle(previewVehicleId, 200)}
                    className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-500 text-slate-950 text-xs font-bold"
                  >
                    {fuelLiters >= spec.fuelTankLiters
                      ? 'الخزان ممتلئ بالكامل'
                      : 'تعبئة الخزان بالكامل (200 ر.ي)'}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-stone-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-stone-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      تراكم الغبار والطين على المركبة
                    </span>
                    <span className="font-mono-num text-sky-400 font-bold">
                      {dirtPct}%
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={dirtPct <= 0 || saveState.masalikCoins < 120}
                    onClick={() => onWashVehicle(previewVehicleId, 120)}
                    className="w-full py-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:bg-stone-800 disabled:text-stone-500 text-slate-950 text-xs font-bold"
                  >
                    {dirtPct <= 0
                      ? 'المركبة نظيفة ولامعة تمامًا'
                      : 'غسيل وتلميع المركبة (120 ر.ي)'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pointer-events-auto bg-slate-950/92 border-t border-stone-800 px-4 py-2.5">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {ALL_VEHICLE_IDS.map((vid) => {
            const vSpec = VEHICLE_SPECS[vid];
            const unlocked = saveState.unlockedVehicles.includes(vid);
            const active = previewVehicleId === vid;
            return (
              <button
                key={vid}
                type="button"
                onClick={() => onSelectPreviewVehicle(vid)}
                className={`shrink-0 px-3.5 py-2 rounded-xl border-2 text-right transition min-w-[140px] ${
                  active
                    ? 'bg-amber-500/20 border-amber-400 shadow-lg'
                    : 'bg-slate-900/90 border-stone-800 hover:border-stone-600'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-stone-100">
                    {vSpec.nameAr}
                  </span>
                  {!unlocked ? (
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                  ) : saveState.selectedVehicleId === vid ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  ) : null}
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5 flex justify-between">
                  <span className="truncate max-w-[85px]">{vSpec.categoryAr}</span>
                  <span className="font-mono-num text-amber-300">
                    {unlocked
                      ? 'مملوكة'
                      : `${vSpec.unlockPriceCoins.toLocaleString()} ر.ي`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
