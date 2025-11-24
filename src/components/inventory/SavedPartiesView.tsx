import React, { useState } from 'react';

import type { PartySimulation } from '../../types/party';

/**
 * useInventory 훅의 반환 타입
 */
export interface InventoryStats {
  totalParties: number;
  averageScore: number;
  highestScore: number;
  averageDamageReduction: number;
}

export interface UseInventoryReturn {
  parties: PartySimulation[];
  isLoading: boolean;
  search: (query: string) => PartySimulation[];
  sortByDate: (order: 'asc' | 'desc') => PartySimulation[];
  sortByScore: (order: 'asc' | 'desc') => PartySimulation[];
  getStats: () => InventoryStats;
  duplicate: (id: string) => void;
  rename: (id: string, newName: string) => void;
  remove: (id: string) => void;
}

interface SavedPartiesViewProps {
  inventory: UseInventoryReturn;
}

/**
 * 저장된 파티 목록 및 관리 뷰
 */
const SavedPartiesView: React.FC<SavedPartiesViewProps> = ({ inventory }) => {
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [searchQuery, setSearchQuery] = useState('');

  const parties = searchQuery
    ? inventory.search(searchQuery)
    : sortBy === 'date'
      ? inventory.sortByDate('desc')
      : inventory.sortByScore('desc');

  const stats = inventory.getStats();

  if (inventory.isLoading) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-400">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="bg-gray-800  rounded-sm p-4">
        <h2 className="text-2xl font-bold mb-4">💾 저장된 파티</h2>

        {/* 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="bg-gray-800  rounded-sm p-3">
            <p className="text-gray-400">총 파티 수</p>
            <p className="text-2xl font-bold text-blue-400">{stats.totalParties}</p>
          </div>
          <div className="bg-gray-800  rounded-sm p-3">
            <p className="text-gray-400">평균 점수</p>
            <p className="text-2xl font-bold text-green-400">
              {stats.averageScore.toFixed(1)}
            </p>
          </div>
          <div className="bg-gray-800  rounded-sm p-3">
            <p className="text-gray-400">최고 점수</p>
            <p className="text-2xl font-bold text-purple-400">{stats.highestScore}</p>
          </div>
          <div className="bg-gray-800  rounded-sm p-3">
            <p className="text-gray-400">평균 피해감소</p>
            <p className="text-2xl font-bold text-orange-400">
              {stats.averageDamageReduction.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* 검색 & 정렬 */}
      <div className="bg-gray-800  rounded-sm p-4 space-y-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="파티명으로 검색..."
          className="w-full px-4 py-2 bg-gray-800  rounded-sm border border-gray-600 focus:border-blue-500 outline-hidden"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'score')}
          className="w-full px-4 py-2 bg-gray-800  rounded-sm border border-gray-600 focus:border-blue-500 outline-hidden"
        >
          <option value="date">최신순</option>
          <option value="score">점수순</option>
        </select>
      </div>

      {/* 파티 리스트 */}
      <div className="space-y-3">
        {parties.length === 0 ? (
          <div className="bg-gray-800  rounded-sm p-4 text-center text-gray-400">
            저장된 파티가 없습니다
          </div>
        ) : (
          parties.map((party) => (
            <PartyCard key={party.id} party={party} inventory={inventory} />
          ))
        )}
      </div>
    </div>
  );
};

/**
 * 파티 카드
 */
interface PartyCardProps {
  party: PartySimulation;
  inventory: UseInventoryReturn;
}

const PartyCard: React.FC<PartyCardProps> = ({ party, inventory }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-gray-800  rounded-sm overflow-hidden border border-gray-700">
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-bold">{party.name}</h3>
        <div className="text-sm text-gray-400 space-y-1">
          <p>생성: {new Date(party.createdAt).toLocaleDateString('ko-KR')}</p>
          <p>멤버: {party.party.length}/9</p>
        </div>

        {/* 상세 정보 토글 */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full text-center py-2 text-sm text-gray-400 hover:text-gray-200 border-t border-gray-700 mt-4 transition"
        >
          {showDetails ? '▼' : '▶'} 상세 정보
        </button>

        {/* 상세 정보 */}
        {showDetails && (
          <div className="pt-4 border-t border-gray-700 space-y-3 text-sm">
            {/* 약점 - 만약 analysis에 약점이 있으면 표시 */}
            {party.analysis && 'personalitySynergies' in party.analysis && (
              <div>
                <p className="font-bold mb-2">✨ 활성 시너지</p>
                <div className="space-y-1">
                  {(party.analysis.personalitySynergies as any[])
                    .filter((s) => s.isActive)
                    .map((s, idx) => (
                      <p key={idx} className="text-gray-300">
                        {s.personality} {s.count}명 
                      </p>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-2 pt-4 border-t border-gray-700">
          <button
            onClick={() => inventory.duplicate(party.id)}
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-sm text-sm font-bold transition"
          >
            📋 복제
          </button>
          <button
            onClick={() => {
              const newName = prompt('새로운 파티명:', party.name);
              if (newName && newName.trim()) {
                inventory.rename(party.id, newName);
              }
            }}
            className="flex-1 px-3 py-2 bg-gray-800  hover:bg-gray-800  rounded-sm text-sm font-bold transition"
          >
            ✏️ 수정
          </button>
          <button
            onClick={() => {
              if (confirm('정말 삭제하시겠습니까?')) {
                inventory.remove(party.id);
              }
            }}
            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-sm text-sm font-bold transition"
          >
            🗑️ 삭제
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedPartiesView;