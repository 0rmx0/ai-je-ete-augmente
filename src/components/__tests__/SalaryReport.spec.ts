import { describe, expect, it } from 'vitest'
import {
  buildReportData,
  generateSalaryReport,
  generateSalaryReportWithHash,
  toCanonicalJson
} from '@/components/SalaryReport'
import { AdjustedSalaryCreateListUpToDate } from '@/components/AdjustedSalary'
import type { Salary } from '@/components/Salary'
import type { Configuration } from '@/components/SharedConfiguration'
import { DefaultConfiguration } from '@/components/SharedConfiguration'

const inflationRates = {
  '2023-01': 0.4,
  '2023-02': 0.7,
  '2023-03': 0.1
}

const salaries = [
  { date: '2023-01', income: 2500, key: 1 },
  { date: '2023-03', income: 2600, key: 2 }
] as Salary[]

const t = (key: string, params?: Record<string, unknown>): string =>
  key + (params ? ':' + JSON.stringify(params) : '')

describe('toCanonicalJson', () => {
  it('is stable regardless of key order', () => {
    expect(toCanonicalJson({ b: 1, a: 2 })).toBe(toCanonicalJson({ a: 2, b: 1 }))
  })

  it('sorts nested objects keys', () => {
    expect(toCanonicalJson({ z: { b: 1, a: 2 } })).toBe('{"z":{"a":2,"b":1}}')
  })
})

describe('generateSalaryReport', () => {
  const configuration = {
    ...DefaultConfiguration,
    country: 'fr',
    currency: '€',
    locale: 'fr'
  } as Configuration
  const adjustedSalaries = AdjustedSalaryCreateListUpToDate(
    salaries,
    inflationRates,
    new Date('2023-03-31')
  )

  it('contains every salary and every month', () => {
    const report = generateSalaryReport(
      {
        salaries,
        adjustedSalaries,
        inflationRates,
        missingInflationRates: [],
        lastKnownInflationRate: null,
        configuration
      },
      t
    )
    expect(report).toContain('2023-01')
    expect(report).toContain('2023-02')
    expect(report).toContain('2023-03')
    expect(report).toContain((2500).toLocaleString('fr', { maximumFractionDigits: 4 }))
    expect(report).toContain((2600).toLocaleString('fr', { maximumFractionDigits: 4 }))
  })

  it('contains the integrity data block and hash', async () => {
    const { content, hash, dataBlock } = await generateSalaryReportWithHash(
      {
        salaries,
        adjustedSalaries,
        inflationRates,
        missingInflationRates: [],
        lastKnownInflationRate: null,
        configuration
      },
      t
    )
    expect(content).toContain(dataBlock)
    expect(content).toContain(hash)
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
  })

  it('includes custom inflation warning and missing rates', () => {
    const report = generateSalaryReport(
      {
        salaries,
        adjustedSalaries,
        inflationRates,
        missingInflationRates: ['2023-04'],
        lastKnownInflationRate: '2023-03',
        configuration
      },
      t
    )
    expect(report).toContain('2023-04')
    expect(report).toContain('2023-03')
  })

  it('data block contains the adjusted salaries and rates', () => {
    const data = buildReportData({
      salaries,
      adjustedSalaries,
      inflationRates,
      missingInflationRates: [],
      lastKnownInflationRate: null,
      configuration
    })
    const parsed = JSON.parse(toCanonicalJson(data))
    expect(Object.keys(parsed.inflationRates).sort()).toEqual(['2023-01', '2023-02', '2023-03'])
    expect(parsed.salaries.length).toBe(2)
    expect(parsed.adjustedSalaries.length).toBe(3)
  })
})
