import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

let mainWindow: BrowserWindow | null = null;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadFile(path.join(__dirname, '../src/index.html'));
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../src/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

// Добавляем функцию для проверки, является ли файл изображением
function isImageFile(filename: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.heic'];
  return imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
}

// Функция для рекурсивного сканирования директории
async function scanDirectory(
  directoryPath: string,
  progressCallback: (count: number) => void
): Promise<Array<FileInfo>> {
  const files: Array<FileInfo> = [];
  let processedCount = 0;

  async function scan(currentPath: string) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await scan(fullPath);
      } else if (entry.isFile() && isImageFile(entry.name)) {
        const stats = await fs.stat(fullPath);
        try {
          const metadata = await sharp(fullPath).metadata();
          files.push({
            path: fullPath,
            size: stats.size,
            dimensions: {
              width: metadata.width || 0,
              height: metadata.height || 0,
            },
            created: stats.birthtime,
            modified: stats.mtime,
          });
          processedCount++;
          progressCallback(processedCount);
        } catch (error) {
          console.error(`Error processing image ${fullPath}:`, error);
        }
      }
    }
  }

  await scan(directoryPath);
  return files;
}

// Добавляем новый обработчик IPC
ipcMain.handle('scan-directory', async (event, directoryPath: string) => {
  try {
    return await scanDirectory(directoryPath, (count) => {
      event.sender.send('scan-progress', count);
    });
  } catch (error) {
    console.error('Error scanning directory:', error);
    return [];
  }
});

ipcMain.handle('select-folder', async () => {
  if (!mainWindow) return;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  return result.filePaths[0] || null;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
