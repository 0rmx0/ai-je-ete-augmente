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
  <details class="mx-5 mb-3 rounded border border-slate-300 p-3">
    <summary class="cursor-pointer text-sm text-slate-800">
      <i18n-t keypath="salary.projection.title" />
    </summary>
    <form class="mt-3 text-xs" v-on:submit.prevent="">
      <label for="projectionYear" class="mt-3 block">
        <i18n-t keypath="salary.projection.target.label" />
      </label>
      <div>
        <select required v-model="targetYear" id="projectionYear" class="inline-block w-1/2">
          <option value="" selected disabled>
            <i18n-t keypath="salary.new.date.year" />
          </option>
          <option v-for="year in availableYears" v-bind:key="year" :value="year">
            {{ year }}
          </option>
        </select>
        <select required v-model="targetMonth" id="projectionMonth" class="inline-block w-1/2">
          <option value="" selected disabled>
            <i18n-t keypath="salary.new.date.months" />
          </option>
          <option v-for="month in availableMonths" v-bind:key="month" :value="month">
            {{ month }}
          </option>
        </select>
      </div>
      <label for="projectionRaise" class="mt-3 block">
        <i18n-t keypath="salary.projection.raise.label" />
      </label>
      <input
        type="number"
        step="0.1"
        min="-100"
        required
        v-model="raisePercent"
        id="projectionRaise"
        class="block w-full"
      />
    </form>
    <p v-if="projectionError !== ''" role="alert" class="mt-3 text-xs text-orange-700">
      {{ projectionError }}
    </p>
    <div v-if="projection !== null" class="mt-3 text-sm">
      <p class="p-1">
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
              class="font-bold"
              :class="projection.salaryChangeAdjusted >= 0 ? 'text-green-600' : 'text-red-500'"
            >
              <i18n-n :value="projection.salaryChangeAdjusted / 100" format="result" />
            </span>
          </template>
        </i18n-t>
      </p>
      <p class="p-1 text-xs italic text-slate-500">{{ projectionHelper }}</p>
    </div>
  </details>
</template>
