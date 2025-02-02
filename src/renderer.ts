import ImageModal from '@components/ImageModal';
import { formatFileSize, formatDate } from '@/utils';

const imageModal = new ImageModal();

const selectFolderButton = document.getElementById('select-folder')!;
const folderPathElement = document.getElementById('folder-path')!;
const fileListElement = document.getElementById('file-list')!;
const statsElement = document.getElementById('stats')!;
const imagesCountElement = document.getElementById('images-count')!;
const sortControlsElement = document.getElementById('sort-controls')!;
const sortTypeSelect = document.getElementById('sort-type') as HTMLSelectElement;
const sortAscButton = document.getElementById('sort-asc')!;
const sortDescButton = document.getElementById('sort-desc')!;
const loaderContainer = document.getElementById('loader-container')!;
const loaderCount = document.getElementById('loader-count')!;
const loaderStatus = document.getElementById('loader-status')!;

let currentFiles: FileInfo[] = [];
let currentSortType = 'filename';
let isAscending = true;

function getFileName(filePath: string): string {
  return filePath.split(/[\\/]/).pop() || filePath;
}

function formatDimensions(width: number, height: number): string {
  return `${width}×${height}px`;
}

function sortFiles(files: FileInfo[], sortType: string, ascending: boolean): FileInfo[] {
  return [...files].sort((a, b) => {
    let compareResult = 0;
    switch (sortType) {
      case 'filename':
        compareResult = getFileName(a.path).localeCompare(getFileName(b.path));
        break;
      case 'filesize':
        compareResult = a.size - b.size;
        break;
      case 'dimensions':
        const aArea = a.dimensions.width * a.dimensions.height;
        const bArea = b.dimensions.width * b.dimensions.height;
        compareResult = aArea - bArea;
        break;
      case 'created':
        compareResult = a.created.getTime() - b.created.getTime();
        break;
      case 'modified':
        compareResult = a.modified.getTime() - b.modified.getTime();
        break;
    }
    return ascending ? compareResult : -compareResult;
  });
}

function renderGallery(files: FileInfo[]) {
  fileListElement.innerHTML = files
    .map(
      (file, index) => `
      <div class="image-card" data-index="${index}">
        <div class="image-container">
          <img src="file://${file.path}" alt="${getFileName(file.path)}">
        </div>
        <div class="image-info">
          <div class="image-size">
            ${formatFileSize(file.size)} • ${formatDimensions(file.dimensions.width, file.dimensions.height)}
          </div>
          <div class="image-date">
            Created: ${formatDate(file.created)}<br>
            Изменён: ${formatDate(file.modified)}
          </div>
          <div class="image-path">${file.path}</div>
        </div>
      </div>
    `,
    )
    .join('');

  document.querySelectorAll('.image-card').forEach((card) => {
    card.addEventListener('dblclick', () => {
      const index = parseInt(card.getAttribute('data-index') || '0');
      imageModal.open(files[index]);
    });
  });
}

function updateSort() {
  const sortedFiles = sortFiles(currentFiles, currentSortType, isAscending);
  renderGallery(sortedFiles);
}

// Обработчики событий сортировки
sortTypeSelect.addEventListener('change', (e) => {
  currentSortType = (e.target as HTMLSelectElement).value;
  updateSort();
});

sortAscButton.addEventListener('click', () => {
  if (!isAscending) {
    isAscending = true;
    sortAscButton.classList.add('active');
    sortDescButton.classList.remove('active');
    updateSort();
  }
});

sortDescButton.addEventListener('click', () => {
  if (isAscending) {
    isAscending = false;
    sortDescButton.classList.add('active');
    sortAscButton.classList.remove('active');
    updateSort();
  }
});

window.electronAPI.onScanProgress((count) => {
  loaderCount.textContent = count.toString();
});

selectFolderButton.addEventListener('click', async () => {
  const folderPath = await window.electronAPI.selectFolder();
  folderPathElement.textContent = folderPath || 'No folder selected';

  if (folderPath) {
    // Показываем лоадер
    loaderContainer.style.display = 'flex';
    loaderCount.textContent = '0';
    loaderStatus.textContent = 'Scanning directory...';

    // Очищаем текущее отображение
    fileListElement.innerHTML = '';
    currentFiles = [];

    try {
      currentFiles = await window.electronAPI.scanDirectory(folderPath);

      // Обновляем статистику
      imagesCountElement.textContent = currentFiles.length.toString();
      statsElement.style.display = 'block';
      sortControlsElement.style.display = 'flex';

      // Применяем текущую сортировку и отображаем галерею
      updateSort();
    } catch (error) {
      console.error('Error scanning directory:', error);
      // Можно добавить отображение ошибки пользователю
    } finally {
      // Скрываем лоадер
      loaderContainer.style.display = 'none';
    }
  } else {
    currentFiles = [];
    fileListElement.innerHTML = '';
    statsElement.style.display = 'none';
    sortControlsElement.style.display = 'none';
  }
});

// Очищаем слушатель при закрытии окна
window.addEventListener('unload', () => {
  window.electronAPI.removeScanProgressListener();
});
