import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminDashboard() {
  const user = await getAdminUser()
  if (!user) return <main className="admin-shell"><div className="panel"><h2>Admin access required</h2><p className="sub">This area is restricted to approved administrators.</p></div></main>
  const admin = createAdminClient()
  if (!admin) return <main className="admin-shell"><div className="panel"><h2>Admin service unavailable</h2><p className="sub">Set SUPABASE_SERVICE_ROLE_KEY on the server to load customer data.</p></div></main>
  const [{ data: customers }, { data: orders }] = await Promise.all([
    admin.from('profiles').select('id,full_name,phone,address,updated_at').order('updated_at', { ascending: false }),
    admin.from('orders').select('id,user_id,design,status,created_at').order('created_at', { ascending: false })
  ])
  const customerById = new Map((customers || []).map(customer => [customer.id, customer]))
  return <main className="admin-shell">
    <div className="admin-heading"><div><span className="tag">Atelier operations</span><h1>Admin dashboard</h1><p className="sub">Customer profiles and recent custom orders.</p></div><span className="admin-email">{user.email}</span></div>
    <div className="admin-stats"><div><strong>{customers?.length || 0}</strong><span>Customers</span></div><div><strong>{orders?.length || 0}</strong><span>Total orders</span></div><div><strong>{orders?.filter(order => order.status === 'submitted').length || 0}</strong><span>Needs review</span></div></div>
    <section className="panel admin-section"><h2>Customers</h2>{!customers?.length ? <p className="sub">No customer profiles yet.</p> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Customer</th><th>Contact</th><th>Address</th><th>Orders</th></tr></thead><tbody>{customers.map(customer => <tr key={customer.id}><td><strong>{customer.full_name || 'Unnamed customer'}</strong><small>{customer.id.slice(0, 8)}…</small></td><td>{customer.phone || '—'}</td><td>{customer.address || '—'}</td><td>{orders?.filter(order => order.user_id === customer.id).length || 0}</td></tr>)}</tbody></table></div>}</section>
    <section className="panel admin-section"><h2>Recent orders</h2>{!orders?.length ? <p className="sub">No orders yet.</p> : <div className="order-list">{orders.map(order => { const customer = customerById.get(order.user_id); return <article className="admin-order" key={order.id}><div><strong>{customer?.full_name || 'Unknown customer'}</strong><small>{new Date(order.created_at).toLocaleDateString()} · {order.id.slice(0, 8)}…</small></div><span className="order-status">{order.status}</span><p>{Object.entries((order.design || {}) as Record<string, string>).map(([key, value]) => <span key={key}><b>{key}:</b> {value}</span>)}</p></article> })}</div>}</section>
  </main>
}
