<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from './supabase.js'


const tasks = ref([])
const subTasks = ref([])
const newSubtaskTitles = ref({})
const expandedTaskId = ref(null)
const editingSubtaskId = ref(null)
const editSubtaskTitle = ref('')
const editSubtaskComment = ref('')
const editSubtaskDeadline = ref('')
const showEditComment = ref(false)
const showEditDeadline = ref(false)

async function fetchData() {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) {
    console.error('Erreur récupération utilisateur:', userError)
    return
  }
  if (!userData?.user) {
    tasks.value = []
    subTasks.value = []
    return
  }

  const { data: tasksData, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .in('kanban_status', ['todo', 'inprogress'])
    .eq('isComplete', false)
    .eq('user_id', userData.user.id)

  if (tasksError) {
    console.error('Erreur chargement tâches Kanban:', tasksError)
    tasks.value = []
    subTasks.value = []
    return
  }

  tasks.value = tasksData || []

  const taskIds = tasks.value.map(t => t.id)
  if (taskIds.length > 0) {
    const { data: subTasksData, error: subTasksError } = await supabase
      .from('sub_tasks')
      .select('*')
      .in('task_id', taskIds)

    if (subTasksError) {
      console.error('Erreur chargement sous-tâches:', subTasksError)
      subTasks.value = []
    } else {
      subTasks.value = subTasksData || []
    }
  } else {
    subTasks.value = []
  }
}
onMounted(fetchData)

const activeTasks = computed(() => tasks.value)

function getSubtasksForTask(taskId) {
  return subTasks.value.filter(st => st.task_id === taskId)
}

function getCompletionStats(taskId) {
  const relevantSubtasks = getSubtasksForTask(taskId)
  const total = relevantSubtasks.length
  const completed = relevantSubtasks.filter(st => st.is_complete).length
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)
  return { total, completed, percentage }
}

function getCompletionPercentage(taskId) {
  return getCompletionStats(taskId).percentage
}

function getCompletionLabel(taskId) {
  const { total, completed, percentage } = getCompletionStats(taskId)
  if (total === 0) {
    return 'Aucune étape'
  }
  return `${completed}/${total} — ${percentage}%`
}

async function addSubtask(task) {
  const title = newSubtaskTitles.value[task.id]
  if (!title || title.trim() === '') return;
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase.from('sub_tasks').insert([{ title: title.trim(), task_id: task.id, user_id: user.id }]).select()
  if(error) console.error(error)
  else {
    subTasks.value.push(data[0])
    newSubtaskTitles.value[task.id] = ''
  }
}

async function toggleSubtask(subtask) {
  const { error } = await supabase.from('sub_tasks').update({ is_complete: !subtask.is_complete }).eq('id', subtask.id)
  if(error) {
    console.error(error)
  } else {
    // CORRECTION : On met à jour la propriété de manière robuste pour forcer la réactivité
    const subtaskInList = subTasks.value.find(st => st.id === subtask.id);
    if (subtaskInList) {
      subtaskInList.is_complete = !subtaskInList.is_complete;
    }
  }
}

async function deleteSubtask(subtask) {
  const { error } = await supabase.from('sub_tasks').delete().eq('id', subtask.id)
  if (error) {
    console.error('Erreur suppression sous-tâche :', error)
  } else {
    subTasks.value = subTasks.value.filter(st => st.id !== subtask.id)
  }
}

async function markTaskAsComplete(task) {
  if (!confirm("Voulez-vous marquer cette tâche comme terminée et l'archiver ? Elle disparaîtra également de la Matrice.")) return
  const { error } = await supabase.from('tasks').update({ isComplete: true, kanban_status: 'archived', archived_at: new Date() }).eq('id', task.id)
  if(error) console.error(error)
  else tasks.value = tasks.value.filter(t => t.id !== task.id)
}

function toggleExpand(taskId) {
  expandedTaskId.value = expandedTaskId.value === taskId ? null : taskId;
}

function startEditingSubtask(subtask) {
    editingSubtaskId.value = subtask.id;
    editSubtaskTitle.value = subtask.title;
    editSubtaskComment.value = subtask.comment || '';
    editSubtaskDeadline.value = formatDateTimeForInput(subtask.deadline);
    showEditComment.value = !!subtask.comment;
    showEditDeadline.value = !!subtask.deadline;
}

function cancelEditingSubtask() {
    editingSubtaskId.value = null;
    editSubtaskTitle.value = '';
    editSubtaskComment.value = '';
    editSubtaskDeadline.value = '';
    showEditComment.value = false;
    showEditDeadline.value = false;
}

async function saveSubtaskChanges() {
    if(!editingSubtaskId.value) return;
    const deadline = editSubtaskDeadline.value ? new Date(editSubtaskDeadline.value).toISOString() : null;
    const { error } = await supabase
        .from('sub_tasks')
        .update({
            title: editSubtaskTitle.value,
            comment: editSubtaskComment.value,
            deadline: deadline
        })
        .eq('id', editingSubtaskId.value);
    if (error) {
        console.error("Erreur de sauvegarde de la sous-tâche:", error);
    } else {
        const subtask = subTasks.value.find(st => st.id === editingSubtaskId.value);
        if (subtask) {
            subtask.title = editSubtaskTitle.value;
            subtask.comment = editSubtaskComment.value;
            subtask.deadline = deadline;
        }
    }
    cancelEditingSubtask();
}

function formatDateTimeForInput(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - timezoneOffset);
  return localDate.toISOString().slice(0, 16);
}

</script>
<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col">
    <h1 class="text-3xl font-bold text-center mb-8">Suivi de Projets</h1>
    <div class="bg-white dark:bg-surface-dark rounded-xl shadow-md p-4 flex flex-col flex-grow">
      <h2 class="text-lg font-bold text-center mb-4">Projets Actifs</h2>
      <div class="space-y-3 overflow-y-auto flex-grow p-1">
        <div v-for="task in activeTasks" :key="task.id" class="p-4 rounded-lg bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark">
          <h4 @click="toggleExpand(task.id)" class="font-bold cursor-pointer text-lg">{{ task.title }}</h4>
          <p v-if="task.comment" class="text-sm text-text-secondary-light dark:text-text-secondary-dark italic my-2">{{ task.comment }}</p>
          <div class="flex items-center justify-between text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
            <span>{{ getCompletionLabel(task.id) }}</span>
            <span v-if="getCompletionPercentage(task.id) === 100 && getCompletionStats(task.id).total > 0" class="text-green-600 font-semibold">Terminé</span>
          </div>
          <div class="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full mt-1">
            <div class="h-1.5 bg-primary rounded-full transition-all" :style="{ width: getCompletionPercentage(task.id) + '%' }"></div>
          </div>

          <div v-if="expandedTaskId === task.id" class="mt-4 space-y-2">
            <div v-for="st in getSubtasksForTask(task.id)" :key="st.id" class="ml-4 p-2 rounded-md bg-white dark:bg-surface-dark border-l-4 border-primary/50">
                <div v-if="editingSubtaskId !== st.id">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <input type="checkbox" :checked="st.is_complete" @change="toggleSubtask(st)" class="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary">
                            <span :class="{ 'line-through text-text-secondary-light dark:text-text-secondary-dark': st.is_complete }" class="ml-2 text-sm font-medium">{{ st.title }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <button @click="startEditingSubtask(st)" class="text-slate-400 hover:text-primary text-sm"><span class="material-symbols-outlined">edit</span></button>
                          <button
                            @click="confirm('Supprimer cette étape ?') && deleteSubtask(st)"
                            class="text-slate-400 hover:text-red-500 text-sm"
                            title="Supprimer l'étape"
                          >
                            <span class="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                    </div>
                     <p v-if="st.comment" class="text-xs text-text-secondary-light dark:text-text-secondary-dark italic mt-1 ml-6">{{ st.comment }}</p>
                     <p v-if="st.deadline" class="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 ml-6">Délai: {{ new Date(st.deadline).toLocaleDateString() }}</p>
                </div>
                <div v-else class="space-y-2">
                    <input v-model="editSubtaskTitle" type="text" class="w-full text-sm rounded-md p-1 border border-primary" />
                    <div v-if="showEditComment">
                      <textarea v-model="editSubtaskComment" placeholder="Commentaire..." class="w-full text-xs rounded-md p-1 border"></textarea>
                    </div>
                    <button v-else @click="showEditComment = true" class="text-xs text-left text-primary hover:underline">+ Ajouter un commentaire</button>
                    <div v-if="showEditDeadline">
                      <input v-model="editSubtaskDeadline" type="datetime-local" class="w-full text-xs rounded-md p-1 border" />
                    </div>
                    <button v-else @click="showEditDeadline = true" class="text-xs text-left text-primary hover:underline">+ Ajouter un délai</button>
                    <div class="flex justify-end gap-2 mt-2">
                        <button @click="cancelEditingSubtask" class="text-xs px-2 py-1">Annuler</button>
                        <button @click="saveSubtaskChanges" class="text-xs px-2 py-1 bg-primary text-white rounded-md">OK</button>
                    </div>
                </div>
            </div>
            <form @submit.prevent="addSubtask(task)" class="ml-4">
              <input type="text" v-model="newSubtaskTitles[task.id]" placeholder="+ Ajouter une étape" class="w-full text-sm bg-transparent focus:outline-none border-b border-border-light dark:border-border-dark py-1">
            </form>
          </div>
          <!-- MODIFICATION : Bouton toujours visible -->
          <button class="w-full text-sm mt-4 bg-green-500/10 text-green-600 hover:bg-green-500/20 py-2 rounded-md font-semibold" @click="markTaskAsComplete(task)">Marquer comme terminé & Archiver</button>
        </div>
      </div>
    </div>
  </div>
</template>