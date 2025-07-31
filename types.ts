
export enum ImageFormat {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  WEBP = 'image/webp',
  GIF = 'image/gif',
  AVIF = 'image/avif',
}

export enum ResizeMethod {
  STRETCH = 'stretch',
  CROP = 'crop',
  FIT = 'fit',
  RESIZE_WIDTH = 'resize_width',
  RESIZE_HEIGHT = 'resize_height',
}

export enum ResizeMode {
  PIXELS = 'pixels',
  PERCENTAGE = 'percentage',
}

export interface ConversionSettings {
  format: ImageFormat;
  quality: number;
  resize: {
    enabled: boolean;
    mode: ResizeMode;
    percentage: number;
    width: number;
    height: number;
    method: ResizeMethod;
    backgroundColor: string;
  };
  metadata: {
    preserve: boolean;
  };
}

export interface OriginalImageFile {
  id: string;
  file: File;
  previewUrl: string;
}

export interface ConvertedImageFile {
  id: string;
  blob: Blob;
  originalName: string;
  newName: string;
  previewUrl: string;
}

export enum ConversionStatus {
  IDLE,
  CONVERTING,
  DONE,
  ERROR
}