import { createClient } from '@supabase/supabase-js'

// Your project URL from the screenshot
const supabaseUrl = 'https://ca323d95-8904-43fe-b4e4-c34787ae5bef.supabase.co'

// IMPORTANT: Replace the string below with your 'anon public' key from Supabase
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)