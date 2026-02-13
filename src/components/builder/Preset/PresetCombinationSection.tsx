import { Fragment, useState } from 'react';
import { Personality } from '@/types/apostle';
import { getPersonalityIconPath } from '@/utils/apostleImages';
import PresetDeckGrid from './PresetDeckGrid';
import { getDynamicPreset } from '@/utils/builder/presetEngine';
import { useDataLoader } from '@/hooks/useDataLoader';

type PresetSlot = '9' | '4' | '2';

export const PresetCombinationSection = () => {
  const { apostles } = useDataLoader();
  const [selectedSlot, setSelectedSlot] = useState<PresetSlot>('4');
  const [internalPersonality, setInternalPersonality] = useState<Personality>('Jolly');
  const [isPvp, setIsPvp] = useState(false);

  const personalities = ['Jolly', 'Mad', 'Cool', 'Naive', 'Gloomy'] as const;

  // 엔진을 통해 실시간 점수 기반 프리셋 데이터 생성
  const dynamicPreset = getDynamicPreset(internalPersonality, apostles, selectedSlot, {
    pvp: isPvp,
  });

  const deckSize = selectedSlot === '9' ? 9 : 6;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-2">
        <div />
        <h3 className="translate-x-10 text-lg font-bold text-black">성격별 추천 사도</h3>
        <label className="label cursor-pointer gap-2">
          <span className="label-text text-xs font-bold">줘팸터</span>
          <input
            type="checkbox"
            className="toggle toggle-primary toggle-xs"
            checked={isPvp}
            onChange={(e) => setIsPvp(e.target.checked)}
          />
        </label>
      </div>

      <div className="tabs tabs-boxed mb-1 rounded-none">
        {personalities.map((persona) => (
          <button
            key={persona}
            className={`tab tab-lg h-12 flex-1 ${internalPersonality === persona ? 'tab-active' : ''}`}
            onClick={() => setInternalPersonality(persona)}
          >
            <img
              src={getPersonalityIconPath(persona)}
              className="pointer-events-none h-10 w-10"
              alt={persona}
            />
          </button>
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
                  personality={internalPersonality}
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
