import { describe, it, expect } from 'vitest';
import { getRecommendedApostles } from '../utils/party/deckGuideEngine';
import { getDynamicPreset } from '../utils/builder/presetEngine';
import { Apostle } from '../types/apostle';

const mockApostles: Apostle[] = [
  {
    id: 'a1',
    name: '점수낮은탱커',
    persona: 'Naive',
    role: { main: 'Tanker' },
    baseScore: 10,
    position: 'front',
    aside: { hasAside: false, score: 0 },
  },
  {
    id: 'a2',
    name: '점수높은탱커',
    persona: 'Naive',
    role: { main: 'Tanker' },
    baseScore: 90,
    position: 'front',
    aside: { hasAside: false, score: 0 },
  },
  {
    id: 'a3',
    name: '딜러1',
    persona: 'Naive',
    role: { main: 'Attacker' },
    baseScore: 80,
    position: 'mid',
    aside: { hasAside: false, score: 0 },
  },
  {
    id: 'a4',
    name: '딜러2',
    persona: 'Naive',
    role: { main: 'Attacker' },
    baseScore: 70,
    position: 'mid',
    aside: { hasAside: false, score: 0 },
  },
  {
    id: 'a5',
    name: '서포터1',
    persona: 'Naive',
    role: { main: 'Supporter' },
    baseScore: 60,
    position: 'back',
    aside: { hasAside: false, score: 0 },
  },
  {
    id: 'a6',
    name: '서포터2',
    persona: 'Naive',
    role: { main: 'Supporter' },
    baseScore: 50,
    position: 'back',
    aside: { hasAside: false, score: 0 },
  },
  {
    id: 'a7',
    name: '딜러3',
    persona: 'Naive',
    role: { main: 'Attacker' },
    baseScore: 45,
    position: 'mid',
    aside: { hasAside: false, score: 0 },
  },
  {
    id: 'a8',
    name: '딜러4',
    persona: 'Naive',
    role: { main: 'Attacker' },
    baseScore: 40,
    position: 'mid',
    aside: { hasAside: false, score: 0 },
  },
] as unknown as Apostle[];

describe('Dynamic Engines Verification', () => {
  describe('Guide Engine', () => {
    it('성격이 순수일 때 점수가 가장 높은 탱커가 포함되어야 함', () => {
      const guide = getRecommendedApostles('순수', 'pve', mockApostles);
      expect(guide).not.toBeNull();
      const hasHighRankTanker = guide!.core.some((m) => m.name === '점수높은탱커');
      const hasLowRankTanker = guide!.core.some((m) => m.name === '점수낮은탱커');

      expect(hasHighRankTanker).toBe(true);
      expect(hasLowRankTanker).toBe(false);
    });

    it('PVP 모드일 때 PVP 관련 데이터가 반영되어야 함', () => {
      const pvpApostle = {
        ...mockApostles[1],
        pvp: { reason: 'PVP 전용 이유', aside: '권장' as const, score: 100 },
      };
      const guide = getRecommendedApostles('순수', 'pvp', [pvpApostle, ...mockApostles.slice(2)]);
      const target = guide!.core.find((m) => m.name === '점수높은탱커');
      expect(target?.reason).toBe('PVP 전용 이유');
    });
  });

  describe('Preset Engine', () => {
    it('4인 프리셋 요청 시 정확히 4명의 사도를 반환해야 함', () => {
      const preset = getDynamicPreset('Naive', mockApostles, '4');
      expect(preset.deck.length).toBe(4);
    });

    it('2인 프리셋 요청 시 점수 상위 2명이 포함되어야 함', () => {
      const preset = getDynamicPreset('Naive', mockApostles, '2');
      expect(preset.deck.length).toBe(2);
      expect(preset.deck.map((a) => a.id)).toContain('a2');
      expect(preset.deck.map((a) => a.id)).toContain('a3');
    });

    it('4인/2인 프리셋에서는 우로스가 제외되어야 함', () => {
      // 우로스(점수 매우 높음)를 포함한 데이터셋 생성
      const mockWithUros = [
        ...mockApostles,
        {
          id: 'uro',
          name: '우로스',
          persona: 'Naive',
          role: { main: 'Tanker' },
          baseScore: 999,
          position: 'front',
          aside: { hasAside: false, score: 0 },
        },
      ] as unknown as Apostle[];

      // 4인 프리셋 요청
      const preset4 = getDynamicPreset('Naive', mockWithUros, '4');
      const hasUros4 = preset4.deck.some((a) => a.name === '우로스');
      expect(hasUros4).toBe(false);

      // 9인 프리셋 요청 (여기선 포함되어야 함)
      const preset9 = getDynamicPreset('Naive', mockWithUros, '9');
      const hasUros9 = preset9.deck.some((a) => a.name === '우로스');
      expect(hasUros9).toBe(true);
    });

    it('pvp 옵션 적용 시 PvP 점수가 반영되어 정렬되어야 함', () => {
      const pvpMock = [
        {
          id: 'p1',
          name: 'PvP사도1',
          persona: 'Naive',
          role: { main: 'Attacker' },
          baseScore: 50,
          pvp: { score: 100 },
          position: 'mid',
          aside: { hasAside: false, score: 0 },
        },
        {
          id: 'p2',
          name: 'PvP사도2',
          persona: 'Naive',
          role: { main: 'Attacker' },
          baseScore: 80,
          pvp: { score: 10 },
          position: 'mid',
          aside: { hasAside: false, score: 0 },
        },
      ] as unknown as Apostle[];

      // PvP 옵션 없을 때: 점수 높은 PvP사도2가 앞에 옴
      const presetNormal = getDynamicPreset('Naive', pvpMock, '2');
      expect(presetNormal.deck[0].name).toBe('PvP사도2');

      // PvP 옵션 있을 때: 보너스 점수 포함 시 PvP사도1(50+100)이 PvP사도2(80+10)보다 높음
      const presetPvp = getDynamicPreset('Naive', pvpMock, '2', { pvp: true });
      expect(presetPvp.deck[0].name).toBe('PvP사도1');
    });

    it('9인 조합 시 각 포지션별 3명씩(후3/중3/전3) 강제 배정되는지 확인', () => {
      // 후열 4명, 중열 4명, 전열 2명 등 불균형하게 고득점자가 분포된 상황 모의
      const skewedMock = [
        {
          id: 'b1',
          name: '후열1',
          persona: 'Naive',
          role: { main: 'Supporter' },
          baseScore: 100,
          position: 'back',
          aside: { hasAside: false, score: 0 },
        },
        {
          id: 'b2',
          name: '후열2',
          persona: 'Naive',
          role: { main: 'Supporter' },
          baseScore: 99,
          position: 'back',
          aside: { hasAside: false, score: 0 },
        },
        {
          id: 'b3',
          name: '후열3',
          persona: 'Naive',
          role: { main: 'Supporter' },
          baseScore: 98,
          position: 'back',
          aside: { hasAside: false, score: 0 },
        },
        {
          id: 'b4',
          name: '후열4',
          persona: 'Naive',
          role: { main: 'Supporter' },
          baseScore: 97,
          position: 'back',
          aside: { hasAside: false, score: 0 },
        },
        {
          id: 'm1',
          name: '중열1',
          persona: 'Naive',
          role: { main: 'Attacker' },
          baseScore: 90,
          position: 'mid',
          aside: { hasAside: false, score: 0 },
        },
        {
          id: 'm2',
          name: '중열2',
          persona: 'Naive',
          role: { main: 'Attacker' },
          baseScore: 89,
          position: 'mid',
          aside: { hasAside: false, score: 0 },
        },
        {
          id: 'm3',
          name: '중열3',
          persona: 'Naive',
          role: { main: 'Attacker' },
          baseScore: 88,
          position: 'mid',
          aside: { hasAside: false, score: 0 },
        },
        {
          id: 'm4',
          name: '중열4',
          persona: 'Naive',
          role: { main: 'Attacker' },
          baseScore: 87,
          position: 'mid',
          aside: { hasAside: false, score: 0 },
        },
        {
          id: 'f1',
          name: '전열1',
          persona: 'Naive',
          role: { main: 'Tanker' },
          baseScore: 80,
          position: 'front',
          aside: { hasAside: false, score: 0 },
        },
        {
          id: 'f2',
          name: '전열2',
          persona: 'Naive',
          role: { main: 'Tanker' },
          baseScore: 79,
          position: 'front',
          aside: { hasAside: false, score: 0 },
        },
        {
          id: 'f3',
          name: '전열3',
          persona: 'Naive',
          role: { main: 'Tanker' },
          baseScore: 78,
          position: 'front',
          aside: { hasAside: false, score: 0 },
        },
        {
          id: 'f4',
          name: '전열4',
          persona: 'Naive',
          role: { main: 'Tanker' },
          baseScore: 10,
          position: 'front',
          aside: { hasAside: false, score: 0 },
        },
      ] as unknown as Apostle[];

      const preset = getDynamicPreset('Naive', skewedMock, '9');

      expect(preset.deck.length).toBe(9);

      // 각 포지션별로 정확히 3명씩 있어야 함
      const backCount = preset.deck.filter((a) => a.position === 'back').length;
      const midCount = preset.deck.filter((a) => a.position === 'mid').length;
      const frontCount = preset.deck.filter((a) => a.position === 'front').length;

      expect(backCount).toBe(3);
      expect(midCount).toBe(3);
      expect(frontCount).toBe(3);

      // 후열에서 점수 4등인 '후열4'(97점)는 제외되어야 함
      expect(preset.deck.find((a) => a.name === '후열4')).toBeUndefined();
    });
  });
});
