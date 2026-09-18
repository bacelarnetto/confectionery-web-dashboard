import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Package, Clock, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import { useCreateFabricacao } from '../hooks/useFabricacoes'
import { useReceita } from '../hooks/useReceitas'
import { useInsumos } from '../../estoqueInsumos/hooks/useInsumos'
import ReceitaField from '../components/ReceitaField'

interface FormState {
  receitaId: string
  quantidade: string
  observacao: string
  dataFabricacao: string
  dataValidade: string
}

const emptyForm: FormState = {
  receitaId: '',
  quantidade: '',
  observacao: '',
  dataFabricacao: '',
  dataValidade: '',
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
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

export default function FabricacaoFormPage() {
  const navigate = useNavigate()
  const createMutation = useCreateFabricacao()

  const [form, setForm] = useState<FormState>(emptyForm)

  const receitaIdNum = Number(form.receitaId) || 0
  const { data: receitaSelecionada } = useReceita(receitaIdNum)
  const { data: insumosData } = useInsumos(0, 100)
  const insumos = insumosData?.content ?? []

  const qtdFabricacao = Math.max(1, Number(form.quantidade) || 1)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!form.receitaId || Number(form.receitaId) <= 0) {
      toast.error('Selecione uma receita para a fabricação.')
      return
    }

    createMutation.mutate(
      {
        receitaId: Number(form.receitaId),
        quantidade: Number(form.quantidade),
        observacao: form.observacao || undefined,
        dataFabricacao: form.dataFabricacao ? new Date(`${form.dataFabricacao}T00:00:00`).toISOString() : undefined,
        dataValidade: form.dataValidade ? new Date(`${form.dataValidade}T00:00:00`).toISOString() : undefined,
        createdBy: '',
      },
      { onSuccess: () => navigate('/estoque-produtos/fabricacoes') },
    )
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Nova Fabricação"
        subtitle="Registre uma fabricação de produto — os insumos serão debitados automaticamente"
        backTo="/estoque-produtos/fabricacoes"
      />

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Field label="Receita" required>
                <ReceitaField
                  value={receitaIdNum}
                  onChange={(id) => setForm((prev) => ({ ...prev, receitaId: id ? String(id) : '' }))}
                  required
                />
              </Field>
            </div>

            <Field label="Quantidade a Fabricar" required>
              <input
                name="quantidade"
                type="number"
                min="1"
                value={form.quantidade}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Ex: 10 unidades"
              />
            </Field>

            <Field label="Data de Fabricação">
              <input
                name="dataFabricacao"
                type="date"
                value={form.dataFabricacao}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>

            <Field label="Data de Validade">
              <input
                name="dataValidade"
                type="date"
                value={form.dataValidade}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>
          </div>

          {/* Painel de Projeção de Insumos da Receita */}
          {receitaIdNum > 0 && receitaSelecionada && (
            <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/30 to-amber-50/50 border border-amber-200/80 rounded-xl p-4.5 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-500 text-white rounded-lg shadow-2xs">
                    <Package size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      Previsão de Consumo de Insumos
                    </h4>
                    <p className="text-xs text-gray-500">
                      Calculado para{' '}
                      <strong className="text-gray-800">
                        {form.quantidade ? `${form.quantidade} un` : '1 un (base unitária)'}
                      </strong>{' '}
                      de {receitaSelecionada.nome}
                    </p>
                  </div>
                </div>
                {receitaSelecionada.tempoPreparo && (
                  <span className="text-xs bg-white text-gray-700 font-medium px-2.5 py-1 rounded-md border border-amber-200 flex items-center gap-1.5 shadow-2xs">
                    <Clock size={13} className="text-amber-600" />
                    {receitaSelecionada.tempoPreparo}
                  </span>
                )}
              </div>

              {receitaSelecionada.ingredientes && receitaSelecionada.ingredientes.length > 0 ? (
                <div className="bg-white rounded-xl border border-amber-200/60 overflow-hidden shadow-2xs">
                  <table className="w-full text-xs">
                    <thead className="bg-amber-50/60 text-gray-600 border-b border-amber-100">
                      <tr>
                        <th className="text-left font-semibold py-2.5 px-3.5">Insumo</th>
                        <th className="text-center font-semibold py-2.5 px-3.5">Qtd / Receita</th>
                        <th className="text-right font-semibold py-2.5 px-3.5">Total a Debitar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {receitaSelecionada.ingredientes.map((ing, idx) => {
                        const insumo = insumos.find((i) => i.id === ing.insumoId)
                        const totalDebito = ing.quantidade * qtdFabricacao
                        const unidade = insumo?.unidadeMedida ?? 'un'
                        return (
                          <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                            <td className="py-2 px-3.5 font-medium text-gray-800">
                              {insumo?.nome ?? `Insumo #${ing.insumoId}`}
                              {insumo?.perecivel && (
                                <span className="ml-1.5 text-[10px] font-medium text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                                  perecível
                                </span>
                              )}
                              {ing.observacao && (
                                <span className="block text-[11px] text-gray-400 font-normal">
                                  {ing.observacao}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3.5 text-center text-gray-600">
                              {ing.quantidade} {unidade}
                            </td>
                            <td className="py-2 px-3.5 text-right font-bold text-amber-900">
                              {totalDebito} {unidade}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic bg-white/70 p-3 rounded-lg border border-amber-100">
                  Esta receita não tem ingredientes cadastrados. Nenhum insumo será debitado do estoque.
                </p>
              )}

              {receitaSelecionada.modoPreparo && (
                <details className="text-xs text-gray-700 group">
                  <summary className="cursor-pointer font-medium text-amber-800 hover:text-amber-900 select-none flex items-center gap-1.5">
                    <BookOpen size={14} className="text-amber-700" />
                    <span>Ver modo de preparo</span>
                  </summary>
                  <div className="mt-2 p-3 bg-white rounded-xl border border-amber-100 text-gray-600 whitespace-pre-line leading-relaxed shadow-2xs">
                    {receitaSelecionada.modoPreparo}
                  </div>
                </details>
              )}
            </div>
          )}

          <Field label="Observação">
            <textarea
              name="observacao"
              value={form.observacao}
              onChange={handleChange}
              className={inputClass + ' min-h-[80px] resize-y'}
              placeholder="Observações sobre a fabricação..."
            />
          </Field>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            Ao registrar a fabricação, os insumos da receita serão debitados do estoque automaticamente (FIFO),
            e o produto será creditado no estoque.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-5">
          <button
            type="button"
            onClick={() => navigate('/estoque-produtos/fabricacoes')}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={createMutation.isPending}>
            Registrar fabricação
          </Button>
        </div>
      </form>
    </div>
  )
}
