import { useState, useRef } from 'react';
import { FiUpload } from 'react-icons/fi';
import { InfoCard } from './InfoCard';

interface UploadedFile {
    name: string;
    size: string;
}

const FileUpload: React.FC = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
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

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const handleFiles = (files: File[]) => {
        files.forEach(file => {
            if (!['application/pdf', 'image/png', 'image/jpeg'].includes(file.type)) {
                alert('only pdf, png and jpeg files are allowed');
                return;
            }
            
            setUploadedFiles(prev => [...prev, {
                name: file.name,
                size: formatFileSize(file.size)
            }]);
        });
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <div 
                className={`border-2 border-dashed rounded-lg p-6 ${
                    isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
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
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".pdf,.png,.jpeg,.jpg"
                        className="hidden"
                        multiple
                    />
                    <p className="mt-2 text-sm text-gray-500">
                        Accepted file types: PDF, PNG, JPEG
                    </p>
                </div>
            </div>

            {/* uploaded files list */}
            <div className="mt-4 space-y-2">
                {uploadedFiles.map((file, index) => (
                    <InfoCard
                        key={index}
                        icon={<FiUpload />}
                        text={file.name}
                        subtext={file.size}
                        onRemove={() => removeFile(index)}
                    />
                ))}
            </div>
        </div>
    );
};

export { FileUpload }; 