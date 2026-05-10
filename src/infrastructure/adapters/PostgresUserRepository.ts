import { Pool } from 'pg';
import { UserRepository } from '../../application/ports/UserRepository';
import { User, UserData } from '../../domain/models/User';

export class PostgresUserRepository extends UserRepository {
  constructor(private pool: Pool) {
    super();
  }

  async findByEmail(email: string): Promise<User | null> {
    const res = await this.pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (res.rows[0]) {
      return new User(res.rows[0]);
    }
    return null;
  }

  async findById(id: string): Promise<User | null> {
    const res = await this.pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (res.rows[0]) {
      return new User(res.rows[0]);
    }
    return null;
  }

  async create({ id, email }: UserData): Promise<User> {
    const res = await this.pool.query(
      'INSERT INTO users (id, email) VALUES ($1, $2) RETURNING id, email',
      [id, email]
    );
    return new User(res.rows[0]);
  }
}
