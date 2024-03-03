import { format, getTime, formatDistanceToNow, formatDistance } from 'date-fns'

// ----------------------------------------------------------------------

export function fDate(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy'
  try {
    return date ? format(new Date(date), fm) : ''
  } catch (error) {
    return date
  }
}

export function fDateTime(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy p'

  try {
    return date ? format(new Date(date), fm) : ''
  } catch (error) {
    return date
  }
}

export function fTimestamp(date) {
  try {
    return date ? getTime(new Date(date)) : ''
  } catch (error) {
    return date
  }
}

export function fToNow(date) {
  try {
    return date
      ? formatDistanceToNow(new Date(date), {
          addSuffix: true
        })
      : ''
  } catch (error) {
    return date
  }
}

export function formatRange(startDate, endDate) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  const startFormatted = startDate.toLocaleDateString(undefined, options)
  const endFormatted = endDate.toLocaleDateString(undefined, options)

  return `from ${startFormatted} to ${endFormatted}`
}
