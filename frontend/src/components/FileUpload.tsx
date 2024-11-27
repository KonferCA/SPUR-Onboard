import { useState, useRef } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';

interface FileUploadProps {
  onFilesChange?: (files: File[]) => void;
  children?: React.ReactNode;
  className?: string;
  maxSizeMB?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
    onFilesChange,
    children,
    className = '',
    maxSizeMB = 50
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // handle drag events
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragIn = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragOut = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    // handle file drop
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    // handle file selection
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            handleFiles(files);
        }
    };

    const handleFiles = (files: File[]) => {
        // check file types
        const validFiles = files.filter(file => 
            ['application/pdf', 'image/png', 'image/jpeg'].includes(file.type)
        );

        if (validFiles.length !== files.length) {
            alert('Only PDF, PNG and JPEG files are allowed');
            return;
        }

        // check file sizes
        const oversizedFiles = validFiles.filter(
            file => file.size > maxSizeMB * 1024 * 1024
        );

        if (oversizedFiles.length > 0) {
            alert(`Files must be smaller than ${maxSizeMB}MB`);
            return;
        }

        // update state and call onChange
        const newFiles = [...uploadedFiles, ...validFiles];
        setUploadedFiles(newFiles);
        
        if (onFilesChange) {
            onFilesChange(newFiles);
        }
    };

    const removeFile = (fileToRemove: File) => {
        const newFiles = uploadedFiles.filter(file => file !== fileToRemove);
        setUploadedFiles(newFiles);
        
        if (onFilesChange) {
            onFilesChange(newFiles);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className={`w-full ${className}`}>
            <div 
                className={`border-2 border-dashed rounded-lg p-6 ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                {children || (
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-3">
                            <FiUpload className="text-gray-400 text-2xl" />
                            <h3 className="text-sm font-medium">Drag and drop here</h3>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">or</p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                        >
                            Select File
                        </button>
                    </div>
                )}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.png,.jpeg,.jpg"
                    className="hidden"
                    multiple
                />
            </div>

            {/* File list */}
            {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file, index) => (
                        <div 
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium">{file.name}</span>
                                <span className="text-sm text-gray-500">
                                    {formatFileSize(file.size)}
                                </span>
                            </div>
                            <button
                                onClick={() => removeFile(file)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FiX />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export { FileUpload }; 