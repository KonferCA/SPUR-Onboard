import {
    uploadDocument,
    removeDocument,
} from '@/services/project';
import type { ProjectDocument } from '@/types/project';
import { useState, useRef } from 'react';
import { FiUpload, FiX, FiLoader, FiCheck } from 'react-icons/fi';
import { useDebounceFn, useRandomId } from '@/hooks';

/**
 * UploadableFile is to be able to differentiate between newly added files and already uploaded files.
 * When documents are fetched from the database, the 'uploaded' field will be set to true, otherwise
 * it will be undefined.
 *
 * This type extends File to make it compatible with the browser file picker and handling of it.
 */
export interface UploadableFile extends File {
    uploaded?: boolean;
    metadata?: ProjectDocument;
}

/**
 * createUploadableFile is a helper function that extends a given File to be UploadableFile.
 */
export function createUploadableFile(
    file: File,
    metadata?: ProjectDocument,
    initialUploaded = false
): UploadableFile {
    return Object.assign(file, { uploaded: initialUploaded, metadata });
}

export interface FileUploadProps {
    label?: string;
    onFilesChange?: (files: UploadableFile[]) => void;
    children?: React.ReactNode;
    className?: string;
    maxSizeMB?: number;
    initialFiles?: UploadableFile[];
    projectId?: string;
    questionId?: string;
    section?: string;
    subSection?: string;
    accessToken?: string;
    enableAutosave?: boolean;
    limit?: number;
    accept?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
    label,
    onFilesChange,
    children,
    className = '',
    maxSizeMB = 50,
    initialFiles = [],
    projectId,
    questionId,
    section,
    subSection,
    accessToken,
    accept = '.pdf,.png,.jpeg,.jpg',
    enableAutosave = false,
    limit = Number.POSITIVE_INFINITY,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFiles, setUploadedFiles] =
        useState<UploadableFile[]>(initialFiles);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pendingChangesRef = useRef<{
        adds: UploadableFile[];
        removes: UploadableFile[];
    }>({
        adds: [],
        removes: [],
    });

    const inputID = useRandomId();

    // Autosave function
    const autosave = useDebounceFn(
        async () => {
            if (!enableAutosave || !projectId || !accessToken) return;

            setIsProcessing(true);
            setError(null);

            try {
                // Handle removals
                await Promise.all(
                    pendingChangesRef.current.removes.map(async (file) => {
                        if (file.metadata?.id) {
                            await removeDocument(accessToken, {
                                projectId,
                                documentId: file.metadata.id,
                            });
                        }
                    })
                );

                // Handle additions
                const uploadResults = await Promise.all(
                    pendingChangesRef.current.adds.map(async (file) => {
                        const response = await uploadDocument(accessToken, {
                            projectId,
                            file,
                            questionId: questionId || '',
                            name: file.name,
                            section: section || '',
                            subSection: subSection || '',
                        });
                        file.metadata = response;
                        file.uploaded = true;
                        return file;
                    })
                );

                // Clear pending changes and update state
                pendingChangesRef.current = { adds: [], removes: [] };
                if (onFilesChange) {
                    onFilesChange(
                        uploadedFiles
                            .filter(
                                (f) =>
                                    !pendingChangesRef.current.removes.includes(
                                        f
                                    )
                            )
                            .concat(uploadResults)
                    );
                }
            } catch (e) {
                setError('Failed to save file changes. Please try again.');
            } finally {
                setIsProcessing(false);
            }
        },
        500,
        [projectId, questionId, section, subSection, accessToken]
    );

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
        if (files.length > limit) {
            // truncate file list
            // biome-ignore lint/style/noParameterAssign: reassigning it because it is better than creating a new variable in this case
            files = files.slice(0, limit);
        }

        // check file types
        const validFiles = files.filter((file) =>
            ['application/pdf', 'image/png', 'image/jpeg'].includes(file.type)
        );

        if (validFiles.length !== files.length) {
            alert('Only PDF, PNG and JPEG files are allowed');
            return;
        }

        // check file sizes
        const oversizedFiles = validFiles.filter(
            (file) => file.size > maxSizeMB * 1024 * 1024
        );

        if (oversizedFiles.length > 0) {
            alert(`Files must be smaller than ${maxSizeMB}MB`);
            return;
        }

        const newFiles = validFiles.map((f) => createUploadableFile(f));

        // Track new files for autosave
        if (enableAutosave) {
            pendingChangesRef.current.adds.push(...newFiles);
            setUploadedFiles([...uploadedFiles, ...newFiles]);
            autosave();
        } else if (onFilesChange) {
            onFilesChange([...uploadedFiles, ...newFiles]);
        }
    };

    const removeFile = (fileToRemove: File) => {
        const newFiles = uploadedFiles.filter((file) => file !== fileToRemove);

        if (enableAutosave && (fileToRemove as UploadableFile).metadata?.id) {
            pendingChangesRef.current.removes.push(
                fileToRemove as UploadableFile
            );
            setUploadedFiles(newFiles);
            autosave();
        } else if (onFilesChange) {
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
            {label !== '' && (
                <div className="mb-1">
                    <label htmlFor={inputID}>{label}</label>
                </div>
            )}
            <div
                className={`border-2 border-dashed rounded-lg p-6 ${
                    isDragging
                        ? 'border-blue-500 bg-blue-50'
                        : error
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300'
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
                            <h3 className="text-sm font-medium">
                                Drag and drop here
                            </h3>
                        </div>
                        {error && (
                            <p className="text-sm text-red-500 mt-2">{error}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">or</p>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                            disabled={isProcessing}
                        >
                            Select File
                        </button>
                    </div>
                )}
                <input
                    id={inputID}
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept={accept}
                    className="hidden"
                    multiple
                    disabled={isProcessing}
                />
            </div>

            {/* File list */}
            {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file) => (
                        <div
                            key={file.name}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium">
                                    {file.name}
                                </span>
                                <span className="text-sm text-gray-500">
                                    {formatFileSize(file.size)}
                                </span>
                                {isProcessing &&
                                    pendingChangesRef.current.adds.includes(
                                        file
                                    ) && (
                                        <FiLoader className="animate-spin text-blue-500" />
                                    )}
                                {file.uploaded && (
                                    <FiCheck className="text-green-500" />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => removeFile(file)}
                                className="text-gray-400 hover:text-gray-600"
                                disabled={isProcessing}
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
