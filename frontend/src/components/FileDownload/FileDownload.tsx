import type { FC } from 'react';
import type { ProjectDocument } from '@/services/project';
import { FaFile } from 'react-icons/fa';

export interface FileDownloadProps {
    docs: ProjectDocument[];
}

export const FileDownload: FC<FileDownloadProps> = ({ docs }) => {
    return (
        <div className="flex items-center flex-wrap gap-4">
            {docs.map((d) => (
                <a
                    key={d.id}
                    href={d.url}
                    download
                    target="_blank"
                    className="px-6 py-4 rounded-lg border border-gray-300 bg-gray-100" rel="noreferrer"
                >
                    <div className="flex items-center justify-center gap-2">
                        <FaFile />
                        <span>{d.name}</span>
                    </div>
                </a>
            ))}
        </div>
    );
};
