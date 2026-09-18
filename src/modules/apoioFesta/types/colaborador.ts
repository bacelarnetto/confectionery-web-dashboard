export interface Colaborador {
  id: number
  nome: string
  telefoneCelular: string
  endereco?: string
  email?: string
  createdOn?: string
  createdBy?: string
  updatedOn?: string
  updatedBy?: string
}

export interface ColaboradorInsertForm {
  nome: string
  telefoneCelular: string
  endereco?: string
  email?: string
  createdBy?: string
}

export interface ColaboradorUpdateForm {
  nome: string
  telefoneCelular: string
  endereco?: string
  email?: string
  updatedBy?: string
}
