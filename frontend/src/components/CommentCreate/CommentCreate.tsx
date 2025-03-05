import React, { useState, useCallback } from 'react';
import { 
    BiLink,
    BiBold,
    BiItalic,
    BiListUl,
    BiListOl,
    BiDotsVerticalRounded
} from 'react-icons/bi';

export interface CommentCreateProps {
    onSubmit?: (comment: string) => void;
    onCancel?: () => void;
    initialValue?: string;
    className?: string;
}

export const CommentCreate: React.FC<CommentCreateProps> = ({
    onSubmit,
    onCancel,
    initialValue = '',
    className = '',
}) => {
    const [text, setText] = useState(initialValue);
    const [selectionStart, setSelectionStart] = useState(0);
    const [selectionEnd, setSelectionEnd] = useState(0);

    const handleTextSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
        const textarea = e.currentTarget;
        setSelectionStart(textarea.selectionStart);
        setSelectionEnd(textarea.selectionEnd);
    };

    const formatText = useCallback((wrapWith: string) => {
        const before = text.substring(0, selectionStart);
        const selected = text.substring(selectionStart, selectionEnd);
        const after = text.substring(selectionEnd);

        if (wrapWith === '- ' || wrapWith === '1. ') {
            const formattedText = selected.split('\n').map(line => `${wrapWith}${line}`).join('\n');
            setText(`${before}${formattedText}${after}`);
        } else {
            setText(`${before}${wrapWith}${selected}${wrapWith}${after}`);
        }
    }, [text, selectionStart, selectionEnd]);

    const handleSubmit = () => {
        if (text.trim() && onSubmit) {
            onSubmit(text);
            setText('');
        }
    };

    return (
        <div className={`w-full max-w-2xl bg-white rounded-lg shadow ${className}`}>
            <div className="p-4">                
                <div className="border rounded-lg">
                    <div className="flex items-center gap-1 border-b">
                        <h2 className="font-normal p-4">Comment</h2>

                        <div className="flex gap-1 ml-auto">
                            <button 
                                onClick={() => formatText('[')}
                                className="p-2 hover:bg-gray-100 rounded"
                                aria-label="Insert link"
                            >
                                <BiLink className="w-5 h-5 text-gray-600" />
                            </button>
                            <button 
                                onClick={() => formatText('**')}
                                className="p-2 hover:bg-gray-100 rounded"
                                aria-label="Bold text"
                            >
                                <BiBold className="w-5 h-5 text-gray-600" />
                            </button>
                            <button 
                                onClick={() => formatText('_')}
                                className="p-2 hover:bg-gray-100 rounded"
                                aria-label="Italic text"
                            >
                                <BiItalic className="w-5 h-5 text-gray-600" />
                            </button>
                            <button 
                                onClick={() => formatText('- ')}
                                className="p-2 hover:bg-gray-100 rounded"
                                aria-label="Bullet list"
                            >
                                <BiListUl className="w-5 h-5 text-gray-600" />
                            </button>
                            <button 
                                onClick={() => formatText('1. ')}
                                className="p-2 hover:bg-gray-100 rounded"
                                aria-label="Numbered list"
                            >
                                <BiListOl className="w-5 h-5 text-gray-600" />
                            </button>
                            <button 
                                className="p-2 hover:bg-gray-100 rounded"
                                aria-label="More options"
                            >
                                <BiDotsVerticalRounded className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    <textarea
                        placeholder="Start writing"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onSelect={handleTextSelect}
                        className="w-full p-4 min-h-[150px] focus:outline-none resize-none"
                        aria-label="Comment text"
                    />
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={onCancel}
                        className="text-sm px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md border border-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="text-sm px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                        Add Comment
                    </button>
                </div>
            </div>
        </div>
    );
};