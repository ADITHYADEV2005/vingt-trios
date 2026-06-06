import { Test, TestingModule } from '@nestjs/testing';
import { TailorsController } from './tailors.controller';

describe('TailorsController', () => {
  let controller: TailorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TailorsController],
    }).compile();

    controller = module.get<TailorsController>(TailorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
