import { createClient } from '@/lib/supabase/server'
import AdminOrdersView from '@/components/AdminOrdersView'

export default async function Orders() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="atelier">
        <div className="panel">
          <h2>Sign in to view orders</h2>
          <p className="sub">Please log in to your account to review your bespoke creations.</p>
        </div>
      </main>
    )
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  const { data: orders } = await supabase
    .from('orders')
    .select('id,user_id,status,design,created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const customerByIdRecord: Record<string, any> = {
    [user.id]: profile || { full_name: user.user_metadata?.full_name || 'Valued Customer', email: user.email }
  }

  return (
    <main className="atelier">
      <div className="panel">
        <span className="tag">Your atelier journey</span>
        <h2>Your bespoke orders & invoices</h2>
        {!orders?.length ? (
          <p className="sub">Your first bespoke design is waiting to be crafted.</p>
        ) : (
          <AdminOrdersView orders={orders} customerById={customerByIdRecord} />
        )}
      </div>
    </main>
  )
}
