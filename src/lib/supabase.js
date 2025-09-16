import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Existing post function
export async function addPost(post) {
    try {
        const { data, error } = await supabase
            .from("posts")
            .insert([post])
            .select()
        if (error) return { data: null, error }
        return { data, error: null }
    } catch (err) {
        return { data: null, error: err }
    }
}

// Auth functions

// src/lib/supabase.js
export async function signUp(email, password) {
    const response = await supabase.auth.signUp({ email, password });
    console.log('Signup response:', response); // <-- Yahan response dikhega
    return response;
}
export async function signIn(email, password) {
    return await supabase.auth.signInWithPassword({ email, password });
}
export async function signOut() {
    return await supabase.auth.signOut();
}
export async function getSession() {
    return await supabase.auth.getSession();
}
export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
}