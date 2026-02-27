import { CardBase, CardOption } from './card';

export type SpellOption = CardOption;

export interface Spell extends CardBase {}

export interface SpellsData {
  spells: Spell[];
}
