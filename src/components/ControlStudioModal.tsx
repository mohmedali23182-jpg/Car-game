import React, { useState, useRef } from 'react';
import {
  HudCustomizationSettings,
  HudWidgetId,
  ControlLayoutPresetId,
  TouchControlMode,
  SteeringRotationRangeDeg,
} from '../game/types';
import {
  getControlLayoutPreset,
  CONTROL_LAYOUT_PRESET_LABELS,
  DEFAULT_SMART_WHEEL_SETTINGS,
} from '../game/persistenceManager';
import {
  RotateCcw,
  Check,
  Move,
  Sliders,
  Compass,
  AlertTriangle,
} from 'lucide-react';

interface ControlStudioModalProps {
  hudSettings: HudCustomizationSettings;
  onSaveHudSettings: (updated: HudCustomizationSettings) => void;
  onClose: () => void;
}

export const ControlStudioModal: React.FC<ControlStudioModalProps> = ({
  hudSettings,
  onSaveHudSettings,
  onClose,
}) => {
  const [draft, setDraft] = useState<HudCustomizationSettings>(() =>
    JSON.parse(JSON.stringify(hudSettings))
  );
  const [selectedWidget, setSelectedWidget] = useState<HudWidgetId>('steering');
  const [activeTab, setActiveTab] = useState<'canvas' | 'wheel' | 'presets'>('canvas');
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const draggingIdRef = useRef<HudWidgetId | null>(null);

  const currentWidget = draft.widgets[selectedWidget];

  const hasOverlapWarning = (() => {
    const ids = Object.keys(draft.widgets) as HudWidgetId[];
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = draft.widgets[ids[i]];
        const b = draft.widgets[ids[j]];
        if (!a.visible || !b.visible) continue;
        const dist = Math.hypot(a.xPct - b.xPct, a.yPct - b.yPct);
        if (dist < 11) return true;
      }
    }
    return false;
  })();

  const handleWidgetPointerDown = (
    id: HudWidgetId,
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    e.stopPropagation();
    setSelectedWidget(id);
    draggingIdRef.current = id;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleWidgetPointerMove = (
    id: HudWidgetId,
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (draggingIdRef.current !== id || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.round(Math.max(6, Math.min(94, rawX)));
    const clampedY = Math.round(Math.max(7, Math.min(93, rawY)));

    setDraft((prev) => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [id]: {
          ...prev.widgets[id],
          xPct: clampedX,
          yPct: clampedY,
        },
      },
    }));
  };

  const handleWidgetPointerUp = (
    id: HudWidgetId,
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (draggingIdRef.current === id) {
      draggingIdRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
    }
  };

  const applyPreset = (presetId: ControlLayoutPresetId) => {
    setDraft((prev) => ({
      ...prev,
      activePresetId: presetId,
      controlMode:
        presetId === 'directional_buttons'
          ? 'buttons'
          : presetId === 'tilt_gyro'
          ? 'tilt'
          : 'wheel',
      widgets: getControlLayoutPreset(presetId),
    }));
  };

  const swapLeftRightHands = () => {
    setDraft((prev) => {
      const nextWidgets = { ...prev.widgets };
      (Object.keys(nextWidgets) as HudWidgetId[]).forEach((k) => {
        nextWidgets[k] = {
          ...nextWidgets[k],
          xPct: 100 - nextWidgets[k].xPct,
        };
      });
      return {
        ...prev,
        mirrorControlsHorizontally: !prev.mirrorControlsHorizontally,
        widgets: nextWidgets,
      };
    });
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col text-stone-100 select-none"
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-stone-800 bg-slate-900/90">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <Move className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-amber-300">
              استوديو تخصيص التحكم — MASALIK Control Studio
            </h2>
            <p className="text-xs text-stone-400">
              اسحب أي أداة قيادة لتغيير مكانها، وعدّل الحجم والشفافية وزاوية دوران المقود الذكي
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('canvas')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'canvas'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            لوحة توزيع الأدوات
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('wheel')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'wheel'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            إعدادات المقود الذكي
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            الأنماط الستة الجاهزة
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => applyPreset('classic_wheel')}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-200 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            استعادة الافتراضي
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-300"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => {
              onSaveHudSettings(draft);
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
          >
            <Check className="w-4 h-4" />
            حفظ التخطيط
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'canvas' && (
          <>
            <div className="flex-1 p-4 flex flex-col items-center justify-center relative bg-slate-950">
              {hasOverlapWarning && (
                <div className="mb-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  تنبيه: يوجد تقارب أو تداخل بين عنصرين؛ يُنصح بمباعدتهما لسهولة اللمس.
                </div>
              )}

              <div
                ref={canvasRef}
                dir="ltr"
                className="w-full max-w-4xl aspect-video rounded-2xl border-2 border-stone-700/80 relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/60 to-stone-900 shadow-2xl"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
                  backgroundSize: '5% 5%',
                }}
              >
                <div className="inset-x-[24%] inset-y-[18%] absolute border border-dashed border-emerald-500/30 rounded-2xl flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-bold text-emerald-400/70">
                    منطقة رؤية الطريق والسيارة ثلاثية الأبعاد (يُنصح بإبقائها صافية)
                  </span>
                </div>

                {(Object.keys(draft.widgets) as HudWidgetId[]).map((id) => {
                  const w = draft.widgets[id];
                  const isSelected = selectedWidget === id;
                  return (
                    <div
                      key={id}
                      onPointerDown={(e) => handleWidgetPointerDown(id, e)}
                      onPointerMove={(e) => handleWidgetPointerMove(id, e)}
                      onPointerUp={(e) => handleWidgetPointerUp(id, e)}
                      style={{
                        left: `${w.xPct}%`,
                        top: `${w.yPct}%`,
                        transform: `translate(-50%, -50%) scale(${w.scale})`,
                        opacity: w.visible ? w.opacity : 0.25,
                      }}
                      className={`absolute cursor-move touch-none select-none rounded-2xl px-3 py-2 border-2 transition-shadow ${
                        isSelected
                          ? 'bg-amber-500/30 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.45)] z-20'
                          : 'bg-slate-900/85 border-stone-600/80 hover:border-stone-400 z-10'
                      } ${
                        id === 'steering' || id === 'pedals'
                          ? 'w-28 h-28 flex flex-col items-center justify-center'
                          : 'min-w-[96px] text-center'
                      }`}
                    >
                      <div className="text-[11px] font-bold text-amber-300">
                        {w.labelAr}
                      </div>
                      <div className="text-[10px] text-stone-300 font-mono-num mt-0.5">
                        X:{w.xPct}% Y:{w.yPct}% · {Math.round(w.scale * 100)}%
                      </div>
                      {!w.visible && (
                        <span className="text-[9px] text-rose-400 font-bold">مخفي</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="w-80 border-r border-stone-800 bg-slate-900/95 p-4 flex flex-col gap-4 overflow-y-auto">
              <div>
                <div className="text-xs text-stone-400 mb-1">الأداة المحددة للتعديل</div>
                <div className="text-base font-bold text-amber-300">
                  {currentWidget.labelAr}
                </div>
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-stone-800">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-stone-300 font-bold">حجم الأداة (Scale)</span>
                  <span className="text-amber-400 font-mono-num">
                    {Math.round(currentWidget.scale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.6}
                  max={1.6}
                  step={0.05}
                  value={currentWidget.scale}
                  onChange={(e) => {
                    const scale = parseFloat(e.target.value);
                    setDraft((prev) => ({
                      ...prev,
                      widgets: {
                        ...prev.widgets,
                        [selectedWidget]: { ...prev.widgets[selectedWidget], scale },
                      },
                    }));
                  }}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-stone-800">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-stone-300 font-bold">الشفافية (Opacity)</span>
                  <span className="text-amber-400 font-mono-num">
                    {Math.round(currentWidget.opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.15}
                  max={1.0}
                  step={0.05}
                  value={currentWidget.opacity}
                  onChange={(e) => {
                    const opacity = parseFloat(e.target.value);
                    setDraft((prev) => ({
                      ...prev,
                      widgets: {
                        ...prev.widgets,
                        [selectedWidget]: {
                          ...prev.widgets[selectedWidget],
                          opacity,
                        },
                      },
                    }));
                  }}
                  className="w-full accent-amber-500"
                />
              </div>

              <label className="flex items-center justify-between bg-slate-950/70 p-3 rounded-xl border border-stone-800 cursor-pointer">
                <span className="text-xs font-bold text-stone-200">
                  إظهار الأداة أثناء القيادة
                </span>
                <input
                  type="checkbox"
                  checked={currentWidget.visible}
                  onChange={(e) => {
                    const visible = e.target.checked;
                    setDraft((prev) => ({
                      ...prev,
                      widgets: {
                        ...prev.widgets,
                        [selectedWidget]: {
                          ...prev.widgets[selectedWidget],
                          visible,
                        },
                      },
                    }));
                  }}
                  className="w-4 h-4 accent-amber-500"
                />
              </label>

              <button
                type="button"
                onClick={swapLeftRightHands}
                className="w-full py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-amber-300 border border-stone-700"
              >
                {draft.mirrorControlsHorizontally
                  ? 'الوضع الحالي: اليد اليسرى (اضغط للتبديل لليمنى)'
                  : 'تبديل اتجاه اليد (اليد اليمنى ⇄ اليد اليسرى)'}
              </button>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-stone-800">
                <div className="text-xs font-bold text-stone-300 mb-2">
                  نمط التوجيه الأساسي
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      ['wheel', 'المقود الذكي'],
                      ['buttons', 'أزرار يمين/يسار'],
                      ['tilt', 'إمالة الهاتف'],
                      ['joystick', 'عصا التوجيه'],
                      ['gamepad', 'يد تحكم خارجية'],
                    ] as [TouchControlMode, string][]
                  ).map(([m, label]) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() =>
                        setDraft((prev) => ({ ...prev, controlMode: m }))
                      }
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border ${
                        draft.controlMode === m
                          ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                          : 'bg-stone-900 border-stone-800 text-stone-400'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'wheel' && (
          <div className="flex-1 p-6 overflow-y-auto max-w-3xl mx-auto w-full space-y-4">
            <div className="bg-slate-900/90 border border-stone-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-amber-300">
                    معايرة المقود الدائري الذكي (MASALIK Smart Steering Wheel)
                  </h3>
                  <p className="text-xs text-stone-400">
                    تحكم كامل في مدى الدوران الكلي، سرعة الرجوع للمنتصف، وحساسية السرعة العالية
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      smartWheel: { ...DEFAULT_SMART_WHEEL_SETTINGS },
                    }))
                  }
                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-300"
                >
                  استعادة إعدادات المقود
                </button>
              </div>

              <div>
                <div className="text-xs font-bold text-stone-200 mb-2">
                  زاوية الدوران الكلية للمقود (Lock-to-Lock Rotation)
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {([180, 270, 360, 540, 900] as SteeringRotationRangeDeg[]).map(
                    (deg) => (
                      <button
                        key={deg}
                        type="button"
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            smartWheel: {
                              ...prev.smartWheel,
                              rotationRangeDeg: deg,
                            },
                          }))
                        }
                        className={`py-2.5 rounded-xl font-mono-num text-xs font-bold border ${
                          draft.smartWheel.rotationRangeDeg === deg
                            ? 'bg-amber-500 text-slate-950 border-amber-300'
                            : 'bg-slate-950 text-stone-300 border-stone-800 hover:border-stone-600'
                        }`}
                      >
                        {deg}° {deg === 270 ? '(الافتراضي)' : ''}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-stone-300">حساسية استجابة المقود</span>
                  <span className="font-mono-num text-amber-400">
                    {Math.round(draft.smartWheel.sensitivity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={1.8}
                  step={0.05}
                  value={draft.smartWheel.sensitivity}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      smartWheel: {
                        ...prev.smartWheel,
                        sensitivity: parseFloat(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-stone-300">
                    سرعة الرجوع التلقائي للمنتصف عند رفع الإصبع
                  </span>
                  <span className="font-mono-num text-amber-400">
                    {draft.smartWheel.autoCenterSpeed.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={9.0}
                  step={0.5}
                  value={draft.smartWheel.autoCenterSpeed}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      smartWheel: {
                        ...prev.smartWheel,
                        autoCenterSpeed: parseFloat(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-amber-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-stone-300">
                    المنطقة الميتة بالمنتصف (Dead-Zone)
                  </span>
                  <span className="font-mono-num text-amber-400">
                    {draft.smartWheel.deadZoneDeg.toFixed(1)}°
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={6}
                  step={0.5}
                  value={draft.smartWheel.deadZoneDeg}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      smartWheel: {
                        ...prev.smartWheel,
                        deadZoneDeg: parseFloat(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-amber-500"
                />
              </div>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-stone-800 cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-stone-200">
                    توازن التوجيه حسب السرعة (Speed-Sensitive Steering Assist)
                  </div>
                  <div className="text-[11px] text-stone-400">
                    يمنع الانعطاف الحاد المفاجئ عند السرعات العالية ويمنحك أقصى زاوية التفاف في المنعطفات الجبلية الضيقة
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={draft.smartWheel.steeringAssist}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      smartWheel: {
                        ...prev.smartWheel,
                        steeringAssist: e.target.checked,
                      },
                    }))
                  }
                  className="w-4 h-4 accent-amber-500"
                />
              </label>
            </div>
          </div>
        )}

        {activeTab === 'presets' && (
          <div className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(
                Object.keys(
                  CONTROL_LAYOUT_PRESET_LABELS
                ) as ControlLayoutPresetId[]
              ).map((presetId) => {
                const info = CONTROL_LAYOUT_PRESET_LABELS[presetId];
                const isActive = draft.activePresetId === presetId;
                return (
                  <button
                    key={presetId}
                    type="button"
                    onClick={() => {
                      applyPreset(presetId);
                      setActiveTab('canvas');
                    }}
                    className={`p-4 rounded-2xl border-2 text-right transition flex flex-col justify-between ${
                      isActive
                        ? 'bg-amber-500/20 border-amber-400 shadow-lg'
                        : 'bg-slate-900/90 border-stone-800 hover:border-stone-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-amber-300">
                          {info.nameAr}
                        </span>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                            النمط المختار
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-300 leading-relaxed">
                        {info.descAr}
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] text-amber-400 font-bold">
                      اضغط لتطبيق النمط ومعاينته في لوحة التوزيع ←
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
