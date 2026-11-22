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
      configuration: SharedConfiguration as Configuration
    }
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
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
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
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
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
              color: '#64748B',
              font: { size: 12, family: 'Inter' }
            },
            grid: {
              display: false
            },
            ticks: {
              color: '#94A3B8',
              font: { size: 11, family: 'Inter' },
              callback: function (val: number, index: number) {
                return ticks[index]
              }
            },
            border: {
              color: '#E2E8F0'
            }
          },
          y: {
            title: {
              display: true,
              text: this.$t('salary.chart.y.title', { currency: this.configuration.currency }),
              color: '#64748B',
              font: { size: 12, family: 'Inter' }
            },
            position: 'right',
            grid: {
              color: 'rgba(226, 232, 240, 0.6)'
            },
            border: {
              display: false
            },
            ticks: {
              color: '#94A3B8',
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
              color: '#64748B',
              font: { size: 12, family: 'Inter' },
              usePointStyle: true,
              pointStyle: 'line',
              padding: 16
            }
          },
          tooltip: {
            backgroundColor: '#FFFFFF',
            titleColor: '#0F172A',
            bodyColor: '#334155',
            borderColor: '#E2E8F0',
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
