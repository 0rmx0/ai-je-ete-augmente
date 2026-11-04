import type { Salary } from '@/components/Salary'
import { DATE_PATTERN } from '@/components/Storage'

export interface ParsedBackupEntry {
  readonly date: string
  readonly income: number
}

export interface BackupParseResult {
  readonly entries: ParsedBackupEntry[]
  readonly skipped: number
}

function isValidEntry(value: unknown): value is ParsedBackupEntry {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const record = value as Record<string, unknown>
  return (
    typeof record.date === 'string' &&
    DATE_PATTERN.test(record.date) &&
    typeof record.income === 'number' &&
    isFinite(record.income) &&
    record.income >= 0
  )
}

function collectEntries(values: Iterable<unknown>): BackupParseResult {
  const seenDates = new Set<string>()
  const entries: ParsedBackupEntry[] = []
  let skipped = 0
  for (const value of values) {
    if (!isValidEntry(value)) {
      skipped++
      continue
    }
    if (seenDates.has(value.date)) {
      skipped++
      continue
    }
    seenDates.add(value.date)
    entries.push({ date: value.date, income: value.income })
  }
  return { entries, skipped }
}

export function salariesToJson(salaries: Salary[]): string {
  const sorted = [...salaries].sort((s1: Salary, s2: Salary): number =>
    s1.date < s2.date ? -1 : 1
  )
  return JSON.stringify(
    sorted.map(({ date, income }): ParsedBackupEntry => ({ date, income })),
    null,
    2
  )
}

export function salariesToCsv(salaries: Salary[]): string {
  const sorted = [...salaries].sort((s1: Salary, s2: Salary): number =>
    s1.date < s2.date ? -1 : 1
  )
  const lines = ['date,income']
  for (const salary of sorted) {
    lines.push(salary.date + ',' + salary.income)
  }
  return lines.join('\n') + '\n'
}

export function parseSalariesJson(text: string): BackupParseResult {
  const parsed: unknown = JSON.parse(text)
  if (!Array.isArray(parsed)) {
    throw new Error('JSON backup must be an array of { date, income } entries')
  }
  return collectEntries(parsed)
}

export function parseSalariesCsv(text: string): BackupParseResult {
  const lines = text.split(/\r?\n/).filter((line: string): boolean => line.trim() !== '')
  const values: unknown[] = []
  for (const [index, line] of lines.entries()) {
    const separator = line.includes(';') ? ';' : ','
    const parts = line.split(separator).map((part: string): string => part.trim())
    if (index === 0 && parts[0].toLowerCase() === 'date') {
      continue
    }
    if (parts.length !== 2) {
      values.push(null)
      continue
    }
    const income = Number(parts[1].replace(',', '.'))
    values.push({ date: parts[0], income })
  }
  return collectEntries(values)
}

export function parseSalariesBackup(text: string, fileName: string): BackupParseResult {
  if (fileName.toLowerCase().endsWith('.csv')) {
    return parseSalariesCsv(text)
  }
  return parseSalariesJson(text)
}
