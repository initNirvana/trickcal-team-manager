import type { Apostle } from '../types/apostle';
import type { PartySimulation } from '../types/party';

const STORAGE_KEY_PREFIX = 'party_simulator_';
const INVENTORY_KEY = 'party_simulator_inventory';

export interface UserInventory {
  userId: string;
  ownedApostles: {
    apostleId: string;
    acquired: Date;
  }[];
  lastUpdated: Date;
}

/**
 * 인벤토리에서 소유한 사도 목록 가져오기
 */
export const getOwnedApostles = (apostles: Apostle[], inventoryKey?: string): Apostle[] => {
  const key = inventoryKey || INVENTORY_KEY;
  const stored = localStorage.getItem(key);

  if (!stored) return [];

  try {
    const inventory = JSON.parse(stored) as UserInventory;
    const ownedIds = new Set(inventory.ownedApostles.map((a) => a.apostleId));
    return apostles.filter((a) => ownedIds.has(a.id));
  } catch (error) {
    console.error('Failed to parse inventory:', error);
    return [];
  }
};

/**
 * 사도 소유 상태 업데이트
 */
export const updateOwnedApostles = (apostleIds: string[], inventoryKey?: string): void => {
  const key = inventoryKey || INVENTORY_KEY;
  const inventory: UserInventory = {
    userId: 'default',
    ownedApostles: apostleIds.map((id) => ({
      apostleId: id,
      acquired: new Date(),
    })),
    lastUpdated: new Date(),
  };

  localStorage.setItem(key, JSON.stringify(inventory));
};

/**
 * 파티 저장
 */
export const saveParty = (party: PartySimulation): void => {
  const key = `${STORAGE_KEY_PREFIX}${party.id}`;
  localStorage.setItem(key, JSON.stringify(party));

  // 저장된 파티 목록 업데이트
  updateSavedPartiesList(party.id);
};

/**
 * 파티 로드
 */
export const loadParty = (partyId: string): PartySimulation | null => {
  const key = `${STORAGE_KEY_PREFIX}${partyId}`;
  const stored = localStorage.getItem(key);

  if (!stored) return null;

  try {
    return JSON.parse(stored) as PartySimulation;
  } catch (error) {
    console.error('Failed to parse party:', error);
    return null;
  }
};

/**
 * 모든 저장된 파티 조회
 */
export const getAllSavedParties = (): PartySimulation[] => {
  const partiesKey = `${STORAGE_KEY_PREFIX}list`;
  const stored = localStorage.getItem(partiesKey);

  if (!stored) return [];

  try {
    const partyIds = JSON.parse(stored) as string[];
    return partyIds
      .map((id) => loadParty(id))
      .filter((party): party is PartySimulation => party !== null);
  } catch (error) {
    console.error('Failed to parse parties list:', error);
    return [];
  }
};

/**
 * 저장된 파티 목록 업데이트
 */
const updateSavedPartiesList = (partyId: string): void => {
  const partiesKey = `${STORAGE_KEY_PREFIX}list`;
  const stored = localStorage.getItem(partiesKey);

  let partyIds: string[] = [];
  if (stored) {
    try {
      partyIds = JSON.parse(stored) as string[];
    } catch (error) {
      console.error('Failed to parse parties list:', error);
    }
  }

  if (!partyIds.includes(partyId)) {
    partyIds.push(partyId);
  }

  localStorage.setItem(partiesKey, JSON.stringify(partyIds));
};

/**
 * 파티 삭제
 */
export const deleteParty = (partyId: string): void => {
  const key = `${STORAGE_KEY_PREFIX}${partyId}`;
  localStorage.removeItem(key);

  // 저장된 파티 목록에서 제거
  const partiesKey = `${STORAGE_KEY_PREFIX}list`;
  const stored = localStorage.getItem(partiesKey);

  if (stored) {
    try {
      let partyIds = JSON.parse(stored) as string[];
      partyIds = partyIds.filter((id) => id !== partyId);
      localStorage.setItem(partiesKey, JSON.stringify(partyIds));
    } catch (error) {
      console.error('Failed to update parties list:', error);
    }
  }
};

/**
 * 파티 이름 변경
 */
export const renameParty = (partyId: string, newName: string): PartySimulation | null => {
  const party = loadParty(partyId);

  if (!party) return null;

  party.name = newName;
  party.lastModified = new Date();
  saveParty(party);

  return party;
};

/**
 * 파티 복제
 */
export const duplicateParty = (partyId: string): PartySimulation | null => {
  const original = loadParty(partyId);

  if (!original) return null;

  const duplicate: PartySimulation = {
    ...original,
    id: `${Date.now()}`,
    name: `${original.name} (복사본)`,
    createdAt: new Date(),
    lastModified: new Date(),
  };

  saveParty(duplicate);

  return duplicate;
};

/**
 * 인벤토리 초기화 (개발용)
 */
export const clearAllData = (): void => {
  const keys = Object.keys(localStorage).filter(
    (key) => key.startsWith(STORAGE_KEY_PREFIX) || key === INVENTORY_KEY,
  );

  keys.forEach((key) => localStorage.removeItem(key));
};

/**
 * 데이터 내보내기 (JSON)
 */
export const exportData = (): string => {
  const parties = getAllSavedParties();
  const inventoryKey = INVENTORY_KEY;
  const stored = localStorage.getItem(inventoryKey);

  const inventory = stored ? JSON.parse(stored) : {};

  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    parties,
    inventory,
  };

  return JSON.stringify(data, null, 2);
};

/**
 * 데이터 가져오기 (JSON)
 */
export const importData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);

    if (data.version !== '1.0') {
      console.warn('Unsupported data version');
      return false;
    }

    // 파티 저장
    if (Array.isArray(data.parties)) {
      data.parties.forEach((party: PartySimulation) => {
        saveParty(party);
      });
    }

    // 인벤토리 저장
    if (data.inventory) {
      localStorage.setItem(INVENTORY_KEY, JSON.stringify(data.inventory));
    }

    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
};
