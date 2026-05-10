import { User, UserData } from '../../domain/models/User';

export abstract class UserRepository {
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract create(user: UserData): Promise<User>;
}
