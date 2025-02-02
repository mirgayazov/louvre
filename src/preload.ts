import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  scanDirectory: (path: string) => ipcRenderer.invoke('scan-directory', path),
  onScanProgress: (callback: (count: number) => void) => {
    ipcRenderer.on('scan-progress', (_, count) => callback(count));
  },
  removeScanProgressListener: () => {
    ipcRenderer.removeAllListeners('scan-progress');
  },
});