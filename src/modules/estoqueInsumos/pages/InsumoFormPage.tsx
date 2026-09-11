import { useState, useEffect, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import { Bell } from 'lucide-react'
import { useInsumo, useCreateInsumo, useUpdateInsumo } from '../hooks/useInsumos'
import { useCategoriasInsumo } from '../hooks/useCategoriasInsumo'
import {
  useParametrizacaoPorInsumo,
  useCreateParametrizacaoAlerta,
  useUpdateParametrizacaoAlerta,
} from '../hooks/useParametrizacaoAlertas'
import toast from 'react-hot-toast'

interface FormState {
  nome: string
  descricao: string
  valor: string
  marca: string
  categoriaId: string
  perecivel: boolean
  unidadeMedida: string
}

interface AlertasState {
  enabled: boolean
  minimo: string
  maximo: string
  vencimento: string
}

const emptyForm: FormState = {
  nome: '',
  descricao: '',
  valor: '',
  marca: '',
  categoriaId: '',
  perecivel: false,
  unidadeMedida: 'un',
}

const emptyAlertas: AlertasState = {
  enabled: false,
  minimo: '',
  maximo: '',
  vencimento: '',
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

export default function InsumoFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const numericId = Number(id ?? 0)

  const { data: insumo, isLoading: isLoadingInsumo } = useInsumo(numericId)
  const { data: categoriasData } = useCategoriasInsumo(0, 100)
  
  // Hooks de Parametrização
  const { data: parametrizacao, isLoading: isLoadingParam } = useParametrizacaoPorInsumo(numericId)
  
  const createInsumoMut = useCreateInsumo()
  const updateInsumoMut = useUpdateInsumo()
  const createParamMut = useCreateParametrizacaoAlerta()
  const updateParamMut = useUpdateParametrizacaoAlerta()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [alertas, setAlertas] = useState<AlertasState>(emptyAlertas)

  useEffect(() => {
    if (insumo) {
      setForm({
        nome: insumo.nome ?? '',
        descricao: insumo.descricao ?? '',
        valor: insumo.valor != null ? String(insumo.valor) : '',
        marca: insumo.marca ?? '',
        categoriaId: insumo.categoriaId != null ? String(insumo.categoriaId) : '',
        perecivel: insumo.perecivel ?? false,
        unidadeMedida: insumo.unidadeMedida ?? 'un',
      })
    }
  }, [insumo])

  useEffect(() => {
    if (parametrizacao) {
      setAlertas({
        enabled: true,
        minimo: String(parametrizacao.quantidadeMinimaEstoque ?? ''),
        maximo: String(parametrizacao.quantidadeMaximaEstoque ?? ''),
        vencimento: String(parametrizacao.quantidadeDiasVencimento ?? ''),
      })
    }
  }, [parametrizacao])

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleAlertasChange(e: React.ChangeEvent<HTMLInputElement>) {
    setAlertas((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSaveParametrizacao(insumoId: number) {
    if (!alertas.enabled) return

    const pd = {
      insumoId,
      quantidadeMinimaEstoque: Number(alertas.minimo),
      quantidadeMaximaEstoque: Number(alertas.maximo),
      quantidadeDiasVencimento: Number(alertas.vencimento),
      createdBy: 'netto'
    }

    try {
      if (parametrizacao?.id) {
        await updateParamMut.mutateAsync({ 
          id: parametrizacao.id, 
          data: { ...pd, updatedBy: 'netto' } as any 
        })
      } else {
        await createParamMut.mutateAsync(pd)
      }
    } catch (err) {
      console.error('Failed to save parametrizacao', err)
      toast.error('O Insumo foi salvo, mas não conseguimos salvar os alertas conficurados.')
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const optional = {
      descricao: form.descricao || undefined,
      marca: form.marca || undefined,
    }

    if (isEditing) {
      updateInsumoMut.mutate(
        {
          id: numericId,
          data: {
            nome: form.nome,
            valor: Number(form.valor),
            categoriaId: Number(form.categoriaId),
            perecivel: form.perecivel,
            unidadeMedida: form.unidadeMedida,
            ...optional,
            updatedBy: 'netto',
          },
        },
        { 
          onSuccess: async () => {
             await handleSaveParametrizacao(numericId)
             navigate('/estoque-insumos/insumos') 
          }
        },
      )
    } else {
      createInsumoMut.mutate(
        {
          nome: form.nome,
          valor: Number(form.valor),
          categoriaId: Number(form.categoriaId),
          perecivel: form.perecivel,
          unidadeMedida: form.unidadeMedida,
          ...optional,
          createdBy: 'netto',
        },
        { 
          onSuccess: async (createdInsumo) => {
             if (createdInsumo?.id) {
               await handleSaveParametrizacao(createdInsumo.id)
             }
             navigate('/estoque-insumos/insumos') 
          } 
        },
      )
    }
  }

  const isPending = 
    createInsumoMut.isPending || 
    updateInsumoMut.isPending || 
    createParamMut.isPending || 
    updateParamMut.isPending

  const categorias = categoriasData?.content ?? []

  if (isEditing && (isLoadingInsumo || isLoadingParam)) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Carregando...
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={isEditing ? 'Editar Insumo' : 'Novo Insumo'}
        subtitle={isEditing ? 'Atualize os dados do insumo' : 'Cadastre um novo insumo'}
        backTo="/estoque-insumos/insumos"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Bloco 1: Dados do Insumo */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Gerais</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Field label="Nome" required>
                <input
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Nome do insumo"
                />
              </Field>
            </div>

            <Field label="Valor" required>
              <input
                name="valor"
                type="number"
                step="0.01"
                min="0"
                value={form.valor}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="0,00"
              />
            </Field>

            <Field label="Marca" required>
              <input
                name="marca"
                value={form.marca}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Marca do insumo"
              />
            </Field>

            <Field label="Categoria" required>
              <select
                name="categoriaId"
                value={form.categoriaId}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Unidade de medida" required>
              <select
                name="unidadeMedida"
                value={form.unidadeMedida}
                onChange={handleChange}
                required
                className={inputClass}
              >
                <option value="g">g — gramas (sólidos)</option>
                <option value="ml">ml — mililitros (líquidos)</option>
                <option value="un">un — unidades inteiras</option>
              </select>
            </Field>

            <div className="sm:col-span-2">
              <Field label="Descrição">
                <textarea
                  name="descricao"
                  value={form.descricao}
                  onChange={handleChange}
                  className={inputClass + ' min-h-[100px] resize-y'}
                  placeholder="Descrição do insumo"
                />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={form.perecivel}
                    onChange={(e) => setForm((prev) => ({ ...prev, perecivel: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Insumo perecível</span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {form.perecivel
                      ? 'Data de validade e lote serão obrigatórios ao registrar entradas.'
                      : 'Ative para exigir data de validade e lote nas entradas deste insumo.'}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Bloco 2: Parametrização de Alertas */}
        <div className={`bg-white rounded-xl border shadow-sm p-6 transition-colors ${alertas.enabled ? 'border-amber-200' : 'border-gray-200'}`}>
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div className={`mt-1 p-2 rounded-lg ${alertas.enabled ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                <Bell size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Configurar Alertas</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Seja avisado automaticamente quando o estoque deste insumo chegar a níveis críticos ou estiver perto de vencer.
                </p>
              </div>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer ml-4 mt-2">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={alertas.enabled}
                onChange={(e) => setAlertas(prev => ({ ...prev, enabled: e.target.checked }))}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {alertas.enabled && (
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6 pt-5 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
              <Field label="Estoque Mínimo" required>
                <input
                  name="minimo"
                  type="number"
                  min="0"
                  value={alertas.minimo}
                  onChange={handleAlertasChange}
                  required={alertas.enabled}
                  className={inputClass}
                  placeholder="Ex: 10"
                />
              </Field>

              <Field label="Estoque Máximo">
                <input
                  name="maximo"
                  type="number"
                  min="0"
                  value={alertas.maximo}
                  onChange={handleAlertasChange}
                  required={alertas.enabled}
                  className={inputClass}
                  placeholder="Ex: 500"
                />
              </Field>

              <Field label="Aviso de Vencimento" required>
                <div className="relative">
                  <input
                    name="vencimento"
                    type="number"
                    min="1"
                    value={alertas.vencimento}
                    onChange={handleAlertasChange}
                    required={alertas.enabled}
                    className={inputClass + ' pr-12'}
                    placeholder="Ex: 15"
                  />
                  <span className="absolute right-3 top-2.5 text-sm text-gray-400 pointer-events-none">dias</span>
                </div>
              </Field>
             </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 mt-5 pb-10">
          <button
            type="button"
            onClick={() => navigate('/estoque-insumos/insumos')}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? 'Salvar alterações' : 'Cadastrar insumo'}
          </Button>
        </div>
      </form>
    </div>
  )
}
