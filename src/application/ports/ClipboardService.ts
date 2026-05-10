export abstract class ClipboardService {
  abstract readText(): string;
  abstract writeText(text: string): void;
}
