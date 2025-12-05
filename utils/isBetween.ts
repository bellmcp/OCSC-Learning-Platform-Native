/**
 * Check if current date is between min and max dates
 * @param min - Start date string (ISO format)
 * @param max - End date string (ISO format)
 * @param current - Optional current date array [year, month, day]
 * @returns boolean - true if current date is between min and max
 */
export default function isBetween(
  min: string | undefined | null,
  max: string | undefined | null,
  current?: string[]
): boolean {
  if (!min || !max) return false

  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const d1 = min.slice(0, 10).split('-')
  const d2 = max.slice(0, 10).split('-')

  let c: string[]
  if (current) {
    c = current
  } else {
    c = formatter
      .format(new Date())
      .replaceAll(' ', 'T')
      .slice(0, 10)
      .split('-')
  }

  const from = new Date(
    parseInt(d1[0]),
    parseInt(d1[1]) - 1,
    parseInt(d1[2])
  )
  const to = new Date(
    parseInt(d2[0]),
    parseInt(d2[1]) - 1,
    parseInt(d2[2])
  )
  const check = new Date(
    parseInt(c[0]),
    parseInt(c[1]) - 1,
    parseInt(c[2])
  )

  return check >= from && check <= to
}
