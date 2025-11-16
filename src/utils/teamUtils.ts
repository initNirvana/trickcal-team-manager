import type { Apostle, Position, Personality } from '../types/apostle';
import { getPersonalities, getPositions } from '../types/apostle';

/**
 * 팀 전체 인원 계산
 */
export const getTotalTeamSize = (apostles: Apostle[]): number => {
  return apostles.length;
};

/**
 * 각 포지션별 인원 수 확인
 */
export const getPositionCounts = (apostles: Apostle[]): Record<Position, number> => {
  const result: Record<Position, number> = {
    frontLine: 0,
    midLine: 0,
    backLine: 0,
  };

  apostles.forEach((apostle) => {
    const positions = getPositions(apostle);
    positions.forEach((position) => {
      result[position]++;
    });
  });

  return result;
};

/**
 * 성격별 인원 분류 (배열 지원)
 * 5가지 성격: 광기, 냉정, 순수, 우울, 활발
 */
export const countByPersonality = (
  apostles: Apostle[]
): Record<Personality, number> => {
  const personalities: Personality[] = ['광기', '냉정', '순수', '우울', '활발'];
  const result: Record<Personality, number> = {
    '광기': 0,
    '냉정': 0,
    '순수': 0,
    '우울': 0,
    '활발': 0,
  };

  apostles.forEach((apostle) => {
    const apostlePersonalities = getPersonalities(apostle);
    apostlePersonalities.forEach((personality) => {
      result[personality]++;
    });
  });

  return result;
};

/**
 * 팀 전체 조회 (모든 Apostle)
 */
export const getAllTeamApostles = (apostles: Apostle[]): Apostle[] => {
  return apostles;
};

/**
 * Apostle이 이미 팀에 있는지 확인
 */
export const isApostleInTeam = (apostles: Apostle[], apostleId: string): boolean => {
  return apostles.some((a) => a.id === apostleId);
};

/**
 * 특정 포지션에 속하는 사도 필터링
 */
export const getApostlesForPosition = (
  apostles: Apostle[],
  position: Position
): Apostle[] => {
  return apostles.filter((apostle) => {
    const positions = getPositions(apostle);
    return positions.includes(position);
  });
};

/**
 * 포지션별로 사도 그룹화
 */
export const groupByPosition = (apostles: Apostle[]): Record<Position, Apostle[]> => {
  const result: Record<Position, Apostle[]> = {
    frontLine: [],
    midLine: [],
    backLine: [],
  };

  apostles.forEach((apostle) => {
    const positions = getPositions(apostle);
    positions.forEach((position) => {
      result[position].push(apostle);
    });
  });

  return result;
};

/**
 * 성격별로 사도 그룹화 (배열 지원)
 * 5가지 성격: 광기, 냉정, 순수, 우울, 활발
 */
export const groupByPersonality = (apostles: Apostle[]): Record<Personality, Apostle[]> => {
  const result: Record<Personality, Apostle[]> = {
    '광기': [],
    '냉정': [],
    '순수': [],
    '우울': [],
    '활발': [],
  };

  apostles.forEach((apostle) => {
    const personalities = getPersonalities(apostle);
    personalities.forEach((personality) => {
      result[personality].push(apostle);
    });
  });

  return result;
};

/**
 * 역할별로 사도 그룹화
 */
export const groupByRole = (apostles: Apostle[]): Record<string, Apostle[]> => {
  const result: Record<string, Apostle[]> = {
    '딜러': [],
    '탱커': [],
    '서포터': [],
  };

  apostles.forEach((apostle) => {
    const role = apostle.role || '딜러';
    if (!result[role]) {
      result[role] = [];
    }
    result[role].push(apostle);
  });

  return result;
};

/**
 * 어사이드 여부로 사도 그룹화
 */
export const groupByAside = (apostles: Apostle[]): { aside: Apostle[]; normal: Apostle[] } => {
  return {
    aside: apostles.filter((a) => a.hasAside === 1),
    normal: apostles.filter((a) => a.hasAside !== 1),
  };
};

/**
 * 사도 검색 (이름, 성격, 역할 등으로)
 */
export const searchApostles = (
  apostles: Apostle[],
  query: string,
  filters?: {
    personality?: Personality;
    role?: string;
    position?: Position;
  }
): Apostle[] => {
  let results = apostles;

  // 텍스트 검색
  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter((a) => a.name.toLowerCase().includes(lowerQuery));
  }

  // 필터 적용
  if (filters) {
    if (filters.personality) {
      results = results.filter((a) => {
        const personalities = getPersonalities(a);
        return personalities.includes(filters.personality!);
      });
    }

    if (filters.role) {
      results = results.filter((a) => a.role === filters.role);
    }

    if (filters.position) {
      results = results.filter((a) => {
        const positions = getPositions(a);
        return positions.includes(filters.position!);
      });
    }
  }

  return results;
};

/**
 * 이름 순서대로 사도 정렬
 */
export const sortByName = (apostles: Apostle[]): Apostle[] => {
  return [...apostles].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
};

/**
 * 위치 순서대로 사도 정렬
 */
export const sortByPosition = (apostles: Apostle[]): Apostle[] => {
  const positionOrder: Record<Position, number> = {
    frontLine: 0,
    midLine: 1,
    backLine: 2,
  };

  return [...apostles].sort((a, b) => {
    const positionsA = getPositions(a);
    const positionsB = getPositions(b);
    const orderA = Math.min(...positionsA.map((p) => positionOrder[p]));
    const orderB = Math.min(...positionsB.map((p) => positionOrder[p]));
    return orderA - orderB;
  });
};

/**
 * 사도 정보를 간단한 문자열로 표시
 */
export const formatApostleInfo = (apostle: Apostle): string => {
  const role = apostle.role ? `(${apostle.role})` : '';
  const aside = apostle.hasAside === 1 ? '⭐' : '';
  return `${apostle.name} ${role} ${aside}`.trim();
};

/**
 * 위치 라벨 반환
 */
export const getPositionLabel = (position: Position): string => {
  const labels: Record<Position, string> = {
    frontLine: '전열',
    midLine: '중열',
    backLine: '후열',
  };
  return labels[position];
};

/**
 * 역할 라벨 반환
 */
export const getRoleLabel = (role: string | undefined): string => {
  const labels: Record<string, string> = {
    '딜러': '딜러',
    '탱커': '탱커',
    '서포터': '서포터',
  };
  return labels[role || '딜러'] || '미정';
};

/**
 * 중복 제거 (ID 기반)
 */
export const removeDuplicates = (apostles: Apostle[]): Apostle[] => {
  const seen = new Set<string>();
  return apostles.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
};

/**
 * 배열 병합 (중복 제거)
 */
export const mergeApostles = (...apostleLists: Apostle[][]): Apostle[] => {
  return removeDuplicates(apostleLists.flat());
};