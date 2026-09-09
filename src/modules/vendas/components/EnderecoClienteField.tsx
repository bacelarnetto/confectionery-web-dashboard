import { MapPin } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Cliente } from '../types/cliente'

interface EnderecoClienteFieldProps {
  cliente: Cliente | undefined
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

/**
 * Só oferece endereços já cadastrados no cliente (`ClienteFormPage` é quem gerencia esse CRUD) --
 * nunca deixa digitar um ID livre, pra não gerar uma referência inexistente na hora de salvar.
 */
export default function EnderecoClienteField({ cliente, value, onChange, disabled }: EnderecoClienteFieldProps) {
  const navigate = useNavigate()

  if (!cliente) {
    return (
      <p className="text-sm text-gray-400 px-3 py-2">Selecione um cliente para ver os endereços dele.</p>
    )
  }

  if (!cliente.enderecos?.length) {
    return (
      <div className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500">
        <span>{cliente.nome} ainda não tem endereço cadastrado.</span>
        <button
          type="button"
          onClick={() => navigate(`/vendas/clientes/${cliente.id}/editar`)}
          className="inline-flex items-center gap-1 text-amber-700 font-medium hover:underline flex-shrink-0"
        >
          <MapPin size={13} />
          Cadastrar endereço
        </button>
      </div>
    )
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
    >
      <option value="">— sem endereço —</option>
      {cliente.enderecos.map((end, i) => (
        <option key={end.id ?? i} value={end.id ?? ''}>
          {end.descricao || `${end.logradouro}, ${end.numero}`}
        </option>
      ))}
    </select>
  )
}
