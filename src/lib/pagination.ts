export interface RawPage<T> {
  content: T[]
  page: {
    size: number
    number: number
    totalElements: number
    totalPages: number
  }
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export function normalizePage<T>(raw: RawPage<T>): PageResponse<T> {
  return {
    content: raw.content,
    totalElements: raw.page.totalElements,
    totalPages: raw.page.totalPages,
    number: raw.page.number,
    size: raw.page.size,
  }
}
