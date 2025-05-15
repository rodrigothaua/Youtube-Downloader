/**
 * Formata a duração em segundos para o formato HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds)) return "00:00"

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

/**
 * Formata números grandes com separadores de milhar
 */
export function formatNumber(num: number): string {
  if (isNaN(num)) return "0"

  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  }

  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }

  return num.toString()
}
