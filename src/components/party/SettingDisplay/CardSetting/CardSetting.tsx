import { Activity, useCallback, useMemo, useState } from 'react';
import artifactsData from '@/data/artifacts.json';
import spellsData from '@/data/spells.json';
import { useDeckStore } from '@/stores/deckStore';
import { toCardLevel } from '@/types/branded';
import type { CardItem, CardType, GradeFilter } from '@/types/card';
import { CardListItem } from './CardListItem';

interface CardSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GRADE_COLORS: Record<string, string> = {
  일반: 'bg-gray-400 hover:bg-gray-500 text-white',
  고급: 'bg-green-400 hover:bg-green-500 text-white',
  희귀: 'bg-blue-400 hover:bg-blue-500 text-white',
  전설: 'bg-purple-400 hover:bg-purple-500 text-white',
  모두: 'bg-base-100 hover:bg-base-200 text-base-content border border-base-300',
};

/**
 * 카드(아티팩트/스펠) 레벨 설정 모달
 */
const CardSettingModal = ({ isOpen, onClose }: CardSettingModalProps) => {
  const [activeTab, setActiveTab] = useState<CardType>('artifact');
  const [activeGrade, setActiveGrade] = useState<GradeFilter>('전설');

  const cardLevels = useDeckStore((state) => state.cardLevels);
  const setCardLevel = useDeckStore((state) => state.setCardLevel);

  const handleLevelChange = useCallback(
    (cardId: string, value: string) => {
      const num = value === '' ? 1 : parseInt(value, 10);
      if (!Number.isNaN(num) && num >= 1 && num <= 10) {
        setCardLevel(cardId, toCardLevel(num));
      }
    },
    [setCardLevel],
  );

  // 현재 탭에 따른 데이터 가공 및 등급 필터 적용
  const filteredData = useMemo(() => {
    const isArtifact = activeTab === 'artifact';
    const sourceData = isArtifact ? artifactsData.artifacts : spellsData.spells;
    const prefix = isArtifact ? 'artifact' : 'spell';

    return sourceData
      .filter((item) => activeGrade === '모두' || item.grade === activeGrade)
      .map(
        (item) =>
          ({
            ...item,
            typeId: `${prefix}_${item.id}`,
            id: item.id,
            coin: item.coin ?? 0,
          }) as CardItem,
      )
      .sort((a, b) => b.coin - a.coin);
  }, [activeTab, activeGrade]);

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">카드 설정 (Beta)</h3>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost" type="button">
            ✕
          </button>
        </div>

        {/* 탭 전환 (아티팩트 / 스펠) */}
        <div className="flex gap-2 mb-4 bg-base-200 p-1 rounded-box">
          {(['artifact', 'spell'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              className={`flex-1 btn btn-sm ${
                activeTab === tab ? 'btn-active bg-base-100 shadow' : 'btn-ghost'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'artifact' ? '아티팩트' : '스펠'}
            </button>
          ))}
        </div>

        {/* 등급 필터 */}
        <div className="flex gap-2 mb-4">
          {(['일반', '고급', '희귀', '전설', '모두'] as const).map((grade) => (
            <button
              key={grade}
              type="button"
              className={`flex-1 py-1.5 rounded font-bold text-sm transition-colors ${
                activeGrade === grade
                  ? GRADE_COLORS[grade]
                  : 'bg-base-200 text-base-content/60 hover:bg-base-300'
              }`}
              onClick={() => setActiveGrade(grade)}
            >
              {grade}
            </button>
          ))}
        </div>

        {/* 카드 목록 */}
        <ul className="list bg-base-100 rounded-box shadow-md space-y-0 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {filteredData.map((item) => (
            <CardListItem
              key={item.typeId}
              item={item}
              level={cardLevels[item.typeId] || 1}
              activeTab={activeTab}
              onLevelChange={handleLevelChange}
            />
          ))}
          <Activity mode={filteredData.length === 0 ? 'visible' : 'hidden'}>
            <li className="list-row justify-center py-10 text-base-content/50">
              표시할 카드가 없습니다.
            </li>
          </Activity>
        </ul>

        {/* 푸터 */}
        <div className="modal-action">
          <button
            onClick={onClose}
            className="btn bg-[#1a2332] text-white hover:bg-[#2a364a] w-24"
            type="button"
          >
            닫기
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/50" onClick={onClose} aria-hidden="true"></div>
    </div>
  );
};

export default CardSettingModal;
