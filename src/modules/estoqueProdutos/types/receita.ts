export interface Ingrediente {
  id?: number
  insumoId: number
  quantidade: number
  observacao?: string
}

/**
 * Referência a um Produto dentro do cadastro de Receita: ou aponta pra um produto existente
 * (`produtoId`, com prioridade se ambos vierem preenchidos), ou traz os dados pra criar um novo
 * (`nome` + categoria existente ou nova).
 */
export interface ProdutoRefForm {
  produtoId?: number
  nome?: string
  descricao?: string
  categoriaProdutoId?: number
  categoriaProdutoNome?: string
  categoriaProdutoDescricao?: string
}

export interface Receita {
  id: number
  produtoId: number
  nome: string
  modoPreparo?: string
  tempoPreparo?: string
  ingredientes: Ingrediente[]
  createdBy: string
  createdOn: string
  updatedBy?: string
  updatedOn?: string
}

export interface ReceitaInsertForm {
  produto: ProdutoRefForm
  modoPreparo?: string
  tempoPreparo?: string
  ingredientes: Ingrediente[]
  createdBy: string
}

export interface ReceitaUpdateForm {
  modoPreparo?: string
  tempoPreparo?: string
  ingredientes: Ingrediente[]
  updatedBy: string
}
