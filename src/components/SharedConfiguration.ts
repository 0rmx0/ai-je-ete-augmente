import type { IncomeMode } from '@/components/IncomeMode'
import { incomeModes } from '@/components/IncomeMode'
import type { RaiseMode } from '@/components/RaiseMode'
import { raiseModes } from '@/components/RaiseMode'
import { reactive } from 'vue'
import type { countryCode } from '@/components/CountryCodes'
import { countryCodes } from '@/components/CountryCodes'
import type { InflationRates } from '@/components/InflationRates'
import { isValidInflationRates } from '@/components/InflationRates'
import { loadJson } from '@/components/Storage'

const navigatorLang = navigator.language.substring(0, 2) as countryCode

export interface Configuration {
  country: countryCode
  currency: string
  customInflation: null | InflationRates
  imposition: number
  incomeMode: IncomeMode
  indexPointValue: number
  locale: string
  monthlyHours: number
  raiseMode: RaiseMode
  useCustomInflation: boolean
}

export const locales = ['fr', 'en']

export const DefaultConfiguration: Configuration = {
  country: (countryCodes.includes(navigatorLang) ? navigatorLang : 'fr') as countryCode,
  currency: '€' as string,
  customInflation: null as null,
  imposition: 35 as number,
  incomeMode: 'net-monthly' as IncomeMode,
  indexPointValue: 0 as number,
  locale: (navigatorLang === 'fr' ? 'fr' : 'en') as string,
  monthlyHours: 151.67 as number,
  raiseMode: 'absolute' as RaiseMode,
  useCustomInflation: false as boolean
}

export const SharedConfiguration: Configuration = reactive({
  country: DefaultConfiguration.country,
  currency: DefaultConfiguration.currency,
  customInflation: DefaultConfiguration.customInflation,
  imposition: DefaultConfiguration.imposition,
  incomeMode: DefaultConfiguration.incomeMode,
  indexPointValue: DefaultConfiguration.indexPointValue,
  locale: DefaultConfiguration.locale,
  monthlyHours: DefaultConfiguration.monthlyHours,
  raiseMode: DefaultConfiguration.raiseMode,
  useCustomInflation: DefaultConfiguration.useCustomInflation
})

function finiteNumberOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && isFinite(value) ? value : fallback
}

export function loadConfigurationFromStorage(): void {
  const parsed = loadJson<Record<string, unknown> | null>('configuration', null)
  if (parsed === null || typeof parsed !== 'object') {
    return
  }
  SharedConfiguration.country = countryCodes.includes(parsed.country as countryCode)
    ? (parsed.country as countryCode)
    : DefaultConfiguration.country
  SharedConfiguration.currency =
    typeof parsed.currency === 'string' ? parsed.currency : DefaultConfiguration.currency
  SharedConfiguration.customInflation = isValidInflationRates(parsed.customInflation)
    ? parsed.customInflation
    : DefaultConfiguration.customInflation
  SharedConfiguration.imposition = finiteNumberOr(
    parsed.imposition,
    DefaultConfiguration.imposition
  )
  SharedConfiguration.incomeMode = incomeModes.includes(parsed.incomeMode as IncomeMode)
    ? (parsed.incomeMode as IncomeMode)
    : DefaultConfiguration.incomeMode
  SharedConfiguration.indexPointValue = finiteNumberOr(
    parsed.indexPointValue,
    DefaultConfiguration.indexPointValue
  )
  SharedConfiguration.locale = locales.includes(parsed.locale as string)
    ? (parsed.locale as string)
    : DefaultConfiguration.locale
  SharedConfiguration.monthlyHours = finiteNumberOr(
    parsed.monthlyHours,
    DefaultConfiguration.monthlyHours
  )
  SharedConfiguration.raiseMode = raiseModes.includes(parsed.raiseMode as RaiseMode)
    ? (parsed.raiseMode as RaiseMode)
    : DefaultConfiguration.raiseMode
  SharedConfiguration.useCustomInflation =
    typeof parsed.useCustomInflation === 'boolean'
      ? parsed.useCustomInflation
      : DefaultConfiguration.useCustomInflation
}
