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
  <div class="card">
    <h2 class="section-title mb-4">
      <i18n-t keypath="salary.summary.title" />
    </h2>

    <!-- Métriques en grille -->
    <div v-if="numberOfSalaryChanges > 1" class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <!-- Évolution annoncée -->
      <div class="rounded-xl bg-slate-50 p-4 dark:bg-zinc-800/50">
        <p class="text-sm font-medium text-ink-muted dark:text-zinc-400">
          <i18n-t keypath="salary.summary.metric.announced" />
        </p>
        <p
          class="mt-1 text-2xl font-bold"
          :class="
            overallChange >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          "
        >
          <i18n-n :value="overallChange / 100" format="result" />
        </p>
        <p class="mt-1 text-xs text-ink-faint dark:text-zinc-500">
          <i18n-t keypath="salary.summary.metric.period" :plural="adjustedSalaries.length">
            <template v-slot:period>{{ adjustedSalaries.length }}</template>
          </i18n-t>
        </p>
      </div>

      <!-- Évolution réelle -->
      <div
        class="rounded-xl p-4"
        :class="
          overallChangeAdjusted >= 0
            ? 'bg-green-50 dark:bg-green-950/50'
            : 'bg-red-50 dark:bg-red-950/50'
        "
      >
        <p class="text-sm font-medium text-ink-muted dark:text-zinc-400">
          <i18n-t keypath="salary.summary.metric.real" />
        </p>
        <p
          class="mt-1 text-2xl font-bold"
          :class="
            overallChangeAdjusted >= 0
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          "
        >
          <i18n-n :value="overallChangeAdjusted / 100" format="result" />
        </p>
        <p class="mt-1 text-xs text-ink-faint dark:text-zinc-500">{{ timeElapsed }}</p>
      </div>

      <!-- Augmentation minimale requise -->
      <div v-if="lastSalary !== null" class="dark:bg-brand-950/50 rounded-xl bg-brand-50 p-4">
        <p class="text-sm font-medium text-ink-muted dark:text-zinc-400">
          <i18n-t keypath="salary.summary.metric.minRaise" />
        </p>
        <p class="mt-1 text-2xl font-bold text-brand-600 dark:text-brand-400">
          <i18n-n :value="minimalRaiseRequired" format="raise" />
        </p>
        <p class="mt-1 text-xs text-ink-faint dark:text-zinc-500">
          <i18n-t keypath="salary.summary.metric.newSalary">
            <template v-slot:income>
              <i18n-n :value="minimalNewSalary" format="salary" />
            </template>
            <template v-slot:currency>{{ configuration.currency }}</template>
          </i18n-t>
        </p>
      </div>
    </div>

    <!-- Texte détaillé -->
    <div class="mt-4 space-y-2 text-sm leading-relaxed text-ink-secondary dark:text-zinc-300">
      <template v-if="numberOfSalaryChanges > 1">
        <p>
          <i18n-t keypath="salary.summary.change.multi.overall">
            <template v-slot:baseIncome>
              <span class="font-semibold text-ink-primary dark:text-zinc-50">
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
              <span class="text-ink-faint line-through dark:text-zinc-500">
                <i18n-n :value="incomeFinal" format="salary" />{{ configuration.currency }}
              </span>
            </template>
            <template v-slot:finalIncomeAdjusted>
              <span class="font-semibold text-ink-primary dark:text-zinc-50">
                <i18n-n :value="incomeFinalAdjusted" format="salary" />{{ configuration.currency }}
              </span>
            </template>
            <template v-slot:period>{{ adjustedSalaries.length }}</template>
          </i18n-t>
        </p>
        <p>
          <i18n-t keypath="salary.summary.change.multi.announced" :plural="overallChange">
            <template v-slot:change>
              <span
                :class="
                  overallChange >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                "
              >
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
        <p>
          <i18n-t keypath="salary.summary.change.multi.adjusted" :plural="overallChangeAdjusted">
            <template v-slot:changeAdjusted>
              <span
                class="font-semibold"
                :class="
                  overallChangeAdjusted >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                "
              >
                <i18n-n :value="overallChangeAdjusted / 100" format="result" />
              </span>
            </template>
          </i18n-t>
        </p>
      </template>
      <template v-else-if="numberOfSalaryChanges === 1 && adjustedSalaries.length > 1">
        <p>
          <i18n-t keypath="salary.summary.change.one" :plural="overallChangeAdjusted">
            <template v-slot:changeAdjusted>
              <span
                class="font-semibold"
                :class="
                  overallChangeAdjusted >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                "
              >
                <i18n-n :value="overallChangeAdjusted / 100" format="result" />
              </span>
            </template>
            <template v-slot:period>
              {{ timeElapsed }}
            </template>
          </i18n-t>
        </p>
        <p class="text-ink-muted dark:text-zinc-400">
          <i18n-t keypath="salary.summary.change.helper" />
        </p>
      </template>
      <template v-else-if="numberOfSalaryChanges === 0">
        <p class="text-ink-muted dark:text-zinc-400">
          <i18n-t keypath="salary.summary.change.none" />
        </p>
      </template>

      <!-- Prochaine augmentation -->
      <div
        v-if="lastSalary !== null"
        class="dark:border-brand-900/50 dark:bg-brand-950/30 rounded-xl border border-brand-200 bg-brand-50/50 p-4"
      >
        <p class="text-sm">
          <span class="font-semibold text-brand-700 dark:text-brand-400">
            <i18n-t keypath="salary.summary.next.title" />
          </span>
          <i18n-t keypath="salary.summary.next.requirement" :plural="minimalRaiseRequired">
            <template v-slot:disclaimer>
              <span class="italic text-ink-muted dark:text-zinc-400">
                <i18n-t v-if="numberOfSalaryChanges > 1" keypath="salary.summary.next.disclaimer">
                  <template v-slot:date>
                    {{ lastSalary.date }}
                  </template>
                </i18n-t>
              </span>
            </template>
            <template v-slot:minimalRaiseRequired>
              <span class="font-bold text-brand-600 dark:text-brand-400">
                <i18n-n :value="minimalRaiseRequired" format="raise" />
              </span>
            </template>
            <template v-slot:newSalary>
              <span class="font-semibold text-ink-primary dark:text-zinc-50">
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
      </div>
    </div>

    <!-- Liens de pied de card -->
    <div
      class="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-4 text-xs dark:border-zinc-800"
    >
      <span
        v-if="
          numberOfSalaryChanges > 0 &&
          configuration.useCustomInflation &&
          configuration.customInflation !== null
        "
      >
        <RouterLink
          to="/configure"
          class="text-brand-600 underline hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
        >
          <i18n-t keypath="salary.summary.custom" />
        </RouterLink>
      </span>
      <span v-else-if="numberOfSalaryChanges > 0">
        <RouterLink
          to="/configure"
          class="text-brand-600 underline hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
        >
          <i18n-t keypath="salary.summary.source">
            <template v-slot:country>
              <i18n-t :keypath="'configure.country.options.' + configuration.country" />
            </template>
          </i18n-t>
        </RouterLink>
      </span>
      <span>
        <RouterLink
          to="/how"
          class="text-brand-600 underline hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
        >
          <i18n-t keypath="salary.summary.helper" />
        </RouterLink>
      </span>
    </div>
  </div>
</template>
