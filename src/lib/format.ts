export function formatCurrency(v: number | null | undefined): string {
  if (v == null) return '—'
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatNumberBR(v: number | null | undefined, decimals = 2): string {
  if (v == null) return '—'
  return v.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

// F8 (segurança): CPF mascarado por padrão nas listagens -- só os 6 dígitos do meio ficam
// visíveis, o suficiente pra reconhecer o cliente sem expor o documento inteiro em tela.
export function maskCpf(cpf: string | null | undefined): string {
  if (!cpf) return '—'
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return cpf
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`
}

export function formatCpf(cpf: string | null | undefined): string {
  if (!cpf) return '—'
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return cpf
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

/**
 * Formata progressivamente um telefone BR (fixo de 10 dígitos ou celular de 11) — funciona
 * tanto pra máscara de digitação (retorna '' se vazio) quanto pra exibição em lista (dados
 * antigos sem máscara nenhuma também são normalizados, já que os dígitos são extraídos primeiro).
 */
export function maskPhone(raw: string | null | undefined): string {
  if (!raw) return ''
  const digits = raw.replace(/\D/g, '').slice(0, 11)
  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

// Reteste 2026-09-28 (F1): `.toISOString()` num Date inválido lança RangeError. Quando isso roda
// durante o render (filtros de data que viram parâmetro de query), um valor digitado fora do
// formato (ex.: ano com 6 dígitos num <input type="date">) derrubava a tela inteira. Versão que
// não lança: devolve undefined e quem chama trata como "filtro ainda não preenchido".
export function isoOuUndefined(valor: string | Date | null | undefined): string | undefined {
  if (valor == null || valor === '') return undefined
  const d = valor instanceof Date ? valor : new Date(valor)
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
}

// Instant ISO -> "dd/mm/aaaa hh:mm" sempre no horário de Brasília, independente do fuso do navegador.
export function formatDateTimeBR(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
