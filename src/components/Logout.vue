<script setup>
import { ref } from "vue"
import { signOut } from "../lib/supabase"

const showToast = ref(false)

async function handleLogout() {
  await signOut()
  showToast.value = true

  setTimeout(() => {
    showToast.value = false

  }, 3000)
}
</script>

<template>
  <div class="flex flex-col space-y-8">
    <h1 class="text-center text-6xl font-extrabold">Want to Logout ?</h1>
    <button
        class="bg-black text-white font-semibold py-2 px-16 rounded-md hover:bg-gray-900 transition text-xl font-bold"
        @click="handleLogout"
    >
      Logout
    </button>

    <!-- Toast -->
    <transition name="slide-fade">
      <div
          v-if="showToast"
          class="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg text-lg font-semibold"
      >
        ✅ Sign Out Successfully
      </div>
    </transition>
  </div>
</template>

<style>
/* Scoped hata diya taki transition chale */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
