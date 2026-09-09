import { Test, TestingModule } from '@nestjs/testing';
import { BattleController } from './battle.controller.js';
import { BattleService } from './battle.service.js';

describe('BattleController', () => {
  let controller: BattleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BattleController],
      providers: [{ provide: BattleService, useValue: {} }],
    }).compile();

    controller = module.get<BattleController>(BattleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
