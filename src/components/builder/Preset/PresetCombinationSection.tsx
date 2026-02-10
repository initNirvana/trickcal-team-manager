import { Fragment, useState, useMemo } from 'react';
import { Personality, Apostle } from '@/types/apostle';
import { getPersonalityIconPath } from '@/utils/apostleImages';
import PresetDeckGrid from './PresetDeckGrid';
import { getDynamicPreset } from '@/utils/builder/presetEngine';

type PresetSlot = '9' | '4' | '2';

interface PresetCombinationSectionProps {
  allApostles: Apostle[];
}

export const PresetCombinationSection = ({ allApostles }: PresetCombinationSectionProps) => {
  const [selectedSlot, setSelectedSlot] = useState<PresetSlot>('4');
  const [selectedPersonality, setSelectedPersonality] = useState<Personality>('Jolly');
  const [filterValue, setFilterValue] = useState<'reset' | Personality>('reset');

  const personalities = ['Jolly', 'Mad', 'Cool', 'Naive', 'Gloomy'] as const;

  // 엔진을 통해 실시간 점수 기반 프리셋 데이터 생성
  const dynamicPreset = useMemo(() => {
    return getDynamicPreset(selectedPersonality, allApostles, selectedSlot);
  }, [selectedPersonality, allApostles, selectedSlot]);

  const deckSize = selectedSlot === '9' ? 9 : 6;

  return (
    <div className="space-y-1.5">
      <div className="text-center">
        <h3 className="text-lg font-bold text-black">많이 사용되는 조합 보기</h3>
      </div>

      {/* 성격 선택 필터 */}
      <div id="preset-personality-section" className="justify-center filter">
        <input
          className="btn filter-reset"
          type="radio"
          name="preset_personality_filter"
          aria-label="All"
          checked={filterValue === 'reset'}
          onChange={() => {
            setFilterValue('reset');
            setSelectedPersonality('Jolly');
            setSelectedSlot('4');
          }}
          style={{
            backgroundImage: `url(${getPersonalityIconPath('Resonance' as Personality)})`,
            backgroundSize: 'cover',
          }}
        />

        {personalities.map((persona) => (
          <input
            key={persona}
            type="radio"
            name="preset_personality_filter"
            className="btn h-12 w-12 rounded-full bg-center bg-no-repeat p-0"
            checked={filterValue === persona}
            onChange={() => {
              setFilterValue(persona);
              setSelectedPersonality(persona);
            }}
            style={{
              backgroundImage: `url(${getPersonalityIconPath(persona)})`,
              backgroundSize: 'cover',
            }}
          />
        ))}
      </div>

      {/* 슬롯 선택 탭 */}
      <div className="tabs tabs-box justify-center">
        {(['4', '2', '9'] as const).map((slot) => (
          <Fragment key={slot}>
            <input
              key={`input-${slot}`}
              type="radio"
              name="preset_tabs"
              className="tab"
              aria-label={`${slot}속성 조합`}
              checked={selectedSlot === slot}
              onChange={() => setSelectedSlot(slot)}
            />
            <div className="tab-content bg-base-100 border-base-300 rounded-box p-2">
              <div className="flex justify-center">
                <PresetDeckGrid
                  deck={dynamicPreset.deck}
                  deckSize={deckSize as 6 | 9}
                  personality={selectedPersonality}
                />
              </div>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default PresetCombinationSection;
