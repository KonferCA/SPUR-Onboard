import { ReactNode } from 'react';
import { IoClose } from 'react-icons/io5';

interface InfoCardProps {
    icon?: ReactNode;
    text: string;
    subtext?: string;
    onRemove?: () => void;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, text, subtext, onRemove }) => {
    return (
        <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-sm">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <div className="flex-grow">
                <span className="font-medium">{text}</span>
                {subtext && (
                    <span className="text-gray-400 ml-2 text-sm">{subtext}</span>
                )}
            </div>
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="text-red-500 hover:text-red-700"
                    aria-label="remove"
                >
                    <IoClose size={20} />
                </button>
            )}
        </div>
    );
};

export { InfoCard }; 