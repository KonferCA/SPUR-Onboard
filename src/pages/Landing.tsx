import { TextInput } from '@components';

const Landing: React.FC = () => {
    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8">
            <div>
                <TextInput
                    label="Hi"
                    value="Hellooo"
                />
            </div>
        </div>

    );
};

export { Landing };