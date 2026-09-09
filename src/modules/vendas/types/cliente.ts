export interface Endereco {
  id?: number
  descricao?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  uf?: string
  cep?: string
}

export interface Cliente {
  id: number
  nome: string
  cpf?: string
  email?: string
  celular?: string
  telefone?: string
  enderecos: Endereco[]
  createdBy: string
  createdOn: string
  updatedBy?: string
  updatedOn?: string
}

export interface ClienteInsertForm {
  nome: string
  cpf?: string
  email?: string
  celular?: string
  telefone?: string
  enderecos?: Endereco[]
  createdBy: string
}

export interface ClienteUpdateForm {
  nome?: string
  cpf?: string
  email?: string
  celular?: string
  telefone?: string
  enderecos?: Endereco[]
  updatedBy: string
}

export interface PedidoResumo {
  id: number
  status: string
  dataEntrega?: string
  valorTotal: number
  createdOn: string
}

export interface ClienteTotalGasto {
  clienteId: number
  totalGasto: number
}
