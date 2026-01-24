import { describe, it, expect } from 'vitest';
import type { Apostle } from '@/types/apostle';
import { analyzeSynergies, SYNERGY_TIERS, analyzeDeck } from '@/utils/deckAnalysisUtils';

/**
 * 테스트용 사도 객체 생성 헬퍼
 */
const createMockApostle = (
  id: string,
  name: string,
  persona: 'Jolly' | 'Mad' | 'Naive' | 'Gloomy' | 'Cool',
): Apostle => ({
  id,
  name,
  engName: name.toLowerCase(),
  isEldain: false,
  rank: 1,
  race: '용족',
  persona,
  role: { main: 'Attacker', subRole: 'Melee', trait: ['Damage'] },
  method: 'Physical',
  position: 'front',
  aside: { hasAside: false, importance: null, score: 0 },
  baseScore: 100,
});

describe('analyzeSynergies', () => {
  it('should calculate no synergy for empty deck', () => {
    const synergies = analyzeSynergies([]);
    expect(synergies).toHaveLength(5);
    synergies.forEach((s) => {
      expect(s.isActive).toBe(false);
      expect(s.bonus.hp).toBe(0);
      expect(s.bonus.damage).toBe(0);
    });
  });

  it('should calculate Lv.1 synergy for 2 same personas', () => {
    const deck = [
      createMockApostle('1', 'Aposle1', 'Jolly'),
      createMockApostle('2', 'Aposle2', 'Jolly'),
    ];
    const synergies = analyzeSynergies(deck);
    const jollySynergy = synergies.find((s) => s.personality === 'Jolly');

    expect(jollySynergy).toBeDefined();
    expect(jollySynergy!.isActive).toBe(true);
    expect(jollySynergy!.bonus.hp).toBe(20);
    expect(jollySynergy!.bonus.damage).toBe(20);
    expect(jollySynergy!.activeCount).toBe(2);
  });

  it('should calculate Lv.5 synergy for 9 same personas', () => {
    const deck = Array.from({ length: 9 }, (_, i) =>
      createMockApostle(`${i}`, `Apostle${i}`, 'Mad'),
    );
    const synergies = analyzeSynergies(deck);
    const madSynergy = synergies.find((s) => s.personality === 'Mad');

    expect(madSynergy).toBeDefined();
    expect(madSynergy!.isActive).toBe(true);
    expect(madSynergy!.bonus.hp).toBe(200);
    expect(madSynergy!.bonus.damage).toBe(200);
    expect(madSynergy!.activeCount).toBe(9);
  });

  it('should handle mixed persona deck correctly', () => {
    const deck = [
      createMockApostle('1', 'A1', 'Jolly'),
      createMockApostle('2', 'A2', 'Jolly'),
      createMockApostle('3', 'A3', 'Mad'),
      createMockApostle('4', 'A4', 'Mad'),
      createMockApostle('5', 'A5', 'Mad'),
      createMockApostle('6', 'A6', 'Mad'),
    ];
    const synergies = analyzeSynergies(deck);

    const jollySynergy = synergies.find((s) => s.personality === 'Jolly');
    const madSynergy = synergies.find((s) => s.personality === 'Mad');

    expect(jollySynergy!.isActive).toBe(true);
    expect(jollySynergy!.activeCount).toBe(2);
    expect(madSynergy!.isActive).toBe(true);
    expect(madSynergy!.activeCount).toBe(4);
  });

  it('should preserve tier config thresholds', () => {
    // SYNERGY_TIERS는 [2, 4, 6, 7, 9, 10, 11]을 포함해야 함
    const thresholds = SYNERGY_TIERS.map((t) => t.count);
    expect(thresholds).toContain(2);
    expect(thresholds).toContain(4);
    expect(thresholds).toContain(6);
    expect(thresholds).toContain(7);
    expect(thresholds).toContain(9);
    expect(thresholds).toContain(10);
    expect(thresholds).toContain(11);
  });

  it('should calculate extra count correctly', () => {
    const deck = Array.from({ length: 5 }, (_, i) =>
      createMockApostle(`${i}`, `Apostle${i}`, 'Naive'),
    );
    const synergies = analyzeSynergies(deck);
    const naiveSynergy = synergies.find((s) => s.personality === 'Naive');

    // Lv.2 활성화 (4인), 추가 1인
    expect(naiveSynergy!.activeCount).toBe(4);
    expect(naiveSynergy!.extraCount).toBe(1);
    expect(naiveSynergy!.bonus.damage).toBe(55); // Lv.2
  });
});

describe('analyzeDeck', () => {
  it('should return aggregated deck analysis', () => {
    const deck = [
      createMockApostle('1', 'A1', 'Jolly'),
      createMockApostle('2', 'A2', 'Jolly'),
      createMockApostle('3', 'A3', 'Mad'),
      createMockApostle('4', 'A4', 'Mad'),
    ];
    const analysis = analyzeDeck(deck);

    expect(analysis.totalApostles).toBe(4);
    expect(analysis.synergies).toHaveLength(5);
    expect(analysis.totalBonus.hp).toBeGreaterThan(0);
    expect(analysis.totalBonus.damage).toBeGreaterThan(0);
  });

  it('should calculate total bonus as sum of active synergies', () => {
    const deck = [
      createMockApostle('1', 'A1', 'Gloomy'),
      createMockApostle('2', 'A2', 'Gloomy'),
      createMockApostle('3', 'A3', 'Cool'),
      createMockApostle('4', 'A4', 'Cool'),
    ];
    const analysis = analyzeDeck(deck);

    // 2개의 Lv.1 시너지가 활성화됨
    const activeBonuses = analysis.synergies.filter((s) => s.isActive).map((s) => s.bonus.damage);
    const expectedTotal = activeBonuses.reduce((a, b) => a + b, 0);

    expect(analysis.totalBonus.damage).toBe(expectedTotal);
  });
});
