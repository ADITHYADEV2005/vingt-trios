import { Test, TestingModule } from '@nestjs/testing';
import { FabricsService } from './fabrics.service';

describe('FabricsService', () => {
  let service: FabricsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FabricsService],
    }).compile();

    service = module.get<FabricsService>(FabricsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
