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
}

const Dropdown: React.FC<DropdownProps> = ({
    label,
    options,
    value,
    onChange,
    required = false,
    placeholder = 'Select',
    multiple,
}) => {
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
                    <Listbox.Button className="relative w-full py-3 px-4 text-left bg-white rounded-lg border border-gray-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                        {Array.isArray(value) ? (
                            value.map((v) => (
                                <span
                                    key={v.id}
                                    className="block truncate text-base"
                                >
                                    {v.label || (
                                        <span className="text-gray-500">
                                            {placeholder}
                                        </span>
                                    )}
                                </span>
                            ))
                        ) : (
                            <span className="block truncate text-base">
                                {value?.label || (
                                    <span className="text-gray-500">
                                        {placeholder}
                                    </span>
                                )}
                            </span>
                        )}
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
                                    className={({ active }) =>
                                        `cursor-pointer select-none relative py-3 px-4 ${
                                            active
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
        </div>
    );
};

export { Dropdown };
