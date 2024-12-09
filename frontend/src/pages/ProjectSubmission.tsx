import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminDashboard } from '@/components/layout';
import { MOCK_PROJECTS } from '@/services/project';
import type { Project } from '@/services/project';
import { format } from 'date-fns';

export const ProjectSubmissionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Find project from mock data
  const project = MOCK_PROJECTS.find((p: Project) => p.id === id);

  if (!project) {
    return (
      <AdminDashboard>
        <div className="text-red-600">Project not found</div>
      </AdminDashboard>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <AdminDashboard>
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-gray-200 pb-4">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Reviewing Project: {project.title}</h1>
              <p className="mt-1 text-sm text-gray-500">Submitted on {formatDate(project.created_at)}</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex space-x-3">
                <button
                  type="button"
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  onClick={() => navigate(`/admin/projects/${id}`)}
                >
                  Back to Overview
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sidebar */}
        <div className="flex gap-8 mt-8">
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {project.sections.map((section, index) => (
                <a
                  key={section.title}
                  href={`#${section.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="group flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                >
                  <span className="truncate">
                    {index + 1}. {section.title}
                  </span>
                </a>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="space-y-8">
              {/* Uploaded Documents */}
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">
                    Uploaded Documents
                  </h3>
                  <div className="mt-4 divide-y divide-gray-200">
                    {project.documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between py-3">
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                          <span className="ml-2 flex-1 w-0 truncate text-sm text-gray-500">
                            {doc.name}
                          </span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <button
                            onClick={() => window.open(doc.url, '_blank')}
                            className="font-medium text-indigo-600 hover:text-indigo-500 text-sm"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sections */}
              {project.sections.map(section => (
                <div
                  key={section.title}
                  id={section.title.toLowerCase().replace(/\s+/g, '-')}
                  className="bg-white shadow sm:rounded-lg"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">
                      {section.title}
                    </h3>
                    <div className="mt-4 space-y-6">
                      {section.questions.map((q, i) => (
                        <div key={i}>
                          <h4 className="text-sm font-medium text-gray-900">{q.question}</h4>
                          <p className="mt-2 text-sm text-gray-500">{q.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminDashboard>
  );
}; 