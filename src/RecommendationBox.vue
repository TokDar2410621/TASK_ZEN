<script setup>
import { computed } from 'vue'

const props = defineProps({
  taskCounts: {
    type: Object,
    required: true
  }
})

const recommendation = computed(() => {
  const { urgentImportant, important, urgent, other } = props.taskCounts;
  const total = urgentImportant + important + urgent + other;
  
  if (total === 0) {
    return { 
      title: "Prêt à commencer ?", 
      text: "Ajoutez votre première tâche pour voir apparaître ici des conseils personnalisés sur votre productivité." 
    };
  }

  const urgentImportantRatio = urgentImportant / total;
  const urgentRatio = urgent / total;
  const importantRatio = important / total;

  if (urgentImportantRatio > 0.5) {
    return { 
      title: "Mode Crise Activé", 
      text: "Plus de la moitié de vos tâches sont critiques. C'est le moment de vous concentrer à 100% sur le quadrant 'Urgent & Important' pour éteindre les incendies avant qu'ils ne deviennent incontrôlables." 
    };
  }
  if (urgentRatio > 0.4) {
    return { 
      title: "Attention aux Interruptions", 
      text: "Une part importante de votre travail est urgente mais pas importante. Ces tâches sont des voleurs de temps. Demandez-vous si vous pouvez les déléguer, les automatiser ou simplement dire non pour libérer du temps pour vos vrais objectifs." 
    };
  }
  if (importantRatio > 0.6) {
    return { 
      title: "Vision à Long Terme", 
      text: "Excellent ! Vous passez la majorité de votre temps sur ce qui est important mais pas urgent. C'est la clé du succès durable, de la croissance et de la prévention des crises. Continuez de planifier et d'anticiper." 
    };
  }
  if (urgentImportant === 0 && urgent === 0) {
    return { 
      title: "Zone de Calme et de Planification", 
      text: "Vous n'avez aucune tâche urgente en ce moment. C'est une opportunité en or pour prendre de l'avance sur vos projets importants, apprendre de nouvelles choses ou vous reposer stratégiquement." 
    };
  }
  
  return { 
    title: "Charge de Travail Équilibrée", 
    text: "Votre répartition des tâches semble saine. C'est un bon équilibre entre la gestion des imprévus et la progression sur vos objectifs de fond. Continuez d'évaluer régulièrement vos priorités." 
  };
})
</script>

<template>
    <div class="p-4 bg-primary/10 rounded-lg mt-4">
        <h4 class="font-bold text-primary">{{ recommendation.title }}</h4>
        <p class="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">{{ recommendation.text }}</p>
   </div>
</template>
