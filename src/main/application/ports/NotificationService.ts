export abstract class NotificationService {
  abstract notify(title: string, body: string): void;
}
