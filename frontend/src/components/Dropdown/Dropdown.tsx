import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { FiChevronDown } from 'react-icons/fi';

export interface DropdownOption {
    id: string | number;
    label: string;
    value: string;
}

export interface DropdownProps {
    label?: string;
    options: DropdownOption[];
    value: DropdownOption | DropdownOption[] | null;
    onChange: (value: DropdownOption | DropdownOption[]) => void;
    placeholder?: string;
    required?: boolean;
    multiple?: boolean;
    error?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
    label,
    options,
    value,
    onChange,
    required = false,
    placeholder = 'Select',
    multiple,
    error,
}) => {
    const renderSelectedValue = () => {
        if (Array.isArray(value) && value.length > 0) {
            return (
                <span className="block truncate text-base">
                    {value.map(v => v.label).join(', ')}
                </span>
            );
        }
        
        if (!Array.isArray(value) && value?.label) {
            return <span className="block truncate text-base">{value.label}</span>;
        }
        
        return (
            <span className="block truncate text-base text-gray-400">
                {placeholder}
            </span>
        );
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
            <Listbox value={value} onChange={onChange} multiple={multiple}>
                <div className="relative">
                    <Listbox.Button 
                        className={`relative w-full py-4 px-4 text-left bg-white rounded-lg border ${
                            error ? 'border-red-500' : 'border-gray-300'
                        } cursor-pointer focus:outline-none focus-visible:ring-2 ${
                            error ? 'focus-visible:ring-red-500' : 'focus-visible:ring-blue-500'
                        }`}
                    >
                        {renderSelectedValue()}
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                            <FiChevronDown
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                            />
                        </span>
                    </Listbox.Button>

                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute w-full py-1 mt-1 overflow-auto bg-white rounded-lg shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                            {options.map((option) => (
                                <Listbox.Option
                                    key={option.id}
                                    className={({ active, selected }) =>
                                        `cursor-pointer select-none relative py-3 px-4 ${
                                            active || selected
                                                ? 'bg-gray-100'
                                                : 'text-gray-900'
                                        }`
                                    }
                                    value={option}
                                >
                                    {({ selected }) => (
                                        <span
                                            className={`block truncate ${
                                                selected
                                                    ? 'font-medium'
                                                    : 'font-normal'
                                            }`}
                                        >
                                            {option.label}
                                        </span>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
            {error && (
                <p className="mt-1 text-sm text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
};

export { Dropdown };