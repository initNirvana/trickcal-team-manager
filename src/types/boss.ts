export type ContentType = 'dimension' | 'frontier';

export type BossTag =
  // 딜
  | '방어력감소'
  | '피해량감소'
  | '광역딜'
  | '단일딜'
  // CC·디버프
  | '침묵'
  | '감전'
  | '화상'
  | '쓰라림'
  | 'CC'
  | '기절'
  | 'SP감소'
  | 'SP제거'
  | '시간정지'
  | '레이저차단'
  | '잡몹정리'
  // 생존·서포트
  | '받는피해량감소'
  | '주는피해량감소'
  | '광역힐'
  | '광역보호막'
  | '버프'
  | '시간가속'
  | '무적'
  // 포지셔닝·기타
  | '분신'
  | '후열보호'
  | '범위공격'
  | '근거리탱커'
  | '단일탱'
  | '저속딜러';

export interface BossPattern {
  name: string;
  debuffs?: string[];
  note?: string;
}

export interface BossConfig {
  id: string;
  name: string;
  content: ContentType;
  recommendedTags: BossTag[];
  notRecommendedTags: BossTag[];
  memo?: string;
}
