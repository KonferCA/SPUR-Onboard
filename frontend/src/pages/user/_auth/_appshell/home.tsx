import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';

// main images
import CreateProjectImage from '@/assets/home/main/create_project.svg';
import BrowseInvestImage from '@/assets/home/main/browse_and_invest.svg';
import HackathonClaimImage from '@/assets/home/main/hackathon_claim.svg';
import FreelanceApplicationImage from '@/assets/home/main/freelance_application.svg';
import PitchCompClaimImage from '@/assets/home/main/pitch_comp_claim.svg';

// side icons - default (blue inner)
import PencilIcon from '@/assets/home/side/pencil.svg';
import GrowIcon from '@/assets/home/side/grow.svg';
import PodiumIcon from '@/assets/home/side/podium.svg';
import LaptopGuyIcon from '@/assets/home/side/laptop_guy.svg';
import TrophyIcon from '@/assets/home/side/trophy.svg';

// side icons - hovered (orange inner)
import PencilIconHover from '@/assets/home/side_hovered/pencil.svg';
import GrowIconHover from '@/assets/home/side_hovered/grow.svg';
import PodiumIconHover from '@/assets/home/side_hovered/podium.svg';
import LaptopGuyIconHover from '@/assets/home/side_hovered/laptop_guy.svg';
import TrophyIconHover from '@/assets/home/side_hovered/trophy.svg';

// card data
const cards = [
    {
        id: 'create-project',
        title: 'Create Project',
        description: 'Launch your startup and attract funds from investors',
        icon: PencilIcon,
        iconHover: PencilIconHover,
        image: CreateProjectImage,
        link: '/user/project/new',
    },
    {
        id: 'browse-invest',
        title: 'Browse and Invest',
        description: 'Discover and Invest in top startups and businesses',
        icon: GrowIcon,
        iconHover: GrowIconHover,
        image: BrowseInvestImage,
        link: '/user/browse',
    },
    {
        id: 'hackathon-claim',
        title: 'Hackathon Claim',
        description: 'Claim rewards and prizes from our hackathons',
        icon: PodiumIcon,
        iconHover: PodiumIconHover,
        image: HackathonClaimImage,
        link: '/user/hackathon',
    },
    {
        id: 'freelance-application',
        title: 'Freelance Application',
        description: 'Get hired from growing startups and businesses',
        icon: LaptopGuyIcon,
        iconHover: LaptopGuyIconHover,
        image: FreelanceApplicationImage,
        link: '/user/freelance',
    },
    {
        id: 'pitch-comp-claim',
        title: 'Pitch Comp Claim',
        description: 'Claim rewards and prizes from pitch competitions',
        icon: TrophyIcon,
        iconHover: TrophyIconHover,
        image: PitchCompClaimImage,
        link: '/user/pitch',
    },
];

const HomePage: React.FC = () => {
    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Welcome to Onboard</h1>

            <p className="text-xl mb-8">Select an option to get started</p>

            <hr className="my-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => (
                    <Link
                        key={card.id}
                        to={card.link}
                        className="group block p-6 rounded-lg border border-gray-200 hover:border-orange-400 transition-all duration-300 relative overflow-hidden h-60 hover:bg-orange-50 bg-white"
                    >
                        <div className="flex flex-col h-full">
                            <div className="mb-12">
                                <h2 className="text-2xl mb-2 group-hover:text-orange-500 transition-colors duration-300">
                                    {card.title}
                                </h2>
                                <p className="text-gray-600 group-hover:text-gray-900 transition-colors duration-300">
                                    {card.description}
                                </p>
                            </div>

                            {/* bottom left icon */}
                            <div className="absolute bottom-6 left-6">
                                <div className="w-12 h-12 transition-all duration-300 relative">
                                    {/* original icon - shown by default, hidden on hover */}
                                    <img
                                        src={card.icon}
                                        alt={`${card.title} icon`}
                                        className="w-12 h-12 absolute left-0 top-0 group-hover:opacity-0 transition-opacity duration-300"
                                    />

                                    {/* hover (orange) icon - hidden by default, shown on hover */}
                                    <img
                                        src={card.iconHover}
                                        alt={`${card.title} hover icon`}
                                        className="w-12 h-12 absolute left-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    />
                                </div>
                            </div>

                            {/* bottom right main image */}
                            <div className="absolute bottom-0 right-0">
                                <img
                                    src={card.image}
                                    alt={card.title}
                                    className="w-32 h-32 opacity-25 group-hover:opacity-100 transition-opacity duration-300"
                                />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export const Route = createFileRoute('/user/_auth/_appshell/home')({
    component: HomePage,
});
