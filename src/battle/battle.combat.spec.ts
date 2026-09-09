import { attack, getEffectiveness, resolveRoundLimit } from './battle.combat.js';
import { Pokemon } from '../pokemon/schemas/pokemon.schema.js';
import { BattleLogEntry, Fighter } from './battle.types.js';

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

function buildFighter(pokemonOverrides: Partial<Pokemon> = {}, currentHp?: number): Fighter {
  const pokemon = buildPokemon(pokemonOverrides);
  return { pokemon, currentHp: currentHp ?? pokemon.hp };
}

describe('getEffectiveness', () => {
  it('returns super-effective when attacker exploits a weakness', () => {
    const attacker = buildPokemon({ type: ['fire'] });
    const defender = buildPokemon({ type: ['grass'], weaknesses: ['fire'] });

    expect(getEffectiveness(attacker, defender)).toEqual({
      multiplier: 2,
      effectiveness: 'super-effective',
    });
  });

  it('returns resisted on a shared, non-weak type', () => {
    const attacker = buildPokemon({ type: ['water'] });
    const defender = buildPokemon({ type: ['water'], weaknesses: ['electric'] });

    expect(getEffectiveness(attacker, defender)).toEqual({
      multiplier: 0.5,
      effectiveness: 'resisted',
    });
  });

  it('returns normal with no type match or weakness', () => {
    const attacker = buildPokemon({ type: ['normal'] });
    const defender = buildPokemon({ type: ['ghost'], weaknesses: ['dark'] });

    expect(getEffectiveness(attacker, defender)).toEqual({
      multiplier: 1,
      effectiveness: 'normal',
    });
  });

  it('prioritizes super-effective over resisted', () => {
    const attacker = buildPokemon({ type: ['fire', 'water'] });
    const defender = buildPokemon({ type: ['water'], weaknesses: ['fire'] });

    expect(getEffectiveness(attacker, defender)).toEqual({
      multiplier: 2,
      effectiveness: 'super-effective',
    });
  });
});

describe('attack', () => {
  it('reduces defender hp and logs the attack', () => {
    const attacker = buildFighter({ type: ['fire'], attackPower: 40 });
    const defender = buildFighter({ type: ['grass'], weaknesses: ['fire'], hp: 100 });
    const log: BattleLogEntry[] = [];

    attack(attacker, defender, 'A', 1, log);

    expect(defender.currentHp).toBe(20);
    expect(log).toEqual([
      {
        type: 'attack',
        round: 1,
        team: 'A',
        attacker: attacker.pokemon.name,
        defender: defender.pokemon.name,
        effectiveness: 'super-effective',
        damage: 80,
        defenderHpRemaining: 20,
      },
    ]);
  });

  it('clamps defender hp at zero on overkill', () => {
    const attacker = buildFighter({ type: ['fire'], attackPower: 200 });
    const defender = buildFighter({ type: ['grass'], weaknesses: [] }, 30);
    const log: BattleLogEntry[] = [];

    attack(attacker, defender, 'B', 3, log);

    expect(defender.currentHp).toBe(0);
    expect(log[0]).toMatchObject({ damage: 200, defenderHpRemaining: 0 });
  });
});

describe('resolveRoundLimit', () => {
  it('picks the higher-hp fighter as winner', () => {
    const fighterA = buildFighter({ hp: 100 }, 60);
    const fighterB = buildFighter({ hp: 100 }, 30);
    const log: BattleLogEntry[] = [];

    const loserTeam = resolveRoundLimit(fighterA, fighterB, 15, log);

    expect(loserTeam).toBe('B');
    expect(fighterB.currentHp).toBe(0);
    expect(log).toEqual([
      {
        type: 'round-limit',
        round: 15,
        winner: fighterA.pokemon.name,
        loser: fighterB.pokemon.name,
        winnerHpPercent: 60,
        loserHpPercent: 30,
      },
    ]);
  });

  it('favors fighter A on a tie', () => {
    const fighterA = buildFighter({ hp: 100 }, 50);
    const fighterB = buildFighter({ hp: 100 }, 50);
    const log: BattleLogEntry[] = [];

    const loserTeam = resolveRoundLimit(fighterA, fighterB, 15, log);

    expect(loserTeam).toBe('B');
    expect(fighterA.currentHp).toBe(50);
    expect(fighterB.currentHp).toBe(0);
  });
});
