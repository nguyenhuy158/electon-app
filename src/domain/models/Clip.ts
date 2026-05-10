export interface ClipData {
  id?: string | number;
  userId: string | number;
  content: string;
  createdAt?: Date;
}

export class Clip {
  id?: string | number;
  userId: string | number;
  content: string;
  createdAt: Date;

  constructor({ id, userId, content, createdAt }: ClipData) {
    this.id = id;
    this.userId = userId;
    this.content = content;
    this.createdAt = createdAt || new Date();
  }
}
