import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { BsCheckCircleFill, BsXCircleFill, BsExclamationTriangleFill, BsClock } from 'react-icons/bs';

interface HealthReport {
    status: string;
    timestamp: string;
    database: {
        connected: boolean;
        latency_ms: number;
        postgres_version?: string;
        error?: string;
    };
    system: {
        version: string;
        go_version: string;
        num_goroutines: number;
        memory_usage: number;
    };
    services: Array<{
        name: string;
        status: string;
        last_ping: string;
        latency_ms: number;
        message?: string;
    }>;
}

const StatusIndicator = ({ status }: { status: string }) => {
    switch (status) {
    case 'healthy':
        return <BsCheckCircleFill className="text-green-500 w-6 h-6" />;
    case 'unhealthy':
        return <BsXCircleFill className="text-red-500 w-6 h-6" />;
    case 'degraded':
        return <BsExclamationTriangleFill className="text-yellow-500 w-6 h-6" />;
    default:
        return <BsExclamationTriangleFill className="text-gray-500 w-6 h-6" />;
    }
};

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        {children}
    </div>
);

const HealthStatusPage = () => {
    const [healthData, setHealthData] = useState<HealthReport | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHealthStatus = async () => {
            try {
                const response = await fetch('/api/v1/health');
                if (!response.ok) {
                    throw new Error('Failed to fetch health status');
                }
                
                const data = await response.json();
                const formattedData = {
                    ...data,
                    timestamp: new Date(data.timestamp).toISOString(),
                    services: data.services.map((service: any) => ({
                        ...service,
                        last_ping: new Date(service.last_ping).toISOString(),
                        latency_ms: service.latency || service.latency_ms,
                    }))
                };
                setHealthData(formattedData);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchHealthStatus();
        const interval = setInterval(fetchHealthStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <BsClock className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        );
    }

    if (!healthData) {
        return null;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">System Health Status</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-sm font-medium"> 
                            Overall Status 
                        </h2>

                        <StatusIndicator status={healthData.status} />
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Last Updated: {new Date(healthData.timestamp).toLocaleString()}
                        </p>
                    </div>
                </Card>

                <Card>
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-sm font-medium"> 
                            Database
                        </h2>

                        <StatusIndicator status={healthData.database.connected ? 'healthy' : 'unhealthy'} />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm">
                            Latency: {healthData.database.latency_ms.toFixed(2)}ms
                        </p>

                        {healthData.database.postgres_version && (
                            <p className="text-sm">
                            Version: {healthData.database.postgres_version}
                            </p>
                        )}

                        {healthData.database.error && (
                            <p className="text-sm text-red-500">{healthData.database.error}</p>
                        )}
                    </div>
                </Card>

                <Card>
                    <h2 className="text-sm font-medium mb-2">
                        System Information
                    </h2>

                    <div className="space-y-2 text-sm">
                        <p>
                            Version: {healthData.system.version}
                        </p>
                    
                        <p>
                            Go Version: {healthData.system.go_version}
                        </p>

                        <p>
                            Active Goroutines: {healthData.system.num_goroutines}
                        </p>
                        
                        <p>
                            Memory Usage: {healthData.system.memory_usage.toFixed(2)} MB
                        </p>
                    </div>
                </Card>

                {healthData.services.map((service) => (
                    <Card key={service.name}>
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-sm font-medium">
                                {service.name}
                            </h2>

                            <StatusIndicator status={service.status} />
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm">
                                Latency: {service.latency_ms.toFixed(2)}ms
                            </p>

                            <p className="text-sm">
                                Last Check: {new Date(service.last_ping).toLocaleString()}
                            </p>

                            {service.message && (
                                <p className="text-sm text-red-500">
                                    {service.message}
                                </p>
                            )}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export const Route = createFileRoute('/syshealth/')({
    component: HealthStatusPage,
});

export default HealthStatusPage;