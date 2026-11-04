<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { Salary } from '@/components/Salary'
import type { Configuration } from '@/components/SharedConfiguration'
import { SharedConfiguration } from '@/components/SharedConfiguration'
import { parseSalariesBackup, salariesToCsv, salariesToJson } from '@/components/SalaryBackup'

export default defineComponent({
  emits: ['addSalaries'],
  props: {
    salaries: {
      type: Array as PropType<Salary[]>,
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
      message: '' as string,
      errorMessage: '' as string
    }
  },
  methods: {
    download(content: string, fileName: string, mimeType: string): void {
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    },
    exportJson(): void {
      const date = new Date().toISOString().substring(0, 10)
      this.download(
        salariesToJson(this.salaries),
        'ai-je-ete-augmente-salaries-' + date + '.json',
        'application/json'
      )
    },
    exportCsv(): void {
      const date = new Date().toISOString().substring(0, 10)
      this.download(
        salariesToCsv(this.salaries),
        'ai-je-ete-augmente-salaries-' + date + '.csv',
        'text/csv'
      )
    },
    async onBackupFileChange(event: Event): Promise<void> {
      const input = event.target as HTMLInputElement
      const file = input.files?.[0]
      this.message = ''
      this.errorMessage = ''
      if (file === undefined) {
        return
      }
      try {
        const text = await file.text()
        const { entries, skipped } = parseSalariesBackup(text, file.name)
        if (entries.length === 0) {
          this.errorMessage = this.$t('salary.backup.error')
          return
        }
        let key = this.nextKey
        const newSalaries: Salary[] = entries.map((entry) => ({
          date: entry.date,
          income: entry.income,
          key: key++
        }))
        this.$emit('addSalaries', newSalaries)
        this.message = this.$t('salary.backup.imported', {
          count: entries.length,
          skipped: skipped
        })
      } catch (error) {
        console.error(error)
        this.errorMessage = this.$t('salary.backup.error')
      } finally {
        input.value = ''
      }
    }
  }
})
</script>

<template>
  <details class="mb-5">
    <summary class="cursor-pointer text-slate-800">
      <i18n-t keypath="salary.backup.title" />
    </summary>
    <blockquote class="mt-3 rounded border border-slate-300 p-3 text-sm text-slate-500">
      <i18n-t keypath="salary.backup.helper" />
    </blockquote>
    <div class="mt-3">
      <button
        type="button"
        class="mr-2 rounded border border-slate-500 p-2 text-sm text-slate-700 hover:bg-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        v-bind:disabled="salaries.length === 0"
        v-on:click="exportJson"
      >
        <i18n-t keypath="salary.backup.exportJson" />
      </button>
      <button
        type="button"
        class="rounded border border-slate-500 p-2 text-sm text-slate-700 hover:bg-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        v-bind:disabled="salaries.length === 0"
        v-on:click="exportCsv"
      >
        <i18n-t keypath="salary.backup.exportCsv" />
      </button>
    </div>
    <form class="mt-3" v-on:submit.prevent="">
      <label for="backupFile" class="mb-1 block">
        <i18n-t keypath="salary.backup.importLabel" />
      </label>
      <input
        id="backupFile"
        type="file"
        accept=".json,.csv,application/json,text/csv"
        class="block w-full text-sm"
        v-on:change="onBackupFileChange"
      />
    </form>
    <p
      v-if="errorMessage !== ''"
      role="alert"
      class="mt-3 rounded border border-orange-500 bg-orange-100 p-2 text-sm text-orange-700"
    >
      {{ errorMessage }}
    </p>
    <p v-if="message !== ''" class="mt-3 text-sm text-green-700">{{ message }}</p>
  </details>
</template>
