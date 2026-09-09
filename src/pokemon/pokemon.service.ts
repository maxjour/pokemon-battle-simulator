import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pokemon, PokemonDocument } from './schemas/pokemon.schema.js';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name) private readonly pokemonModel: Model<PokemonDocument>,
  ) {}

  async getRandomTeams(teamSize: number): Promise<{ teamA: Pokemon[]; teamB: Pokemon[] }> {
    const needed = teamSize * 2;
    const drawn = await this.pokemonModel.aggregate<Pokemon>([{ $sample: { size: needed } }]);

    if (drawn.length < needed) {
      throw new BadRequestException(
        `Not enough Pokemon in the database to build two teams of ${teamSize} 
                        (found ${drawn.length}, need ${needed}). Seed the database before playing!`,
      );
    }

    return {
      teamA: drawn.slice(0, teamSize),
      teamB: drawn.slice(teamSize),
    };
  }
}
