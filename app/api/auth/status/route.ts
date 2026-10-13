import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const admin = await getAdminUser()
  return NextResponse.json({
    authenticated: Boolean(user),
    user: user ? { id: user.id, email: user.email, name: user.user_metadata?.full_name || user.email } : null,
    isAdmin: Boolean(admin)
  })
}
