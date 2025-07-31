
import { ConversionSettings, ImageFormat, ResizeMethod, ResizeMode } from '../types';

// piexifjs is loaded from a script tag in index.html and attached to the window
declare var piexif: any;

const dataURLtoBlob = (dataurl: string): Blob => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) throw new Error('Invalid data URL');
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

export const convertImage = (
  file: File,
  settings: ConversionSettings
): Promise<{ blob: Blob; newName: string; originalName: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const originalDataUrl = event.target?.result as string;
      if (!originalDataUrl) {
          return reject(new Error('파일을 읽을 수 없습니다.'));
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return reject(new Error('캔버스 컨텍스트를 가져올 수 없습니다.'));
        }

        // 1. Determine final canvas dimensions
        let canvasWidth = img.width;
        let canvasHeight = img.height;

        if (settings.resize.enabled) {
            const { mode, percentage, width, height, method } = settings.resize;
            if (mode === ResizeMode.PERCENTAGE) {
                const scale = percentage / 100;
                canvasWidth = Math.round(img.width * scale);
                canvasHeight = Math.round(img.height * scale);
            } else { // PIXELS
                switch (method) {
                    case ResizeMethod.RESIZE_WIDTH:
                        canvasWidth = width;
                        canvasHeight = Math.round(width / (img.width / img.height)) || 1;
                        break;
                    case ResizeMethod.RESIZE_HEIGHT:
                        canvasHeight = height;
                        canvasWidth = Math.round(height * (img.width / img.height)) || 1;
                        break;
                    case ResizeMethod.CROP:
                    case ResizeMethod.FIT:
                    case ResizeMethod.STRETCH:
                    default:
                        canvasWidth = width;
                        canvasHeight = height;
                        break;
                }
            }
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // 2. Prepare canvas background (for non-alpha formats or specific methods like FIT)
        ctx.fillStyle = settings.resize.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 3. Draw the image
        if (!settings.resize.enabled) {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        } else {
            const { mode, method } = settings.resize;
            if (mode === ResizeMode.PERCENTAGE || method === ResizeMethod.RESIZE_WIDTH || method === ResizeMethod.RESIZE_HEIGHT) {
                // For these methods, canvas is already the right aspect ratio. Just draw.
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            } else { // PIXELS with CROP, FIT, STRETCH
                switch (method) {
                    case ResizeMethod.CROP: {
                        const imgRatio = img.width / img.height;
                        const canvasRatio = canvas.width / canvas.height;
                        let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

                        if (imgRatio > canvasRatio) { // Image is wider, crop sides
                            sWidth = img.height * canvasRatio;
                            sx = (img.width - sWidth) / 2;
                        } else { // Image is taller, crop top/bottom
                            sHeight = img.width / canvasRatio;
                            sy = (img.height - sHeight) / 2;
                        }
                        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
                        break;
                    }
                    case ResizeMethod.FIT: {
                        const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
                        const drawWidth = img.width * ratio;
                        const drawHeight = img.height * ratio;
                        const dx = (canvas.width - drawWidth) / 2;
                        const dy = (canvas.height - drawHeight) / 2;
                        ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
                        break;
                    }
                    case ResizeMethod.STRETCH:
                    default:
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        break;
                }
            }
        }

        const quality = settings.format === ImageFormat.JPEG || settings.format === ImageFormat.WEBP || settings.format === ImageFormat.AVIF
            ? settings.quality / 100
            : undefined;

        const shouldPreserveMetadata = settings.metadata.preserve &&
                                       settings.format === ImageFormat.JPEG &&
                                       file.type === 'image/jpeg' &&
                                       typeof piexif !== 'undefined';
        
        const finishConversion = (blob: Blob) => {
            if (blob) {
              let fileExtension = settings.format.split('/')[1];
              if (settings.format === ImageFormat.JPEG) {
                fileExtension = 'jpg';
              }
              const baseName = file.name.substring(0, file.name.lastIndexOf('.'));
              const newName = `${baseName}.${fileExtension}`;
              resolve({ blob, newName, originalName: file.name });
            } else {
              reject(new Error('캔버스에서 Blob을 생성하는 데 실패했습니다.'));
            }
        };

        if (shouldPreserveMetadata) {
            try {
                const exifStr = piexif.load(originalDataUrl);
                const newDataUrl = canvas.toDataURL(settings.format, quality);
                const finalDataUrl = piexif.insert(exifStr, newDataUrl);
                const blob = dataURLtoBlob(finalDataUrl);
                finishConversion(blob);
            } catch (e) {
                // If piexif fails (e.g., no EXIF in original), just convert without it.
                console.warn('메타데이터를 보존할 수 없습니다:', e);
                canvas.toBlob(finishConversion, settings.format, quality);
            }
        } else {
             canvas.toBlob(finishConversion, settings.format, quality);
        }
      };
      img.onerror = reject;
      img.src = originalDataUrl;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};