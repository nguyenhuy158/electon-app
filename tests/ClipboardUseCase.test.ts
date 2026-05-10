import { ClipboardUseCase } from '../src/application/use-cases/ClipboardUseCase';
import { ClipboardRepository } from '../src/application/ports/ClipboardRepository';
import { ClipboardService } from '../src/application/ports/ClipboardService';
import { NotificationService } from '../src/application/ports/NotificationService';
import { User } from '../src/domain/models/User';
import { Clip } from '../src/domain/models/Clip';
import { i18n } from '../src/domain/i18n';

describe('ClipboardUseCase', () => {
  let mockRepo: jest.Mocked<ClipboardRepository>;
  let mockService: jest.Mocked<ClipboardService>;
  let mockNotify: jest.Mocked<NotificationService>;
  let useCase: ClipboardUseCase;

  beforeEach(() => {
    mockRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      getRecent: jest.fn().mockResolvedValue([]),
    } as any;
    mockService = {
      readText: jest.fn(),
      writeText: jest.fn(),
    } as any;
    mockNotify = {
      notify: jest.fn(),
    } as any;
    useCase = new ClipboardUseCase(mockRepo, mockService, mockNotify, 3);
  });

  test('addClip should add text to history', async () => {
    await useCase.addClip('hello');
    expect(useCase.getHistory()).toEqual(['hello']);
  });

  test('addClip should respect history limit', async () => {
    await useCase.addClip('1');
    await useCase.addClip('2');
    await useCase.addClip('3');
    await useCase.addClip('4');
    expect(useCase.getHistory()).toEqual(['4', '3', '2']);
  });

  test('addClip should sync to repo if user logged in', async () => {
    useCase.setCurrentUser(new User({ id: 'u1', email: 'test@example.com' }));
    await useCase.addClip('secret');
    expect(mockRepo.save).toHaveBeenCalledWith(expect.any(Clip));
  });

  test('copyToClipboard should call service and notify', () => {
    useCase.copyToClipboard('copied text');
    expect(mockService.writeText).toHaveBeenCalledWith('copied text');
    expect(mockNotify.notify).toHaveBeenCalled();
  });

  test('addClip should log error if sync fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockRepo.save.mockRejectedValue(new Error('DB Error'));
    useCase.setCurrentUser(new User({ id: 'u1', email: 'test@example.com' }));
    await useCase.addClip('error test');
    expect(consoleSpy).toHaveBeenCalledWith(i18n.ERRORS.SYNC_FAILED, expect.any(Error));
    consoleSpy.mockRestore();
  });

  test('addClip should work without repo', async () => {
    const noRepoUseCase = new ClipboardUseCase(null as any, mockService, mockNotify, 3);
    await noRepoUseCase.addClip('no repo test');
    expect(noRepoUseCase.getHistory()).toEqual(['no repo test']);
  });

  test('addClip should work without onUpdate', async () => {
    await useCase.addClip('no callback test');
    expect(useCase.getHistory()).toContain('no callback test');
  });

  test('loadCloudHistory should return empty if no repo', async () => {
    const noRepoUseCase = new ClipboardUseCase(null as any, mockService, mockNotify);
    const result = await noRepoUseCase.loadCloudHistory('u1');
    expect(result).toEqual([]);
  });

  test('loadCloudHistory should load and set history', async () => {
    const cloudData = [
      new Clip({ userId: 'u1', content: 'cloud 1' }),
      new Clip({ userId: 'u1', content: 'cloud 2' }),
    ];
    mockRepo.getRecent.mockResolvedValue(cloudData);
    const result = await useCase.loadCloudHistory('u1');
    expect(result).toEqual(['cloud 1', 'cloud 2']);
    expect(useCase.getHistory()).toEqual(['cloud 1', 'cloud 2']);
  });

  test('clearHistory should empty the history', async () => {
    await useCase.addClip('item');
    useCase.clearHistory();
    expect(useCase.getHistory()).toEqual([]);
  });

  test('addClip should not add duplicate text', async () => {
    await useCase.addClip('dup');
    await useCase.addClip('dup');
    expect(useCase.getHistory()).toHaveLength(1);
  });

  test('addClip should call onUpdate callback', async () => {
    const onUpdate = jest.fn();
    await useCase.addClip('update me', onUpdate);
    expect(onUpdate).toHaveBeenCalledWith(['update me']);
  });
});
