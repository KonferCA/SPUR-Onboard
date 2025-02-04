import React from 'react';

export interface DateInputProps {
    label?: string;
    value?: Date;
    onChange: (value: Date) => void;
    required?: boolean;
    placeholder?: string;
    error?: string;
    name?: string;
    max?: Date;
    min?: Date;
}

export const DateInput: React.FC<DateInputProps> = ({
    label,
    value,
    onChange,
    required,
    placeholder,
    error,
    max,
    min,
}) => {
    const formatDate = (date?: Date) => {
        if (!date) return '';
        try {
            return date.toISOString().split('T')[0];
        } catch (e) {}
        return '';
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const date = new Date(e.target.value);
            onChange(date);
        } catch (e) {}
    };

    return (
        <div className="w-full">
            {label && (
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-900">
                        {label}
                    </label>
                    {required && (
                        <span className="text-sm text-gray-500">Required</span>
                    )}
                </div>
            )}
            <div className="relative">
                <input
                    type="date"
                    value={formatDate(value)}
                    onChange={handleChange}
                    placeholder={placeholder}
                    max={max ? formatDate(max) : undefined}
                    min={min ? formatDate(min) : undefined}
                    className={`w-full px-4 py-3 border ${
                        error ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg text-gray-900 focus:outline-none focus:ring-2 ${
                        error ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                    } text-base`}
                />
            </div>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
};

