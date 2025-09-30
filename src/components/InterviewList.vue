<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  interviews: { type: [Array, String], required: true }
});

const filter = ref("all");
const searchQuery = ref("");

const selectedCategory = ref("all");
const selectedCountry = ref("all");
const selectedRevenue = ref("all");


const interviewData = computed(() =>
    typeof props.interviews === "string"
        ? JSON.parse(props.interviews)
        : props.interviews
);

const uniqueTags = computed(() => {
  const tags = interviewData.value.flatMap(item => item.tags || []);
  return [...new Set(tags)];
});

const filteredInterviews = computed(() => {
  let data = interviewData.value;

  // Filter by status
  if (filter.value !== "all") {
    data = data.filter(item => item.status === filter.value);
  }

  // Filter by search
  if (searchQuery.value.trim() !== "") {
    const q = searchQuery.value.toLowerCase();
    data = data.filter(
        item =>
            item.title.toLowerCase().includes(q) ||
            item.author.toLowerCase().includes(q) ||
            item.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }

  // Filter by category
  if (selectedCategory.value !== "all") {
    data = data.filter(item => item.tags.includes(selectedCategory.value));
  }

  // Filter by country
  if (selectedCountry.value !== "all") {
    data = data.filter(item => item.tags.includes(selectedCountry.value));
  }

  // Filter by revenue
  if (selectedRevenue.value !== "all") {
    data = data.filter(item => item.tags.includes(selectedRevenue.value));
  }

  return data;
});

const getStatusIcon = status => {
  return status === "success" ? "✅" : "❌";
};
</script>

<template>
  <div class="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 p-6 font-sans">
    <!-- Left Sidebar -->
    <div class="w-full lg:w-80 flex flex-col gap-4">
      <button @click="filter = 'all'"
              class="border-2 border-black rounded-lg px-4 py-4 font-bold text-xl cursor-pointer">
        All Interviews
      </button>
      <button @click="filter = 'success'"
              class="border-2 border-green-500 bg-green-100 text-black rounded-lg px-4 py-4 font-bold text-xl cursor-pointer">
        Successful startup
      </button>
      <button @click="filter = 'failed'"
              class="border-2 border-red-500 bg-red-100 text-black rounded-lg px-4 py-4 font-bold text-xl cursor-pointer">
        Failed startup
      </button>

      <hr class="my-2" />

      <input
          v-model="searchQuery"
          type="text"
          placeholder="Search"
          class="border-2 border-gray-300 rounded-lg px-4 py-3 text-lg"
      />

      <select
          v-model="selectedCategory"
          class="border-2 border-gray-300 rounded-lg px-4 py-3 text-lg font-bold">
        <option value="all">Category</option>
        <option>Finances</option>
        <option>Travel</option>
      </select>

      <select
          v-model="selectedCountry"
          class="border-2 border-gray-300 rounded-lg px-4 py-3 text-lg font-bold">
        <option value="all">Country</option>
        <option>Germany</option>
        <option>Spain</option>
        <option>United States</option>
      </select>

      <select
          v-model="selectedRevenue"
          class="border-2 border-gray-300 rounded-lg px-4 py-3 text-lg font-bold">
        <option value="all">Revenue (✓)</option>
        <option>$0-$10k/mo</option>
      </select>
    </div>

    <!-- Right Content -->
    <div class="flex flex-col gap-4 flex-1">
      <a v-for="(item, index) in filteredInterviews" :key="index" :href="`/interviewdetail/${item.id}`"
           class="border-3 border-black rounded-lg p-6 flex flex-col gap-4 transform transition duration-300 hover:scale-105"
      >
        <h2 class="font-bold text-2xl">{{ item.title }}</h2>
        <div class="flex gap-2 flex-wrap">
          <span class="mt-1 w-8 h-8">{{ getStatusIcon(item.status) }}</span>
          <span v-for="(tag, i) in item.tags" :key="i"
                class="bg-gray-200 px-5 py-1 rounded-full text-lg">
            {{ tag }}
          </span>
        </div>
        <div class="flex items-center gap-3 mt-2">
          <img :src="item.avatar" alt="avatar" class="w-10 h-10 rounded-full" />
          <div>
            <p class="font-bold text-2xl">{{ item.author }}</p>
            <p class="text-lg text-gray-500">{{ item.date }}</p>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

