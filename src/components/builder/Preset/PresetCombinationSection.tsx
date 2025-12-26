import { useState } from 'react';
import presetData from '@/data/apostles-preset.json';
import { Personality, Apostle, getPersonalityKoreanName } from '@/types/apostle';
import PresetDeckGrid from './PresetDeckGrid';

type PresetSlot = '9' | '4' | '2';

interface PresetCombo {
  name: string;
  preset_reason: string;
  front?: string[];
  mid?: string[];
  back?: string[];
  notes?: string[];
  by_position?: {
    전열?: string[];
    중열?: string[];
    후열?: string[];
  };
  by_apostle?: Record<string, string[]>;
}

const presetCombinations: Record<
  Personality,
  Record<PresetSlot, PresetCombo>
> = presetData.combinations as Record<Personality, Record<PresetSlot, PresetCombo>>;

interface PresetCombinationSectionProps {
  allApostles: Apostle[];
}

export const PresetCombinationSection = ({ allApostles }: PresetCombinationSectionProps) => {
  const [selectedSlot, setSelectedSlot] = useState<PresetSlot>('4');
  const [selectedPersonality, setSelectedPersonality] = useState<Personality>('Jolly');

  const combo = presetCombinations[selectedPersonality]?.[selectedSlot];

  if (!combo) return <div>데이터 없음</div>;

  const findApostle = (name: string): Apostle | undefined => {
    return allApostles.find((a) => a.engName === name || a.name === name);
  };

  const mapToApostles = (names: string[]): Apostle[] =>
    names.map(findApostle).filter((a): a is Apostle => a !== undefined);

  const frontApostles = mapToApostles(combo.front || []);
  const midApostles = mapToApostles(combo.mid || []);
  const backApostles = mapToApostles(combo.back || []);

  const fullDeck: Apostle[] = [...frontApostles, ...midApostles, ...backApostles].map((apostle) =>
    apostle.name === '우로스' ? { ...apostle, persona: selectedPersonality } : apostle,
  );
  const deckSize = selectedSlot === '9' ? 9 : 6;

  return (
    <div className="space-y-3">
      {/* 성격 선택 드롭다운 */}
      <div className="mb-4 flex justify-center gap-2">
        {(['Jolly', 'Mad', 'Cool', 'Naive', 'Gloomy'] as Personality[]).map((personality) => (
          <button
            key={personality}
            onClick={() => setSelectedPersonality(personality)}
            className={`btn ${selectedPersonality === personality ? 'btn-primary' : 'btn-outline'}`}
          >
            {getPersonalityKoreanName(personality)}
          </button>
        ))}
      </div>

      {/* 슬롯 선택 버튼 */}
      <div className="flex gap-2">
        {(['4', '2', '9'] as const).map((slot) => (
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
      <div className="card card-sm bg-base-200">
        <div className="card-body">
          <h3 className="card-title">{combo.name}</h3>

          {/* 덱 그리드 표시 */}
          <div className="flex justify-center">
            <PresetDeckGrid
              deck={fullDeck}
              deckSize={deckSize as 6 | 9}
              personality={selectedPersonality}
            />
          </div>

          {/* 노트 있으면 표시 */}
          {combo.notes && (
            <div className="alert alert-info mt-2">
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
