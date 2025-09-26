<script setup>
import { computed } from 'vue'
import { Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, ArcElement)

const props = defineProps({
  completedTasks: {
    type: Array,
    required: true
  }
})

const archivedCounts = computed(() => {
  const counts = {
    'Urgent & Important': 0,
    'Important': 0,
    'Urgent': 0,
    'Ni l\'un ni l\'autre': 0,
    'Inconnu': 0
  }
  props.completedTasks.forEach(task => {
    const quadrant = task.archived_from_quadrant || 'Inconnu';
    if (counts[quadrant] !== undefined) {
      counts[quadrant]++;
    }
  })
  return counts;
})

const chartData = computed(() => ({
  labels: ['Urgent & Important', 'Important', 'Urgent', "Ni l'un ni l'autre"],
  datasets: [{
    backgroundColor: ['#EF4444', '#3B82F6', '#F59E0B', '#10B981'],
    data: [
      archivedCounts.value['Urgent & Important'],
      archivedCounts.value['Important'],
      archivedCounts.value['Urgent'],
      archivedCounts.value["Ni l'un ni l'autre"],
    ],
    borderWidth: 0,
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    }
  }
}

const archivedRecommendation = computed(() => {
  const total = props.completedTasks.length;
  if (total < 5) {
    return { title: "Analyse en cours...", text: "Archivez plus de tâches pour obtenir une analyse pertinente de vos efforts passés." };
  }
  const urgentImportantRatio = archivedCounts.value['Urgent & Important'] / total;
  const urgentRatio = archivedCounts.value['Urgent'] / total;
  const importantRatio = archivedCounts.value['Important'] / total;
  if (urgentImportantRatio > 0.4) {
    return { title: "Focus sur la Crise", text: "Une grande partie de votre énergie passée a été consacrée à des tâches critiques. C'est un signe que vous gérez bien les urgences, mais cherchez à anticiper davantage pour réduire ce quadrant à l'avenir." };
  }
  if (importantRatio > 0.5) {
    return { title: "Excellent Planificateur", text: "La majorité de vos efforts s'est portée sur des tâches importantes. C'est la marque d'une excellente organisation et d'une vision à long terme. Continuez ainsi !" };
  }
   if (urgentRatio > 0.4) {
    return { title: "Piège de l'Urgence", text: "Attention, vous avez passé beaucoup de temps sur des tâches urgentes mais peu importantes. Réfléchissez à comment déléguer ou refuser ces 'fausses priorités'." };
  }
  return { title: "Efforts Équilibrés", text: "Vos efforts passés semblent bien répartis entre la planification et la gestion des imprévus. C'est une approche saine de la productivité." };
})

</script>

<template>
  <div class="mt-6">
    <h4 class="text-md font-bold text-center mb-4">Analyse de vos Efforts Passés</h4>
    <div class="h-48">
       <Pie :data="chartData" :options="chartOptions" />
    </div>
    <div class="p-4 bg-primary/10 rounded-lg mt-4">
        <h4 class="font-bold text-primary">{{ archivedRecommendation.title }}</h4>
        <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">{{ archivedRecommendation.text }}</p>
   </div>
  </div>
</template>

