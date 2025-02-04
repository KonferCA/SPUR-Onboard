import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/_auth/project/$projectId/form')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/user/_auth/project/$projectId/resume"!</div>
}
