export type PerfilUsuario = 'ADMIN' | 'ESTOQUE' | 'VENDAS' | 'PRODUCAO'

export interface Usuario {
  id: number
  nome: string
  senha?: string
  email?: string
  perfil?: PerfilUsuario
}

export interface UsuarioInsertForm {
  nome: string
  senha?: string
  email?: string
  perfil?: PerfilUsuario
}

export interface UsuarioUpdateForm {
  nome?: string
  email?: string
  senha?: string
  perfil?: PerfilUsuario
}
