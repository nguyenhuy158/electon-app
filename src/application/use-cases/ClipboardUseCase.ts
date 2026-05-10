import { ClipboardRepository } from '../ports/ClipboardRepository';
import { ClipboardService } from '../ports/ClipboardService';
import { NotificationService } from '../ports/NotificationService';
import { Clip } from '../../domain/models/Clip';
import { User } from '../../domain/models/User';

export class ClipboardUseCase {
  private clipHistory: string[] = [];
  private currentUser: User | null = null;

  constructor(
    private clipboardRepository: ClipboardRepository,
    private clipboardService: ClipboardService,
    private notificationService: NotificationService,
    private historyLimit: number = 10
  ) {}

  setCurrentUser(user: User | null) {
    this.currentUser = user;
  }

  async addClip(text: string, onUpdate?: (history: string[]) => void) {
    if (!this.clipHistory.includes(text)) {
      this.clipHistory.unshift(text);
      if (this.clipHistory.length > this.historyLimit) {
        this.clipHistory.pop();
      }

      if (onUpdate) onUpdate(this.clipHistory);

      if (this.currentUser && this.currentUser.id && this.clipboardRepository) {
        try {
          await this.clipboardRepository.save(new Clip({ 
            userId: this.currentUser.id, 
            content: text 
          }));
        } catch (err) {
          console.error('Sync failed:', err);
        }
      }
    }
  }

  copyToClipboard(text: string) {
    this.clipboardService.writeText(text);
    this.notificationService.notify('Copied', 'Item copied to clipboard');
  }

  async loadCloudHistory(userId: string | number) {
    if (this.clipboardRepository) {
      const history = await this.clipboardRepository.getRecent(userId, this.historyLimit);
      this.clipHistory = history.map(h => h.content);
      return this.clipHistory;
    }
    return [];
  }

  clearHistory() {
    this.clipHistory = [];
  }

  getHistory() {
    return this.clipHistory;
  }
}
