import { useState, useRef } from 'react';
import { FiUpload } from 'react-icons/fi';

interface FileUploadProps {
  onFilesChange?: (files: File[]) => void;
  children?: React.ReactNode;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
    onFilesChange,
    children,
    className = ''
}) => {
    const [isDragging, setIsDragging] = useState(false);
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
        const validFiles = files.filter(file => 
            ['application/pdf', 'image/png', 'image/jpeg'].includes(file.type)
        );

        if (validFiles.length !== files.length) {
            alert('only pdf, png and jpeg files are allowed');
        }

        if (validFiles.length > 0 && onFilesChange) {
            onFilesChange(validFiles);
        }
    };

    return (
        <div className={`w-full max-w-2xl mx-auto p-4 ${className}`}>
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
                    <div>
                        <div className="flex items-center justify-center gap-3">
                            <FiUpload className="text-gray-400 text-2xl" />
                            <h3 className="text-lg font-medium">Drag and drop here</h3>
                        </div>
                        <div className="text-center mt-2">
                            <p className="text-gray-500">or</p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            >
                                Select File
                            </button>
                            <p className="mt-2 text-sm text-gray-500">
                                Accepted file types: PDF, PNG, JPEG
                            </p>
                        </div>
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
        </div>
    );
};

export { FileUpload }; 