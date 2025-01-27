export interface Company {
  id: string
  name: string
  date_founded: string
  stage: string
  description: string
}

export interface UpdateCompanyRequest {
  name: string
  date_founded: string
  stage: string
  description: string
} 