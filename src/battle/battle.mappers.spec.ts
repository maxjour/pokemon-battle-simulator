import { toFighter, toFighterSummaries } from './battle.mappers.js';
import { Pokemon } from '../pokemon/schemas/pokemon.schema.js';
import { Fighter } from './battle.types.js';

function buildPokemon(overrides: Partial<Pokemon> = {}): Pokemon {
  return {
    name: 'Pikachu',
    type: ['electric'],
    weaknesses: ['ground'],
    img: 'pikachu.png',
    height: 4,
    weight: 60,
    hp: 100,
    attackPower: 55,
    ...overrides,
  } as Pokemon;
}

describe('battle.mappers', () => {
  describe('toFighter', () => {
    it("sets currentHp to the pokemon's full hp", () => {
      const pokemon = buildPokemon({ name: 'Bulbasaur', hp: 90 });

      expect(toFighter(pokemon)).toEqual({ pokemon, currentHp: 90 });
    });
  });

  describe('toFighterSummaries', () => {
    it('returns an empty array for no fighters', () => {
      expect(toFighterSummaries([])).toEqual([]);
    });

    it('maps name and remaining hp per fighter', () => {
      const fighters: Fighter[] = [
        { pokemon: buildPokemon({ name: 'Charmander' }), currentHp: 40 },
        { pokemon: buildPokemon({ name: 'Squirtle' }), currentHp: 0 },
      ];

      expect(toFighterSummaries(fighters)).toEqual([
        { name: 'Charmander', remainingHp: 40 },
        { name: 'Squirtle', remainingHp: 0 },
      ]);
    });
  });
});
