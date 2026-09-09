import { Pokemon } from '../pokemon/schemas/pokemon.schema.js';
import { BattleLogEntry, Fighter, Team } from './battle.types.js';

export function getEffectiveness(
  attacker: Pokemon,
  defender: Pokemon,
): { multiplier: number; effectiveness: 'super-effective' | 'resisted' | 'normal' } {
  if (attacker.type.some((type) => defender.weaknesses.includes(type))) {
    return { multiplier: 2, effectiveness: 'super-effective' };
  }

  if (attacker.type.some((type) => defender.type.includes(type))) {
    return { multiplier: 0.5, effectiveness: 'resisted' };
  }

  return { multiplier: 1, effectiveness: 'normal' };
}

export function attack(
  attacker: Fighter,
  defender: Fighter,
  attackerTeam: Team,
  round: number,
  log: BattleLogEntry[],
): void {
  const { multiplier, effectiveness } = getEffectiveness(attacker.pokemon, defender.pokemon);
  const damage = Math.round(attacker.pokemon.attackPower * multiplier);
  defender.currentHp = Math.max(0, defender.currentHp - damage);

  log.push({
    type: 'attack',
    round,
    team: attackerTeam,
    attacker: attacker.pokemon.name,
    defender: defender.pokemon.name,
    effectiveness,
    damage,
    defenderHpRemaining: defender.currentHp,
  });
}

export function resolveRoundLimit(
  fighterA: Fighter,
  fighterB: Fighter,
  round: number,
  log: BattleLogEntry[],
): Team {
  const percentA = fighterA.currentHp / fighterA.pokemon.hp;
  const percentB = fighterB.currentHp / fighterB.pokemon.hp;

  let winner: Fighter;
  let loser: Fighter;
  let loserTeam: Team;

  if (percentA >= percentB) {
    winner = fighterA;
    loser = fighterB;
    loserTeam = 'B';
  } else {
    winner = fighterB;
    loser = fighterA;
    loserTeam = 'A';
  }

  log.push({
    type: 'round-limit',
    round,
    winner: winner.pokemon.name,
    loser: loser.pokemon.name,
    winnerHpPercent: Math.round((winner.currentHp / winner.pokemon.hp) * 100),
    loserHpPercent: Math.round((loser.currentHp / loser.pokemon.hp) * 100),
  });

  loser.currentHp = 0;
  return loserTeam;
}
