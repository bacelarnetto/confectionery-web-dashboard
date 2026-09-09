import { LogOut, Users } from 'lucide-react'
import GuiaSection from '../GuiaSection'
import GuiaCard from '../GuiaCard'

function PerfilBadge({ color, label }: { color: string; label: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {label}
    </span>
  )
}

export default function AcessoUsuarios() {
  return (
    <GuiaSection
      id="acesso-usuarios"
      title="Acesso e Usuários: entrando no sistema"
      intro="Antes de cadastrar qualquer coisa, você precisa entrar — e o que aparece pra você depois disso depende de quem você é dentro da confeitaria."
    >
      <GuiaCard step={1} title="Fazer login">
        <p>
          Ao abrir o sistema sem estar autenticado, você vê uma tela simples com um botão{' '}
          <span className="font-medium text-gray-800">“Entrar”</span>. Ele leva você pra tela de login da confeitaria, onde
          você usa o usuário e a senha que foram cadastrados pra você.
        </p>
        <p>Depois do login, você volta direto pro Dashboard — pronto pra trabalhar.</p>
      </GuiaCard>

      <GuiaCard
        step={2}
        title="Sua sessão fica sempre visível"
        dica="Se por algum motivo sua sessão expirar no meio do trabalho, o sistema avisa e leva você de volta pro login — é só entrar de novo, nada se perde do que já estava salvo."
      >
        <p>
          No canto superior direito, seu nome aparece sempre que você estiver logado. Ao lado dele, o ícone{' '}
          <span className="inline-flex items-center gap-1 align-middle text-xs font-medium text-gray-600 bg-gray-100 rounded px-2 py-0.5">
            <LogOut size={12} /> Sair
          </span>{' '}
          encerra sua sessão e leva de volta pra tela de login.
        </p>
      </GuiaCard>

      <GuiaCard step={3} title="O menu se adapta ao seu perfil">
        <p>Cada pessoa tem um perfil de acesso, definido no cadastro do seu usuário:</p>
        <div className="not-prose flex flex-wrap gap-2 py-1">
          <PerfilBadge color="bg-purple-100 text-purple-700" label="Admin" />
          <PerfilBadge color="bg-blue-100 text-blue-700" label="Estoque" />
          <PerfilBadge color="bg-green-100 text-green-800" label="Vendas" />
          <PerfilBadge color="bg-orange-100 text-orange-700" label="Produção" />
        </div>
        <p>
          O perfil não esconde os módulos hoje — ele só libera o menu{' '}
          <span className="font-medium text-gray-800">Administração</span>, visível apenas para quem é{' '}
          <span className="font-medium text-gray-800">Admin</span>. Os demais perfis existem para organizar quem é quem na
          equipe, e servem de base para o sistema restringir mais telas no futuro.
        </p>
      </GuiaCard>

      <GuiaCard step={4} title="Gerenciando a equipe (só para Admin)">
        <p>
          Em{' '}
          <span className="inline-flex items-center gap-1 align-middle text-xs font-medium text-gray-600 bg-gray-100 rounded px-2 py-0.5">
            <Users size={12} /> Administração → Usuários
          </span>
          , um Admin cadastra novas contas (nome, email, senha e perfil) e edita as existentes — inclusive trocando o perfil
          de alguém quando a função da pessoa na equipe muda.
        </p>
        <p>
          Se o perfil não for escolhido no cadastro, a conta nova entra como{' '}
          <span className="font-medium text-gray-800">Estoque</span> por padrão; na edição, deixar o campo em branco mantém
          o perfil que a pessoa já tinha.
        </p>
      </GuiaCard>

      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800">
        <p className="font-medium">Por que isso importa?</p>
        <p className="mt-1">
          Porque cada ação registrada no sistema — uma compra confirmada, um pedido criado, um preço atualizado — fica
          associada a quem fez. Saber quem tem acesso, e como, é a base da confiança em qualquer equipe.
        </p>
      </div>
    </GuiaSection>
  )
}
