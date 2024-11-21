import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { UserDashboard, TextInput, Dropdown, Section, Button, FileUpload } from '@components';

interface FormData {
  companyName: string;
  foundedDate: string;
  companyStage: string;
  investmentStage: string;
  description: string;
  inspiration: string;
  vision: string;
}

const stages = [
  { id: 1, label: 'Pre-seed', value: 'pre-seed' },
  { id: 2, label: 'Seed', value: 'seed' },
  { id: 3, label: 'Series A', value: 'series-a' },
  { id: 4, label: 'Series B', value: 'series-b' },
  { id: 5, label: 'Series C+', value: 'series-c-plus' },
];

const SubmitProjectPage = () => {
  const [currentStep, setCurrentStep] = useState<'A' | 'B'>('B');
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    foundedDate: '',
    companyStage: '',
    investmentStage: '',
    description: '',
    inspiration: '',
    vision: '',
  });

  const handleNext = () => {
    setCurrentStep('B');
  };

  const handleBack = () => {
    setCurrentStep('A');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <UserDashboard>
      <div className="max-w-2xl mx-auto">
        <Section>
          <div className="space-y-8">
            {/* Header with tabs - no animation */}
            <div>
              <h1 className="text-2xl font-semibold">Submit a project</h1>
              <div className="mt-2">
                <div className="flex gap-4 border-b border-gray-200">
                  <div 
                    className={`pb-2 px-4 cursor-pointer ${
                      currentStep === 'A' ? 'border-b-2 border-gray-900' : ''
                    }`}
                    onClick={() => setCurrentStep('A')}
                  >
                    <span className={`text-sm font-medium ${
                      currentStep === 'A' ? 'text-gray-900' : 'text-gray-500'
                    }`}>Part A</span>
                    <p className="text-xs text-gray-500">Application form</p>
                  </div>
                  <div 
                    className={`pb-2 px-4 cursor-pointer ${
                      currentStep === 'B' ? 'border-b-2 border-gray-900' : ''
                    }`}
                    onClick={() => setCurrentStep('B')}
                  >
                    <span className={`text-sm font-medium ${
                      currentStep === 'B' ? 'text-gray-900' : 'text-gray-500'
                    }`}>Part B</span>
                    <p className="text-xs text-gray-500">Document uploads</p>
                  </div>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* Part A Content */}
              {currentStep === 'A' && (
                <motion.div
                  key="part-a"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ 
                    duration: 0.15,
                    ease: "easeOut"
                  }}
                >
                  {/* bookkeeping section */}
                  <motion.div className="space-y-6" variants={containerVariants}>
                    <motion.h2 variants={itemVariants} className="text-xl font-semibold">
                      Bookkeeping
                    </motion.h2>
                    
                    <motion.div variants={itemVariants}>
                      <TextInput
                        label="What is the name of your company?"
                        value={formData.companyName}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          companyName: e.target.value
                        }))}
                        required
                      />
                    </motion.div>

                    <TextInput
                      type="date"
                      label="When was your company founded?"
                      value={formData.foundedDate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        foundedDate: e.target.value
                      }))}
                    />

                    <Dropdown
                      label="What stage is your company at?"
                      options={stages}
                      value={stages.find(s => s.value === formData.companyStage) || null}
                      onChange={(option) => setFormData(prev => ({
                        ...prev,
                        companyStage: option.value
                      }))}
                      placeholder="Select stage"
                    />

                    <Dropdown
                      label="What investment stage is your company at?"
                      options={stages}
                      value={stages.find(s => s.value === formData.investmentStage) || null}
                      onChange={(option) => setFormData(prev => ({
                        ...prev,
                        investmentStage: option.value
                      }))}
                      placeholder="Select investment stage"
                    />
                  </motion.div>

                  {/* company overview section */}
                  <motion.div 
                    className="space-y-6 mt-8" 
                    variants={containerVariants}
                  >
                    <motion.h2 variants={itemVariants} className="text-xl font-semibold">
                      Company Overview
                    </motion.h2>
                    <p className="text-sm text-gray-500">
                      Please do not go into detail about your product in this section, you will have a chance to do so
                      in the following sections of the form.
                    </p>

                    <TextInput
                      label="Brief description of your company"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                      required
                      multiline
                      rows={4}
                    />

                    <TextInput
                      label="What inspired you to start this company, and what is the core problem you're solving?"
                      value={formData.inspiration}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        inspiration: e.target.value
                      }))}
                      required
                      multiline
                      rows={4}
                    />

                    <TextInput
                      label="What is your long-term vision for the company, and how do you plan to disrupt or lead your market?"
                      value={formData.vision}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        vision: e.target.value
                      }))}
                      required
                      multiline
                      rows={4}
                    />
                  </motion.div>

                  {/* Add navigation buttons at the bottom */}
                  <div className="flex justify-end pt-8">
                    <Button onClick={handleNext}>
                      Next: Document Uploads
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Part B Content */}
              {currentStep === 'B' && (
                <motion.div
                  key="part-b"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ 
                    duration: 0.15,
                    ease: "easeOut"
                  }}
                >
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Upload company business documents</h2>
                    <p className="text-gray-600">
                      To help us verify your organization's legitimacy, please provide us with business related documents.
                    </p>

                    <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                      <div>
                        <h3 className="font-medium mb-2">Example of documents include:</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium">Financial Statements</h4>
                            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                              <li>Income statements, balance sheets, cash flow statements</li>
                              <li>Tax returns (federal or provincial)</li>
                              <li>Recent bank statements</li>
                              <li>Financial Projections / Forecasts</li>
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium">Company Registration Proof</h4>
                            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                              <li>Certificate of Incorporation</li>
                              <li>Business number (BN)</li>
                            </ul>
                          </div>

                          <div>
                            <h4 className="font-medium">Business Model Documents</h4>
                            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                              <li>Business Plan</li>
                              <li>Revenue Models</li>
                              <li>Pitch Decks</li>
                              <li>Capitalization Tables</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Accepted file types: PDF, PNG, JPEG. Maximum 50MB per file
                      </p>
                      <FileUpload 
                        onFilesChange={(files) => console.log('Files:', files)}
                        maxSizeMB={50}
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Please ensure you properly name your files so we can process your application efficiently
                      </p>
                    </div>

                    <div className="pt-6">
                      <button 
                        className="w-full py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                        onClick={() => console.log('Submit application')}
                      >
                        Submit Application
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Section>
      </div>
    </UserDashboard>
  );
};

export { SubmitProjectPage }; 