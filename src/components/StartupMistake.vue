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
    <div class="lg:mt-16 mt-4 prose max-w-none">
      <div v-html="blog.content" class="post-content text-2xl"></div>
    </div>
  </article>

  <!-- More Posts Section -->
  <div class="my-10">
    <MorePosts />
  </div>
</template>

<style>
.post-content blockquote {
  font-style: italic;
  font-weight: 500;
  margin: 1em 0;
  quotes: "“" "”" "‘" "’";
  position: relative;
  display: block;
}

.post-content blockquote p {
  display: inline;
}

.post-content blockquote::before {
  content: open-quote;
}

.post-content blockquote::after {
  content: close-quote;
}
.post-content img {
  max-width: 700px;
  height: auto;
  border-radius: 8px;
  margin: 1.5em 0;
  justify-self: center;
}
</style>