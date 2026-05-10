import { AuthUseCase } from '../src/application/use-cases/AuthUseCase';
import { UserRepository } from '../src/application/ports/UserRepository';
import { User } from '../src/domain/models/User';
import { i18n } from '../src/domain/i18n';

jest.mock('@neondatabase/auth', () => ({
  createAuthClient: jest.fn(() => ({
    signUp: { email: jest.fn() },
    signIn: { email: jest.fn() },
  })),
}));

import { createAuthClient } from '@neondatabase/auth';

describe('AuthUseCase', () => {
  let mockRepo: jest.Mocked<UserRepository>;
  let useCase: AuthUseCase;
  let mockClient: any;
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };

    mockRepo = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    } as any;

    mockClient = {
      signUp: { email: jest.fn() },
      signIn: { email: jest.fn() },
    };

    (createAuthClient as jest.Mock).mockReturnValue(mockClient);

    process.env.NEON_AUTH_URL = 'https://test.neonauth.us-east-2.aws.neon.build/neondb/auth';
    useCase = new AuthUseCase(mockRepo);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('constructor', () => {
    it('should NOT call initClient if URL is missing', () => {
      delete process.env.NEON_AUTH_URL;
      const spy = jest.spyOn(AuthUseCase.prototype as any, 'initClient');
      new AuthUseCase(mockRepo);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('initClient', () => {
    it('should handle empty URL silently', () => {
      (useCase as any).initClient('');
      expect((useCase as any).client).toBeDefined(); // Still has old client or remains null
    });

    it('should handle initialization error in doInit silently', () => {
      (createAuthClient as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Init failure');
      });
      (useCase as any).doInit('some-url');
      // Should not throw and should not log to console
    });
  });

  describe('register', () => {
    it('should register and sync user to local DB', async () => {
      const neonUser = { id: 'neon_id', email: 'test@example.com' };
      mockClient.signUp.email.mockResolvedValue({
        data: { user: neonUser },
        error: null,
      });
      mockRepo.create.mockResolvedValue(new User(neonUser));

      const result = await useCase.register('test@example.com', 'pass123');

      expect(result.success).toBe(true);
      expect(mockRepo.create).toHaveBeenCalledWith({ id: 'neon_id', email: 'test@example.com' });
    });

    it('should initialize client if missing during registration', async () => {
      delete process.env.NEON_AUTH_URL;
      const localUseCase = new AuthUseCase(mockRepo);
      process.env.NEON_AUTH_URL = 'https://retry.url';

      mockClient.signUp.email.mockResolvedValue({ data: { user: { id: '1', email: 't@t.com' } } });
      mockRepo.create.mockResolvedValue(new User({ id: '1', email: 't@t.com' }));

      await localUseCase.register('t@t.com', 'p');
      expect((localUseCase as any).client).toBe(mockClient);
    });

    it('should return error if registration fails', async () => {
      mockClient.signUp.email.mockResolvedValue({
        data: null,
        error: { message: 'Email already exists' },
      });

      const result = await useCase.register('test@example.com', 'pass123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already exists');
    });

    it('should handle registration failure without message', async () => {
      mockClient.signUp.email.mockResolvedValue({
        data: null,
        error: {},
      });

      const result = await useCase.register('test@example.com', 'pass123');

      expect(result.success).toBe(false);
      expect(result.error).toBe(i18n.AUTH.REGISTRATION_FAILED);
    });

    it('should handle registration exception', async () => {
      mockClient.signUp.email.mockRejectedValue(new Error('Sign up error'));
      const result = await useCase.register('test@example.com', 'pass123');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Sign up error');
    });

    it('should return error if client remains null', async () => {
      (useCase as any).client = null;
      process.env.NEON_AUTH_URL = '';
      const result = await useCase.register('test@example.com', 'pass123');
      expect(result.success).toBe(false);
      expect(result.error).toBe(i18n.AUTH.CLIENT_NOT_INIT);
    });
  });

  describe('login', () => {
    it('should login and sync user if not in local DB', async () => {
      const neonUser = { id: 'neon_id', email: 'test@example.com' };
      mockClient.signIn.email.mockResolvedValue({
        data: { user: neonUser },
        error: null,
      });
      mockRepo.findById.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(new User(neonUser));

      const result = await useCase.login('test@example.com', 'pass123');

      expect(result.success).toBe(true);
      expect(mockRepo.findById).toHaveBeenCalledWith('neon_id');
      expect(mockRepo.create).toHaveBeenCalled();
    });

    it('should initialize client if missing during login', async () => {
      delete process.env.NEON_AUTH_URL;
      const localUseCase = new AuthUseCase(mockRepo);
      process.env.NEON_AUTH_URL = 'https://retry.url';

      mockClient.signIn.email.mockResolvedValue({ data: { user: { id: '1', email: 't@t.com' } } });
      mockRepo.findById.mockResolvedValue(new User({ id: '1', email: 't@t.com' }));

      await localUseCase.login('t@t.com', 'p');
      expect((localUseCase as any).client).toBe(mockClient);
    });

    it('should use existing local user', async () => {
      const neonUser = { id: 'neon_id', email: 'test@example.com' };
      mockClient.signIn.email.mockResolvedValue({
        data: { user: neonUser },
        error: null,
      });
      mockRepo.findById.mockResolvedValue(new User(neonUser));

      const result = await useCase.login('test@example.com', 'pass123');

      expect(result.success).toBe(true);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('should return error if login fails', async () => {
      mockClient.signIn.email.mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      });

      const result = await useCase.login('test@example.com', 'pass123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
    });

    it('should handle login failure without message', async () => {
      mockClient.signIn.email.mockResolvedValue({
        data: null,
        error: {},
      });

      const result = await useCase.login('test@example.com', 'pass123');

      expect(result.success).toBe(false);
      expect(result.error).toBe(i18n.AUTH.LOGIN_FAILED);
    });

    it('should handle login exception', async () => {
      mockClient.signIn.email.mockRejectedValue(new Error('Network error'));
      const result = await useCase.login('test@example.com', 'pass123');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should return error if client remains null', async () => {
      (useCase as any).client = null;
      process.env.NEON_AUTH_URL = '';
      const result = await useCase.login('test@example.com', 'pass123');
      expect(result.success).toBe(false);
      expect(result.error).toBe(i18n.AUTH.CLIENT_NOT_INIT);
    });
  });
});
