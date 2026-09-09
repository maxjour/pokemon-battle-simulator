import { Test, TestingModule } from '@nestjs/testing';
import { BattleService } from './battle.service.js';
import { PokemonService } from '../pokemon/pokemon.service.js';

describe('BattleService', () => {
  let service: BattleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BattleService, { provide: PokemonService, useValue: {} }],
    }).compile();

    service = module.get<BattleService>(BattleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
