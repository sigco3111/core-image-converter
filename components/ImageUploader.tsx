import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import UploadIcon from './icons/UploadIcon';

// Extend React's HTML attributes to include the non-standard webkitdirectory attribute.
// This is necessary to fix the TypeScript error.
declare module 'react' {
  interface InputHTMLAttributes<T> {
    webkitdirectory?: string;
  }
}

interface ImageUploaderProps {
  onFilesSelected: (files: File[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFilesSelected }) => {
  const [isHover, setIsHover] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFilesSelected(acceptedFiles);
    }
    setIsHover(false);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/webp': ['.webp'],
        'image/gif': ['.gif'],
        'image/avif': ['.avif'],
    },
    onDragEnter: () => setIsHover(true),
    onDragLeave: () => setIsHover(false),
  });

  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center w-full h-full min-h-[60vh] border-4 border-dashed rounded-2xl transition-all duration-300 ease-in-out cursor-pointer
        ${isDragActive || isHover ? 'border-sky-500 bg-slate-800/50' : 'border-slate-700 hover:border-slate-600 bg-slate-800/20'}`}
    >
      <input {...getInputProps()} multiple webkitdirectory="" />
      <div className="text-center p-8">
        <UploadIcon className={`w-24 h-24 mx-auto mb-6 text-slate-600 transition-colors ${isDragActive || isHover ? 'text-sky-500' : ''}`} />
        <h2 className="text-2xl font-bold text-slate-300">
          {isDragActive ? "여기에 파일을 놓으세요..." : "파일 또는 폴더를 여기로 드래그 앤 드롭하세요"}
        </h2>
        <p className="text-slate-400 mt-2">또는 클릭해서 파일을 선택하세요</p>
        <p className="text-xs text-slate-500 mt-6">지원 포맷: JPG, PNG, WEBP, GIF, AVIF</p>
      </div>
    </div>
  );
};

export default ImageUploader;