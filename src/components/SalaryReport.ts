import type { AdjustedSalary } from '@/components/AdjustedSalary'
import type { Configuration } from '@/components/SharedConfiguration'
import type { Salary } from '@/components/Salary'
import type { InflationRates } from '@/components/InflationRates'

export type TranslateFunction = (key: string, params?: Record<string, unknown>) => string

export interface SalaryReportInput {
  salaries: Salary[]
  adjustedSalaries: AdjustedSalary[]
  inflationRates: InflationRates
  missingInflationRates: string[]
  lastKnownInflationRate: string | null
  configuration: Configuration
  generatedDate?: Date
}

export function toCanonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) {
    return '[' + value.map(toCanonicalJson).join(',') + ']'
  }
  const record = value as Record<string, unknown>
  const keys = Object.keys(record).sort()
  return (
    '{' +
    keys.map((key) => JSON.stringify(key) + ':' + toCanonicalJson(record[key])).join(',') +
    '}'
  )
}

export async function sha256Hex(content: string): Promise<string> {
  const bytes = new TextEncoder().encode(content)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((byte: number): string => byte.toString(16).padStart(2, '0'))
    .join('')
}

function formatAmount(value: number, locale: string): string {
  return value.toLocaleString(locale, { maximumFractionDigits: 4 })
}

function formatPercent(value: number): string {
  return (value >= 0 ? '' : '') + value.toFixed(3)
}

export function buildReportData(input: SalaryReportInput): Record<string, unknown> {
  const configuration = input.configuration
  return {
    configuration: {
      country: configuration.country,
      currency: configuration.currency,
      customInflation: configuration.useCustomInflation ? input.inflationRates : null,
      incomeMode: configuration.incomeMode,
      imposition: configuration.imposition,
      locale: configuration.locale,
      monthlyHours: configuration.monthlyHours,
      useCustomInflation: configuration.useCustomInflation
    },
    inflationRates: input.inflationRates,
    salaries: input.salaries,
    adjustedSalaries: input.adjustedSalaries.map((adjustedSalary: AdjustedSalary) => ({
      cumulatedInflationMultiplier: adjustedSalary.cumulatedInflationMultiplier,
      date: adjustedSalary.date,
      income: adjustedSalary.income,
      incomeAdjusted: adjustedSalary.incomeAdjusted,
      originalSalaryKey:
        adjustedSalary.originalSalary !== null ? adjustedSalary.originalSalary.key : null,
      salaryChange: adjustedSalary.salaryChange,
      salaryChangeAdjusted: adjustedSalary.salaryChangeAdjusted,
      state: adjustedSalary.state
    }))
  }
}

function inflationSourceKey(
  useCustomInflation: boolean,
  country: string
): { key: string; url: string | null } {
  if (useCustomInflation) {
    return { key: 'salary.report.sources.custom', url: null }
  }
  switch (country) {
    case 'uk':
      return {
        key: 'salary.report.sources.ons',
        url: 'https://www.ons.gov.uk/generator?format=csv&uri=/economy/inflationandpriceindices/timeseries/d7oe/mm23'
      }
    case 'ca':
      return {
        key: 'salary.report.sources.statcan',
        url: 'https://www150.statcan.gc.ca/n1/tbl/csv/18100006-fra.zip'
      }
    default:
      return {
        key: 'salary.report.sources.eurostat',
        url: 'https://ec.europa.eu/eurostat/api/dissemination/sdmx/2.1/data/prc_hicp_minr'
      }
  }
}

export function generateSalaryReport(input: SalaryReportInput, t: TranslateFunction): string {
  const { salaries, adjustedSalaries, configuration } = input
  const locale = configuration.locale
  const generatedDate = input.generatedDate ?? new Date()
  const lines: string[] = []

  lines.push(t('salary.report.header.title'))
  lines.push('')
  lines.push(t('salary.report.header.generated', { date: generatedDate.toISOString() }))
  lines.push('')
  lines.push(t('salary.report.header.purpose'))
  lines.push('')

  lines.push(t('salary.report.configuration.title'))
  lines.push('')
  if (configuration.useCustomInflation) {
    lines.push(t('salary.report.configuration.custom'))
  } else {
    lines.push(
      t('salary.report.configuration.country', {
        country: t('configure.country.options.' + configuration.country)
      })
    )
  }
  lines.push(t('salary.report.configuration.currency', { currency: configuration.currency }))
  lines.push(
    t('salary.report.configuration.incomeMode', {
      mode: t('salary.report.incomeModes.' + configuration.incomeMode)
    })
  )
  if (configuration.incomeMode !== 'net-monthly') {
    lines.push(
      t('salary.report.configuration.imposition', { imposition: configuration.imposition })
    )
  }
  if (configuration.incomeMode === 'hourly-rate') {
    lines.push(t('salary.report.configuration.monthlyHours', { hours: configuration.monthlyHours }))
  }
  lines.push('')

  lines.push(t('salary.report.data.title'))
  lines.push('')
  lines.push(t('salary.report.data.salariesTitle'))
  lines.push('')
  lines.push(
    '|' +
      t('salary.report.data.colKey') +
      ' | ' +
      t('salary.report.data.colDate') +
      ' | ' +
      t('salary.report.data.colSalary', {
        mode: t('salary.report.incomeModes.' + configuration.incomeMode)
      }) +
      ' |'
  )
  lines.push('|---|---|---|')
  salaries.forEach((salary: Salary) => {
    lines.push(
      '| ' +
        salary.key +
        ' | ' +
        salary.date +
        ' | ' +
        formatAmount(salary.income, locale) +
        ' ' +
        configuration.currency +
        ' |'
    )
  })
  lines.push('')

  lines.push(t('salary.report.data.inflationTitle'))
  lines.push('')
  if (configuration.useCustomInflation) {
    lines.push(t('salary.report.data.customNote'))
    lines.push('')
  }
  const sortedInflationDates = Object.keys(input.inflationRates).sort()
  if (sortedInflationDates.length > 0) {
    lines.push(
      t('salary.report.data.inflationCount', {
        count: sortedInflationDates.length,
        from: sortedInflationDates[0],
        to: sortedInflationDates[sortedInflationDates.length - 1]
      })
    )
  } else {
    lines.push(t('salary.report.warning.noKnown'))
  }
  lines.push('')
  lines.push(
    '|' + t('salary.report.data.colMonth') + ' | ' + t('salary.report.data.colRate') + ' |'
  )
  lines.push('|---|---|')
  sortedInflationDates.forEach((date: string) => {
    lines.push('| ' + date + ' | ' + formatPercent(input.inflationRates[date]) + ' |')
  })
  lines.push('')

  lines.push(t('salary.report.calculations.title'))
  lines.push('')
  lines.push(t('salary.report.calculations.formulas'))
  lines.push('')
  lines.push(t('salary.report.calculations.formulaIncome.' + configuration.incomeMode))
  lines.push(t('salary.report.calculations.formulaMultiplier'))
  lines.push(t('salary.report.calculations.formulaAdjusted'))
  lines.push(t('salary.report.calculations.formulaChange'))
  lines.push('')
  lines.push(t('salary.report.calculations.monthlyTitle'))
  lines.push('')
  lines.push(
    '|' +
      t('salary.report.data.colMonth') +
      ' | ' +
      t('salary.report.data.colIncome') +
      ' | ' +
      t('salary.report.data.colMonthlyInflation') +
      ' | ' +
      t('salary.report.data.colMultiplier') +
      ' | ' +
      t('salary.report.data.colAdjusted') +
      ' | ' +
      t('salary.report.data.colAnnounced') +
      ' | ' +
      t('salary.report.data.colReal') +
      ' |'
  )
  lines.push('|---|---|---|---|---|---|---|')
  let previousMultiplier: number | null = null
  adjustedSalaries.forEach((adjustedSalary: AdjustedSalary) => {
    const monthlyInflation =
      previousMultiplier === null || previousMultiplier === 0
        ? null
        : (adjustedSalary.cumulatedInflationMultiplier / previousMultiplier - 1) * 100
    previousMultiplier = adjustedSalary.cumulatedInflationMultiplier
    lines.push(
      '| ' +
        adjustedSalary.date +
        ' | ' +
        formatAmount(adjustedSalary.income, locale) +
        ' | ' +
        (monthlyInflation === null ? '-' : formatPercent(monthlyInflation)) +
        ' | ' +
        adjustedSalary.cumulatedInflationMultiplier.toFixed(6) +
        ' | ' +
        formatAmount(adjustedSalary.incomeAdjusted, locale) +
        ' | ' +
        formatPercent(adjustedSalary.salaryChange) +
        ' | ' +
        formatPercent(adjustedSalary.salaryChangeAdjusted) +
        ' |'
    )
  })
  lines.push('')

  if (adjustedSalaries.length > 0) {
    lines.push(t('salary.report.calculations.summaryTitle'))
    lines.push('')
    const first = adjustedSalaries[0]
    const last = adjustedSalaries[adjustedSalaries.length - 1]
    lines.push(
      t('salary.report.calculations.reference', {
        date: first.date,
        income: formatAmount(first.income, locale),
        currency: configuration.currency
      })
    )
    lines.push(
      t('salary.report.calculations.final', {
        date: last.date,
        income: formatAmount(last.income, locale),
        currency: configuration.currency
      })
    )
    lines.push(
      t('salary.report.calculations.finalAdjusted', {
        income: formatAmount(last.incomeAdjusted, locale),
        currency: configuration.currency
      })
    )
    if (adjustedSalaries.length > 1) {
      const overallChange = (last.income / first.income - 1) * 100
      const overallChangeAdjusted = (last.incomeAdjusted / first.incomeAdjusted - 1) * 100
      lines.push(
        t('salary.report.calculations.overallAnnounced', { change: formatPercent(overallChange) })
      )
      lines.push(
        t('salary.report.calculations.overallAdjusted', {
          change: formatPercent(overallChangeAdjusted)
        })
      )
    }
    if (salaries.length > 0) {
      const lastRawSalary = salaries[salaries.length - 1]
      lines.push(
        t('salary.report.calculations.minimalRaise', {
          raise: formatPercent((last.cumulatedInflationMultiplier - 1) * 100)
        })
      )
      lines.push(
        t('salary.report.calculations.minimalSalary', {
          income: formatAmount(lastRawSalary.income * last.cumulatedInflationMultiplier, locale),
          currency: configuration.currency,
          mode: t('salary.report.incomeModes.' + configuration.incomeMode)
        })
      )
    }
    lines.push('')
  }

  lines.push(t('salary.report.sources.title'))
  lines.push('')
  const source = inflationSourceKey(configuration.useCustomInflation, configuration.country)
  if (source.url === null) {
    lines.push(t(source.key))
  } else {
    lines.push(t(source.key, { link: source.url }))
  }
  lines.push(t('salary.report.sources.verification'))
  lines.push(t('salary.report.sources.app'))
  lines.push('')

  if (
    input.missingInflationRates.length > 0 ||
    input.lastKnownInflationRate !== null ||
    Object.keys(input.inflationRates).length === 0
  ) {
    lines.push(t('salary.report.warnings.title'))
    lines.push('')
    if (input.missingInflationRates.length > 0) {
      lines.push(
        t('salary.report.warnings.missing', { dates: input.missingInflationRates.join(', ') })
      )
    }
    if (input.lastKnownInflationRate !== null) {
      lines.push(t('salary.report.warnings.lastKnown', { date: input.lastKnownInflationRate }))
    }
    if (Object.keys(input.inflationRates).length === 0) {
      lines.push(t('salary.report.warning.noKnown'))
    }
    lines.push('')
  }

  return lines.join('\n')
}

export async function generateSalaryReportWithHash(
  input: SalaryReportInput,
  t: TranslateFunction
): Promise<{ content: string; hash: string; dataBlock: string }> {
  const body = generateSalaryReport(input, t)
  const dataBlock = toCanonicalJson(buildReportData(input))
  const hash = await sha256Hex(dataBlock)
  const integritySection =
    t('salary.report.integrity.title') +
    '\n\n' +
    t('salary.report.integrity.explanation') +
    '\n\n' +
    t('salary.report.integrity.hash', { hash: hash }) +
    '\n\n' +
    t('salary.report.integrity.howToVerify') +
    '\n\n' +
    t('salary.report.integrity.dataBlock') +
    '\n\n```json\n' +
    dataBlock +
    '\n```'
  return { content: body + '\n' + integritySection + '\n', hash, dataBlock }
}
