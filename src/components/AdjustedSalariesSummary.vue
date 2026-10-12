<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { AdjustedSalary } from '@/components/AdjustedSalary'
import type { Configuration } from '@/components/SharedConfiguration'
import { SharedConfiguration } from '@/components/SharedConfiguration'
import type { Salary } from '@/components/Salary'

export default defineComponent({
  props: {
    adjustedSalaries: {
      type: Array as PropType<AdjustedSalary[]>,
      required: true
    },
    lastSalary: {
      type: Object as PropType<Salary | null>,
      default: null,
      required: false
    },
    lastSalaryAdjusted: {
      type: Object as PropType<AdjustedSalary | null>,
      default: null,
      required: false
    }
  },
  data() {
    return {
      configuration: SharedConfiguration as Configuration
    }
  },
  computed: {
    incomeFinal(): number {
      if (this.adjustedSalaries.length < 2) {
        return 0
      }

      return this.adjustedSalaries[this.adjustedSalaries.length - 1].income
    },
    incomeFinalAdjusted(): number {
      if (this.adjustedSalaries.length < 2) {
        return 0
      }

      return this.adjustedSalaries[this.adjustedSalaries.length - 1].incomeAdjusted
    },
    incomeReference(): number {
      if (this.adjustedSalaries.length === 0) {
        return 0
      }

      return this.adjustedSalaries[0].income
    },
    minimalRaiseRequired(): number {
      if (this.lastSalaryAdjusted === null) {
        return 0
      }

      return this.lastSalaryAdjusted.cumulatedInflationMultiplier - 1
    },
    minimalNewSalary(): number {
      if (this.lastSalary === null || this.lastSalaryAdjusted === null) {
        return 0
      }

      return this.lastSalary.income * this.lastSalaryAdjusted.cumulatedInflationMultiplier
    },
    numberOfSalaryChanges(): number {
      return this.adjustedSalaries.filter(
        (adjustedSalary: AdjustedSalary): boolean => adjustedSalary.originalSalary !== null
      ).length
    },
    overallChange(): number {
      if (this.adjustedSalaries.length < 2) {
        return 0
      }

      return (
        (this.adjustedSalaries[this.adjustedSalaries.length - 1].income /
          this.adjustedSalaries[0].income -
          1) *
        100
      )
    },
    overallChangeAdjusted(): number {
      if (this.adjustedSalaries.length < 2) {
        return 0
      }

      return (
        (this.adjustedSalaries[this.adjustedSalaries.length - 1].incomeAdjusted /
          this.adjustedSalaries[0].incomeAdjusted -
          1) *
        100
      )
    },
    salaryRecurrence(): string {
      switch (this.configuration.incomeMode) {
        case 'gross-annual':
          return this.$t('salary.history.gross')
        case 'net-monthly':
          return this.$t('salary.history.net')
        case 'hourly-rate':
          return this.$t('salary.history.hourly')
        default:
          return ''
      }
    },
    timeElapsed(): string {
      if (this.adjustedSalaries.length <= 18) {
        return this.adjustedSalaries.length + this.$t('salary.summary.time.months')
      }

      const monthModulo = this.adjustedSalaries.length % 12
      const numberOfYears = this.adjustedSalaries.length / 12

      if (monthModulo === 0) {
        return this.$t('salary.summary.time.years', { number: numberOfYears })
      }

      return monthModulo > 5
        ? this.$t('salary.summary.time.nearly', { number: Math.round(numberOfYears) })
        : this.$t('salary.summary.time.more', { number: Math.round(numberOfYears) })
    }
  }
})
</script>

<template>
  <div class="flex flex-col items-center p-5">
    <template v-if="numberOfSalaryChanges > 1">
      <p class="p-3 text-lg">
        <i18n-t keypath="salary.summary.change.multi.overall">
          <template v-slot:baseIncome>
            <span class="font-semibold">
              <i18n-t keypath="global.salary">
                <template v-slot:income>
                  <i18n-n :value="incomeReference" format="salary" />
                </template>
                <template v-slot:currency>
                  {{ configuration.currency }}
                </template>
              </i18n-t>
            </span>
          </template>
          <template v-slot:finalIncome>
            <span class="line-through">
              <i18n-n :value="incomeFinal" format="salary" />{{ configuration.currency }}
            </span>
          </template>
          <template v-slot:finalIncomeAdjusted>
            <span class="font-semibold">
              <i18n-n :value="incomeFinalAdjusted" format="salary" />{{ configuration.currency }}
            </span>
          </template>
          <template v-slot:period>{{ adjustedSalaries.length }}</template>
        </i18n-t>
      </p>
      <p class="p-3 text-center text-lg">
        <i18n-t keypath="salary.summary.change.multi.announced" :plural="overallChange">
          <template v-slot:change>
            <span class="text-red-500">
              <i18n-n :value="overallChange / 100" format="result" />
            </span>
          </template>
          <template v-slot:numberOfChanges>
            {{ numberOfSalaryChanges - 1 }}
          </template>
          <template v-slot:period>
            {{ timeElapsed }}
          </template>
        </i18n-t>
      </p>
      <p class="p-3 text-center text-lg">
        <i18n-t keypath="salary.summary.change.multi.adjusted" :plural="overallChangeAdjusted">
          <template v-slot:changeAdjusted>
            <span class="font-bold text-red-500">
              <i18n-n :value="overallChangeAdjusted / 100" format="result" />
            </span>
          </template>
        </i18n-t>
      </p>
    </template>
    <template v-else-if="numberOfSalaryChanges === 1 && adjustedSalaries.length > 1">
      <p class="p-3 text-lg">
        <i18n-t keypath="salary.summary.change.one" :plural="overallChangeAdjusted">
          <template v-slot:changeAdjusted>
            <span class="font-bold text-red-500">
              <i18n-n :value="overallChangeAdjusted / 100" format="result" />
            </span>
          </template>
          <template v-slot:period>
            {{ timeElapsed }}
          </template>
        </i18n-t>
      </p>
      <p class="p-3 text-sm">
        <i18n-t keypath="salary.summary.change.helper" />
      </p>
    </template>
    <template v-else-if="numberOfSalaryChanges === 0">
      <p class="p-3 text-sm">
        <i18n-t keypath="salary.summary.change.none" />
      </p>
    </template>
    <template v-if="lastSalary !== null">
      <p class="p-3 text-lg">
        <span class="font-bold text-red-500">
          <i18n-t keypath="salary.summary.next.title" />
        </span>
        <i18n-t keypath="salary.summary.next.requirement" :plural="minimalRaiseRequired">
          <template v-slot:disclaimer>
            <span class="italic">
              <i18n-t v-if="numberOfSalaryChanges > 1" keypath="salary.summary.next.disclaimer">
                <template v-slot:date>
                  {{ lastSalary.date }}
                </template>
              </i18n-t>
            </span>
          </template>
          <template v-slot:minimalRaiseRequired>
            <span class="font-bold text-red-500">
              <i18n-n :value="minimalRaiseRequired" format="raise" />
            </span>
          </template>
          <template v-slot:newSalary>
            <span class="font-bold">
              <i18n-t keypath="salary.summary.next.newSalary">
                <template v-slot:income>
                  <i18n-n :value="minimalNewSalary" format="salary" />
                </template>
                <template v-slot:currency>
                  {{ configuration.currency }}
                </template>
                <template v-slot:recurrence>
                  {{ salaryRecurrence }}
                </template>
              </i18n-t>
            </span>
          </template>
        </i18n-t>
      </p>
    </template>
    <p class="self-end p-5 text-xs underline">
      <span
        v-if="
          numberOfSalaryChanges > 0 &&
          configuration.useCustomInflation &&
          configuration.customInflation !== null
        "
        class="m-3 block md:inline"
      >
        <RouterLink to="/configure">
          <i18n-t keypath="salary.summary.custom" />
        </RouterLink>
      </span>
      <span v-else-if="numberOfSalaryChanges > 0" class="m-3 block md:inline">
        <RouterLink to="/configure">
          <i18n-t keypath="salary.summary.source">
            <template v-slot:country>
              <i18n-t :keypath="'configure.country.options.' + configuration.country" />
            </template>
          </i18n-t>
        </RouterLink>
      </span>
      <span class="m-3 block md:inline">
        <RouterLink to="/how">
          <i18n-t keypath="salary.summary.helper" />
        </RouterLink>
      </span>
    </p>
  </div>
</template>
