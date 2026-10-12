import type { IncomeMode } from '@/components/IncomeMode'
import { reactive } from 'vue'
import type { countryCode } from '@/components/CountryCodes'
import { countryCodes } from '@/components/CountryCodes'
import type { InflationRates } from '@/components/InflationRates'

const navigatorLang = navigator.language.substring(0, 2) as countryCode

export interface Configuration {
  country: countryCode
  currency: string
  customInflation: null | InflationRates
  imposition: number
  incomeMode: IncomeMode
  locale: string
  monthlyHours: number
  useCustomInflation: boolean
}

export const DefaultConfiguration: Configuration = {
  country: (countryCodes.includes(navigatorLang) ? navigatorLang : 'fr') as countryCode,
  currency: '€' as string,
  customInflation: null as null,
  imposition: 35 as number,
  incomeMode: 'net-monthly' as IncomeMode,
  locale: (navigatorLang === 'fr' ? 'fr' : 'en') as string,
  monthlyHours: 151.67 as number,
  useCustomInflation: false as boolean
}

export const SharedConfiguration: Configuration = reactive({
  country: DefaultConfiguration.country,
  currency: DefaultConfiguration.currency,
  customInflation: DefaultConfiguration.customInflation,
  imposition: DefaultConfiguration.imposition,
  incomeMode: DefaultConfiguration.incomeMode,
  locale: DefaultConfiguration.locale,
  monthlyHours: DefaultConfiguration.monthlyHours,
  useCustomInflation: DefaultConfiguration.useCustomInflation
})
