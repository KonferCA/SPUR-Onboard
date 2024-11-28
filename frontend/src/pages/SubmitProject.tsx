import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { UserDashboard, TextInput, Dropdown, Section, Button, FileUpload, AnchorLinks, TeamMembers, SocialLinks, TextArea, DateInput } from '@components';
import type { FormField, FormData } from '@/types';
import { projectFormSchema } from '@/config/forms';

const SubmitProjectPage = () => {
  const [currentStep, setCurrentStep] = useState<'A' | 'B'>('A');
  const [formData, setFormData] = useState<FormData>({});

  const handleNext = () => {
    setCurrentStep('B');
  };

  const handleBack = () => {
    setCurrentStep('A');
  };

  const handleChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'text':
        return (
          <TextInput
            label={field.label}
            value={formData[field.id] || ''}
            onChange={(value) => handleChange(field.id, value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
      case 'date':
        return (
          <DateInput
            label={field.label}
            value={formData[field.id] || ''}
            onChange={(value) => handleChange(field.id, value)}
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <TextArea
            label={field.label}
            value={formData[field.id] || ''}
            onChange={(value) => handleChange(field.id, value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={field.rows}
          />
        );
      case 'dropdown':
        return (
          <Dropdown
            label={field.label}
            options={field.options || []}
            value={field.options?.find(opt => opt.value === formData[field.id]) || null}
            onChange={(option) => handleChange(field.id, option.value)}
            placeholder={`Select ${field.label.toLowerCase()}`}
          />
        );
      case 'file':
        return (
          <FileUpload
            onFilesChange={(files) => handleChange(field.id, files)}
          />
        );
      case 'team-members':
        return (
          <TeamMembers
            value={formData[field.id] || []}
            onChange={(members) => handleChange(field.id, members)}
          />
        );
      case 'social-links':
        return (
          <SocialLinks
            value={formData[field.id] || []}
            onChange={(links) => handleChange(field.id, links)}
          />
        );
      default:
        return null;
    }
  };

  const currentStepData = projectFormSchema.find(step => step.id === currentStep);

  const renderAnchorLinks = () => {
    const links = currentStepData?.sections.map(section => ({
      label: section.title,
      target: `#${section.id}`,
    })) || [];

    return (
      <div className="w-64 bg-white border-r border-gray-200">
        <nav className="sticky top-0 py-4">
          <AnchorLinks links={links}>
            {(link) => (
              <span
                className={
                  'block px-6 py-2 text-sm transition hover:text-gray-800 ' +
                  (link.active ? 'text-black font-medium' : 'text-gray-400')
                }
              >
                {link.label}
              </span>
            )}
          </AnchorLinks>
        </nav>
      </div>
    );
  };

  return (
    <UserDashboard customSidebar={renderAnchorLinks()}>
      <div className="max-w-2xl mx-auto">
        <Section>
          <div className="space-y-8">
            {/* Header with tabs */}
            <div>
              <h1 className="text-2xl font-semibold">Submit a project</h1>
              <div className="mt-2">
                <div className="flex gap-4 border-b border-gray-200">
                  {projectFormSchema.map(step => (
                    <div 
                      key={step.id}
                      className={`pb-2 px-4 cursor-pointer ${
                        currentStep === step.id ? 'border-b-2 border-gray-900' : ''
                      }`}
                      onClick={() => setCurrentStep(step.id)}
                    >
                      <span className={`text-sm font-medium ${
                        currentStep === step.id ? 'text-gray-900' : 'text-gray-500'
                      }`}>{step.title}</span>
                      <p className="text-xs text-gray-500">{step.subtitle}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ 
                  duration: 0.15,
                  ease: "easeOut"
                }}
              >
                {currentStepData?.sections.map(section => (
                  <div 
                    key={section.id}
                    id={section.id}
                    className="space-y-6 mt-8 first:mt-0"
                  >
                    <div>
                      <h2 className="text-xl font-semibold">{section.title}</h2>
                      {section.description && (
                        <p className="text-sm text-gray-500 mt-2">{section.description}</p>
                      )}
                    </div>

                    <div className="space-y-6">
                      {section.fields.map(field => renderField(field))}
                    </div>
                  </div>
                ))}

                {currentStep === 'A' && (
                  <div className="flex justify-end pt-8">
                    <Button onClick={handleNext}>
                      Next: Document Uploads
                    </Button>
                  </div>
                )}

                {currentStep === 'B' && (
                  <div className="pt-6">
                    <button 
                      className="w-full py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                      onClick={() => console.log('Submit application', formData)}
                    >
                      Submit Application
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </Section>
      </div>
    </UserDashboard>
  );
};

export { SubmitProjectPage }; 