<script lang="ts">
import { defineComponent } from 'vue'
import type { Configuration } from '@/components/SharedConfiguration'
import { SharedConfiguration, DefaultConfiguration } from '@/components/SharedConfiguration'
import type { countryCode } from '@/components/CountryCodes'
import { countryCodes } from '@/components/CountryCodes'

export default defineComponent({
  data() {
    return {
      configuration: SharedConfiguration as Configuration,
      countryCodes: countryCodes as countryCode[],
      customInflation:
        SharedConfiguration.customInflation !== null
          ? (JSON.stringify(SharedConfiguration.customInflation) as string)
          : '',
      pendingCustomInflation: false as boolean,
      saved: 0 as number,
      savedTimeout: null as null | number
    }
  },
  methods: {
    reset(): void {
      if (
        confirm(
          'Etes-vous certains de vouloir supprimer les salaires enregistrés et la configuration ?'
        )
      ) {
        localStorage.clear()
        this.configuration.currency = DefaultConfiguration.currency
        this.configuration.imposition = DefaultConfiguration.imposition
        this.configuration.incomeMode = DefaultConfiguration.incomeMode
        this.configuration.monthlyHours = DefaultConfiguration.monthlyHours
        alert('Reinitialisation effectuée !')
      }
    },
    validateCustomInflation(jsonData: any): boolean {
      if (typeof jsonData !== 'object') {
        return false
      }

      const datePattern: RegExp = /(\d{4})-(\d{2})/

      for (let property in jsonData) {
        if (!datePattern.test(property)) {
          return false
        }
        if (typeof jsonData[property] !== 'number') {
          return false
        }
      }

      return true
    }
  },
  watch: {
    configuration: {
      handler(): void {
        if (this.$i18n.locale !== this.configuration.locale) {
          this.$i18n.locale = this.configuration.locale
        }

        if (this.savedTimeout !== null) {
          window.clearTimeout(this.savedTimeout)
          this.savedTimeout = null
        }
        this.saved++
        this.savedTimeout = window.setTimeout(() => (this.saved = 0), 2500)
      },
      deep: true
    },
    customInflation(): void {
      if (this.customInflation.length === 0) {
        this.configuration.customInflation = null
        this.pendingCustomInflation = false
        return
      }

      try {
        const jsonData = JSON.parse(this.customInflation)
        if (this.validateCustomInflation(jsonData)) {
          this.configuration.customInflation = jsonData
          this.pendingCustomInflation = false
          return
        }
      } catch {
        //
      }

      this.pendingCustomInflation = true
    }
  }
})
</script>

<template>
  <main class="mx-auto max-w-screen-lg p-5">
    <h2 class="my-5 text-lg text-slate-800">
      <i18n-t keypath="configure.header" />
    </h2>
    <blockquote
      v-if="saved > 0"
      class="mb-5 rounded border border-green-800 p-5 text-sm text-green-800"
    >
      <i18n-t keypath="configure.saved" :plural="saved">
        <template v-slot:count>
          {{ saved }}
        </template>
      </i18n-t>
    </blockquote>
    <blockquote v-else class="mb-5 rounded border p-5 text-sm text-slate-500">
      <i18n-t keypath="configure.autosave" />
    </blockquote>
    <div class="divide-y-2 divide-dashed">
      <form class="mb-5 pt-5" v-on:submit.prevent="">
        <label for="language" class="block">
          <i18n-t keypath="configure.language.label" />
        </label>
        <select id="language" v-model="configuration.locale" class="block w-full">
          <option value="fr">
            <i18n-t keypath="configure.language.options.fr" />
          </option>
          <option value="en">
            <i18n-t keypath="configure.language.options.en" />
          </option>
        </select>
      </form>
      <form class="mb-5 pt-5" v-on:submit.prevent="">
        <input
          type="checkbox"
          v-model="configuration.useCustomInflation"
          id="useCustomInflation"
          class="peer/custom-inflation mb-3"
        />
        <label
          for="useCustomInflation"
          class="mb-3 block text-slate-500 peer-checked/custom-inflation:text-black md:mb-0 md:ml-3 md:inline"
        >
          <i18n-t keypath="configure.custom.label" />
        </label>
        <label for="country" class="block peer-checked/custom-inflation:hidden md:justify-between">
          <i18n-t keypath="configure.country.label" />
        </label>
        <select
          id="country"
          v-model="configuration.country"
          class="block w-full peer-checked/custom-inflation:hidden"
        >
          <option
            v-for="(countryCode, index) in countryCodes"
            v-bind:key="index"
            :value="countryCode"
          >
            <i18n-t :keypath="'configure.country.options.' + countryCode" />
          </option>
        </select>
        <textarea
          v-model="customInflation"
          class="hidden w-full peer-checked/custom-inflation:block"
          :placeholder="$t('configure.custom.placeholder')"
        >
        </textarea>
        <blockquote class="m-1 hidden text-xs peer-checked/custom-inflation:block">
          <i18n-t keypath="configure.custom.helper" />
        </blockquote>
        <div
          v-if="pendingCustomInflation"
          class="m-1 hidden text-xs text-orange-800 peer-checked/custom-inflation:block"
        >
          <i18n-t keypath="configure.custom.error" />
        </div>
      </form>
      <form class="mb-5 pt-5" v-on:submit.prevent="">
        <label for="configCurrency" class="block">
          <i18n-t keypath="configure.currency.label" />
        </label>
        <input
          type="text"
          required
          v-model="configuration.currency"
          id="configCurrency"
          class="block md:inline"
        />
        <small class="block text-xs md:ml-3 md:inline-block">
          <i18n-t keypath="configure.currency.helper" />
        </small>

        <fieldset class="mt-3">
          <legend class="block">
            <i18n-t keypath="configure.incomeMode.label" />
          </legend>
          <input
            type="radio"
            value="gross-annual"
            required
            v-model="configuration.incomeMode"
            id="configIncomeGrossAnnual"
            name="configIncomeMode"
            class="peer/gross-annual"
          />
          <label
            for="configIncomeGrossAnnual"
            class="mb-3 block peer-checked/gross-annual:font-semibold md:ml-3 md:inline"
          >
            <i18n-t keypath="configure.incomeMode.grossAnnual.label" />
          </label>
          <input
            type="radio"
            value="net-monthly"
            required
            v-model="configuration.incomeMode"
            id="configIncomeNetMonthly"
            name="configIncomeMode"
            class="peer/net-monthly md:ml-3"
          />
          <label
            for="configIncomeNetMonthly"
            class="mb-3 block peer-checked/net-monthly:font-semibold md:ml-3 md:inline"
          >
            <i18n-t keypath="configure.incomeMode.netMonthly.label" />
          </label>
          <small
            class="my-3 hidden text-xs peer-checked/gross-annual:block peer-hover/gross-annual:block peer-hover/net-monthly:hidden"
          >
            <i18n-t keypath="configure.incomeMode.grossAnnual.helper" />
          </small>
          <small
            class="my-3 hidden text-xs peer-checked/net-monthly:block peer-hover/net-monthly:block peer-hover/gross-annual:hidden"
          >
            <i18n-t keypath="configure.incomeMode.netMonthly.helper" />
          </small>
          <input
            type="radio"
            value="hourly-rate"
            required
            v-model="configuration.incomeMode"
            id="configIncomeHourlyRate"
            name="configIncomeMode"
            class="peer/hourly-rate md:ml-3"
          />
          <label
            for="configIncomeHourlyRate"
            class="mb-3 block peer-checked/hourly-rate:font-semibold md:ml-3 md:inline"
          >
            <i18n-t keypath="configure.incomeMode.hourlyRate.label" />
          </label>
          <small
            class="my-3 hidden text-xs peer-checked/hourly-rate:block peer-hover/hourly-rate:block peer-hover/gross-annual:hidden peer-hover/net-monthly:hidden"
          >
            <i18n-t keypath="configure.incomeMode.hourlyRate.helper" />
          </small>
          <div class="hidden peer-checked/gross-annual:block md:mt-3">
            <label for="configImposition">
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
              id="configImposition"
              name="configImposition"
            />
            <p class="text-xs md:ml-3 md:inline">
              <i18n-t keypath="configure.incomeMode.grossAnnual.imposition.helper" />
            </p>
          </div>
          <div class="hidden peer-checked/hourly-rate:block md:mt-3">
            <label for="configImpositionHourly">
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
              id="configImpositionHourly"
              name="configImposition"
            />
            <p class="text-xs md:ml-3 md:inline">
              <i18n-t keypath="configure.incomeMode.hourlyRate.imposition.helper" />
            </p>
            <label for="configMonthlyHours">
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
              id="configMonthlyHours"
              name="configMonthlyHours"
            />
            <p class="text-xs md:ml-3 md:inline">
              <i18n-t keypath="configure.incomeMode.hourlyRate.monthlyHours.helper" />
            </p>
          </div>
        </fieldset>
      </form>
      <form class="mb-5 pt-5" v-on:submit.prevent="reset()">
        <button
          type="submit"
          class="mt-3 rounded border border-orange-500 p-2 hover:bg-orange-500 hover:text-white"
        >
          <i18n-t keypath="configure.data.reset" />
        </button>
      </form>
    </div>
  </main>
</template>
