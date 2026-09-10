import { ResumoValores } from '../lib/resumoValores'

interface ResumoValoresCardProps {
  resumo: ResumoValores
  mostrarFrete?: boolean
}

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function Linha({ label, valor, negativo }: { label: string; valor: number; negativo?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={negativo ? 'text-red-600' : 'text-gray-900'}>
        {negativo ? '− ' : ''}
        {currency.format(Math.abs(valor))}
      </span>
    </div>
  )
}

export default function ResumoValoresCard({ resumo, mostrarFrete = true }: ResumoValoresCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-2.5">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">Resumo</h3>

      <Linha label="Subtotal dos itens" valor={resumo.subtotalItens} />
      {resumo.totalComplementos > 0 && <Linha label="Complementos extra" valor={resumo.totalComplementos} />}
      {resumo.totalDesconto > 0 && <Linha label="Descontos" valor={resumo.totalDesconto} negativo />}
      {mostrarFrete && <Linha label="Frete" valor={resumo.valorFrete} />}

      <div className="pt-2.5 mt-1 border-t border-gray-200 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">Total</span>
        <span className="text-lg font-bold text-amber-600">{currency.format(resumo.total)}</span>
      </div>
    </div>
  )
}
