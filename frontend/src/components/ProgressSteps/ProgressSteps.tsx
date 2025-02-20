interface ProgressStepsProps {
    currentStep: number;
}

export const ProgressSteps = ({ currentStep }: ProgressStepsProps) => {
    const steps = [{ number: 1, label: 'Basic Details', id: 'basic-details' }];

    return (
        <div className="w-full mb-5">
            <div className="flex items-center justify-center space-x-8">
                {steps.map((step) => {
                    const isActive = step.number === currentStep;
                    const isPast = step.number < currentStep;

                    return (
                        <div
                            key={step.id}
                            className="flex items-center space-x-3"
                        >
                            <div
                                className={`
                                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                                    ${isActive ? 'bg-black text-white text-sm' : isPast ? 'bg-gray-400 text-white text-sm' : 'bg-gray-400 text-white text-sm'}
                                `}
                            >
                                {step.number}
                            </div>
                            <span
                                className={`
                                    text-lg
                                    ${isActive ? 'text-black text-sm' : 'text-gray-400 text-sm'}
                                `}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

