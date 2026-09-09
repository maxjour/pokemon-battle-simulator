import { Injectable } from '@nestjs/common';
import { PokemonService } from '../pokemon/pokemon.service.js';
import { Pokemon } from '../pokemon/schemas/pokemon.schema.js';
import { BattleLogEntry, BattleResult, Fighter, Team } from './battle.types.js';
import { toFighter, toFighterSummaries } from './battle.mappers.js';

const TEAM_SIZE = 3;
const MAX_ROUNDS_PER_MATCHUP = 15;

@Injectable()
export class BattleService {
  constructor(private readonly pokemonService: PokemonService) {}

  async run(): Promise<BattleResult> {
    const { teamA, teamB } = await this.pokemonService.getRandomTeams(TEAM_SIZE);

    const teamAFighters = teamA.map((pokemon) => toFighter(pokemon));
    const teamBFighters = teamB.map((pokemon) => toFighter(pokemon));

    const log: BattleLogEntry[] = [];
    let activeIndexA = 0;
    let activeIndexB = 0;

    while (activeIndexA < teamAFighters.length && activeIndexB < teamBFighters.length) {
      const activeFighterA = teamAFighters[activeIndexA];
      const activeFighterB = teamBFighters[activeIndexB];

      const loserTeam = this.runMatchup(activeFighterA, activeFighterB, log);

      if (loserTeam === 'A') {
        activeIndexA++;
      } else {
        activeIndexB++;
      }
    }

    let winner: Team;
    if (activeIndexA >= teamAFighters.length) {
      winner = 'B';
    } else {
      winner = 'A';
    }

    const finalTeamA = toFighterSummaries(teamAFighters);
    const finalTeamB = toFighterSummaries(teamBFighters);

    return { teamA, teamB, log, winner, finalTeamA, finalTeamB };
  }

  private runMatchup(fighterA: Fighter, fighterB: Fighter, log: BattleLogEntry[]): Team {
    for (let round = 1; round <= MAX_ROUNDS_PER_MATCHUP; round++) {
      let attackerTeam: Team;
      let attacker: Fighter;
      let defender: Fighter;

      if (round % 2 === 1) {
        attackerTeam = 'A';
        attacker = fighterA;
        defender = fighterB;
      } else {
        attackerTeam = 'B';
        attacker = fighterB;
        defender = fighterA;
      }

      this.attack(attacker, defender, attackerTeam, round, log);

      if (defender.currentHp === 0) {
        let defenderTeam: Team;
        if (attackerTeam === 'A') {
          defenderTeam = 'B';
        } else {
          defenderTeam = 'A';
        }

        log.push({
          type: 'kill',
          round,
          team: defenderTeam,
          pokemon: defender.pokemon.name,
          killedBy: attacker.pokemon.name,
        });
        return defenderTeam;
      }
    }

    return this.resolveRoundLimit(fighterA, fighterB, log);
  }

  private resolveRoundLimit(fighterA: Fighter, fighterB: Fighter, log: BattleLogEntry[]): Team {
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
      round: MAX_ROUNDS_PER_MATCHUP,
      winner: winner.pokemon.name,
      loser: loser.pokemon.name,
      winnerHpPercent: Math.round((winner.currentHp / winner.pokemon.hp) * 100),
      loserHpPercent: Math.round((loser.currentHp / loser.pokemon.hp) * 100),
    });

    loser.currentHp = 0;
    return loserTeam;
  }

  private attack(
    attacker: Fighter,
    defender: Fighter,
    attackerTeam: Team,
    round: number,
    log: BattleLogEntry[],
  ): void {
    const { multiplier, effectiveness } = this.getEffectiveness(attacker.pokemon, defender.pokemon);
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

  private getEffectiveness(
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
}
