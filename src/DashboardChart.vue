<script setup>
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { computed } from 'vue'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props = defineProps({
  taskCounts: {
    type: Object,
    required: true
  }
})

const chartData = computed(() => ({
  labels: ['Urgent & Important', 'Important', 'Urgent', 'Autre'],
  datasets: [
    {
      backgroundColor: ['#EF4444', '#3B82F6', '#F59E0B', '#10B981'],
      data: [
        props.taskCounts.urgentImportant,
        props.taskCounts.important,
        props.taskCounts.urgent,
        props.taskCounts.other
      ],
      borderWidth: 0,
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: '#94a3b8', // text-secondary-dark
        font: {
          family: "'Inter', sans-serif"
        }
      }
    }
  }
}
</script>

<template>
  <div class="h-64">
    <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>

