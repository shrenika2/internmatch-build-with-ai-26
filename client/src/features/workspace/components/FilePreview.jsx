import React from 'react';

const FilePreview = ({ file, onCancel, progress, uploading }) => {
    if (!file) return null;

    const isImage = file.type.startsWith('image/');
    const size = (file.size / 1024 / 1024).toFixed(2); // MB

    return (
        <div className="bg-[#2b2d31] p-3 rounded-t-lg border-t border-[#1f2023] flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1e1f22] rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                {isImage ? (
                    <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-2xl">📄</span>
                )}
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-bold truncate">{file.name}</div>
                <div className="text-gray-400 text-xs">{size} MB</div>
                {uploading && (
                    <div className="w-full bg-gray-700 h-1 mt-1 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                )}
            </div>
            
            <button onClick={onCancel} className="text-red-400 hover:text-red-500 font-bold p-2">✕</button>
        </div>
    );
};

export default FilePreview;
