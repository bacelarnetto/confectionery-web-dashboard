// Brasília não usa horário de verão desde 2019 -- offset fixo -03:00 o ano inteiro. Usado pro
// atalho "dia inteiro" do Apoio de Festa: o horário combinado (08h-22h) precisa valer sempre em
// horário de Brasília, independente do fuso do navegador de quem estiver usando o sistema (mesma
// classe de cuidado que o backend já teve, ver FusoHorarioNegocio.kt).
const OFFSET_BRASILIA = '-03:00'

function instantBrasilia(diaYMD: string, hora: number): string {
  return new Date(`${diaYMD}T${String(hora).padStart(2, '0')}:00:00${OFFSET_BRASILIA}`).toISOString()
}

// Formata um Instant pro formato que <input type="datetime-local"> aceita, usando os getters
// LOCAIS do navegador -- garante que, quando esse valor for reconvertido (new Date(valor)), o
// Instant original seja reproduzido de volta, seja qual for o fuso do navegador de quem preencher.
// Exportada (achado da homologação 2026-09-19): "Data do Evento" (Orçamento) e "Data de Entrega"
// (Pedido) populavam o <input type="datetime-local"> com `new Date(iso).toISOString().slice(0,16)`
// -- sempre UTC, nunca reconvertido pro fuso local. Resultado: o campo mostrava a hora UTC crua
// (ex.: 17:00 em vez de 14:00 BRT) e, ao salvar de novo sem tocar no campo, essa hora UTC era
// reenviada como se já fosse local, ganhando +3h a cada ciclo (drift cumulativo). Esta função já
// fazia a conversão certa pro atalho "dia inteiro" do Apoio de Festa -- só faltava reusá-la nos
// dois formulários.
export function instantParaDatetimeLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/**
 * A partir de uma data (YYYY-MM-DD, ou um valor de <input type="datetime-local"> do qual só o
 * dia importa), devolve o par hora início/fim (08h-22h, horário de Brasília) já no formato que o
 * modal de Apoio de Festa espera pros campos de datetime-local.
 */
export function diaInteiroBrasilia(diaOuDatetimeLocal: string): { horaInicio: string; horaFim: string } {
  const diaYMD = diaOuDatetimeLocal.slice(0, 10)
  return {
    horaInicio: instantParaDatetimeLocal(instantBrasilia(diaYMD, 8)),
    horaFim: instantParaDatetimeLocal(instantBrasilia(diaYMD, 22)),
  }
}

function diaBrasiliaYMD(iso: string): string {
  // Desloca 3h e lê os componentes em UTC -- dá o dia calendário em Brasília sem depender do
  // fuso do navegador que está rodando o código.
  const d = new Date(new Date(iso).getTime() - 3 * 60 * 60 * 1000)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

/**
 * Compara dois Instants pelo dia calendário em Brasília, não pelo fuso do navegador -- a regra
 * "mesmo dia" do backend (ApoioFesta/ApoioOrcamento) é sempre em América/São Paulo. Espera
 * Instants (ISO com timezone), não valores crus de datetime-local.
 */
export function mesmoDiaBrasilia(isoA: string, isoB: string): boolean {
  return diaBrasiliaYMD(isoA) === diaBrasiliaYMD(isoB)
}

/**
 * Converte um valor de <input type="datetime-local"> (ou qualquer string aceita por `new Date`)
 * pra ISO (UTC), validando ANTES de chamar `.toISOString()`. Achado da homologação 2026-09-19:
 * um valor malformado produz um `Date` inválido, e `.toISOString()` nesse caso lança
 * `RangeError: Invalid time value` -- sem tratamento, isso derrubava a SPA inteira com tela
 * branca. Diferente de um erro de render, esse throw acontece dentro do handler de submit (evento
 * de clique), onde um Error Boundary do React NÃO pega -- só valdar antes evita o crash aqui.
 */
export function datetimeLocalParaIso(valor: string): string {
  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) {
    throw new Error('Data/hora inválida -- confira o valor preenchido.')
  }
  return data.toISOString()
}
