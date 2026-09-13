import { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Table from './Table'

const PAGE_SIZE_OPTIONS = [20, 50, 100]

interface PageableTableProps {
  headers: string[]
  isLoading: boolean
  isEmpty: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  totalElements?: number
  pageSize?: number
  onPageSizeChange?: (size: number) => void
  children: ReactNode
}

function SkeletonRows({ columnsCount }: { columnsCount: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: columnsCount }).map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export default function PageableTable({
  headers,
  isLoading,
  isEmpty,
  page,
  totalPages,
  onPageChange,
  totalElements,
  pageSize,
  onPageSizeChange,
  children,
}: PageableTableProps) {
  const showFooter = !isEmpty && (totalElements != null || totalPages > 1 || !!onPageSizeChange)

  return (
    <div>
      <Table headers={headers} isEmpty={isEmpty}>
        {isLoading ? <SkeletonRows columnsCount={headers.length} /> : children}
      </Table>

      {showFooter && (
        <div className="flex items-center justify-between flex-wrap gap-3 mt-4">
          <span className="text-sm text-gray-500">
            {totalElements != null ? `${totalElements} registro${totalElements === 1 ? '' : 's'} no total` : ''}
          </span>

          {totalPages > 1 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onPageChange(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm text-gray-600">
                Página {page + 1} de {totalPages}
              </span>
              <button
                onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {onPageSizeChange && pageSize != null && (
            <label className="flex items-center gap-2 text-sm text-gray-600">
              Itens por página
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}
    </div>
  )
}
