import { Section, Container, Stack, Grid, Header, Footer } from '@layouts';
import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { FiArrowRight, FiCheck, FiGlobe, FiUsers, FiDollarSign } from 'react-icons/fi';

const Landing: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <Header>
                <Container className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-center py-6 space-y-4 md:space-y-0">
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-2xl font-bold">SPUR</h1>
                        </div>
                        <nav className="flex space-x-8 flex-1 justify-center">
                            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
                            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How it Works</a>
                            <a href="#benefits" className="text-gray-600 hover:text-gray-900">Benefits</a>
                        </nav>
                        <div className="flex items-center space-x-4 flex-1 justify-center md:justify-end">
                            <Link to="/auth" className="text-gray-600 hover:text-gray-900">Sign In</Link>
                            <Link to="/auth" className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800">Get Started</Link>
                        </div>
                    </div>
                </Container>
            </Header>

            {/* Hero Section */}
            <Section>
                <Container>
                    <div className="text-center max-w-4xl mx-auto py-20">
                        <h1 className="text-5xl font-bold mb-6">
                            Connecting Startups with Web3 Opportunities
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            SPUR helps startups navigate the Web3 ecosystem, find funding opportunities, and connect with the right partners to accelerate their growth.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <Link to="/auth" className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800">
                                Start Now
                                <FiArrowRight className="ml-2" />
                            </Link>

                            <button 
                                onClick={() => alert("TODO: make this button do something")}
                                className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md hover:border-gray-400"
                            >
                                Learn More
                            </button>
                        </div>
                    </div>
                </Container>
            </Section>

            {/* Features Section */}
            <Section className="bg-gray-50" data-section="features">
                <Container>
                    <div className="py-20">
                        <h2 className="text-3xl font-bold text-center mb-12">Why Choose SPUR</h2>
                        <div className="max-w-5xl mx-auto">
                            <Grid columns={2} gap="large">
                                <div className="p-8 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col items-center text-center">
                                    <FiGlobe className="w-12 h-12 text-gray-900 mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">Global Network</h3>
                                    <p className="text-gray-600">
                                        Access a worldwide network of Web3 investors, mentors, and partners ready to support your startup.
                                    </p>
                                </div>
                                <div className="p-8 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col items-center text-center">
                                    <FiUsers className="w-12 h-12 text-gray-900 mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">Expert Matching</h3>
                                    <p className="text-gray-600">
                                        Our smart matching system connects you with the perfect partners for your startup's needs.
                                    </p>
                                </div>
                                <div className="p-8 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col items-center text-center">
                                    <FiDollarSign className="w-12 h-12 text-gray-900 mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">Funding Access</h3>
                                    <p className="text-gray-600">
                                        Discover and apply to funding opportunities tailored to your startup's stage and goals.
                                    </p>
                                </div>
                                <div className="p-8 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col items-center text-center">
                                    <FiCheck className="w-12 h-12 text-gray-900 mb-4" />
                                    <h3 className="text-xl font-semibold mb-2">Verified Partners</h3>
                                    <p className="text-gray-600">
                                        Connect with thoroughly vetted partners and investors to ensure secure and reliable collaborations.
                                    </p>
                                </div>
                            </Grid>
                        </div>
                    </div>
                </Container>
            </Section>

            {/* How It Works Section */}
            <Section data-section="how-it-works">
                <Container>
                    <div className="py-20">
                        <h2 className="text-3xl font-bold text-center mb-12">How SPUR Works</h2>
                        <div className="max-w-3xl mx-auto">
                            <Stack gap="lg">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center">1</div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
                                        <p className="text-gray-600">Set up your startup's profile with key information about your team, vision, and goals.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center">2</div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
                                        <p className="text-gray-600">Link your Web3 wallet to access the full range of SPUR's features and opportunities.</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center">3</div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Explore Opportunities</h3>
                                        <p className="text-gray-600">Browse through curated opportunities and connect with potential partners and investors.</p>
                                    </div>
                                </div>
                            </Stack>
                        </div>
                    </div>
                </Container>
            </Section>

            {/* Benefits Section */}
            <Section className="bg-white" data-section="benefits">
                <Container>
                    <div className="py-20">
                        <div className="max-w-5xl mx-auto text-center">
                            <h2 className="text-3xl font-bold mb-4">Benefits for Startups</h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Everything you need to succeed in the Web3 ecosystem, all in one place.
                            </p>
                            <p className="text-gray-600 mb-12 max-w-3xl mx-auto">
                                (Totally not written with ChatGPT)
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="p-6 rounded-lg">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiCheck className="w-6 h-6 text-gray-900" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Verified Partners</h3>
                                    <p className="text-gray-600">Access to thoroughly vetted Web3 investors and partners ready to support your growth.</p>
                                </div>
                                <div className="p-6 rounded-lg">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiCheck className="w-6 h-6 text-gray-900" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Smart Matching</h3>
                                    <p className="text-gray-600">Our intelligent system connects you with opportunities that match your startup's needs.</p>
                                </div>
                                <div className="p-6 rounded-lg">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiCheck className="w-6 h-6 text-gray-900" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Easy Process</h3>
                                    <p className="text-gray-600">Streamlined application process with dedicated support every step of the way.</p>
                                </div>
                                <div className="p-6 rounded-lg">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiCheck className="w-6 h-6 text-gray-900" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Expert Support</h3>
                                    <p className="text-gray-600">Access to resources, guides, and dedicated support to help you succeed.</p>
                                </div>
                                <div className="p-6 rounded-lg">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiCheck className="w-6 h-6 text-gray-900" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Regular Events</h3>
                                    <p className="text-gray-600">Join networking events and workshops to connect with the Web3 community.</p>
                                </div>
                                <div className="p-6 rounded-lg">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiCheck className="w-6 h-6 text-gray-900" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">Secure Platform</h3>
                                    <p className="text-gray-600">Built with security and transparency at its core for peace of mind.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </Section>

            {/* CTA Section */}
            <Section>
                <Container>
                    <div className="text-center max-w-3xl mx-auto py-20">
                        <h2 className="text-3xl font-bold mb-6">Ready to Accelerate Your Startup?</h2>
                        <p className="text-xl text-gray-600 mb-8">
                            Join SPUR today and connect with the opportunities that will take your startup to the next level.
                        </p>
                        <Link to="/auth" className="inline-flex items-center px-8 py-4 bg-gray-900 text-white rounded-md hover:bg-gray-800 text-lg">
                            Get Started Now
                            <FiArrowRight className="ml-2" />
                        </Link>
                    </div>
                </Container>
            </Section>

            {/* Footer */}
            <Footer>
                <Container className="max-w-7xl mx-auto">
                    <div className="py-12">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                            <div className="flex flex-col items-center">
                                <h3 className="text-lg font-semibold mb-4">SPUR</h3>
                                <p className="text-gray-600">Connecting startups with Web3 opportunities.</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <h3 className="text-lg font-semibold mb-4">Platform</h3>
                                <Stack gap="xs" className="items-center">
                                    <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
                                    <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How it Works</a>
                                    <a href="#benefits" className="text-gray-600 hover:text-gray-900">Benefits</a>
                                </Stack>
                            </div>
                            <div className="flex flex-col items-center">
                                <h3 className="text-lg font-semibold mb-4">Resources</h3>
                                <Stack gap="xs" className="items-center">
                                    <a href="#" className="text-gray-600 hover:text-gray-900">Documentation</a>
                                    <a href="#" className="text-gray-600 hover:text-gray-900">Blog</a>
                                    <a href="#" className="text-gray-600 hover:text-gray-900">Support</a>
                                </Stack>
                            </div>
                            <div className="flex flex-col items-center">
                                <h3 className="text-lg font-semibold mb-4">Legal</h3>
                                <Stack gap="xs" className="items-center">
                                    <a href="#" className="text-gray-600 hover:text-gray-900">Privacy Policy</a>
                                    <a href="#" className="text-gray-600 hover:text-gray-900">Terms of Service</a>
                                    <a href="#" className="text-gray-600 hover:text-gray-900">Contact</a>
                                </Stack>
                            </div>
                        </div>
                        <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-600">
                            <p>&copy; {new Date().getFullYear()} SPUR. All rights reserved.</p>
                        </div>
                    </div>
                </Container>
            </Footer>
        </div>
    );
};

export const Route = createFileRoute('/')({
    component: Landing,
});
