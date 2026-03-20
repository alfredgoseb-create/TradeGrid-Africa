import { createClient } from '@supabase/supabase-js'

// Your unique Supabase Project URL
const supabaseUrl = 'https://bfqixovzyrcwffcazhtf.supabase.co'

// Your unique Publishable Key (sb_publishable_...)
const supabaseAnonKey = 'sb_publishable_B2thc4BA2OcWdI6Od7pFpw_S1ttt0rC'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)