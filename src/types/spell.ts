export interface Spell {
  spellId: number;
  level: number;
  grade: string;
  name: string;
}

export interface SpellsData {
  spells: Spell[];
}
