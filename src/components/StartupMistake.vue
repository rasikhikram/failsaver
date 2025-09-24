<script setup>
import MorePosts from "./MorePosts.vue";

const props = defineProps({
  blog: { type: Object, required: true }
});
</script>

<template>
  <article class="max-w-7xl md:max-w-7xl mx-auto flex flex-col justify-center items-center py-12 space-y-8 px-4">
    <!-- Title + meta -->
    <h1 class="text-5xl md:text-6xl text-center font-extrabold mb-2 text-gray-900">
      {{ blog.title }}
    </h1>
    <div class="text-gray-600 font-semibold text-md md:text-xl mt-4">
      <span>By {{ blog.author || 'Unknown' }}</span>
      <span class="mx-2">|</span>
      <span>{{ new Date(blog.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
    </div>

    <!-- Hero Image -->
    <div v-if="blog.image" class="mb-10">
      <img
          :src="blog.image"
          :alt="blog.title"
          class="w-[700px] justify-self-center h-auto object-cover rounded-2xl"
      />
    </div>

    <!-- Main Content -->
    <div class="prose prose-lg prose-gray mx-auto">
      <div v-html="blog.content"></div>
    </div>
  </article>

  <!-- More Posts Section -->
  <div class="my-10">
    <MorePosts />
  </div>
</template>
