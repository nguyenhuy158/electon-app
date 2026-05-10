import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  register: (data: any) => ipcRenderer.invoke('register', data),
  login: (data: any) => ipcRenderer.invoke('login', data),
  onSync: (callback: (event: any, ...args: any[]) => void) =>
    ipcRenderer.on('sync-status', callback),
  getShortcut: () => ipcRenderer.invoke('get-shortcut'),
  updateShortcut: (shortcut: string) => ipcRenderer.invoke('update-shortcut', shortcut),
  getHistory: () => ipcRenderer.invoke('get-history'),
  onHistoryUpdate: (callback: (history: string[]) => void) =>
    ipcRenderer.on('history-updated', (_event, history) => callback(history)),
  copyToClipboard: (text: string) => ipcRenderer.invoke('copy-to-clipboard', text),
});
