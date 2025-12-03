// src/components/party/DeckRecommendationGuide.tsx

import React, { useMemo } from 'react';
import type { Apostle } from '../../types/apostle';
import { analyzeDeckPersonality, getRecommendedApostles } from '../../utils/deckGuideEngine';
import PersonalityIcon from '../common/PersonalityIcon';
import RecommendedApostleCard from './sub-components/RecommendedApostleCard';
import DeckTipsPanel from './sub-components/DeckTipsPanel';
import AlternativeApostlesPanel from './sub-components/AlternativeApostlesPanel';

interface DeckRecommendationGuideProps {
  apostles: Apostle[];
  allApostles: Apostle[];
  gameMode: 'pve' | 'pvp';
  onGameModeChange: (mode: 'pve' | 'pvp') => void;
}

export const DeckRecommendationGuide: React.FC<DeckRecommendationGuideProps> = ({
  apostles,
  allApostles,
  gameMode,
  onGameModeChange,
}) => {
  const analysis = useMemo(() => analyzeDeckPersonality(apostles), [apostles]);

  const guide = useMemo(
    () => getRecommendedApostles(analysis.deckType, gameMode),
    [analysis.deckType, gameMode],
  );

  if (apostles.filter((a) => a).length === 0) {
    return (
      <div className="alert alert-info">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="h-6 w-6 shrink-0 stroke-current"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <span>사도를 배치하면 추천이 시작됩니다.</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 2. PVE/PVP 모드 선택 */}
      <div className="bg-base-100 flex gap-2 rounded-lg p-4">
        <button
          onClick={() => onGameModeChange('pve')}
          className={`btn btn-sm ${gameMode === 'pve' ? 'btn-primary' : 'btn-outline'}`}
        >
          🎮 PVE (침략)
        </button>
        <button
          onClick={() => onGameModeChange('pvp')}
          className={`btn btn-sm ${gameMode === 'pvp' ? 'btn-primary' : 'btn-outline'}`}
        >
          ⚔️ PVP (줘팸터)
        </button>
      </div>

      {/* 3. 덱 개요 및 장단점 */}
      {guide && (
        <>
          <div className="collapse-plus bg-base-100 border-base-300 collapse border">
            <input type="checkbox" defaultChecked />
            <div className="collapse-title flex items-center justify-between text-lg font-semibold">
              <span>📋 {analysis.deckType} 특징</span>
            </div>
            <div className="collapse-content space-y-4">
              {/* 개요 */}
              <div>
                <h3 className="mb-2 text-sm font-semibold">📌 개요</h3>
                <p className="text-sm opacity-75">{guide.overview}</p>
              </div>

              {/* 장점 */}
              <div>
                <h3 className="text-success mb-2 text-sm font-semibold">✅ 장점</h3>
                <ul className="list-inside list-disc space-y-1">
                  {guide.pros.map((pro, idx) => (
                    <li key={idx} className="text-sm opacity-75">
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 단점 */}
              <div>
                <h3 className="text-error mb-2 text-sm font-semibold">⚠️ 단점</h3>
                <ul className="list-inside list-disc space-y-1">
                  {guide.cons.map((con, idx) => (
                    <li key={idx} className="text-sm opacity-75">
                      {con}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 난이도 */}
              <div>
                <h3 className="mb-2 text-sm font-semibold">🎯 난이도</h3>
                <div
                  className={`badge badge-lg ${
                    guide.difficulty === 'easy'
                      ? 'badge-success'
                      : guide.difficulty === 'medium'
                        ? 'badge-warning'
                        : 'badge-error'
                  }`}
                >
                  {guide.difficulty === 'easy'
                    ? '쉬움'
                    : guide.difficulty === 'medium'
                      ? '중간'
                      : '어려움'}
                </div>
              </div>
            </div>
          </div>

          {/* 4. 핵심 사도 추천 (필수/권장 배지 포함) */}
          <div className="bg-base-100 border-base-300 rounded-lg border p-4">
            <h3 className="mb-4 text-lg font-bold">⭐ 핵심 사도 조합</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {guide.core.map((member, idx) => {
                // ✅ 필수 사도 여부 확인
                const isEssential = guide.essentials.filter((e) => e.tier === 'essential');
                const isRecommended = guide.essentials.filter((e) => e.tier === 'recommended');

                // ✅ 배치 여부 확인
                const isPlaced = apostles.some((a) => a && a.name === member.name);

                return (
                  <RecommendedApostleCard
                    key={`${member.name}-${idx}`}
                    name={member.name}
                    role={member.role}
                    reason={member.reason}
                    position={member.position}
                    asideRequired={member.aside_required}
                    isEssential={isEssential} // ✅ 필수 여부 전달
                    isRecommended={isRecommended} // ✅ 권장 여부 전달
                    isPlaced={isPlaced} // ✅ 배치 여부 전달
                    allApostles={allApostles}
                  />
                );
              })}
            </div>
          </div>

          {/* 5. 대체 사도 옵션 */}
          {guide.alternatives && guide.alternatives.length > 0 && (
            <AlternativeApostlesPanel alternatives={guide.alternatives} />
          )}

          {/* 6. 팁 */}
          {guide.tips && guide.tips.length > 0 && <DeckTipsPanel tips={guide.tips} />}
        </>
      )}
    </div>
  );
};

export default DeckRecommendationGuide;
