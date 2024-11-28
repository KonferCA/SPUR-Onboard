import React from 'react';

interface DateInputProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
}

export const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  required,
  placeholder
}) => {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <label className="block text-sm font-medium text-gray-900">
            {label}
          </label>
          {required && (
            <span className="text-sm text-gray-500">
              Required
            </span>
          )}
        </div>
      )}
      <div className="relative">
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
        />
      </div>
    </div>
  );
}; 