<script setup>
import { ref, onBeforeUnmount, onMounted } from "vue"
import { Editor, EditorContent } from "@tiptap/vue-3"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Image from "@tiptap/extension-image"
import { createClient } from "@supabase/supabase-js"
import { Plugin } from "prosemirror-state"

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

// Helper: upload image to Supabase and return URL
async function uploadImageToSupabase(file) {
  const fileName = `content-${Date.now()}-${file.name.replace(/\s+/g, "_")}`

  const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, file, { upsert: true })

  if (uploadError) {
    console.error("Upload error:", uploadError)
    showToast("❌ Failed to upload image!", "error")
    return null
  }

  const { data: publicUrlData } = supabase.storage
      .from("images")
      .getPublicUrl(fileName)

  return publicUrlData.publicUrl
}

onMounted(() => {
  editor.value = new Editor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Share your insights and knowledge...",
      }),
      Image.extend({
        addProseMirrorPlugins() {
          return [
            new Plugin({
              props: {
                handlePaste: (view, event) => {
                  const items = event.clipboardData?.items
                  if (!items) return false
                  for (const item of items) {
                    if (item.type.indexOf("image") === 0) {
                      const file = item.getAsFile()
                      uploadImageToSupabase(file).then((url) => {
                        if (url) {
                          this.editor.chain().focus().setImage({ src: url }).run()
                        }
                      })
                      return true
                    }
                  }
                  return false
                },
                handleDrop: (view, event) => {
                  const files = event.dataTransfer?.files
                  if (!files?.length) return false
                  Array.from(files).forEach((file) => {
                    if (file.type.startsWith("image/")) {
                      uploadImageToSupabase(file).then((url) => {
                        if (url) {
                          this.editor.chain().focus().setImage({ src: url }).run()
                        }
                      })
                    }
                  })
                  return true
                },
              },
            }),
          ]
        },
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

// Blog form fields
const title = ref("")
const description = ref("")
const author = ref("")
const date = ref("")
const avatar = ref("")

const submitBlog = async () => {
  if (!title.value || !description.value || !author.value || !date.value) {
    showToast("❌ Please fill all required fields!", "error")
    return
  }

  const { error } = await supabase.from("blogs").insert([
    {
      title: title.value,
      image: previewImage.value,
      description: description.value,
      content: editor.value.getHTML(),
      author: author.value,
      date: date.value,
      avatar: avatar.value,
    },
  ])

  if (error) {
    console.error("Blog submission error:", error)
    showToast("❌ Failed to publish blog!", "error")
  } else {
    showToast("✅ Blog published successfully!", "success")
    title.value = ""
    previewImage.value = ""
    description.value = ""
    author.value = ""
    date.value = ""
    avatar.value = ""
    editor.value.commands.setContent("<p></p>")
  }
}

// Avatar upload
const avatarInput = ref(null)

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const fileName = `avatar-${Date.now()}-${file.name.replace(/\s+/g, "_")}`

  const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true })

  if (uploadError) {
    console.error("Avatar upload error:", uploadError)
    showToast("❌ Failed to upload avatar!", "error")
    return
  }

  const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName)

  avatar.value = publicUrlData.publicUrl
  showToast("✅ Avatar uploaded!", "success")
}

// Content images upload (manual button)
const fileInput = ref(null)
const triggerFileUpload = () => fileInput.value.click()

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  const imageUrl = await uploadImageToSupabase(file)
  if (!imageUrl) return
  editor.value.chain().focus().setImage({ src: imageUrl }).run()
  showPopup.value = false
}

// Preview image upload (using images bucket)
const previewImageInput = ref(null)
const previewImage = ref("")

const handlePreviewImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const fileName = `preview-${Date.now()}-${file.name.replace(/\s+/g, "_")}`

  const { error: uploadError } = await supabase.storage
      .from("images")  // Changed from "blog-images" to "images"
      .upload(fileName, file, { upsert: true })

  if (uploadError) {
    console.error("Preview image upload error:", uploadError)
    showToast("❌ Failed to upload preview image!", "error")
    return
  }

  const { data: publicUrlData } = supabase.storage
      .from("images")  // Changed here too
      .getPublicUrl(fileName)

  previewImage.value = publicUrlData.publicUrl
  showToast("✅ Preview image uploaded!", "success")
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

    <!-- Preview Image -->
    <div class="w-full md:flex-1 flex flex-col items-center">
      <input
          ref="previewImageInput"
          type="file"
          accept="image/*"
          @change="handlePreviewImageUpload"
          class="hidden"
      />

      <button
          type="button"
          @click="$refs.previewImageInput.click()"
          class="w-full border-b flex justify-start border-gray-300 px-1 py-2 text-gray-600 font-semibold text-xl outline-0"
      >
        <ImageIcon class="w-5 h-5 mt-1 mr-1"/> Preview Image
      </button>


    </div>

    <!-- Description -->
    <input
        v-model="description"
        placeholder="Brief description of your blog..."
        class="w-full md:text-xl placeholder:text-gray-500 py-2 font-semibold border-0 focus:ring-0 outline-none border-b border-gray-300"
    >

    <!-- Editor -->
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
        <button
            @click="triggerFileUpload"
            class="w-8 h-8 flex items-center justify-center rounded-full transition hover:bg-gray-200"
        >
          <ImageIcon class="w-4 h-4" />
        </button>
        <input
            type="file"
            ref="fileInput"
            accept="image/*"
            class="hidden"
            @change="handleFileUpload"
        />
      </div>

      <div
          class="prose max-w-none py-3 rounded-md min-h-[200px] md:min-h-[250px] text-base md:text-xl border-b border-gray-300"
      >
        <EditorContent v-if="editor" :editor="editor" />
      </div>
    </div>

    <!-- Footer - Author, Date & Avatar -->
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
            ref="avatarInput"
            type="file"
            accept="image/*"
            @change="handleAvatarUpload"
            class="hidden"
        />

        <button
            type="button"
            @click="$refs.avatarInput.click()"
            class="w-full border-b flex justify-center border-gray-300 px-4 py-2 text-gray-600 font-medium outline-0"
        >
          <ImageIcon class="w-5 h-5 mt-1 mr-1"/>Avatar
        </button>

        <img
            v-if="avatar"
            :src="avatar"
            alt="Avatar preview"
            class="mt-3 w-20 h-20 rounded-full object-cover"
        />
      </div>
    </div>

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
  quotes: "\"\"" "\"\"" "'" "'";
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