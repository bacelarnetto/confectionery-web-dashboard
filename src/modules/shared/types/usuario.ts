export interface Usuario {
  id: number
  nome: string
  senha?: string
  email?: string
}

export interface UsuarioInsertForm {
  nome: string
  senha?: string
  email?: string
}

export interface UsuarioUpdateForm {
  nome?: string
  email?: string
  senha?: string
}
