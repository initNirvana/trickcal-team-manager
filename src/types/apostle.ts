export type Personality = "Jolly" | "Mad" | "Naive" | "Gloomy" | "Cool";
export type Position = "frontLine" | "midLine" | "backLine";
export type Role = "딜러" | "탱커" | "서포터";
export type Method = "물리" | "마법";
export type Race = "용족" | "정령" | "수인" | "유령" | "마녀" | "요정" | "엘프";
export type Tier = "S+" | "S" | "A+" | "A" | "B+" | "B" | "C" | "D" | "F";

export interface Apostle {
  id: string;
  name: string;
  isPlayable: number;
  isEldain: number;
  hasAside: number;
  rank: number;
  race: Race;
  persona: Personality | Personality[];
  role: Role;
  method: Method;
  position: Position | Position[];
  color?: string | null;
  skillIds: string[];
  asideId?: string | null;
  tier?: Tier;
  image?: string;
}

export function getPersonalities(apostle: Apostle): Personality[] {
  if (Array.isArray(apostle.persona)) {
    return apostle.persona;
  }
  return [apostle.persona];
}

export function getPositions(apostle: Apostle): Position[] {
  const normalizePos = (pos: any): Position => {
    if (pos === "전열" || pos === "frontLine") return "frontLine";
    if (pos === "중열" || pos === "midLine") return "midLine";
    if (pos === "후열" || pos === "backLine") return "backLine";
    return "frontLine";
  };

  if (Array.isArray(apostle.position)) {
    return apostle.position.map(normalizePos);
  }
  return [normalizePos(apostle.position)];
}

export function isValidPosition(apostle: Apostle, slotNumber: number): boolean {
  const slotPosition = getSlotPosition(slotNumber);
  const positions = getPositions(apostle);
  return positions.includes(slotPosition);
}

function getSlotPosition(slotNumber: number): Position {
  if ([1, 4, 7].includes(slotNumber)) return "backLine";
  if ([2, 5, 8].includes(slotNumber)) return "midLine";
  return "frontLine";
}
