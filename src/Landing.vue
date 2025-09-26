<script setup>
import Auth from './Auth.vue'

function scrollToLogin() {
  document.getElementById('login-form')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <main>
    <section class="relative">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Master Your Tasks with Eisenhower & Kanban
          </h1>
          <p class="mt-6 text-lg text-slate-600 dark:text-slate-300">
            TaskZen combines the power of the Eisenhower Matrix and Kanban boards for seamless task management. Prioritize effectively, visualize your workflow, and achieve your goals with ease.
          </p>
        </div>
      </div>
    </section>

    <section class="py-20 sm:py-24">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Powerful Features to Boost Your Productivity</h2>
          <p class="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300">TaskZen offers a comprehensive suite of tools designed to help you prioritize, organize, and execute your tasks efficiently.</p>
        </div>
        <div class="mt-16 grid gap-8 md:grid-cols-2">
          <div class="rounded-xl bg-white dark:bg-background-dark/50 shadow-lg p-8">
            <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <span class="material-symbols-outlined text-primary text-3xl">splitscreen</span>
            </div>
            <h3 class="mt-6 text-lg font-bold text-slate-900 dark:text-white">Eisenhower Matrix</h3>
            <p class="mt-2 text-base text-slate-600 dark:text-slate-300">Prioritize tasks based on urgency and importance, ensuring you focus on what truly matters.</p>
          </div>
          <div class="rounded-xl bg-white dark:bg-background-dark/50 shadow-lg p-8">
            <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <span class="material-symbols-outlined text-primary text-3xl">view_kanban</span>
            </div>
            <h3 class="mt-6 text-lg font-bold text-slate-900 dark:text-white">Kanban Boards</h3>
            <p class="mt-2 text-base text-slate-600 dark:text-slate-300">Visualize your workflow with customizable Kanban boards, tracking progress from start to finish.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-white dark:bg-background-dark/50 py-20 sm:py-24" id="login-form">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div class="text-center lg:text-left">
            <h2 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Get Started with TaskZen</h2>
            <p class="mt-4 text-lg text-slate-600 dark:text-slate-300">Create an account or log in to start mastering your tasks today. Unlock your productivity potential.</p>
          </div>
          <Auth />
        </div>
      </div>
    </section>
  </main>
</template>

