import { createFileRoute } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  TextInput,
  Dropdown,
  FileUpload,
  TeamMembers,
  SocialLinks,
  TextArea,
  DateInput,
} from '@components'
import { Section } from '@layouts'
import type { FormField, FormData } from '@/types'
import { projectFormSchema } from '@/config/forms'
import { createProject } from '@/services'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/contexts/AuthContext'

// TODO: missing anchor links. this page should not be using the same app shell layout
// only need to change the layout prefix in the file name, i.e: _appshell to new layout name.

// Code is commented until a new layout has been defined for the page
// const renderAnchorLinks = () => {
//     const links =
//         currentStepData?.sections.map((section) => ({
//             label: section.title,
//             target: `#${section.id}`,
//         })) || [];
//
//     return (
//         <div className="w-64 bg-white border-r border-gray-200">
//             <nav className="sticky top-0 py-4">
//                 <AnchorLinks links={links}>
//                     {(link) => (
//                         <span
//                             className={
//                                 'block px-6 py-2 text-sm transition hover:text-gray-800 ' +
//                                 (link.active
//                                     ? 'text-black font-medium'
//                                     : 'text-gray-400')
//                             }
//                         >
//                             {link.label}
//                         </span>
//                     )}
//                 </AnchorLinks>
//             </nav>
//         </div>
//     );
// };
//
const SubmitProjectPage = () => {
  const [currentStep, setCurrentStep] = useState<'A' | 'B'>('A')
  const [formData, setFormData] = useState<FormData>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { companyId } = useAuth()

  const fillWithSampleData = () => {
    const sampleData = {
      // Bookkeeping
      companyName: 'TechVision AI Solutions',
      foundedDate: '2023-06-15',
      companyStage: 'seed',
      investmentStage: 'seed',

      // Company Overview
      description:
        'TechVision AI Solutions is a cutting-edge artificial intelligence company focused on developing innovative computer vision solutions for retail and manufacturing industries. Our proprietary AI algorithms help businesses automate quality control, optimize inventory management, and enhance customer experiences.',
      inspiration:
        'After working in manufacturing for over a decade, we witnessed firsthand the inefficiencies and errors in manual quality control processes. This inspired us to develop an AI-powered solution that could perform inspections with greater accuracy and consistency, while significantly reducing costs and improving production speed.',
      vision:
        'Our vision is to become the global leader in AI-powered visual inspection and analytics. We aim to revolutionize how businesses handle quality control and inventory management by making advanced computer vision technology accessible and affordable for companies of all sizes. Within 5 years, we plan to expand our solutions across multiple industries and establish ourselves as the industry standard for automated visual inspection.',

      // Product Overview
      'product-description':
        'TechVision AI Solutions differentiates itself through its specialized focus on retail and manufacturing computer vision applications, offering end-to-end solutions rather than standalone AI capabilities like many competitors. The defensibility primarily relies on proprietary algorithms, though this could be strengthened by developing industry-specific datasets, building network effects across the customer base, and creating high switching costs through deep operational integration. However, the current positioning would benefit from more specific technical differentiators and unique data assets to create a stronger competitive moat.',
      'product-roadmap':
        'Within 12 months, TechVision will roll out core quality control and inventory modules (Q1), enhance customer analytics (Q2), develop advanced automation features (Q3), and launch customization tools with automated reporting (Q4).',

      // Customer Demographic
      'target-demographic':
        'TechVision AI Solutions primarily targets mid to large-scale retail chains and manufacturing facilities that need to modernize their quality control and inventory processes. The solution is compelling to these customers because it directly addresses their key pain points: reducing costly quality control errors, eliminating manual inventory counts, and improving customer satisfaction through better stock management - all of which impact their bottom line through both cost savings and revenue growth opportunities.',
      'addressable-market':
        'TechVision AI Solutions operates in a substantial addressable market combining retail and manufacturing AI solutions, estimated at $45B globally and growing at 28% annually. The market capture strategy involves a three-phase approach: initially targeting medium-sized manufacturers and retail chains with high quality control costs in North America (representing $5B of the TAM), then expanding to enterprise clients and European markets by year 2, and finally scaling to Asia-Pacific regions and smaller businesses through a more accessible SaaS model in year 3, with a goal of capturing 2-3% market share within 5 years through direct sales, strategic partnerships with existing automation providers, and channel resellers.',

      // Financials
      'company-revenue':
        "TechVision AI Solutions has an ARR of $4.2M as of Q4 2024, representing a 180% growth from the previous year's $1.5M. Our revenue comes primarily from subscription licenses to our AI quality control platform, with our top 3 enterprise clients accounting for 40% of ARR, while our mid-market segment is showing the fastest growth at 215% year-over-year.",
      'company-raised':
        'TechVision AI Solutions has raised a total of $8.2M across two funding rounds: a $1.2M seed round in early 2023 led by First Tech Ventures with participation from angel investors, followed by a $7M Series A in late 2024 led by AI Capital Partners, with strategic investment from Manufacturing Innovation Fund and existing investors participating.',
      'company-valuation':
        'Following our recent Series A round in late 2024, TechVision AI Solutions is valued at $42M, based on a 5x ARR multiple which reflects our strong growth trajectory (+180% YoY) and established position in the retail and manufacturing AI sectors. This represents a significant increase from our $12M valuation during our seed round, driven by our rapid customer acquisition and expanding product capabilities.',
      'company-monthly-expenses':
        "TechVision AI Solutions' monthly burn rate is approximately $320,000, with the following breakdown: $180,000 for our 25-person team (engineering, sales, and operations), $45,000 for cloud infrastructure and computing costs, $35,000 for office and operational expenses, $40,000 for marketing and sales activities, and $20,000 for R&D and other miscellaneous costs. With our current runway and revenue growth, this gives us approximately 18 months of operating capital.",
      'company-main-revenue':
        'TechVision AI Solutions currently generates $4.2M ARR across three revenue streams: Enterprise Subscriptions ($3.2M, priced $15-45K/month), Mid-Market Solutions ($800K, priced $5-12K/month), and Professional Services ($200K), with projections to reach $11.5M ARR in 12 months and $33M ARR in 36 months through market expansion, increased enterprise adoption, and scaling of our channel partner program.',
      'company-funding':
        'TechVision AI Solutions has raised $8.2M total ($1.2M seed, $7M Series A), with capital allocation focused 45% on R&D and engineering (expanding our AI capabilities and product features), 25% on sales and marketing (building enterprise sales team and channel partnerships), 20% on operations and infrastructure scaling, and 10% maintained as operating runway - these investments have enabled our 180% YoY growth and expansion into enterprise markets.',

      // Team Members
      'team-members': [
        {
          id: '1',
          name: 'Sarah Chen',
          role: 'CEO & Co-founder',
          avatar: '',
        },
        {
          id: '2',
          name: 'Michael Rodriguez',
          role: 'CTO & Co-founder',
          avatar: '',
        },
        {
          id: '3',
          name: 'Dr. Emily Thompson',
          role: 'Head of AI Research',
          avatar: '',
        },
      ],

      // Social Links
      'social-links': [
        {
          id: '1',
          type: 'website',
          url: 'https://techvision-ai.com',
        },
        {
          id: '2',
          type: 'linkedin',
          url: 'https://linkedin.com/company/techvision-ai',
        },
        {
          id: '3',
          type: 'twitter',
          url: 'https://twitter.com/techvision_ai',
        },
      ],
    }

    setFormData(sampleData)
  }

  const handleNext = () => {
    setCurrentStep('B')
  }

  const handleChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }))
  }

  const handleSubmit = async () => {
    if (!companyId) {
      setError('Company ID not found. Please create a company first.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      // Transform all sections from the form schema
      const sections = projectFormSchema.flatMap((step) =>
        step.sections.map((section) => ({
          title: section.title,
          questions: section.fields.map((field) => {
            let answer = formData[field.id]

            // Convert arrays to strings (will fix better later)
            if (Array.isArray(answer)) {
              if (field.type === 'team-members') {
                answer = answer
                  .map((member: any) => `${member.name} (${member.role})`)
                  .join('\n')
              } else if (field.type === 'social-links') {
                answer = answer
                  .map((link: any) => `${link.type}: ${link.url}`)
                  .join('\n')
              } else {
                answer = answer.join(', ')
              }
            }

            return {
              question: field.label,
              answer: answer?.toString() || '',
            }
          }),
        })),
      )

      const payload = {
        company_id: companyId,
        title: formData.companyName || '',
        description: formData.description || '',
        status: 'in_review',
        files: formData.documents || [],
        links:
          formData['social-links']?.map(
            (link: { type: string; url: string }) => ({
              link_type: link.type,
              url: link.url,
            }),
          ) || [],
        sections: sections,
      }

      // Debug logs
      console.log('Final payload:', payload)

      const project = await createProject(companyId, payload)
      console.log('Created project:', project)

      navigate({ to: '/user/dashboard' })
    } catch (err) {
      console.error('Failed to submit project:', err)
      setError(err instanceof Error ? err.message : 'Failed to submit project')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'text':
        return (
          <TextInput
            label={field.label}
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        )
      case 'date':
        return (
          <DateInput
            label={field.label}
            value={formData[field.id] || ''}
            onChange={(value) => handleChange(field.id, value)}
            required={field.required}
          />
        )
      case 'textarea':
        return (
          <TextArea
            label={field.label}
            value={formData[field.id] || ''}
            onChange={(e) => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={field.rows}
          />
        )
      case 'dropdown':
        return (
          <Dropdown
            label={field.label}
            options={field.options || []}
            value={
              field.options?.find((opt) => opt.value === formData[field.id]) ||
              null
            }
            onChange={(option) => handleChange(field.id, option.value)}
            placeholder={`Select ${field.label.toLowerCase()}`}
          />
        )
      case 'file':
        return (
          <FileUpload
            onFilesChange={(files) => handleChange(field.id, files)}
          />
        )
      case 'team-members':
        return (
          <TeamMembers
            value={formData[field.id] || []}
            onChange={(members) => handleChange(field.id, members)}
          />
        )
      case 'social-links':
        return (
          <SocialLinks
            value={formData[field.id] || []}
            onChange={(links) => handleChange(field.id, links)}
          />
        )
      default:
        return null
    }
  }

  const currentStepData = projectFormSchema.find(
    (step) => step.id === currentStep,
  )

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <Section>
          <div className="space-y-8">
            {/* Header with tabs */}
            <div>
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Submit a project</h1>
                <div className="flex gap-4">
                  <button
                    onClick={fillWithSampleData}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Fill with Sample Data
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex gap-4 border-b border-gray-200">
                  {projectFormSchema.map((step) => (
                    <div
                      key={step.id}
                      className={`pb-2 px-4 cursor-pointer ${
                        currentStep === step.id
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-gray-500'
                      }`}
                      onClick={() => setCurrentStep(step.id)}
                    >
                      {step.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form sections */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {currentStepData?.sections.map((section) => (
                  <div key={section.id} id={section.id} className="space-y-6">
                    <h2 className="text-lg font-medium text-gray-900">
                      {section.title}
                    </h2>
                    <div className="space-y-6">
                      {section.fields.map((field) => (
                        <div key={field.id}>{renderField(field)}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Error message */}
            {error && <div className="text-red-600 text-sm">{error}</div>}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-8">
              {currentStep === 'A' ? (
                <div />
              ) : (
                <button
                  onClick={() => setCurrentStep('A')}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Back
                </button>
              )}
              {currentStep === 'A' ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              )}
            </div>
          </div>
        </Section>
      </div>
    </>
  )
}

export const Route = createFileRoute('/user/_auth/_appshell/project/submit')({
  component: SubmitProjectPage,
})
