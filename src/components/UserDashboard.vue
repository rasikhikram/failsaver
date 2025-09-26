<script setup>
import { ref, onMounted } from 'vue'
import { getUserProfile, isAdmin } from '../lib/supabase'
import NewBlogForm from './NewBlogForm.vue'

const props = defineProps({
  user: Object
})

const userRole = ref('')
const isUserAdmin = ref(false)
const loading = ref(true)

// Initialize user data
onMounted(async () => {
  if (props.user) {
    const { data: profile } = await getUserProfile()
    userRole.value = profile?.role || 'user'
    isUserAdmin.value = await isAdmin()
  }
  loading.value = false
})
</script>

<template>
  <div class="w-full max-w-7xl mx-auto p-6">
    <div v-if="loading" class="text-center py-8">
      <div class="text-3xl font-bold">Loading your dashboard...</div>
    </div>

    <div v-else>
      <!-- User Welcome Section -->
      <div class="w-full flex flex-col items-center justify-center text-center space-y-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl mb-8">
        <h1 class="text-6xl font-extrabold">Welcome to FailSaver!</h1>
        <p class="text-xl text-gray-700">
          Logged in as: <span class="font-semibold">{{ props.user?.email }}</span>
        </p>
        <div class="flex items-center gap-2">
          <span class="text-gray-600 font-bold text-2xl">Role:</span>
          <span :class="[ 'px-3 py-1 rounded-full text-xl font-bold',
            isUserAdmin ? 'bg-purple-200 text-purple-800' : 'bg-green-200 text-green-800'
          ]">
            {{ isUserAdmin ? '👑 Admin' : '👤 User' }}
          </span>
        </div>
      </div>

      <!-- Blog Form (Admin only) -->
      <div v-if="isUserAdmin">
        <NewBlogForm />
      </div>

      <!-- Regular User Message -->
      <div v-else class="text-center p-8">
        <h2 class="text-2xl font-bold text-gray-700 mb-4">User Dashboard</h2>
        <p class="text-gray-600">
          As a regular user, you can add interview experiences. Blog creation is restricted to administrators.
        </p>
      </div>
    </div>
  </div>
</template>