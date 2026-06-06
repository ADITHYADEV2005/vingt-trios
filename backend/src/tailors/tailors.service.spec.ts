import { Test, TestingModule } from '@nestjs/testing';
import { TailorsService } from './tailors.service';

describe('TailorsService', () => {
  let service: TailorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TailorsService],
    }).compile();

    service = module.get<TailorsService>(TailorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
