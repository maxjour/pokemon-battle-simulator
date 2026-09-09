import { Module } from '@nestjs/common';
import { PokemonModule } from '../pokemon/pokemon.module.js';
import { BattleController } from './battle.controller.js';
import { BattleService } from './battle.service.js';

@Module({
  imports: [PokemonModule],
  controllers: [BattleController],
  providers: [BattleService],
  exports: [BattleService],
})
export class BattleModule {}
