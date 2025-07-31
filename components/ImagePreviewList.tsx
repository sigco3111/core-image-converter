
import React from 'react';
import { OriginalImageFile, ConvertedImageFile, ConversionStatus } from '../types';
import CheckCircleIcon from './icons/CheckCircleIcon';
import XCircleIcon from './icons/XCircleIcon';
import DownloadIcon from './icons/DownloadIcon';

interface ImagePreviewListProps {
    originalFiles: OriginalImageFile[];
    convertedFiles: ConvertedImageFile[];
    status: ConversionStatus;
}

const ImagePreviewList: React.FC<ImagePreviewListProps> = ({ originalFiles, convertedFiles, status }) => {
    
    const findConvertedFile = (id: string) => convertedFiles.find(cf => cf.id === id);

    const handleDownload = (e: React.MouseEvent, file: ConvertedImageFile) => {
        e.preventDefault();
        const a = document.createElement('a');
        a.href = file.previewUrl;
        a.download = file.newName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {originalFiles.map(originalFile => {
                const convertedFile = findConvertedFile(originalFile.id);
                const isConvertingThisFile = status === ConversionStatus.CONVERTING && !convertedFile;

                return (
                    <div key={originalFile.id} className="bg-slate-800 rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:-translate-y-1">
                        <div className="relative aspect-square w-full">
                           <img src={convertedFile ? convertedFile.previewUrl : originalFile.previewUrl} alt={originalFile.file.name} className="w-full h-full object-cover"/>
                           {isConvertingThisFile && (
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                    <div className="w-16 h-16 border-4 border-t-sky-500 border-slate-600 rounded-full animate-spin"></div>
                                </div>
                           )}
                           {convertedFile && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3">
                                   <CheckCircleIcon className="w-8 h-8 text-emerald-400 drop-shadow-lg"/>
                                    <a
                                        href={convertedFile.previewUrl}
                                        download={convertedFile.newName}
                                        onClick={(e) => handleDownload(e, convertedFile)}
                                        className="p-2 bg-sky-600/80 rounded-full text-white hover:bg-sky-500 transition-all backdrop-blur-sm"
                                    >
                                        <DownloadIcon className="w-5 h-5"/>
                                    </a>
                                </div>
                           )}
                            {status === ConversionStatus.ERROR && !convertedFile && (
                                <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-3">
                                   <XCircleIcon className="w-8 h-8 text-rose-500"/>
                                </div>
                           )}
                        </div>
                        <div className="p-3 bg-slate-800">
                             <p className="text-xs text-slate-300 truncate font-mono" title={originalFile.file.name}>{originalFile.file.name}</p>
                             {convertedFile && <p className="text-xs text-sky-400 truncate font-mono" title={convertedFile.newName}>-&gt; {convertedFile.newName}</p>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ImagePreviewList;
