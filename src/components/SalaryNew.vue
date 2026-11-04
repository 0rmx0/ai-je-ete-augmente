<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { Configuration } from '@/components/SharedConfiguration'
import { SharedConfiguration } from '@/components/SharedConfiguration'
import type { Salary } from '@/components/Salary'

export default defineComponent({
  emits: ['addSalary'],
  props: {
    salaries: {
      type: Array as PropType<Salary[]>,
      required: true
    },
    newKey: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      configuration: SharedConfiguration as Configuration,
      date: new Date() as Date,
      errorMessage: '' as string,
      newDateYear: '' as string,
      newDateMonth: '' as string,
      newIncome: null as number | null
    }
  },
  computed: {
    availableYears(): Array<string> {
      let availableYears = [] as string[]
      let year = this.date.getFullYear()

      while (year > 2000) {
        availableYears.push(year.toString())
        year--
      }

      return availableYears
    },
    availableMonths(): Array<String> {
      if (this.newDateYear !== this.date.getFullYear().toString()) {
        return ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].flatMap(
          (month: string) =>
            this.salaries.filter(
              (salary: Salary): boolean => salary.date === this.newDateYear + '-' + month
            ).length === 0
              ? [month]
              : []
        )
      }

      let availableMonths = [] as string[]
      let month = this.date.getMonth()

      for (let m = 0; m < month; m++) {
        let sMonth = (m + 1).toString().padStart(2, '0')
        if (
          this.salaries.filter(
            (salary: Salary): boolean => salary.date === this.newDateYear + '-' + sMonth
          ).length === 0
        ) {
          availableMonths.push(sMonth)
        }
      }

      return availableMonths
    },
    placeholderSalary(): string {
      switch (this.configuration.raiseMode) {
        case 'percent':
          return this.$t('salary.new.raise.percent.placeholder')
        case 'index-point':
          return this.$t('salary.new.raise.index.placeholder')
        default:
          break
      }
      switch (this.configuration.incomeMode) {
        case 'gross-annual':
          return this.$t('salary.new.salary.gross', { currency: this.configuration.currency })
        case 'net-monthly':
          return this.$t('salary.new.salary.net', { currency: this.configuration.currency })
        case 'hourly-rate':
          return this.$t('salary.new.salary.hourly', { currency: this.configuration.currency })
        default:
          return ''
      }
    },
    inputLabel(): string {
      switch (this.configuration.raiseMode) {
        case 'percent':
          return this.$t('salary.new.raise.percent.label')
        case 'index-point':
          return this.$t('salary.new.raise.index.label')
        default:
          return this.$t('salary.new.salary.label')
      }
    },
    inputStep(): string {
      return this.configuration.raiseMode === 'percent' ? '0.1' : '0.01'
    },
    inputMin(): string {
      return this.configuration.raiseMode === 'percent' ? '-100' : '0'
    }
  },
  methods: {
    addSalary(): void {
      if (this.newDateYear === '' || this.newDateMonth === '' || this.newIncome == null) {
        return
      }
      const newDate = this.newDateYear + '-' + this.newDateMonth
      if (this.salaries.filter((salary: Salary): boolean => salary.date === newDate).length > 0) {
        this.errorMessage = this.$t('salary.new.error.duplicate', { date: newDate })
        return
      }
      let income = this.newIncome
      if (this.configuration.raiseMode === 'percent') {
        const lastSalary = this.salaries.length > 0 ? this.salaries[this.salaries.length - 1] : null
        if (lastSalary === null) {
          this.errorMessage = this.$t('salary.new.error.noPrevious')
          return
        }
        income = lastSalary.income * (1 + this.newIncome / 100)
      } else if (this.configuration.raiseMode === 'index-point') {
        if (!(this.configuration.indexPointValue > 0)) {
          this.errorMessage = this.$t('salary.new.error.noPointValue')
          return
        }
        income = this.newIncome * this.configuration.indexPointValue
      }
      this.$emit('addSalary', {
        date: newDate,
        income: income,
        key: this.newKey
      })
      this.newDateYear = ''
      this.newDateMonth = ''
      this.newIncome = null
      this.errorMessage = ''
    }
  },
  watch: {
    salaries: {
      handler(): void {
        const newDate = this.newDateYear + '-' + this.newDateMonth
        if (
          this.errorMessage !== '' &&
          this.salaries.filter((salary: Salary): boolean => salary.date === newDate).length === 0
        ) {
          this.errorMessage = ''
        }
      },
      deep: true
    }
  }
})
</script>

<template>
  <p
    v-if="errorMessage !== ''"
    role="alert"
    class="mt-3 rounded border border-orange-500 bg-orange-100 p-2 text-sm text-orange-700"
  >
    {{ errorMessage }}
  </p>
  <h2 class="my-5 text-lg text-slate-800">
    <i18n-t keypath="salary.new.title" />
  </h2>
  <form v-on:submit.prevent="addSalary()" class="relative min-w-0 text-xs">
    <label for="newDateYear" class="mt-3 block">
      <i18n-t keypath="salary.new.date.label" />
    </label>
    <div>
      <select required v-model="newDateYear" id="newDateYear" class="inline-block w-1/2">
        <option value="" selected disabled>
          <i18n-t keypath="salary.new.date.year" />
        </option>
        <option
          v-for="(availableYear, index) in availableYears"
          v-bind:key="index"
          :value="availableYear"
        >
          {{ availableYear }}
        </option>
      </select>
      <select required v-model="newDateMonth" id="newDateMonth" class="inline-block w-1/2">
        <option value="" selected disabled>
          <i18n-t keypath="salary.new.date.months" />
        </option>
        <option
          v-for="(availableMonth, index) in availableMonths"
          v-bind:key="index"
          :value="availableMonth"
        >
          {{ availableMonth }}
        </option>
      </select>
    </div>
    <label for="newDate" class="mt-3 block">
      {{ inputLabel }}
    </label>
    <input
      type="number"
      :min="inputMin"
      :step="inputStep"
      required
      :placeholder="placeholderSalary"
      v-model="newIncome"
      id="newIncome"
      class="block w-full"
    />
    <button
      type="submit"
      class="mt-3 rounded border border-green-700 bg-green-700 p-2 text-white hover:border-green-800 hover:bg-green-800"
    >
      <i18n-t keypath="salary.new.add" />
    </button>
  </form>
</template>
