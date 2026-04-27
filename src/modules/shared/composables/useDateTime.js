/**
 * Centralised date / time formatting helpers.
 *
 * Date inputs are always YYYY-MM-DD strings (from the API / native <input type="date">).
 * Time inputs are always HH:MM or HH:MM:SS strings (24-hour, from the API).
 * ISO datetime strings are handled where noted.
 *
 * All display formats:
 *   Dates  → dd/mm/yyyy  (or extended text variants)
 *   Times  → hh:mm AM/PM (12-hour)
 */
export function useDateTime() {
  function _toDate(str) {
    if (!str) return null
    return str.includes('T') ? new Date(str) : new Date(str + 'T00:00:00')
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    const normalized = String(dateStr).includes('T')
      ? String(dateStr).split('T')[0]
      : String(dateStr)
    const parts = normalized.split('-')
    if (parts.length < 3) return '—'
    const [y, m, d] = parts
    return `${d}/${m}/${y}`
  }

  function formatDateFull(dateStr) {
    if (!dateStr) return '—'
    const d = _toDate(dateStr)
    if (!d) return '—'
    return d.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  function formatDateMed(dateStr) {
    if (!dateStr) return '—'
    const d = _toDate(dateStr)
    if (!d) return '—'
    return d.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  function formatDateShort(dateStr) {
    if (!dateStr) return '—'
    const d = _toDate(dateStr)
    if (!d) return '—'
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }


  function formatTime(timeStr) {
    if (!timeStr) return '—'
    const [hStr, mStr] = timeStr.split(':')
    const h = parseInt(hStr, 10)
    const m = parseInt(mStr, 10)
    if (isNaN(h) || isNaN(m)) return '—'
    const period = h >= 12 ? 'PM' : 'AM'
    const hour = h % 12 || 12
    return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`
  }

  function formatTimeFromISO(isoStr) {
    if (!isoStr) return '—'
    const d = new Date(isoStr)
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  function formatDateTimeFromISO(isoStr) {
    if (!isoStr) return '—'
    const d = new Date(isoStr)
    const datePart = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    const timePart = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    return `${datePart}, ${timePart}`
  }

  // Handles ISO 8601 strings with timezone offset, e.g. "2026-04-21T14:36:31+07:00"
  // Output: "21/04/2026, 02:36 PM"
  function formatOffsetDateTime(isoStr) {
    if (!isoStr) return '—'
    const d = new Date(isoStr)
    if (isNaN(d.getTime())) return '—'
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const h = d.getHours()
    const min = String(d.getMinutes()).padStart(2, '0')
    const period = h >= 12 ? 'PM' : 'AM'
    const hour = String(h % 12 || 12).padStart(2, '0')
    return `${day}/${month}/${year}, ${hour}:${min} ${period}`
  }

  return {
    formatDate,
    formatDateFull,
    formatDateMed,
    formatDateShort,
    formatTime,
    formatTimeFromISO,
    formatDateTimeFromISO,
    formatOffsetDateTime
  }
}
