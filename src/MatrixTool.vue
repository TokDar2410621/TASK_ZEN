<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from './supabase.js'
import DashboardChart from './DashboardChart.vue'
import RecommendationBox from './RecommendationBox.vue'
import ArchivedStats from './ArchivedStats.vue'

const tasks = ref([])
const showCompleted = ref(false)
const showStatsModal = ref(false)
const newTaskTitle = ref('')
const newTaskUrgency = ref(5)
const newTaskImportance = ref(5)
const newTaskComment = ref('')
const newTaskDeadline = ref('')
const editingTaskId = ref(null)
const editTaskTitle = ref('')
const editTaskUrgency = ref(0)
const editTaskImportance = ref(0)
const editTaskComment = ref('')
const editTaskDeadline = ref('')
const isDeadlinePickerOpen = ref(false)
const deadlinePickerMode = ref('new')
const tempDeadline = ref('')

let synth = null;
onMounted(() => {
  if (window.Tone) {
    synth = new window.Tone.Synth().toDestination();
  }
  fetchTasks()
})

async function fetchTasks() {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) {
    console.error('Erreur récupération utilisateur:', userError)
    return
  }
  if (!userData?.user) {
    tasks.value = []
    return
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userData.user.id)

  if (error) {
    console.error('Erreur fetch:', error)
    tasks.value = []
  } else {
    tasks.value = data || []
  }
}

function processDeadlineInput(deadlineInput) {
  if (!deadlineInput) return null;
  let deadline = new Date(deadlineInput);
  if (deadlineInput.length === 10) { deadline.setHours(17, 0, 0, 0); }
  return deadline;
}

async function addTask() {
  if (newTaskTitle.value.trim() === '') return

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    console.error('Impossible de récupérer l’utilisateur avant insertion:', userError)
    return
  }

  const deadline = processDeadlineInput(newTaskDeadline.value)
  const { error } = await supabase.from('tasks').insert([
    {
      title: newTaskTitle.value,
      urgency: newTaskUrgency.value,
      importance: newTaskImportance.value,
      user_id: userData.user.id,
      comment: newTaskComment.value,
      deadline: deadline,
      kanban_status: 'backlog'
    }
  ])
  if (error) {
    console.error('Erreur add:', error)
  } else {
    await fetchTasks()
    newTaskTitle.value = ''
    newTaskUrgency.value = 5
    newTaskImportance.value = 5
    newTaskComment.value = ''
    newTaskDeadline.value = ''
  }
}

function getQuadrantForTask(task) {
  if (task.importance > 5 && task.urgency > 5) return 'Urgent & Important';
  if (task.importance > 5 && task.urgency <= 5) return 'Important';
  if (task.importance <= 5 && task.urgency > 5) return 'Urgent';
  return 'Ni l\'un ni l\'autre';
}

async function toggleTaskComplete(task) {
  const isCompleting = !task.isComplete
  if (isCompleting && synth) {
    synth.triggerAttackRelease('C5', '8n')
  }

  const updates = {
    isComplete: isCompleting,
    archived_from_quadrant: isCompleting ? getQuadrantForTask(task) : null,
    archived_at: isCompleting ? new Date() : null
  }

  const { error } = await supabase.from('tasks').update(updates).eq('id', task.id)

  if (error) {
    console.error('Erreur update:', error)
  } else {
    const taskInList = tasks.value.find(t => t.id === task.id)
    if (taskInList) {
      Object.assign(taskInList, {
        isComplete: isCompleting,
        archived_from_quadrant: updates.archived_from_quadrant,
        archived_at: updates.archived_at instanceof Date ? updates.archived_at.toISOString() : null
      })
    }
  }
}

async function deleteTask(taskId) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer définitivement cette tâche ?")) return;
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) { console.error("Erreur suppression:", error); } else { tasks.value = tasks.value.filter(task => task.id !== taskId); }
}

function formatDateTimeForInput(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - timezoneOffset);
  return localDate.toISOString().slice(0, 16);
}

function startEditing(task) {
  editingTaskId.value = task.id;
  editTaskTitle.value = task.title;
  editTaskUrgency.value = task.urgency;
  editTaskImportance.value = task.importance;
  editTaskComment.value = task.comment || '';
  editTaskDeadline.value = formatDateTimeForInput(task.deadline);
}

function cancelEditing() { editingTaskId.value = null; }

async function saveTaskChanges() {
  if (!editingTaskId.value) return;
  const deadline = processDeadlineInput(editTaskDeadline.value);
  const { error } = await supabase.from('tasks').update({ title: editTaskTitle.value, urgency: editTaskUrgency.value, importance: editTaskImportance.value, comment: editTaskComment.value, deadline: deadline }).eq('id', editingTaskId.value)
  if (error) { console.error("Erreur sauvegarde:", error) } 
  else { 
    const taskInList = tasks.value.find(t => t.id === editingTaskId.value);
    if(taskInList) {
        Object.assign(taskInList, {
            title: editTaskTitle.value,
            urgency: editTaskUrgency.value,
            importance: editTaskImportance.value,
            comment: editTaskComment.value,
            deadline: deadline ? deadline.toISOString() : null
        });
    }
  }
  editingTaskId.value = null;
}

function openDeadlinePicker(mode) {
  deadlinePickerMode.value = mode;
  if (mode === 'new') { tempDeadline.value = newTaskDeadline.value || formatDateTimeForInput(new Date()); } 
  else { tempDeadline.value = editTaskDeadline.value || formatDateTimeForInput(new Date()); }
  isDeadlinePickerOpen.value = true;
}

function confirmDeadline() {
  if (deadlinePickerMode.value === 'new') { newTaskDeadline.value = tempDeadline.value; } 
  else { editTaskDeadline.value = tempDeadline.value; }
  isDeadlinePickerOpen.value = false;
}

function cancelDeadline() { isDeadlinePickerOpen.value = false; }

function clearDeadline(mode) {
  if (mode === 'new') { newTaskDeadline.value = ''; } 
  else { editTaskDeadline.value = ''; }
}

async function moveToKanban(task) {
  const { error } = await supabase
    .from('tasks')
    .update({ kanban_status: 'todo' })
    .eq('id', task.id)
  if (error) console.error("Erreur moveToKanban:", error)
  else { 
     const taskToUpdate = tasks.value.find(t => t.id === task.id);
     if(taskToUpdate) taskToUpdate.kanban_status = 'todo';
  }
}

const activeTasks = computed(() => tasks.value.filter(t => !t.isComplete && (t.kanban_status === 'backlog' || t.kanban_status === null)));
const importantUrgentTasks = computed(() => activeTasks.value.filter(t => t.importance > 5 && t.urgency > 5))
const importantNotUrgentTasks = computed(() => activeTasks.value.filter(t => t.importance > 5 && t.urgency <= 5))
const notImportantUrgentTasks = computed(() => activeTasks.value.filter(t => t.importance <= 5 && t.urgency > 5))
const notImportantNotUrgentTasks = computed(() => activeTasks.value.filter(t => t.importance <= 5 && t.urgency <= 5))
const completedTasks = computed(() => {
    return tasks.value
        .filter(t => t.isComplete)
        .sort((a, b) => new Date(b.archived_at) - new Date(a.archived_at))
});
const taskCounts = computed(() => ({ 
    urgentImportant: importantUrgentTasks.value.length, 
    important: importantNotUrgentTasks.value.length, 
    urgent: notImportantUrgentTasks.value.length, 
    other: notImportantNotUrgentTasks.value.length 
}));

function getDeadlineStyle(task) {
    if (!task.deadline) return {};
    const deadline = new Date(task.deadline);
    const now = new Date();
    const hoursRemaining = (deadline - now) / 36e5;
    if (hoursRemaining < 0) return { 'background-color': 'rgba(239, 68, 68, 0.1)', 'border-left-color': '#ef4444' };
    if (hoursRemaining < 24) {
        const opacity = 1 - (hoursRemaining / 24);
        return { 'background-color': `rgba(239, 68, 68, ${opacity * 0.1 + 0.05})`, 'border-left-color': `rgba(239, 68, 68, ${opacity * 0.8 + 0.2})` };
    }
    return {};
}

function formatTaskAge(creationDate) {
  const now = new Date(); const date = new Date(creationDate);
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "aujourd'hui";
  if (diffDays === 1) return "depuis 1 jour";
  return `depuis ${diffDays} jours`;
}
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <Transition name="fade">
      <div v-if="isDeadlinePickerOpen" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" @click.self="cancelDeadline">
        <div class="bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg p-6 space-y-4">
          <h3 class="text-lg font-bold">Choisir un délai</h3>
          <input type="datetime-local" v-model="tempDeadline" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-background-light dark:bg-background-dark px-4 py-2" />
          <div class="flex justify-end gap-4">
            <button @click="cancelDeadline" class="px-4 py-2 text-sm font-medium rounded-lg">Annuler</button>
            <button @click="confirmDeadline" class="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white">OK</button>
          </div>
        </div>
      </div>
    </Transition>

     <Transition name="fade">
      <div v-if="showStatsModal" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" @click.self="showStatsModal = false">
        <div class="bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg p-6 w-full max-w-lg overflow-y-auto max-h-[90vh]">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold">Statistiques & Conseils</h3>
            <button @click="showStatsModal = false" class="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <h4 class="text-md font-bold text-center mb-4">Répartition Actuelle</h4>
          <DashboardChart :task-counts="taskCounts" />
          <RecommendationBox :task-counts="taskCounts" />
          
          <hr class="my-6 border-border-light dark:border-border-dark" />
          <ArchivedStats :completed-tasks="completedTasks" />

        </div>
      </div>
    </Transition>

    <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">Votre Matrice</h1>
        <button @click="showStatsModal = true" class="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20">
            <span class="material-symbols-outlined">pie_chart</span>
            Statistiques
        </button>
    </div>
    
    <form @submit.prevent="addTask" class="p-6 bg-white dark:bg-surface-dark rounded-xl shadow-lg mb-8 space-y-4">
      <h2 class="text-xl font-bold">Ajouter une nouvelle tâche</h2>
      <input type="text" v-model="newTaskTitle" placeholder="Quelle est votre prochaine tâche ?" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-background-light dark:bg-background-dark px-4 py-2" />
      <textarea v-model="newTaskComment" placeholder="Ajouter un commentaire (optionnel)..." rows="2" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-background-light dark:bg-background-dark px-4 py-2"></textarea>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <div class="space-y-2">
            <label class="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">Urgence: {{ newTaskUrgency }}</label>
            <input type="range" min="0" max="10" v-model="newTaskUrgency" class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
        </div>
        <div class="space-y-2">
            <label class="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">Importance: {{ newTaskImportance }}</label>
            <input type="range" min="0" max="10" v-model="newTaskImportance" class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
        </div>
         <div class="space-y-2">
            <label class="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">Délai</label>
            <div class="flex items-center gap-2 p-2 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark">
                <span class="flex-grow text-sm">{{ newTaskDeadline ? new Date(newTaskDeadline).toLocaleString() : 'Aucun' }}</span>
                <button type="button" @click="openDeadlinePicker('new')" class="text-slate-500 hover:text-primary"><span class="material-symbols-outlined">edit_calendar</span></button>
                <button v-if="newTaskDeadline" type="button" @click="clearDeadline('new')" class="text-slate-500 hover:text-red-500"><span class="material-symbols-outlined">close</span></button>
            </div>
        </div>
        <button type="submit" class="w-full inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:bg-primary/90">
          Ajouter Tâche
        </button>
      </div>
    </form>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div v-for="(quadrant, type) in { importantUrgentTasks, importantNotUrgentTasks, notImportantUrgentTasks, notImportantNotUrgentTasks }" :key="type" 
           :class="['rounded-xl p-4 flex flex-col', 
           { 'bg-red-50 dark:bg-red-900/20': type === 'importantUrgentTasks', 
             'bg-blue-50 dark:bg-blue-900/20': type === 'importantNotUrgentTasks',
             'bg-amber-50 dark:bg-amber-900/20': type === 'notImportantUrgentTasks',
             'bg-green-50 dark:bg-green-900/20': type === 'notImportantNotUrgentTasks'
           }]">
        <h2 :class="['text-lg font-bold text-center mb-4',
            { 'text-red-600 dark:text-red-400': type === 'importantUrgentTasks', 
             'text-blue-600 dark:text-blue-400': type === 'importantNotUrgentTasks',
             'text-amber-600 dark:text-amber-400': type === 'notImportantUrgentTasks',
             'text-green-600 dark:text-green-400': type === 'notImportantNotUrgentTasks'
            }]">
            {{ { importantUrgentTasks: 'Urgent & Important', importantNotUrgentTasks: 'Important / Not Urgent', notImportantUrgentTasks: 'Urgent / Not Important', notImportantNotUrgentTasks: 'Not Urgent / Not Important' }[type] }}
        </h2>
        <div class="space-y-3 overflow-y-auto flex-grow p-1">
          <div v-for="task in quadrant" :key="task.id" :style="getDeadlineStyle(task)" class="p-3 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark">
            <div v-if="editingTaskId !== task.id">
                <div class="flex justify-between items-start">
                    <div class="flex items-start gap-3">
                        <input type="checkbox" @change="toggleTaskComplete(task)" class="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                        <div>
                            <p class="font-medium">{{ task.title }}</p>
                            <p v-if="task.comment" class="text-sm text-text-secondary-light dark:text-text-secondary-dark italic">{{task.comment}}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0 ml-4">
                         <em class="text-xs text-text-secondary-light dark:text-text-secondary-dark">{{ formatTaskAge(task.created_at) }}</em>
                        <button v-if="task.kanban_status === 'backlog' || task.kanban_status === null" @click="moveToKanban(task)" class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors" title="Envoyer au Kanban"><span class="material-symbols-outlined">rocket_launch</span></button>
                        <button @click="startEditing(task)" class="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors"><span class="material-symbols-outlined">edit</span></button>
                        <button @click="deleteTask(task.id)" class="text-text-secondary-light dark:text-text-secondary-dark hover:text-red-500 transition-colors"><span class="material-symbols-outlined">delete</span></button>
                    </div>
                </div>
            </div>
            <div v-else class="space-y-3">
                 <input type="text" v-model="editTaskTitle" class="w-full rounded-lg border-slate-300 dark:border-slate-600 bg-background-light dark:bg-background-dark px-2 py-1" />
                 <textarea v-model="editTaskComment" placeholder="Commentaire..." rows="2" class="w-full text-sm rounded-lg border-slate-300 dark:border-slate-600 bg-background-light dark:bg-background-dark px-2 py-1"></textarea>
                 <div class="space-y-2">
                    <label class="text-xs">Délai</label>
                    <div class="flex items-center gap-2 p-1 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark">
                        <span class="flex-grow text-xs">{{ editTaskDeadline ? new Date(editTaskDeadline).toLocaleString() : 'Aucun' }}</span>
                        <button type="button" @click="openDeadlinePicker('edit')" class="text-slate-500 hover:text-primary"><span class="material-symbols-outlined text-sm">edit_calendar</span></button>
                        <button v-if="editTaskDeadline" type="button" @click="clearDeadline('edit')" class="text-slate-500 hover:text-red-500"><span class="material-symbols-outlined text-sm">close</span></button>
                    </div>
                 </div>
                 <div class="flex justify-end gap-2">
                    <button @click="cancelEditing()" class="px-3 py-1 text-xs rounded-md">Annuler</button>
                    <button @click="saveTaskChanges()" class="px-3 py-1 text-xs rounded-md bg-primary text-white">Sauvegarder</button>
                 </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-8">
        <h2 class="text-xl font-bold text-center mb-4">Tâches Archivées</h2>
        <div class="bg-white dark:bg-surface-dark rounded-xl shadow-lg p-4">
            <button @click="showCompleted = !showCompleted" class="w-full text-center py-2 font-medium">{{ showCompleted ? 'Masquer' : 'Afficher' }} les archives</button>
            <div v-if="showCompleted && completedTasks.length > 0" class="overflow-x-auto mt-4">
                <table class="w-full text-sm text-left">
                    <thead class="text-xs uppercase bg-background-light dark:bg-background-dark">
                        <tr>
                            <th class="px-6 py-3">Tâche</th>
                            <th class="px-6 py-3">Quadrant d'origine</th>
                            <th class="px-6 py-3">Archivée le</th>
                            <th class="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="task in completedTasks" :key="task.id" class="border-b border-border-light dark:border-border-dark">
                            <td class="px-6 py-4">{{ task.title }}</td>
                            <td class="px-6 py-4">{{ task.archived_from_quadrant }}</td>
                            <td class="px-6 py-4">{{ new Date(task.archived_at).toLocaleDateString() }}</td>
                            <td class="px-6 py-4">
                                <button @click="deleteTask(task.id)" class="text-red-500 hover:text-red-700">
                                    <span class="material-symbols-outlined">delete</span>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <p v-else-if="showCompleted" class="text-center text-text-secondary-light dark:text-text-secondary-dark py-4">Aucune tâche archivée pour le moment.</p>
        </div>
    </div>
  </div>
</template>

