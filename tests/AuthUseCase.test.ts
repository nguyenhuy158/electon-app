import { AuthUseCase } from '../src/application/use-cases/AuthUseCase';
import { UserRepository } from '../src/application/ports/UserRepository';
import { User } from '../src/domain/models/User';
import { i18n } from '../src/domain/i18n';

describe('AuthUseCase', () => {
  let mockRepo: jest.Mocked<UserRepository>;
  let useCase: AuthUseCase;

  beforeEach(() => {
    mockRepo = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    } as any;
    
    process.env.NEON_AUTH_URL = 'https://test.neonauth.us-east-2.aws.neon.build/neondb/auth';
    useCase = new AuthUseCase(mockRepo);
    
    // Inject mock client directly to avoid real network calls or SDK logic
    (useCase as any).client = {
      signUp: {
        email: jest.fn()
      },
      signIn: {
        email: jest.fn()
      }
    };
  });

  describe('register', () => {
    it('should register and sync user to local DB', async () => {
      const neonUser = { id: 'neon_id', email: 'test@example.com' };
      ((useCase as any).client.signUp.email as jest.Mock).mockResolvedValue({
        data: { user: neonUser },
        error: null
      });
      mockRepo.create.mockResolvedValue(new User(neonUser));

      const result = await useCase.register('test@example.com', 'pass123');

      expect(result.success).toBe(true);
      expect(mockRepo.create).toHaveBeenCalledWith({ id: 'neon_id', email: 'test@example.com' });
    });

    it('should return error if registration fails', async () => {
      ((useCase as any).client.signUp.email as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Email already exists' }
      });

      const result = await useCase.register('test@example.com', 'pass123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already exists');
    });
  });

  describe('login', () => {
    it('should login and sync user if not in local DB', async () => {
      const neonUser = { id: 'neon_id', email: 'test@example.com' };
      ((useCase as any).client.signIn.email as jest.Mock).mockResolvedValue({
        data: { user: neonUser },
        error: null
      });
      mockRepo.findById.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(new User(neonUser));

      const result = await useCase.login('test@example.com', 'pass123');

      expect(result.success).toBe(true);
      expect(mockRepo.findById).toHaveBeenCalledWith('neon_id');
      expect(mockRepo.create).toHaveBeenCalled();
    });

    it('should login and use existing local user', async () => {
      const neonUser = { id: 'neon_id', email: 'test@example.com' };
      ((useCase as any).client.signIn.email as jest.Mock).mockResolvedValue({
        data: { user: neonUser },
        error: null
      });
      mockRepo.findById.mockResolvedValue(new User(neonUser));

      const result = await useCase.login('test@example.com', 'pass123');

      expect(result.success).toBe(true);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('should return error if login fails', async () => {
      ((useCase as any).client.signIn.email as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' }
      });

      const result = await useCase.login('test@example.com', 'pass123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });

    it('should return error if exception occurs during login', async () => {
      ((useCase as any).client.signIn.email as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await useCase.login('test@example.com', 'pass123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('initialization and registration errors', () => {
    it('should handle registration exception', async () => {
      ((useCase as any).client.signUp.email as jest.Mock).mockRejectedValue(new Error('Sign up error'));

      const result = await useCase.register('test@example.com', 'pass123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sign up error');
    });

    it('should handle registration failure without message', async () => {
      ((useCase as any).client.signUp.email as jest.Mock).mockResolvedValue({
        data: null,
        error: {}
      });

      const result = await useCase.register('test@example.com', 'pass123');

      expect(result.success).toBe(false);
      expect(result.error).toBe(i18n.AUTH.REGISTRATION_FAILED);
    });

    it('should handle login failure without message', async () => {
      ((useCase as any).client.signIn.email as jest.Mock).mockResolvedValue({
        data: null,
        error: {}
      });

      const result = await useCase.login('test@example.com', 'pass123');

      expect(result.success).toBe(false);
      expect(result.error).toBe(i18n.AUTH.LOGIN_FAILED);
    });

    it('should return error if client is not initialized during registration', async () => {
      (useCase as any).client = null;
      process.env.NEON_AUTH_URL = ''; // Ensure initClient fails or doesn't set client

      const result = await useCase.register('test@example.com', 'pass123');

      expect(result.success).toBe(false);
      expect(result.error).toBe(i18n.AUTH.CLIENT_NOT_INIT);
    });

    it('should return error if client is not initialized during login', async () => {
      (useCase as any).client = null;
      process.env.NEON_AUTH_URL = '';

      const result = await useCase.login('test@example.com', 'pass123');

      expect(result.success).toBe(false);
      expect(result.error).toBe(i18n.AUTH.CLIENT_NOT_INIT);
    });
  });
});
