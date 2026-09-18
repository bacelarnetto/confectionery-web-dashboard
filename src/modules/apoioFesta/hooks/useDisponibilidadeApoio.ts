import { useQuery } from '@tanstack/react-query'
import itemApoioService, { DisponibilidadeDia } from '../services/itemApoioService'
import apoioFestaService from '../services/apoioFestaService'
import { ItemApoio } from '../types/itemApoio'

let endpointDisponivelNoBackend: boolean | null = null

/**
 * Hook para consultar a disponibilidade diária de um Item de Apoio em um mês específico (YYYY-MM).
 *
 * Resiliente: tenta consultar o endpoint agregado backend `GET /item-apoio/{id}/disponibilidade?mes=YYYY-MM`.
 * Se o endpoint ainda não estiver publicado (404/erro), memoriza e executa fallback client-side consultando os
 * apoios ativos do item e calculando a disponibilidade dia a dia a partir da frota cadastrada.
 */
export function useDisponibilidadeApoio(
  itemApoioId: number | undefined,
  itemApoio: ItemApoio | undefined,
  mes: string, // YYYY-MM
) {
  return useQuery<DisponibilidadeDia[]>({
    queryKey: ['item-apoio-disponibilidade', itemApoioId, mes, itemApoio?.quantidade],
    queryFn: async () => {
      if (!itemApoioId || !itemApoio) return []

      // 1. Tenta o endpoint otimizado no backend (se não soubermos previamente que não existe)
      if (endpointDisponivelNoBackend !== false) {
        try {
          const dados = await itemApoioService.getDisponibilidade(itemApoioId, mes)
          if (Array.isArray(dados) && dados.length > 0) {
            endpointDisponivelNoBackend = true
            return dados
          }
        } catch (err: unknown) {
          endpointDisponivelNoBackend = false
          console.info(
            `[DisponibilidadeApoio] Endpoint /item-apoio/${itemApoioId}/disponibilidade ainda não publicado no backend. Ativando agregação client-side.`,
          )
        }
      }

      // 2. Fallback de agregação no frontend
      const [anoStr, mesStr] = mes.split('-')
      const ano = Number(anoStr)
      const mesNum = Number(mesStr)
      const totalDias = new Date(ano, mesNum, 0).getDate()
      const quantidadeTotal = itemApoio.quantidade ?? 1

      // Busca os apoios ativos do item
      const apoiosPage = await apoioFestaService.getAll(0, 200, {
        itemApoioId,
        status: 'ATIVO',
      })
      const apoios = apoiosPage.content ?? []

      // Agrupa contagem por dia no fuso de Brasília
      const ocupacaoPorDia: Record<string, number> = {}
      for (const a of apoios) {
        if (!a.horaInicio) continue
        // Formata data YYYY-MM-DD no fuso de Brasília
        const dataDia = new Date(a.horaInicio).toLocaleDateString('sv-SE', {
          timeZone: 'America/Sao_Paulo',
        })
        if (dataDia.startsWith(mes)) {
          ocupacaoPorDia[dataDia] = (ocupacaoPorDia[dataDia] || 0) + 1
        }
      }

      // Constrói o array com todos os dias do mês
      const resultado: DisponibilidadeDia[] = []
      for (let d = 1; d <= totalDias; d++) {
        const diaFormatado = `${mes}-${String(d).padStart(2, '0')}`
        const quantidadeOcupada = ocupacaoPorDia[diaFormatado] || 0
        const quantidadeLivre = Math.max(0, quantidadeTotal - quantidadeOcupada)
        resultado.push({
          dia: diaFormatado,
          quantidadeTotal,
          quantidadeOcupada,
          quantidadeLivre,
        })
      }

      return resultado
    },
    enabled: !!itemApoioId && !!itemApoio && !!mes,
    staleTime: 30_000,
  })
}

