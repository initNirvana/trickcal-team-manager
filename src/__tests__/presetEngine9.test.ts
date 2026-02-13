import { describe, it, expect } from 'vitest';
import { getDynamicPreset } from '../utils/builder/presetEngine';
import { Apostle } from '../types/apostle';

const mockApostles: Apostle[] = [
  {
    id: 'f1',
    name: '전열1',
    persona: 'Naive',
    role: { main: 'Tanker' },
    baseScore: 100,
    position: 'front',
    aside: { hasAside: false, score: 0 },
  },
  {
    id: 'f2',
    name: '전열2',
    persona: 'Naive',
    role: { main: 'Tanker' },
    baseScore: 90,
    position: 'front',
    aside: { hasAside: false, score: 0 },
  },
  {
    id: 'f3',
    name: '전열3',
    persona: 'Naive',
    role: { main: 'Tanker' },
    baseScore: 80,
    position: 'front',
    aside: { hasAside: false, score: 0 },
  },
  {
    id: 'f4',
    name: '전열4_PVP',
    persona: 'Naive',
    role: { main: 'Tanker' },
    baseScore: 50,
    pvp: { score: 200, reason: 'PVP OP', aside: '필수' },
    position: 'front',
    aside: { hasAside: false, score: 0 },
  },
  // 중열/후열 더미 데이터 (9인 덱 요구사항: 전/중/후 각 3명)
  // 부족하면 에러날 수 있으니 채워둠
  {
    id: 'm1',
    name: 'm1',
    persona: 'Naive',
    role: { main: 'Attacker' },
    baseScore: 10,
    position: 'mid',
    aside: { hasAside: false, score: 0 },
  },
  {
    id: 'm2',
    name: 'm2',
    persona: 'Naive',
    role: { main: 'Attacker' },
    baseScore: 10,
    position: 'mid',
    aside: { hasAside: false, score: 0 },
  },
  {
    id: 'm3',
    name: 'm3',
    persona: 'Naive',
    role: { main: 'Attacker' },
    baseScore: 10,
    position: 'mid',
    aside: { hasAside: false, score: 0 },
  },
  {
    id: 'b1',
    name: 'b1',
    persona: 'Naive',
    role: { main: 'Supporter' },
    baseScore: 10,
    position: 'back',
    aside: { hasAside: false, score: 0 },
  },
  {
    id: 'b2',
    name: 'b2',
    persona: 'Naive',
    role: { main: 'Supporter' },
    baseScore: 10,
    position: 'back',
    aside: { hasAside: false, score: 0 },
  },
  {
    id: 'b3',
    name: 'b3',
    persona: 'Naive',
    role: { main: 'Supporter' },
    baseScore: 10,
    position: 'back',
    aside: { hasAside: false, score: 0 },
  },
] as unknown as Apostle[];

describe('Preset Engine 9-Person Logic', () => {
  it('9인 덱에서는 PVP 옵션이 켜져 있어도 PVP 점수가 무시되어야 함', () => {
    // PVP 점수 포함 시: 전열4(250) > 전열1(100) > 전열2(90) -> 전열4가 포함됨
    // PVP 점수 무시 시: 전열1(100) > 전열2(90) > 전열3(80) > 전열4(50) -> 전열4가 제외됨

    const preset = getDynamicPreset('Naive', mockApostles, '9', { pvp: true });

    const deckIds = preset.deck.map((a) => a.id);
    expect(deckIds).toContain('f1');
    expect(deckIds).toContain('f2');
    expect(deckIds).toContain('f3');
    expect(deckIds).not.toContain('f4');
  });

  it('4인 덱에서는 PVP 옵션이 켜지면 PVP 점수가 반영되어야 함 (기존 로직 유지 확인)', () => {
    // 4인 덱은 탱커1, 서포터1, 나머지 점수순 2명
    // 전열4가 PVP 점수 받으면 250점으로 매우 높음 -> 포함되어야 함
    const preset = getDynamicPreset('Naive', mockApostles, '4', { pvp: true });
    const deckIds = preset.deck.map((a) => a.id);

    // 4인덱 로직: 탱커1(f1 or f4?), 서포터1(b1), 나머지 상위.
    // 점수순: f4(250), f1(100), f2(90), f3(80)...
    // f4가 포함되어야 정상 (가장 높은 점수)
    expect(deckIds).toContain('f4');
  });
});
