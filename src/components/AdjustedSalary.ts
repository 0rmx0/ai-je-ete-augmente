import type { Salary } from '@/components/Salary'
import { SharedConfiguration } from '@/components/SharedConfiguration'
import type { InflationRates } from '@/components/InflationRates'

export interface AdjustedSalary {
  readonly date: string
  readonly income: number
  readonly incomeAdjusted: number
  readonly cumulatedInflationMultiplier: number
  readonly originalSalary: Salary | null
  readonly salaryChange: number
  readonly salaryChangeAdjusted: number
  readonly state: 'initial' | 'up' | 'down'
}

export function toMonthlyNetIncome(income: number): number {
  switch (SharedConfiguration.incomeMode) {
    case 'gross-annual':
      return (income * (1 - SharedConfiguration.imposition / 100)) / 12
    case 'hourly-rate':
      return income * SharedConfiguration.monthlyHours * (1 - SharedConfiguration.imposition / 100)
    default:
      return income
  }
}

export function AdjustedSalaryCreateFirst(salary: Salary): AdjustedSalary {
  const monthlyIncome: number = toMonthlyNetIncome(salary.income)

  return {
    date: salary.date,
    income: monthlyIncome,
    incomeAdjusted: monthlyIncome,
    cumulatedInflationMultiplier: 1,
    originalSalary: salary,
    salaryChange: 0,
    salaryChangeAdjusted: 0,
    state: 'initial'
  }
}

export function AdjustedSalaryCreateFromPrevious(
  salary: Salary,
  lastSalary: AdjustedSalary,
  cumulatedInflationMultiplier: number
): AdjustedSalary {
  const monthlyIncome: number = toMonthlyNetIncome(salary.income)

  return {
    date: salary.date,
    income: monthlyIncome,
    incomeAdjusted: monthlyIncome / cumulatedInflationMultiplier,
    cumulatedInflationMultiplier: cumulatedInflationMultiplier,
    originalSalary: salary,
    salaryChange: (monthlyIncome / lastSalary.income - 1) * 100,
    salaryChangeAdjusted:
      (monthlyIncome / cumulatedInflationMultiplier / lastSalary.incomeAdjusted - 1) * 100,
    state: lastSalary.incomeAdjusted >= monthlyIncome / cumulatedInflationMultiplier ? 'down' : 'up'
  }
}

export function AdjustedSalaryCreateFiller(
  date: string,
  lastSalary: AdjustedSalary,
  cumulatedInflationMultiplier: number
): AdjustedSalary {
  return {
    date: date,
    income: lastSalary.income,
    incomeAdjusted: lastSalary.income / cumulatedInflationMultiplier,
    cumulatedInflationMultiplier: cumulatedInflationMultiplier,
    originalSalary: null,
    salaryChange: 0,
    salaryChangeAdjusted:
      (lastSalary.income / cumulatedInflationMultiplier / lastSalary.incomeAdjusted - 1) * 100,
    state:
      lastSalary.incomeAdjusted >= lastSalary.income * cumulatedInflationMultiplier ? 'down' : 'up'
  }
}

export function AdjustedSalaryCreateListUpToDate(
  salaries: Salary[],
  inflationRates: InflationRates,
  date: Date
): AdjustedSalary[] {
  if (salaries.length == 0) {
    return []
  }

  const clonedSalaries = [] as Salary[]
  salaries.forEach((salary: Salary) => clonedSalaries.push(salary))

  const toMonth = date.getMonth() + 1
  const toYear = date.getFullYear()
  const [sYear, sMonth] = clonedSalaries[0].date.split('-')
  let month = parseInt(sMonth)
  let year = parseInt(sYear)
  let cumulatedInflationMultiplier = 1
  let lastSalary: AdjustedSalary

  const adjustedSalaries = [] as AdjustedSalary[]
  adjustedSalaries.push((lastSalary = AdjustedSalaryCreateFirst(clonedSalaries.shift()!)))
  month++
  if (month > 12) {
    month = 1
    year++
  }

  while (year < toYear || month <= toMonth) {
    const sMonth = ('' + month).padStart(2, '0')
    const sYear = '' + year
    const date = sYear + '-' + sMonth
    if (!(date in inflationRates)) {
      if (clonedSalaries.length === 0) {
        break
      }
    }
    const inflationRate = date in inflationRates ? inflationRates[date] : 0
    cumulatedInflationMultiplier *= 1 + inflationRate / 100

    if (clonedSalaries.length > 0 && date == clonedSalaries[0].date) {
      adjustedSalaries.push(
        (lastSalary = AdjustedSalaryCreateFromPrevious(
          clonedSalaries.shift()!,
          lastSalary,
          cumulatedInflationMultiplier
        ))
      )
    } else {
      adjustedSalaries.push(
        AdjustedSalaryCreateFiller(date, lastSalary, cumulatedInflationMultiplier)
      )
    }

    month++
    if (month > 12) {
      month = 1
      year++
    }
  }

  return adjustedSalaries
}
