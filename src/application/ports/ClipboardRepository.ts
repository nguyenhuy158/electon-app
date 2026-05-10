import { Clip } from '../../domain/models/Clip';

export abstract class ClipboardRepository {
  abstract save(clip: Clip): Promise<void>;
  abstract getRecent(userId: string | number, limit: number): Promise<Clip[]>;
}
