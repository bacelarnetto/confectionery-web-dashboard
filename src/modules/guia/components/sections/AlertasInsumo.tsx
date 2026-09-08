import { CheckCircle } from 'lucide-react'
import GuiaSection from '../GuiaSection'
import GuiaCard from '../GuiaCard'

function TipoBadge({ color, label }: { color: string; label: string }) {
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${color}`}>{label}</span>
}

export default function AlertasInsumo() {
  return (
    <GuiaSection
      id="alertas-insumo"
      title="Alertas de Insumo: o sistema de olho na despensa"
      intro="Você não precisa lembrar de checar validade ou nível de estoque todo dia — o sistema faz essa ronda sozinho."
    >
      <GuiaCard step={1} title="Configure os limites, uma vez por insumo">
        <p>
          Em <span className="font-medium text-gray-800">Estoque de Insumos → Parametrização</span>, escolha um insumo e
          defina a quantidade mínima, a quantidade máxima e quantos dias de antecedência você quer ser avisado antes de um
          lote vencer.
        </p>
        <p>Sem essa parametrização, o insumo simplesmente não entra na verificação — sem erro, sem trava, só não gera alerta.</p>
      </GuiaCard>

      <GuiaCard step={2} title="Três tipos de alerta">
        <div className="not-prose flex flex-wrap gap-2 py-1">
          <TipoBadge color="bg-orange-100 text-orange-700" label="Vencimento" />
          <TipoBadge color="bg-red-100 text-red-700" label="Estoque Mínimo" />
          <TipoBadge color="bg-yellow-100 text-yellow-700" label="Estoque Máximo" />
        </div>
        <p><span className="font-medium text-gray-800">Vencimento</span>: um lote específico está chegando perto da data de validade que você configurou.</p>
        <p><span className="font-medium text-gray-800">Estoque Mínimo</span>: o saldo total do insumo caiu abaixo do limite — hora de repor.</p>
        <p><span className="font-medium text-gray-800">Estoque Máximo</span>: o saldo passou do limite de cima — é só um aviso, não impede nenhuma entrada.</p>
      </GuiaCard>

      <GuiaCard
        step={3}
        title="A verificação roda sozinha, todo dia às 8h"
        dica="Não precisa esperar o horário automático: o botão “Verificar Agora”, na tela de Alertas, dispara a checagem na hora."
      >
        <p>
          O sino no cabeçalho do sistema mostra a contagem de alertas ativos e se atualiza sozinho a cada minuto — dá pra
          perceber um alerta novo sem nem estar na tela de Alertas.
        </p>
      </GuiaCard>

      <GuiaCard step={4} title="Resolva quando agir — ou deixe que se resolve sozinho">
        <p>
          Um alerta de estoque some sozinho quando o saldo volta pra faixa normal (depois de uma entrada ou saída). Se
          quiser encerrar antes disso, o botão <CheckCircle size={13} className="inline align-middle text-emerald-600" />{' '}
          na lista de Alertas resolve manualmente.
        </p>
      </GuiaCard>

      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800">
        <p className="font-medium">Alertas não se duplicam</p>
        <p className="mt-1">
          Se já existe um alerta ativo do mesmo tipo pra aquele insumo (ou lote), a próxima verificação não cria outro —
          você não vai ver a mesma farinha em falta repetida dez vezes na lista.
        </p>
      </div>
    </GuiaSection>
  )
}
