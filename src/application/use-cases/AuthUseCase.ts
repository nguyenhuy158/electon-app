import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../ports/UserRepository';

export class AuthUseCase {
  constructor(private userRepository: UserRepository) {}

  async register(email: string, password: string) {
    const hash = await bcrypt.hash(password, 10);
    try {
      const user = await this.userRepository.create({ email, password: hash });
      return { success: true, user };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async login(email: string, password: string) {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (user && user.password) {
        const match = await bcrypt.compare(password, user.password);
        if (match) {
          return { success: true, user: { id: user.id, email: user.email } };
        }
      }
      return { success: false, error: 'Invalid credentials' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
