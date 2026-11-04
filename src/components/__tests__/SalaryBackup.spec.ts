import { describe, expect, it } from 'vitest'
import {
  parseSalariesBackup,
  parseSalariesCsv,
  parseSalariesJson,
  salariesToCsv,
  salariesToJson
} from '@/components/SalaryBackup'
import type { Salary } from '@/components/Salary'

const salaries = [
  { date: '2024-03', income: 2600, key: 2 },
  { date: '2024-01', income: 2500, key: 1 }
] as Salary[]

describe('salariesToJson / parseSalariesJson', () => {
  it('round-trips salaries sorted by date without keys', () => {
    const json = salariesToJson(salaries)
    const parsed = parseSalariesJson(json)
    expect(parsed.entries).toEqual([
      { date: '2024-01', income: 2500 },
      { date: '2024-03', income: 2600 }
    ])
    expect(parsed.skipped).toBe(0)
  })

  it('skips invalid entries and duplicates', () => {
    const parsed = parseSalariesJson(
      JSON.stringify([
        { date: '2024-01', income: 2500 },
        { date: '2024-01', income: 9999 },
        { date: '2024-13', income: 1 },
        { date: 'not-a-date', income: 1 },
        { date: '2024-02', income: -5 },
        { date: '2024-02', income: 'abc' },
        null,
        { date: '2024-05', income: 2700 }
      ])
    )
    expect(parsed.entries).toEqual([
      { date: '2024-01', income: 2500 },
      { date: '2024-05', income: 2700 }
    ])
    expect(parsed.skipped).toBe(6)
  })

  it('throws on non-array json', () => {
    expect(() => parseSalariesJson('{"2024-01": 2500}')).toThrow()
    expect(() => parseSalariesJson('not json')).toThrow()
  })
})

describe('salariesToCsv / parseSalariesCsv', () => {
  it('round-trips salaries as csv with header', () => {
    const csv = salariesToCsv(salaries)
    expect(csv).toBe('date,income\n2024-01,2500\n2024-03,2600\n')
    const parsed = parseSalariesCsv(csv)
    expect(parsed.entries).toEqual([
      { date: '2024-01', income: 2500 },
      { date: '2024-03', income: 2600 }
    ])
  })

  it('supports semicolon separator and comma decimals', () => {
    const parsed = parseSalariesCsv('date;income\n2024-01;2500,50\n2024-02;bad\n')
    expect(parsed.entries).toEqual([{ date: '2024-01', income: 2500.5 }])
    expect(parsed.skipped).toBe(1)
  })
})

describe('parseSalariesBackup', () => {
  it('dispatches on the file extension', () => {
    expect(parseSalariesBackup('date,income\n2024-01,2500\n', 'backup.CSV').entries).toEqual([
      { date: '2024-01', income: 2500 }
    ])
    expect(
      parseSalariesBackup('[{"date":"2024-01","income":2500}]', 'backup.json').entries
    ).toEqual([{ date: '2024-01', income: 2500 }])
  })
})
