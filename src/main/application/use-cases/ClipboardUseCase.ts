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
  private selectedIndex: number = -1;

  constructor(
    private clipboardRepository: ClipboardRepository,
    private clipboardService: ClipboardService,
    private notificationService: NotificationService,
    private historyLimit: number = APP_CONSTANTS.CLIPBOARD.DEFAULT_HISTORY_LIMIT
  ) {}

  setCurrentUser(user: User | null) {
    this.currentUser = user;
  }

  getSelectedIndex(): number {
    return this.selectedIndex;
  }

  setSelectedIndex(index: number) {
    if (index >= -1 && index < this.clipHistory.length) {
      this.selectedIndex = index;
    }
  }

  moveSelectionDown() {
    if (this.clipHistory.length === 0) return;
    if (this.selectedIndex < this.clipHistory.length - 1) {
      this.selectedIndex++;
    } else {
      this.selectedIndex = 0;
    }
  }

  moveSelectionUp() {
    if (this.clipHistory.length === 0) return;
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
    } else {
      this.selectedIndex = this.clipHistory.length - 1;
    }
  }

  copySelected() {
    if (this.selectedIndex >= 0 && this.selectedIndex < this.clipHistory.length) {
      this.copyToClipboard(this.clipHistory[this.selectedIndex]);
    }
  }

  async addClip(text: string, onUpdate?: (history: string[]) => void) {
    const existingIndex = this.clipHistory.indexOf(text);
    if (existingIndex !== -1) {
      this.clipHistory.splice(existingIndex, 1);
    }

    this.clipHistory.unshift(text);
    if (this.clipHistory.length > this.historyLimit) {
      this.clipHistory.pop();
    }

    if (onUpdate) {
      onUpdate(this.clipHistory);
    }

    if (this.clipboardRepository) {
      const userId = this.currentUser?.id || 'guest';
      try {
        const clipToSave = new Clip({
          userId,
          content: text,
        });
        await this.clipboardRepository.save(clipToSave);
      } catch (err: any) {
        // Sync failed
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
      this.clipHistory = history.map((h) => h.content);
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
