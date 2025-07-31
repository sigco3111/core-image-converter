
import React from 'react';
import { ConversionSettings, ImageFormat, ResizeMethod, ResizeMode } from '../types';

interface SettingsPanelProps {
  settings: ConversionSettings;
  onSettingsChange: (newSettings: ConversionSettings) => void;
  disabled: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange, disabled }) => {
  const handleSettingChange = <K extends keyof ConversionSettings>(key: K, value: ConversionSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };
  
  const handleResizeChange = <K extends keyof ConversionSettings['resize']>(key: K, value: ConversionSettings['resize'][K]) => {
    onSettingsChange({
      ...settings,
      resize: { ...settings.resize, [key]: value },
    });
  };

  const handleMetadataChange = <K extends keyof ConversionSettings['metadata']>(key: K, value: ConversionSettings['metadata'][K]) => {
    onSettingsChange({
      ...settings,
      metadata: { ...settings.metadata, [key]: value },
    });
  };

  const isQualitySupported = settings.format === ImageFormat.JPEG || settings.format === ImageFormat.WEBP || settings.format === ImageFormat.AVIF;
  const isMetadataSupported = settings.format === ImageFormat.JPEG;
  
  const isPixelsMode = settings.resize.mode === ResizeMode.PIXELS;
  const showWidthInput = !isPixelsMode || settings.resize.method !== ResizeMethod.RESIZE_HEIGHT;
  const showHeightInput = !isPixelsMode || settings.resize.method !== ResizeMethod.RESIZE_WIDTH;


  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="format" className="block text-sm font-medium text-slate-300 mb-2">
          출력 포맷
        </label>
        <select
          id="format"
          value={settings.format}
          onChange={(e) => handleSettingChange('format', e.target.value as ImageFormat)}
          disabled={disabled}
          className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
        >
          <option value={ImageFormat.JPEG}>JPEG</option>
          <option value={ImageFormat.PNG}>PNG</option>
          <option value={ImageFormat.WEBP}>WEBP</option>
          <option value={ImageFormat.GIF}>GIF</option>
          <option value={ImageFormat.AVIF}>AVIF</option>
        </select>
      </div>

      {isQualitySupported && (
        <div>
          <label htmlFor="quality" className="block text-sm font-medium text-slate-300 mb-2">
            품질 ({settings.quality}%)
          </label>
          <input
            id="quality"
            type="range"
            min="1"
            max="100"
            value={settings.quality}
            onChange={(e) => handleSettingChange('quality', parseInt(e.target.value, 10))}
            disabled={disabled}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
          />
        </div>
      )}

      {isMetadataSupported && (
          <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg animate-fade-in">
              <div>
                  <label htmlFor="preserve-metadata" className="font-medium text-slate-200">
                      EXIF 메타데이터 보존
                  </label>
                   <p className="text-xs text-slate-400 mt-1">원본 JPEG의 카메라, 위치 정보 등을 유지합니다.</p>
              </div>
              <input
                  id="preserve-metadata"
                  type="checkbox"
                  checked={settings.metadata.preserve}
                  onChange={(e) => handleMetadataChange('preserve', e.target.checked)}
                  disabled={disabled}
                  className="h-5 w-5 rounded border-slate-500 text-sky-600 focus:ring-sky-500 bg-slate-700 cursor-pointer"
              />
          </div>
      )}

      <div className="relative border border-slate-700 rounded-lg p-4 pt-2">
        <div className="flex items-center">
            <input
                id="resize-enabled"
                type="checkbox"
                checked={settings.resize.enabled}
                onChange={(e) => handleResizeChange('enabled', e.target.checked)}
                disabled={disabled}
                className="h-4 w-4 rounded border-slate-500 text-sky-600 focus:ring-sky-500 bg-slate-700"
            />
            <label htmlFor="resize-enabled" className="ml-3 block text-md font-medium text-slate-200">
                이미지 크기 조절
            </label>
        </div>

        {settings.resize.enabled && (
            <div className="mt-4 space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-700 p-1">
                    <button 
                        onClick={() => handleResizeChange('mode', ResizeMode.PIXELS)}
                        disabled={disabled}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors disabled:cursor-not-allowed ${settings.resize.mode === ResizeMode.PIXELS ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-600/50'}`}
                    >
                        픽셀
                    </button>
                    <button
                        onClick={() => handleResizeChange('mode', ResizeMode.PERCENTAGE)}
                        disabled={disabled}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors disabled:cursor-not-allowed ${settings.resize.mode === ResizeMode.PERCENTAGE ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-600/50'}`}
                    >
                        백분율
                    </button>
                </div>

                {settings.resize.mode === ResizeMode.PIXELS && (
                    <div className="space-y-4 animate-fade-in">
                        <div className={`grid gap-4 ${showWidthInput && showHeightInput ? 'grid-cols-2' : 'grid-cols-1'}`}>
                            {showWidthInput && (
                                <div>
                                    <label htmlFor="width" className="block text-xs font-medium text-slate-400">너비</label>
                                    <input
                                        type="number"
                                        id="width"
                                        value={settings.resize.width}
                                        onChange={(e) => handleResizeChange('width', parseInt(e.target.value, 10) || 0)}
                                        disabled={disabled}
                                        className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500 sm:text-sm"
                                    />
                                </div>
                            )}
                            {showHeightInput && (
                                <div>
                                    <label htmlFor="height" className="block text-xs font-medium text-slate-400">높이</label>
                                    <input
                                        type="number"
                                        id="height"
                                        value={settings.resize.height}
                                        onChange={(e) => handleResizeChange('height', parseInt(e.target.value, 10) || 0)}
                                        disabled={disabled}
                                        className="mt-1 block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500 sm:text-sm"
                                    />
                                </div>
                            )}
                        </div>
                        <div>
                            <label htmlFor="resize-method" className="block text-xs font-medium text-slate-400 mb-1">방식</label>
                            <select
                                id="resize-method"
                                value={settings.resize.method}
                                onChange={(e) => handleResizeChange('method', e.target.value as ResizeMethod)}
                                disabled={disabled}
                                className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                            >
                                <option value={ResizeMethod.CROP}>크기에 맞춰 자르기</option>
                                <option value={ResizeMethod.STRETCH}>크기에 맞춰 늘리기</option>
                                <option value={ResizeMethod.FIT}>비율 유지 (여백)</option>
                                <option value={ResizeMethod.RESIZE_WIDTH}>너비에 맞추기 (비율 유지)</option>
                                <option value={ResizeMethod.RESIZE_HEIGHT}>높이에 맞추기 (비율 유지)</option>
                            </select>
                        </div>
                         {settings.resize.method === ResizeMethod.FIT && (
                            <div className="animate-fade-in">
                                <label htmlFor="bg-color-text" className="block text-xs font-medium text-slate-400 mb-1">여백 색상</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        id="bg-color-picker"
                                        type="color"
                                        value={settings.resize.backgroundColor}
                                        onChange={(e) => handleResizeChange('backgroundColor', e.target.value)}
                                        disabled={disabled}
                                        className="h-10 w-12 cursor-pointer p-1 bg-slate-700 border border-slate-600 rounded-md"
                                    />
                                    <input
                                        id="bg-color-text"
                                        type="text"
                                        value={settings.resize.backgroundColor}
                                        onChange={(e) => handleResizeChange('backgroundColor', e.target.value)}
                                        placeholder="#FFFFFF"
                                        disabled={disabled}
                                        className="block w-full bg-slate-700 border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-sky-500 sm:text-sm font-mono"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {settings.resize.mode === ResizeMode.PERCENTAGE && (
                    <div className="space-y-3 animate-fade-in">
                        <label htmlFor="percentage" className="block text-sm font-medium text-slate-300">
                            크기 비율 ({settings.resize.percentage}%)
                        </label>
                         <input
                            id="percentage"
                            type="range"
                            min="1"
                            max="200"
                            step="1"
                            value={settings.resize.percentage}
                            onChange={(e) => handleResizeChange('percentage', parseInt(e.target.value, 10))}
                            disabled={disabled}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                          />
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;