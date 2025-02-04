import { createFileRoute } from '@tanstack/react-router';
import { Stack } from '@layouts';

export const Route = createFileRoute('/admin/_auth/_appshell/dashboard')({
    component: RouteComponent,
});

function RouteComponent() {
    return (
        <Stack gap="lg">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Projects"
                    value="24"
                    change="+12%"
                    trend="up"
                />
                <StatCard 
                    title="Active Users"
                    value="156"
                    change="+8%"
                    trend="up"
                />
                <StatCard 
                    title="Resources"
                    value="45"
                    change="-2%"
                    trend="down"
                />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-4">
                    <ActivityItem 
                        title="New Project Submitted"
                        description="AI Research Project submitted by John Doe"
                        time="2 hours ago"
                    />
                    <ActivityItem 
                        title="User Registration"
                        description="New startup registered: Tech Innovators Inc."
                        time="5 hours ago"
                    />
                    <ActivityItem 
                        title="Resource Updated"
                        description="Updated guidelines for project submission"
                        time="1 day ago"
                    />
                </div>
            </div>
        </Stack>
    );
}

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
}

function StatCard({ title, value, change, trend }: StatCardProps) {
    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-semibold">{value}</span>
                <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {change}
                </span>
            </div>
        </div>
    );
}

interface ActivityItemProps {
    title: string;
    description: string;
    time: string;
}

function ActivityItem({ title, description, time }: ActivityItemProps) {
    return (
        <div className="flex items-start gap-4">
            <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
            <div className="flex-1">
                <h4 className="text-sm font-medium">{title}</h4>
                <p className="text-sm text-gray-500">{description}</p>
                <span className="text-xs text-gray-400">{time}</span>
            </div>
        </div>
    );
} 