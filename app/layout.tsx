import './styles.css'
import Link from 'next/link'
import { getAdminUser } from '@/lib/admin'
import { createClient } from '@/lib/supabase/server'
import AccountMenu from '@/components/AccountMenu'
export const metadata = { title: 'Own Creations — Custom Dress Atelier', description: 'Design your dress, your way.' }
export default async function Layout({ children }: { children: React.ReactNode }) {
 const admin = await getAdminUser()
 const { data: { user } } = await (await createClient()).auth.getUser()
 const metadata = user?.user_metadata || {}
 return <html lang="en"><body><nav><Link className="brand" href="/">Own <span>Creations</span></Link><div className="nav-links"><Link href="/">Atelier</Link>{user ? <AccountMenu email={user.email || ''} name={metadata.full_name || metadata.name || user.email || 'Account'} avatar={metadata.avatar_url || metadata.picture} admin={Boolean(admin)} /> : <Link href="/login">Account</Link>}</div></nav>{children}<footer>OWN CREATIONS · MADE WITH INTENTION</footer></body></html>
}
