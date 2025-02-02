import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { TextInput, TextArea, Button } from '@/components';
import { SettingsPage } from '@/templates/SettingsPage/SettingsPage';
import { FiCalendar } from 'react-icons/fi';
import { getCompany, updateCompany } from '@/services';
import type { UpdateCompanyRequest } from '@/types/company';

export const Route = createFileRoute('/user/_auth/_appshell/settings/company')({
    component: CompanySettings,
});

const COMPANY_STAGES = [
    { value: 'pre_seed', label: 'Pre-Seed' },
    { value: 'seed', label: 'Seed' },
    { value: 'series_a', label: 'Series A' },
    { value: 'series_b', label: 'Series B' },
    { value: 'series_c', label: 'Series C' },
    { value: 'growth', label: 'Growth' },
] as const;

function CompanySettings() {
    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);

    // Fetch company data
    const { data: company, isLoading } = useQuery({
        queryKey: ['company'],
        queryFn: getCompany,
    });

    // Update company mutation
    const { mutate: updateProfile, isLoading: isUpdating } = useMutation({
        mutationFn: (data: UpdateCompanyRequest) => updateCompany(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['company'] });
            setError(null);
        },
        onError: (err) => {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to update company profile');
            }
        },
    });

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            date_founded: formData.get('date_founded') as string,
            stage: formData.get('stage') as string,
            description: formData.get('description') as string,
        };

        try {
            updateProfile(data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
        }
    };

    if (isLoading) {
        return <SettingsPage title="Company Profile">Loading...</SettingsPage>;
    }

    return (
        <SettingsPage title="Company Profile" error={error}>
            <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
                <div className="space-y-4">
                    <TextInput
                        name="name"
                        label="Company name"
                        defaultValue={company?.name}
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date founded
                        </label>
                        <div className="relative">
                            <TextInput
                                name="date_founded"
                                type="date"
                                defaultValue={company?.date_founded}
                                required
                                className="pl-10"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FiCalendar className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company stage
                        </label>
                        <select
                            name="stage"
                            defaultValue={company?.stage}
                            required
                            className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            {COMPANY_STAGES.map((stage) => (
                                <option key={stage.value} value={stage.value}>
                                    {stage.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <TextArea
                        name="description"
                        label="Company description"
                        defaultValue={company?.description}
                        required
                        rows={4}
                    />
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    liquid
                    isLoading={isUpdating}
                >
                    Save Changes
                </Button>
            </form>
        </SettingsPage>
    );
}
