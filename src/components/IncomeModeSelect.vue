<script lang="ts">
import { defineComponent } from 'vue'
import type { Configuration } from '@/components/SharedConfiguration'
import { SharedConfiguration } from '@/components/SharedConfiguration'

export default defineComponent({
  name: 'IncomeModeSelect',
  data() {
    return {
      configuration: SharedConfiguration as Configuration
    }
  }
})
</script>

<template>
  <fieldset>
    <legend class="label-text">
      <i18n-t keypath="configure.incomeMode.label" />
    </legend>
    <div class="flex flex-wrap gap-x-5 gap-y-2">
      <div class="flex items-center gap-2">
        <input
          type="radio"
          value="gross-annual"
          required
          v-model="configuration.incomeMode"
          id="incomeGrossAnnual"
          name="incomeMode"
          class="peer/gross-annual h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        <label
          for="incomeGrossAnnual"
          class="text-sm text-ink-secondary peer-checked/gross-annual:font-semibold peer-checked/gross-annual:text-ink-primary"
        >
          <i18n-t keypath="configure.incomeMode.grossAnnual.label" />
        </label>
      </div>
      <div class="flex items-center gap-2">
        <input
          type="radio"
          value="net-monthly"
          required
          v-model="configuration.incomeMode"
          id="incomeNetMonthly"
          name="incomeMode"
          class="peer/net-monthly h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        <label
          for="incomeNetMonthly"
          class="text-sm text-ink-secondary peer-checked/net-monthly:font-semibold peer-checked/net-monthly:text-ink-primary"
        >
          <i18n-t keypath="configure.incomeMode.netMonthly.label" />
        </label>
      </div>
      <div class="flex items-center gap-2">
        <input
          type="radio"
          value="hourly-rate"
          required
          v-model="configuration.incomeMode"
          id="incomeHourlyRate"
          name="incomeMode"
          class="peer/hourly-rate h-4 w-4 border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        <label
          for="incomeHourlyRate"
          class="text-sm text-ink-secondary peer-checked/hourly-rate:font-semibold peer-checked/hourly-rate:text-ink-primary"
        >
          <i18n-t keypath="configure.incomeMode.hourlyRate.label" />
        </label>
      </div>
    </div>

    <p
      class="mt-2 hidden text-xs text-ink-muted peer-checked/gross-annual:block peer-hover/gross-annual:block peer-hover/hourly-rate:hidden peer-hover/net-monthly:hidden"
    >
      <i18n-t keypath="configure.incomeMode.grossAnnual.helper" />
    </p>
    <p
      class="mt-2 hidden text-xs text-ink-muted peer-checked/net-monthly:block peer-hover/net-monthly:block peer-hover/gross-annual:hidden peer-hover/hourly-rate:hidden"
    >
      <i18n-t keypath="configure.incomeMode.netMonthly.helper" />
    </p>
    <p
      class="mt-2 hidden text-xs text-ink-muted peer-checked/hourly-rate:block peer-hover/hourly-rate:block peer-hover/gross-annual:hidden peer-hover/net-monthly:hidden"
    >
      <i18n-t keypath="configure.incomeMode.hourlyRate.helper" />
    </p>

    <div class="mt-3 hidden rounded-lg bg-slate-50 p-3 peer-checked/gross-annual:block">
      <label for="incomeImposition" class="label-text !mb-1">
        <i18n-t keypath="configure.incomeMode.grossAnnual.imposition.label" />
      </label>
      <input
        type="number"
        min="0"
        max="100"
        step="1"
        required
        v-model="configuration.imposition"
        id="incomeImposition"
        name="incomeImposition"
        class="input-field !w-24"
      />
      <p class="mt-1 text-xs text-ink-muted">
        <i18n-t keypath="configure.incomeMode.grossAnnual.imposition.helper" />
      </p>
    </div>
    <div class="mt-3 hidden rounded-lg bg-slate-50 p-3 peer-checked/hourly-rate:block">
      <div class="flex flex-wrap gap-4">
        <div>
          <label for="incomeHourlyImposition" class="label-text !mb-1">
            <i18n-t keypath="configure.incomeMode.hourlyRate.imposition.label" />
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            required
            v-model="configuration.imposition"
            id="incomeHourlyImposition"
            name="incomeHourlyImposition"
            class="input-field !w-24"
          />
          <p class="mt-1 text-xs text-ink-muted">
            <i18n-t keypath="configure.incomeMode.hourlyRate.imposition.helper" />
          </p>
        </div>
        <div>
          <label for="incomeMonthlyHours" class="label-text !mb-1">
            <i18n-t keypath="configure.incomeMode.hourlyRate.monthlyHours.label" />
          </label>
          <input
            type="number"
            min="1"
            max="300"
            step="0.01"
            required
            v-model="configuration.monthlyHours"
            id="incomeMonthlyHours"
            name="incomeMonthlyHours"
            class="input-field !w-28"
          />
          <p class="mt-1 text-xs text-ink-muted">
            <i18n-t keypath="configure.incomeMode.hourlyRate.monthlyHours.helper" />
          </p>
        </div>
      </div>
    </div>
  </fieldset>
</template>
