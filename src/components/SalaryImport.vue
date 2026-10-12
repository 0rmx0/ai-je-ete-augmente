<script lang="ts">
import { defineComponent } from 'vue'
import type { Configuration } from '@/components/SharedConfiguration'
import { SharedConfiguration } from '@/components/SharedConfiguration'
import type { Salary } from '@/components/Salary'
import type { PayslipFileResult } from '@/components/PayslipImport'
import { parsePayslipFiles } from '@/components/PayslipImport'

export default defineComponent({
  emits: ['addSalaries'],
  props: {
    salaries: {
      type: Array,
      required: true
    },
    nextKey: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      configuration: SharedConfiguration as Configuration,
      selectedFiles: [] as Array<File>,
      importing: false as boolean,
      results: [] as PayslipFileResult[]
    }
  },
  computed: {
    canImport(): boolean {
      return this.selectedFiles.length > 0 && !this.importing
    },
    parsedResults(): Array<PayslipFileResult & { alreadyExists: boolean }> {
      const existingDates = new Set(
        (this.salaries as Salary[]).map((salary: Salary): string => salary.date)
      )
      return this.results.map((result: PayslipFileResult) => ({
        ...result,
        alreadyExists:
          result.date !== null && result.income !== null && existingDates.has(result.date)
      }))
    },
    validResults(): Array<PayslipFileResult> {
      return this.results.filter(
        (result: PayslipFileResult): boolean => result.date !== null && result.income !== null
      )
    }
  },
  methods: {
    onFileChange(event: Event): void {
      const input = event.target as HTMLInputElement
      this.selectedFiles = Array.from(input.files ?? [])
      this.results = []
    },
    async importFiles(): Promise<void> {
      if (!this.canImport) {
        return
      }
      this.importing = true
      this.results = []
      try {
        this.results = await parsePayslipFiles(this.selectedFiles, {
          incomeMode: this.configuration.incomeMode
        })
      } catch (error) {
        console.error(error)
      } finally {
        this.importing = false
      }
    },
    confirmImport(): void {
      const existingDates = new Set(
        (this.salaries as Salary[]).map((salary: Salary): string => salary.date)
      )
      let key = this.nextKey
      const newSalaries: Salary[] = []
      for (const result of this.validResults) {
        if (result.date === null || result.income === null) {
          continue
        }
        if (existingDates.has(result.date)) {
          continue
        }
        existingDates.add(result.date)
        newSalaries.push({ date: result.date, income: result.income, key: key++ })
      }
      if (newSalaries.length > 0) {
        this.$emit('addSalaries', newSalaries)
      }
      this.results = []
      this.selectedFiles = []
    }
  }
})
</script>

<template>
  <details class="mb-5">
    <summary class="cursor-pointer text-slate-800">
      <i18n-t keypath="salary.import.title" />
    </summary>
    <blockquote class="mt-3 rounded border border-slate-300 p-3 text-sm text-slate-500">
      <i18n-t keypath="salary.import.privacy" />
    </blockquote>
    <form class="mt-3" v-on:submit.prevent="">
      <label for="payslipFiles" class="mb-1 block">
        <i18n-t keypath="salary.import.label" />
      </label>
      <input
        id="payslipFiles"
        type="file"
        multiple
        accept=".pdf,.zip,application/pdf,application/zip"
        class="block w-full text-sm"
        v-on:change="onFileChange"
      />
      <button
        type="button"
        class="mt-3 rounded bg-red-500 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
        v-bind:disabled="!canImport"
        v-on:click="importFiles"
      >
        <i18n-t keypath="salary.import.analyze" />
      </button>
    </form>
    <div v-if="importing" class="mt-3 text-sm italic">
      <i18n-t keypath="salary.import.processing" :plural="selectedFiles.length">
        <template v-slot:count>
          {{ selectedFiles.length }}
        </template>
      </i18n-t>
    </div>
    <div v-if="results.length > 0" class="mt-3">
      <ul
        class="mb-3 max-h-64 divide-y divide-dashed overflow-y-auto rounded border border-slate-300 text-sm"
      >
        <li
          v-for="(result, index) in parsedResults"
          v-bind:key="index"
          class="flex flex-row justify-between px-2 py-1"
        >
          <span class="mr-2 truncate">{{ result.fileName }}</span>
          <span v-if="result.date === null || result.income === null" class="text-red-600">
            <i18n-t keypath="salary.import.unrecognized" />
          </span>
          <span v-else-if="result.alreadyExists" class="text-orange-600">
            <i18n-t keypath="salary.import.duplicate" v-bind:plural="1">
              <template v-slot:date>{{ result.date }}</template>
            </i18n-t>
          </span>
          <span v-else class="whitespace-nowrap">
            <i18n-t keypath="salary.import.summary">
              <template v-slot:date>{{ result.date }}</template>
              <template v-slot:income>{{ result.income }}</template>
              <template v-slot:currency>{{ configuration.currency }}</template>
            </i18n-t>
          </span>
        </li>
      </ul>
      <button
        type="button"
        class="rounded bg-red-500 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
        v-bind:disabled="validResults.length === 0"
        v-on:click="confirmImport"
      >
        <i18n-t keypath="salary.import.confirm" :plural="validResults.length">
          <template v-slot:count>{{ validResults.length }}</template>
        </i18n-t>
      </button>
    </div>
  </details>
</template>
