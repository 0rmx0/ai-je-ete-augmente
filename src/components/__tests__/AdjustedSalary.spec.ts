import { beforeEach, describe, expect, it } from 'vitest'
import {
  AdjustedSalaryCreateFiller,
  AdjustedSalaryCreateFirst,
  AdjustedSalaryCreateFromPrevious,
  AdjustedSalaryCreateListUpToDate
} from '@/components/AdjustedSalary'
import type { Salary } from '@/components/Salary'
import { SharedConfiguration } from '@/components/SharedConfiguration'

describe('AdjustedSalary', () => {
  beforeEach(() => {
    SharedConfiguration.incomeMode = 'net-monthly'
    SharedConfiguration.imposition = 35
    SharedConfiguration.monthlyHours = 151.67
  })

  const first = AdjustedSalaryCreateFirst({ date: '2024-01', income: 2000, key: 1 } as Salary)

  it('creates an initial adjusted salary with multiplier 1', () => {
    expect(first).toMatchObject({
      date: '2024-01',
      income: 2000,
      incomeAdjusted: 2000,
      cumulatedInflationMultiplier: 1,
      salaryChange: 0,
      salaryChangeAdjusted: 0,
      state: 'initial'
    })
  })

  it('marks a raise as up when it beats inflation', () => {
    const next = AdjustedSalaryCreateFromPrevious(
      { date: '2024-02', income: 2200, key: 2 } as Salary,
      first,
      1.02
    )
    expect(next.income).toBe(2200)
    expect(next.incomeAdjusted).toBeCloseTo(2200 / 1.02)
    expect(next.salaryChange).toBeCloseTo(10)
    expect(next.state).toBe('up')
  })

  it('marks a raise as down when inflation beats it', () => {
    const next = AdjustedSalaryCreateFromPrevious(
      { date: '2024-02', income: 2000, key: 2 } as Salary,
      first,
      1.05
    )
    expect(next.incomeAdjusted).toBeCloseTo(2000 / 1.05)
    expect(next.state).toBe('down')
  })

  it('marks a filler month as down when inflation erodes purchasing power', () => {
    const filler = AdjustedSalaryCreateFiller('2024-02', first, 1.05)
    expect(filler.incomeAdjusted).toBeCloseTo(2000 / 1.05)
    expect(filler.state).toBe('down')
    expect(filler.salaryChangeAdjusted).toBeCloseTo((1 / 1.05 - 1) * 100)
  })

  it('marks a filler month as up when prices decrease', () => {
    const filler = AdjustedSalaryCreateFiller('2024-02', first, 0.99)
    expect(filler.incomeAdjusted).toBeCloseTo(2000 / 0.99)
    expect(filler.state).toBe('up')
  })

  it('builds the monthly list up to the given date with fillers and salary changes', () => {
    const salaries = [
      { date: '2024-01', income: 2000, key: 1 },
      { date: '2024-03', income: 2100, key: 2 }
    ] as Salary[]
    const rates = { '2024-02': 1, '2024-03': 2 }
    const list = AdjustedSalaryCreateListUpToDate(salaries, rates, new Date(2024, 2, 1))
    expect(list.map((entry) => entry.date)).toEqual(['2024-01', '2024-02', '2024-03'])
    expect(list[0].cumulatedInflationMultiplier).toBe(1)
    expect(list[1].cumulatedInflationMultiplier).toBeCloseTo(1.01)
    expect(list[1].state).toBe('down')
    expect(list[2].cumulatedInflationMultiplier).toBeCloseTo(1.01 * 1.02)
    expect(list[2].income).toBe(2100)
    expect(list[2].incomeAdjusted).toBeCloseTo(2100 / (1.01 * 1.02))
  })

  it('stops at the first unknown month when no salary remains', () => {
    const salaries = [{ date: '2024-01', income: 2000, key: 1 }] as Salary[]
    const list = AdjustedSalaryCreateListUpToDate(salaries, {}, new Date(2024, 5, 1))
    expect(list.length).toBe(1)
  })

  it('treats unknown months as 0 while salaries remain', () => {
    const salaries = [
      { date: '2024-01', income: 2000, key: 1 },
      { date: '2024-03', income: 2100, key: 2 }
    ] as Salary[]
    const list = AdjustedSalaryCreateListUpToDate(salaries, { '2024-03': 2 }, new Date(2024, 2, 1))
    expect(list.length).toBe(3)
    expect(list[1].cumulatedInflationMultiplier).toBe(1)
    expect(list[2].cumulatedInflationMultiplier).toBeCloseTo(1.02)
  })

  it('converts gross annual income to monthly net', () => {
    SharedConfiguration.incomeMode = 'gross-annual'
    SharedConfiguration.imposition = 40
    const adjusted = AdjustedSalaryCreateFirst({ date: '2024-01', income: 24000, key: 1 } as Salary)
    expect(adjusted.income).toBeCloseTo(1200)
  })

  it('converts hourly rate to monthly net', () => {
    SharedConfiguration.incomeMode = 'hourly-rate'
    SharedConfiguration.imposition = 0
    SharedConfiguration.monthlyHours = 100
    const adjusted = AdjustedSalaryCreateFirst({ date: '2024-01', income: 20, key: 1 } as Salary)
    expect(adjusted.income).toBeCloseTo(2000)
  })
})
