<script setup>
import { ref, onBeforeUnmount, onMounted } from "vue"
import { Editor, EditorContent } from "@tiptap/vue-3"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import { createClient } from "@supabase/supabase-js"

import { Bold, Italic, Heading2, Image as ImageIcon } from "lucide-vue-next"

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

// Close popup if clicked outside
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
        placeholder: "Share your insights and knowledge...",
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

// Blog form fields (matching your blogs table columns)
const title = ref("")
const description = ref("")
const author = ref("")
const date = ref("")
const image = ref("") // Featured image for blog
const imagePreview = ref("") // For showing uploaded image preview

const submitBlog = async () => {
  // Validation
  if (!title.value || !description.value || !author.value || !date.value) {
    showToast("❌ Please fill all required fields!", "error")
    return
  }

  const { error } = await supabase.from("blogs").insert([
    {
      title: title.value,
      description: description.value,
      image: image.value, // This will be the public URL from blogs bucket
      content: editor.value.getHTML(),
      author: author.value,
      date: date.value,
    },
  ])

  if (error) {
    console.error('Blog submission error:', error)
    showToast("❌ Failed to publish blog!", "error")
  } else {
    showToast("✅ Blog published successfully!", "success")
    // Reset form
    title.value = ""
    description.value = ""
    author.value = ""
    date.value = ""
    image.value = ""
    imagePreview.value = ""
    editor.value.commands.setContent("<p></p>")
  }
}

// Featured image upload handler (uploads to 'blogs' bucket)
const featuredImageInput = ref(null)

const triggerFeaturedImageUpload = () => {
  featuredImageInput.value.click()
}

const handleFeaturedImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`

  // Upload to 'blogs' bucket
  const { error: uploadError } = await supabase.storage
      .from("blogs")
      .upload(fileName, file, { upsert: true })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    showToast("❌ Failed to upload featured image!", "error")
    return
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
      .from("blogs")
      .getPublicUrl(fileName)

  image.value = publicUrlData.publicUrl
  imagePreview.value = publicUrlData.publicUrl
  showToast("✅ Featured image uploaded!", "success")
}

// Content images upload handler (for images inside the editor)
const fileInput = ref(null)

const triggerFileUpload = () => {
  fileInput.value.click()
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const fileName = `content-${Date.now()}-${file.name.replace(/\s+/g, "_")}`

  const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, file, { upsert: true })

  if (uploadError) {
    console.error('Content image upload error:', uploadError)
    showToast("❌ Failed to upload image!", "error")
    return
  }

  // Get public URL
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

// Formatting helpers
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
</script>

<template>
  <div class="max-w-3xl mx-auto py-8 px-3 space-y-6">
    <h1 class="flex items-center justify-center text-3xl lg:text-6xl font-extrabold mb-12">
      Add New Blog
    </h1>

    <!-- Title -->
    <input
        v-model="title"
        type="text"
        placeholder="Blog Title"
        class="w-full text-2xl md:text-3xl font-bold py-2 focus:ring-0 outline-none border-b border-gray-300"
    />

    <!-- Description -->
    <textarea
        v-model="description"
        placeholder="Brief description of your blog post..."
        rows="2"
        class="w-full text-base md:text-xl placeholder:text-gray-500 py-2 font-semibold border-0 focus:ring-0 outline-none border-b border-gray-300 resize-none"
    ></textarea>

    <!-- Featured Image Upload -->
    <div class="w-full flex flex-col">
      <input
          ref="featuredImageInput"
          type="file"
          accept="image/*"
          @change="handleFeaturedImageUpload"
          class="hidden"
      />

      <button
          type="button"
          @click="triggerFeaturedImageUpload"
          class="w-full border-b flex justify-center items-center border-gray-300 px-4 py-2 text-gray-600 font-medium outline-0"
      >
        <ImageIcon class="w-5 h-5 mr-1"/> Upload Featured Image
      </button>

      <!-- Image Preview -->
      <img
          v-if="imagePreview"
          :src="imagePreview"
          alt="Featured image preview"
          class="mt-3 w-32 h-32 rounded object-cover mx-auto"
      />
    </div>

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
          ""
        </button>

        <!-- Content Image -->
        <button
            @click="triggerFileUpload"
            class="w-8 h-8 flex items-center justify-center rounded-full transition hover:bg-gray-200"
        >
          <ImageIcon class="w-4 h-4" />
        </button>

        <!-- Hidden file input for content images -->
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

    <!-- Footer - Author & Date -->
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

  <!-- Toast -->
  <transition name="fade">
    <div
        v-if="toast.show"
        :class="[
        'fixed bottom-5 right-5 px-5 py-3 rounded-lg shadow-lg text-white font-semibold z-50',
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
  quotes: """ """ "'" "'";
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
</style>