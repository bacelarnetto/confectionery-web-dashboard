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
          A tela abre mostrando <span className="font-medium text-gray-800">todas</span> as notificações. Pra achar só o que não chegou, troque o filtro para{' '}
          <span className="font-medium text-gray-800">Falhou</span>; também dá pra ver só as pendentes, em envio ou
          enviadas. Por enquanto
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

      <GuiaCard
        step={3}
        title="Instalar o sistema como app"
        dica="No iPhone, os avisos no navegador só chegam com o sistema instalado na Tela de Início — numa aba comum do Safari eles não aparecem."
      >
        <p>
          O sistema pode ser instalado como um app, com ícone próprio e janela sem as abas e a barra de endereço do
          navegador. No Chrome do computador, use o ícone de instalar que aparece na barra de endereço. No Android,
          “Instalar app” / “Adicionar à tela inicial”; no iPhone, pelo Safari, em Compartilhar → “Adicionar à Tela de
          Início”.
        </p>
        <p>
          Importante: instalar como app só funciona em endereço seguro (<span className="font-medium text-gray-800">https</span>)
          ou quando o sistema é aberto como <span className="font-medium text-gray-800">localhost</span> no próprio
          computador. Pelo celular, acessando o endereço de rede do computador (http://192.168…), o celular não oferece a
          instalação e o iPhone não recebe os avisos — isso não é defeito, só passa a funcionar quando o sistema tiver
          https.
        </p>
      </GuiaCard>
    </GuiaSection>
  )
}
