import { Pokemon } from '../pokemon/schemas/pokemon.schema.js';

export type Team = 'A' | 'B';

export interface Fighter {
  pokemon: Pokemon;
  currentHp: number;
}

export interface AttackLogEntry {
  type: 'attack';
  round: number;
  team: Team;
  attacker: string;
  defender: string;
  effectiveness: 'super-effective' | 'resisted' | 'normal';
  damage: number;
  defenderHpRemaining: number;
}

export interface KillLogEntry {
  type: 'kill';
  round: number;
  team: Team;
  pokemon: string;
  killedBy: string;
}

export interface RoundLimitLogEntry {
  type: 'round-limit';
  round: number;
  winner: string;
  loser: string;
  winnerHpPercent: number;
  loserHpPercent: number;
}

export type BattleLogEntry = AttackLogEntry | KillLogEntry | RoundLimitLogEntry;

export interface FighterSummary {
  name: string;
  remainingHp: number;
}

export interface BattleResult {
  teamA: Pokemon[];
  teamB: Pokemon[];
  log: BattleLogEntry[];
  winner: Team;
  finalTeamA: FighterSummary[];
  finalTeamB: FighterSummary[];
}
