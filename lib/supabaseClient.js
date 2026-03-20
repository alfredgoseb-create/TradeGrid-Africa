import { createClient } from '@supabase/supabase-js'

// This URL matches your Project ID: bfqixovzyrcwffcazhtf
const supabaseUrl = 'https://bfqixovzyrcwffcazhtf.supabase.co'

// This is the key from your latest screenshot
const supabaseAnonKey = 'sb_publishable_B2thc4BA2OcWdI6Od7pFpw_S1ttt0rC'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)