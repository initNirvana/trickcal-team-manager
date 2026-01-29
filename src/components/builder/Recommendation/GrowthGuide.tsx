import { Activity, useMemo, useState } from 'react';
import { HiSparkles, HiArrowRight, HiMiniExclamationTriangle } from 'react-icons/hi2';
import { Apostle } from '@/types/apostle';
import { RecommendedDeck } from '@/utils/builder/deckRecommendationUtils';
import { useMyApostleStore } from '@/stores/myApostleStore';
import { getApostleImagePath } from '@/utils/apostleImages';
import { getPersonalityBackground } from '@/utils/apostleUtils';

interface GrowthGuideProps {
  topDecks: RecommendedDeck[];
}

interface GrowthStep {
  apostle: Apostle;
  priority: 1 | 2 | 3 | 4 | 5; // 1: 필수, 2: 권장, 3: 선택, 4: 보류, 5: 비추천
  reason: string;
  targetLevel?: number;
  type: 'UPGRADE' | 'RECRUIT' | 'SKIP';
}

const GrowthGuide = ({ topDecks }: GrowthGuideProps) => {
  const { ownedApostles } = useMyApostleStore();
  const [includeEldain, setIncludeEldain] = useState(false);

  const growthSteps = useMemo(() => {
    const steps: GrowthStep[] = [];

    // 중요도에 따른 우선순위 및 메시지 생성 함수
    const getAsideInfo = (apostle: Apostle) => {
      const importance = apostle.aside.importance;

      let priority: 1 | 2 | 3 | 4 | 5 = 5;
      let badge = '비추천';
      let reason = '애정하는 사도가 아니라면 추천하지 않아요.';

      // 1. 기본 우선순위 및 배지 설정
      if (importance === '필수') {
        priority = 1;
        badge = '필수';
        reason = 'A2가 사도의 단점을 보완하거나 핵심적인 성능인 경우';
      } else if (importance === '권장') {
        priority = 2;
        badge = '권장';
        reason = '어사이드 효과가 좋아 투자를 권장합니다.';
      } else if (importance === '선택') {
        priority = 3;
        badge = '선택';
        reason = '증명서 여유가 있다면 추천합니다.';
      } else if (importance === '보류') {
        priority = 4;
        badge = '보류';
        reason = '어사이드 효과는 좋으나, 증명서 구매 가치는 낮습니다.';
      }

      // 2. 데이터에 지정된 사유가 있으면 덮어쓰기
      if (apostle.aside.reason) {
        reason = apostle.aside.reason;
      }

      return { priority, badge, reason };
    };

    // 1. 핵심 사도 육성 추천 (상위 6개 덱 분석)
    const analysisTargetDecks = topDecks.slice(0, 6);

    analysisTargetDecks.forEach((deckResult) => {
      deckResult.deck.forEach((apostle) => {
        const owned = ownedApostles.find((oa) => oa.id === apostle.id);
        if (owned) {
          if (owned.asideLevel < 2) {
            const info = getAsideInfo(apostle);

            if (![1, 2, 3].includes(info.priority)) {
              steps.push({
                apostle,
                priority: info.priority,
                reason: info.reason,
                type: 'SKIP',
              });
            } else {
              steps.push({
                apostle,
                priority: info.priority,
                reason: info.reason,
                targetLevel: 2,
                type: 'UPGRADE',
              });
            }
          }
        }
      });
    });

    // 2. 미보유 사도 추천 (시너지 보완 - 상위 3개 덱 시너지 종합)
    // const personalitiesToBoost = new Set(analysisTargetDecks.slice(0, 3).map(d =>
    //   d.synergies.sort((a,b) => (b.activeCount + b.inactiveCount) - (a.activeCount + a.inactiveCount))[0]?.personality
    // ).filter(Boolean));

    // personalitiesToBoost.forEach(persona => {
    //   const missingApostles = allApostles
    //     .filter(a => !ownedIds.has(a.id) && a.persona === persona && a.rank === 3)
    //     .sort((a, b) => (b.baseScore ?? 0) - (a.baseScore ?? 0))
    //     .slice(0, 4); // 각 성격마다 최대 4명까지

    //   missingApostles.forEach(a => {
    //     const info = getAsideInfo(a);
    //     steps.push({
    //       apostle: a,
    //       priority: info.priority,
    //       reason: `${getPersonalityKoreanName(persona)} 성격의 핵심 사도입니다. ${info.badge} 등급의 어사이드를 보유하고 있어 영입을 강력 추천합니다.`,
    //       type: 'RECRUIT'
    //     });
    //   });
    // });

    // engName 기준 중복 제거 및 최우선 순위 유지
    const uniqueStepsMap = new Map<string, GrowthStep>();
    steps.forEach((s) => {
      const key = s.apostle.engName;
      if (!uniqueStepsMap.has(key) || s.priority < uniqueStepsMap.get(key)!.priority) {
        uniqueStepsMap.set(key, s);
      }
    });

    let result = Array.from(uniqueStepsMap.values()).sort((a, b) => a.priority - b.priority);

    // 필터링 로직: includeEldain이 false이면 엘다인 제외
    if (!includeEldain) {
      result = result.filter((s) => !s.apostle.isEldain);
    }

    // 어사이드가 없는 사도 제외
    result = result.filter((s) => s.apostle.aside.hasAside);

    return result.slice(0, 12); // 최대 12개 노출
  }, [topDecks, ownedApostles, includeEldain]);

  return (
    <div id="growth-roadmap-section" className="card bg-base-100 border-base-200 border shadow-xl">
      <div className="card-body p-5">
        <div className="mb-4 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
          <h3 className="card-title text-primary flex items-center gap-1 text-xl font-bold">
            <HiSparkles className="h-6 w-6" />
            어사이드 투자 가이드
          </h3>

          <div className="form-control">
            <label className="label bg-base-200/50 border-base-300 hover:bg-base-200 cursor-pointer gap-2 rounded-full border px-2 py-1 transition-colors">
              <span className="label-text text-[11px] font-bold">엘다인도 볼래요</span>
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-xs"
                checked={includeEldain}
                onChange={(e) => setIncludeEldain(e.target.checked)}
              />
            </label>
          </div>
        </div>

        {growthSteps.length === 0 ? (
          <div className="text-base-content/60 text-center text-sm">
            추천할 어사이드가 없습니다.
          </div>
        ) : (
          <Activity mode={growthSteps.length ? 'visible' : 'hidden'}>
            <div className="grid gap-4 sm:grid-cols-2">
              {growthSteps.map((step, idx) => {
                const getBadgeStyle = (step: GrowthStep) => {
                  const importance = step.apostle.aside.importance;
                  if (step.priority === 1) return { text: '필수', color: 'bg-error text-white' };
                  if (step.priority === 2)
                    return { text: '권장', color: 'bg-warning text-warning-content' };
                  if (step.priority === 4)
                    return { text: '보류', color: 'bg-neutral text-neutral-content' };
                  if (step.priority === 5)
                    return { text: '비추천', color: 'bg-base-300 text-base-content/50' };
                  // if (step.type === 'RECRUIT') return { text: '영입', color: 'bg-secondary text-secondary-content' };
                  return { text: importance || '권장', color: 'bg-info text-white' };
                };

                const { text: badgeText, color: badgeColor } = getBadgeStyle(step);

                return (
                  <div
                    key={`${step.apostle.id}-${idx}`}
                    className="group bg-base-200/50 border-base-300 hover:bg-base-200 flex items-center gap-2 rounded-2xl border p-2 transition-all duration-200 hover:scale-[1.02]"
                  >
                    <div className="relative shrink-0">
                      <div
                        className={`avatar ${getPersonalityBackground(step.apostle.persona)} rounded-xl p-0.5 shadow-sm`}
                      >
                        <div className="w-12 rounded-lg">
                          <img
                            src={getApostleImagePath(step.apostle.engName)}
                            alt={step.apostle.name}
                          />
                        </div>
                      </div>
                      <div
                        className={`badge badge-sm absolute -top-2 -left-2 border-none font-bold shadow-md ${badgeColor}`}
                      >
                        {badgeText}
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-col">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="truncate text-sm font-bold">{step.apostle.name}</span>
                        {step.targetLevel && (
                          <div className="flex items-center gap-0.5">
                            <HiArrowRight className="h-3 w-3" />
                            <span className="text-warning text-xs font-black italic">
                              A{step.targetLevel}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-base-content/70 mt-0.5 line-clamp-2 text-[12px] leading-tight md:line-clamp-none">
                        {step.reason}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Activity>
        )}

        <div className="alert bg-primary/10 mt-2 gap-2 border-none py-2 shadow-inner">
          <HiMiniExclamationTriangle className="text-primary h-4 w-4 shrink-0" />
          <div className="text-[11px] leading-snug font-medium">
            <span className="font-bold underline">어사이드</span>는 사도의 효과를 추가하거나
            강화하는 시스템입니다. 다만 증명서는 귀한 재화이므로 투자시 주의가 필요합니다.
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrowthGuide;
