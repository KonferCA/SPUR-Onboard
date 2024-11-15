import { Button } from '@components';

const Landing: React.FC = () => {
    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8">
            <div>
                <Button>
                    Click me
                </Button>
                <Button variant="secondary">
                    Secondary
                </Button>
                <Button variant="outline">
                    Outline
                </Button>
                <Button liquid>
                    Liquid
                </Button>
            </div>
        </div>
    );
};

export { Landing };