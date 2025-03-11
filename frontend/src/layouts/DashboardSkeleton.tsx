export const DashboardSkeleton = () => {
    return (
        <div className="px-6 animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
            <div className="space-y-4">
                <div className="h-4 w-full max-w-md mx-auto bg-gray-200 rounded" />
                <div className="h-4 w-full max-w-sm mx-auto bg-gray-200 rounded" />
            </div>
        </div>
    );
};
