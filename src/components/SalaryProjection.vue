<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { Salary } from '@/components/Salary'
import type { InflationRates } from '@/components/InflationRates'
import type { Configuration } from '@/components/SharedConfiguration'
import { SharedConfiguration } from '@/components/SharedConfiguration'
import type { AdjustedSalary } from '@/components/AdjustedSalary'
import {
  lastKnownInflationRate,
  projectAdjustedSalary,
  trailingAverageRate
} from '@/components/SalaryProjection'
import { DATE_PATTERN } from '@/components/Storage'

export default defineComponent({
  props: {
    salaries: {
      type: Array as PropType<Salary[]>,
      required: true
    },
    inflationRates: {
      type: Object as PropType<InflationRates>,
      required: true
    },
    suggestedRaisePercent: {
      type: Number,
      default: 0,
      required: false
    }
  },
  data() {
    return {
      configuration: SharedConfiguration as Configuration,
      targetYear: '' as string,
      targetMonth: '' as string,
      raisePercent: this.suggestedRaisePercent as number
    }
  },
  computed: {
    lastSalaryDate(): string | null {
      return this.salaries.length > 0 ? this.salaries[this.salaries.length - 1].date : null
    },
    availableYears(): Array<string> {
      const years: string[] = []
      const firstYear =
        this.lastSalaryDate !== null
          ? parseInt(this.lastSalaryDate.split('-')[0])
          : new Date().getFullYear()
      const lastYear = new Date().getFullYear() + 10
      for (let year = firstYear; year <= lastYear; year++) {
        years.push(year.toString())
      }
      return years
    },
    availableMonths(): Array<string> {
      if (this.targetYear === '') {
        return []
      }
      const months: string[] = []
      const lastSalaryDate = this.lastSalaryDate
      for (let m = 1; m <= 12; m++) {
        const sMonth = m.toString().padStart(2, '0')
        const candidate = this.targetYear + '-' + sMonth
        if (lastSalaryDate === null || candidate > lastSalaryDate) {
          months.push(sMonth)
        }
      }
      return months
    },
    targetDate(): string | null {
      if (this.targetYear === '' || this.targetMonth === '') {
        return null
      }
      const date = this.targetYear + '-' + this.targetMonth
      return DATE_PATTERN.test(date) ? date : null
    },
    projection(): AdjustedSalary | null {
      if (this.targetDate === null) {
        return null
      }
      return projectAdjustedSalary(
        this.salaries,
        this.inflationRates,
        this.targetDate,
        this.raisePercent ?? 0
      )
    },
    projectionError(): string {
      if (this.targetDate === null || this.lastSalaryDate === null) {
        return ''
      }
      if (this.targetDate <= this.lastSalaryDate) {
        return this.$t('salary.projection.error.past', { date: this.lastSalaryDate })
      }
      return ''
    },
    projectionHelper(): string {
      const lastKnown = lastKnownInflationRate(this.inflationRates)
      if (lastKnown === null) {
        return this.$t('salary.projection.helperNoKnown')
      }
      const knownCount = Object.keys(this.inflationRates).length
      const average = trailingAverageRate(this.inflationRates, 12)
      return this.$t('salary.projection.helper', {
        lastKnown: lastKnown,
        count: Math.min(12, knownCount),
        rate: average !== null ? average.toFixed(3) : '0'
      })
    }
  }
})
</script>

<template>
  <details class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
    <summary
      class="cursor-pointer select-none text-sm font-medium text-ink-secondary hover:text-ink-primary dark:text-zinc-300 dark:hover:text-zinc-50"
    >
      <i18n-t keypath="salary.projection.title" />
    </summary>
    <form class="mt-3 flex flex-col gap-3" v-on:submit.prevent="">
      <div>
        <label for="projectionYear" class="label-text">
          <i18n-t keypath="salary.projection.target.label" />
        </label>
        <div class="flex gap-3">
          <select required v-model="targetYear" id="projectionYear" class="input-field w-1/2">
            <option value="" selected disabled>
              <i18n-t keypath="salary.new.date.year" />
            </option>
            <option v-for="year in availableYears" v-bind:key="year" :value="year">
              {{ year }}
            </option>
          </select>
          <select required v-model="targetMonth" id="projectionMonth" class="input-field w-1/2">
            <option value="" selected disabled>
              <i18n-t keypath="salary.new.date.months" />
            </option>
            <option v-for="month in availableMonths" v-bind:key="month" :value="month">
              {{ month }}
            </option>
          </select>
        </div>
      </div>
      <div>
        <label for="projectionRaise" class="label-text">
          <i18n-t keypath="salary.projection.raise.label" />
        </label>
        <input
          type="number"
          step="0.1"
          min="-100"
          required
          v-model="raisePercent"
          id="projectionRaise"
          class="input-field"
        />
      </div>
    </form>
    <p v-if="projectionError !== ''" role="alert" class="mt-3 text-sm text-orange-700 dark:text-orange-400">
      {{ projectionError }}
    </p>
    <div v-if="projection !== null" class="mt-3 rounded-lg bg-white p-3 text-sm shadow-card dark:bg-zinc-900 dark:shadow-none">
      <p>
        <i18n-t keypath="salary.projection.result" :plural="projection.salaryChangeAdjusted">
          <template v-slot:date>{{ targetDate }}</template>
          <template v-slot:raise>{{ raisePercent }}</template>
          <template v-slot:income>
            <i18n-n :value="projection.income" format="salary" />
          </template>
          <template v-slot:currency>{{ configuration.currency }}</template>
          <template v-slot:adjusted>
            <i18n-n :value="projection.incomeAdjusted" format="salary" />
          </template>
          <template v-slot:change>
            <span
              class="font-semibold"
              :class="projection.salaryChangeAdjusted >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
            >
              <i18n-n :value="projection.salaryChangeAdjusted / 100" format="result" />
            </span>
          </template>
        </i18n-t>
      </p>
      <p class="mt-1 text-xs italic text-ink-muted dark:text-zinc-400">{{ projectionHelper }}</p>
    </div>
  </details>
</template>
