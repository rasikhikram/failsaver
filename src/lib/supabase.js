import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ✅ Add post function
export async function addPost(post) {
    try {
        console.log("📤 Sending post to Supabase:", post)

        const { data, error } = await supabase
            .from("posts")
            .insert([post])
            .select()

        if (error) {
            console.error("❌ Supabase insert error:", error.message)
            return { data: null, error }
        }

        console.log("✅ Supabase insert success:", data)
        return { data, error: null }
    } catch (err) {
        console.error("⚠️ Unexpected error:", err)
        return { data: null, error: err }
    }
}


