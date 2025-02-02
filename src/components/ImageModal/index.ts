import { formatFileSize, formatDate } from '@/utils';

interface ModalElements {
  container: HTMLElement;
  image: HTMLImageElement;
  title: HTMLElement;
  size: HTMLElement;
  dimensions: HTMLElement;
  created: HTMLElement;
  modified: HTMLElement;
  path: HTMLElement;
  closeButton: HTMLElement;
  zoomIn: HTMLElement;
  zoomOut: HTMLElement;
  zoomLevel: HTMLElement;
}

class ImageModal {
  private elements: ModalElements;
  private currentZoom: number = 1;
  private readonly ZOOM_STEP = 0.25;
  private readonly MIN_ZOOM = 0.25;
  private readonly MAX_ZOOM = 3;

  constructor() {
    this.elements = {
      container: document.getElementById('image-modal')!,
      image: document.getElementById('modal-image') as HTMLImageElement,
      title: document.getElementById('modal-title')!,
      size: document.getElementById('modal-size')!,
      dimensions: document.getElementById('modal-dimensions')!,
      created: document.getElementById('modal-created')!,
      modified: document.getElementById('modal-modified')!,
      path: document.getElementById('modal-path')!,
      closeButton: document.getElementById('close-modal')!,
      zoomIn: document.getElementById('zoom-in')!,
      zoomOut: document.getElementById('zoom-out')!,
      zoomLevel: document.getElementById('zoom-level')!,
    };

    this.initializeEventListeners();
  }

  private initializeEventListeners() {
    this.elements.closeButton.addEventListener('click', () => this.close());
    this.elements.container.addEventListener('click', (e) => {
      if (e.target === this.elements.container) {
        this.close();
      }
    });

    this.elements.zoomIn.addEventListener('click', () => {
      this.updateZoom(this.currentZoom + this.ZOOM_STEP);
    });

    this.elements.zoomOut.addEventListener('click', () => {
      this.updateZoom(this.currentZoom - this.ZOOM_STEP);
    });

    this.elements.image.addEventListener('wheel', (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -this.ZOOM_STEP : this.ZOOM_STEP;
        this.updateZoom(this.currentZoom + delta);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (this.elements.container.style.display === 'flex') {
        if (e.key === 'Escape') {
          this.close();
        } else if (e.ctrlKey) {
          if (e.key === '=' || e.key === '+') {
            e.preventDefault();
            this.updateZoom(this.currentZoom + this.ZOOM_STEP);
          } else if (e.key === '-') {
            e.preventDefault();
            this.updateZoom(this.currentZoom - this.ZOOM_STEP);
          } else if (e.key === '0') {
            e.preventDefault();
            this.resetZoom();
          }
        }
      }
    });
  }

  private updateZoom(newZoom: number) {
    this.currentZoom = Math.min(Math.max(newZoom, this.MIN_ZOOM), this.MAX_ZOOM);
    this.elements.image.style.transform = `scale(${this.currentZoom})`;
    this.elements.zoomLevel.textContent = `${Math.round(this.currentZoom * 100)}%`;
  }

  private resetZoom() {
    this.currentZoom = 1;
    this.updateZoom(this.currentZoom);
  }

  private formatDimensions(width: number, height: number): string {
    return `${width}×${height}px`;
  }

  open(file: FileInfo) {
    this.elements.image.src = `file://${file.path}`;
    this.elements.title.textContent = file.path.split(/[\\/]/).pop() || file.path;
    this.elements.size.textContent = formatFileSize(file.size);
    this.elements.dimensions.textContent = this.formatDimensions(
      file.dimensions.width,
      file.dimensions.height,
    );
    this.elements.created.textContent = formatDate(file.created);
    this.elements.modified.textContent = formatDate(file.modified);
    this.elements.path.textContent = file.path;

    this.resetZoom();
    this.elements.container.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.elements.container.style.display = 'none';
    document.body.style.overflow = '';
    this.resetZoom();
  }
}

export default ImageModal;
