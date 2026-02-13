import { Personality } from '@/types/apostle';

export const PERSONALITIES: Personality[] = ['Jolly', 'Mad', 'Cool', 'Naive', 'Gloomy'];

// 각 성격별 추천 프리셋 (4+2 조합)
export const PRESET_DECKS: Record<Exclude<Personality, 'Resonance'>, string[]> = {
  Jolly: ['Momo', 'Ui', 'Vela', 'Suro', 'TigHero', 'Renewa'],
  Mad: ['TigHero', 'Renewa', 'Polan', 'Neti', 'Suro', 'Ui'],
  Cool: ['DianaYester', 'Ricota', 'Aya', 'Picora', 'xXionx', 'Yomi'],
  Gloomy: ['xXionx', 'Yomi', 'Snorky', 'Asana', 'Renewa', 'TigHero'],
  Naive: ['Vivi', 'Ayla', 'Naia', 'Ran', 'Momo', 'Suro'],
};

export const STEPS = [
  { id: 1, label: '성격 선택', desc: '메인으로 사용하고 싶은 성격의 조합을 확인해요' },
  { id: 2, label: '추천 확인', desc: '성격별 베스트 조합을 확인해요' },
  { id: 3, label: '사도 배치', desc: '사도를 직접 배치해보세요' },
] as const;

export const POSITION_MAP = {
  back: { indices: [0, 3, 6], label: '후열', colorClass: 'bg-primary text-primary-content' },
  mid: { indices: [1, 4, 7], label: '중열', colorClass: 'bg-success text-success-content' },
  front: { indices: [2, 5, 8], label: '전열', colorClass: 'bg-error text-error-content' },
} as const;
