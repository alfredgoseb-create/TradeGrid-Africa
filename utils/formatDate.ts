// utils/formatDate.ts
import { format } from 'date-fns'

/**
 * Safely formats a date string to "dd/MM/yyyy"
 * @param dateString ISO string or Date object
 * @param dateFormat optional format string
 * @returns formatted date string or original input if invalid
 */
export function formatDate(dateString: string | Date, dateFormat = 'dd/MM/yyyy') {
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString)
    return format(date, dateFormat)
  } catch (error) {
    console.error('Invalid date:', dateString, error)
    return String(dateString)
  }
}