import { useState, useCallback } from 'react';
import axios from 'axios';

export const useFileUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);

    const uploadFile = async (file) => {
        setUploading(true);
        setProgress(0);
        setError(null);
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const res = await axios.post(`${apiUrl}/workspace/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(percent);
                }
            });
            return res.data; // { url, name, type }
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setUploading(false);
        }
    };

    return { uploadFile, uploading, progress, error };
};
