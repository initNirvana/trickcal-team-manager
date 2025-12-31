/**
 * 어사이드 적용 타입
 */
export type AsideTarget = 'All' | 'Front' | 'Mid' | 'Back' | 'Persona';

/**
 * 피해 증가/감소 수치
 * @property {number} [Increase] - 피해량 증가.
 * @property {number} [Reduction] - 피해량 감소.
 */
export interface AsideModifier {
  Increase?: number;
  Reduction?: number;
}

/**
 * 물리 피해 관련
 */
export interface AsidePhysical {
  Increase?: number;
  Reduction?: number;
}

/**
 * 마법 피해 관련
 */
export interface AsideMagical {
  Increase?: number;
  Reduction?: number;
}

/**
 * 스킬 피해 관련
 */
export interface AsideSkill {
  Increase?: number;
  Reduction?: number;
}

/**
 * 치명타 관련
 * @property {number} [Increase] - 치명타 증가.
 * @property {number} [IncreaseDamage] - 치명 피해 증가.
 * @property {number} [resist] - 치명타 저항.
 * @property {number} [damageResist] - 치명 피해 저항.
 */
export interface AsideCritical {
  Increase?: number;
  IncreaseDamage?: number;
  resist?: number;
  damageResist?: number;
}

/**
 * 어사이드 아이템
 */
export interface Aside {
  /** 사도 ID */
  apostleId: string;

  /** 사도 이름 */
  apostleName?: string;

  /** 어사이드 이름 */
  name: string;

  /** 등급 (2성, 3성) */
  level: number;

  /** 설명 */
  description?: string;

  /** 적용 대상 (전체/전열/중열/후열/성격) */
  type?: AsideTarget | AsideTarget[];

  /** 피해 증가/감소 */
  damage?: AsideModifier[];

  /** 스킬 피해 증가/감소 */
  skill?: AsideSkill[];

  /** 물리 피해 증가/감소 */
  physical?: AsidePhysical[];

  /** 마법 피해 증가/감소 */
  magical?: AsideMagical[];

  /** 치명타 관련 */
  critical?: AsideCritical[];

  /** SP 회복량 증가 */
  spRecovery?: number;

  /** 공격 속도 증가 */
  attackSpeed?: number;

  /** 최대 HP% 증가 */
  hp?: number;

  /** 성격 추가 */
  persona?: string;
}

/**
 * 어사이드 데이터 전체
 */
export interface AsidesData {
  asides: Aside[];
}
