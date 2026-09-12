'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Props = {
  email: string
  name: string
  avatar?: string
  admin: boolean
}

export default function AccountMenu({ email, name, avatar, admin }: Props) {
  const router = useRouter()
  async function signOut() {
    await createClient().auth.signOut()
    router.push('/')
    router.refresh()
  }
  return <details className="account-menu">
    <summary aria-label={`Open account menu for ${name || email}`}><span className="avatar">{avatar ? <img src={avatar} alt="" /> : name.slice(0, 1).toUpperCase()}</span></summary>
    <div className="account-popover"><small>{email}</small><Link href="/profile">Profile</Link>{admin && <><Link href="/orders">Orders</Link><Link href="/admin">Admin dashboard</Link></>}<button type="button" onClick={signOut}>Sign out</button></div>
  </details>
}
