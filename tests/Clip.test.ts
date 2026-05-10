import { Clip } from '../src/domain/models/Clip';

describe('Clip Model', () => {
  it('should create a clip instance with correct properties', () => {
    const now = new Date();
    const clip = new Clip({
      id: '1',
      userId: '100',
      content: 'test content',
      createdAt: now,
    });

    expect(clip.id).toBe('1');
    expect(clip.userId).toBe('100');
    expect(clip.content).toBe('test content');
    expect(clip.createdAt).toBe(now);
  });

  it('should default createdAt to now', () => {
    const clip = new Clip({ userId: '1', content: 'no date' });
    expect(clip.createdAt).toBeInstanceOf(Date);
  });
});
