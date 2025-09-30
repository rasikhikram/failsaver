<script setup>
import { ref, onMounted } from "vue";
import { supabase } from "../lib/supabase.js";
import BlogsCard from "./BlogsCard.vue";

const props = defineProps({
  excludeId: { type: Number, required: false }
});

const posts = ref([]);
const visibleCount = ref(3);

async function fetchPosts() {
  let query = supabase
      .from("blogs")
      .select("*")
      .order("id", { ascending: false });

  // Exclude the current blog if excludeId is provided
  if (props.excludeId) {
    query = query.neq("id", props.excludeId);
  }

  const { data, error } = await query;

  if (!error) posts.value = data;
}

function showMore() {
  visibleCount.value += 3;
}

onMounted(fetchPosts);
</script>

<template>
  <div class="max-w-7xl mx-auto flex flex-col justify-center items-center border-t border-gray-300 pt-8 w-full">
    <h2 class="text-6xl font-extrabold mb-10">More Blogs</h2>

    <div class="grid gap-8 md:grid-cols-3 w-full max-w-7xl">
      <BlogsCard
          v-for="post in posts.slice(0, visibleCount)"
          :key="post.id"
          :blog="post"
      />
    </div>

    <button
        v-if="posts.length > visibleCount"
        @click="showMore"
        class="mt-12 px-6 py-3 bg-black text-white text-xl font-semibold rounded-lg hover:bg-gray-800 transition"
    >
      Show More
    </button>
  </div>
</template>