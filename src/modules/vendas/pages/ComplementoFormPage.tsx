import { useState, useEffect, useRef, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { Search, X } from 'lucide-react'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import { useComplemento, useCreateComplemento, useUpdateComplemento } from '../hooks/useComplementos'
import { useDebounce } from '../../../hooks/useDebounce'
import insumoService from '../../estoqueInsumos/services/insumoService'
import { Insumo } from '../../estoqueInsumos/types/insumo'

interface FormState {
  categoria: string
  nome: string
  insumoId: string
  valorCusto: string
  valorVenda: string
  descricao: string
  padrao: boolean
}

const emptyForm: FormState = {
  categoria: '',
  nome: '',
  insumoId: '',
  valorCusto: '',
  valorVenda: '',
  descricao: '',
  padrao: false,
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

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export default function ComplementoFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id
  const numericId = Number(id ?? 0)

  const { data: complemento, isLoading } = useComplemento(numericId)
  const createMutation = useCreateComplemento()
  const updateMutation = useUpdateComplemento()

  const [form, setForm] = useState<FormState>(emptyForm)
  const [insumoSearch, setInsumoSearch] = useState('')
  const [showInsumoDropdown, setShowInsumoDropdown] = useState(false)
  const [selectedInsumo, setSelectedInsumo] = useState<Insumo | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedSearch = useDebounce(insumoSearch, 400)

  const { data: insumoResults } = useQuery({
    queryKey: ['insumo-search', debouncedSearch],
    queryFn: () => insumoService.getAll(0, 8, debouncedSearch.length > 0 ? { nome: debouncedSearch } : undefined),
    enabled: showInsumoDropdown,
  })

  const insumos = insumoResults?.content ?? []

  useEffect(() => {
    if (complemento) {
      setForm({
        categoria: complemento.categoria ?? '',
        nome: complemento.nome ?? '',
        insumoId: String(complemento.insumoId ?? ''),
        valorCusto: String(complemento.valorCusto ?? ''),
        valorVenda: String(complemento.valorVenda ?? ''),
        descricao: complemento.descricao ?? '',
        padrao: complemento.padrao ?? false,
      })
      if (complemento.insumoId) {
        setSelectedInsumo({
          id: complemento.insumoId,
          nome: complemento.insumoNome ?? '',
          categoriaId: 0,
          categoriaNome: complemento.categoria ?? '',
          valor: complemento.valorCusto ?? 0,
          unidadeMedida: '',
          perecivel: false,
          createdBy: '',
          createdOn: '',
        })
      }
    }
  }, [complemento])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowInsumoDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function selectInsumo(insumo: Insumo) {
    setSelectedInsumo(insumo)
    setForm((prev) => ({
      ...prev,
      insumoId: String(insumo.id),
      nome: insumo.nome,
      categoria: insumo.categoriaNome ?? prev.categoria,
      valorCusto: String(insumo.valor),
    }))
    setShowInsumoDropdown(false)
    setInsumoSearch('')
  }

  function clearInsumo() {
    setSelectedInsumo(null)
    // nome/categoria/valorCusto só existem atrelados a um insumo -- sem um selecionado, não faz
    // sentido manter os valores do insumo anterior soltos no formulário.
    setForm((prev) => ({ ...prev, insumoId: '', nome: '', categoria: '', valorCusto: '' }))
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handlePadraoToggle() {
    setForm((prev) => ({
      ...prev,
      padrao: !prev.padrao,
      valorVenda: !prev.padrao ? '0' : prev.valorVenda,
    }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const payload = {
      categoria: form.categoria,
      nome: form.nome,
      insumoId: Number(form.insumoId),
      valorCusto: Number(form.valorCusto),
      valorVenda: form.padrao ? 0 : Number(form.valorVenda),
      descricao: form.descricao || undefined,
      padrao: form.padrao || undefined,
    }
    if (isEditing) {
      updateMutation.mutate(
        { id: numericId, data: payload },
        { onSuccess: () => navigate('/vendas/complementos') },
      )
    } else {
      createMutation.mutate(payload, { onSuccess: () => navigate('/vendas/complementos') })
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  if (isEditing && isLoading) {
    return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Carregando...</div>
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={isEditing ? 'Editar Complemento' : 'Novo Complemento'}
        subtitle={isEditing ? 'Atualize os dados do complemento' : 'Cadastre um novo complemento'}
        backTo="/vendas/complementos"
      />

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative" ref={dropdownRef}>
              <Field label="Insumo" required>
                {selectedInsumo ? (
                  <div className="flex items-center gap-2 px-3 py-2 border border-amber-200 bg-amber-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{selectedInsumo.nome}</p>
                      <p className="text-xs text-gray-500">
                        {selectedInsumo.categoriaNome && `${selectedInsumo.categoriaNome} · `}
                        {currency.format(selectedInsumo.valor)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={clearInsumo}
                      className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                      title="Trocar insumo"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={insumoSearch}
                      onChange={(e) => {
                        setInsumoSearch(e.target.value)
                        setShowInsumoDropdown(true)
                      }}
                      onFocus={() => setShowInsumoDropdown(true)}
                      required={isEditing ? false : true}
                      className={inputClass + ' pr-9'}
                      placeholder="Buscar insumo por nome..."
                    />
                    <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                )}
              </Field>

              {showInsumoDropdown && !selectedInsumo && insumos.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {insumos.map((insumo) => (
                    <button
                      key={insumo.id}
                      type="button"
                      onClick={() => selectInsumo(insumo)}
                      className="w-full text-left px-3 py-2 hover:bg-amber-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <p className="text-sm font-medium text-gray-900">{insumo.nome}</p>
                      <p className="text-xs text-gray-500">
                        {insumo.categoriaNome && `${insumo.categoriaNome} · `}
                        {currency.format(insumo.valor)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
              {showInsumoDropdown && !selectedInsumo && insumoSearch.length >= 2 && insumos.length === 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                  <p className="text-sm text-gray-400">Nenhum insumo encontrado</p>
                </div>
              )}
              {selectedInsumo && (
                <p className="text-xs text-gray-500 mt-1 italic">
                  Categoria, nome e custo vêm do insumo — troque o insumo pra editar esses campos.
                </p>
              )}
            </div>

            <Field label="Categoria" required>
              <input
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                required
                disabled={!!selectedInsumo}
                className={inputClass + (selectedInsumo ? ' bg-gray-50 text-gray-500 cursor-not-allowed' : '')}
                placeholder="Ex: Cobertura, Recheio, Decoração..."
              />
            </Field>

            <Field label="Nome" required>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
                disabled={!!selectedInsumo}
                className={inputClass + (selectedInsumo ? ' bg-gray-50 text-gray-500 cursor-not-allowed' : '')}
                placeholder="Nome do complemento"
              />
            </Field>

            <div />

            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.padrao}
                  onChange={handlePadraoToggle}
                  className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Complemento padrão</span>
                  <span className="text-xs text-gray-500 ml-2">participa da precificação sem cobrança extra</span>
                </div>
              </label>
            </div>

            <Field label="Valor de Custo (R$)" required>
              <input
                name="valorCusto"
                type="number"
                step="0.01"
                min="0"
                value={form.valorCusto}
                onChange={handleChange}
                required
                disabled={!!selectedInsumo}
                className={inputClass + (selectedInsumo ? ' bg-gray-50 text-gray-500 cursor-not-allowed' : '')}
                placeholder="0.00"
              />
            </Field>

            <Field label="Valor de Venda (R$)" required>
              <input
                name="valorVenda"
                type="number"
                step="0.01"
                min="0"
                value={form.padrao ? '0' : form.valorVenda}
                onChange={handleChange}
                required
                disabled={form.padrao}
                className={inputClass + (form.padrao ? ' bg-gray-50 text-gray-500 cursor-not-allowed' : '')}
                placeholder="0.00"
              />
              {form.padrao && (
                <p className="text-xs text-gray-500 mt-1 italic">Complemento padrão não gera valor de venda — custo embutido na precificação</p>
              )}
            </Field>
          </div>

          <Field label="Descrição">
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              className={inputClass + ' min-h-[80px] resize-y'}
              placeholder="Descrição do complemento..."
            />
          </Field>
        </div>

        <div className="flex items-center justify-end gap-3 mt-5">
          <button
            type="button"
            onClick={() => navigate('/vendas/complementos')}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
          >
            Cancelar
          </button>
          <Button type="submit" isLoading={isPending}>
            {isEditing ? 'Salvar alterações' : 'Cadastrar complemento'}
          </Button>
        </div>
      </form>
    </div>
  )
}
