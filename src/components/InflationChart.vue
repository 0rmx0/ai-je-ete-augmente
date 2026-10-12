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
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            borderColor: 'rgb(37, 99, 235)',
            borderWidth: 2,
            pointStyle: false
          },
          {
            label: this.$t('salary.chart.datasets.2.label'),
            data: incomesAdjusted,
            cubicInterpolationMode: 'monotone',
            fill: '-1',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            borderColor: 'rgb(239, 68, 68)',
            borderWidth: 2,
            pointStyle: false
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
        interaction: {
          intersect: false,
          mode: 'index'
        },
        scales: {
          x: {
            title: {
              display: true,
              text: this.$t('salary.chart.x.title')
            },
            grid: {
              display: false
            },
            ticks: {
              callback: function (val: number, index: number) {
                return ticks[index]
              }
            }
          },
          y: {
            title: {
              display: true,
              text: this.$t('salary.chart.y.title', { currency: this.configuration.currency })
            },
            position: 'right',
            grid: {
              color: 'rgba(100, 116, 139, 0.15)'
            },
            ticks: {
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
