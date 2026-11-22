<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { AdjustedSalary } from '@/components/AdjustedSalary'
import type { Configuration } from '@/components/SharedConfiguration'
import { SharedConfiguration } from '@/components/SharedConfiguration'

export default defineComponent({
  props: {
    salary: {
      type: Object as PropType<AdjustedSalary>,
      required: true
    }
  },
  emits: ['removeSalary'],
  data() {
    return {
      configuration: SharedConfiguration as Configuration
    }
  },
  computed: {
    salaryChange(): string {
      return (
        (this.salary.salaryChange > 0 ? '+' : '') + this.salary.salaryChange.toPrecision(3) + '%'
      )
    },
    salaryChangeAdjusted(): string {
      return (
        (this.salary.salaryChangeAdjusted > 0 ? '+' : '') +
        this.salary.salaryChangeAdjusted.toPrecision(3) +
        '%'
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
    effectiveSalaryRecurrence(): string {
      return this.$t('salary.history.net')
    }
  },
  methods: {
    removeSalary(salary: AdjustedSalary): void {
      if (salary.originalSalary !== null) {
        this.$emit('removeSalary', salary.originalSalary.key)
      }
    }
  }
})
</script>

<template>
  <li v-if="salary.originalSalary !== null" class="group/salary">
    <div
      class="flex items-start gap-3 rounded-xl border p-3.5 transition-shadow hover:shadow-card"
      :class="
        salary.state === 'up'
          ? 'border-green-200 bg-green-50/50'
          : salary.state === 'down'
          ? 'border-red-200 bg-red-50/50'
          : 'border-slate-200 bg-slate-50'
      "
    >
      <!-- Indicateur visuel -->
      <span
        class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs"
        :class="
          salary.state === 'up'
            ? 'bg-green-100 text-green-700'
            : salary.state === 'down'
            ? 'bg-red-100 text-red-600'
            : 'bg-slate-200 text-slate-500'
        "
      >
        <i18n-t v-if="salary.state === 'up'" keypath="salary.history.indicator.up" />
        <i18n-t v-else-if="salary.state === 'down'" keypath="salary.history.indicator.down" />
        <i18n-t v-else keypath="salary.history.indicator.base" />
      </span>

      <div class="min-w-0 flex-1">
        <p class="text-xs font-medium text-ink-faint">{{ salary.originalSalary.date }}</p>
        <h3 class="mt-0.5 text-base font-semibold text-ink-primary">
          <i18n-t keypath="salary.history.change.title">
            <template v-slot:income>
              <i18n-n :value="salary.originalSalary.income" format="salary" />
            </template>
            <template v-slot:currency>
              {{ configuration.currency }}
            </template>
            <template v-slot:recurrence>
              <small class="text-xs font-normal text-ink-muted">{{ salaryRecurrence }}</small>
            </template>
          </i18n-t>
        </h3>

        <div class="mt-1 space-y-0.5">
          <p v-if="salary.salaryChangeAdjusted === 0" class="text-sm text-ink-muted">
            <i18n-t keypath="salary.history.change.base" />
          </p>
          <p v-else-if="salary.salaryChange === Infinity" class="text-sm text-ink-muted">
            <i18n-t keypath="salary.history.change.base" />
          </p>
          <template v-else-if="salary.salaryChange > 0">
            <p class="text-sm text-ink-muted">
              <i18n-t keypath="salary.history.change.increase">
                <template v-slot:change>
                  <span class="font-medium text-green-600">
                    <i18n-n :value="salary.salaryChange / 100" format="raise" />
                  </span>
                </template>
              </i18n-t>
            </p>
            <p class="text-sm text-ink-muted">
              <i18n-t keypath="salary.history.change.increaseAdjusted">
                <template v-slot:change>
                  <span
                    class="font-semibold"
                    :class="salary.salaryChangeAdjusted >= 0 ? 'text-green-600' : 'text-red-600'"
                  >
                    <i18n-n :value="salary.salaryChangeAdjusted / 100" format="raise" />
                  </span>
                </template>
              </i18n-t>
            </p>
          </template>
          <template v-else-if="salary.salaryChange < 0 && salary.income > 0">
            <p class="text-sm text-ink-muted">
              <i18n-t keypath="salary.history.change.decrease">
                <template v-slot:change>
                  <span class="font-medium text-red-600">
                    <i18n-n :value="salary.salaryChange / 100" format="raise" />
                  </span>
                </template>
              </i18n-t>
            </p>
            <p class="text-sm text-ink-muted">
              <i18n-t keypath="salary.history.change.decreaseAdjusted">
                <template v-slot:change>
                  <span class="font-semibold text-red-600">
                    <i18n-n :value="salary.salaryChangeAdjusted / 100" format="raise" />
                  </span>
                </template>
              </i18n-t>
            </p>
          </template>
          <p v-else-if="salary.income === 0" class="text-sm text-ink-muted">
            <i18n-t keypath="salary.history.change.remove" />
          </p>
        </div>

        <button
          type="button"
          v-on:click="removeSalary(salary)"
          class="mt-2 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-ink-muted transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
        >
          <i18n-t keypath="salary.history.remove" />
        </button>
      </div>

      <!-- Info alternative au survol (desktop) -->
      <div
        v-if="
          configuration.incomeMode === 'gross-annual' || configuration.incomeMode === 'hourly-rate'
        "
        class="absolute left-full top-0 z-10 ml-4 hidden w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-card-hover group-hover/salary:block"
      >
        <h4 class="text-sm font-semibold text-ink-primary">
          <i18n-t keypath="salary.history.change.alternative.display">
            <template v-slot:income>
              <i18n-n :value="salary.income" format="salary" />
            </template>
            <template v-slot:currency>
              {{ configuration.currency }}
            </template>
            <template v-slot:recurrence>
              <small class="text-xs font-normal text-ink-muted">{{
                effectiveSalaryRecurrence
              }}</small>
            </template>
          </i18n-t>
        </h4>
        <p class="mt-1 text-xs text-ink-muted">
          <i18n-t keypath="salary.history.change.alternative.details">
            <template v-slot:income>
              {{ salary.originalSalary.income }}
            </template>
          </i18n-t>
        </p>
        <p class="mt-1 text-xs text-ink-muted">
          <i18n-t keypath="salary.history.change.alternative.imposition.p">
            <template v-slot:link>
              <RouterLink to="/configure" class="underline hover:text-brand-600">
                <i18n-t keypath="salary.history.change.alternative.imposition.link" />
              </RouterLink>
            </template>
            <template v-slot:imposition>
              {{ configuration.imposition }}
            </template>
          </i18n-t>
        </p>
      </div>
    </div>
  </li>
</template>
