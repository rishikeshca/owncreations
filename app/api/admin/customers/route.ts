import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  if (!await getAdminUser()) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: 'Admin data service is not configured' }, { status: 503 })
  const { data, error } = await admin.from('profiles').select('id,full_name,phone,address,updated_at').order('updated_at', { ascending: false })
  if (error) return NextResponse.json({ error: 'Unable to load customers' }, { status: 500 })
  return NextResponse.json(data || [])
}
