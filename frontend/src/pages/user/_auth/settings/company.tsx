import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { TextInput, TextArea, Button, Dropdown, DateInput, NotificationBanner } from '@/components'
import { getCompany, updateCompany } from '@/services/company'
import type { Company, UpdateCompanyRequest } from '@/types/company'
import type { DropdownOption } from '@/components'

const companyStages: DropdownOption[] = [
  { id: 'pre-seed', label: 'Pre-Seed', value: 'pre-seed' },
  { id: 'seed', label: 'Seed', value: 'seed' },
  { id: 'series-a', label: 'Series A', value: 'series-a' },
  { id: 'series-b', label: 'Series B', value: 'series-b' },
  { id: 'series-c', label: 'Series C', value: 'series-c' },
  { id: 'public', label: 'Public', value: 'public' },
]

const CompanySettings = () => {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [selectedStage, setSelectedStage] = useState<DropdownOption | null>(null)
  const [dateValue, setDateValue] = useState<string>('')

  // Fetch company data
  const { data: company, isLoading } = useQuery<Company>({
    queryKey: ['company'],
    queryFn: getCompany,
  })

  // Update company mutation
  const { mutate: updateProfile, isLoading: isUpdating } = useMutation({
    mutationFn: (data: UpdateCompanyRequest) => updateCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] })
      setError(null)
    },
    onError: (err) => {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to update company profile')
      }
    },
  })

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name') as string,
      date_founded: dateValue,
      stage: selectedStage?.value ?? '',
      description: formData.get('description') as string,
    }

    try {
      updateProfile(data)
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message)
      }
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">Company Profile</h1>

      {error && (
        <div className="mb-6">
          <NotificationBanner message={error} variant="error" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <TextInput
          name="name"
          label="Company name"
          defaultValue={company?.name}
          required
          description="Changes to company name will require additional approval"
        />

        <div className="space-y-1">
          <DateInput
            label="Date founded"
            value={dateValue}
            onChange={setDateValue}
            required
          />
          <p className="text-sm text-gray-500">Changes to date founded will require additional approval</p>
        </div>

        <div className="space-y-1">
          <Dropdown
            label="Company stage"
            options={companyStages}
            value={selectedStage}
            onChange={setSelectedStage}
            placeholder="Select company stage"
          />
          <p className="text-sm text-gray-500">Changes to company stage will require additional approval</p>
        </div>

        <TextArea
          name="description"
          label="Brief Description"
          defaultValue={company?.description}
          required
          rows={4}
        />

        <Button 
          type="submit" 
          variant="primary" 
          liquid 
          isLoading={isUpdating}
        >
          Save
        </Button>
      </form>
    </div>
  )
}

export const Route = createFileRoute('/user/_auth/settings/company')({
  component: CompanySettings,
}) 