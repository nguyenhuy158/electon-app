import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  register: (data: any) => ipcRenderer.invoke('register', data),
  login: (data: any) => ipcRenderer.invoke('login', data),
  onSync: (callback: (event: any, ...args: any[]) => void) => 
    ipcRenderer.on('sync-status', callback),
});
