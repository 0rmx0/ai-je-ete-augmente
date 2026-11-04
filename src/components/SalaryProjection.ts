import type { AdjustedSalary } from '@/components/AdjustedSalary'
import { AdjustedSalaryCreateListUpToDate } from '@/components/AdjustedSalary'
import type { InflationRates } from '@/components/InflationRates'
import type { Salary } from '@/components/Salary'
import { DATE_PATTERN } from '@/components/Storage'

export function trailingAverageRate(rates: InflationRates, window: number): number | null {
  const knownDates = Object.keys(rates).sort()
  if (knownDates.length === 0) {
    return null
  }
  const recent = knownDates.slice(-Math.max(1, window))
  return recent.reduce((sum: number, date: string): number => sum + rates[date], 0) / recent.length
}

export function extendInflationRates(
  rates: InflationRates,
  upToDate: string,
  window: number
): InflationRates {
  const extended: InflationRates = { ...rates }
  const knownDates = Object.keys(rates).sort()
  if (knownDates.length === 0 || !DATE_PATTERN.test(upToDate)) {
    return extended
  }
  const lastKnown = knownDates[knownDates.length - 1]
  const [lastKnownYear, lastKnownMonth] = lastKnown.split('-').map(Number)
  const [targetYear, targetMonth] = upToDate.split('-').map(Number)
  if (
    targetYear < lastKnownYear ||
    (targetYear === lastKnownYear && targetMonth <= lastKnownMonth)
  ) {
    return extended
  }
  const average = trailingAverageRate(rates, window)
  if (average === null) {
    return extended
  }
  let year = lastKnownYear
  let month = lastKnownMonth
  while (year < targetYear || (year === targetYear && month < targetMonth)) {
    month++
    if (month > 12) {
      month = 1
      year++
    }
    const key = year + '-' + month.toString().padStart(2, '0')
    if (!(key in extended)) {
      extended[key] = average
    }
  }
  return extended
}

export function lastKnownInflationRate(rates: InflationRates): string | null {
  const knownDates = Object.keys(rates).sort()
  return knownDates.length > 0 ? knownDates[knownDates.length - 1] : null
}

export function projectAdjustedSalary(
  salaries: Salary[],
  rates: InflationRates,
  targetDate: string,
  raisePercent: number,
  window = 12
): AdjustedSalary | null {
  if (salaries.length === 0 || !DATE_PATTERN.test(targetDate) || !isFinite(raisePercent)) {
    return null
  }
  const lastSalary = salaries[salaries.length - 1]
  if (targetDate <= lastSalary.date) {
    return null
  }
  const simulated: Salary = {
    date: targetDate,
    income: lastSalary.income * (1 + raisePercent / 100),
    key: -1
  }
  const extended = extendInflationRates(rates, targetDate, window)
  const [year, month] = targetDate.split('-').map(Number)
  const list = AdjustedSalaryCreateListUpToDate(
    [...salaries, simulated],
    extended,
    new Date(year, month - 1, 1)
  )
  return list.length > 0 ? list[list.length - 1] : null
}
