import { DashboardLayout, Section, Grid, Footer, Header, FormContainer } from '@components';
import { Button } from '@components';

const DashboardPage = () => {
  return (
    <DashboardLayout>
      {/* header */}
      <Header>
        <Section 
          width="full" 
          padding="small" 
          background="bg-white"
          container={false}
        >
          <div className="px-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Dashboard</h2>
            <Button size="sm">Action</Button>
          </div>
        </Section>
      </Header>

      {/* main content */}
      <div className="flex-1 overflow-y-auto">
        <Section 
          width="full" 
          padding="large" 
          container={false}
        >
          <div className="px-6">
            <Grid columns={2} gap="large">
              {/* left column */}
              <div className="space-y-6">
                <FormContainer title="Stats">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Stat 1</p>
                      <p className="text-2xl font-bold">123</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Stat 2</p>
                      <p className="text-2xl font-bold">456</p>
                    </div>
                  </div>
                </FormContainer>

                <FormContainer title="Recent Items">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <div>
                        <p className="font-medium">Item 1</p>
                        <p className="text-sm text-gray-600">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <div>
                        <p className="font-medium">Item 2</p>
                        <p className="text-sm text-gray-600">4 hours ago</p>
                      </div>
                    </div>
                  </div>
                </FormContainer>
              </div>

              {/* right column */}
              <div className="space-y-6">
                <FormContainer title="Actions">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" liquid>Action 1</Button>
                    <Button variant="outline" liquid>Action 2</Button>
                    <Button variant="outline" liquid>Action 3</Button>
                    <Button variant="outline" liquid>Action 4</Button>
                  </div>
                </FormContainer>
              </div>
            </Grid>
          </div>
        </Section>
      </div>

      {/* footer */}
      <Footer>
        <Section 
          width="full" 
          padding="normal" 
          background="bg-gray-200"
          container={false}
        >
          <div className="px-6 text-center text-sm text-gray-600">
            <p>Footer text</p>
          </div>
        </Section>
      </Footer>
    </DashboardLayout>
  );
};

export { DashboardPage }; 