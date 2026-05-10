import { ClipboardUseCase } from '../src/main/application/use-cases/ClipboardUseCase';
import { ClipboardRepository } from '../src/main/application/ports/ClipboardRepository';
import { ClipboardService } from '../src/main/application/ports/ClipboardService';
import { NotificationService } from '../src/main/application/ports/NotificationService';
import { User } from '../src/main/domain/models/User';
import { Clip } from '../src/main/domain/models/Clip';
import { i18n } from '../src/main/domain/i18n';

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

  test('addClip should handle sync failure silently', async () => {
    mockRepo.save.mockRejectedValue(new Error('DB Error'));
    useCase.setCurrentUser(new User({ id: 'u1', email: 'test@example.com' }));
    await useCase.addClip('error test');
    // Should not throw
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

  test('navigation should work correctly', async () => {
    await useCase.addClip('1');
    await useCase.addClip('2');
    await useCase.addClip('3');

    expect(useCase.getSelectedIndex()).toBe(-1);

    useCase.moveSelectionDown();
    expect(useCase.getSelectedIndex()).toBe(0); // Should select '3'

    useCase.moveSelectionDown();
    expect(useCase.getSelectedIndex()).toBe(1); // Should select '2'

    useCase.moveSelectionDown();
    expect(useCase.getSelectedIndex()).toBe(2); // Should select '1'

    useCase.moveSelectionDown();
    expect(useCase.getSelectedIndex()).toBe(0); // Should wrap to top

    useCase.moveSelectionUp();
    expect(useCase.getSelectedIndex()).toBe(2); // Should wrap to bottom

    useCase.moveSelectionUp();
    expect(useCase.getSelectedIndex()).toBe(1);

    useCase.setSelectedIndex(0);
    expect(useCase.getSelectedIndex()).toBe(0);

    useCase.setSelectedIndex(5); // Invalid
    expect(useCase.getSelectedIndex()).toBe(0);

    useCase.setSelectedIndex(-1);
    expect(useCase.getSelectedIndex()).toBe(-1);
  });

  test('copySelected should copy item at selectedIndex', async () => {
    await useCase.addClip('1');
    await useCase.addClip('2');

    useCase.setSelectedIndex(1);
    useCase.copySelected();
    expect(mockService.writeText).toHaveBeenCalledWith('1');

    useCase.setSelectedIndex(-1);
    useCase.copySelected();
    expect(mockService.writeText).toHaveBeenCalledTimes(1); // Should not call again
  });

  test('navigation with empty history', () => {
    useCase.clearHistory();
    useCase.moveSelectionDown();
    expect(useCase.getSelectedIndex()).toBe(-1);
    useCase.moveSelectionUp();
    expect(useCase.getSelectedIndex()).toBe(-1);
  });
});
