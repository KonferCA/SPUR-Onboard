import React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { createProject } from '@/services/project'
import { useAuth } from '@/contexts'
import { useNavigate } from '@tanstack/react-router'

const NewProjectPage = () => {
  const navigate = useNavigate()
  const { accessToken } = useAuth()
  const hasTriggeredFetchRef = useRef(false)

  useEffect(() => {
    if (!accessToken || hasTriggeredFetchRef.current) return

    // create project on mount
    const newProject = async () => {
      const project = await createProject(accessToken)
      navigate({ to: `/user/project/${project.id}/form`, replace: true })
    }

    hasTriggeredFetchRef.current = true

    newProject()
  }, [accessToken])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  )
}

export const Route = createFileRoute('/user/_auth/project/new')({
  component: React.memo(NewProjectPage),
})
