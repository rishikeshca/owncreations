import { getAdminUser } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminOrdersView from '@/components/AdminOrdersView'

export default async function AdminDashboard() {
  const user = await getAdminUser()
  if (!user) {
    return (
      <main className="admin-shell">
        <div className="panel">
          <h2>Admin access required</h2>
          <p className="sub">This area is restricted to approved administrators.</p>
        </div>
      </main>
    )
  }

  const admin = createAdminClient()
  if (!admin) {
    return (
      <main className="admin-shell">
        <div className="panel">
          <h2>Admin service unavailable</h2>
          <p className="sub">Set SUPABASE_SERVICE_ROLE_KEY on the server to load customer data.</p>
        </div>
      </main>
    )
  }

  const [{ data: customers }, { data: orders }] = await Promise.all([
    admin.from('profiles').select('id,full_name,phone,address,updated_at').order('updated_at', { ascending: false }),
    admin.from('orders').select('id,user_id,design,status,created_at').order('created_at', { ascending: false })
  ])

  const customerByIdRecord: Record<string, any> = {}
  ;(customers || []).forEach(c => {
    customerByIdRecord[c.id] = c
  })

  const totalRevenue = (orders || []).reduce((sum, ord) => sum + Number(ord.design?.total || 2400), 0)

  return (
    <main className="admin-shell">
      <div className="admin-heading">
        <div>
          <span className="tag">Atelier operations</span>
          <h1>Admin dashboard</h1>
          <p className="sub">Customer profiles, bespoke catalogs, orders & tax invoice generation.</p>
        </div>
        <span className="admin-email">{user.email}</span>
      </div>

      <div className="admin-stats">
        <div>
          <strong>{customers?.length || 0}</strong>
          <span>Customers</span>
        </div>
        <div>
          <strong>{orders?.length || 0}</strong>
          <span>Total orders</span>
        </div>
        <div>
          <strong>₹{totalRevenue.toLocaleString('en-IN')}</strong>
          <span>Gross Volume</span>
        </div>
      </div>

      <section className="panel admin-section">
        <h2>Submitted Atelier Orders & Tax Invoices</h2>
        {!orders?.length ? (
          <p className="sub">No orders placed yet.</p>
        ) : (
          <AdminOrdersView orders={orders} customerById={customerByIdRecord} />
        )}
      </section>

      <section className="panel admin-section" style={{ marginTop: '2rem' }}>
        <h2>Customer Profiles</h2>
        {!customers?.length ? (
          <p className="sub">No customer profiles yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Delivery Address</th>
                  <th>Orders Count</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.id}>
                    <td>
                      <strong>{customer.full_name || 'Unnamed customer'}</strong>
                      <small>{customer.id.slice(0, 8)}…</small>
                    </td>
                    <td>{customer.phone || '—'}</td>
                    <td>{customer.address || '—'}</td>
                    <td>{orders?.filter(order => order.user_id === customer.id).length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
