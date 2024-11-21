import { useState } from 'react';
import {
  TextInput,
  FileUpload,
  Button,
  Dropdown,
  ScrollLink,
} from '@components';

// sample industries data
const industries = [
  { id: 1, label: 'Technology', value: 'tech' },
  { id: 2, label: 'Healthcare', value: 'healthcare' },
  { id: 3, label: 'Finance', value: 'finance' },
  { id: 4, label: 'Education', value: 'education' },
  { id: 5, label: 'Manufacturing', value: 'manufacturing' },
  { id: 6, label: 'Retail', value: 'retail' },
];

const Landing: React.FC = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<
    (typeof industries)[0] | null
  >(null);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1>Landing</h1>
      <div>
        <TextInput label="Hi" value="Hellooo" />
      </div>
      <FileUpload />
      <div>
        <Dropdown
          label="Industry"
          options={industries}
          value={selectedIndustry}
          onChange={(value) =>
            setSelectedIndustry(value as (typeof industries)[0])
          }
        />
      </div>
      <ScrollLink to="#buttons" offset={800}>
        Scroll
      </ScrollLink>
      <div className="h-[2000px]"></div>
      <div id="buttons">
        <Button>Click me</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button liquid>Liquid</Button>
      </div>
    </div>
  );
};

export { Landing };

