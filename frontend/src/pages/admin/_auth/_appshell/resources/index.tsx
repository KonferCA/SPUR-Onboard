import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/_auth/_appshell/resources/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/_auth/_appshell/resources/"!</div>
}
