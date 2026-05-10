import { Pool } from 'pg';
import { ClipboardRepository } from '../../application/ports/ClipboardRepository';
import { Clip } from '../../domain/models/Clip';

export class PostgresClipboardRepository extends ClipboardRepository {
  constructor(private pool: Pool) {
    super();
  }

  async save(clip: Clip): Promise<void> {
    await this.pool.query('INSERT INTO clips (user_id, content) VALUES ($1, $2)', [
      clip.userId,
      clip.content,
    ]);
  }

  async getRecent(userId: string | number, limit: number): Promise<Clip[]> {
    const res = await this.pool.query(
      'SELECT content FROM clips WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
    return res.rows.map((r: any) => new Clip({ userId, content: r.content }));
  }
}
