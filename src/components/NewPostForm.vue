<script setup>
import { ref, onBeforeUnmount } from "vue"
import { Editor, EditorContent } from "@tiptap/vue-3"
import StarterKit from "@tiptap/starter-kit"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY
)

// Toast state
const toast = ref({ show: false, message: "", type: "success" })
const showToast = (message, type = "success") => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000) // 3 sec me auto hide
}

// Editor
const editor = new Editor({
  extensions: [StarterKit],
  content: "<p>Tell your story...</p>",
})

onBeforeUnmount(() => {
  editor.destroy()
})

// Form fields
const title = ref("")
const tags = ref("")
const author = ref("")
const date = ref("")
const avatar = ref("")
const status = ref("success")

const submitBlog = async () => {
  const { error } = await supabase.from("posts").insert([
    {
      status: status.value,
      title: title.value,
      tags: tags.value ? tags.value.split(",").map((t) => t.trim()) : [],
      author: author.value,
      date: date.value,
      avatar: avatar.value,
      content: editor.getHTML(),
    },
  ])

  if (error) {
    showToast("❌ Failed to publish blog!", "error")
  } else {
    showToast("✅ Blog published successfully!", "success")
    title.value = ""
    tags.value = ""
    author.value = ""
    date.value = ""
    avatar.value = ""
    editor.commands.setContent("<p>Tell your story...</p>")
  }
}
</script>


<template>
  <div class="max-w-3xl mx-auto py-8 px-3 space-y-6">
    <h1 class="flex items-center justify-center text-3xl lg:text-6xl font-extrabold mb-12">
      Add New Posts
    </h1>
    <!-- Title -->
    <input
        v-model="title"
        type="text"
        placeholder="Title"
        class="w-full text-2xl md:text-4xl font-bold border-0 border-b border-gray-300 focus:ring-0 outline-none"
    />

    <!-- Status Dropdown -->
    <select
        v-model="status"
        class="w-full border-b border-gray-300 py-2 text-lg md:text-2xl font-bold text-gray-500"
    >
      <option value="success">Success</option>
      <option value="failed">Failed</option>
    </select>

    <!-- Tags -->
    <input
        v-model="tags"
        type="text"
        placeholder="Tags (comma separated)"
        class="w-full text-base md:text-xl text-gray-500 font-semibold border-0 border-b border-gray-200 focus:ring-0 outline-none"
    />

    <!-- Toolbar -->
    <div
        class="flex flex-wrap gap-2 border border-gray-200 p-3 rounded-lg bg-gray-50 text-sm md:text-base shadow-sm"
    >
      <button
          @click="editor.chain().focus().toggleBold().run()"
          class="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-black hover:text-white transition-all duration-200 font-bold"
      >
        B
      </button>

      <button
          @click="editor.chain().focus().toggleItalic().run()"
          class="px-3 py-1.5 rounded-lg border border-gray-300 bg-white italic hover:bg-black hover:text-white transition-all duration-200"
      >
        i
      </button>

      <button
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          class="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-black hover:text-white transition-all duration-200 font-semibold"
      >
        H2
      </button>

      <button
          @click="editor.chain().focus().toggleBulletList().run()"
          class="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-black hover:text-white transition-all duration-200"
      >
        •
      </button>

      <button
          @click="editor.chain().focus().toggleOrderedList().run()"
          class="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-black hover:text-white transition-all duration-200"
      >
        1.
      </button>

      <button
          @click="editor.chain().focus().toggleBlockquote().run()"
          class="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-black hover:text-white transition-all duration-200"
      >
        ❝
      </button>

      <button
          @click="editor.chain().focus().toggleCodeBlock().run()"
          class="px-3 py-1.5 rounded-lg border border-gray-300 bg-white font-mono hover:bg-black hover:text-white transition-all duration-200"
      >
        &lt;/&gt;
      </button>
    </div>




    <!-- Editor -->
    <div
        class="prose max-w-none border border-gray-200 p-3 md:p-4 rounded-md min-h-[200px] md:min-h-[250px] text-base md:text-lg"
    >
      <EditorContent :editor="editor" />
    </div>

    <!-- Footer -->
    <div
        class="flex flex-col md:flex-row w-full items-center md:justify-between md:space-x-4 space-y-3 md:space-y-0 p-3 md:p-4 text-base md:text-xl border-y border-gray-200"
    >
      <input
          v-model="author"
          type="text"
          placeholder="Author"
          class="w-full md:flex-1 border px-3 py-2 rounded"
      />
      <input
          v-model="date"
          type="date"
          class="w-full md:flex-1 border px-3 py-2 rounded"
      />
      <input
          v-model="avatar"
          type="url"
          placeholder="Avatar URL"
          class="w-full md:flex-1 border px-3 py-2 rounded"
      />
    </div>

    <!-- Publish Button -->
    <div class="flex justify-end">
      <button
          @click="submitBlog"
          class="px-6 md:px-8 py-2 md:py-3 rounded-full text-lg md:text-xl font-bold bg-black text-white"
      >
        Publish
      </button>
    </div>
  </div>

  <!-- ✅ Toast -->
  <transition name="fade">
    <div
        v-if="toast.show"
        :class="[
        'fixed bottom-5 right-5 px-5 py-3 rounded-lg shadow-lg text-white font-semibold',
        toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
      ]"
    >
      {{ toast.message }}
    </div>
  </transition>
</template>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>

