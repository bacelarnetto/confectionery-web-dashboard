import Modal from './Modal'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  itemName?: string
  isPending: boolean
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  itemName = 'este item',
  isPending,
}: DeleteConfirmModalProps) {
  return (
    <Modal open={isOpen} onClose={onClose} title="Confirmar exclusão">
      <p className="text-sm text-gray-600 mb-5">
        Tem certeza que deseja remover{' '}
        <span className="font-semibold text-gray-900">"{itemName}"</span>? Esta ação não pode ser
        desfeita.
      </p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center gap-2"
        >
          {isPending ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Removendo...
            </>
          ) : (
            'Remover'
          )}
        </button>
      </div>
    </Modal>
  )
}
