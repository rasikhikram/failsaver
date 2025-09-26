import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ==================== ROLE MANAGEMENT ====================

// Get user profile with role
export async function getUserProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Not authenticated' }

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return { data, error }
}

// Check if current user is admin
export async function isAdmin() {
    const { data: profile } = await getUserProfile()
    return profile?.role === 'admin'
}

// Get user role
export async function getUserRole() {
    const { data: profile } = await getUserProfile()
    return profile?.role || 'guest'
}

// ==================== CONTENT MANAGEMENT ====================

// Add interview post (users and admins)
export async function addPost(post) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: 'Must be logged in to add posts' }

        const postWithUser = {
            ...post,
            user_id: user.id,
            author_email: user.email
        }

        const { data, error } = await supabase
            .from("posts")
            .insert([postWithUser])
            .select()

        if (error) return { data: null, error }
        return { data, error: null }
    } catch (err) {
        return { data: null, error: err }
    }
}

// Add blog post (admins only)
export async function addBlog(blog) {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { data: null, error: 'Must be logged in to add blogs' }

        // Check if user is admin
        const adminCheck = await isAdmin()
        if (!adminCheck) {
            return { data: null, error: 'Only administrators can create blog posts' }
        }

        const blogWithUser = {
            ...blog,
            user_id: user.id,
            author_email: user.email
        }

        const { data, error } = await supabase
            .from("blogs")
            .insert([blogWithUser])
            .select()

        if (error) return { data: null, error }
        return { data, error: null }
    } catch (err) {
        return { data: null, error: err }
    }
}

// Get all posts
export async function getPosts() {
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

    return { data, error }
}

// Get all blogs
export async function getBlogs() {
    const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false })

    return { data, error }
}

// ==================== EXISTING AUTH FUNCTIONS ====================

export async function signUp(email, password) {
    const response = await supabase.auth.signUp({ email, password });
    console.log('Signup response:', response);
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