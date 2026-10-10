import './styles.css'
import Link from 'next/link'
import { getAdminUser } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import AccountMenu from '@/components/AccountMenu'

export const metadata = {
  title: 'Own Creations — Custom Dress Atelier',
  description: 'Design your dress, your way. Bespoke handmade creations tailored to your exact measurements.'
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser()
  const { data: { user } } = await (await createClient()).auth.getUser()
  const meta = user?.user_metadata || {}

  return (
    <html lang="en">
      <body>
        <nav>
          <Link className="brand" href="/">
            Own <span>Creations</span>
          </Link>
          <div className="nav-links">
            <Link href="/">Atelier</Link>
            <Link href="/orders">My Orders</Link>
            {admin && <Link href="/admin">Admin Portal</Link>}
            {user ? (
              <AccountMenu
                email={user.email || ''}
                name={meta.full_name || meta.name || user.email || 'Account'}
                avatar={meta.avatar_url || meta.picture}
                admin={Boolean(admin)}
              />
            ) : (
              <Link href="/login">Account</Link>
            )}
          </div>
        </nav>
        {children}
        <footer>
          <div>OWN CREATIONS · BESPOKE DRESS ATELIER · EST. 2020</div>
          <div style={{ marginTop: '0.4rem', opacity: 0.7 }}>Handcrafted with intention · All measurements verified before cutting</div>
        </footer>
      </body>
    </html>
  )
}
