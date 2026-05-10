export interface ClipData {
  id?: string;
  userId: string;
  content: string;
  createdAt?: Date;
}

export class Clip {
  id?: string;
  userId: string;
  content: string;
  createdAt: Date;

  constructor({ id, userId, content, createdAt }: ClipData) {
    this.id = id;
    this.userId = userId as string;
    this.content = content;
    this.createdAt = createdAt || new Date();
  }
}
