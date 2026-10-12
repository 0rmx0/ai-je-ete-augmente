<script lang="ts">
import type { Salary } from '@/components/Salary'
import type { AdjustedSalary } from '@/components/AdjustedSalary'
import InflationChart from '@/components/InflationChart.vue'
import SalaryDisplay from '@/components/SalaryDisplay.vue'
import SalaryNew from '@/components/SalaryNew.vue'
import SalaryImport from '@/components/SalaryImport.vue'
import { defineComponent } from 'vue'
import { AdjustedSalaryCreateListUpToDate } from '@/components/AdjustedSalary'
import type { CountryInflationRates, InflationRates } from '@/components/InflationRates'
import AdjustedSalariesSummary from '@/components/AdjustedSalariesSummary.vue'
import IncomeModeSelect from '@/components/IncomeModeSelect.vue'
import type { Configuration } from '@/components/SharedConfiguration'
import { SharedConfiguration } from '@/components/SharedConfiguration'

export default defineComponent({
  components: {
    AdjustedSalariesSummary,
    InflationChart,
    IncomeModeSelect,
    SalaryDisplay,
    SalaryNew,
    SalaryImport
  },
  data() {
    return {
      configuration: SharedConfiguration as Configuration,
      inflationRates: {} as CountryInflationRates,
      salaries: [] as Salary[]
    }
  },
  async created() {
    this.inflationRates = await import(`../assets/inflations/${this.configuration.country}.json`)
  },
  computed: {
    nextKey(): number {
      if (this.salaries.length === 0) {
        return 1
      }
      return Math.max(...this.salaries.map((s: Salary): number => s.key.valueOf())) + 1
    },
    adjustedSalaries(): AdjustedSalary[] {
      return AdjustedSalaryCreateListUpToDate(
        this.salaries,
        this.configuration.useCustomInflation && this.configuration.customInflation !== null
          ? this.configuration.customInflation
          : this.inflationRates[this.configuration.country] ?? {},
        new Date()
      )
    },
    lastSalaryAdjusted(): [Salary | null, AdjustedSalary | null] {
      if (this.salaries.length === 0) {
        return [null, null]
      }

      const lastSalary = this.salaries[this.salaries.length - 1]

      const lastAdjustedSalaries = AdjustedSalaryCreateListUpToDate(
        [lastSalary],
        this.configuration.useCustomInflation && this.configuration.customInflation !== null
          ? this.configuration.customInflation
          : this.inflationRates[this.configuration.country] ?? {},
        new Date()
      )

      return [lastSalary, lastAdjustedSalaries[lastAdjustedSalaries.length - 1]]
    },
    missingInflationRates(): [Array<string>, string | null] {
      if (this.salaries.length === 0) {
        return [[], null]
      }

      let lastKnownInflationRate: string | null = null
      const [sToYear, sToMonth] = this.salaries[0].date.split('-')
      const toMonth = parseInt(sToMonth)
      const toYear = parseInt(sToYear)
      let month = new Date().getMonth() + 1
      let year = new Date().getFullYear()

      const inflationRates: InflationRates =
        this.configuration.useCustomInflation && this.configuration.customInflation !== null
          ? this.configuration.customInflation
          : this.inflationRates[this.configuration.country] ?? {}

      const missingInflationRates: Array<string> = []
      while (year > toYear || month > toMonth) {
        const sMonth = ('' + month).padStart(2, '0')
        const sYear = '' + year
        const date = sYear + '-' + sMonth

        if (date in inflationRates && lastKnownInflationRate === null) {
          lastKnownInflationRate = date
        }

        if (lastKnownInflationRate !== null && !(date in inflationRates)) {
          missingInflationRates.push(date)
        }

        month--
        if (month === 0) {
          month = 12
          year--
        }
      }

      return [missingInflationRates, lastKnownInflationRate]
    }
  },
  methods: {
    addSalary(newSalary: Salary): void {
      if (
        this.salaries.filter((salary: Salary): boolean => salary.date === newSalary.date).length > 0
      ) {
        return
      }

      this.salaries.push(newSalary)
      this.salaries.sort((s1: Salary, s2: Salary): number => (s1.date < s2.date ? -1 : 1))
    },
    addSalaries(newSalaries: Salary[]): void {
      this.salaries.push(...newSalaries)
      this.salaries.sort((s1: Salary, s2: Salary): number => (s1.date < s2.date ? -1 : 1))
    },
    removeSalary(oldSalaryKey: number): void {
      this.salaries = this.salaries.filter((s: Salary): boolean => s.key !== oldSalaryKey)
    }
  },
  mounted() {
    let retrievedSalaries = localStorage.getItem('salaries')
    if (retrievedSalaries) {
      this.salaries = JSON.parse(retrievedSalaries)
    }
  },
  watch: {
    salaries: {
      handler(newSalaries: Salary[]): void {
        localStorage.setItem('salaries', JSON.stringify(newSalaries))
      },
      deep: true
    }
  }
})
</script>

<template>
  <main
    class="p-5 md:flex md:flex-row"
    :class="salaries.length === 0 ? 'mx-auto max-w-screen-lg' : ''"
  >
    <section class="inline-block shrink-0">
      <div class="contents" :class="salaries.length == 0 ? 'hidden' : ''">
        <h2 class="my-5 text-lg text-slate-800">
          <i18n-t keypath="salary.history.title">
            <template v-slot:number>
              {{ salaries.length }}
            </template>
          </i18n-t>
        </h2>
        <ol class="mb-5 border-l-2 border-red-500">
          <salary-display
            v-for="(adjustedSalary, index) in adjustedSalaries"
            v-bind:key="index"
            v-bind:salary="adjustedSalary"
            v-on:removeSalary="removeSalary"
          />
        </ol>
      </div>
      <details class="mb-5">
        <summary class="cursor-pointer text-slate-800">
          <i18n-t keypath="salary.incomeMode.title" />
        </summary>
        <blockquote class="mt-3 rounded border border-slate-300 p-3 text-sm text-slate-500">
          <i18n-t keypath="salary.incomeMode.helper" />
        </blockquote>
        <income-mode-select class="mt-3" />
      </details>
      <salary-import
        v-on:addSalaries="addSalaries"
        v-bind:salaries="salaries"
        v-bind:next-key="nextKey"
      />
      <salary-new v-on:addSalary="addSalary" v-bind:salaries="salaries" v-bind:new-key="nextKey" />
    </section>
    <section class="grow">
      <div class="sticky top-0">
        <inflation-chart :adjusted-salaries="adjustedSalaries" />
        <p v-if="salaries.length > 0" class="mx-5 p-2 text-sm italic">
          <i18n-t v-if="missingInflationRates[1] !== null" keypath="salary.warning.lastKnown">
            <template v-slot:date>
              {{ missingInflationRates[1] }}
            </template>
          </i18n-t>
          <i18n-t
            v-if="missingInflationRates[0].length > 0"
            keypath="salary.warning.missings"
            :plural="missingInflationRates[0].length"
          >
            <template v-slot:dates>
              {{ missingInflationRates[0].join(', ') }}
            </template>
            <template v-slot:number>
              {{ missingInflationRates[0].length }}
            </template>
          </i18n-t>
          <i18n-t v-if="missingInflationRates[1] === null" keypath="salary.warning.noKnown" />
        </p>
        <adjusted-salaries-summary
          :adjusted-salaries="adjustedSalaries"
          :last-salary="lastSalaryAdjusted[0]"
          :last-salary-adjusted="lastSalaryAdjusted[1]"
        />
      </div>
    </section>
  </main>
</template>
