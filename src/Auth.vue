<script setup>
import { ref } from 'vue'
import { supabase } from './supabase.js'

const tab = ref('register') // 'register' or 'login'
const loading = ref(false)
const email = ref('')
const password = ref('')
const fullName = ref('')

const handleAuth = async () => {
  try {
    loading.value = true
    const { error } = tab.value === 'register'
      ? await supabase.auth.signUp({ email: email.value, password: password.value })
      : await supabase.auth.signInWithPassword({ email: email.value, password: password.value });

    if (error) throw error
    if (tab.value === 'register') {
      alert('Compte créé ! Vous pouvez maintenant vous connecter.')
      tab.value = 'login';
    }
  } catch (error) {
    alert(error.error_description || error.message)
  } finally {
    loading.value = false
  }
}

</script>
<template>
  <div class="bg-background-light dark:bg-surface-dark p-8 rounded-xl shadow-lg w-full max-w-md">
    <div>
      <div class="flex border-b border-border-light dark:border-border-dark mb-6">
        <button
          @click="tab = 'register'"
          :class="[tab === 'register' ? 'border-primary text-primary' : 'border-transparent text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark']"
          class="flex-1 py-3 px-1 border-b-2 font-medium text-sm focus:outline-none transition-colors"
        >
          Register
        </button>
        <button
          @click="tab = 'login'"
          :class="[tab === 'login' ? 'border-primary text-primary' : 'border-transparent text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark']"
          class="flex-1 py-3 px-1 border-b-2 font-medium text-sm focus:outline-none transition-colors"
        >
          Login
        </button>
      </div>

      <form class="space-y-6" @submit.prevent="handleAuth">
        <div v-if="tab === 'register'">
          <label class="block text-sm font-medium text-left" for="register-name">Full Name</label>
          <div class="mt-1">
            <input v-model="fullName" id="register-name" type="text" autocomplete="name" required class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark px-4 py-2 placeholder-slate-500 focus:border-primary focus:ring-primary" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-left" for="auth-email">Email address</label>
          <div class="mt-1">
            <input v-model="email" id="auth-email" name="email" type="email" autocomplete="email" required class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark px-4 py-2 placeholder-slate-500 focus:border-primary focus:ring-primary" />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-left" for="auth-password">Password</label>
          <div class="mt-1">
            <input v-model="password" id="auth-password" name="password" type="password" autocomplete="current-password" required class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-background-dark px-4 py-2 placeholder-slate-500 focus:border-primary focus:ring-primary" />
          </div>
        </div>

        <div>
          <button type="submit" :disabled="loading" class="w-full inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark disabled:opacity-50">
            {{ loading ? 'Loading...' : (tab === 'register' ? 'Create Account' : 'Sign In') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

