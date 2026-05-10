import { createAuthClient } from '@neondatabase/auth';
import { UserRepository } from '../ports/UserRepository';
import { i18n } from '../../domain/i18n';

export class AuthUseCase {
  private client: any;

  constructor(private userRepository: UserRepository) {
    const authUrl = process.env.NEON_AUTH_URL || '';
    if (authUrl) {
      this.initClient(authUrl);
    }
  }

  private initClient(url: string) {
    if (!url) {
      console.error(i18n.AUTH.URL_NOT_CONFIG);
      return;
    }
    this.doInit(url);
  }

  private doInit(url: string) {
    console.log('Initializing Neon Auth with URL:', url);
    try {
      this.client = createAuthClient(url);
    } catch (e) {
      console.error(i18n.AUTH.CLIENT_NOT_INIT, e);
    }
  }

  async register(email: string, password: string) {
    if (!this.client) {
      await this.initClient(process.env.NEON_AUTH_URL || '');
    }
    if (!this.client) return { success: false, error: i18n.AUTH.CLIENT_NOT_INIT };

    try {
      const result = await this.client.signUp.email({
        email,
        password,
        name: email.split('@')[0], // Provide a default name derived from email
        callbackURL: 'http://localhost.com',
      });

      if (result.error) {
        return { success: false, error: result.error.message || i18n.AUTH.REGISTRATION_FAILED };
      }

      const neonUser = result.data.user;

      const user = await this.userRepository.create({
        id: neonUser.id,
        email: neonUser.email,
      });

      return { success: true, user };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async login(email: string, password: string) {
    if (!this.client) {
      await this.initClient(process.env.NEON_AUTH_URL || '');
    }
    if (!this.client) return { success: false, error: i18n.AUTH.CLIENT_NOT_INIT };

    try {
      const result = await this.client.signIn.email({
        email,
        password,
        callbackURL: 'http://localhost.com', // Updated to 2-label domain for Neon validation
      });

      if (result.error) {
        return { success: false, error: result.error.message || i18n.AUTH.LOGIN_FAILED };
      }

      const neonUser = result.data.user;

      let user = await this.userRepository.findById(neonUser.id);
      if (!user) {
        user = await this.userRepository.create({
          id: neonUser.id,
          email: neonUser.email,
        });
      }

      return { success: true, user: { id: user.id, email: user.email } };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
