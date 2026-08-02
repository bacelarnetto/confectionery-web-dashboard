export interface Fornecedor {
  id: number
  nome: string
  endereco?: string
  numero?: number
  bairro?: string
  cep?: string
  email?: string
  inscricaoEstadual?: string
  telefone?: string
  cnpj?: string
  site?: string
  createdBy: string
  createdOn: string
  updatedBy?: string
  updatedOn?: string
}

export interface FornecedorInsertForm {
  nome: string
  endereco?: string
  numero?: number
  bairro?: string
  cep?: string
  email?: string
  inscricaoEstadual?: string
  telefone?: string
  cnpj?: string
  site?: string
  createdBy: string
}

export interface FornecedorUpdateForm {
  nome: string
  endereco?: string
  numero?: number
  bairro?: string
  cep?: string
  email?: string
  inscricaoEstadual?: string
  telefone?: string
  cnpj?: string
  site?: string
  updatedBy: string
}
