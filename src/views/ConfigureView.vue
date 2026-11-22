<script lang="ts">
import { defineComponent } from 'vue'
import type { Configuration } from '@/components/SharedConfiguration'
import { SharedConfiguration, DefaultConfiguration } from '@/components/SharedConfiguration'
import type { countryCode } from '@/components/CountryCodes'
import { countryCodes } from '@/components/CountryCodes'
import type { RaiseMode } from '@/components/RaiseMode'
import { raiseModes } from '@/components/RaiseMode'
import { isValidInflationRates } from '@/components/InflationRates'
import IncomeModeSelect from '@/components/IncomeModeSelect.vue'

export default defineComponent({
  components: { IncomeModeSelect },
  data() {
    return {
      configuration: SharedConfiguration as Configuration,
      countryCodes: countryCodes as countryCode[],
      raiseModes: raiseModes as RaiseMode[],
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
        this.configuration.country = DefaultConfiguration.country
        this.configuration.currency = DefaultConfiguration.currency
        this.configuration.customInflation = DefaultConfiguration.customInflation
        this.configuration.imposition = DefaultConfiguration.imposition
        this.configuration.incomeMode = DefaultConfiguration.incomeMode
        this.configuration.indexPointValue = DefaultConfiguration.indexPointValue
        this.configuration.locale = DefaultConfiguration.locale
        this.configuration.monthlyHours = DefaultConfiguration.monthlyHours
        this.configuration.raiseMode = DefaultConfiguration.raiseMode
        this.configuration.useCustomInflation = DefaultConfiguration.useCustomInflation
        alert('Reinitialisation effectuée !')
      }
    },
    validateCustomInflation(jsonData: unknown): boolean {
      return isValidInflationRates(jsonData)
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
  <main class="mx-auto w-full max-w-3xl flex-1 px-6 py-6 lg:px-8">
    <h2 class="section-title mb-6">
      <i18n-t keypath="configure.header" />
    </h2>

    <!-- Notification de sauvegarde -->
    <div
      v-if="saved > 0"
      class="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
    >
      <i18n-t keypath="configure.saved" :plural="saved">
        <template v-slot:count>
          {{ saved }}
        </template>
      </i18n-t>
    </div>
    <div
      v-else
      class="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-ink-muted"
    >
      <i18n-t keypath="configure.autosave" />
    </div>

    <div class="flex flex-col gap-5">
      <!-- Langue -->
      <div class="card">
        <label for="language" class="label-text">
          <i18n-t keypath="configure.language.label" />
        </label>
        <select id="language" v-model="configuration.locale" class="input-field">
          <option value="fr">
            <i18n-t keypath="configure.language.options.fr" />
          </option>
          <option value="en">
            <i18n-t keypath="configure.language.options.en" />
          </option>
        </select>
      </div>

      <!-- Pays / inflation personnalisée -->
      <div class="card">
        <div class="flex items-center gap-3">
          <input
            type="checkbox"
            v-model="configuration.useCustomInflation"
            id="useCustomInflation"
            class="peer/custom-inflation h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          <label
            for="useCustomInflation"
            class="text-sm font-medium text-ink-secondary peer-checked/custom-inflation:text-ink-primary"
          >
            <i18n-t keypath="configure.custom.label" />
          </label>
        </div>

        <div class="mt-4 peer-checked/custom-inflation:hidden">
          <label for="country" class="label-text">
            <i18n-t keypath="configure.country.label" />
          </label>
          <select id="country" v-model="configuration.country" class="input-field">
            <option
              v-for="(countryCode, index) in countryCodes"
              v-bind:key="index"
              :value="countryCode"
            >
              <i18n-t :keypath="'configure.country.options.' + countryCode" />
            </option>
          </select>
        </div>

        <div class="hidden peer-checked/custom-inflation:block">
          <label for="customInflation" class="label-text">
            <i18n-t keypath="configure.custom.label" />
          </label>
          <textarea
            id="customInflation"
            v-model="customInflation"
            rows="5"
            class="input-field font-mono text-xs"
            :placeholder="$t('configure.custom.placeholder')"
          ></textarea>
          <p class="mt-1.5 text-xs text-ink-muted">
            <i18n-t keypath="configure.custom.helper" />
          </p>
          <p v-if="pendingCustomInflation" class="mt-1.5 text-xs text-orange-700">
            <i18n-t keypath="configure.custom.error" />
          </p>
        </div>
      </div>

      <!-- Devise + mode de revenu -->
      <div class="card">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label for="configCurrency" class="label-text">
              <i18n-t keypath="configure.currency.label" />
            </label>
            <input
              type="text"
              required
              v-model="configuration.currency"
              id="configCurrency"
              class="input-field"
            />
            <p class="mt-1.5 text-xs text-ink-muted">
              <i18n-t keypath="configure.currency.helper" />
            </p>
          </div>
        </div>
        <div class="mt-4">
          <income-mode-select />
        </div>
      </div>

      <!-- Mode de saisie des augmentations -->
      <div class="card">
        <label for="raiseMode" class="label-text">
          <i18n-t keypath="configure.raiseMode.label" />
        </label>
        <select id="raiseMode" v-model="configuration.raiseMode" class="input-field">
          <option v-for="raiseMode in raiseModes" v-bind:key="raiseMode" :value="raiseMode">
            <i18n-t :keypath="'configure.raiseMode.options.' + raiseMode" />
          </option>
        </select>
        <p class="mt-1.5 text-xs text-ink-muted">
          <i18n-t keypath="configure.raiseMode.helper" />
        </p>
        <div v-if="configuration.raiseMode === 'index-point'" class="mt-4">
          <label for="indexPointValue" class="label-text">
            <i18n-t keypath="configure.indexPointValue.label" />
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            required
            v-model="configuration.indexPointValue"
            id="indexPointValue"
            class="input-field"
          />
          <p class="mt-1.5 text-xs text-ink-muted">
            <i18n-t keypath="configure.indexPointValue.helper" />
          </p>
        </div>
      </div>

      <!-- Reset -->
      <div class="card border-red-200">
        <button type="button" v-on:click.prevent="reset()" class="btn-danger">
          <i18n-t keypath="configure.data.reset" />
        </button>
      </div>
    </div>
  </main>
</template>
