import { AuthUseCase } from '../src/application/use-cases/AuthUseCase';
import { UserRepository } from '../src/application/ports/UserRepository';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthUseCase', () => {
  let mockRepo: jest.Mocked<UserRepository>;
  let useCase: AuthUseCase;

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findByEmail: jest.fn(),
    } as any;
    useCase = new AuthUseCase(mockRepo);
    jest.clearAllMocks();
  });

  test('register should hash password and save user', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pass');
    mockRepo.create.mockResolvedValue({ id: 1, email: 'test@test.com' } as any);

    const result = await useCase.register('test@test.com', 'pass123');

    expect(bcrypt.hash).toHaveBeenCalledWith('pass123', 10);
    expect(mockRepo.create).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'hashed_pass',
    });
    expect(result.success).toBe(true);
  });

  test('register should return error on failure', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pass');
    mockRepo.create.mockRejectedValue(new Error('DB Error'));

    const result = await useCase.register('test@test.com', 'pass123');
    expect(result.success).toBe(false);
    expect(result.error).toBe('DB Error');
  });

  test('login should return user on success', async () => {
    mockRepo.findByEmail.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      password: 'hashed_pass',
    } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await useCase.login('test@test.com', 'pass123');

    expect(result.success).toBe(true);
    expect(result.user?.email).toBe('test@test.com');
  });

  test('login should return error on invalid credentials', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);

    const result = await useCase.login('test@test.com', 'pass123');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid credentials');
  });

  test('login should return error if password mismatch', async () => {
    mockRepo.findByEmail.mockResolvedValue({ password: 'hashed' } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const result = await useCase.login('test@test.com', 'pass123');
    expect(result.success).toBe(false);
  });

  test('login should return error on repository exception', async () => {
    mockRepo.findByEmail.mockRejectedValue(new Error('Fatal'));
    const result = await useCase.login('test@test.com', 'pass');
    expect(result.success).toBe(false);
    expect(result.error).toBe('Fatal');
  });
});
