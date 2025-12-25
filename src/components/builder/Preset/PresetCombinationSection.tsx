import { useState } from 'react';
import presetData from '@/data/apostles-preset.json';
import { getApostleImagePath } from '@/utils/apostleUtils';
import { Personality } from '@/types/apostle';

interface PresetCombinationSectionProps {
  personality: Personality;
  allApostles: any[];
}

export const PresetCombinationSection = ({
  personality,
  allApostles,
}: PresetCombinationSectionProps) => {
  const [selectedSlot, setSelectedSlot] = useState<'9' | '4' | '2'>('4');

  // JSON에서 직접 데이터 가져오기
  const combo = presetData.combinations[personality]?.[selectedSlot];

  if (!combo) return <div>데이터 없음</div>;

  // front, mid, back 사도 이름들 모으기
  const apostleNames = [...(combo.front || []), ...(combo.mid || []), ...(combo.back || [])];

  return (
    <div className="space-y-4">
      {/* 슬롯 선택 버튼 */}
      <div className="flex gap-2">
        {(['9', '4', '2'] as const).map((slot) => (
          <button
            key={slot}
            onClick={() => setSelectedSlot(slot)}
            className={`btn ${selectedSlot === slot ? 'btn-primary' : 'btn-ghost'}`}
          >
            {slot}인 조합
          </button>
        ))}
      </div>

      {/* 조합 정보 */}
      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="card-title">{combo.name}</h3>
          <p className="text-sm opacity-70">{combo.preset_reason}</p>

          {/* 사도 이미지 표시 */}
          <div className="mt-4 flex flex-wrap gap-2">
            {apostleNames.map((name) => {
              const apostle = allApostles.find((a) => a.name === name || a.engName === name);
              return apostle ? (
                <img
                  key={apostle.id}
                  src={getApostleImagePath(apostle.engName)}
                  alt={apostle.name}
                  className="h-16 w-16 rounded"
                  title={apostle.name}
                />
              ) : null;
            })}
          </div>

          {/* 노트 있으면 표시 */}
          {combo.notes && (
            <div className="alert alert-info mt-4">
              {combo.notes.map((note, i) => (
                <p key={i}>{note}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PresetCombinationSection;
