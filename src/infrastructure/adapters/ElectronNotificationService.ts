import { Notification } from 'electron';
import { NotificationService } from '../../application/ports/NotificationService';

export class ElectronNotificationService extends NotificationService {
  notify(title: string, body: string): void {
    new Notification({ title, body }).show();
  }
}
