import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Plus, Trash2, AlertCircle, Info, X, ShoppingCart, FileText } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import { useEntradaInsumo, useCreateEntradaInsumo, useUpdateEntradaInsumo } from '../hooks/useEntradasInsumo'
import { useInsumos } from '../hooks/useInsumos'
import { ItemEntradaInsumo } from '../types/entradaInsumo'
import { Insumo } from '../types/insumo'
import { parseApiError } from '../../../lib/apiError'

type CampoItem = 'quantidade' | 'dataValidade' | 'dataFabricacao' | 'lote'

/**
 * O backend não devolve erro estruturado por campo — só uma frase livre com "(insumoId=X)"
 * embutido (ver EntradaInsumoService.kt). Mapeamos essa frase pro item/campo certo com base
 * nos textos de erro que o backend usa; qualquer mensagem fora desse padrão vira o
 * banner genérico em vez de arriscar um mapeamento errado.
 */
/**
 * O backend espera `java.time.Instant` em dataFabricacao/dataValidade, mas o `<input type="date">`
 * devolve "YYYY-MM-DD" puro -- sem essa conversão, o submit vira 400 genérico ("Cannot deserialize
 * ... Instant from String"). Um valor já carregado do backend sem edição chega como ISO completo;
 * nesse caso não mexemos, só convertemos o formato cru do input. Mesma lógica de
 * `toInstant` em MovimentacaoEstoquePage.tsx (meia-noite local, não UTC, pra não deslocar o dia).
 */
function toInstantDeData(valor?: string): string | undefined {
  if (!valor) return undefined
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return new Date(`${valor}T00:00:00`).toISOString()
  }
  return valor
}

function mapearErroParaItem(mensagem: string): { insumoId: number; campo: CampoItem } | null {
  const match = mensagem.match(/insumoId=(\d+)/)
  if (!match) return null
  const insumoId = Number(match[1])
  if (mensagem.includes('Quantidade')) return { insumoId, campo: 'quantidade' }
  if (mensagem.includes('Data de validade') || mensagem.includes('validade') || mensagem.includes('vencimento')) return { insumoId, campo: 'dataValidade' }
  if (mensagem.includes('Data de fabricação') || mensagem.includes('fabricação')) return { insumoId, campo: 'dataFabricacao' }
  if (mensagem.includes('Lote')) return { insumoId, campo: 'lote' }
  return null
}

interface FormState {
  valorTotal: string
  valorFrete: string
  numeroNotaFiscal: string
  valorImposto: string
}

const emptyForm: FormState = {
  valorTotal: '',
  valorFrete: '',
  numeroNotaFiscal: '',
  valorImposto: '',
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputClass =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-gray-400'

export default function EntradaInsumoFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const numericId = Number(id ?? 0)

  const { data: entrada, isLoading } = useEntradaInsumo(numericId)
  const { data: insumosData } = useInsumos(0, 100)
  const createMutation = useCreateEntradaInsumo()
  const updateMutation = useUpdateEntradaInsumo()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [itens, setItens] = useState<Omit<ItemEntradaInsumo, 'id' | 'createdBy' | 'updatedBy'>[]>([])
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const [itemErros, setItemErros] = useState<Record<number, { campo: CampoItem; mensagem: string }>>({})
  const [showGuia, setShowGuia] = useState(false)

  useEffect(() => {
    if (entrada) {
      setForm({
        valorTotal: entrada.valorTotal != null ? String(entrada.valorTotal) : '',
        valorFrete: entrada.valorFrete != null ? String(entrada.valorFrete) : '',
        numeroNotaFiscal: entrada.numeroNotaFiscal != null ? String(entrada.numeroNotaFiscal) : '',
        valorImposto: entrada.valorImposto != null ? String(entrada.valorImposto) : '',
      })
      setItens(
        entrada.itens.map((i) => ({
          insumoId: i.insumoId,
          quantidade: i.quantidade,
          lote: i.lote,
          dataValidade: i.dataValidade,
          dataFabricacao: i.dataFabricacao,
          valorCustoUnitario: i.valorCustoUnitario,
          valorCustoTotal: i.valorCustoTotal,
        }))
      )
    }
  }, [entrada])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function addItem() {
    setItens((prev) => [
      ...prev,
      {
        insumoId: 0,
        quantidade: 0,
        lote: '',
        dataValidade: '',
        dataFabricacao: '',
        valorCustoUnitario: 0,
        valorCustoTotal: 0,
      },
    ])
  }

  function removeItem(index: number) {
    setItens((prev) => prev.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: string, value: string | number) {
    setItens((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      if (field === 'quantidade' || field === 'valorCustoUnitario') {
        const qtd = field === 'quantidade' ? Number(value) : updated[index].quantidade
        const val = field === 'valorCustoUnitario' ? Number(value) : updated[index].valorCustoUnitario
        updated[index].valorCustoTotal = qtd * val
      }
      return updated
    })
    setItemErros((prev) => {
      if (!(index in prev)) return prev
      const { [index]: _removed, ...rest } = prev
      return rest
    })
  }

  function tratarErro(err: unknown) {
    const { status, mensagem } = parseApiError(err)
    if (status && status >= 500) {
      // 5xx/rede: nada pra "explicar" no formulário, mantém o alerta genérico
      return
    }
    const mapeado = mapearErroParaItem(mensagem)
    if (mapeado) {
      const index = itens.findIndex((it) => it.insumoId === mapeado.insumoId)
      if (index >= 0) {
        setItemErros((prev) => ({ ...prev, [index]: { campo: mapeado.campo, mensagem } }))
        return
      }
    }
    setErroGeral(mensagem)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErroGeral(null)
    setItemErros({})

    const optional = {
      valorFrete: form.valorFrete ? Number(form.valorFrete) : undefined,
      numeroNotaFiscal: form.numeroNotaFiscal ? Number(form.numeroNotaFiscal) : undefined,
      valorImposto: form.valorImposto ? Number(form.valorImposto) : undefined,
    }

    const sanitizedItens = itens.map((it) => ({
      ...it,
      lote: it.lote ? it.lote.trim() : undefined,
      dataFabricacao: toInstantDeData(it.dataFabricacao?.trim()),
      dataValidade: toInstantDeData(it.dataValidade?.trim()),
    }))

    if (isEditing) {
      updateMutation.mutate(
        {
          id: numericId,
          data: {
            valorTotal: Number(form.valorTotal),
            ...optional,
            compraId: entrada?.compraId,
            updatedBy: '',
            itens: entrada?.itens.map((item, index) => ({
              ...item,
              ...sanitizedItens[index],
            })) ?? sanitizedItens,
          },
        },
        { onSuccess: () => navigate('/estoque-insumos/entradas'), onError: tratarErro },
      )
    } else {
      createMutation.mutate(
        {
          valorTotal: Number(form.valorTotal),
          ...optional,
          createdBy: '',
          itens: sanitizedItens,
        },
        { onSuccess: () => navigate('/estoque-insumos/entradas'), onError: tratarErro },
      )
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const insumos = insumosData?.content ?? []
  // Toda "Nova Entrada" criada por este form é manual -- entrada vinculada a uma Compra nasce em
  // compraService.gerarEntradaInsumo, não aqui. Só em edição existe a chance de ser via Compra.
  // Regra do dono: Data Fabricação, Data Vencimento e Custo Unitário só são obrigatórios quando a
  // entrada é manual -- via Compra, a conferência física costuma ser preenchida depois (mesmo
  // cenário que o filtro "Preenchimento Pendente" já sinaliza).
  const isManual = isEditing ? !entrada?.compraId : true

  function getInsumo(insumoId: number): Insumo | undefined {
    return insumos.find((i) => i.id === insumoId)
  }

  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Carregando...
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={isEditing ? 'Editar Entrada' : 'Nova Entrada'}
        subtitle={isEditing ? 'Atualize os dados da entrada' : 'Cadastre uma nova entrada de insumo'}
        backTo="/estoque-insumos/entradas"
      >
        <div className="relative group">
          <button
            type="button"
            onClick={() => setShowGuia((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer shadow-xs ${
              showGuia
                ? 'bg-blue-600 text-white border-blue-600'
                : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200'
            }`}
            title="Clique ou passe o mouse para ver as orientações sobre os campos"
          >
            <Info size={14} />
            {isEditing ? 'Orientações da Entrada' : 'Orientações de Preenchimento'}
          </button>

          <div
            className={`absolute right-0 top-full pt-2 w-96 max-w-[90vw] z-50 transition-all duration-150 ${
              showGuia
                ? 'opacity-100 visible pointer-events-auto'
                : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none group-hover:pointer-events-auto'
            }`}
          >
            <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-2xl text-gray-800">
              <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-blue-600 shrink-0" />
                  <h4 className="font-semibold text-gray-900 text-xs">
                    {isEditing ? 'Atualização da Entrada e dos Insumos' : 'Orientações para Preenchimento da Entrada'}
                  </h4>
                </div>
                {showGuia && (
                  <button
                    type="button"
                    onClick={() => setShowGuia(false)}
                    className="text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
                    title="Fechar"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              {isEditing
                ? 'Ao editar esta entrada, você pode atualizar os dados fiscais e os atributos de cada insumo que deu entrada no estoque:'
                : 'Nova entrada manual de insumo no estoque. Informe os dados fiscais e os atributos dos insumos recebidos:'}
            </p>

            <div className="space-y-2.5 text-xs">
              {isEditing && entrada?.compraId && (
                <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  <span className="font-semibold block text-amber-950 mb-0.5">🛒 Entrada via Compra #{entrada.compraId}:</span>
                  <p className="text-amber-900 leading-relaxed text-[11px]">
                    Certifique-se de preencher os dados de conferência física dos insumos recebidos: <strong>Lote</strong>, <strong>Data de Fabricação</strong> e <strong>Data de Vencimento</strong> em cada item.
                  </p>
                </div>
              )}

              <div className="bg-blue-50/70 p-2.5 rounded-lg border border-blue-100">
                <span className="font-semibold block text-blue-950 mb-1">📦 Itens de Insumo:</span>
                <ul className="list-disc list-inside space-y-1 text-blue-900">
                  <li><strong>Quantidade:</strong> volume recebido que sensibiliza o estoque;</li>
                  <li><strong>Lote:</strong> código de lote (obrigatório se perecível 🌡);</li>
                  <li><strong>Data de Fabricação, Data de Vencimento e Custo Unitário:</strong> obrigatórios em entrada{' '}
                    <strong>manual</strong> (e também se o insumo for perecível 🌡) — numa entrada via Compra, dá pra
                    deixar em branco e preencher depois, ao confirmar a conferência física.</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                <span className="font-semibold block text-gray-900 mb-1">📋 Dados Gerais da Entrada:</span>
                <ul className="list-disc list-inside space-y-0.5 text-gray-600">
                  {isEditing ? (
                    <li><strong>Origem & NF:</strong> origem da entrada (compra ou manual) e número da NF;</li>
                  ) : (
                    <li><strong>Nota Fiscal (NF):</strong> número da NF associada à entrada;</li>
                  )}
                  <li><strong>Valores Adicionais:</strong> frete e impostos incidentes;</li>
                  <li><strong>Valor Total:</strong> valor consolidado da entrada;</li>
                  <li><strong>Usuário ID:</strong> responsável pelo registro da entrada.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageHeader>

      {erroGeral && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <p>{erroGeral}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {isEditing && (
              <Field label="Origem">
                <div className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-medium">
                  {entrada?.compraId ? (
                    <>
                      <ShoppingCart size={15} className="text-blue-600 shrink-0" />
                      <span className="text-blue-700 font-semibold">Compra #{entrada.compraId}</span>
                    </>
                  ) : (
                    <>
                      <FileText size={15} className="text-gray-500 shrink-0" />
                      <span>Manual</span>
                    </>
                  )}
                </div>
              </Field>
            )}

            <Field label="Valor Total" required>
              <input
                name="valorTotal"
                type="number"
                step="0.01"
                value={form.valorTotal}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="0,00"
              />
            </Field>

            <Field label="Valor Frete">
              <input
                name="valorFrete"
                type="number"
                step="0.01"
                value={form.valorFrete}
                onChange={handleChange}
                className={inputClass}
                placeholder="0,00"
              />
            </Field>

            <Field label="NF">
              <input
                name="numeroNotaFiscal"
                type="number"
                value={form.numeroNotaFiscal}
                onChange={handleChange}
                className={inputClass}
                placeholder="Número da NF"
              />
            </Field>

            <Field label="Valor Imposto">
              <input
                name="valorImposto"
                type="number"
                step="0.01"
                value={form.valorImposto}
                onChange={handleChange}
                className={inputClass}
                placeholder="0,00"
              />
            </Field>
          </div>

          <div className="border-t border-gray-200 pt-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Itens da Entrada</h3>
                <p className="text-xs text-gray-500">Insumos que darão entrada no estoque</p>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <Plus size={16} />
                Adicionar item
              </button>
            </div>

            {itens.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
                Nenhum item adicionado. Clique em "Adicionar item" acima para começar.
              </p>
            ) : (
              <div className="space-y-4">
                {itens.map((item, index) => {
                  const insumo = getInsumo(item.insumoId)
                  const perecivel = insumo?.perecivel ?? false
                  const itemErro = itemErros[index]
                  const dataVencimentoObrigatoria = perecivel || isManual
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border transition-all ${
                        itemErro
                          ? 'bg-red-50/30 border-red-300'
                          : perecivel
                          ? 'bg-amber-50/25 border-amber-200'
                          : 'bg-gray-50/60 border-gray-200'
                      }`}
                    >
                      {/* Cabeçalho do Card do Item */}
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200/80">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700 shadow-2xs">
                            Item {index + 1}
                          </span>
                          {insumo && (
                            <span className="text-sm font-semibold text-gray-800">
                              {insumo.nome}
                            </span>
                          )}
                          {perecivel && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-amber-800 bg-amber-100/90 border border-amber-200 rounded-md">
                              <span>🌡</span> Insumo Perecível (exige Lote e Validade)
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Remover este item"
                        >
                          <Trash2 size={14} />
                          <span>Remover</span>
                        </button>
                      </div>

                      {/* Grid de Campos em 2 Linhas */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                        {/* Linha 1: Insumo (Ocupa 2 colunas) */}
                        <div className="sm:col-span-2 md:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Insumo <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={item.insumoId}
                            onChange={(e) => updateItem(index, 'insumoId', Number(e.target.value))}
                            className={inputClass}
                            required
                          >
                            <option value={0}>Selecione um insumo...</option>
                            {insumos.map((ins) => (
                              <option key={ins.id} value={ins.id}>
                                {ins.nome}{ins.perecivel ? ' 🌡' : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Linha 1: Quantidade */}
                        <div className="sm:col-span-1 md:col-span-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Quantidade <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0,00"
                            value={item.quantidade || ''}
                            onChange={(e) => updateItem(index, 'quantidade', Number(e.target.value))}
                            required
                            className={`${inputClass} ${itemErro?.campo === 'quantidade' ? 'border-red-400 bg-red-50/50' : ''}`}
                          />
                          {itemErro?.campo === 'quantidade' && (
                            <p className="text-xs text-red-600 mt-1">{itemErro.mensagem}</p>
                          )}
                        </div>

                        {/* Linha 1: Lote */}
                        <div className="sm:col-span-1 md:col-span-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Lote {perecivel && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="text"
                            placeholder={perecivel ? 'Obrigatório (perecível)' : 'Lote (opcional)'}
                            value={item.lote ?? ''}
                            onChange={(e) => updateItem(index, 'lote', e.target.value)}
                            required={perecivel}
                            className={`${inputClass} ${(perecivel && !item.lote) || itemErro?.campo === 'lote' ? 'border-red-400 bg-red-50/50' : ''}`}
                          />
                          {itemErro?.campo === 'lote' && (
                            <p className="text-xs text-red-600 mt-1">{itemErro.mensagem}</p>
                          )}
                        </div>

                        {/* Linha 2: Data Fabricação */}
                        <div className="sm:col-span-1 md:col-span-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Data Fabricação {isManual && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="date"
                            value={item.dataFabricacao?.split('T')[0] || ''}
                            onChange={(e) => updateItem(index, 'dataFabricacao', e.target.value)}
                            required={isManual}
                            className={`${inputClass} ${(isManual && !item.dataFabricacao) || itemErro?.campo === 'dataFabricacao' ? 'border-red-400 bg-red-50/50' : ''}`}
                            title={isManual ? 'Data de fabricação do lote (obrigatória em entrada manual)' : 'Data de fabricação do lote'}
                          />
                          {itemErro?.campo === 'dataFabricacao' && (
                            <p className="text-xs text-red-600 mt-1">{itemErro.mensagem}</p>
                          )}
                        </div>

                        {/* Linha 2: Data Vencimento */}
                        <div className="sm:col-span-1 md:col-span-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Data Vencimento {dataVencimentoObrigatoria && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="date"
                            value={item.dataValidade?.split('T')[0] || ''}
                            onChange={(e) => updateItem(index, 'dataValidade', e.target.value)}
                            required={dataVencimentoObrigatoria}
                            className={`${inputClass} ${(dataVencimentoObrigatoria && !item.dataValidade) || itemErro?.campo === 'dataValidade' ? 'border-red-400 bg-red-50/50' : ''}`}
                            title={perecivel ? 'Data de validade/vencimento obrigatória para insumos perecíveis' : isManual ? 'Data de vencimento (obrigatória em entrada manual)' : 'Data de vencimento'}
                          />
                          {itemErro?.campo === 'dataValidade' && (
                            <p className="text-xs text-red-600 mt-1">{itemErro.mensagem}</p>
                          )}
                        </div>

                        {/* Linha 2: Custo Unitário */}
                        <div className="sm:col-span-1 md:col-span-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Custo Unitário (R$) {isManual && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min={isManual ? '0.01' : undefined}
                            placeholder="0,00"
                            value={item.valorCustoUnitario || ''}
                            onChange={(e) => updateItem(index, 'valorCustoUnitario', Number(e.target.value))}
                            required={isManual}
                            className={`${inputClass} ${isManual && !item.valorCustoUnitario ? 'border-red-400 bg-red-50/50' : ''}`}
                            title={isManual ? 'Custo unitário (obrigatório em entrada manual) — evita que o valor imobilizado do insumo fique zerado sem aviso' : 'Custo unitário'}
                          />
                        </div>

                        {/* Linha 2: Custo Total */}
                        <div className="sm:col-span-1 md:col-span-1">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Custo Total (R$)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={item.valorCustoTotal || ''}
                            readOnly
                            className={`${inputClass} bg-gray-100/80 font-medium text-gray-600 cursor-not-allowed`}
                            title="Calculado automaticamente: Quantidade × Custo Unitário"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {itens.some((item) => getInsumo(item.insumoId)?.perecivel) && (
              <p className="text-xs text-amber-600 mt-2">
                🌡 Insumos perecíveis exigem lote e data de validade.
              </p>
            )}
            {isManual && itens.length > 0 && (
              <p className="text-xs text-amber-600 mt-2">
                📋 Entrada manual exige data de fabricação, data de vencimento e custo unitário em todos os itens.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-5">
          <button
            type="button"
            onClick={() => navigate('/estoque-insumos/entradas')}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? 'Salvar alterações' : 'Cadastrar entrada'}
          </Button>
        </div>
      </form>
    </div>
  )
}
