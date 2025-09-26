<script setup>
import MorePosts from "./MorePosts.vue";

const props = defineProps({
  blog: { type: Object, required: true }
});
</script>

<template>
  <article class="max-w-7xl md:max-w-7xl mx-auto flex flex-col justify-center items-center py-12 space-y-8 px-4">
    <!-- Title -->
    <h1 class="text-5xl md:text-6xl text-center font-extrabold mb-6 text-gray-900">
      {{ blog.title }}
    </h1>

    <!-- Author section with avatar (like Failory) -->
    <div class="flex items-center justify-center space-x-4 mb-8">
      <!-- Avatar -->
      <img
          v-if="blog.avatar"
          :src="blog.avatar"
          :alt="blog.author + ' avatar'"
          class="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
      />
      <!-- Default avatar if no image -->
      <div
          v-else
          class="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center border-2 border-gray-200"
      >
        <span class="text-gray-600 font-bold text-lg">
          {{ (blog.author || 'A').charAt(0).toUpperCase() }}
        </span>
      </div>

      <!-- Author info -->
      <div class="text-left">
        <div class="text-2xl font-bold text-gray-900">
          {{ blog.author || 'Unknown Author' }}
        </div>
        <div class="text-gray-600 text-xl">
          {{ new Date(blog.date).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) }}
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="prose prose-lg prose-gray max-w-4xl mx-auto">
      <div v-html="blog.content"></div>
    </div>
  </article>

  <!-- More Posts Section -->
  <div class="my-10">
    <MorePosts />
  </div>
</template>

<style lang="postcss">
/* Enhanced prose styles for better blog reading */
.prose {
  @apply text-gray-800 leading-relaxed;
}

.prose h1, .prose h2, .prose h3 {
  @apply text-gray-900 font-bold;
}

.prose h1 {
  @apply text-4xl mb-6 mt-8;
}

.prose h2 {
  @apply text-3xl mb-4 mt-8;
}

.prose h3 {
  @apply text-2xl mb-3 mt-6;
}

.prose p {
  @apply mb-6 text-lg leading-relaxed;
}

.prose blockquote {
  @apply border-l-4 border-gray-300 pl-6 italic text-gray-700 my-6;
}

.prose img {
  @apply rounded-lg shadow-lg my-8 mx-auto;
}

.prose ul, .prose ol {
  @apply mb-6 pl-6;
}

.prose li {
  @apply mb-2;
}

.prose a {
  @apply text-blue-600 hover:text-blue-800 underline;
}

.prose code {
  @apply bg-gray-100 px-2 py-1 rounded text-sm font-mono;
}

.prose pre {
  @apply bg-gray-900 text-white p-4 rounded-lg overflow-x-auto my-6;
}
</style>