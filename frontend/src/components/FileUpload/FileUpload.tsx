import { uploadDocument, removeDocument } from '@/services/project';
import type { ProjectDocument } from '@/types/project';
import { useState, useRef } from 'react';
import {
    FiUpload,
    FiX,
    FiFile,
    FiImage,
    FiLoader,
    FiLink,
} from 'react-icons/fi';
import { useDebounceFn, useRandomId } from '@/hooks';
import { createPortal } from 'react-dom';
import { Button } from '@components';

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
    isUrl?: boolean;
    url?: string;
    id?: string;
}

/**
 * createUploadableFile is a helper function that extends a given File to be UploadableFile.
 */
export function createUploadableFile(
    file: File,
    metadata?: ProjectDocument,
    initialUploaded = false
): UploadableFile {
    return Object.assign(file, {
        uploaded: initialUploaded,
        metadata,
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });
}

/**
 * createUrlFile creates a File-like object from a URL string
 */
export function createUrlFile(url: string): UploadableFile {
    const filename = url.split('/').pop() || 'linked-file';

    const blob = new Blob([''], { type: 'application/octet-stream' });
    const file = new File([blob], filename) as UploadableFile;

    file.isUrl = true;
    file.url = url;
    file.id = `url-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return file;
}

interface FileUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFilesChange?: (files: UploadableFile[]) => void;
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

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
    isOpen,
    onClose,
    onFilesChange,
    maxSizeMB = 50,
    initialFiles = [],
    projectId,
    questionId,
    section,
    subSection,
    accessToken,
    accept = '.pdf,.png,.jpeg,.jpg,.svg',
    enableAutosave = false,
    limit = Number.POSITIVE_INFINITY,
}) => {
    const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload');
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFiles, setUploadedFiles] =
        useState<UploadableFile[]>(initialFiles);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [urlLink, setUrlLink] = useState('');
    const [urlError, setUrlError] = useState<string | null>(null);
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
                        if (file.isUrl && file.url) {
                            // TODO: Implement URL upload logic (endpoint?)
                            file.uploaded = true;
                            return file;
                        }

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
        if (files.length + uploadedFiles.length > limit) {
            // truncate file list
            // biome-ignore lint/style/noParameterAssign: reassigning it because it is better than creating a new variable in this case
            files = files.slice(0, limit - uploadedFiles.length);
            setError(`You can upload a maximum of ${limit} files`);
        }

        // check file types
        const validFiles = files.filter((file) => {
            const fileType = file.type.toLowerCase();
            return (
                fileType === 'application/pdf' ||
                fileType === 'image/png' ||
                fileType === 'image/jpeg' ||
                fileType === 'image/jpg' ||
                fileType === 'image/svg+xml'
            );
        });

        if (validFiles.length !== files.length) {
            setError('Only PDF, SVG, PNG and JPEG files are allowed');
            return;
        }

        // check file sizes
        const oversizedFiles = validFiles.filter(
            (file) => file.size > maxSizeMB * 1024 * 1024
        );

        if (oversizedFiles.length > 0) {
            setError(`Files must be smaller than ${maxSizeMB}MB`);
            return;
        }

        setError(null);
        const newFiles = validFiles.map((f) => createUploadableFile(f));

        // Track new files for autosave
        if (enableAutosave) {
            pendingChangesRef.current.adds.push(...newFiles);
            setUploadedFiles((prev) => [...prev, ...newFiles]);
            autosave();
        } else if (onFilesChange) {
            setUploadedFiles((prev) => [...prev, ...newFiles]);
        }
    };

    const validateUrl = (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    };

    const handleSubmitLink = () => {
        if (!urlLink) {
            setUrlError('Please enter a URL');
            return;
        }

        if (!validateUrl(urlLink)) {
            setUrlError('Please enter a valid URL');
            return;
        }

        setUrlError(null);

        const urlFile = createUrlFile(urlLink);

        if (enableAutosave) {
            pendingChangesRef.current.adds.push(urlFile);
            setUploadedFiles((prev) => [...prev, urlFile]);
            autosave();
        } else {
            setUploadedFiles((prev) => [...prev, urlFile]);
        }

        setUrlLink('');
    };

    const removeFile = (fileToRemove: UploadableFile) => {
        const newFiles = uploadedFiles.filter((file) => file !== fileToRemove);

        if (enableAutosave && fileToRemove.metadata?.id) {
            pendingChangesRef.current.removes.push(fileToRemove);
            setUploadedFiles(newFiles);
            autosave();
        } else {
            setUploadedFiles(newFiles);
        }
    };

    const renderFilePreview = (file: UploadableFile) => {
        if (file.isUrl && file.url) {
            return (
                <div className="relative flex flex-col items-center justify-center w-24 h-24 bg-gray-50 rounded-md">
                    <FiLink className="text-3xl text-gray-500 mb-1" />
                    <span className="text-xs text-gray-700 truncate max-w-[80px]">
                        {file.name}
                    </span>
                </div>
            );
        }

        const fileType = file.type.toLowerCase();

        if (fileType.includes('image')) {
            return (
                <div className="relative w-24 h-24 overflow-hidden bg-gray-50 rounded-md flex items-center justify-center text-sm">
                    <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-full object-cover"
                    />
                </div>
            );
        }

        if (fileType === 'application/pdf') {
            return (
                <div className="relative flex flex-col items-center justify-center w-24 h-24 bg-gray-50 rounded-md">
                    <FiFile className="text-3xl text-gray-500 mb-1" />
                    <span className="text-xs text-gray-700 truncate max-w-[80px]">
                        {file.name}
                    </span>
                </div>
            );
        }

        return (
            <div className="relative flex items-center justify-center w-24 h-24 bg-gray-50 rounded-md">
                <FiFile className="text-3xl text-gray-500" />
            </div>
        );
    };

    const handleFinish = () => {
        if (onFilesChange) {
            onFilesChange(uploadedFiles);
        }
        onClose();
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-xl font-semibold">Upload a file</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FiX className="text-xl" />
                    </button>
                </div>

                <div className="flex px-6 pt-4">
                    <Button
                        onClick={() => setActiveTab('upload')}
                        size="sm"
                        variant={
                            activeTab === 'upload' ? 'primary' : 'secondary'
                        }
                        className="mr-2 rounded-lg"
                    >
                        Upload
                    </Button>

                    <Button
                        onClick={() => setActiveTab('link')}
                        size="sm"
                        variant={activeTab === 'link' ? 'primary' : 'secondary'}
                        className="rounded-lg"
                    >
                        Link
                    </Button>
                </div>

                <div className="flex-1 p-6 overflow-y-auto min-h-[300px]">
                    {activeTab === 'upload' ? (
                        <div>
                            <div
                                className={`border border-dashed rounded-lg ${
                                    isDragging
                                        ? 'border-blue-500 bg-blue-50'
                                        : error
                                          ? 'border-red-300 bg-red-50'
                                          : 'border-orange-300'
                                } ${uploadedFiles.length > 0 ? 'p-4' : 'p-8'}`}
                                onDragEnter={handleDragIn}
                                onDragLeave={handleDragOut}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                <div className="text-center">
                                    <div className="flex flex-col items-center justify-center">
                                        <FiUpload className="text-gray-400 text-2xl mb-2" />
                                        <p className="text-sm">
                                            Drag and drop here
                                        </p>
                                        <p className="text-sm text-gray-500 my-2">
                                            or
                                        </p>
                                        <Button
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                            variant="primary"
                                            size="sm"
                                            className="mt-2"
                                            disabled={isProcessing}
                                        >
                                            Select File
                                        </Button>
                                    </div>
                                </div>
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

                            {error && (
                                <p className="text-sm text-red-500 mt-2">
                                    {error}
                                </p>
                            )}

                            <p className="text-xs text-gray-500 mt-2">
                                Accepted file types: PDF, SVG, PNG, JPEG.
                                Maximum {maxSizeMB}MB per file.
                            </p>

                            {uploadedFiles.length > 0 && (
                                <div className="mt-4">
                                    <div className="flex flex-wrap gap-4">
                                        {uploadedFiles.map((file) => (
                                            <div
                                                key={
                                                    file.id ||
                                                    `file-${file.name}-${file.size}`
                                                }
                                                className="relative"
                                            >
                                                {renderFilePreview(file)}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeFile(file)
                                                    }
                                                    className="absolute -top-2 -right-2 bg-white text-gray-600 rounded-full p-1 shadow-sm hover:bg-gray-100 border border-gray-300"
                                                    disabled={isProcessing}
                                                >
                                                    <FiX size={14} />
                                                </button>

                                                {isProcessing &&
                                                    pendingChangesRef.current.adds.includes(
                                                        file
                                                    ) && (
                                                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                                            <FiLoader
                                                                className="animate-spin text-blue-500"
                                                                size={24}
                                                            />
                                                        </div>
                                                    )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            <div className="mb-4">
                                <h3 className="text-sm font-medium mb-2">
                                    Paste URL link
                                </h3>
                                <div className="flex">
                                    <input
                                        type="text"
                                        value={urlLink}
                                        onChange={(e) =>
                                            setUrlLink(e.target.value)
                                        }
                                        placeholder="https://example.com/document.pdf"
                                        className="flex-grow border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    />

                                    <Button
                                        onClick={handleSubmitLink}
                                        variant="primary"
                                        className="rounded-l-none"
                                        size="sm"
                                    >
                                        Add Link
                                    </Button>
                                </div>

                                {urlError && (
                                    <p className="text-sm text-red-500 mt-2">
                                        {urlError}
                                    </p>
                                )}
                            </div>

                            {uploadedFiles.filter((f) => f.isUrl).length >
                                0 && (
                                <div className="mt-4">
                                    <h3 className="text-sm font-medium mb-2">
                                        Added Links
                                    </h3>

                                    <div className="flex flex-wrap gap-4">
                                        {uploadedFiles
                                            .filter((f) => f.isUrl)
                                            .map((file) => (
                                                <div
                                                    key={file.id || file.url}
                                                    className="relative"
                                                >
                                                    {renderFilePreview(file)}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeFile(file)
                                                        }
                                                        className="absolute -top-2 -right-2 bg-white text-gray-600 rounded-full p-1 shadow-sm hover:bg-gray-100 border border-gray-300"
                                                        disabled={isProcessing}
                                                    >
                                                        <FiX size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex-1" />
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
                    <Button
                        onClick={handleFinish}
                        disabled={isProcessing || uploadedFiles.length === 0}
                        variant="primary"
                        size="sm"
                    >
                        {activeTab === 'upload' ? 'Upload Files' : 'Add Links'}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export interface FileUploadButtonProps {
    label?: string;
    onFilesChange?: (files: UploadableFile[]) => void;
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
    buttonText?: string;
    disabled?: boolean;
}

export type FileUploadProps = FileUploadButtonProps;

export const FileUpload: React.FC<FileUploadButtonProps> = ({
    label,
    onFilesChange,
    className = '',
    maxSizeMB = 50,
    initialFiles = [],
    projectId,
    questionId,
    section,
    subSection,
    accessToken,
    accept = '.pdf,.png,.jpeg,.jpg,.svg',
    enableAutosave = false,
    limit = Number.POSITIVE_INFINITY,
    buttonText = 'Upload Files',
    disabled = false,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [files, setFiles] = useState<UploadableFile[]>(initialFiles);
    const fileListId = useRandomId();

    const handleFilesChange = (newFiles: UploadableFile[]) => {
        setFiles(newFiles);

        if (onFilesChange) {
            onFilesChange(newFiles);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) {
            return bytes + ' B';
        }

        if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(1) + ' KB';
        }

        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleRemoveFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);

        if (onFilesChange) {
            onFilesChange(newFiles);
        }
    };

    const renderFileType = (file: UploadableFile) => {
        if (file.isUrl) {
            return <FiLink className="text-gray-500" />;
        }

        if (file.type.includes('image')) {
            return <FiImage className="text-gray-500" />;
        }

        return <FiFile className="text-gray-500" />;
    };

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label
                    htmlFor={fileListId}
                    className="block mb-2 text-sm font-medium"
                >
                    {label}
                </label>
            )}

            <div className="flex flex-col space-y-4">
                <Button
                    type="button"
                    variant="primary"
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2"
                    disabled={disabled}
                >
                    <FiUpload className="text-current" />
                    {buttonText}
                </Button>

                {files.length > 0 && (
                    <div className="mt-2" id={fileListId}>
                        <h3 className="text-sm font-medium mb-2">
                            Uploaded Files
                        </h3>
                        <div className="space-y-2">
                            {files.map((file, index) => (
                                <div
                                    key={file.id || `${file.name}-${index}`}
                                    className="flex items-center p-3 bg-gray-50 rounded-md gap-3"
                                >
                                    {renderFileType(file)}
                                    <div>
                                        <div className="text-sm font-medium">
                                            {file.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {file.isUrl
                                                ? file.url
                                                : formatFileSize(file.size)}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveFile(index)}
                                        className="ml-auto text-gray-400 hover:text-gray-600"
                                    >
                                        <FiX />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <FileUploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onFilesChange={handleFilesChange}
                maxSizeMB={maxSizeMB}
                initialFiles={files}
                projectId={projectId}
                questionId={questionId}
                section={section}
                subSection={subSection}
                accessToken={accessToken}
                accept={accept}
                enableAutosave={enableAutosave}
                limit={limit}
            />
        </div>
    );
};
