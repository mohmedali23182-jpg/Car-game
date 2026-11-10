import React, { useState, useMemo } from 'react';
import {
  MissionDefinition,
  SaveGameSchemaV2,
  GameModeCategory,
} from '../game/types';
import {
  ALL_OFFLINE_MISSIONS,
  STORY_CHAPTERS,
  getDailyOfflineChallenges,
  getDriverRankTitleAr,
} from '../game/missionsCatalog';
import { VEHICLE_SPECS } from '../game/vehicleFleet';
import {
  BookOpen,
  Flag,
  Star,
  Calendar,
  Play,
  Award,
  X,
  CheckCircle2,
} from 'lucide-react';

interface MissionsAndStoryModalProps {
  saveState: SaveGameSchemaV2;
  onStartMission: (mission: MissionDefinition) => void;
  onClose: () => void;
}

export const MissionsAndStoryModal: React.FC<MissionsAndStoryModalProps> = ({
  saveState,
  onStartMission,
  onClose,
}) => {
  const [activeView, setActiveView] = useState<'story' | 'missions' | 'daily'>(
    'story'
  );
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [modeFilter, setModeFilter] = useState<'all' | GameModeCategory>('all');

  const dailyChallenges = useMemo(() => getDailyOfflineChallenges(), []);
  const rankInfo = useMemo(
    () => getDriverRankTitleAr(saveState.driverXp),
    [saveState.driverXp]
  );

  const filteredMissions = useMemo(() => {
    if (modeFilter === 'all') return ALL_OFFLINE_MISSIONS;
    return ALL_OFFLINE_MISSIONS.filter((m) => m.category === modeFilter);
  }, [modeFilter]);

  const completedCount = useMemo(
    () => Object.keys(saveState.missionCompletions || {}).length,
    [saveState.missionCompletions]
  );

  const currentChapterDef =
    STORY_CHAPTERS.find((c) => c.chapterNumber === selectedChapter) ||
    STORY_CHAPTERS[0];

  const chapterMissions = useMemo(() => {
    return ALL_OFFLINE_MISSIONS.filter(
      (m) => m.category === 'story' && m.chapterNumber === selectedChapter
    );
  }, [selectedChapter]);

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 bg-slate-950/92 backdrop-blur-md flex flex-col text-stone-100 select-none"
    >
      <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900/95 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-amber-300">
              مهمات وفصول «دروب اليمن» — {ALL_OFFLINE_MISSIONS.length} مهمة تعمل بالكامل دون إنترنت
            </h2>
            <p className="text-xs text-stone-400">
              الرتبة الحالية:{' '}
              <span className="text-amber-300 font-bold">
                {rankInfo.rankTitleAr}
              </span>{' '}
              (المستوى {rankInfo.level}) · المهمات المنجزة: {completedCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView('story')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              activeView === 'story'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            طور القصة (5 فصول)
          </button>
          <button
            type="button"
            onClick={() => setActiveView('missions')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              activeView === 'missions'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            جميع المهمات ({ALL_OFFLINE_MISSIONS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveView('daily')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              activeView === 'daily'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            التحديات اليومية المحلية
          </button>
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

      <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full">
        {activeView === 'story' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-stone-400 mb-2">
                فصول القصة الخمسة — «دروب اليمن»
              </div>
              {STORY_CHAPTERS.map((ch) => {
                const isSelected = selectedChapter === ch.chapterNumber;
                return (
                  <button
                    key={ch.chapterNumber}
                    type="button"
                    onClick={() => setSelectedChapter(ch.chapterNumber)}
                    className={`w-full p-3.5 rounded-2xl border-2 text-right transition ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 shadow-lg'
                        : 'bg-slate-900/90 border-stone-800 hover:border-stone-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-amber-300">
                        {ch.titleAr}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      {ch.subtitleAr}
                    </div>
                    <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">
                      {ch.introDialogueAr}
                    </p>
                    <div className="text-[11px] text-amber-400/90 mt-1.5 font-bold">
                      الراوي: {ch.narratorNameAr}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-2 space-y-3">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-stone-800">
                <h3 className="text-base font-bold text-amber-300">
                  {currentChapterDef.titleAr} — {currentChapterDef.subtitleAr}
                </h3>
                <p className="text-xs text-stone-300 mt-1">
                  {currentChapterDef.introDialogueAr} — {currentChapterDef.narratorNameAr}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {chapterMissions.map((m) => {
                  const completed =
                    (saveState.missionCompletions?.[m.id] || 0) > 0;
                  const stars = completed ? 3 : 0;
                  return (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl bg-slate-900/90 border border-stone-800 flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-stone-100">
                            {m.titleAr}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= stars
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-stone-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                          {m.descriptionAr}
                        </p>
                        {m.dialogueBriefAr && (
                          <div className="mt-2 p-2 rounded-lg bg-slate-950/80 border border-stone-800 text-[11px] text-amber-200/90">
                            {m.dialogueBriefAr}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-stone-800/80">
                        <div className="text-xs">
                          <span className="text-amber-400 font-mono-num font-bold">
                            +{m.rewardCoins.toLocaleString()} ر.ي
                          </span>
                          <span className="text-stone-500 mx-1.5">·</span>
                          <span className="text-stone-400">
                            {VEHICLE_SPECS[m.recommendedVehicleId]?.nameAr}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onStartMission(m)}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          {completed ? 'إعادة المهمة' : 'بدء المهمة'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeView === 'missions' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: `الكل (${ALL_OFFLINE_MISSIONS.length})` },
                { id: 'story', label: 'فصول القصة' },
                { id: 'race', label: 'السباقات والتحدي الزمني' },
                { id: 'passenger', label: 'نقل الركاب والحافلات' },
                { id: 'cargo', label: 'الشحن الجبلي الثقيل' },
                { id: 'rescue', label: 'عمليات الإنقاذ والطوارئ' },
                { id: 'challenge', label: 'تحديات المهارة والاحتراف' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setModeFilter(tab.id as typeof modeFilter)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                    modeFilter === tab.id
                      ? 'bg-amber-500 text-slate-950 border-amber-300'
                      : 'bg-slate-900 text-stone-300 border-stone-800 hover:border-stone-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredMissions.map((m) => {
                const completed =
                  (saveState.missionCompletions?.[m.id] || 0) > 0;
                const stars = completed ? 3 : 0;
                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-stone-800 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-stone-100 flex items-center gap-1.5">
                          {completed && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          {m.titleAr}
                        </span>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {[1, 2, 3].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= stars
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-stone-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                        {m.descriptionAr}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-stone-800">
                      <div className="text-xs">
                        <div className="text-amber-400 font-mono-num font-bold">
                          +{m.rewardCoins.toLocaleString()} ر.ي · +{m.rewardXp} XP
                        </div>
                        <div className="text-[11px] text-stone-400">
                          المهلة: {m.targetTimeSec}ث · المسافة:{' '}
                          {((m.finishDistanceM - m.startDistanceM) / 1000).toFixed(1)} كم
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onStartMission(m)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        انطلاق
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeView === 'daily' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40">
              <h3 className="text-sm font-bold text-amber-300">
                تحديات اليوم المولّدة محليًا (Offline Daily Seeded Challenges)
              </h3>
              <p className="text-xs text-stone-300 mt-1">
                يتم اختيار 3 تحديات يومية تلقائيًا حسب تاريخ جهازك المحلي مع مكافأة مضاعفة دون الحاجة لأي اتصال بالإنترنت.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dailyChallenges.map((m) => (
                <div
                  key={m.id}
                  className="p-5 rounded-2xl bg-slate-900 border-2 border-amber-500/40 flex flex-col justify-between gap-4"
                >
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold">
                      مكافأة يومية مضاعفة
                    </span>
                    <h4 className="text-base font-bold text-stone-100 mt-2">
                      {m.titleAr}
                    </h4>
                    <p className="text-xs text-stone-300 mt-1.5 leading-relaxed">
                      {m.descriptionAr}
                    </p>
                  </div>
                  <div className="space-y-2 pt-3 border-t border-stone-800">
                    <div className="flex justify-between text-xs">
                      <span className="text-stone-400">المكافأة:</span>
                      <span className="text-amber-400 font-mono-num font-bold">
                        +{m.rewardCoins.toLocaleString()} ر.ي
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onStartMission(m)}
                      className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      بدء التحدي اليومي
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
