import { User } from '../src/domain/models/User';

describe('User Model', () => {
  it('should create a user instance', () => {
    const user = new User({ id: 'uuid-123', email: 'test@example.com' });
    expect(user.id).toBe('uuid-123');
    expect(user.email).toBe('test@example.com');
  });

  it('should match snapshot', () => {
    const user = new User({ id: 'user-id-snap', email: 'snap@quickclip.com' });
    expect(user).toMatchSnapshot();
  });
});
