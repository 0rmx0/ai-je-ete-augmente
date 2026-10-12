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

function findDate(text: string, today: Date): string | null {
  const currentYear = today.getFullYear()

  for (const match of text.matchAll(/\b(\d{4})[-/.](\d{2})\b/g)) {
    const year = parseInt(match[1])
    const month = parseInt(match[2])
    if (month >= 1 && month <= 12 && year >= 1990 && year <= currentYear) {
      return match[1] + '-' + match[2]
    }
  }

  const normalizedText = normalize(text)

  for (const match of normalizedText.matchAll(
    /\b(?:0?[1-9]|[12]\d|3[01])\s?(?:er)?\s?([a-z]+)\s+(\d{4})\b/g
  )) {
    const month = MONTHS[match[1]]
    const year = parseInt(match[2])
    if (month !== undefined && year >= 1990 && year <= currentYear) {
      return match[2] + '-' + month.toString().padStart(2, '0')
    }
  }

  for (const match of normalizedText.matchAll(/\b([a-z]+)\s+(\d{4})\b/g)) {
    const month = MONTHS[match[1]]
    const year = parseInt(match[2])
    if (month !== undefined && year >= 1990 && year <= currentYear) {
      return match[2] + '-' + month.toString().padStart(2, '0')
    }
  }

  for (const match of text.matchAll(/\b(\d{2})\/(\d{4})\b/g)) {
    const month = parseInt(match[1])
    const year = parseInt(match[2])
    if (month >= 1 && month <= 12 && year >= 1990 && year <= currentYear) {
      return match[2] + '-' + match[1]
    }
  }

  return null
}

function findIncome(text: string, labels: Array<RegExp>): number | null {
  for (const label of labels) {
    for (const line of text.split(/\r?\n/)) {
      if (!label.test(normalize(line))) {
        continue
      }
      const amounts = [...line.matchAll(/-?\d[\d \u00a0]*[.,]?\d{0,2}\s?\u20ac?/g)]
      for (let i = amounts.length - 1; i >= 0; i--) {
        const parsed = parseAmount(amounts[i][0])
        if (parsed !== null && parsed > 0) {
          return parsed
        }
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
