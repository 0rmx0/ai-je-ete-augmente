import { beforeEach, describe, expect, it } from 'vitest'
import {
  extendInflationRates,
  lastKnownInflationRate,
  projectAdjustedSalary,
  trailingAverageRate
} from '@/components/SalaryProjection'
import type { Salary } from '@/components/Salary'
import { SharedConfiguration } from '@/components/SharedConfiguration'

describe('SalaryProjection', () => {
  beforeEach(() => {
    SharedConfiguration.incomeMode = 'net-monthly'
  })

  const rates = {
    '2024-01': 1,
    '2024-02': 2,
    '2024-03': 3
  }
  const salaries = [
    { date: '2024-01', income: 2000, key: 1 },
    { date: '2024-03', income: 2100, key: 2 }
  ] as Salary[]

  it('computes the trailing average over the window', () => {
    expect(trailingAverageRate(rates, 12)).toBeCloseTo(2)
    expect(trailingAverageRate(rates, 2)).toBeCloseTo(2.5)
    expect(trailingAverageRate({}, 12)).toBeNull()
  })

  it('returns the last known rate', () => {
    expect(lastKnownInflationRate(rates)).toBe('2024-03')
    expect(lastKnownInflationRate({})).toBeNull()
  })

  it('extends rates after the last known month with the trailing average', () => {
    const extended = extendInflationRates(rates, '2024-06', 12)
    expect(extended['2024-04']).toBeCloseTo(2)
    expect(extended['2024-05']).toBeCloseTo(2)
    expect(extended['2024-06']).toBeCloseTo(2)
    expect(extended['2024-03']).toBe(3)
  })

  it('does not extend before or at the last known month', () => {
    const extended = extendInflationRates(rates, '2024-03', 12)
    expect(Object.keys(extended).sort()).toEqual(['2024-01', '2024-02', '2024-03'])
  })

  it('projects a future salary adjusted with extrapolated inflation', () => {
    const projection = projectAdjustedSalary(salaries, rates, '2024-06', 10)
    expect(projection).not.toBeNull()
    expect(projection!.date).toBe('2024-06')
    expect(projection!.income).toBeCloseTo(2100 * 1.1)
    const multiplier = 1.02 * 1.03 * Math.pow(1.02, 3)
    expect(projection!.cumulatedInflationMultiplier).toBeCloseTo(multiplier)
    expect(projection!.incomeAdjusted).toBeCloseTo((2100 * 1.1) / multiplier)
  })

  it('returns null when the target is not after the last salary', () => {
    expect(projectAdjustedSalary(salaries, rates, '2024-03', 10)).toBeNull()
    expect(projectAdjustedSalary(salaries, rates, '2024-02', 10)).toBeNull()
    expect(projectAdjustedSalary([], rates, '2024-06', 10)).toBeNull()
    expect(projectAdjustedSalary(salaries, rates, 'bad-date', 10)).toBeNull()
  })
})
