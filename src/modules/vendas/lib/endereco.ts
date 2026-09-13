import { Endereco } from '../types/cliente'

export function formatEndereco(end?: Endereco): string {
  if (!end) return ''
  const linha1 = [end.logradouro, end.numero].filter(Boolean).join(', ')
  const complemento = end.complemento ? ` (${end.complemento})` : ''
  const linha2 = [end.bairro, [end.cidade, end.uf].filter(Boolean).join('/')].filter(Boolean).join(' — ')
  return [linha1 + complemento, linha2, end.cep].filter(Boolean).join(' · ')
}
