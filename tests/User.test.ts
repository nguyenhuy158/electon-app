import { User } from '../src/domain/models/User';

describe('User Model', () => {
  it('should create a user instance', () => {
    const user = new User({ id: 1, email: 'test@example.com', password: 'hash' });
    expect(user.id).toBe(1);
    expect(user.email).toBe('test@example.com');
    expect(user.password).toBe('hash');
  });
});
