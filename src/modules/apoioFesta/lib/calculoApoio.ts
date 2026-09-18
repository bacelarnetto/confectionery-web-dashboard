import { ItemApoio } from '../types/itemApoio'

/**
 * Espelha exatamente ApoioFestaCalculoLogic.calcularValorTotal do backend:
 * custoHora = valorHora + (incluiMaoDeObra ? valorHoraMaoDeObra : 0)
 * total = custoHora * (duracao em horas)
 */
export function calcularValorApoio(
  itemApoio?: ItemApoio,
  horaInicio?: string,
  horaFim?: string,
  incluiMaoDeObra = false
): number {
  if (!itemApoio || !horaInicio || !horaFim) return 0
  const inicio = new Date(horaInicio).getTime()
  const fim = new Date(horaFim).getTime()
  if (isNaN(inicio) || isNaN(fim) || fim <= inicio) return 0

  const horas = (fim - inicio) / 3600000
  const custoHora = (itemApoio.valorHora ?? 0) + (incluiMaoDeObra ? (itemApoio.valorHoraMaoDeObra ?? 0) : 0)
  return Math.round(custoHora * horas * 100) / 100
}

