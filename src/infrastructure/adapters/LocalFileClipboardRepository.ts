import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ClipboardRepository } from '../../application/ports/ClipboardRepository';
import { Clip } from '../../domain/models/Clip';

export class LocalFileClipboardRepository extends ClipboardRepository {
  private storagePath: string;
  private filePath: string;

  constructor() {
    super();
    this.storagePath = path.join(os.homedir(), '.quickclip');
    this.filePath = path.join(this.storagePath, 'clips.json');
    this.ensureDirectory();
  }

  private ensureDirectory() {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
    }
  }

  private readClips(): Clip[] {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data).map(
        (c: any) =>
          new Clip({
            ...c,
            createdAt: new Date(c.createdAt),
          })
      );
    } catch {
      return [];
    }
  }

  private writeClips(clips: Clip[]) {
    fs.writeFileSync(this.filePath, JSON.stringify(clips, null, 2));
  }

  async save(clip: Clip): Promise<void> {
    const clips = this.readClips();
    clips.unshift(clip);
    // Keep only last 100 clips locally
    this.writeClips(clips.slice(0, 100));
  }

  async getRecent(userId: string, limit: number): Promise<Clip[]> {
    // For guest mode, we ignore userId or use a 'guest' constant
    const clips = this.readClips();
    return clips.slice(0, limit);
  }
}
