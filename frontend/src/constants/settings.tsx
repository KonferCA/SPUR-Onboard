import { FiUser, FiBriefcase, FiCreditCard } from 'react-icons/fi';
import type { SettingsRoute } from '@/types/settings';

export const SETTINGS_ROUTES: SettingsRoute[] = [
    {
        path: '/user/settings/profile',
        label: 'Personal Profile',
        icon: <FiUser className="w-4 h-4" />,
    },
    {
        path: '/user/settings/wallet',
        label: 'Wallet',
        icon: <FiCreditCard className="w-4 h-4" />,
    },
] as const;