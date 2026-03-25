import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { record } = req.body
    console.log('Out of stock record:', record)

    // Example: Insert a notification into Supabase
    const { data, error } = await supabase
      .from('notifications')
      .insert([{ message: `${record.name} is out of stock`, created_at: new Date() }])

    if (error) throw error

    res.status(200).json({ success: true, data })
  } catch (err: any) {
    console.error(err)
    res.status(500).json({ success: false, error: err.message })
  }
}
