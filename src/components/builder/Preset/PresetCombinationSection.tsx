// ============================================
// 📄 PresetCombinationSection.tsx
// 프리셋 조합 섹션 (9속성, 4속성, 2속성 조합)
// ============================================
import { useState } from 'react';
import { Apostle } from '../../../types/apostle';
import { getApostleImagePath } from '../../../utils/apostleUtils';
import type { PresetCombination } from '../../../utils/builder/deckRecommendationUtils';

interface PresetCombinationSectionProps {
  combo9?: PresetCombination;
  combo4?: PresetCombination;
  combo2?: PresetCombination;
  myApostles: Apostle[];
}

export const PresetCombinationSection = ({
  combo9,
  combo4,
  combo2,
  myApostles,
}: PresetCombinationSectionProps) => {
  const [selectedSlot, setSelectedSlot] = useState<'9' | '4' | '2'>('4');

  const comboMap = {
    '9': combo9,
    '4': combo4,
    '2': combo2,
  };

  const currentCombo = comboMap[selectedSlot];

  return (
    <div className="space-y-6">
      {/* 헤더: 많이 사용하는 조합 */}
      <div>
        <h3 className="mb-2 text-xl font-bold">많이 사용하는 조합</h3>
        <p className="text-sm text-gray-600">
          슬롯을 선택하면 해당 조합의 상세 정보를 확인할 수 있습니다
        </p>
      </div>

      {/* 슬롯 선택 버튼 */}
      <div className="flex gap-2">
        {(['9', '4', '2'] as const).map((slot) => (
          <button
            key={slot}
            onClick={() => setSelectedSlot(slot)}
            disabled={!comboMap[slot]}
            className={`rounded-lg px-4 py-2 font-semibold transition ${
              selectedSlot === slot
                ? 'bg-blue-600 text-white'
                : comboMap[slot]
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  : 'cursor-not-allowed bg-gray-100 text-gray-400'
            }`}
          >
            {slot}속성 조합
          </button>
        ))}
      </div>

      {/* 현재 선택된 조합 표시 */}
      {currentCombo ? (
        <div className="rounded-lg border-2 border-blue-400 bg-blue-50 p-4">
          {/* 조합 제목 */}
          <div className="mb-4">
            <h4 className="text-lg font-bold">{currentCombo.comboName || '프리셋 조합'}</h4>
            <p className="text-sm text-gray-700">{currentCombo.reason}</p>
          </div>

          {/* 프리셋 조합 캐릭터 */}
          <div className="mb-4">
            <div className="mb-2 text-sm font-semibold text-gray-700">추천 사도</div>
            <div className="grid grid-cols-3 gap-2">
              {currentCombo.deck.map((apostle, idx) => {
                const isOwned = myApostles.some((a) => a.id === apostle.id);
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 rounded-lg border p-2 ${
                      isOwned ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    <img
                      src={getApostleImagePath(apostle.engName)}
                      alt={apostle.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{apostle.name}</div>
                      <div className="text-xs text-gray-500">{isOwned ? '✓ 보유' : '✗ 미보유'}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 대체 사도 정보 */}
          {currentCombo.rawCombo?.alternatives && (
            <div className="rounded-lg bg-white p-3">
              <div className="mb-2 text-sm font-semibold text-gray-700">대체 사도</div>
              <div className="space-y-1 text-xs text-gray-600">
                {selectedSlot === '9'
                  ? // 9속성 대체 정보 (포지션별)
                    Object.entries(currentCombo.rawCombo.alternatives).map(
                      ([key, alts]: [string, any]) => (
                        <div key={key}>
                          <span className="font-semibold">{key}</span> :{' '}
                          {Array.isArray(alts) ? alts.slice(0, 3).join(', ') : alts}
                        </div>
                      ),
                    )
                  : // 4속성, 2속성 대체 정보 (현재 선택된 조합의 대체)
                    Object.entries(currentCombo.rawCombo?.alternatives || {}).map(
                      ([key, alts]: [string, any]) => (
                        <div key={key}>
                          <span className="font-semibold">{key}</span> :{' '}
                          {Array.isArray(alts) ? alts.slice(0, 3).join(', ') : alts}
                        </div>
                      ),
                    )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-300 bg-gray-100 p-6 text-center text-gray-600">
          선택한 슬롯의 조합 데이터가 없습니다
        </div>
      )}
    </div>
  );
};

export default PresetCombinationSection;
