<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line as ChartLine } from 'vue-chartjs'
import type { AdjustedSalary } from '@/components/AdjustedSalary'
import type { Configuration } from '@/components/SharedConfiguration'
import { SharedConfiguration } from '@/components/SharedConfiguration'

ChartJS.register(
  CategoryScale,
  Filler,
  LinearScale,
  LineElement,
  Legend,
  PointElement,
  Title,
  Tooltip
)

export default defineComponent({
  components: { ChartLine },
  props: {
    adjustedSalaries: {
      type: Array as PropType<AdjustedSalary[]>,
      required: true
    }
  },
  data() {
    return {
      configuration: SharedConfiguration as Configuration,
      isDark: false as boolean
    }
  },
  mounted() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    this.isDark = mediaQuery.matches
    mediaQuery.addEventListener('change', (e) => {
      this.isDark = e.matches
    })
  },
  computed: {
    chartData() {
      const labels = [] as string[]
      const incomes = [] as number[]
      const incomesAdjusted = [] as number[]
      this.adjustedSalaries.forEach((salary: AdjustedSalary): void => {
        labels.push(salary.date)
        incomes.push(salary.income)
        incomesAdjusted.push(salary.incomeAdjusted)
      })
      return {
        labels: labels,
        datasets: [
          {
            label: this.$t('salary.chart.datasets.1.label'),
            data: incomes,
            backgroundColor: this.isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.08)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2.5,
            pointStyle: false,
            tension: 0.3
          },
          {
            label: this.$t('salary.chart.datasets.2.label'),
            data: incomesAdjusted,
            cubicInterpolationMode: 'monotone',
            fill: '-1',
            backgroundColor: this.isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)',
            borderColor: 'rgb(239, 68, 68)',
            borderWidth: 2.5,
            pointStyle: false,
            tension: 0.3
          }
        ]
      } as any
    },
    chartOptions() {
      const ticks = [] as string[]
      this.adjustedSalaries.forEach((salary: AdjustedSalary): void => {
        ticks.push(salary.originalSalary !== null ? salary.originalSalary.date : '')
      })

      const tickColor = this.isDark ? '#A1A1AA' : '#94A3B8'
      const titleColor = this.isDark ? '#A1A1AA' : '#64748B'
      const gridColor = this.isDark ? 'rgba(63, 63, 70, 0.5)' : 'rgba(226, 232, 240, 0.6)'
      const borderColor = this.isDark ? '#3F3F46' : '#E2E8F0'

      return {
        responsive: true,
        maintainAspectRatio: true,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        scales: {
          x: {
            title: {
              display: true,
              text: this.$t('salary.chart.x.title'),
              color: titleColor,
              font: { size: 12, family: 'Inter' }
            },
            grid: {
              display: false
            },
            ticks: {
              color: tickColor,
              font: { size: 11, family: 'Inter' },
              callback: function (val: number, index: number) {
                return ticks[index]
              }
            },
            border: {
              color: borderColor
            }
          },
          y: {
            title: {
              display: true,
              text: this.$t('salary.chart.y.title', { currency: this.configuration.currency }),
              color: titleColor,
              font: { size: 12, family: 'Inter' }
            },
            position: 'right',
            grid: {
              color: gridColor
            },
            border: {
              display: false
            },
            ticks: {
              color: tickColor,
              font: { size: 11, family: 'Inter' },
              callback: (value: number): string => {
                return new Intl.NumberFormat(this.configuration.locale, {
                  notation: 'compact',
                  maximumFractionDigits: 1
                }).format(value)
              }
            }
          }
        },
        plugins: {
          filler: {
            propagate: false
          },
          legend: {
            labels: {
              color: titleColor,
              font: { size: 12, family: 'Inter' },
              usePointStyle: true,
              pointStyle: 'line',
              padding: 16
            }
          },
          tooltip: {
            backgroundColor: this.isDark ? '#18181B' : '#FFFFFF',
            titleColor: this.isDark ? '#FAFAFA' : '#0F172A',
            bodyColor: this.isDark ? '#D4D4D8' : '#334155',
            borderColor: this.isDark ? '#3F3F46' : '#E2E8F0',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            titleFont: { family: 'Inter', size: 13, weight: 'bold' },
            bodyFont: { family: 'Inter', size: 12 }
          }
        }
      } as any
    }
  }
})
</script>

<template>
  <ChartLine v-if="adjustedSalaries.length > 0" :data="chartData" :options="chartOptions" />
</template>
