import { createClient } from '@/lib/supabase/server'

const configuredAdminEmails = () =>
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)

export function isAdminEmail(email?: string | null) {
  return Boolean(email && configuredAdminEmails().includes(email.toLowerCase()))
}

export async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user && isAdminEmail(user.email) ? user : null
}
