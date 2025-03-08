import { DropdownOption } from '@/components/Dropdown';

export interface CompanyFormProps {
    onSubmit: (data: CompanyInformation) => Promise<void>;
    isLoading: boolean;
    errors?: CompanyFormErrors;
    initialData?: Partial<CompanyInformation>;
}

export interface CompanyInformation {
    name: string;
    dateFounded: Date;
    description: string;
    stage: DropdownOption[];
    website?: string;
    linkedin?: string;
    wallet_address?: string;
}

export interface CompanyFormErrors {
    name?: string;
    dateFounded?: string;
    description?: string;
    stage?: string;
    website?: string;
    linkedin?: string;
}

export interface CreateCompanyRequest {
    name: string;
    description?: string;
    date_founded: number;
    stages: string[];
    website?: string;
    linkedin_url?: string;
    wallet_address?: string;
}

export interface CompanyResponse {
    id: string;
    owner_id: string;
    name: string;
    description: string | null;
    date_founded: number;
    stages: string[];
    website: string | null;
    wallet_address: string | null;
    linkedin_url: string;
    created_at: number;
    updated_at: number;
}

export type UpdateCompanyRequest = Partial<CreateCompanyRequest>;

export enum CompanyStage {
    Ideation = 'Ideation',
    MVP = 'MVP',
    Investment = 'Investment',
    ProductMarketFit = 'Product-market Fit',
    GoToMarket = 'Go-to-market',
    Growth = 'Growth',
    Maturity = 'Maturity',
}

export const COMPANY_STAGES: DropdownOption[] = Object.values(CompanyStage).map(
    (stage) => ({
        id: stage,
        label: stage,
        value: stage,
    })
);
