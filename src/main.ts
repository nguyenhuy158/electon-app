import { app, Tray, Menu, BrowserWindow, ipcMain, globalShortcut } from 'electron';
import * as path from 'path';
import 'dotenv/config';
import { initDb, pool } from './db';
import { APP_CONSTANTS } from './domain/constants';
import { i18n } from './domain/i18n';

// Infrastructure Adapters
import { PostgresUserRepository } from './infrastructure/adapters/PostgresUserRepository';
import { PostgresClipboardRepository } from './infrastructure/adapters/PostgresClipboardRepository';
import { LocalFileClipboardRepository } from './infrastructure/adapters/LocalFileClipboardRepository';
import { SmartClipboardRepository } from './infrastructure/adapters/SmartClipboardRepository';
import { ElectronClipboardService } from './infrastructure/adapters/ElectronClipboardService';
import { ElectronNotificationService } from './infrastructure/adapters/ElectronNotificationService';

// Use Cases
import { AuthUseCase } from './application/use-cases/AuthUseCase';
import { ClipboardUseCase } from './application/use-cases/ClipboardUseCase';

let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;
let lastClip: string = '';
let currentShortcut: string = APP_CONSTANTS.SHORTCUTS.OPEN_PICKER;

// Dependency Injection
const userRepository = new PostgresUserRepository(pool);
const cloudClipboardRepository = new PostgresClipboardRepository(pool);
const localClipboardRepository = new LocalFileClipboardRepository();
const smartClipboardRepository = new SmartClipboardRepository(
  localClipboardRepository,
  cloudClipboardRepository
);
const clipboardService = new ElectronClipboardService();
const notificationService = new ElectronNotificationService();

const authUseCase = new AuthUseCase(userRepository);
const clipboardUseCase = new ClipboardUseCase(
  smartClipboardRepository,
  clipboardService,
  notificationService
);

// Register IPC handlers
ipcMain.handle('get-shortcut', () => currentShortcut);
ipcMain.handle('update-shortcut', (_event, shortcut: string) => {
  try {
    registerShortcuts(shortcut);
    currentShortcut = shortcut;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-history', () => clipboardUseCase.getHistory());

ipcMain.handle('copy-to-clipboard', (_event, text: string) => {
  clipboardUseCase.copyToClipboard(text);
  mainWindow?.hide();
  return { success: true };
});

ipcMain.handle('register', async (_event, { email, password }) => {
  const result = await authUseCase.register(email, password);
  if (result.success && result.user) {
    smartClipboardRepository.setUseCloud(true);
    clipboardUseCase.setCurrentUser(result.user as any);
  }
  return result;
});

ipcMain.handle('login', async (_event, { email, password }) => {
  const result = await authUseCase.login(email, password);
  if (result.success && result.user) {
    smartClipboardRepository.setUseCloud(true);
    clipboardUseCase.setCurrentUser(result.user as any);
    if (result.user.id) {
      await clipboardUseCase.loadCloudHistory(result.user.id);
    }
    updateTrayMenu();
  }
  return result;
});

async function startup() {
  try {
    if (process.env.DATABASE_URL) {
      await initDb();
    }
  } catch (err) {
    console.error(i18n.ERRORS.DB_INIT_FAILED, err);
  }

  // Load local history on startup (Guest mode)
  await clipboardUseCase.loadCloudHistory('guest');

  createTray();
  createWindow();
  startClipboardPolling();
  registerShortcuts(currentShortcut);
}

function registerShortcuts(shortcut: string) {
  globalShortcut.unregisterAll();
  globalShortcut.register(shortcut, () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: APP_CONSTANTS.UI.WINDOW_WIDTH,
    height: APP_CONSTANTS.UI.WINDOW_HEIGHT,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

function createTray() {
  tray = new Tray(path.join(__dirname, APP_CONSTANTS.UI.TRAY_ICON_PATH));
  updateTrayMenu();
}

function updateTrayMenu() {
  const history = clipboardUseCase.getHistory();

  // Notify renderer
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('history-updated', history);
  }

  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    { label: i18n.APP.NAME, enabled: false },
    { type: 'separator' },
    ...history.map((text) => ({
      label: text.length > 30 ? text.substring(0, 27) + '...' : text,
      click: () => {
        clipboardUseCase.copyToClipboard(text);
      },
    })),
    { type: 'separator' },
    { label: i18n.TRAY.SHOW_APP, click: () => mainWindow?.show() },
    {
      label: i18n.TRAY.CLEAR_HISTORY,
      click: () => {
        clipboardUseCase.clearHistory();
        updateTrayMenu();
      },
    },
    { type: 'separator' },
    { label: i18n.TRAY.QUIT, click: () => app.quit() },
  ]);
  tray.setContextMenu(contextMenu);
}

function startClipboardPolling() {
  setInterval(async () => {
    const text = clipboardService.readText();
    if (text && text !== lastClip) {
      console.log(`[Clipboard] New content detected: ${text.substring(0, 20)}...`);
      lastClip = text;
      await clipboardUseCase.addClip(text, () => updateTrayMenu());
    }
  }, APP_CONSTANTS.CLIPBOARD.POLLING_INTERVAL_MS);
}

app.whenReady().then(startup);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
