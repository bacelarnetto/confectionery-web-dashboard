import { useEffect, useState, FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'
import Button from '../../../components/ui/Button'
import RadioToggle from '../../../components/ui/RadioToggle'
import { usePrecificacaoVigente, useCreatePrecificacao, usePrecificacaoSimulada } from '../hooks/usePrecificacoes'
import { PrecificacaoProdutoInsertForm } from '../types/precificacaoProduto'
import { parseApiError } from '../../../lib/apiError'

interface Props {
  produtoId: number
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
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-500'

function formatBRL(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function PrecificacaoProdutoForm({ produtoId }: Props) {
  const { data: vigente } = usePrecificacaoVigente(produtoId)
  const createMutation = useCreatePrecificacao()

  const [modo, setModo] = useState<'receita' | 'manual'>('receita')
  const [receitaIndisponivel, setReceitaIndisponivel] = useState(false)
  const [custoIngredienteManual, setCustoIngredienteManual] = useState('')
  const [custoFixo, setCustoFixo] = useState('')
  const [margemLucro, setMargemLucro] = useState('')
  const [valorVendaFinal, setValorVendaFinal] = useState('')
  const [valorVendaFinalDirty, setValorVendaFinalDirty] = useState(false)
  const [erroGeral, setErroGeral] = useState<string | null>(null)

  // Pré-preenche com a precificação vigente, se houver, como ponto de partida pro ajuste. O modo
  // ("receita" vs "manual") não vem daqui -- fica sempre otimista em "receita" e é o probe ao vivo
  // (efeito abaixo) que decide se o produto realmente tem receita disponível agora.
  useEffect(() => {
    if (vigente) {
      setCustoFixo(String(vigente.valorCustoFixo))
      setMargemLucro(String(vigente.margemLucro))
      setCustoIngredienteManual(String(vigente.valorCustoIngrediente))
    }
  }, [vigente])

  const { dado, carregando, erro } = usePrecificacaoSimulada(
    {
      produtoId,
      valorCustoIngrediente: modo === 'manual' ? Number(custoIngredienteManual) || 0 : null,
      valorCustoFixo: Number(custoFixo) || 0,
      margemLucro: Number(margemLucro) || 0,
    },
    true,
  )

  // Produto sem receita: o backend recusa o modo "usar receita" -- desabilita a opção e força manual.
  useEffect(() => {
    if (erro && modo === 'receita' && !receitaIndisponivel) {
      setReceitaIndisponivel(true)
      setModo('manual')
    }
  }, [erro, modo, receitaIndisponivel])

  // Sincroniza o preço final com o sugerido, até o usuário editá-lo manualmente.
  useEffect(() => {
    if (dado && !valorVendaFinalDirty) {
      setValorVendaFinal(String(dado.valorVendaSugerido))
    }
  }, [dado, valorVendaFinalDirty])

  function handleValorVendaFinalChange(value: string) {
    setValorVendaFinal(value)
    setValorVendaFinalDirty(true)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!dado) return
    setErroGeral(null)

    const data: PrecificacaoProdutoInsertForm = {
      produtoId,
      valorCustoFixo: Number(custoFixo) || 0,
      margemLucro: Number(margemLucro) || 0,
      createdBy: 'netto',
    }

    if (modo === 'manual') {
      data.valorCustoIngrediente = Number(custoIngredienteManual) || 0
    }

    const finalNumerico = Number(valorVendaFinal) || 0
    if (finalNumerico !== dado.valorVendaSugerido) {
      data.valorVenda = finalNumerico
    }

    createMutation.mutate(data, {
      onSuccess: () => setValorVendaFinalDirty(false),
      onError: (err) => {
        const { status, mensagem } = parseApiError(err)
        if (status && status >= 500) return // 5xx/rede: toast genérico já cobre
        setErroGeral(mensagem)
      },
    })
  }

  const podeSalvar =
    !!dado &&
    !erro &&
    custoFixo !== '' &&
    margemLucro !== '' &&
    (modo === 'receita' || custoIngredienteManual !== '')

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Precificação</h3>
        <p className="text-xs text-gray-500 mt-1">
          {vigente
            ? 'Cada preço salvo cria um novo registro no histórico — o vigente atual será encerrado.'
            : 'Defina o preço de venda inicial deste produto.'}
        </p>
      </div>

      {erroGeral && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <p>{erroGeral}</p>
        </div>
      )}

      {vigente && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          Vigente: {formatBRL(vigente.valorVenda)} · Margem: {vigente.margemLucro}%
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="block text-sm font-medium text-gray-700">Custo dos ingredientes</span>
            <RadioToggle
              name="modoCustoIngrediente"
              value={modo}
              onChange={(v) => setModo(v as 'receita' | 'manual')}
              options={[
                { value: 'receita', label: 'Usar valor da receita', disabled: receitaIndisponivel },
                { value: 'manual', label: 'Digitar manualmente' },
              ]}
            />
          </div>

          {modo === 'receita' ? (
            <input
              value={dado ? formatBRL(dado.valorCustoIngrediente) : carregando ? 'Calculando...' : ''}
              disabled
              className={inputClass}
            />
          ) : (
            <input
              type="number"
              step="0.01"
              min="0"
              value={custoIngredienteManual}
              onChange={(e) => setCustoIngredienteManual(e.target.value)}
              required
              className={inputClass}
              placeholder="0.00"
            />
          )}

          {receitaIndisponivel && (
            <p className="text-xs text-gray-400">
              Este produto não tem receita cadastrada — informe o custo dos ingredientes manualmente.
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Custo fixo/variável (R$)" required>
            <input
              type="number"
              step="0.01"
              min="0"
              value={custoFixo}
              onChange={(e) => setCustoFixo(e.target.value)}
              required
              className={inputClass}
              placeholder="0.00"
            />
          </Field>
          <Field label="Margem de lucro desejada (%)" required>
            <input
              type="number"
              step="0.1"
              min="0"
              value={margemLucro}
              onChange={(e) => setMargemLucro(e.target.value)}
              required
              className={inputClass}
              placeholder="0.0"
            />
          </Field>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Preço de venda sugerido{' '}
            {carregando && <span className="text-gray-400">(calculando...)</span>}
          </p>
          <p className="text-2xl font-semibold text-gray-900">
            {dado ? formatBRL(dado.valorVendaSugerido) : '—'}
          </p>
          {dado && (
            <p className="text-xs text-gray-400 mt-0.5">
              custo total {formatBRL(dado.breakdown.custoTotal)} · lucro bruto {formatBRL(dado.breakdown.lucroBruto)}
            </p>
          )}
        </div>

        <Field label="Preço de venda final" required>
          <input
            type="number"
            step="0.01"
            min="0"
            value={valorVendaFinal}
            onChange={(e) => handleValorVendaFinalChange(e.target.value)}
            required
            className={inputClass}
          />
        </Field>

        <div className="flex justify-end">
          <Button type="submit" isLoading={createMutation.isPending} disabled={!podeSalvar}>
            Salvar preço
          </Button>
        </div>
      </form>
    </div>
  )
}
