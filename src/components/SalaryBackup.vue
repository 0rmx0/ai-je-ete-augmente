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
  <details class="group/details">
    <summary
      class="cursor-pointer select-none text-sm font-medium text-ink-secondary hover:text-ink-primary dark:text-zinc-300 dark:hover:text-zinc-50"
    >
      <i18n-t keypath="salary.backup.title" />
    </summary>
    <p
      class="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-ink-muted dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400"
    >
      <i18n-t keypath="salary.backup.helper" />
    </p>
    <div class="mt-3 flex gap-2">
      <button
        type="button"
        class="btn-secondary flex-1 !py-2 text-xs"
        v-bind:disabled="salaries.length === 0"
        v-on:click="exportJson"
      >
        <i18n-t keypath="salary.backup.exportJson" />
      </button>
      <button
        type="button"
        class="btn-secondary flex-1 !py-2 text-xs"
        v-bind:disabled="salaries.length === 0"
        v-on:click="exportCsv"
      >
        <i18n-t keypath="salary.backup.exportCsv" />
      </button>
    </div>
    <form class="mt-3" v-on:submit.prevent="">
      <label for="backupFile" class="label-text">
        <i18n-t keypath="salary.backup.importLabel" />
      </label>
      <input
        id="backupFile"
        type="file"
        accept=".json,.csv,application/json,text/csv"
        class="input-field file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink-secondary hover:file:bg-slate-200 dark:file:bg-zinc-700 dark:file:text-zinc-300 dark:hover:file:bg-zinc-600"
        v-on:change="onBackupFileChange"
      />
    </form>
    <p
      v-if="errorMessage !== ''"
      role="alert"
      class="mt-3 rounded-lg border border-orange-300 bg-orange-50 p-3 text-sm text-orange-700 dark:border-orange-900 dark:bg-orange-950/50 dark:text-orange-400"
    >
      {{ errorMessage }}
    </p>
    <p v-if="message !== ''" class="mt-3 text-sm font-medium text-green-700 dark:text-green-400">
      {{ message }}
    </p>
  </details>
</template>
