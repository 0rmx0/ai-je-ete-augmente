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
  <li class="flex-start group/salary flex" v-if="salary.originalSalary !== null">
    <div
      class="-ml-[16px] h-[30px] w-[30px] shrink-0 rounded-full border-2 bg-white text-center align-middle"
      :class="
        salary.state === 'down'
          ? 'border-red-500 text-red-500'
          : salary.state === 'up'
          ? 'border-green-600 text-green-600'
          : 'border-red-500 text-red-500'
      "
    >
      <i18n-t v-if="salary.state === 'up'" keypath="salary.history.indicator.up" />
      <i18n-t v-else-if="salary.state === 'down'" keypath="salary.history.indicator.down" />
      <i18n-t v-else keypath="salary.history.indicator.base" />
    </div>
    <div class="relative mb-5 block max-w-md grow p-2">
      <p class="text-sm text-neutral-500">
        {{ salary.originalSalary.date }}
      </p>
      <h3 class="m-1 text-xl font-semibold">
        <i18n-t keypath="salary.history.change.title">
          <template v-slot:income>
            <i18n-n :value="salary.originalSalary.income" format="salary" />
          </template>
          <template v-slot:currency>
            {{ configuration.currency }}
          </template>
          <template v-slot:recurrence>
            <small class="text-sm text-neutral-800">
              {{ salaryRecurrence }}
            </small>
          </template>
        </i18n-t>
      </h3>
      <p v-if="salary.salaryChangeAdjusted === 0" class="text-sm text-neutral-500">
        <i18n-t keypath="salary.history.change.base" />
      </p>
      <p v-else-if="salary.salaryChange === Infinity" class="text-sm text-neutral-500">
        <i18n-t keypath="salary.history.change.base" />
      </p>
      <template v-else-if="salary.salaryChange > 0">
        <p class="text-sm text-neutral-500">
          <i18n-t keypath="salary.history.change.increase">
            <template v-slot:change>
              <span class="text-green-600">
                <i18n-n :value="salary.salaryChange / 100" format="raise" />
              </span>
            </template>
          </i18n-t>
        </p>
        <p class="text-sm text-neutral-500">
          <i18n-t keypath="salary.history.change.increaseAdjusted">
            <template v-slot:change>
              <span
                class="font-bold"
                :class="salary.salaryChangeAdjusted >= 0 ? 'text-green-600' : 'text-red-500'"
              >
                <i18n-n :value="salary.salaryChangeAdjusted / 100" format="raise" />
              </span>
            </template>
          </i18n-t>
        </p>
      </template>
      <template v-else-if="salary.salaryChange < 0 && salary.income > 0">
        <p class="text-sm text-neutral-500">
          <i18n-t keypath="salary.history.change.decrease">
            <template v-slot:change>
              <span class="text-red-500">
                <i18n-n :value="salary.salaryChange / 100" format="raise" />
              </span>
            </template>
          </i18n-t>
        </p>
        <p class="text-sm text-neutral-500">
          <i18n-t keypath="salary.history.change.decreaseAdjusted">
            <template v-slot:change>
              <span class="font-bold text-red-500">
                <i18n-n :value="salary.salaryChangeAdjusted / 100" format="raise" />
              </span>
            </template>
          </i18n-t>
        </p>
      </template>
      <p v-else-if="salary.income === 0" class="text-sm text-neutral-500">
        <i18n-t keypath="salary.history.change.remove" />
      </p>
      <button
        type="button"
        v-on:click="removeSalary(salary)"
        class="mt-1 rounded border border-slate-300 p-1 text-xs text-slate-500 hover:border-red-500 hover:bg-red-500 hover:text-white"
      >
        <i18n-t keypath="salary.history.remove" />
      </button>
      <div
        v-if="
          configuration.incomeMode === 'gross-annual' || configuration.incomeMode === 'hourly-rate'
        "
        class="md:auto hidden whitespace-nowrap md:absolute md:left-full md:top-5 md:z-10 md:-ml-5 md:rounded-r-3xl md:border md:bg-white md:p-3 md:shadow-md md:shadow-red-500 md:group-hover/salary:block"
      >
        <h4 class="m-1 text-lg font-medium">
          <i18n-t keypath="salary.history.change.alternative.display">
            <template v-slot:income>
              <i18n-n :value="salary.income" format="salary" />
            </template>
            <template v-slot:currency>
              {{ configuration.currency }}
            </template>
            <template v-slot:recurrence>
              <small class="text-sm text-neutral-800"> {{ effectiveSalaryRecurrence }} </small>
            </template>
          </i18n-t>
        </h4>
        <p class="text-xs text-slate-500">
          <i18n-t keypath="salary.history.change.alternative.details">
            <template v-slot:income>
              {{ salary.originalSalary.income }}
            </template>
          </i18n-t>
        </p>
        <p class="text-xs text-slate-500">
          <i18n-t keypath="salary.history.change.alternative.imposition.p">
            <template v-slot:link>
              <RouterLink to="/configure" class="underline">
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
