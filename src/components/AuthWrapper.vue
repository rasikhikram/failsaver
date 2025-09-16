<script setup>
import { ref, onMounted } from "vue"
import { supabase } from "../lib/supabase"

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'


const isLoggedIn = ref(false)

async function checkUser() {
  const { data } = await supabase.auth.getUser()
  isLoggedIn.value = !!data?.user
}

onMounted(checkUser)
supabase.auth.onAuthStateChange((_event, session) => {
  isLoggedIn.value = !!session?.user
})
</script>

<template>
  <div class="flex items-center gap-4">
    <template v-if="isLoggedIn">
      <a href="/newpost" class="px-3 py-1">New Post</a>
      <a href="/auth">
        <FontAwesomeIcon :icon="faUser" class="lg:mr-10"/>
      </a>
    </template>
    <template v-else>
      <a href="/auth">
        <FontAwesomeIcon :icon="faUser" class="lg:mr-10"/>
      </a>
    </template>
  </div>
</template>