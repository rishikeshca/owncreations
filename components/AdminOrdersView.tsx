'use client'

import { useState } from 'react'
import InvoiceModal, { OrderInvoiceData } from './InvoiceModal'

interface AdminOrdersViewProps {
  orders: any[]
  customerById: Record<string, any>
}

export default function AdminOrdersView({ orders, customerById }: AdminOrdersViewProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<OrderInvoiceData | null>(null)

  function openInvoiceForOrder(order: any) {
    const customer = customerById[order.user_id] || order.design?.customer || {}
    const design = order.design || {}
    const total = Number(design.total || 2400)
    const base = Number(design.base || 2400)

    const invoiceData: OrderInvoiceData = {
      orderCode: design.orderCode || ('OC-' + order.id.slice(0, 6).toUpperCase()),
      date: new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      customer: {
        name: customer.full_name || customer.name || 'Atelier Customer',
        phone: customer.phone || '—',
        email: customer.email || '—',
        address: customer.address || '—',
        notes: customer.notes || ''
      },
      summary: {
        collection: design.Collection || 'Custom Atelier',
        design: `${design.Neckline || 'Classic'} · ${design.Sleeves || 'Standard'}`,
        neckline: design.Neckline,
        sleeves: design.Sleeves,
        hem: design.Hem,
        fabric: design.Fabric || 'Silk',
        colour: design.Colour || 'Classic',
        embellishment: design.Embellishment || 'None',
        topSize: design.Size || 'Standard',
        delivery: design.Delivery || 'Standard (10–14 days)',
        payment: design.Payment || 'UPI / GPay'
      },
      breakdown: {
        base,
        fabricCost: Number(design.fabricCost || 0),
        embellishmentCost: Number(design.embellishmentCost || 0),
        topSizeCharge: Number(design.topSizeCharge || 0),
        topSizeLabel: design.Size || 'Standard',
        designCharge: Number(design.designCharge || 0),
        finishingCharge: Number(design.finishingCharge || 0),
        dupattaCharge: Number(design.dupattaCharge || 0),
        deliveryCharge: Number(design.deliveryCharge || 0),
        total
      }
    }
    setSelectedInvoice(invoiceData)
  }

  return (
    <>
      <div className="order-list">
        {orders.map(order => {
          const customer = customerById[order.user_id] || order.design?.customer
          const design = order.design || {}
          return (
            <article className="admin-order" key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ flex: '1 1 300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <strong>{customer?.full_name || customer?.name || 'Customer'}</strong>
                  <span className="price-tag-badge">₹{Number(design.total || 2400).toLocaleString('en-IN')}</span>
                </div>
                <small>
                  {new Date(order.created_at).toLocaleDateString()} · ID: {order.id.slice(0, 8)}…
                </small>
                <p style={{ marginTop: '0.6rem' }}>
                  {Object.entries(design as Record<string, any>)
                    .filter(([k]) => !['customer', 'notes', 'breakdown'].includes(k))
                    .map(([key, value]) => (
                      <span key={key}>
                        <b>{key}:</b> {String(value)} ·{' '}
                      </span>
                    ))}
                </p>
                {customer?.address && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '0.4rem' }}>
                    📍 <strong>Address:</strong> {customer.address} (Phone: {customer.phone || '—'})
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem' }}>
                <span className="order-status">{order.status}</span>
                <button
                  type="button"
                  className="btn alt"
                  style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                  onClick={() => openInvoiceForOrder(order)}
                >
                  📄 View & Print Bill
                </button>
              </div>
            </article>
          )
        })}
      </div>

      <InvoiceModal order={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
    </>
  )
}
