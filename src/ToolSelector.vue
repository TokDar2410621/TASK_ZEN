<script setup>
const emit = defineEmits(['select-tool'])
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="text-center">
      <h2 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Bienvenue sur votre tableau de bord</h2>
      <p class="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300">Choisissez un outil pour commencer.</p>
    </div>
    <div class="mt-12 grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
      <div @click="emit('select-tool', 'matrix')" class="cursor-pointer rounded-xl bg-white dark:bg-surface-dark shadow-lg p-8 transition-transform hover:-translate-y-1">
        <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <span class="material-symbols-outlined text-primary text-3xl">splitscreen</span>
        </div>
        <h3 class="mt-6 text-lg font-bold text-slate-900 dark:text-white">Matrice d'Eisenhower</h3>
        <p class="mt-2 text-base text-slate-600 dark:text-slate-300">Triez et gérez vos tâches quotidiennes et vos idées.</p>
      </div>
      <div @click="emit('select-tool', 'kanban')" class="cursor-pointer rounded-xl bg-white dark:bg-surface-dark shadow-lg p-8 transition-transform hover:-translate-y-1">
        <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <span class="material-symbols-outlined text-primary text-3xl">view_kanban</span>
        </div>
        <h3 class="mt-6 text-lg font-bold text-slate-900 dark:text-white">Tableau Kanban</h3>
        <p class="mt-2 text-base text-slate-600 dark:text-slate-300">Suivez l'avancement de vos tâches complexes en plusieurs étapes.</p>
      </div>
    </div>
  </div>
</template>

