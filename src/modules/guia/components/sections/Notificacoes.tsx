import { BellRing, Send } from 'lucide-react'
import GuiaSection from '../GuiaSection'
import GuiaCard from '../GuiaCard'

function Caminho({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 align-middle text-xs font-medium text-gray-600 bg-gray-100 rounded px-2 py-0.5">
      {icon} {children}
    </span>
  )
}

export default function Notificacoes() {
  return (
    <GuiaSection
      id="notificacoes"
      title="Notificações: avisos que saem do sistema"
      intro="Quando surge um alerta (estoque, validade, prazo de pedido), o sistema prepara um aviso pra ser enviado pra fora — por WhatsApp ou direto no navegador. O envio em si ainda está sendo ligado; enquanto isso, as telas abaixo já existem."
    >
      <GuiaCard
        step={1}
        title="Notificações enviadas (só para Admin)"
        dica="A lista vazia é boa notícia: significa que nenhum aviso deixou de chegar."
      >
        <p>
          Em <Caminho icon={<Send size={12} />}>Administração → Notificações enviadas</Caminho>, o Admin vê cada aviso que o
          sistema mandou ou tentou mandar: quando foi criado, o título, o canal, pra quem ia, o status, quantas tentativas
          foram feitas, o último erro (passe o mouse pra ler inteiro) e quando foi entregue.
        </p>
        <p>
          A tela abre filtrada em <span className="font-medium text-gray-800">Falhou</span>, porque ela serve principalmente
          pra achar o que não chegou. Troque o filtro pra ver os pendentes, os em envio, os enviados ou todos. Por enquanto
          não há botão de reenviar: o sistema já tenta de novo sozinho algumas vezes antes de marcar como falha.
        </p>
      </GuiaCard>

      <GuiaCard step={2} title="Notificações neste navegador">
        <p>
          Clicando no seu nome, no canto superior direito, aparece{' '}
          <Caminho icon={<BellRing size={12} />}>Notificações neste navegador</Caminho>. Quando esse recurso estiver
          liberado, ligar a chave faz o navegador pedir permissão e passar a mostrar os avisos mesmo com o sistema em
          segundo plano. Cada pessoa tem uma inscrição só: ativar em outro navegador substitui a anterior.
        </p>
        <p>
          Enquanto o recurso não estiver configurado no sistema, a chave aparece desligada com o texto{' '}
          <span className="font-medium text-gray-800">"Notificações no navegador em breve"</span>. Em navegadores que não
          suportam esse tipo de aviso, a opção nem aparece.
        </p>
      </GuiaCard>
    </GuiaSection>
  )
}
