import { Pokemon } from '../pokemon/schemas/pokemon.schema.js';
import { Fighter, FighterSummary } from './battle.types.js';

export function toFighter(pokemon: Pokemon): Fighter {
  return { pokemon, currentHp: pokemon.hp };
}

export function toFighterSummaries(fighters: Fighter[]): FighterSummary[] {
  const summaries: FighterSummary[] = [];

  for (const fighter of fighters) {
    summaries.push({ name: fighter.pokemon.name, remainingHp: fighter.currentHp });
  }

  return summaries;
}
