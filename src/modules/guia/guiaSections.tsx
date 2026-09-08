import type { ReactNode } from 'react'
import { Sprout, Wallet, Sparkles, History } from 'lucide-react'

export interface GuiaSecao {
  id: string
  titulo: string
  descricao: string
  icone: ReactNode
}

export const guiaSections: GuiaSecao[] = [
  {
    id: 'primeiros-passos',
    titulo: 'Primeiros Passos',
    descricao: 'Cadastre insumos e receitas para começar',
    icone: <Sprout size={16} />,
  },
  {
    id: 'gestao-custos',
    titulo: 'Gestão de Custos',
    descricao: 'Entenda os dois tipos de custo do seu bolso',
    icone: <Wallet size={16} />,
  },
  {
    id: 'precificacao',
    titulo: 'Precificação Inteligente',
    descricao: 'Como o sistema calcula o preço de venda ideal',
    icone: <Sparkles size={16} />,
  },
  {
    id: 'historico',
    titulo: 'Histórico e Segurança',
    descricao: 'A foto dos seus custos, sempre à mão',
    icone: <History size={16} />,
  },
]