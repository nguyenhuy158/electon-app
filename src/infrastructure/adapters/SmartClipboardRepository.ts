import { ClipboardRepository } from '../../application/ports/ClipboardRepository';
import { Clip } from '../../domain/models/Clip';

export class SmartClipboardRepository extends ClipboardRepository {
  private currentRepository: ClipboardRepository;

  constructor(
    private localRepo: ClipboardRepository,
    private cloudRepo: ClipboardRepository
  ) {
    super();
    this.currentRepository = localRepo;
  }

  setUseCloud(useCloud: boolean) {
    this.currentRepository = useCloud ? this.cloudRepo : this.localRepo;
  }

  async save(clip: Clip): Promise<void> {
    await this.currentRepository.save(clip);
  }

  async getRecent(userId: string, limit: number): Promise<Clip[]> {
    return await this.currentRepository.getRecent(userId, limit);
  }
}
