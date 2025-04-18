import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { usePageTitle } from '@/utils';

import {
    CreateProjectImage,
    BrowseInvestImage,
    HackathonClaimImage,
    FreelanceApplicationImage,
    PitchCompClaimImage,
    PencilIcon,
    GrowIcon,
    PodiumIcon,
    LaptopGuyIcon,
    TrophyIcon,
    PencilIconHover,
    GrowIconHover,
    PodiumIconHover,
    LaptopGuyIconHover,
    TrophyIconHover,
} from '@/assets';

const cards = [
    {
        id: 'create-project',
        title: 'Create Project',
        description: 'Launch your startup and attract funds from investors',
        icon: PencilIcon,
        iconHover: PencilIconHover,
        image: CreateProjectImage,
        link: '/user/project/new',
        disabled: false,
    },
    {
        id: 'browse-invest',
        title: 'Browse and Invest',
        description: 'Discover and Invest in top startups and businesses',
        icon: GrowIcon,
        iconHover: GrowIconHover,
        image: BrowseInvestImage,
        link: '/user/dashboard',
        disabled: false,
    },
    {
        id: 'hackathon-claim',
        title: 'Hackathon Claim',
        description: 'Claim rewards and prizes from our hackathons',
        icon: PodiumIcon,
        iconHover: PodiumIconHover,
        image: HackathonClaimImage,
        link: '/user/hackathon',
        disabled: true,
    },
    {
        id: 'freelance-application',
        title: 'Freelance Application',
        description: 'Get hired from growing startups and businesses',
        icon: LaptopGuyIcon,
        iconHover: LaptopGuyIconHover,
        image: FreelanceApplicationImage,
        link: '/user/freelance',
        disabled: true,
    },
    {
        id: 'pitch-comp-claim',
        title: 'Pitch Comp Claim',
        description: 'Claim rewards and prizes from pitch competitions',
        icon: TrophyIcon,
        iconHover: TrophyIconHover,
        image: PitchCompClaimImage,
        link: '/user/pitch',
        disabled: true,
    },
];

const HomePage: React.FC = () => {
    usePageTitle();

    const cardClassName =
        'group block p-6 rounded-lg border-2 border-gray-200 hover:border-[#F4802F] hover:shadow-[0_0_0_1px_#F4802F] transition-all duration-300 relative overflow-hidden h-60 bg-white hover:bg-[rgba(255,194,152,0.25)]';
    const disabledCardClassName =
        'block p-6 rounded-lg border-2 border-gray-200 relative overflow-hidden h-60 bg-white opacity-40 cursor-not-allowed';

    return (
        <div className="flex flex-col justify-between min-h-screen">
            <div className="p-6 pt-20 max-w-6xl mx-auto w-full">
                <h1 className="text-4xl font-bold mb-6">
                    Welcome to <span className="text-[#F4802F]">Onboard</span>.
                </h1>

                <p className="text-xl mb-10">select an option to get started</p>

                <hr className="mb-10" />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map((card) =>
                        card.disabled ? (
                            <div
                                key={card.id}
                                className={disabledCardClassName}
                                title="Coming soon"
                            >
                                <div className="flex flex-col h-full">
                                    <div className="mb-12">
                                        <h2 className="text-2xl mb-2">
                                            {card.title}
                                        </h2>

                                        <p className="text-gray-600">
                                            {card.description}
                                        </p>
                                    </div>

                                    {/* bottom left icon */}
                                    <div className="absolute bottom-6 left-6">
                                        <div className="w-12 h-12 relative">
                                            <img
                                                src={card.icon}
                                                alt={`${card.title} icon`}
                                                className="w-12 h-12"
                                            />
                                        </div>
                                    </div>

                                    {/* bottom right main image */}
                                    <div className="absolute bottom-0 right-0">
                                        <img
                                            src={card.image}
                                            alt={card.title}
                                            className="w-32 h-32 opacity-25"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link
                                key={card.id}
                                to={card.link}
                                className={cardClassName}
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
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export const Route = createFileRoute('/user/_auth/_appshell/home')({
    component: HomePage,
});
