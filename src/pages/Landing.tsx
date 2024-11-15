import { TextInput, FileUpload, Button } from '@components';

const Landing: React.FC = () => {
    return (
        <div className="max-w-2xl mx-auto p-6 space-y-8">
            <h1>Landing</h1>
            <div>
                <TextInput
                    label="Hi"
                    value="Hellooo"
                />
            </div>
            <FileUpload />
            <div>
                <Button>Click me</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button liquid>Liquid</Button>
            </div>
        </div>
    );
};

export { Landing };