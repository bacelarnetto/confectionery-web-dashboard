export function parseFilenameFromContentDisposition(contentDisposition?: string): string | undefined {
  if (!contentDisposition) return undefined
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match) return decodeURIComponent(utf8Match[1])
  const match = contentDisposition.match(/filename="?([^";]+)"?/i)
  return match?.[1]
}

export function downloadBlob(blob: Blob, filename: string, mimeType = 'application/pdf') {
  const url = window.URL.createObjectURL(new Blob([blob], { type: mimeType }))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
