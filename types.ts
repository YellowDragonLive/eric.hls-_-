export interface ImageFile {
  file: File;
  id: string;
  previewUrl: string;
  description?: string;
}

export type AppState = 'upload' | 'sorting' | 'results';

export type SwipeAction = 'left' | 'right';

export interface SwipeCardProps {
  image: ImageFile;
  active: boolean;
  onSwipe: (action: SwipeAction) => void;
  apiKey?: string;
}
