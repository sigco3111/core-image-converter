import React, { useState, useCallback } from 'react';
import { ConversionSettings, OriginalImageFile, ConvertedImageFile, ConversionStatus, ImageFormat, ResizeMethod, ResizeMode } from './types';
import SettingsPanel from './components/SettingsPanel';
import ImageUploader from './components/ImageUploader';
import ImagePreviewList from './components/ImagePreviewList';
import { convertImage } from './services/imageProcessor';
import { createZip } from './services/zipService';

const App: React.FC = () => {
  const [settings, setSettings] = useState<ConversionSettings>({
    format: ImageFormat.JPEG,
    quality: 80,
    resize: {
      enabled: false,
      mode: ResizeMode.PIXELS,
      percentage: 100,
      width: 1024,
      height: 1024,
      method: ResizeMethod.CROP,
      backgroundColor: '#FFFFFF',
    },
    metadata: {
        preserve: true,
    },
  });

  const [originalFiles, setOriginalFiles] = useState<OriginalImageFile[]>([]);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedImageFile[]>([]);
  const [conversionStatus, setConversionStatus] = useState<ConversionStatus>(ConversionStatus.IDLE);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    resetState();
    const imageFiles = files.map(file => ({
      id: `${file.name}-${file.lastModified}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setOriginalFiles(imageFiles);
  };

  const handleConvert = useCallback(async () => {
    if (originalFiles.length === 0) return;

    setConversionStatus(ConversionStatus.CONVERTING);
    setError(null);
    setConvertedFiles([]);
    setConversionProgress(0);

    const newConvertedFiles: ConvertedImageFile[] = [];

    try {
      for (let i = 0; i < originalFiles.length; i++) {
        const original = originalFiles[i];
        const { blob, newName, originalName } = await convertImage(original.file, settings);
        
        newConvertedFiles.push({
          id: original.id,
          blob,
          originalName,
          newName,
          previewUrl: URL.createObjectURL(blob),
        });
        setConversionProgress(((i + 1) / originalFiles.length) * 100);
      }
      setConvertedFiles(newConvertedFiles);
      setConversionStatus(ConversionStatus.DONE);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(`변환 중 오류가 발생했습니다: ${errorMessage}`);
      setConversionStatus(ConversionStatus.ERROR);
    }
  }, [originalFiles, settings]);
  
  const handleDownloadAll = async () => {
    if (convertedFiles.length === 0) return;
    try {
      const zipBlob = await createZip(convertedFiles);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'converted_images.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
        console.error(err);
        setError('zip 파일 생성에 실패했습니다.');
    }
  };

  const resetState = () => {
    originalFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
    convertedFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
    setOriginalFiles([]);
    setConvertedFiles([]);
    setConversionStatus(ConversionStatus.IDLE);
    setConversionProgress(0);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-900 text-slate-100 font-sans">
      <header className="lg:hidden p-4 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 shadow-lg sticky top-0 z-20">
        <h1 className="text-2xl font-bold text-sky-400">코어 이미지 컨버터</h1>
      </header>

      <aside className="w-full lg:w-80 xl:w-96 p-6 bg-slate-800/80 border-r border-slate-700 flex-shrink-0">
        <div className="sticky top-6">
            <div className="hidden lg:block mb-8">
                <h1 className="text-3xl font-bold text-sky-400">Core Image Converter</h1>
                <p className="text-slate-400 mt-2 text-sm">Batch convert, resize, and compress images.</p>
            </div>
            <SettingsPanel settings={settings} onSettingsChange={setSettings} disabled={conversionStatus === ConversionStatus.CONVERTING}/>
            <div className="mt-8 space-y-4">
                <button
                    onClick={handleConvert}
                    disabled={originalFiles.length === 0 || conversionStatus === ConversionStatus.CONVERTING}
                    className="w-full bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-500 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg shadow-sky-600/20"
                >
                    {conversionStatus === ConversionStatus.CONVERTING ? `변환 중... ${Math.round(conversionProgress)}%` : `이미지 ${originalFiles.length}개 변환하기`}
                </button>
                 {convertedFiles.length > 0 && conversionStatus === ConversionStatus.DONE && (
                    <button
                        onClick={handleDownloadAll}
                        className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-500 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-600/20"
                    >
                        전체 다운로드 (.zip)
                    </button>
                )}
                 {(originalFiles.length > 0) && (
                    <button
                        onClick={resetState}
                        className="w-full bg-rose-600/80 text-white font-bold py-2 px-4 rounded-lg hover:bg-rose-500 transition-colors duration-300"
                    >
                        전체 지우기
                    </button>
                )}
            </div>
             {error && <p className="text-rose-400 mt-4 text-sm">{error}</p>}
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10">
        {originalFiles.length === 0 ? (
          <ImageUploader onFilesSelected={handleFilesSelected} />
        ) : (
          <ImagePreviewList 
            originalFiles={originalFiles}
            convertedFiles={convertedFiles}
            status={conversionStatus}
          />
        )}
      </main>
    </div>
  );
};

export default App;