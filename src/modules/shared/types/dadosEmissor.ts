export interface DadosEmissor {
  id?: number
  razaoSocial?: string
  nomeFantasia?: string
  cnpj?: string
  endereco?: string
  telefone?: string
  email?: string
  temLogo: boolean
  createdBy?: string
  createdOn?: string
  updatedBy?: string
  updatedOn?: string
}

export interface DadosEmissorUpdateForm {
  razaoSocial: string
  nomeFantasia?: string
  cnpj?: string
  endereco?: string
  telefone?: string
  email?: string
  usuario: string
}
