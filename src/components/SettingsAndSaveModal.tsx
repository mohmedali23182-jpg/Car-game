import React, { useState, useRef } from 'react';
import {
  SaveGameSchemaV2,
  GraphicsQuality,
  WeatherPreset,
  TimeOfDayPreset,
  AudioMixerSettings,
  EngineeringTestResult,
} from '../game/types';
import { PersistenceManager } from '../game/persistenceManager';
import { runEngineeringTestSuite } from '../game/testSuite';
import {
  Settings,
  Volume2,
  Sun,
  Database,
  Download,
  Upload,
  Trash2,
  Cpu,
  CheckCircle2,
  X,
  Smartphone,
} from 'lucide-react';

interface SettingsAndSaveModalProps {
  saveState: SaveGameSchemaV2;
  onUpdateSaveState: (next: SaveGameSchemaV2) => void;
  onOpenControlStudio: () => void;
  deferredInstallPrompt: any;
  onTriggerPwaInstall: () => void;
  onClose: () => void;
}

export const SettingsAndSaveModal: React.FC<SettingsAndSaveModalProps> = ({
  saveState,
  onUpdateSaveState,
  onOpenControlStudio,
  deferredInstallPrompt,
  onTriggerPwaInstall,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<
    'graphics' | 'audio' | 'save' | 'diagnostics'
  >('graphics');
  const [statusMessageAr, setStatusMessageAr] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<EngineeringTestResult[] | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const mixer = saveState.audioMixer;

  const updateMixer = (patch: Partial<AudioMixerSettings>) => {
    const next: SaveGameSchemaV2 = {
      ...saveState,
      audioMixer: {
        ...saveState.audioMixer,
        ...patch,
      },
    };
    onUpdateSaveState(next);
  };

  const handleExportJson = () => {
    const jsonStr = PersistenceManager.exportSaveToJsonString(saveState);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `masalik-save-${dateStr}.masalik.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatusMessageAr('تم تصدير ملف الحفظ الاحتياطي (.masalik.json) بنجاح.');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      const res = PersistenceManager.importSaveFromJsonString(content);
      if (res.ok && res.save) {
        onUpdateSaveState(res.save);
        setStatusMessageAr('تم استيراد ملف الحفظ والتحقق من سلامته بنجاح!');
      } else {
        setStatusMessageAr(res.errorAr || 'فشل استيراد الملف.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col text-stone-100 select-none"
    >
      <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-amber-300">
              إعدادات مَسَالِك الشاملة والنسخ الاحتياطي المحلي (100% Offline)
            </h2>
            <p className="text-xs text-stone-400">
              برمجة وتطوير معتز العلقمي – تعز – اليمن – 2026م · الإصدار v1.0.0 — OFFLINE COMPLETE EDITION
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {[
            { id: 'graphics', label: 'الرسوميات والبيئة', icon: Sun },
            { id: 'audio', label: 'الميكسر الصوتي (6 قنوات)', icon: Volume2 },
            { id: 'save', label: 'الحفظ المحلي والنسخ الاحتياطي', icon: Database },
            { id: 'diagnostics', label: 'فحص الأنظمة والمطورين', icon: Cpu },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as typeof activeTab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                  activeTab === t.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
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

      <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-4">
        {statusMessageAr && (
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold flex items-center justify-between">
            <span>{statusMessageAr}</span>
            <button
              type="button"
              onClick={() => setStatusMessageAr(null)}
              className="text-stone-300 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {activeTab === 'graphics' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-stone-800 space-y-3">
              <div className="text-sm font-bold text-amber-300">
                مستوى الجودة الرسومية والظلال (Graphics Quality)
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {(
                  [
                    ['low', 'منخفض (أداء أقصى)'],
                    ['medium', 'متوسط (متوازن)'],
                    ['high', 'مرتفع (إضاءة وظلال)'],
                    ['ultra', 'فائق (سينمائي كامل)'],
                  ] as [GraphicsQuality, string][]
                ).map(([q, label]) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() =>
                      onUpdateSaveState({
                        ...saveState,
                        graphicsQuality: q,
                      })
                    }
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border ${
                      saveState.graphicsQuality === q
                        ? 'bg-amber-500 text-slate-950 border-amber-300'
                        : 'bg-slate-950 text-stone-300 border-stone-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-stone-800 space-y-4">
              <div className="text-sm font-bold text-amber-300">
                الطقس الديناميكي ودورة الليل والنهار في جبال اليمن
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {(
                  [
                    ['clear', 'صحو مشمس'],
                    ['cloudy', 'غائم جزئيًا'],
                    ['mountain_fog', 'ضباب النقيل'],
                    ['light_rain', 'مطر خفيف'],
                    ['heavy_rain', 'أمطار وبرق'],
                    ['sandstorm', 'عاصفة رملية'],
                  ] as [WeatherPreset, string][]
                ).map(([w, label]) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() =>
                      onUpdateSaveState({
                        ...saveState,
                        weather: w,
                      })
                    }
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold border ${
                      saveState.weather === w
                        ? 'bg-amber-500 text-slate-950 border-amber-300'
                        : 'bg-slate-950 text-stone-300 border-stone-800'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div>
                <div className="text-xs font-bold text-stone-300 mb-2">
                  وقت الإضاءة في العالم (Time of Day)
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {(
                    [
                      ['dawn', 'الفجر'],
                      ['sunrise', 'الشروق'],
                      ['morning', 'الصباح'],
                      ['noon', 'الظهيرة'],
                      ['afternoon', 'العصر'],
                      ['sunset', 'الغروب'],
                      ['night', 'الليل'],
                    ] as [TimeOfDayPreset, string][]
                  ).map(([tod, label]) => (
                    <button
                      key={tod}
                      type="button"
                      onClick={() =>
                        onUpdateSaveState({
                          ...saveState,
                          timeOfDay: tod,
                        })
                      }
                      className={`py-2 rounded-xl text-[11px] font-bold border ${
                        saveState.timeOfDay === tod
                          ? 'bg-amber-500 text-slate-950 border-amber-300'
                          : 'bg-slate-950 text-stone-300 border-stone-800'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenControlStudio();
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  فتح استوديو تخصيص أماكن وأحجام أدوات القيادة (Control Studio)
                </button>

                {deferredInstallPrompt && (
                  <button
                    type="button"
                    onClick={onTriggerPwaInstall}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Smartphone className="w-4 h-4" />
                    تثبيت اللعبة على الجهاز للعمل دون إنترنت
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-stone-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-amber-300">
                  الميكسر الصوتي الاحترافي (6 قنوات مستقلة)
                </h3>
                <p className="text-xs text-stone-400">
                  تحكم مستقل في صوت المحرك، الموسيقى اليمنية، الطبيعة والرياح، المؤثرات، وأصوات الواجهة
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mixer.muted}
                  onChange={(e) => updateMixer({ muted: e.target.checked })}
                  className="w-4 h-4 accent-amber-500"
                />
                كتم جميع الأصوات
              </label>
            </div>

            {(
              [
                ['masterVolume', 'الصوت العام (Master Volume)'],
                ['engineVolume', 'هدير المحرك والعادم والتيربو (Engine)'],
                ['musicVolume', 'الموسيقى اليمنية الأصيلة بالعود (Music)'],
                ['environmentVolume', 'الرياح والأمطار والرعد والبيئة (Environment)'],
                ['sfxVolume', 'الاحتكاك، الفرامل، الاصطدام والهرن (SFX)'],
                ['uiVolume', 'أصوات الأزرار والقوائم (UI)'],
              ] as [keyof AudioMixerSettings, string][]
            ).map(([key, label]) => (
              <div
                key={key}
                className="bg-slate-950/80 p-3 rounded-xl border border-stone-800"
              >
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-stone-300">{label}</span>
                  <span className="font-mono-num text-amber-400">
                    {Math.round(Number(mixer[key]) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={Number(mixer[key])}
                  onChange={(e) =>
                    updateMixer({ [key]: parseFloat(e.target.value) })
                  }
                  className="w-full accent-amber-500"
                />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'save' && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-amber-300">
                    نظام الحفظ المحلي والنسخ الاحتياطي (MASALIK Local Save System)
                  </h3>
                  <p className="text-xs text-stone-400">
                    يتم حفظ التقدم تلقائيًا على جهازك عبر (IndexedDB + LocalStorage) دون الحاجة لأي خادم خارجي.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  100% Offline Ready
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="p-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  تصدير نسخة احتياطية (.masalik.json)
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold text-xs flex items-center justify-center gap-2 border border-stone-700"
                >
                  <Upload className="w-4 h-4 text-amber-400" />
                  استيراد ملف حفظ خارجي (.json)
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportFile}
                  className="hidden"
                />

                {!confirmReset ? (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="p-3.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 border border-rose-800/60"
                  >
                    <Trash2 className="w-4 h-4" />
                    إعادة ضبط التقدم بالكامل
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const fresh = PersistenceManager.reset();
                      onUpdateSaveState(fresh);
                      setConfirmReset(false);
                      setStatusMessageAr(
                        'تمت إعادة ضبط التقدم إلى الحالة الافتراضية.'
                      );
                    }}
                    className="p-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2"
                  >
                    تأكيد الحذف النهائي وإعادة البدء؟
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'diagnostics' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 border border-stone-800 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-amber-300">
                  شريط بيانات المطورين الاختياري (Developer Diagnostics Overlay)
                </div>
                <div className="text-xs text-stone-400">
                  مخفي افتراضيًا للحفاظ على نظافة شاشة القيادة؛ يمكنك تفعيله لعرض FPS ومعلومات الفيزياء.
                </div>
              </div>
              <input
                type="checkbox"
                checked={saveState.hudSettings.showDeveloperDiagnostics}
                onChange={(e) =>
                  onUpdateSaveState({
                    ...saveState,
                    hudSettings: {
                      ...saveState.hudSettings,
                      showDeveloperDiagnostics: e.target.checked,
                    },
                  })
                }
                className="w-5 h-5 accent-amber-500"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-stone-100">
                  الاختبارات الهندسية التلقائية الشاملة (Engineering Verification Suite)
                </div>
                <button
                  type="button"
                  onClick={() => setTestResults(runEngineeringTestSuite())}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  تشغيل فحص الأنظمة (8 اختبارات)
                </button>
              </div>

              {testResults && (
                <div className="space-y-2 pt-2">
                  {testResults.map((res) => (
                    <div
                      key={res.id}
                      className="p-3 rounded-xl bg-slate-950 border border-stone-800 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          {res.titleAr}
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          {res.detailsAr}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 font-mono-num text-[11px] font-bold shrink-0">
                        {res.measuredValue}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
