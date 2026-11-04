export type InflationRates = Record<string, number>

export type CountryInflationRates = Record<string, InflationRates>

const INFLATION_DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

export function isValidInflationRates(value: unknown): value is InflationRates {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }
  for (const [key, rate] of Object.entries(value)) {
    if (!INFLATION_DATE_PATTERN.test(key)) {
      return false
    }
    if (typeof rate !== 'number' || !isFinite(rate)) {
      return false
    }
  }
  return true
}
