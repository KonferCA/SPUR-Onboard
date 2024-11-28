import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import type { SocialLink } from '@/types';

interface SocialLinksProps {
  value: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}

export const SocialLinks: React.FC<SocialLinksProps> = ({ value = [], onChange }) => {
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState<string>('');

  const validateUrl = (url: string): boolean => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleAdd = () => {
    if (!newUrl) {
      setError('Please enter a URL');
      return;
    }

    if (!validateUrl(newUrl)) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    const link: SocialLink = {
      id: Math.random().toString(36).substr(2, 9),
      url: newUrl,
    };
    onChange([...value, link]);
    setNewUrl('');
    setError('');
  };

  const handleRemove = (id: string) => {
    onChange(value.filter(link => link.id !== id));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUrl(e.target.value);
    setError(''); // Clear error when user starts typing
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-6">
      {/* Link List */}
      <div className="space-y-2">
        {value.map(link => (
          <div
            key={link.id}
            className="flex items-center gap-3 bg-gray-50 rounded-lg p-3"
          >
            {/* Link */}
            <div className="flex-grow">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 break-all"
              >
                {link.url}
              </a>
            </div>

            {/* Actions */}
            <button
              onClick={() => handleRemove(link.id)}
              className="p-1 text-gray-400 hover:text-red-500 flex-shrink-0"
            >
              <FiX size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Link Form */}
      <div className="space-y-2">
        <div className="text-sm font-medium">Paste link</div>
        <div>
          <input
            type="url"
            placeholder="Paste link here"
            value={newUrl}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base
              ${error ? 'border-red-500' : 'border-gray-300'}`}
          />
          {error && (
            <div className="mt-1 text-sm text-red-500">
              {error}
            </div>
          )}
        </div>
        <button
          onClick={handleAdd}
          disabled={!newUrl}
          className="w-full py-3 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          Save Link
        </button>
      </div>
    </div>
  );
}; 