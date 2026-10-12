export interface PayslipData {
  readonly date: string | null
  readonly income: number | null
}

export interface PayslipParseOptions {
  readonly incomeMode: 'net-monthly' | 'gross-annual'
  readonly today?: Date
}

const MONTHS: Record<string, number> = {
  janvier: 1,
  fevrier: 2,
  mars: 3,
  avril: 4,
  mai: 5,
  juin: 6,
  juillet: 7,
  aout: 8,
  septembre: 9,
  octobre: 10,
  novembre: 11,
  decembre: 12,
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12
}

const NET_LABELS: Array<RegExp> = [
  /net a payer avant impot/,
  /net a payer/,
  /net a percevoir/,
  /salaire net/,
  /net pay/,
  /take home pay/
]

const GROSS_LABELS: Array<RegExp> = [/salaire brut/, /brut/i, /gross pay/, /gross salary/]

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function parseAmount(raw: string): number | null {
  const cleaned = raw
    .replace(/\u00a0/g, ' ')
    .replace(/[^-\d, .]/g, '')
    .trim()
  const match = cleaned.match(/-?\d[\d ]*(?:[.,]\d+)?/)
  if (match === null) {
    return null
  }
  let value = match[0].replace(/ /g, '')
  const lastSeparator = Math.max(value.lastIndexOf(','), value.lastIndexOf('.'))
  if (lastSeparator !== -1) {
    const decimals = value.length - lastSeparator - 1
    if (
      decimals === 3 &&
      value.lastIndexOf(',', lastSeparator - 1) === -1 &&
      value.lastIndexOf('.', lastSeparator - 1) === -1
    ) {
      value = value.replace(/[, .]/g, '')
    } else {
      const integerPart = value.slice(0, lastSeparator).replace(/[, .]/g, '')
      value = integerPart + '.' + value.slice(lastSeparator + 1)
    }
  }
  const parsed = parseFloat(value)
  return isNaN(parsed) ? null : parsed
}

function isValidPeriod(year: number, month: number, currentYear: number): boolean {
  return month >= 1 && month <= 12 && year >= 1990 && year <= currentYear
}

function monthNameDate(normalizedLine: string, currentYear: number): string | null {
  for (const match of normalizedLine.matchAll(
    /\b(?:0?[1-9]|[12]\d|3[01])\s?(?:er)?\s?([a-z]+)\s+(\d{4})\b/g
  )) {
    const month = MONTHS[match[1]]
    const year = parseInt(match[2])
    if (month !== undefined && year >= 1990 && year <= currentYear) {
      return match[2] + '-' + month.toString().padStart(2, '0')
    }
  }
  for (const match of normalizedLine.matchAll(/\b([a-z]+)\s+(\d{4})\b/g)) {
    const month = MONTHS[match[1]]
    const year = parseInt(match[2])
    if (month !== undefined && year >= 1990 && year <= currentYear) {
      return match[2] + '-' + month.toString().padStart(2, '0')
    }
  }
  return null
}

function lineDate(line: string, currentYear: number): string | null {
  for (const match of line.matchAll(/\b(\d{4})[-/.](\d{2})\b/g)) {
    const year = parseInt(match[1])
    const month = parseInt(match[2])
    if (isValidPeriod(year, month, currentYear)) {
      return match[1] + '-' + match[2]
    }
  }
  for (const match of line.matchAll(/\b(\d{2})\/(\d{4})\b/g)) {
    const month = parseInt(match[1])
    const year = parseInt(match[2])
    if (isValidPeriod(year, month, currentYear)) {
      return match[2] + '-' + match[1].padStart(2, '0')
    }
  }
  for (const match of line.matchAll(/\b(\d{2})\/(\d{2})\/(\d{4})\b/g)) {
    const month = parseInt(match[2])
    const year = parseInt(match[3])
    if (isValidPeriod(year, month, currentYear)) {
      return match[3] + '-' + match[2]
    }
  }
  return monthNameDate(normalize(line), currentYear)
}

function findDate(text: string, today: Date): string | null {
  const currentYear = today.getFullYear()
  const lines = text.split(/\r?\n/)

  for (const line of lines) {
    const normalizedLine = normalize(line)
    if (
      !/periode|paie|paye|salaire de|payroll period|pay period|payment period/.test(normalizedLine)
    ) {
      continue
    }
    const date = lineDate(line, currentYear)
    if (date !== null) {
      return date
    }
  }

  const datesByLine: Array<string> = []
  for (const line of lines) {
    const date = lineDate(line, currentYear)
    if (date !== null) {
      datesByLine.push(date)
    }
  }
  if (datesByLine.length === 0) {
    return null
  }

  const counts = new Map<string, number>()
  for (const date of datesByLine) {
    counts.set(date, (counts.get(date) ?? 0) + 1)
  }
  const mostFrequent = [...counts.entries()].sort(
    (e1: [string, number], e2: [string, number]): number =>
      e2[1] - e1[1] || (e1[0] < e2[0] ? 1 : -1)
  )[0][0]

  const [lastYear] = datesByLine[datesByLine.length - 1].split('-').map(Number)
  const candidateYears = new Set<number>([lastYear, today.getFullYear()])
  const inRecentPeriod = datesByLine.some((date: string): boolean =>
    candidateYears.has(parseInt(date.split('-')[0]))
  )
  if (inRecentPeriod) {
    return mostFrequent
  }
  return datesByLine[datesByLine.length - 1]
}

function findIncome(text: string, labels: Array<RegExp>): number | null {
  const lines = text.split(/\r?\n/)
  const lineAmounts = (line: string): Array<number> =>
    [...line.matchAll(/-?\d[\d \u00a0]*[.,]?\d{0,2}\s?\u20ac?/g)]
      .map((amount: RegExpMatchArray): number | null => parseAmount(amount[0]))
      .filter((amount: number | null): boolean => amount !== null && amount > 0) as Array<number>
  const candidateLines = (index: number): Array<number> => {
    const candidates: Array<number> = []
    for (const offset of [0, 1, -1]) {
      const lineIndex = index + offset
      if (lineIndex < 0 || lineIndex >= lines.length) {
        continue
      }
      for (const amount of lineAmounts(lines[lineIndex])) {
        candidates.push(amount)
      }
    }
    return candidates
  }
  for (const label of labels) {
    for (let index = 0; index < lines.length; index++) {
      const normalizedLine = normalize(lines[index])
      if (!label.test(normalizedLine)) {
        continue
      }
      if (/cumul|depuis|year.to.date|ytd/.test(normalizedLine)) {
        continue
      }
      for (const amount of candidateLines(index)) {
        return amount
      }
    }
  }
  return null
}

export function parsePayslipText(text: string, options: PayslipParseOptions): PayslipData {
  const today = options.today ?? new Date()
  const labels = options.incomeMode === 'gross-annual' ? GROSS_LABELS : NET_LABELS
  return {
    date: findDate(text, today),
    income: findIncome(text, labels)
  }
}
