import { Controller, Post } from '@nestjs/common';
import { BattleService } from './battle.service.js';
import { BattleResult } from './battle.types.js';

@Controller('battles')
export class BattleController {
  constructor(private readonly battleService: BattleService) {}

  @Post()
  run(): Promise<BattleResult> {
    return this.battleService.run();
  }
}
