import { app, Tray, Menu, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { initDb, pool } from './db';

// Infrastructure Adapters
import { PostgresUserRepository } from './infrastructure/adapters/PostgresUserRepository';
import { PostgresClipboardRepository } from './infrastructure/adapters/PostgresClipboardRepository';
import { ElectronClipboardService } from './infrastructure/adapters/ElectronClipboardService';
import { ElectronNotificationService } from './infrastructure/adapters/ElectronNotificationService';

// Use Cases
import { AuthUseCase } from './application/use-cases/AuthUseCase';
import { ClipboardUseCase } from './application/use-cases/ClipboardUseCase';

let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;
let lastClip: string = '';

// Dependency Injection
const userRepository = new PostgresUserRepository(pool);
const clipboardRepository = new PostgresClipboardRepository(pool);
const clipboardService = new ElectronClipboardService();
const notificationService = new ElectronNotificationService();

const authUseCase = new AuthUseCase(userRepository);
const clipboardUseCase = new ClipboardUseCase(
  clipboardRepository,
  clipboardService,
  notificationService
);

async function startup() {
  try {
    if (process.env.DATABASE_URL) {
      await initDb();
    }
  } catch (err) {
    console.error('Failed to init DB:', err);
  }

  createTray();
  createWindow();
  startClipboardPolling();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
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
  tray = new Tray(path.join(__dirname, '../icon.png'));
  updateTrayMenu();
}

function updateTrayMenu() {
  if (!tray) return;

  const history = clipboardUseCase.getHistory();
  const contextMenu = Menu.buildFromTemplate([
    { label: 'QuickClip', enabled: false },
    { type: 'separator' },
    ...history.map((text) => ({
      label: text.length > 30 ? text.substring(0, 27) + '...' : text,
      click: () => {
        clipboardUseCase.copyToClipboard(text);
      },
    })),
    { type: 'separator' },
    { label: 'Show App', click: () => mainWindow?.show() },
    {
      label: 'Clear History',
      click: () => {
        clipboardUseCase.clearHistory();
        updateTrayMenu();
      },
    },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);
  tray.setContextMenu(contextMenu);
}

function startClipboardPolling() {
  setInterval(async () => {
    const text = clipboardService.readText();
    if (text && text !== lastClip) {
      lastClip = text;
      await clipboardUseCase.addClip(text, () => updateTrayMenu());
    }
  }, 1000);
}

// IPC Handlers for Auth
ipcMain.handle('register', async (_event, { email, password }) => {
  const result = await authUseCase.register(email, password);
  if (result.success) {
    clipboardUseCase.setCurrentUser(result.user as any);
  }
  return result;
});

ipcMain.handle('login', async (_event, { email, password }) => {
  const result = await authUseCase.login(email, password);
  if (result.success && result.user) {
    clipboardUseCase.setCurrentUser(result.user as any);
    if (result.user.id) {
      await clipboardUseCase.loadCloudHistory(result.user.id);
    }
    updateTrayMenu();
  }
  return result;
});

app.whenReady().then(startup);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
