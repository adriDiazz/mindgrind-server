import { Test, TestingModule } from '@nestjs/testing';
import { NoteRepositoryService } from './note-repository.service';

describe('NoteRepositoryService', () => {
  let service: NoteRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NoteRepositoryService],
    }).compile();

    service = module.get<NoteRepositoryService>(NoteRepositoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
