import { clipboard } from 'electron';
import { ClipboardService } from '../../application/ports/ClipboardService';

export class ElectronClipboardService extends ClipboardService {
  readText(): string {
    return clipboard.readText();
  }

  writeText(text: string): void {
    clipboard.writeText(text);
  }
}
