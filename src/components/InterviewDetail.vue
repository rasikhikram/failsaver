<script setup>
const props = defineProps({
  post: { type: Object, required: true }
});
</script>

<template>
  <div class="max-w-7xl mx-auto m-6 font-sans">
    <!-- Header Section -->
    <div
        :class="[
        'px-6 py-10 rounded-md',
        post.status === 'success' ? 'bg-green-100' : 'bg-red-100'
      ]"
    >
      <p
          :class="[
          'font-bold text-2xl mb-2',
          post.status === 'success' ? 'text-green-600' : 'text-red-600'
        ]"
      >
        Interview with a {{ post.status === 'success' ? 'Successful' : 'Failed' }} Startup Founder
      </p>
      <h1 class="text-5xl font-extrabold mb-6 leading-snug">
        {{ post.title }}
      </h1>

      <!-- Author Info -->
      <div class="flex items-center gap-3">
        <img :src="post.avatar" alt="avatar" class="w-18 h-18 rounded-full" />
        <div>
          <p class="font-bold text-3xl">{{ post.author }}</p>
          <p class="text-gray-600 text-xl">{{ post.date }}</p>
        </div>
      </div>
    </div>

    <!-- Tags Section -->
    <div class="flex flex-wrap gap-2 lg:mt-6">
      <div
          v-for="tag in post.tags"
          :key="tag"
          class="flex-1 text-center border-4 border-black rounded-xl py-3 font-semibold text-2xl"
      >
        {{ tag }}
      </div>
    </div>

    <!-- Content -->
    <div class="lg:mt-16 mt-4 prose max-w-none">
      <div v-html="post.content" class="post-content text-2xl"></div>
    </div>
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
  display: inline; /* paragraph ko inline treat karega */
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

