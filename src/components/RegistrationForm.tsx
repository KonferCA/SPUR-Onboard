import { TextInput, Button, FormContainer } from "@components";
import { useState, FormEvent } from 'react';

type RegistrationTab = 'basic-details' | 'id-verification';

interface FormData {
    firstName: string;
    lastName: string;
    position: string;
    bio: string;
    linkedIn: string;
}

interface FormErrors {
    linkedIn?: string;
}

const RegistrationForm = () => {
    const [activeTab, setActiveTab] = useState<RegistrationTab>('basic-details');
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        position: '',
        bio: '',
        linkedIn: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});

    const LINKEDIN_REGEX = /^(https?:\/\/)?([\w]+\.)?linkedin\.com\/(pub|in|profile)\/([-a-zA-Z0-9]+)\/?$/;

    const validateLinkedIn = (url: string): boolean => {
        if (!url) return false;
        return LINKEDIN_REGEX.test(url);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        if (formData.linkedIn && !validateLinkedIn(formData.linkedIn)) {
            newErrors.linkedIn = "Please enter a valid LinkedIn profile URL";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            setActiveTab('id-verification');
        }
    };

    const isFormValid = (): boolean => {
        return (
            Object.values(formData).every(value => value.trim() !== '') &&
            Object.keys(errors).length === 0 &&
            validateLinkedIn(formData.linkedIn)
        );
    };

    const renderTabs = () => (
        <div className="flex justify-center space-x-8 mb-8">
            <button
                onClick={() => setActiveTab('basic-details')}
                className={`pb-1 ${
                    activeTab === 'basic-details'
                        ? 'text-gray-900 border-b-2 border-gray-900'
                        : 'text-gray-400'
                }`}
            >
                Basic Details
            </button>
            <button
                onClick={() => activeTab === 'id-verification' || isFormValid() ? setActiveTab('id-verification') : null}
                className={`pb-1 ${
                    activeTab === 'id-verification'
                        ? 'text-gray-900 border-b-2 border-gray-900'
                        : 'text-gray-400'
                }`}
            >
                ID Verification
            </button>
        </div>
    );

    const renderBasicDetails = () => (
        <>
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold">Welcome to Spur+Konfer</h1>
                <p className="text-gray-600">
                    To begin your application, please enter your organization's details
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <TextInput 
                    label="Your first name" 
                    required
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                />
                
                <TextInput 
                    label="Your last name" 
                    required
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                />
                
                <TextInput 
                    label="Your position/title" 
                    required
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                />
                
                <TextInput 
                    label="Brief bio & expertise" 
                    required
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    isTextArea
                />
                
                <TextInput 
                    label="Link to your LinkedIn" 
                    required
                    name="linkedIn"
                    value={formData.linkedIn}
                    onChange={handleChange}
                    error={errors.linkedIn}
                    placeholder="https://linkedin.com/in/your-profile"
                />
                
                <div className="pt-4">
                    <Button 
                        type="submit"
                        disabled={!isFormValid()}
                        liquid
                        size="lg"
                        variant="primary"
                    > 
                        Continue
                    </Button>
                </div>
            </form>
        </>
    );

    const renderIdVerification = () => (
        <>
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold">Verify your Identity</h1>
                <p className="text-gray-600">
                    To continue, please verify your identity
                </p>
            </div>

            <div className="bg-gray-100 rounded-lg p-8 my-8 flex items-center justify-center min-h-[300px]">
                <p className="text-gray-600 text-lg">KYC Platform embed?</p>
            </div>

            <div className="pt-4">
                <Button 
                    type="button"
                    liquid
                    size="lg"
                    variant="primary"
                > 
                    Register
                </Button>
            </div>
        </>
    );

    return (
        <FormContainer>
            <div className="space-y-6">
                {renderTabs()}
                {activeTab === 'basic-details' ? renderBasicDetails() : renderIdVerification()}
            </div>
        </FormContainer>
    );
};

export { RegistrationForm };