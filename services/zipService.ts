
import { ConvertedImageFile } from '../types';

// This tells TypeScript that JSZip is a global variable from the CDN script
declare var JSZip: any;

export const createZip = (files: ConvertedImageFile[]): Promise<Blob> => {
    const zip = new JSZip();
    files.forEach(file => {
        zip.file(file.newName, file.blob);
    });
    return zip.generateAsync({ type: 'blob' });
};
