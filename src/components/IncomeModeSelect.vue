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
    <legend class="block">
      <i18n-t keypath="configure.incomeMode.label" />
    </legend>
    <input
      type="radio"
      value="gross-annual"
      required
      v-model="configuration.incomeMode"
      id="incomeGrossAnnual"
      name="incomeMode"
      class="peer/gross-annual"
    />
    <label
      for="incomeGrossAnnual"
      class="mb-3 block peer-checked/gross-annual:font-semibold md:ml-3 md:inline"
    >
      <i18n-t keypath="configure.incomeMode.grossAnnual.label" />
    </label>
    <input
      type="radio"
      value="net-monthly"
      required
      v-model="configuration.incomeMode"
      id="incomeNetMonthly"
      name="incomeMode"
      class="peer/net-monthly md:ml-3"
    />
    <label
      for="incomeNetMonthly"
      class="mb-3 block peer-checked/net-monthly:font-semibold md:ml-3 md:inline"
    >
      <i18n-t keypath="configure.incomeMode.netMonthly.label" />
    </label>
    <input
      type="radio"
      value="hourly-rate"
      required
      v-model="configuration.incomeMode"
      id="incomeHourlyRate"
      name="incomeMode"
      class="peer/hourly-rate md:ml-3"
    />
    <label
      for="incomeHourlyRate"
      class="mb-3 block peer-checked/hourly-rate:font-semibold md:ml-3 md:inline"
    >
      <i18n-t keypath="configure.incomeMode.hourlyRate.label" />
    </label>
    <small
      class="my-3 hidden text-xs peer-checked/gross-annual:block peer-hover/gross-annual:block peer-hover/hourly-rate:hidden peer-hover/net-monthly:hidden"
    >
      <i18n-t keypath="configure.incomeMode.grossAnnual.helper" />
    </small>
    <small
      class="my-3 hidden text-xs peer-checked/net-monthly:block peer-hover/net-monthly:block peer-hover/gross-annual:hidden peer-hover/hourly-rate:hidden"
    >
      <i18n-t keypath="configure.incomeMode.netMonthly.helper" />
    </small>
    <small
      class="my-3 hidden text-xs peer-checked/hourly-rate:block peer-hover/hourly-rate:block peer-hover/gross-annual:hidden peer-hover/net-monthly:hidden"
    >
      <i18n-t keypath="configure.incomeMode.hourlyRate.helper" />
    </small>
    <div class="hidden peer-checked/gross-annual:block md:mt-3">
      <label for="incomeImposition">
        <i18n-t keypath="configure.incomeMode.grossAnnual.imposition.label" />
      </label>
      <input
        type="number"
        size="3"
        min="0"
        max="100"
        step="1"
        required
        v-model="configuration.imposition"
        id="incomeImposition"
        name="incomeImposition"
      />
      <p class="text-xs md:ml-3 md:inline">
        <i18n-t keypath="configure.incomeMode.grossAnnual.imposition.helper" />
      </p>
    </div>
    <div class="hidden peer-checked/hourly-rate:block md:mt-3">
      <label for="incomeHourlyImposition">
        <i18n-t keypath="configure.incomeMode.hourlyRate.imposition.label" />
      </label>
      <input
        type="number"
        size="3"
        min="0"
        max="100"
        step="1"
        required
        v-model="configuration.imposition"
        id="incomeHourlyImposition"
        name="incomeHourlyImposition"
      />
      <p class="text-xs md:ml-3 md:inline">
        <i18n-t keypath="configure.incomeMode.hourlyRate.imposition.helper" />
      </p>
      <label for="incomeMonthlyHours">
        <i18n-t keypath="configure.incomeMode.hourlyRate.monthlyHours.label" />
      </label>
      <input
        type="number"
        size="6"
        min="1"
        max="300"
        step="0.01"
        required
        v-model="configuration.monthlyHours"
        id="incomeMonthlyHours"
        name="incomeMonthlyHours"
      />
      <p class="text-xs md:ml-3 md:inline">
        <i18n-t keypath="configure.incomeMode.hourlyRate.monthlyHours.helper" />
      </p>
    </div>
  </fieldset>
</template>
