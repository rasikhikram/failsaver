<script setup>
import { ref, onBeforeUnmount, onMounted } from "vue"
import { Editor, EditorContent } from "@tiptap/vue-3"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import { createClient } from "@supabase/supabase-js"

import { Bold, Italic, Heading2, Image as ImageIcon, List } from "lucide-vue-next"

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
  }, 3000)
}

// Popup state
const showPopup = ref(false)
const popupRef = ref(null)
const buttonRef = ref(null)
const plusButtonStyle = ref({ top: "0px" })

// Editor
const editor = ref(null)

function updatePlusButton() {
  if (!editor.value) return
  const { from } = editor.value.state.selection
  const coords = editor.value.view.coordsAtPos(from)
  const editorBox = editor.value.view.dom.getBoundingClientRect()
  plusButtonStyle.value = {
    top: coords.top - editorBox.top + "px",
  }
}

// ✅ close popup if clicked outside
function handleClickOutside(e) {
  if (
      showPopup.value &&
      popupRef.value &&
      !popupRef.value.contains(e.target) &&
      buttonRef.value &&
      !buttonRef.value.contains(e.target)
  ) {
    showPopup.value = false
  }
}

onMounted(() => {
  editor.value = new Editor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({
        placeholder: "Tell your story...",
      }),
    ],
    content: "",
    onUpdate: updatePlusButton,
    onSelectionUpdate: updatePlusButton,
  })
  updatePlusButton()

  document.addEventListener("click", handleClickOutside)
})

onBeforeUnmount(() => {
  if (editor.value) editor.value.destroy()
  document.removeEventListener("click", handleClickOutside)
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
      content: editor.value.getHTML(),
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
    editor.value.commands.setContent("<p></p>")
  }
}

// ✅ Image upload handler
const fileInput = ref(null)

const triggerFileUpload = () => {
  fileInput.value.click()
}

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`

  // ✅ Upload avatar to avatars bucket
  const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true })

  if (uploadError) {
    showToast("❌ Failed to upload avatar!", "error")
    return
  }

  // ✅ get public URL
  const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName)

  avatar.value = publicUrlData.publicUrl
  showToast("✅ Avatar uploaded!", "success")
}


const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`

  const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, file, { upsert: true })

  if (uploadError) {
    showToast("❌ Failed to upload image!", "error")
    return
  }

  // ✅ get public URL
  const { data: publicUrlData } = supabase.storage
      .from("images")
      .getPublicUrl(fileName)

  const imageUrl = publicUrlData.publicUrl

  // Insert image into editor
  editor.value
      .chain()
      .focus()
      .setImage({ src: imageUrl })
      .run()
  showPopup.value = false
}

// ✅ Formatting helpers
const toggleQuote = () => {
  if (editor.value) {
    editor.value.chain().focus().toggleBlockquote().run()
    showPopup.value = false
  }
}
const toggleBold = () => {
  if (editor.value) {
    editor.value.chain().focus().toggleBold().run()
    showPopup.value = false
  }
}
const toggleItalic = () => {
  if (editor.value) {
    editor.value.chain().focus().toggleItalic().run()
    showPopup.value = false
  }
}
const toggleHeading2 = () => {
  if (editor.value) {
    editor.value.chain().focus().toggleHeading({ level: 2 }).run()
    showPopup.value = false
  }
}
const toggleBulletList = () => {
  if (editor.value) {
    editor.value.chain().focus().toggleBulletList().run()
    showPopup.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto py-8 px-3 space-y-6">
    <h1
        class="flex items-center justify-center text-3xl lg:text-6xl font-extrabold mb-12"
    >
      Add New Post
    </h1>

    <!-- Title -->
    <input
        v-model="title"
        type="text"
        placeholder="Title"
        class="w-full text-2xl md:text-3xl font-bold py-2 focus:ring-0 outline-none border-b border-gray-300"
    />

    <!-- Status Dropdown -->
    <select
        v-model="status"
        class="w-full py-2 text-lg md:text-2xl font-bold text-gray-500 border-b border-gray-300"
    >
      <option value="success">Status</option>
      <option value="success">Success</option>
      <option value="failed">Failed</option>
    </select>

    <!-- Tags -->
    <input
        v-model="tags"
        type="text"
        placeholder="Tags (comma separated)"
        class="w-full text-base md:text-xl placeholder:text-gray-500 py-2 font-semibold border-0 focus:ring-0 outline-none border-b border-gray-300"
    />

    <!-- Editor with custom + button -->
    <div class="relative">
      <!-- + Button -->
      <button
          ref="buttonRef"
          @click="showPopup = !showPopup"
          class="absolute -left-14 w-10 h-10 rounded-full bg-gradient-to-br from-black to-gray-700
         text-white shadow-lg hover:scale-110 hover:shadow-xl hover:from-gray-800 hover:to-black
          flex items-center justify-center text-2xl font-bold"
          :style="plusButtonStyle"
      >
        +
      </button>

      <!-- Popup menu -->
      <div
          v-if="showPopup"
          ref="popupRef"
          class="absolute -left-72 flex items-center gap-2 bg-white/90 backdrop-blur-md border shadow-xl rounded-full px-3 py-1 z-50 transition-all"
          :style="plusButtonStyle"
      >
        <button
            @click="toggleBold"
            :class="[
            'w-8 h-8 flex items-center justify-center rounded-full transition',
            editor?.isActive('bold') ? 'bg-black text-white' : 'hover:bg-gray-200'
          ]"
        >
          <Bold class="w-4 h-4" />
        </button>

        <button
            @click="toggleItalic"
            :class="[
            'w-8 h-8 flex items-center justify-center rounded-full transition',
            editor?.isActive('italic') ? 'bg-black text-white' : 'hover:bg-gray-200'
          ]"
        >
          <Italic class="w-4 h-4" />
        </button>

        <button
            @click="toggleHeading2"
            :class="[
            'w-8 h-8 flex items-center justify-center rounded-full transition',
            editor?.isActive('heading', { level: 2 }) ? 'bg-black text-white' : 'hover:bg-gray-200'
          ]"
        >
          <Heading2 class="w-4 h-4" />
        </button>

        <button
            @click="toggleQuote"
            :class="[
            'w-8 h-8 flex items-center justify-center rounded-full transition',
            editor?.isActive('blockquote') ? 'bg-black text-white' : 'hover:bg-gray-200'
          ]"
        >
          “”
        </button>

        <button
            @click="toggleBulletList"
            :class="[
            'w-8 h-8 flex items-center justify-center rounded-full transition',
            editor?.isActive('bulletList') ? 'bg-black text-white' : 'hover:bg-gray-200'
          ]"
        >
          <List class="w-4 h-4" />
        </button>


        <!-- Image -->
        <button
            @click="triggerFileUpload"
            class="w-8 h-8 flex items-center justify-center rounded-full transition hover:bg-gray-200"
        >
          <ImageIcon class="w-4 h-4" />
        </button>

        <!-- Hidden file input -->
        <input
            type="file"
            ref="fileInput"
            accept="image/*"
            class="hidden"
            @change="handleFileUpload"
        />
      </div>

      <!-- Editor -->
      <div
          class="prose max-w-none py-3 rounded-md min-h-[200px] md:min-h-[250px] text-base md:text-xl border-b border-gray-300"
      >
        <EditorContent v-if="editor" :editor="editor" />
      </div>
    </div>

    <!-- Footer -->
    <div
        class="flex flex-col md:flex-row w-full items-center justify-between md:space-x-6 space-y-2 md:space-y-0 py-2 font-semibold text-xl md:text-lg"
    >
      <!-- Author -->
      <div class="w-full md:flex-1 flex flex-col">
        <input
            v-model="author"
            type="text"
            placeholder="Author Name"
            class="w-full text-center placeholder:text-gray-600 border-b border-gray-300 px-4 py-2 outline-0"
        />
      </div>

      <!-- Date -->
      <div class="w-full md:flex-1 flex flex-col">
        <input
            v-model="date"
            type="date"
            class="w-full border-b text-center border-gray-300 px-4 py-2 text-gray-600 outline-0"
        />
      </div>

      <!-- Avatar -->
      <div class="w-full md:flex-1 flex flex-col items-center">
        <input
            ref="fileInput"
            type="file"
            accept="image/*"
            @change="handleAvatarUpload"
            class="hidden"
        />

        <!-- Custom Button -->
        <button
            type="button"
            @click="$refs.fileInput.click()"
            class="w-full border-b flex justify-center border-gray-300 px-4 py-2 text-gray-600 font-medium outline-0"
        >
          <ImageIcon class="w-5 h-5 mt-1 mr-1"/> Upload Avatar
        </button>

        <!-- Preview -->
        <img
            v-if="avatar"
            :src="avatar"
            alt="Preview"
            class="mt-3 w-20 h-20 rounded-full object-cover"
        />
      </div>
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.ProseMirror h2 {
  font-size: 1.5rem;
  font-weight: bold;
}
.ProseMirror {
  outline: none;
  border: none;
}
.ProseMirror p.is-editor-empty:first-child::before {
  color: #9ca3af;
  font-weight: 600;
  content: attr(data-placeholder);
  float: left;
  pointer-events: none;
  height: 0;
}
.ProseMirror blockquote {
  border-left: 3px solid #000;
  padding-left: 1em;
  font-style: italic;
  font-weight: 500;
  quotes: "“" "”" "‘" "’";
}
.ProseMirror blockquote:before {
  content: open-quote;
}
.ProseMirror blockquote:after {
  content: close-quote;
}
.ProseMirror img {
  display: block;
  margin: 1.5rem auto;
  max-width: 100%;
  width: 400px;
  height: auto;
  border-radius: 12px;
}
.ProseMirror ul {
  list-style-type: disc;
  margin-left: 1.5rem;
  padding-left: 1rem;
}
.ProseMirror ul li {
  margin: 0.3rem 0;
}
</style>
