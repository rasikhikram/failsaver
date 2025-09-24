<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../lib/supabase.js";
import BlogsCard from "./BlogsCard.vue";

const posts = ref([]);
const visibleCount = ref(3);

async function fetchPosts() {
  const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("id", { ascending: true });

  if (!error) posts.value = data;
}

function showMore() {
  visibleCount.value += 3;
}

onMounted(fetchPosts);
</script>

<template>
  <div class="flex flex-col justify-center items-center mt-16 border-t border-gray-300 pt-8 w-full">
    <h2 class="text-6xl font-extrabold mb-10">More Blogs</h2>

    <div class="grid gap-8 md:grid-cols-3 w-full max-w-7xl">
      <BlogsCard
          v-for="post in posts.slice(0, visibleCount)"
          :key="post.id"
          :blog="post"
      />
    </div>

    <button
        v-if="posts.length > 0"
        @click="showMore"
        class="mt-12 px-6 py-3 bg-black text-white text-xl font-semibold rounded-lg hover:bg-gray-800 transition"
    >
      Show More
    </button>
  </div>
</template>
