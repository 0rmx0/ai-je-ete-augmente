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
import SalaryReportButton from '@/components/SalaryReportButton.vue'
import SalaryBackup from '@/components/SalaryBackup.vue'
import SalaryProjection from '@/components/SalaryProjection.vue'
import type { Configuration } from '@/components/SharedConfiguration'
import { SharedConfiguration } from '@/components/SharedConfiguration'
import { loadJson, sanitizeSalaries } from '@/components/Storage'

export default defineComponent({
  components: {
    AdjustedSalariesSummary,
    InflationChart,
    IncomeModeSelect,
    SalaryBackup,
    SalaryProjection,
    SalaryDisplay,
    SalaryReportButton,
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
    await this.loadInflationRates()
  },
  computed: {
    nextKey(): number {
      if (this.salaries.length === 0) {
        return 1
      }
      return Math.max(...this.salaries.map((s: Salary): number => s.key.valueOf())) + 1
    },
    activeInflationRates(): InflationRates {
      return this.configuration.useCustomInflation && this.configuration.customInflation !== null
        ? this.configuration.customInflation
        : this.inflationRates[this.configuration.country] ?? {}
    },
    adjustedSalaries(): AdjustedSalary[] {
      return AdjustedSalaryCreateListUpToDate(this.salaries, this.activeInflationRates, new Date())
    },
    lastSalaryAdjusted(): [Salary | null, AdjustedSalary | null] {
      if (this.salaries.length === 0) {
        return [null, null]
      }

      const lastSalary = this.salaries[this.salaries.length - 1]

      const lastAdjustedSalaries = AdjustedSalaryCreateListUpToDate(
        [lastSalary],
        this.activeInflationRates,
        new Date()
      )

      return [lastSalary, lastAdjustedSalaries[lastAdjustedSalaries.length - 1]]
    },
    suggestedRaisePercent(): number {
      const lastAdjusted = this.lastSalaryAdjusted[1]
      if (lastAdjusted === null) {
        return 0
      }
      return (lastAdjusted.cumulatedInflationMultiplier - 1) * 100
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

      const inflationRates: InflationRates = this.activeInflationRates

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
      const existingDates = new Set(this.salaries.map((salary: Salary): string => salary.date))
      for (const newSalary of newSalaries) {
        if (!existingDates.has(newSalary.date)) {
          existingDates.add(newSalary.date)
          this.salaries.push(newSalary)
        }
      }
      this.salaries.sort((s1: Salary, s2: Salary): number => (s1.date < s2.date ? -1 : 1))
    },
    async loadInflationRates(): Promise<void> {
      this.inflationRates = await import(`../assets/inflations/${this.configuration.country}.json`)
    },
    removeSalary(oldSalaryKey: number): void {
      this.salaries = this.salaries.filter((s: Salary): boolean => s.key !== oldSalaryKey)
    }
  },
  mounted() {
    this.salaries = sanitizeSalaries(loadJson<unknown>('salaries', []))
  },
  watch: {
    'configuration.country'(): void {
      void this.loadInflationRates()
    },
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
  <main class="mx-auto w-full max-w-[1440px] flex-1 px-6 py-6 lg:px-8">
    <div class="flex flex-col gap-6 lg:flex-row">
      <!-- Colonne gauche : historique + formulaires -->
      <aside class="w-full shrink-0 lg:w-[380px]">
        <div class="card flex flex-col gap-5">
          <!-- Historique des salaires -->
          <template v-if="salaries.length > 0">
            <h2 class="section-title">
              <i18n-t keypath="salary.history.title">
                <template v-slot:number>
                  {{ salaries.length }}
                </template>
              </i18n-t>
            </h2>
            <ol class="flex flex-col gap-3">
              <salary-display
                v-for="(adjustedSalary, index) in adjustedSalaries"
                v-bind:key="index"
                v-bind:salary="adjustedSalary"
                v-on:removeSalary="removeSalary"
              />
            </ol>
          </template>

          <hr class="border-slate-100" />

          <!-- Mode de calcul -->
          <details class="group">
            <summary
              class="cursor-pointer select-none text-sm font-medium text-ink-secondary hover:text-ink-primary"
            >
              <i18n-t keypath="salary.incomeMode.title" />
            </summary>
            <p
              class="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-ink-muted"
            >
              <i18n-t keypath="salary.incomeMode.helper" />
            </p>
            <income-mode-select class="mt-3" />
          </details>

          <hr class="border-slate-100" />

          <!-- Actions : rapport, import, backup -->
          <div class="flex flex-col gap-3">
            <salary-report-button
              v-bind:salaries="salaries"
              v-bind:adjusted-salaries="adjustedSalaries"
              v-bind:inflation-rates="activeInflationRates"
              v-bind:missing-inflation-rates="missingInflationRates[0]"
              v-bind:last-known-inflation-rate="missingInflationRates[1]"
            />
            <salary-import
              v-on:addSalaries="addSalaries"
              v-bind:salaries="salaries"
              v-bind:next-key="nextKey"
            />
            <salary-backup
              v-on:addSalaries="addSalaries"
              v-bind:salaries="salaries"
              v-bind:next-key="nextKey"
            />
          </div>

          <hr class="border-slate-100" />

          <!-- Formulaire d'ajout -->
          <salary-new
            v-on:addSalary="addSalary"
            v-bind:salaries="salaries"
            v-bind:new-key="nextKey"
          />
        </div>
      </aside>

      <!-- Colonne droite : graphique + résumé -->
      <section class="min-w-0 flex-1">
        <div class="flex flex-col gap-6">
          <!-- Graphique -->
          <div class="card">
            <h2 class="section-title mb-4">
              <i18n-t keypath="salary.chart.title" />
            </h2>
            <inflation-chart :adjusted-salaries="adjustedSalaries" />
            <p v-if="salaries.length > 0" class="mt-3 text-sm italic text-ink-muted">
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
            <salary-projection
              v-if="salaries.length > 0"
              :salaries="salaries"
              :inflation-rates="activeInflationRates"
              :suggested-raise-percent="suggestedRaisePercent"
            />
          </div>

          <!-- Résumé -->
          <adjusted-salaries-summary
            :adjusted-salaries="adjustedSalaries"
            :last-salary="lastSalaryAdjusted[0]"
            :last-salary-adjusted="lastSalaryAdjusted[1]"
          />
        </div>
      </section>
    </div>
  </main>
</template>
