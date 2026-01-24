/**
 * 게임 및 UI 전반에서 사용하는 공통 상수 모음
 */

// 3x3 그리드 설정
export const GRID_CONFIG = {
  SIZE: 9,
  ROWS: 3,
  COLS: 3,
} as const;

// 포지션 레이블 및 설정
export const POSITION_LABELS = {
  front: '전열',
  mid: '중열',
  back: '후열',
} as const;

// 스킬 레벨 범위
export const SKILL_LEVELS = {
  MIN: 1,
  MAX: 13,
} as const;

// 성격 시너지 활성화 기준 인원
export const SYNERGY_THRESHOLDS = [2, 4, 6, 7, 9, 10, 11] as const;

// 성격 시너지 티어 구성 (퍼센트 및 라벨)
export const SYNERGY_TIER_CONFIG = {
  2: { level: 1, hp: 20, damage: 20, label: 'Lv.1 (+20%)' },
  4: { level: 2, hp: 55, damage: 55, label: 'Lv.2 (+55%)' },
  6: { level: 3, hp: 100, damage: 100, label: 'Lv.3 (+100%)' },
  7: { level: 4, hp: 140, damage: 140, label: 'Lv.4 (+140%)' },
  9: { level: 5, hp: 200, damage: 200, label: 'Lv.5 (+200%)' },
  10: { level: 6, hp: 230, damage: 230, label: 'Lv.6 (+230%)' },
  11: { level: 7, hp: 260, damage: 260, label: 'Lv.7 (+260%)' },
} as const;
export const GAME_CONFIG = {
  GRID_SIZE: 9,
  MAX_SKILL_LEVEL: 13,
  MIN_SKILL_LEVEL: 1,
  SYNERGY_THRESHOLDS: [2, 4, 6, 7, 9, 10, 11],
} as const;
