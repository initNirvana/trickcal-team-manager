import { useState } from 'react';
import presetData from '@/data/apostles-preset.json';
import { Personality, Apostle } from '@/types/apostle';
import { getSynergyOnIconPath } from '@/utils/apostleImages';
import PresetDeckGrid from './PresetDeckGrid';

type PresetSlot = '9' | '4' | '2';

interface PresetCombo {
  name: string;
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
  const [filterValue, setFilterValue] = useState<'reset' | Personality>('reset');

  const personalities = ['Jolly', 'Mad', 'Cool', 'Naive', 'Gloomy'] as const;
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

  const TabContent = () => (
    <div className="tab-content bg-base-100 border-base-300 rounded-box p-6">
      <div className="flex justify-center">
        <PresetDeckGrid
          deck={fullDeck}
          deckSize={deckSize as 6 | 9}
          personality={selectedPersonality}
        />
      </div>

      {combo.notes && (
        <div className="alert alert-info mt-2">
          {combo.notes.map((note, i) => (
            <p key={i}>{note}</p>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h3 className="text-lg font-bold text-black">많이 사용되는 조합 보기</h3>
      </div>

      {/* 성격 선택 필터 */}
      <div className="justify-center filter">
        {/* 초기화 버튼: UI는 전체 표시, 내용은 활발로 */}
        <input
          className="btn filter-reset"
          type="radio"
          name="preset_personality_filter"
          aria-label="All"
          title="All"
          checked={filterValue === 'reset'}
          onChange={() => {
            setFilterValue('reset');
            setSelectedPersonality('Jolly');
            setSelectedSlot('4');
          }}
        />

        {personalities.map((p) => (
          <input
            key={p}
            type="radio"
            name="preset_personality_filter"
            className="btn h-12 w-12 rounded-full bg-center bg-no-repeat p-0"
            checked={filterValue === p}
            onChange={() => {
              setFilterValue(p);
              setSelectedPersonality(p);
            }}
            style={{
              backgroundImage: `url(${getSynergyOnIconPath(p)})`,
              backgroundSize: 'cover',
            }}
          />
        ))}
      </div>

      {/* 슬롯 선택 탭 */}
      <div className="tabs tabs-box justify-center">
        {(['4', '2', '9'] as const).map((slot) => (
          <>
            <input
              key={`input-${slot}`}
              type="radio"
              name="preset_tabs"
              className="tab"
              aria-label={`${slot}인 조합`}
              checked={selectedSlot === slot}
              onChange={() => setSelectedSlot(slot)}
            />
            <TabContent key={`content-${slot}`} />
          </>
        ))}
      </div>
    </div>
  );
};

export default PresetCombinationSection;
