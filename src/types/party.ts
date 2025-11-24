import type { Apostle } from './apostle';

/**
 * 파티 멤버 설정
 * - skillLevel: 'low' | 'high' (저레벨 / 고레벨)
 * - asideTier: 0 | 1 | 2 | 3 (어사이드 레벨, 0 = 미장착)
 * - artifacts: 최대 3개
 */
export interface PartyMemberConfig {
  apostleId: string;
  skillLevel: 'low' | 'high';
  asideTier: 0 | 1 | 2 | 3;
  artifacts: any[];
}

/**
 * 저장된 파티 데이터
 */
export interface Party {
  id: string;
  name: string;
  party: PartyMemberConfig[];
  createdAt: Date;
  lastModified: Date;
}

/**
 * 파티 시뮬레이션 결과
 */
export interface PartySimulation {
  id: string;
  name: string;
  party: PartyMemberConfig[];
  createdAt: Date;
  lastModified?: Date;
  analysis: PartyAnalysis;
}

/**
 * 받는 피해량 감소 분석
 */
export interface DamageReductionBreakdown {
  apostleId: string;
  apostleName: string;
  sources: {
    skill?: number;
    aside?: number;
    artifacts?: number;
  };
  subtotal: number;
}

/**
 * 성격 시너지 분석
 */
export interface PersonalitySynergyAnalysis {
  personality: string;
  count: number;
  hpBonus: number;
  damageBonus: number;
  isActive: boolean;
  level: string; // "C급 +20%", "SS급 +200%" 등
}

/**
 * 사도 추천
 */
export interface ApostleRecommendation {
  apostleId: string;
  apostleName: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

/**
 * 파티 약점
 */
export interface PartyWeakness {
  type: 'damageReduction' | 'healing' | 'position' | 'synergy' | 'balance';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  suggestion: string;
}

/**
 * 파티 종합 점수
 */
export interface PartyScore {
  overall: number; // 0-100
  defense: number;
  synergy: number;
  balance: number;
}

/**
 * 파티 분석 결과
 */
export interface PartyAnalysis {
  totalDamageReduction: number;
  damageReductionBreakdown: DamageReductionBreakdown[];
  personalitySynergies: PersonalitySynergyAnalysis[];
  positionBalance: {
    frontLine: number;
    midLine: number;
    backLine: number;
  };
  weaknesses: PartyWeakness[];
  recommendations: ApostleRecommendation[];
  score: PartyScore;
}

/**
 * 파티 멤버 설정 (PartyMemberConfig 별칭)
 */
export type PartyMember = PartyMemberConfig;