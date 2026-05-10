import { ClipboardRepository } from '../ports/ClipboardRepository';
import { ClipboardService } from '../ports/ClipboardService';
import { NotificationService } from '../ports/NotificationService';
import { Clip } from '../../domain/models/Clip';
import { User } from '../../domain/models/User';
import { APP_CONSTANTS } from '../../domain/constants';
import { i18n } from '../../domain/i18n';

export class ClipboardUseCase {
  private clipHistory: string[] = [];
  private currentUser: User | null = null;

  constructor(
    private clipboardRepository: ClipboardRepository,
    private clipboardService: ClipboardService,
    private notificationService: NotificationService,
    private historyLimit: number = APP_CONSTANTS.CLIPBOARD.DEFAULT_HISTORY_LIMIT
  ) {}

  setCurrentUser(user: User | null) {
    this.currentUser = user;
  }

  async addClip(text: string, onUpdate?: (history: string[]) => void) {
    if (this.clipHistory.includes(text)) {
      return;
    }

    this.clipHistory.unshift(text);
    if (this.clipHistory.length > this.historyLimit) {
      this.clipHistory.pop();
    }

    if (onUpdate) {
      onUpdate(this.clipHistory);
    }

    if (this.clipboardRepository) {
      const user = this.currentUser;
      const userId = user ? user.id : 'guest';
      try {
        const clipToSave = new Clip({ 
          userId, 
          content: text 
        });
        await this.clipboardRepository.save(clipToSave);
      } catch (err: any) {
        console.error(i18n.ERRORS.SYNC_FAILED, err);
      }
    }
  }

  copyToClipboard(text: string) {
    this.clipboardService.writeText(text);
    this.notificationService.notify(
      i18n.NOTIFICATIONS.COPIED_TITLE,
      i18n.NOTIFICATIONS.COPIED_BODY
    );
  }

  async loadCloudHistory(userId: string) {
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
