<script setup>
const props = defineProps({
  blog: { type: Object, required: true }
});
</script>

<template>
  <a
      :href="`/startupmistake/${blog.id}`"
      class="group block p-4 rounded-lg bg-gray-200 transform transition duration-300 hover:scale-105"
  >
    <div class="bg-black w-full aspect-video flex items-center justify-center">
      <img
          :src="blog.image"
          :alt="blog.title"
          class="h-68 w-[500px]"
      />
    </div>
    <p class="text-xl text-gray-500 mt-4">{{ blog.date }}</p>
    <h3 class="text-2xl font-bold mt-4 group-hover:underline">{{ blog.title }}</h3>
    <p class="text-gray-600 text-xl mt-4">{{ blog.description }}</p>
  </a>
</template>
