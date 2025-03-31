import { Dialog } from '@headlessui/react';
import { type FC, useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components';
import { Switch } from '@headlessui/react';
import { FiX, FiRefreshCw } from 'react-icons/fi';
import React from 'react';

// funding structure models
export interface FundingStructureModel {
    type: 'target' | 'minimum' | 'tiered';
    amount: string; // in dollars
    equityPercentage: string; // in percentage
    minAmount?: string; // for minimum type
    maxAmount?: string; // for minimum type
    tiers?: FundingTier[]; // for tiered type
    limitInvestors: boolean;
    maxInvestors?: number;
}

export interface FundingTier {
    id: string;
    amount: string;
    equityPercentage: string;
}

interface ValidationErrors {
    equity?: string;
    amount?: string;
    minAmount?: string;
    maxAmount?: string;
    tiers?: { [key: string]: { amount?: string; equityPercentage?: string } };
    general?: string;
}

interface FundingStructureProps {
    value?: FundingStructureModel;
    onChange: (value: FundingStructureModel) => void;
    disabled?: boolean;
}

const errorTextStyle = 'text-xs text-red-500 mt-1';

// format number with commas
const formatNumberWithCommas = (value: number | string): string => {
    if (!value && value !== 0) return '';

    const numValue =
        typeof value === 'string' ? Number.parseFloat(value) : value;
    if (Number.isNaN(numValue)) return '';

    return numValue.toLocaleString('en-US');
};

// equity progress bar component
const EquityProgressBar: FC<{
    percentageUsed: number;
    tiers?: FundingTier[];
    showTiers?: boolean;
}> = ({ percentageUsed, tiers = [], showTiers = false }) => {
    const clampedPercentage = Math.min(100, Math.max(0, percentageUsed));
    const [showTooltip, setShowTooltip] = useState(false);
    const barRef = useRef<HTMLDivElement>(null);
    const isOverallocated = percentageUsed > 100;

    const handleMouseEnter = () => {
        setShowTooltip(true);
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    // Colors for tiers - using site color scheme
    const tierColors = [
        { bg: '#F4802F', pattern: '#D2691F' }, // primary orange - first tier
        { bg: '#154261', pattern: '#1C262D' }, // secondary blue - second tier
        { bg: '#1F2937', pattern: '#111827' }, // gray-800/900 - third tier
        { bg: '#4B5563', pattern: '#374151' }, // gray-600/700 - fourth tier
        { bg: '#71717A', pattern: '#52525B' }, // zinc-500/600 - fifth tier
    ];

    const renderBar = () => {
        if (!showTiers || tiers.length === 0) {
            // Standard single bar
            return (
                <div
                    className={`h-full ${isOverallocated ? 'bg-red-500' : 'bg-[#F4802F]'}`}
                    style={{
                        width: `${clampedPercentage}%`,
                        backgroundImage: isOverallocated
                            ? 'repeating-linear-gradient(-45deg, #B91C1C, #B91C1C 3px, #EF4444 3px, #EF4444 9px)'
                            : 'repeating-linear-gradient(-45deg, #D2691F, #D2691F 3px, transparent 3px, transparent 9px)',
                        transition:
                            'width 0.6s cubic-bezier(0.34, 1.28, 0.64, 1), background-color 0.4s ease-in-out, background-image 0.4s ease-in-out',
                    }}
                />
            );
        }

        // Multi-segment bar for tiers
        let currentPosition = 0;
        return (
            <>
                {tiers.map((tier, index) => {
                    const percentage =
                        Number.parseFloat(tier.equityPercentage) || 0;
                    if (percentage <= 0) return null;

                    const width = percentage;
                    const position = currentPosition;
                    currentPosition += width;

                    // Use the correct color for each tier, without looping
                    const colorIndex = Math.min(index, tierColors.length - 1);
                    const color = tierColors[colorIndex];

                    return (
                        <div
                            key={tier.id}
                            className="h-full absolute top-0"
                            style={{
                                left: `${position}%`,
                                width: `${width}%`,
                                backgroundColor: color.bg,
                                backgroundImage: `repeating-linear-gradient(-45deg, ${color.pattern}, ${color.pattern} 3px, transparent 3px, transparent 9px)`,
                                transition:
                                    'left 0.6s cubic-bezier(0.34, 1.28, 0.64, 1), width 0.6s cubic-bezier(0.34, 1.22, 0.24, 1)',
                            }}
                        />
                    );
                })}
                {/* Error overlay for overallocated equity */}
                {isOverallocated && (
                    <div
                        className="h-full absolute top-0 right-0"
                        style={{
                            width: '100%',
                            opacity: 0.35,
                            backgroundColor: '#EF4444',
                            backgroundImage:
                                'repeating-linear-gradient(-45deg, #B91C1C, #B91C1C 3px, #EF4444 3px, #EF4444 9px)',
                            transition: 'opacity 0.4s ease-in-out',
                            clipPath: `polygon(${Math.min(percentageUsed, 100)}% 0, 100% 0, 100% 100%, ${Math.min(percentageUsed, 100)}% 100%)`,
                        }}
                    />
                )}
            </>
        );
    };

    return (
        <div className="mt-4 mb-6 relative">
            <div
                ref={barRef}
                className={`h-8 w-full bg-gray-200 rounded-md overflow-hidden relative cursor-pointer ${isOverallocated ? 'border-2 border-red-500' : ''}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {renderBar()}
            </div>

            {showTooltip && (
                <div
                    className="absolute left-0 bg-white shadow-md border border-gray-200 rounded p-2 text-sm"
                    style={{
                        top: '100%',
                        marginTop: '4px',
                        zIndex: 9999,
                        maxWidth: '260px',
                    }}
                >
                    {isOverallocated ? (
                        <span className="text-red-600">
                            {clampedPercentage}% exceeds 100% equity
                        </span>
                    ) : (
                        <span>
                            <span className="font-medium">
                                {clampedPercentage}%
                            </span>{' '}
                            equity of your company will be divided among
                            investors
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export const FundingStructure: FC<FundingStructureProps> = ({
    value,
    onChange,
    disabled = false,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [showModalContent, setShowModalContent] = useState(false);
    const [currentStructure, setCurrentStructure] =
        useState<FundingStructureModel>(
            value || {
                type: 'target',
                amount: '',
                equityPercentage: '',
                limitInvestors: false,
                tiers: [
                    {
                        id: Date.now().toString(),
                        amount: '',
                        equityPercentage: '',
                    },
                ],
            }
        );
    const [structureType, setStructureType] = useState<
        'target' | 'minimum' | 'tiered'
    >(value?.type || 'target');
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
        {}
    );
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [isMobileView, setIsMobileView] = useState<boolean>(false);
    const [showTooltip, setShowTooltip] = useState(false);

    const [tabStates, setTabStates] = useState<{
        target: Partial<FundingStructureModel>;
        minimum: Partial<FundingStructureModel>;
        tiered: Partial<FundingStructureModel>;
    }>({
        target: {
            type: 'target',
            amount: '',
            equityPercentage: '',
            limitInvestors: false,
        },
        minimum: {
            type: 'minimum',
            amount: '',
            equityPercentage: '',
            minAmount: '',
            maxAmount: '',
            limitInvestors: false,
        },
        tiered: {
            type: 'tiered',
            limitInvestors: false,
            tiers: [
                {
                    id: Date.now().toString(),
                    amount: '',
                    equityPercentage: '',
                },
            ],
        },
    });

    // When structure type changes, update current structure from tabStates
    const prevStructureTypeRef = useRef(structureType);
    const isUpdatingRef = useRef(false);

    useEffect(() => {
        // Prevent infinite loops
        if (isUpdatingRef.current) {
            return;
        }

        // Only run when structure type changes
        if (prevStructureTypeRef.current !== structureType) {
            isUpdatingRef.current = true;

            try {
                // Save previous tab state before switching
                if (prevStructureTypeRef.current) {
                    setTabStates((prev) => ({
                        ...prev,
                        [prevStructureTypeRef.current]: {
                            ...prev[prevStructureTypeRef.current],
                            ...currentStructure,
                            type: prevStructureTypeRef.current,
                        },
                    }));
                }

                // Then load the new tab state
                const tabState = tabStates[structureType];
                if (tabState) {
                    setCurrentStructure((prev) => ({
                        ...prev,
                        ...tabState,
                        type: structureType, // Ensure type is set correctly
                    }));
                }

                // Update the ref
                prevStructureTypeRef.current = structureType;
            } finally {
                // Make sure this is set back to false no matter what
                isUpdatingRef.current = false;
            }
        }
    }, [structureType, tabStates, currentStructure]); // Include necessary dependencies

    // Check if we're in mobile view
    useEffect(() => {
        const checkMobileView = () => {
            setIsMobileView(window.innerWidth < 640);
        };

        checkMobileView();
        window.addEventListener('resize', checkMobileView);

        return () => {
            window.removeEventListener('resize', checkMobileView);
        };
    }, []);

    // Reset step when opening modal
    useEffect(() => {
        if (isModalOpen) {
            setCurrentStep(1);
        }
    }, [isModalOpen]);

    // Move to next step
    const handleNextStep = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const validateForm = useCallback((): ValidationErrors => {
        const errors: ValidationErrors = {};

        // validate equity percentage doesn't exceed 100%
        const equityPercentage = getEquityPercentage();
        if (equityPercentage > 100) {
            errors.equity = 'Total equity percentage cannot exceed 100%';
        }

        switch (structureType) {
            case 'target':
                if (!currentStructure.amount) {
                    errors.amount = 'Amount is required';
                } else if (Number.parseFloat(currentStructure.amount) < 0) {
                    errors.amount = 'Amount cannot be negative';
                }

                if (!currentStructure.equityPercentage) {
                    errors.equity = 'Equity percentage is required';
                } else if (
                    Number.parseFloat(currentStructure.equityPercentage) < 0
                ) {
                    errors.equity = 'Equity percentage cannot be negative';
                }
                break;

            case 'minimum': {
                if (!currentStructure.minAmount) {
                    errors.minAmount = 'Minimum amount is required';
                } else if (Number.parseFloat(currentStructure.minAmount) < 0) {
                    errors.minAmount = 'Minimum amount cannot be negative';
                }

                if (!currentStructure.maxAmount) {
                    errors.maxAmount = 'Maximum amount is required';
                } else if (Number.parseFloat(currentStructure.maxAmount) < 0) {
                    errors.maxAmount = 'Maximum amount cannot be negative';
                }

                if (!currentStructure.equityPercentage) {
                    errors.equity = 'Equity percentage is required';
                } else if (
                    Number.parseFloat(currentStructure.equityPercentage) < 0
                ) {
                    errors.equity = 'Equity percentage cannot be negative';
                }

                // validate min is not greater than max
                const minAmount = Number.parseFloat(
                    currentStructure.minAmount || '0'
                );
                const maxAmount = Number.parseFloat(
                    currentStructure.maxAmount || '0'
                );
                if (minAmount > maxAmount && maxAmount > 0) {
                    errors.minAmount =
                        'Minimum amount cannot be greater than maximum amount';
                }
                break;
            }

            case 'tiered':
                if (
                    !currentStructure.tiers ||
                    currentStructure.tiers.length === 0
                ) {
                    errors.general = 'At least one tier is required';
                } else {
                    const tierErrors: {
                        [key: string]: {
                            amount?: string;
                            equityPercentage?: string;
                        };
                    } = {};

                    // First check individual tiers
                    currentStructure.tiers.forEach((tier) => {
                        const tierError: {
                            amount?: string;
                            equityPercentage?: string;
                        } = {};

                        if (!tier.amount) {
                            tierError.amount = 'Amount is required';
                        } else if (Number.parseFloat(tier.amount) < 0) {
                            tierError.amount = 'Amount cannot be negative';
                        }

                        if (!tier.equityPercentage) {
                            tierError.equityPercentage =
                                'Equity percentage is required';
                        } else if (
                            Number.parseFloat(tier.equityPercentage) < 0
                        ) {
                            tierError.equityPercentage =
                                'Equity percentage cannot be negative';
                        } else if (
                            Number.parseFloat(tier.equityPercentage) > 100
                        ) {
                            tierError.equityPercentage =
                                'Individual equity cannot exceed 100%';
                        }

                        if (tierError.amount || tierError.equityPercentage) {
                            tierErrors[tier.id] = tierError;
                        }
                    });

                    if (Object.keys(tierErrors).length > 0) {
                        errors.tiers = tierErrors;
                    }
                }
                break;
        }

        return errors;
    }, [structureType, currentStructure]);

    // Update validation errors when structure changes
    useEffect(() => {
        setValidationErrors(validateForm());
    }, [validateForm]);

    // Force validation on each tier's equity percentage change
    useEffect(() => {
        if (structureType === 'tiered' && currentStructure.tiers) {
            const totalEquity = currentStructure.tiers.reduce(
                (sum, tier) =>
                    sum + (Number.parseFloat(tier.equityPercentage) || 0),
                0
            );

            if (totalEquity > 100) {
                setValidationErrors((prev) => ({
                    ...prev,
                    equity: 'Total equity percentage cannot exceed 100%',
                }));

                // Mark equity as touched to show the error
                setTouchedFields((prev) => {
                    const newSet = new Set(prev);
                    newSet.add('equity');
                    return newSet;
                });
            }
        }
    }, [currentStructure.tiers, structureType]);

    const hasValidationErrors = (): boolean => {
        const errors = validateForm();
        return Object.keys(errors).length > 0;
    };

    // handle modal with proper animation
    const handleOpenModal = () => {
        setIsModalOpen(true);
        setIsAnimatingOut(false);

        // Load the saved state for the selected type
        const initialType = value?.type || 'target';
        setStructureType(initialType);

        // If we have a saved value from the parent, use it as a base
        if (value) {
            setCurrentStructure(value);

            // Update the tab state for this value
            setTabStates((prev) => ({
                ...prev,
                [value.type]: { ...value },
            }));
        } else {
            // Otherwise, load from the saved tab state
            const savedTabState = tabStates[initialType];
            if (savedTabState) {
                setCurrentStructure(savedTabState as FundingStructureModel);
            } else {
                // Fallback to a default if no saved state
                setCurrentStructure({
                    type: initialType,
                    amount: '',
                    equityPercentage: '',
                    limitInvestors: false,
                    tiers: [
                        {
                            id: Date.now().toString(),
                            amount: '',
                            equityPercentage: '',
                        },
                    ],
                });
            }
        }

        setValidationErrors({});
        setAttemptedSubmit(false);
        setTouchedFields(new Set());

        // Delay showing content a bit for smoother entrance
        setTimeout(() => {
            setShowModalContent(true);
        }, 50);
    };

    const handleCloseModal = () => {
        // Save the current tab state before closing
        setTabStates((prev) => ({
            ...prev,
            [structureType]: { ...currentStructure },
        }));

        setIsAnimatingOut(true);
        setShowModalContent(false);
        // Wait for animation to complete before closing modal
        setTimeout(() => {
            setIsModalOpen(false);
            setIsAnimatingOut(false);
        }, 300);
    };

    const handleSaveChanges = () => {
        setAttemptedSubmit(true);
        const errors = validateForm();

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        // update the structure with the current type
        const updatedStructure = {
            ...currentStructure,
            type: structureType,
        };

        // Ensure tiered structure has at least one tier
        if (
            structureType === 'tiered' &&
            (!updatedStructure.tiers || updatedStructure.tiers.length === 0)
        ) {
            updatedStructure.tiers = [
                {
                    id: Date.now().toString(),
                    amount: '',
                    equityPercentage: '',
                },
            ];
        }

        // Save the final state to tabStates
        setTabStates((prev) => ({
            ...prev,
            [structureType]: { ...updatedStructure },
        }));

        // pass the updated structure to the parent component
        onChange(updatedStructure as FundingStructureModel);

        // ensure we close the modal after saving
        handleCloseModal();

        // If on mobile and not on the last step, go to next step instead of saving
        if (isMobileView && currentStep < 3) {
            handleNextStep();
            return;
        }
    };

    const handleAddTier = () => {
        // Limit to maximum 5 tiers
        if (currentStructure.tiers && currentStructure.tiers.length >= 5) {
            return; // Don't add more than 5 tiers
        }

        const newTier: FundingTier = {
            id: Date.now().toString(),
            amount: '',
            equityPercentage: '',
        };

        setCurrentStructure({
            ...currentStructure,
            tiers: [...(currentStructure.tiers || []), newTier],
        });
    };

    const handleRemoveTier = (id: string) => {
        setCurrentStructure({
            ...currentStructure,
            tiers: currentStructure.tiers?.filter((tier) => tier.id !== id),
        });
    };

    const handleUpdateTier = (
        id: string,
        key: keyof FundingTier,
        value: string
    ) => {
        // Add validation for extreme values to prevent issues, feels more professional this way imo
        let newValue = value;
        if (key === 'equityPercentage') {
            const numValue = Number.parseFloat(value);
            if (numValue > 99) {
                newValue = '99';
            }
        }

        setCurrentStructure({
            ...currentStructure,
            tiers: currentStructure.tiers?.map((tier) => {
                if (tier.id === id) {
                    return { ...tier, [key]: newValue };
                }
                return tier;
            }),
        });

        // Mark field as touched to trigger validation display
        if (key === 'equityPercentage') {
            markFieldAsTouched('equity');
        }
    };

    const calculateTotalEquity = (): string => {
        const fundingAmount = Number.parseFloat(currentStructure.amount) || 0;
        const equityPercentage =
            Number.parseFloat(currentStructure.equityPercentage) || 0;

        if (fundingAmount && equityPercentage) {
            return `$${formatNumberWithCommas(fundingAmount.toFixed(2))} CAD for ${equityPercentage}% of total equity in your company`;
        }

        return '';
    };

    const getEquityPercentage = (): number => {
        switch (structureType) {
            case 'target':
                return (
                    Number.parseFloat(currentStructure.equityPercentage) || 0
                );
            case 'minimum':
                return (
                    Number.parseFloat(currentStructure.equityPercentage) || 0
                );
            case 'tiered':
                return (currentStructure.tiers || []).reduce(
                    (sum, tier) =>
                        sum + (Number.parseFloat(tier.equityPercentage) || 0),
                    0
                );
            default:
                return 0;
        }
    };

    const getRemainingEquityPercentage = (): number => {
        const allocatedEquity = getEquityPercentage();
        return 100 - allocatedEquity;
    };

    const markFieldAsTouched = (fieldName: string) => {
        setTouchedFields((prev) => {
            const newSet = new Set(prev);
            newSet.add(fieldName);
            return newSet;
        });
    };

    const markTierFieldAsTouched = (
        tierId: string,
        field: 'amount' | 'equityPercentage'
    ) => {
        setTouchedFields((prev) => {
            const newSet = new Set(prev);
            newSet.add(`tier_${tierId}_${field}`);
            return newSet;
        });
    };

    const shouldShowError = (fieldName: string): boolean => {
        return attemptedSubmit || touchedFields.has(fieldName);
    };

    const shouldShowTierError = (
        tierId: string,
        field: 'amount' | 'equityPercentage'
    ): boolean => {
        return attemptedSubmit || touchedFields.has(`tier_${tierId}_${field}`);
    };

    // Function to reset the current tab
    const handleResetTab = () => {
        // Reset the current tab based on its type
        let resetState: Partial<FundingStructureModel>;

        if (structureType === 'target') {
            resetState = {
                type: 'target',
                amount: '',
                equityPercentage: '',
                limitInvestors: false,
            };
        } else if (structureType === 'minimum') {
            resetState = {
                type: 'minimum',
                amount: '',
                equityPercentage: '',
                minAmount: '',
                maxAmount: '',
                limitInvestors: false,
            };
        } else {
            // tiered
            resetState = {
                type: 'tiered',
                limitInvestors: false,
                tiers: [
                    {
                        id: Date.now().toString(),
                        amount: '',
                        equityPercentage: '',
                    },
                ],
            };
        }

        // Update the current structure and the tab state
        setCurrentStructure(resetState as FundingStructureModel);
        setTabStates((prev) => ({
            ...prev,
            [structureType]: resetState,
        }));

        // Reset touched fields and validation
        setTouchedFields(new Set());
        setValidationErrors({});
    };

    const renderModalContent = () => {
        // If mobile view, use the mobile-specific layout
        if (isMobileView) {
            switch (structureType) {
                case 'target':
                case 'minimum':
                case 'tiered':
                    return (
                        <div className="flex flex-col">
                            {/* Funding type tabs */}
                            <div className="flex mb-4 gap-1 overflow-x-auto pb-1">
                                <Button
                                    onClick={() => setStructureType('target')}
                                    variant="secondary"
                                    size="sm"
                                    className={`${structureType === 'target' ? '!bg-[#ffc199] !border-2 !border-[#f3a266] !text-[#b74d06] hover:!bg-[#ffb684]' : ''} focus:!outline-none focus:!ring-0 active:!outline-none touch-action-manipulation`}
                                >
                                    Close on min
                                </Button>
                                <Button
                                    onClick={() => setStructureType('minimum')}
                                    variant="secondary"
                                    size="sm"
                                    className={`${structureType === 'minimum' ? '!bg-[#ffc199] !border-2 !border-[#f3a266] !text-[#b74d06] hover:!bg-[#ffb684]' : ''} focus:!outline-none focus:!ring-0 active:!outline-none touch-action-manipulation`}
                                >
                                    Close on max
                                </Button>
                                <Button
                                    onClick={() => setStructureType('tiered')}
                                    variant="secondary"
                                    size="sm"
                                    className={`${structureType === 'tiered' ? '!bg-[#ffc199] !border-2 !border-[#f3a266] !text-[#b74d06] hover:!bg-[#ffb684]' : ''} focus:!outline-none focus:!ring-0 active:!outline-none touch-action-manipulation`}
                                >
                                    Tiered
                                </Button>
                            </div>

                            {/* Info icon with tooltip and equity indicator */}
                            <div className="flex items-center mb-4 relative">
                                <button
                                    type="button"
                                    className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-2 cursor-pointer"
                                    onClick={() => setShowTooltip(!showTooltip)}
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === 'Enter' ||
                                            e.key === ' '
                                        ) {
                                            setShowTooltip(!showTooltip);
                                        }
                                    }}
                                    aria-label="Toggle tooltip"
                                >
                                    ?
                                </button>
                                <span className="text-sm text-gray-600">
                                    Close on{' '}
                                    {structureType === 'target'
                                        ? 'min'
                                        : structureType === 'minimum'
                                          ? 'max'
                                          : 'tiered'}
                                </span>

                                {/* Tooltip that cpomes up when question mark is clicked */}
                                {showTooltip && (
                                    <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-200 rounded shadow-md z-10 max-w-xs">
                                        <p className="text-xs text-gray-600">
                                            {structureType === 'target'
                                                ? 'When your target funding amount is hit, the fund pool will close and you will receive funding.'
                                                : structureType === 'minimum'
                                                  ? "Set a minimum and maximum funding amount. Once the minimum is hit, you'll receive funding."
                                                  : 'Create multiple funding tiers with different equity percentages.'}
                                        </p>
                                    </div>
                                )}

                                {/* Equity left indicator */}
                                <div
                                    className={`ml-auto py-1 px-4 rounded-full text-sm font-medium ${
                                        getRemainingEquityPercentage() < 0
                                            ? 'bg-red-600 text-white'
                                            : 'bg-purple-100 text-purple-700'
                                    }`}
                                >
                                    {getRemainingEquityPercentage() < 0
                                        ? '-'
                                        : ''}
                                    {Math.abs(
                                        getRemainingEquityPercentage()
                                    ).toFixed(2)}
                                    % equity left
                                </div>
                            </div>

                            {/* Main form content */}
                            <div className="space-y-4">
                                {structureType === 'target' && (
                                    <>
                                        <div>
                                            <label
                                                htmlFor="total-amount"
                                                className="block text-sm font-medium text-gray-700 mb-1"
                                            >
                                                Total amount ($)
                                            </label>
                                            <input
                                                id="total-amount"
                                                type="text"
                                                value={currentStructure.amount}
                                                onChange={(e) =>
                                                    setCurrentStructure({
                                                        ...currentStructure,
                                                        amount: e.target.value,
                                                    })
                                                }
                                                onBlur={() =>
                                                    markFieldAsTouched('amount')
                                                }
                                                className={`w-full p-3 border rounded-md ${
                                                    shouldShowError('amount') &&
                                                    validationErrors.amount
                                                        ? 'border-red-500'
                                                        : 'border-gray-300'
                                                }`}
                                                placeholder="e.g. 100000"
                                            />
                                            {shouldShowError('amount') &&
                                                validationErrors.amount && (
                                                    <p
                                                        className={
                                                            errorTextStyle
                                                        }
                                                    >
                                                        {
                                                            validationErrors.amount
                                                        }
                                                    </p>
                                                )}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="total-equity"
                                                className="block text-sm font-medium text-gray-700 mb-1"
                                            >
                                                Total Equity (%)
                                            </label>
                                            <div className="flex">
                                                <div className="flex-shrink-0 pr-2 flex items-center">
                                                    <span className="text-sm text-gray-500">
                                                        for
                                                    </span>
                                                </div>
                                                <input
                                                    id="total-equity"
                                                    type="text"
                                                    value={
                                                        currentStructure.equityPercentage
                                                    }
                                                    onChange={(e) =>
                                                        setCurrentStructure({
                                                            ...currentStructure,
                                                            equityPercentage:
                                                                e.target.value,
                                                        })
                                                    }
                                                    onBlur={() =>
                                                        markFieldAsTouched(
                                                            'equity'
                                                        )
                                                    }
                                                    className={`flex-grow p-3 border rounded-md ${
                                                        shouldShowError(
                                                            'equity'
                                                        ) &&
                                                        validationErrors.equity
                                                            ? 'border-red-500'
                                                            : 'border-gray-300'
                                                    }`}
                                                    placeholder="e.g. 10"
                                                />
                                            </div>
                                            {shouldShowError('equity') &&
                                                validationErrors.equity && (
                                                    <p
                                                        className={
                                                            errorTextStyle
                                                        }
                                                    >
                                                        {
                                                            validationErrors.equity
                                                        }
                                                    </p>
                                                )}
                                        </div>
                                    </>
                                )}

                                {structureType === 'minimum' && (
                                    <>
                                        <div>
                                            <label
                                                htmlFor="min-amount"
                                                className="block text-sm font-medium text-gray-700 mb-1"
                                            >
                                                Minimum amount ($)
                                            </label>
                                            <input
                                                id="min-amount"
                                                type="text"
                                                value={
                                                    currentStructure.minAmount ||
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    setCurrentStructure({
                                                        ...currentStructure,
                                                        minAmount:
                                                            e.target.value,
                                                    })
                                                }
                                                onBlur={() =>
                                                    markFieldAsTouched(
                                                        'minAmount'
                                                    )
                                                }
                                                className={`w-full p-3 border rounded-md ${
                                                    shouldShowError(
                                                        'minAmount'
                                                    ) &&
                                                    validationErrors.minAmount
                                                        ? 'border-red-500'
                                                        : 'border-gray-300'
                                                }`}
                                                placeholder="e.g. 50000"
                                            />
                                            {shouldShowError('minAmount') &&
                                                validationErrors.minAmount && (
                                                    <p
                                                        className={
                                                            errorTextStyle
                                                        }
                                                    >
                                                        {
                                                            validationErrors.minAmount
                                                        }
                                                    </p>
                                                )}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="max-amount"
                                                className="block text-sm font-medium text-gray-700 mb-1"
                                            >
                                                Maximum amount ($)
                                            </label>
                                            <input
                                                id="max-amount"
                                                type="text"
                                                value={
                                                    currentStructure.maxAmount ||
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    setCurrentStructure({
                                                        ...currentStructure,
                                                        maxAmount:
                                                            e.target.value,
                                                    })
                                                }
                                                onBlur={() =>
                                                    markFieldAsTouched(
                                                        'maxAmount'
                                                    )
                                                }
                                                className={`w-full p-3 border rounded-md ${
                                                    shouldShowError(
                                                        'maxAmount'
                                                    ) &&
                                                    validationErrors.maxAmount
                                                        ? 'border-red-500'
                                                        : 'border-gray-300'
                                                }`}
                                                placeholder="e.g. 100000"
                                            />
                                            {shouldShowError('maxAmount') &&
                                                validationErrors.maxAmount && (
                                                    <p
                                                        className={
                                                            errorTextStyle
                                                        }
                                                    >
                                                        {
                                                            validationErrors.maxAmount
                                                        }
                                                    </p>
                                                )}
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="min-max-equity"
                                                className="block text-sm font-medium text-gray-700 mb-1"
                                            >
                                                Total Equity (%)
                                            </label>
                                            <div className="flex">
                                                <div className="flex-shrink-0 pr-2 flex items-center">
                                                    <span className="text-sm text-gray-500">
                                                        for
                                                    </span>
                                                </div>
                                                <input
                                                    id="min-max-equity"
                                                    type="text"
                                                    value={
                                                        currentStructure.equityPercentage
                                                    }
                                                    onChange={(e) =>
                                                        setCurrentStructure({
                                                            ...currentStructure,
                                                            equityPercentage:
                                                                e.target.value,
                                                        })
                                                    }
                                                    onBlur={() =>
                                                        markFieldAsTouched(
                                                            'equity'
                                                        )
                                                    }
                                                    className={`flex-grow p-3 border rounded-md ${
                                                        shouldShowError(
                                                            'equity'
                                                        ) &&
                                                        validationErrors.equity
                                                            ? 'border-red-500'
                                                            : 'border-gray-300'
                                                    }`}
                                                    placeholder="e.g. 10"
                                                />
                                            </div>
                                            {shouldShowError('equity') &&
                                                validationErrors.equity && (
                                                    <p
                                                        className={
                                                            errorTextStyle
                                                        }
                                                    >
                                                        {
                                                            validationErrors.equity
                                                        }
                                                    </p>
                                                )}
                                        </div>
                                    </>
                                )}

                                {structureType === 'tiered' && (
                                    <div className="space-y-6">
                                        {currentStructure.tiers?.map(
                                            (tier, index) => (
                                                <div
                                                    key={tier.id}
                                                    className="space-y-3"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div className="text-[#ff7f29] font-medium">
                                                            Tier {index + 1}
                                                        </div>
                                                        {index > 0 && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRemoveTier(
                                                                        tier.id
                                                                    )
                                                                }
                                                                className="text-[#ff7f29] hover:text-[#e06b20]"
                                                            >
                                                                <FiX
                                                                    size={16}
                                                                />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="flex w-full">
                                                        <div className="w-[45%] mr-1">
                                                            <label
                                                                htmlFor={`tier-${tier.id}-amount`}
                                                                className="block text-sm font-medium text-gray-700 mb-1"
                                                            >
                                                                Total amount ($)
                                                            </label>
                                                            <input
                                                                id={`tier-${tier.id}-amount`}
                                                                type="number"
                                                                value={
                                                                    tier.amount
                                                                }
                                                                onChange={(e) =>
                                                                    handleUpdateTier(
                                                                        tier.id,
                                                                        'amount',
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                onBlur={() =>
                                                                    markTierFieldAsTouched(
                                                                        tier.id,
                                                                        'amount'
                                                                    )
                                                                }
                                                                className={`w-full p-2 border rounded-md ${
                                                                    shouldShowTierError(
                                                                        tier.id,
                                                                        'amount'
                                                                    ) &&
                                                                    validationErrors
                                                                        .tiers?.[
                                                                        tier.id
                                                                    ]?.amount
                                                                        ? 'border-red-500'
                                                                        : 'border-gray-300'
                                                                }`}
                                                                placeholder="e.g. 1000"
                                                            />
                                                            {shouldShowTierError(
                                                                tier.id,
                                                                'amount'
                                                            ) &&
                                                                validationErrors
                                                                    .tiers?.[
                                                                    tier.id
                                                                ]?.amount && (
                                                                    <p
                                                                        className={
                                                                            errorTextStyle
                                                                        }
                                                                    >
                                                                        {
                                                                            validationErrors
                                                                                .tiers[
                                                                                tier
                                                                                    .id
                                                                            ]
                                                                                .amount
                                                                        }
                                                                    </p>
                                                                )}
                                                        </div>

                                                        <div
                                                            className="flex mx-1 self-start"
                                                            style={{
                                                                marginTop:
                                                                    '34px',
                                                            }}
                                                        >
                                                            <span className="text-sm text-gray-500">
                                                                for
                                                            </span>
                                                        </div>

                                                        <div className="w-[45%] ml-1">
                                                            <label
                                                                htmlFor={`tier-${tier.id}-equity`}
                                                                className="block text-sm font-medium text-gray-700 mb-1"
                                                            >
                                                                Total Equity (%)
                                                            </label>
                                                            <input
                                                                id={`tier-${tier.id}-equity`}
                                                                type="number"
                                                                value={
                                                                    tier.equityPercentage
                                                                }
                                                                onChange={(e) =>
                                                                    handleUpdateTier(
                                                                        tier.id,
                                                                        'equityPercentage',
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                onBlur={() =>
                                                                    markTierFieldAsTouched(
                                                                        tier.id,
                                                                        'equityPercentage'
                                                                    )
                                                                }
                                                                className={`w-full p-2 border rounded-md ${
                                                                    (
                                                                        shouldShowTierError(
                                                                            tier.id,
                                                                            'equityPercentage'
                                                                        ) &&
                                                                            validationErrors
                                                                                .tiers?.[
                                                                                tier
                                                                                    .id
                                                                            ]
                                                                                ?.equityPercentage
                                                                    ) ||
                                                                    (
                                                                        validationErrors.equity &&
                                                                            shouldShowError(
                                                                                'equity'
                                                                            )
                                                                    )
                                                                        ? 'border-red-500'
                                                                        : 'border-gray-300'
                                                                }`}
                                                                placeholder="e.g. 10"
                                                            />
                                                            {shouldShowTierError(
                                                                tier.id,
                                                                'equityPercentage'
                                                            ) &&
                                                                validationErrors
                                                                    .tiers?.[
                                                                    tier.id
                                                                ]
                                                                    ?.equityPercentage && (
                                                                    <p
                                                                        className={
                                                                            errorTextStyle
                                                                        }
                                                                    >
                                                                        {
                                                                            validationErrors
                                                                                .tiers[
                                                                                tier
                                                                                    .id
                                                                            ]
                                                                                .equityPercentage
                                                                        }
                                                                    </p>
                                                                )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        )}

                                        <div className="flex justify-end mt-4 mb-8">
                                            <Button
                                                onClick={handleAddTier}
                                                disabled={
                                                    currentStructure.tiers &&
                                                    currentStructure.tiers
                                                        .length >= 5
                                                }
                                                variant="primary"
                                                size="sm"
                                                className={
                                                    currentStructure.tiers &&
                                                    currentStructure.tiers
                                                        .length >= 5
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : ''
                                                }
                                            >
                                                {currentStructure.tiers &&
                                                currentStructure.tiers.length >=
                                                    5
                                                    ? '+ Add Tier (Max 5)'
                                                    : '+ Add Tier'}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Summary text */}
                                {currentStructure.amount &&
                                    currentStructure.equityPercentage &&
                                    structureType === 'target' && (
                                        <p className="text-sm text-gray-700 mt-2">
                                            Total amount of funding:{' '}
                                            {calculateTotalEquity()}
                                        </p>
                                    )}

                                {currentStructure.minAmount &&
                                    currentStructure.maxAmount &&
                                    currentStructure.equityPercentage &&
                                    structureType === 'minimum' && (
                                        <p className="text-sm text-gray-700 mt-4 mb-2">
                                            Total amount of funding: $
                                            {formatNumberWithCommas(
                                                currentStructure.maxAmount || 0
                                            )}{' '}
                                            for{' '}
                                            {currentStructure.equityPercentage}%
                                            of total equity in your company.
                                            Funds will be held until the minimum
                                            amount of funding has been
                                            fulfilled.
                                        </p>
                                    )}

                                {structureType === 'tiered' &&
                                    currentStructure.tiers &&
                                    currentStructure.tiers.length > 0 && (
                                        <p className="text-sm text-gray-700 mt-4 mb-2">
                                            Total amount of funding: $
                                            {formatNumberWithCommas(
                                                (currentStructure.tiers || [])
                                                    .reduce(
                                                        (sum, tier) =>
                                                            sum +
                                                            (Number.parseFloat(
                                                                tier.amount
                                                            ) || 0),
                                                        0
                                                    )
                                                    .toFixed(2)
                                            )}{' '}
                                            CAD for{' '}
                                            {(currentStructure.tiers || [])
                                                .reduce(
                                                    (sum, tier) =>
                                                        sum +
                                                        (Number.parseFloat(
                                                            tier.equityPercentage
                                                        ) || 0),
                                                    0
                                                )
                                                .toFixed(2)}
                                            % of total equity in your company
                                        </p>
                                    )}

                                {/* Equity progress bar */}
                                <div className="mb-4 mt-2">
                                    <EquityProgressBar
                                        percentageUsed={getEquityPercentage()}
                                        tiers={
                                            structureType === 'tiered'
                                                ? currentStructure.tiers
                                                : undefined
                                        }
                                        showTiers={structureType === 'tiered'}
                                    />
                                </div>

                                {/* Investor limit toggle */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">
                                        Limit number of investors?
                                    </span>
                                    <Switch
                                        checked={
                                            currentStructure.limitInvestors
                                        }
                                        onChange={(value) =>
                                            setCurrentStructure({
                                                ...currentStructure,
                                                limitInvestors: value,
                                            })
                                        }
                                        className={`${
                                            currentStructure.limitInvestors
                                                ? 'bg-orange-500'
                                                : 'bg-gray-200'
                                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                                    >
                                        <span className="sr-only">
                                            Limit investors
                                        </span>
                                        <span
                                            className={`${
                                                currentStructure.limitInvestors
                                                    ? 'translate-x-6'
                                                    : 'translate-x-1'
                                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                        />
                                    </Switch>
                                </div>

                                {/* Investor count input - only shown when limiter is enabled */}
                                {currentStructure.limitInvestors && (
                                    <div className="mt-4 flex items-center">
                                        <input
                                            type="number"
                                            value={
                                                currentStructure.maxInvestors?.toString() ||
                                                ''
                                            }
                                            onChange={(e) =>
                                                setCurrentStructure({
                                                    ...currentStructure,
                                                    maxInvestors: e.target.value
                                                        ? Number.parseInt(
                                                              e.target.value
                                                          )
                                                        : undefined,
                                                })
                                            }
                                            className="w-20 p-2 border border-gray-300 rounded-md mr-2"
                                            placeholder="10"
                                            min="1"
                                        />
                                        <span className="text-sm text-gray-700">
                                            Investors
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                default:
                    return null;
            }
        }

        // Original desktop content
        switch (structureType) {
            case 'target':
                return (
                    <div>
                        <p className="mb-4 text-sm">
                            When your target funding amount is hit, the fund
                            pool will close and you will receive funding.
                            Investors will get their equity % based on their
                            funding amount.
                        </p>

                        <div className="mb-6">
                            <div className="flex items-start">
                                <div className="w-2/3 pr-4">
                                    <div className="flex justify-between items-center mb-1">
                                        <label
                                            className="block text-md font-normal"
                                            htmlFor="desktop-total-amount"
                                        >
                                            Total amount ($)
                                        </label>
                                        <span className="text-sm text-gray-500">
                                            Required
                                        </span>
                                    </div>
                                    <input
                                        id="desktop-total-amount"
                                        type="number"
                                        className={`w-full px-4 py-3 bg-white outline outline-1 -outline-offset-1 ${shouldShowError('amount') && validationErrors.amount ? 'outline-red-500' : 'outline-gray-300'} rounded-md focus:outline focus:outline-2 focus:outline-blue-500`}
                                        value={currentStructure.amount}
                                        onChange={(e) =>
                                            setCurrentStructure({
                                                ...currentStructure,
                                                amount: e.target.value,
                                            })
                                        }
                                        onBlur={() =>
                                            markFieldAsTouched('amount')
                                        }
                                        placeholder="Enter amount in CAD"
                                    />
                                    {shouldShowError('amount') &&
                                        validationErrors.amount && (
                                            <p className={errorTextStyle}>
                                                {validationErrors.amount}
                                            </p>
                                        )}
                                </div>

                                <div className="flex items-center justify-center px-2 mt-10">
                                    <span className="text-gray-700 font-medium">
                                        for
                                    </span>
                                </div>

                                <div className="w-1/3 pl-4">
                                    <div className="flex justify-between items-center mb-1">
                                        <label
                                            className="block text-md font-normal"
                                            htmlFor="desktop-total-equity"
                                        >
                                            Total Equity (%)
                                        </label>
                                        <span className="text-sm text-gray-500">
                                            Required
                                        </span>
                                    </div>
                                    <input
                                        id="desktop-total-equity"
                                        type="number"
                                        className={`w-full px-4 py-3 bg-white outline outline-1 -outline-offset-1 ${shouldShowError('equity') && validationErrors.equity ? 'outline-red-500' : 'outline-gray-300'} rounded-md focus:outline focus:outline-2 focus:outline-blue-500`}
                                        value={
                                            currentStructure.equityPercentage
                                        }
                                        onChange={(e) =>
                                            setCurrentStructure({
                                                ...currentStructure,
                                                equityPercentage:
                                                    e.target.value,
                                            })
                                        }
                                        onBlur={() =>
                                            markFieldAsTouched('equity')
                                        }
                                        placeholder="Enter percentage"
                                    />
                                    {shouldShowError('equity') &&
                                        validationErrors.equity && (
                                            <p className={errorTextStyle}>
                                                {validationErrors.equity}
                                            </p>
                                        )}
                                </div>
                            </div>

                            {calculateTotalEquity() && (
                                <p className="text-sm text-gray-700 mt-4 mb-2">
                                    Total amount of funding:{' '}
                                    {calculateTotalEquity()}
                                </p>
                            )}

                            <EquityProgressBar
                                percentageUsed={getEquityPercentage()}
                            />
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium">
                                    Set a limit on number of investors?
                                </span>
                                <Switch
                                    checked={currentStructure.limitInvestors}
                                    onChange={(value) =>
                                        setCurrentStructure({
                                            ...currentStructure,
                                            limitInvestors: value,
                                        })
                                    }
                                    className={`${
                                        currentStructure.limitInvestors
                                            ? 'bg-orange-500'
                                            : 'bg-gray-200'
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                                >
                                    <span className="sr-only">
                                        Limit investors
                                    </span>
                                    <span
                                        className={`${
                                            currentStructure.limitInvestors
                                                ? 'translate-x-6'
                                                : 'translate-x-1'
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                    />
                                </Switch>
                            </div>

                            {currentStructure.limitInvestors && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        className="w-24 px-4 py-3 bg-white outline outline-1 -outline-offset-1 outline-gray-300 rounded-md focus:outline focus:outline-2 focus:outline-blue-500"
                                        value={
                                            currentStructure.maxInvestors?.toString() ||
                                            ''
                                        }
                                        onChange={(e) =>
                                            setCurrentStructure({
                                                ...currentStructure,
                                                maxInvestors: Number.parseInt(
                                                    e.target.value
                                                ),
                                            })
                                        }
                                        placeholder="10"
                                    />
                                    <span className="text-sm text-gray-500">
                                        Investors
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'minimum':
                return (
                    <div>
                        <p className="mb-4 text-sm">
                            When the minimum funding amount is reached, the fund
                            pool will be released and you will receive funding.
                            Any subsequent investment funds will be instantly
                            released and exchanged for equity up until the
                            maximum amount of funding has been fulfilled.
                        </p>

                        <div className="mb-6">
                            <div className="flex items-start">
                                <div className="w-1/3 pr-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <label
                                            className="block text-md font-normal"
                                            htmlFor="desktop-min-amount"
                                        >
                                            Min. amount ($)
                                        </label>
                                        <span className="text-sm text-gray-500">
                                            Required
                                        </span>
                                    </div>
                                    <input
                                        id="desktop-min-amount"
                                        type="number"
                                        className={`w-full px-4 py-3 bg-white outline outline-1 -outline-offset-1 ${shouldShowError('minAmount') && validationErrors.minAmount ? 'outline-red-500' : 'outline-gray-300'} rounded-md focus:outline focus:outline-2 focus:outline-blue-500`}
                                        value={currentStructure.minAmount || ''}
                                        onChange={(e) =>
                                            setCurrentStructure({
                                                ...currentStructure,
                                                minAmount: e.target.value,
                                            })
                                        }
                                        onBlur={() =>
                                            markFieldAsTouched('minAmount')
                                        }
                                        placeholder="Enter min amount"
                                    />
                                    {shouldShowError('minAmount') &&
                                        validationErrors.minAmount && (
                                            <p className={errorTextStyle}>
                                                {validationErrors.minAmount}
                                            </p>
                                        )}
                                </div>

                                <div className="flex items-center justify-center px-2 mt-10">
                                    <span className="text-gray-700 font-medium">
                                        to
                                    </span>
                                </div>

                                <div className="w-1/3 px-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <label
                                            className="block text-md font-normal"
                                            htmlFor="desktop-max-amount"
                                        >
                                            Max. amount ($)
                                        </label>
                                        <span className="text-sm text-gray-500">
                                            Required
                                        </span>
                                    </div>
                                    <input
                                        id="desktop-max-amount"
                                        type="number"
                                        className={`w-full px-4 py-3 bg-white outline outline-1 -outline-offset-1 ${shouldShowError('maxAmount') && validationErrors.maxAmount ? 'outline-red-500' : 'outline-gray-300'} rounded-md focus:outline focus:outline-2 focus:outline-blue-500`}
                                        value={currentStructure.maxAmount || ''}
                                        onChange={(e) =>
                                            setCurrentStructure({
                                                ...currentStructure,
                                                maxAmount: e.target.value,
                                            })
                                        }
                                        onBlur={() =>
                                            markFieldAsTouched('maxAmount')
                                        }
                                        placeholder="Enter max amount"
                                    />
                                    {shouldShowError('maxAmount') &&
                                        validationErrors.maxAmount && (
                                            <p className={errorTextStyle}>
                                                {validationErrors.maxAmount}
                                            </p>
                                        )}
                                </div>

                                <div className="flex items-center justify-center px-2 mt-10">
                                    <span className="text-gray-700 font-medium">
                                        for
                                    </span>
                                </div>

                                <div className="w-1/3 pl-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <label
                                            className="block text-md font-normal"
                                            htmlFor="desktop-min-max-equity"
                                        >
                                            Total Equity (%)
                                        </label>
                                        <span className="text-sm text-gray-500">
                                            Required
                                        </span>
                                    </div>
                                    <input
                                        id="desktop-min-max-equity"
                                        type="number"
                                        className={`w-full px-4 py-3 bg-white outline outline-1 -outline-offset-1 ${shouldShowError('equity') && validationErrors.equity ? 'outline-red-500' : 'outline-gray-300'} rounded-md focus:outline focus:outline-2 focus:outline-blue-500`}
                                        value={
                                            currentStructure.equityPercentage
                                        }
                                        onChange={(e) =>
                                            setCurrentStructure({
                                                ...currentStructure,
                                                equityPercentage:
                                                    e.target.value,
                                            })
                                        }
                                        onBlur={() =>
                                            markFieldAsTouched('equity')
                                        }
                                        placeholder="Enter percentage"
                                    />
                                    {shouldShowError('equity') &&
                                        validationErrors.equity && (
                                            <p className={errorTextStyle}>
                                                {validationErrors.equity}
                                            </p>
                                        )}
                                </div>
                            </div>

                            {(currentStructure.minAmount ||
                                currentStructure.maxAmount) &&
                                currentStructure.equityPercentage && (
                                    <p className="text-sm text-gray-700 mt-4 mb-2">
                                        Total amount of funding: $
                                        {formatNumberWithCommas(
                                            currentStructure.maxAmount || 0
                                        )}{' '}
                                        for {currentStructure.equityPercentage}%
                                        of total equity in your company. Funds
                                        will be held until the minimum amount of
                                        funding has been fulfilled.
                                    </p>
                                )}

                            <EquityProgressBar
                                percentageUsed={getEquityPercentage()}
                            />
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium">
                                    Set a limit on number of investors?
                                </span>
                                <Switch
                                    checked={currentStructure.limitInvestors}
                                    onChange={(value) =>
                                        setCurrentStructure({
                                            ...currentStructure,
                                            limitInvestors: value,
                                        })
                                    }
                                    className={`${
                                        currentStructure.limitInvestors
                                            ? 'bg-orange-500'
                                            : 'bg-gray-200'
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                                >
                                    <span className="sr-only">
                                        Limit investors
                                    </span>
                                    <span
                                        className={`${
                                            currentStructure.limitInvestors
                                                ? 'translate-x-6'
                                                : 'translate-x-1'
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                    />
                                </Switch>
                            </div>

                            {currentStructure.limitInvestors && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        className="w-24 px-4 py-3 bg-white outline outline-1 -outline-offset-1 outline-gray-300 rounded-md focus:outline focus:outline-2 focus:outline-blue-500"
                                        value={
                                            currentStructure.maxInvestors?.toString() ||
                                            ''
                                        }
                                        onChange={(e) =>
                                            setCurrentStructure({
                                                ...currentStructure,
                                                maxInvestors: Number.parseInt(
                                                    e.target.value
                                                ),
                                            })
                                        }
                                        placeholder="10"
                                    />
                                    <span className="text-sm text-gray-500">
                                        Investors
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'tiered':
                // Ensure there's at least one tier
                if (
                    !currentStructure.tiers ||
                    currentStructure.tiers.length === 0
                ) {
                    setCurrentStructure({
                        ...currentStructure,
                        tiers: [
                            {
                                id: Date.now().toString(),
                                amount: '',
                                equityPercentage: '',
                            },
                        ],
                    });
                }

                return (
                    <div>
                        <p className="mb-4 text-sm">
                            Set your own tiered funding structure and equity
                            levels. When each contribution tier is funded, you
                            will receive funding. Funding pools will be closed
                            once all tiers are fulfilled.
                        </p>

                        {attemptedSubmit && validationErrors.general && (
                            <p className={`${errorTextStyle} mb-2`}>
                                {validationErrors.general}
                            </p>
                        )}

                        <div className="max-h-[250px] overflow-y-auto pr-4">
                            {(currentStructure.tiers || []).map(
                                (tier, index) => (
                                    <div key={tier.id} className="mb-4">
                                        <div className="flex items-start">
                                            <div className="flex items-center mt-8 w-20 flex-shrink-0">
                                                <div className="w-12 mr-0">
                                                    <div className="text-[#ff7f29] font-medium">
                                                        Tier {index + 1}
                                                    </div>
                                                </div>
                                                {index > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveTier(
                                                                tier.id
                                                            )
                                                        }
                                                        className="text-[#ff7f29] hover:text-[#e06b20]"
                                                    >
                                                        <FiX size={16} />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-start space-x-4">
                                                    <div className="w-[45%]">
                                                        <label
                                                            htmlFor={`tier-${tier.id}-amount`}
                                                            className="block text-sm font-medium text-gray-700 mb-1"
                                                        >
                                                            Amount ($)
                                                        </label>
                                                        <input
                                                            id={`tier-${tier.id}-amount`}
                                                            type="number"
                                                            value={tier.amount}
                                                            onChange={(e) =>
                                                                handleUpdateTier(
                                                                    tier.id,
                                                                    'amount',
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            onBlur={() =>
                                                                markTierFieldAsTouched(
                                                                    tier.id,
                                                                    'amount'
                                                                )
                                                            }
                                                            className={`w-full p-2 border rounded-md ${
                                                                shouldShowTierError(
                                                                    tier.id,
                                                                    'amount'
                                                                ) &&
                                                                validationErrors
                                                                    .tiers?.[
                                                                    tier.id
                                                                ]?.amount
                                                                    ? 'border-red-500'
                                                                    : 'border-gray-300'
                                                            }`}
                                                            placeholder="e.g. 1000"
                                                        />
                                                        {shouldShowTierError(
                                                            tier.id,
                                                            'amount'
                                                        ) &&
                                                            validationErrors
                                                                .tiers?.[
                                                                tier.id
                                                            ]?.amount && (
                                                                <p
                                                                    className={
                                                                        errorTextStyle
                                                                    }
                                                                >
                                                                    {
                                                                        validationErrors
                                                                            .tiers[
                                                                            tier
                                                                                .id
                                                                        ].amount
                                                                    }
                                                                </p>
                                                            )}
                                                    </div>

                                                    <div className="flex-1">
                                                        <label
                                                            htmlFor={`tier-${tier.id}-equity`}
                                                            className="block text-sm font-medium text-gray-700 mb-1"
                                                        >
                                                            Total Equity (%)
                                                        </label>
                                                        <input
                                                            id={`tier-${tier.id}-equity`}
                                                            type="number"
                                                            value={
                                                                tier.equityPercentage
                                                            }
                                                            onChange={(e) =>
                                                                handleUpdateTier(
                                                                    tier.id,
                                                                    'equityPercentage',
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            onBlur={() =>
                                                                markTierFieldAsTouched(
                                                                    tier.id,
                                                                    'equityPercentage'
                                                                )
                                                            }
                                                            className={`w-full p-2 border rounded-md ${
                                                                (
                                                                    shouldShowTierError(
                                                                        tier.id,
                                                                        'equityPercentage'
                                                                    ) &&
                                                                        validationErrors
                                                                            .tiers?.[
                                                                            tier
                                                                                .id
                                                                        ]
                                                                            ?.equityPercentage
                                                                ) ||
                                                                (
                                                                    validationErrors.equity &&
                                                                        shouldShowError(
                                                                            'equity'
                                                                        )
                                                                )
                                                                    ? 'border-red-500'
                                                                    : 'border-gray-300'
                                                            }`}
                                                            placeholder="e.g. 10"
                                                        />
                                                        {shouldShowTierError(
                                                            tier.id,
                                                            'equityPercentage'
                                                        ) &&
                                                            validationErrors
                                                                .tiers?.[
                                                                tier.id
                                                            ]
                                                                ?.equityPercentage && (
                                                                <p
                                                                    className={
                                                                        errorTextStyle
                                                                    }
                                                                >
                                                                    {
                                                                        validationErrors
                                                                            .tiers[
                                                                            tier
                                                                                .id
                                                                        ]
                                                                            .equityPercentage
                                                                    }
                                                                </p>
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>

                        <div className="flex justify-end mt-4 mb-8">
                            <Button
                                onClick={handleAddTier}
                                disabled={
                                    currentStructure.tiers &&
                                    currentStructure.tiers.length >= 5
                                }
                                variant="primary"
                                size="sm"
                                className={
                                    currentStructure.tiers &&
                                    currentStructure.tiers.length >= 5
                                        ? 'opacity-50 cursor-not-allowed'
                                        : ''
                                }
                            >
                                {currentStructure.tiers &&
                                currentStructure.tiers.length >= 5
                                    ? '+ Add Tier (Max 5)'
                                    : '+ Add Tier'}
                            </Button>
                        </div>

                        {shouldShowError('equity') &&
                            validationErrors.equity && (
                                <p className={`${errorTextStyle} mt-2`}>
                                    {validationErrors.equity}
                                </p>
                            )}

                        {(currentStructure.tiers || []).length > 0 && (
                            <p className="text-sm text-gray-700 mt-4 mb-2">
                                Total amount of funding: $
                                {formatNumberWithCommas(
                                    (currentStructure.tiers || [])
                                        .reduce(
                                            (sum, tier) =>
                                                sum +
                                                (Number.parseFloat(
                                                    tier.amount
                                                ) || 0),
                                            0
                                        )
                                        .toFixed(2)
                                )}{' '}
                                CAD for{' '}
                                {(currentStructure.tiers || [])
                                    .reduce(
                                        (sum, tier) =>
                                            sum +
                                            (Number.parseFloat(
                                                tier.equityPercentage
                                            ) || 0),
                                        0
                                    )
                                    .toFixed(2)}
                                % of total equity in your company
                            </p>
                        )}

                        <EquityProgressBar
                            percentageUsed={getEquityPercentage()}
                            tiers={currentStructure.tiers}
                            showTiers={true}
                        />

                        <div className="border-t border-gray-200 pt-4">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium">
                                    Set a limit on number of investors?
                                </span>
                                <Switch
                                    checked={currentStructure.limitInvestors}
                                    onChange={(value) =>
                                        setCurrentStructure({
                                            ...currentStructure,
                                            limitInvestors: value,
                                        })
                                    }
                                    className={`${
                                        currentStructure.limitInvestors
                                            ? 'bg-orange-500'
                                            : 'bg-gray-200'
                                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                                >
                                    <span className="sr-only">
                                        Limit investors
                                    </span>
                                    <span
                                        className={`${
                                            currentStructure.limitInvestors
                                                ? 'translate-x-6'
                                                : 'translate-x-1'
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                    />
                                </Switch>
                            </div>

                            {currentStructure.limitInvestors && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        className="w-24 px-4 py-3 bg-white outline outline-1 -outline-offset-1 outline-gray-300 rounded-md focus:outline focus:outline-2 focus:outline-blue-500"
                                        value={
                                            currentStructure.maxInvestors?.toString() ||
                                            ''
                                        }
                                        onChange={(e) =>
                                            setCurrentStructure({
                                                ...currentStructure,
                                                maxInvestors: Number.parseInt(
                                                    e.target.value
                                                ),
                                            })
                                        }
                                        placeholder="10"
                                    />
                                    <span className="text-sm text-gray-500">
                                        Investors
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    const renderModal = () => {
        if (!isModalOpen) return null;

        return (
            <Dialog
                open={true}
                onClose={handleCloseModal}
                className="relative z-50"
            >
                <div
                    className="fixed inset-0 bg-black/30 transition-opacity duration-300 ease-out"
                    aria-hidden="true"
                    style={{ opacity: isAnimatingOut ? 0 : 1 }}
                />
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-full p-4">
                        <Dialog.Panel
                            className={`flex flex-col bg-white rounded-lg shadow-xl mx-auto overflow-hidden
              transform transition-all duration-300 ease-in-out
              ${showModalContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
              ${isAnimatingOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
              ${isMobileView ? 'w-full max-w-sm h-auto' : 'max-w-screen-md w-full h-[80vh]'}`}
                        >
                            {/* Fixed header */}
                            <div className="flex-shrink-0 p-6 pb-2">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-medium">
                                        Add Funding Structure
                                    </h2>
                                    <div className="flex space-x-2">
                                        <Button
                                            onClick={handleResetTab}
                                            className="text-gray-400 hover:text-gray-500 h-8 w-8 p-0 flex items-center justify-center"
                                            variant="secondary"
                                            title={`Reset ${structureType === 'target' ? 'Target' : structureType === 'minimum' ? 'Min/Max' : 'Tiered'} Tab`}
                                            icon={
                                                <FiRefreshCw className="translate-y-[3px]" />
                                            }
                                        >
                                            <span className="sr-only">
                                                Reset
                                            </span>
                                        </Button>
                                        <Button
                                            onClick={handleCloseModal}
                                            className="text-gray-400 hover:text-gray-500 h-8 w-8 p-0 flex items-center justify-center"
                                            variant="secondary"
                                        >
                                            <span className="text-2xl leading-none">
                                                &times;
                                            </span>
                                            <span className="sr-only">
                                                Close
                                            </span>
                                        </Button>
                                    </div>
                                </div>

                                <div className="border-b pb-2 mt-2" />

                                {/* Tab buttons - only show on desktop */}
                                {!isMobileView && (
                                    <div className="flex justify-between items-center my-4">
                                        <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                                            <Button
                                                onClick={() =>
                                                    setStructureType('target')
                                                }
                                                variant="secondary"
                                                size="sm"
                                                className={`${structureType === 'target' ? '!bg-[#ffc199] !border-2 !border-[#f3a266] !text-[#b74d06] hover:!bg-[#ffb684]' : ''} focus:!outline-none focus:!ring-0 active:!outline-none touch-action-manipulation`}
                                            >
                                                Close on minimum
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    setStructureType('minimum')
                                                }
                                                variant="secondary"
                                                size="sm"
                                                className={`${structureType === 'minimum' ? '!bg-[#ffc199] !border-2 !border-[#f3a266] !text-[#b74d06] hover:!bg-[#ffb684]' : ''} focus:!outline-none focus:!ring-0 active:!outline-none touch-action-manipulation`}
                                            >
                                                Close on maximum
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    setStructureType('tiered')
                                                }
                                                variant="secondary"
                                                size="sm"
                                                className={`${structureType === 'tiered' ? '!bg-[#ffc199] !border-2 !border-[#f3a266] !text-[#b74d06] hover:!bg-[#ffb684]' : ''} focus:!outline-none focus:!ring-0 active:!outline-none touch-action-manipulation`}
                                            >
                                                Tiered
                                            </Button>
                                        </div>
                                        <div
                                            className={`py-1 px-4 rounded-full text-sm font-medium ${
                                                getRemainingEquityPercentage() <
                                                0
                                                    ? 'bg-red-600 text-white'
                                                    : 'bg-purple-100 text-purple-700'
                                            }`}
                                        >
                                            {getRemainingEquityPercentage() < 0
                                                ? '-'
                                                : ''}
                                            {Math.abs(
                                                getRemainingEquityPercentage()
                                            ).toFixed(2)}
                                            % equity left
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Scrollable content */}
                            <div className="flex-grow overflow-y-auto p-6 pt-0">
                                {renderModalContent()}
                            </div>

                            {/* Fixed footer */}
                            <div className="flex-shrink-0 p-6 pt-2 border-t">
                                <div className="flex flex-col gap-2">
                                    <Button
                                        onClick={handleSaveChanges}
                                        disabled={hasValidationErrors()}
                                        liquid
                                        className="bg-orange-500 hover:bg-orange-600 text-white"
                                    >
                                        Save Changes
                                    </Button>
                                    <Button
                                        onClick={handleCloseModal}
                                        variant="secondary"
                                        liquid
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        );
    };

    if (!value) {
        return (
            <React.Fragment key="funding-structure-empty">
                <div className="text-center">
                    <Button
                        onClick={handleOpenModal}
                        type="button"
                        variant="primary"
                        liquid={true}
                        disabled={disabled}
                    >
                        Choose funding
                    </Button>
                    {renderModal()}
                </div>
            </React.Fragment>
        );
    }

    // Generate the funding details text
    let fundingDetails = '';
    switch (value.type) {
        case 'target':
            fundingDetails = `$${formatNumberWithCommas(value.amount)} for ${value.equityPercentage}% equity`;
            break;
        case 'minimum':
            fundingDetails = `$${formatNumberWithCommas(value.minAmount || '0')} to $${formatNumberWithCommas(value.maxAmount || '0')} for ${value.equityPercentage}% equity`;
            break;
        case 'tiered':
            fundingDetails = `${value.tiers?.length || 0} tiers for ${(value.tiers || []).reduce((sum, tier) => sum + (Number.parseFloat(tier.equityPercentage) || 0), 0)}% equity`;
            break;
    }

    return (
        <React.Fragment key="funding-structure-with-value">
            <div className="rounded-md bg-white flex items-center justify-between py-2.5 px-3 border border-gray-100 shadow-sm">
                <div className="flex items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                            {value.type === 'target'
                                ? 'Target'
                                : value.type === 'minimum'
                                  ? 'Min/Max'
                                  : 'Tiered'}{' '}
                            funding:
                        </span>
                        <span className="text-sm text-gray-600">
                            {fundingDetails}
                        </span>
                    </div>
                </div>
                <Button
                    onClick={handleOpenModal}
                    variant="secondary"
                    size="sm"
                    disabled={disabled}
                >
                    Edit
                </Button>
            </div>
            {renderModal()}
        </React.Fragment>
    );
};

export default FundingStructure;
