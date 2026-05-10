import { AuthUseCase } from '../src/application/use-cases/AuthUseCase';
import { UserRepository } from '../src/application/ports/UserRepository';
import { User } from '../src/domain/models/User';

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
  });
});
