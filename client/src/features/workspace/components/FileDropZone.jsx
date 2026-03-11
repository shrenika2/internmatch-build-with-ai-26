import React, { useRef, useState } from 'react';

const FileDropZone = ({ onFileDrop, children }) => {
    const [isDragging, setIsDragging] = useState(false);
    const dragCounter = useRef(0);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;
        
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileDrop(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    return (
        <div 
            className="h-full relative"
            onDragEnter={handleDragEnter} 
            onDragLeave={handleDragLeave} 
            onDragOver={handleDragOver} 
            onDrop={handleDrop}
        >
            {isDragging && (
                <div className="absolute inset-0 bg-indigo-500/50 z-50 flex items-center justify-center border-4 border-dashed border-white m-4 rounded-xl pointer-events-none">
                    <div className="text-white font-bold text-2xl animate-bounce">
                        Upload to Community
                    </div>
                </div>
            )}
            {children}
        </div>
    );
};

export default FileDropZone;
