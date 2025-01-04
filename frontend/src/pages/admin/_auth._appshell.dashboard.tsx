import { createFileRoute } from '@tanstack/react-router'
import { Button, FormContainer } from '@components'
import { Section, Grid } from '@layouts'

const AdminDashboardPage = () => {
  return (
    <>
      {/* main content */}
      <div className="flex-1 overflow-y-auto">
        <Section width="full" padding="large" container={false}>
          <div className="px-6">
            <Grid columns={2} gap="large">
              {/* left column */}
              <div className="space-y-6">
                <FormContainer title="Admin Stats">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold">1,234</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Active Projects</p>
                      <p className="text-2xl font-bold">567</p>
                    </div>
                  </div>
                </FormContainer>

                <FormContainer title="Pending Approvals">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <div>
                        <p className="font-medium">Project XYZ</p>
                        <p className="text-sm text-gray-600">Awaiting review</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <div>
                        <p className="font-medium">Project ABC</p>
                        <p className="text-sm text-gray-600">
                          Pending verification
                        </p>
                      </div>
                    </div>
                  </div>
                </FormContainer>
              </div>

              {/* right column */}
              <div className="space-y-6">
                <FormContainer title="Quick Actions">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" liquid>
                      Review Projects
                    </Button>
                    <Button variant="outline" liquid>
                      Manage Users
                    </Button>
                    <Button variant="outline" liquid>
                      System Settings
                    </Button>
                    <Button variant="outline" liquid>
                      View Reports
                    </Button>
                  </div>
                </FormContainer>
              </div>
            </Grid>
          </div>
        </Section>
      </div>
    </>
  )
}

export const Route = createFileRoute('/admin/_auth/_appshell/dashboard')({
  component: AdminDashboardPage,
})
