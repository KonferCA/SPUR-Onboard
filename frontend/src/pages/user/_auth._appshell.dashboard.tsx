import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/user/_auth/_appshell/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/user/dashbaord"!</div>
}
