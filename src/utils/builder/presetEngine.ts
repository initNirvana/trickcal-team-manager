import { Apostle, Personality, Position } from '@/types/apostle';
import { getEffectiveBaseScore } from './deckRecommendationUtils';

export interface DynamicPreset {
  name: string;
  deck: Apostle[];
  notes: string[];
}

/**
 * 성격과 슬롯 수(9, 4, 2)에 따라 점수 기반의 동적 프리셋을 생성합니다.
 */
export function getDynamicPreset(
  persona: Personality,
  allApostles: Apostle[],
  slot: '9' | '4' | '2',
  options?: { pvp?: boolean },
): DynamicPreset {
  const count = parseInt(slot);
  const deckSize = slot === '9' ? 9 : 6;

  // 1. 해당 성격 사도 필터링 및 점수 정렬
  const candidates = allApostles
    .filter((a) => a.persona === persona)
    .filter((a) => {
      // 4인/2인 조합에서는 우로스 제외 및 9인 전용 사도 제외
      if (slot === '4' || slot === '2') {
        if (a.name === '우로스') return false;
        if (a.scoreBySize?.size9 && a.scoreBySize?.size6) {
          return a.scoreBySize.size9 <= a.scoreBySize.size6;
        }
      }
      return true;
    })
    .sort((a, b) => {
      const recommendOptions =
        options?.pvp && slot !== '9'
          ? { deckSize: 6 as const, mode6: 'JWOPAEMTEO' as const }
          : undefined;

      // 어사이드 점수 포함을 위해 asideLevel: 2 전달
      return (
        getEffectiveBaseScore(b, deckSize, undefined, recommendOptions, 2) -
        getEffectiveBaseScore(a, deckSize, undefined, recommendOptions, 2)
      );
    });

  // 2. 역할군 및 포지션별 밸런스 고려
  const deck: Apostle[] = [];

  if (count === 9) {
    // 9인 조합: 전열 3명, 중열 3명, 후열 3명 강제 배정
    (['front', 'mid', 'back'] as const).forEach((pos) => {
      const posCandidates = candidates
        .filter((a) => {
          // position이 배열인 경우와 문자열인 경우 모두 처리
          const p = Array.isArray(a.position) ? a.position[0] : a.position;
          return p === pos;
        })
        .slice(0, 3); // 상위 3명 선택

      deck.push(...posCandidates);
    });
  } else {
    // 4인/2인 조합: 기존 로직 유지 (탱커/서포터 우선 + 점수순) + 위치별 2인 제한 추가
    const counts = { front: 0, mid: 0, back: 0 };
    const MAX_PER_LINE = 2; // 최대 2명으로 제한

    // 헬퍼 함수: 카운트 체크 후 덱에 추가
    const tryAdd = (apostle: Apostle) => {
      // 이미 덱에 있으면 스킵
      if (deck.find((d) => d.id === apostle.id)) return;

      const pos = (
        Array.isArray(apostle.position) ? apostle.position[0] : apostle.position
      ) as Position;

      // 해당 위치가 꽉 찼으면 스킵
      if (counts[pos] >= MAX_PER_LINE) return;

      deck.push(apostle);
      counts[pos]++;
    };

    const tankers = candidates.filter((a) => a.role.main === 'Tanker');
    const supporters = candidates.filter((a) => a.role.main === 'Supporter');

    if (count >= 4) {
      if (tankers.length > 0) tryAdd(tankers[0]);
      if (supporters.length > 0) tryAdd(supporters[0]);
    }

    // 나머지 점수 높은 순으로 채우기 (위치 제한 고려)
    for (const candidate of candidates) {
      if (deck.length >= count) break;
      tryAdd(candidate);
    }
  }

  // 3. 우로스 성격 적용 (공명 사도 대응) 및 정렬
  const finalizedDeck = deck.map((a) => (a.name === '우로스' ? { ...a, persona } : a));

  return {
    name: `${slot}속성 조합 예시`,
    deck: finalizedDeck,
    notes: [],
  };
}
