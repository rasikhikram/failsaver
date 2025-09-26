<script setup>
import { ref, onMounted } from "vue"
import { supabase } from "../lib/supabase"
import Logout from "./Logout.vue"
import UserDashboard from "./UserDashboard.vue"

// Toast logic
const toast = ref({ show: false, message: "", type: "success" })
const showToast = (message, type = "success") => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

const email = ref("")
const password = ref("")
const error = ref("")
const loading = ref(false)
const isLoggedIn = ref(false)
const currentUser = ref(null) // Add this line

// Check login status on mount
async function checkUser() {
  const { data } = await supabase.auth.getUser()
  isLoggedIn.value = !!data?.user
  currentUser.value = data?.user // Add this line
}

onMounted(checkUser)

supabase.auth.onAuthStateChange((_event, session) => {
  isLoggedIn.value = !!session?.user
  currentUser.value = session?.user // Add this line
})

// Your existing handleSubmit function stays the same
async function handleSubmit() {
  error.value = ""
  loading.value = true

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  if (signInError) {
    // Try sign up
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value
    })
    if (signUpError) {
      error.value = signUpError.message
      showToast(`❌ ${signUpError.message}`, "error")
      loading.value = false
      return
    }
    // After sign up, sign in
    const { error: signInErrorAgain } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })
    if (signInErrorAgain) {
      error.value = signInErrorAgain.message
      showToast(`❌ ${signInErrorAgain.message}`, "error")
      loading.value = false
      return
    }
    error.value = ""
    showToast("✅ Signed up & logged in successfully!", "success")
    loading.value = false
  } else {
    error.value = ""
    showToast("✅ Signed in successfully!", "success")
    loading.value = false
  }
}

// Logout function
async function logout() {
  await supabase.auth.signOut()
  showToast("ℹ️ Logged out!", "success")
  // Login status will update automatically due to onAuthStateChange
}
</script>

<template>
  <div>
    <template v-if="!isLoggedIn">
      <!-- Your existing sign in form stays exactly the same -->
      <form
          @submit.prevent="handleSubmit"
          class="max-w-7xl mx-auto flex flex-col items-center justify-center space-y-6">
        <h1 class="text-6xl font-extrabold">Sign In</h1>
        <input
            class="w-88 text-center text-xl font-semibold border-3 p-1 border-gray-500 rounded-md border border-gray-300 focus:outline-none placeholder:text-gray-500"
            v-model="email"
            type="email"
            placeholder="Email"
            required
        />
        <input
            class="w-88 text-center text-xl font-semibold border-3 p-1 border-gray-500 rounded-md border border-gray-300 focus:outline-none placeholder:text-gray-500"
            v-model="password"
            type="password"
            placeholder="Password"
            required
        />
        <button :disabled="loading" type="submit" class="w-56 bg-black text-white text-xl font-bold px-4 py-2 rounded-md">
          {{ loading ? "Processing..." : "Sign In" }}
        </button>
        <div v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</div>
      </form>
    </template>

    <template v-else>
      <!-- Replace Logout with UserDashboard + Logout -->
      <UserDashboard :user="currentUser" />
      <div class="text-center mt-8">
        <Logout/>
      </div>
    </template>

    <!-- Your existing toast notification stays the same -->
    <transition name="fade">
      <div
          v-if="toast.show"
          :class="[
          'fixed bottom-5 right-5 px-5 py-3 rounded-lg shadow-lg text-white font-semibold z-50',
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        ]"
      >
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>