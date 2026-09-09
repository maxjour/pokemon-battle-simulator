import { Injectable } from '@nestjs/common';
import { PokemonService } from '../pokemon/pokemon.service.js';
import { Pokemon } from '../pokemon/schemas/pokemon.schema.js';
import { BattleLogEntry, BattleResult, Fighter, Team } from './battle.types.js';
import { toFighter, toFighterSummaries } from './battle.mappers.js';
import { attack, resolveRoundLimit } from './battle.combat.js';

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

      attack(attacker, defender, attackerTeam, round, log);

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

    return resolveRoundLimit(fighterA, fighterB, MAX_ROUNDS_PER_MATCHUP, log);
  }
}
