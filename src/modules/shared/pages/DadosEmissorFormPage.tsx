import { useState, useEffect, useRef, FormEvent } from 'react'
import { useAuth } from 'react-oidc-context'
import { ImagePlus, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import {
  useDadosEmissor,
  useUpdateDadosEmissor,
  useLogoDadosEmissor,
  useUploadLogoDadosEmissor,
  useDeleteLogoDadosEmissor,
} from '../hooks/useDadosEmissor'
import { maskPhone } from '../../../lib/format'
import { getUsername } from '../../../lib/auth'

const TIPOS_ACEITOS = ['image/png', 'image/jpeg']
const TAMANHO_MAXIMO = 2 * 1024 * 1024

interface FormState {
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  endereco: string
  telefone: string
  email: string
}

const emptyForm: FormState = {
  razaoSocial: '',
  nomeFantasia: '',
  cnpj: '',
  endereco: '',
  telefone: '',
  email: '',
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

export default function DadosEmissorFormPage() {
  const auth = useAuth()
  const { data: dadosEmissor, isLoading } = useDadosEmissor()
  const updateMutation = useUpdateDadosEmissor()

  const [form, setForm] = useState<FormState>(emptyForm)

  useEffect(() => {
    if (dadosEmissor) {
      setForm({
        razaoSocial: dadosEmissor.razaoSocial ?? '',
        nomeFantasia: dadosEmissor.nomeFantasia ?? '',
        cnpj: dadosEmissor.cnpj ?? '',
        endereco: dadosEmissor.endereco ?? '',
        telefone: dadosEmissor.telefone ?? '',
        email: dadosEmissor.email ?? '',
      })
    }
  }, [dadosEmissor])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleTelefoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, telefone: maskPhone(e.target.value) }))
  }

  // --- Logo ---
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null)
  const [previewLocal, setPreviewLocal] = useState<string | null>(null)
  const [previewSalvo, setPreviewSalvo] = useState<string | null>(null)

  const { data: logoBlob } = useLogoDadosEmissor(!!dadosEmissor?.temLogo)
  const uploadLogoMutation = useUploadLogoDadosEmissor()
  const deleteLogoMutation = useDeleteLogoDadosEmissor()

  useEffect(() => {
    if (!logoBlob) {
      setPreviewSalvo(null)
      return
    }
    const url = URL.createObjectURL(logoBlob)
    setPreviewSalvo(url)
    return () => URL.revokeObjectURL(url)
  }, [logoBlob])

  useEffect(() => {
    if (!arquivoSelecionado) {
      setPreviewLocal(null)
      return
    }
    const url = URL.createObjectURL(arquivoSelecionado)
    setPreviewLocal(url)
    return () => URL.revokeObjectURL(url)
  }, [arquivoSelecionado])

  function handleSelecionarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return

    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      toast.error('Envie uma imagem PNG ou JPEG.')
      return
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      toast.error('O logo deve ter no máximo 2MB.')
      return
    }
    setArquivoSelecionado(arquivo)
  }

  function handleEnviarLogo() {
    if (!arquivoSelecionado) return
    uploadLogoMutation.mutate(
      { arquivo: arquivoSelecionado, usuario: getUsername(auth.user) },
      { onSuccess: () => setArquivoSelecionado(null) },
    )
  }

  function handleRemoverLogo() {
    deleteLogoMutation.mutate(getUsername(auth.user))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    updateMutation.mutate({
      razaoSocial: form.razaoSocial,
      nomeFantasia: form.nomeFantasia || undefined,
      cnpj: form.cnpj || undefined,
      endereco: form.endereco || undefined,
      telefone: form.telefone || undefined,
      email: form.email || undefined,
      usuario: 'netto',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Carregando...
      </div>
    )
  }

  const podeEnviarLogo = !!dadosEmissor?.id
  const previewAtual = previewLocal ?? previewSalvo

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Dados da Empresa"
        subtitle="Usados na emissão de documentos, como o recibo de pagamento do pedido"
      />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">Logo</h3>
        <p className="text-sm text-gray-500 mb-4">Aparece no cabeçalho da nota de pedido e do recibo de pagamento.</p>

        {!podeEnviarLogo ? (
          <p className="text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded-lg p-3">
            Salve os dados da empresa (razão social) antes de enviar o logo.
          </p>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
              {previewAtual ? (
                <img src={previewAtual} alt="Logo da empresa" className="w-full h-full object-contain" />
              ) : (
                <ImagePlus size={24} className="text-gray-300" />
              )}
            </div>

            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleSelecionarArquivo}
                className="hidden"
              />

              {arquivoSelecionado ? (
                <div className="flex items-center gap-2">
                  <Button type="button" onClick={handleEnviarLogo} isLoading={uploadLogoMutation.isPending}>
                    Enviar logo
                  </Button>
                  <button
                    type="button"
                    onClick={() => setArquivoSelecionado(null)}
                    disabled={uploadLogoMutation.isPending}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    title="Cancelar seleção"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ImagePlus size={14} />
                    {dadosEmissor?.temLogo ? 'Trocar logo' : 'Enviar logo'}
                  </button>
                  {dadosEmissor?.temLogo && (
                    <button
                      type="button"
                      onClick={handleRemoverLogo}
                      disabled={deleteLogoMutation.isPending}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      Remover
                    </button>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-400">PNG ou JPEG, até 2MB.</p>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <Field label="Razão social" required>
                <input
                  name="razaoSocial"
                  value={form.razaoSocial}
                  onChange={handleChange}
                  required
                  className={inputClass}
                  placeholder="Nome legal da confeitaria"
                />
              </Field>
            </div>

            <Field label="Nome fantasia">
              <input
                name="nomeFantasia"
                value={form.nomeFantasia}
                onChange={handleChange}
                className={inputClass}
                placeholder="Nome popular/comercial"
              />
            </Field>

            <Field label="CNPJ">
              <input
                name="cnpj"
                value={form.cnpj}
                onChange={handleChange}
                className={inputClass}
                placeholder="00.000.000/0000-00 (se já tiver)"
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Endereço">
                <input
                  name="endereco"
                  value={form.endereco}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Rua, número, bairro, cidade..."
                />
              </Field>
            </div>

            <Field label="Telefone">
              <input
                name="telefone"
                value={form.telefone}
                onChange={handleTelefoneChange}
                className={inputClass}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </Field>

            <Field label="E-mail">
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="contato@confeitaria.com"
              />
            </Field>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-5">
          <Button type="submit" isLoading={updateMutation.isPending}>
            Salvar alterações
          </Button>
        </div>
      </form>
    </div>
  )
}
