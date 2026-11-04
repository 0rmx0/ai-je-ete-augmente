import type { Salary } from '@/components/Salary'

export const DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

export function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) {
      return fallback
    }
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function sanitizeSalaries(value: unknown): Salary[] {
  if (!Array.isArray(value)) {
    return []
  }
  const seenDates = new Set<string>()
  const salaries: Salary[] = []
  for (const entry of value) {
    if (typeof entry !== 'object' || entry === null) {
      continue
    }
    const record = entry as Record<string, unknown>
    if (typeof record.date !== 'string' || !DATE_PATTERN.test(record.date)) {
      continue
    }
    if (typeof record.income !== 'number' || !isFinite(record.income) || record.income < 0) {
      continue
    }
    if (typeof record.key !== 'number' || !isFinite(record.key)) {
      continue
    }
    if (seenDates.has(record.date)) {
      continue
    }
    seenDates.add(record.date)
    salaries.push({ date: record.date, income: record.income, key: record.key })
  }
  return salaries.sort((s1: Salary, s2: Salary): number => (s1.date < s2.date ? -1 : 1))
}
