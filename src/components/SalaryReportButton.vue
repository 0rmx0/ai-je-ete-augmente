<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { AdjustedSalary } from '@/components/AdjustedSalary'
import type { Configuration } from '@/components/SharedConfiguration'
import { SharedConfiguration } from '@/components/SharedConfiguration'
import type { Salary } from '@/components/Salary'
import type { InflationRates } from '@/components/InflationRates'
import { generateSalaryReportWithHash } from '@/components/SalaryReport'
import { PdfDocument, markdownToPdfLines, wrapPdfLines } from '@/components/PdfDocument'

export default defineComponent({
  name: 'SalaryReportButton',
  props: {
    salaries: {
      type: Array as PropType<Salary[]>,
      required: true
    },
    adjustedSalaries: {
      type: Array as PropType<AdjustedSalary[]>,
      required: true
    },
    inflationRates: {
      type: Object as PropType<InflationRates>,
      required: true
    },
    missingInflationRates: {
      type: Array as PropType<string[]>,
      default: (): string[] => [],
      required: false
    },
    lastKnownInflationRate: {
      type: String as PropType<string | null>,
      default: null,
      required: false
    }
  },
  data() {
    return {
      configuration: SharedConfiguration as Configuration,
      busy: false as boolean
    }
  },
  computed: {
    canGenerate(): boolean {
      return this.salaries.length > 0 && !this.busy
    }
  },
  methods: {
    async downloadReport(): Promise<void> {
      if (!this.canGenerate) {
        return
      }
      this.busy = true
      try {
        const { content } = await generateSalaryReportWithHash(
          {
            salaries: this.salaries,
            adjustedSalaries: this.adjustedSalaries,
            inflationRates: this.inflationRates,
            missingInflationRates: this.missingInflationRates,
            lastKnownInflationRate: this.lastKnownInflationRate,
            configuration: this.configuration
          },
          this.$t as (key: string, params?: Record<string, unknown>) => string
        )
        const pdf = new PdfDocument()
        pdf.addLines(wrapPdfLines(markdownToPdfLines(content)))
        const bytes = pdf.finish()
        const blob = new Blob([bytes], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const date = new Date().toISOString().substring(0, 10)
        link.download = 'ai-je-ete-augmente-' + date + '.pdf'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } finally {
        this.busy = false
      }
    }
  }
})
</script>

<template>
  <button
    type="button"
    v-bind:disabled="!canGenerate"
    v-on:click="downloadReport"
    class="m-3 rounded border border-slate-500 p-2 hover:bg-slate-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
  >
    <i18n-t keypath="salary.report.button" />
  </button>
</template>
