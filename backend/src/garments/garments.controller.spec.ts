import { Test, TestingModule } from '@nestjs/testing';
import { GarmentsController } from './garments.controller';

describe('GarmentsController', () => {
  let controller: GarmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GarmentsController],
    }).compile();

    controller = module.get<GarmentsController>(GarmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
