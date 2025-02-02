export {};

declare global {
  interface FileInfo {
    path: string;
    size: number;
    dimensions: {
      width: number;
      height: number;
    };
    created: Date; // Creation date
    modified: Date; // Modification date
  }

  interface Window {
    electronAPI: {
      selectFolder: () => Promise<string | null>;
      scanDirectory: (path: string) => Promise<FileInfo[]>;
      onScanProgress: (callback: (count: number) => void) => void;
      removeScanProgressListener: () => void;
    };
  }
}
