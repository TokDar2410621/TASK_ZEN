<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from './supabase.js'
import Landing from './Landing.vue'
import ToolSelector from './ToolSelector.vue'
import MatrixTool from './MatrixTool.vue'
import KanbanTool from './KanbanTool.vue'

const session = ref(null)
const activeTool = ref(null)

onMounted(() => {
  supabase.auth.onAuthStateChange((_event, _session) => {
    session.value = _session
    if (!_session) {
      activeTool.value = null
    }
  })
})

function scrollToLogin() {
  document.getElementById('login-form')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="relative flex min-h-screen w-full flex-col overflow-x-hidden">
    <header class="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-b border-border-light dark:border-border-dark">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <a class="flex items-center gap-2" href="#">
            <svg class="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 45.8096C19.6865 45.8096 15.4698 44.5305 11.8832 42.134C8.29667 39.7376 5.50128 36.3314 3.85056 32.3462C2.19985 28.361 1.76794 23.9758 2.60947 19.7452C3.451 15.5145 5.52816 11.6284 8.57829 8.5783C11.6284 5.52817 15.5145 3.45101 19.7452 2.60948C23.9758 1.76795 28.361 2.19986 32.3462 3.85057C36.3314 5.50129 39.7376 8.29668 42.134 11.8833C44.5305 15.4698 45.8096 19.6865 45.8096 24L24 24L24 45.8096Z"></path>
            </svg>
            <span class="text-xl font-bold text-slate-900 dark:text-white">TaskZen</span>
          </a>
          <div v-if="!session" class="flex items-center gap-4">
            <a @click.prevent="scrollToLogin" class="hidden sm:inline-block text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors" href="#login-form">Login</a>
            <a @click.prevent="scrollToLogin" class="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary/90" href="#login-form">
              Get Started
            </a>
          </div>
          <div v-else class="flex items-center gap-4">
            <button v-if="activeTool" @click="activeTool = null" class="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors">
              ← Outils
            </button>
            <button @click="supabase.auth.signOut()" class="inline-flex items-center justify-center rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/20">
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </header>

    <div class="flex-grow">
      <Landing v-if="!session" />
      <div v-else class="main-app-content">
        <ToolSelector v-if="!activeTool" @select-tool="tool => activeTool = tool" />
        <MatrixTool v-else-if="activeTool === 'matrix'" />
        <KanbanTool v-else-if="activeTool === 'kanban'" />
      </div>
    </div>
  </div>
</template>

