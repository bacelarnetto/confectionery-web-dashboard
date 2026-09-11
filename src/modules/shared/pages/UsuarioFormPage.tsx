import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import { useUsuario, useCreateUsuario, useUpdateUsuario } from '../hooks/useUsuarios'
import { PerfilUsuario } from '../types/usuario'

interface FormData {
  nome: string
  email: string
  senha: string
  perfil: PerfilUsuario | ''
}

const initialForm: FormData = {
  nome: '',
  email: '',
  senha: '',
  perfil: '',
}

const PERFIL_OPCOES: { value: PerfilUsuario; label: string }[] = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'ESTOQUE', label: 'Estoque' },
  { value: 'VENDAS', label: 'Vendas' },
  { value: 'PRODUCAO', label: 'Produção' },
]

export default function UsuarioFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const numericId = id ? Number(id) : 0
  const isEditing = numericId > 0

  const { data: usuario, isLoading } = useUsuario(numericId)
  const createMutation = useCreateUsuario()
  const updateMutation = useUpdateUsuario()

  const [form, setForm] = useState<FormData>(initialForm)

  useEffect(() => {
    if (usuario) {
      setForm({
        nome: usuario.nome || '',
        email: usuario.email || '',
        senha: '',
        perfil: usuario.perfil ?? '',
      })
    }
  }, [usuario])

  const isLoadingForm = isEditing && isLoading
  const isSaving = createMutation.isPending || updateMutation.isPending

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const payload = {
      nome: form.nome,
      email: form.email || undefined,
      senha: form.senha || undefined,
      perfil: form.perfil || undefined,
    }

    if (isEditing) {
      updateMutation.mutate(
        { id: numericId, data: payload },
        { onSuccess: () => navigate('/usuarios') }
      )
    } else {
      createMutation.mutate(payload, { onSuccess: () => navigate('/usuarios') })
    }
  }

  if (isLoadingForm) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={isEditing ? 'Editar Usuário' : 'Novo Usuário'}
        subtitle={isEditing ? 'Atualize os dados do usuário' : 'Cadastre um novo usuário no sistema'}
        backTo="/usuarios"
      />

      <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-sm border space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
          <input
            type="text"
            required
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
            placeholder="Nome do usuário"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
            placeholder="email@exemplo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isEditing ? 'Nova Senha' : 'Senha'}
          </label>
          <input
            type="password"
            required={!isEditing}
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
            placeholder={isEditing ? 'Deixe em branco para manter a senha' : 'Senha do usuário'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
          <select
            value={form.perfil}
            onChange={(e) => setForm({ ...form, perfil: e.target.value as PerfilUsuario | '' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
          >
            <option value="">
              {isEditing ? '(manter perfil atual)' : '(padrão: Estoque)'}
            </option>
            {PERFIL_OPCOES.map((opcao) => (
              <option key={opcao.value} value={opcao.value}>
                {opcao.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Define o que o usuário pode acessar no sistema — usuários fora do perfil Admin não veem
            esta tela de gerenciamento.
          </p>
        </div>

        <div className="pt-2">
          <Button type="submit" isLoading={isSaving} className="w-full">
            {isEditing ? 'Atualizar Usuário' : 'Criar Usuário'}
          </Button>
        </div>
      </form>
    </div>
  )
}
