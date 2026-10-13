'use client'

import React from 'react'

export interface OrderInvoiceData {
  orderCode: string
  date: string
  customer: {
    name: string
    phone: string
    altPhone?: string
    email: string
    address: string
    notes?: string
  }
  summary: {
    collection: string
    design: string
    neckline?: string
    sleeves?: string
    hem?: string
    fabric: string
    colour?: string
    embellishment?: string
    topSize?: string
    delivery: string
    payment: string
  }
  breakdown: {
    base: number
    fabricCost: number
    embellishmentCost: number
    topSizeCharge?: number
    topSizeLabel?: string
    designCharge?: number
    finishingCharge?: number
    dupattaCharge?: number
    deliveryCharge?: number
    total: number
  }
}

interface InvoiceModalProps {
  order: OrderInvoiceData | null
  onClose: () => void
}

export default function InvoiceModal({ order, onClose }: InvoiceModalProps) {
  if (!order) return null

  const { customer, summary, breakdown } = order

  return (
    <div className="invoice-overlay active" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="invoice-modal">
        <button className="invoice-close-btn" onClick={onClose} aria-label="Close invoice">×</button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '1.2rem', marginBottom: '1.4rem' }}>
          <div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.8rem', fontWeight: 600, color: 'var(--deep)' }}>
              Own <span style={{ color: 'var(--gold)' }}>Creations</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.2rem' }}>
              Bespoke Dress Atelier · Est. 2020
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="price-tag-badge">Tax Invoice & Order Summary</span>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '1.05rem', fontWeight: 600, color: 'var(--gold)', marginTop: '0.4rem' }}>
              {order.orderCode}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
              {order.date}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem', background: 'var(--pale)', padding: '1rem', borderRadius: '8px', marginBottom: '1.2rem' }}>
          <div>
            <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '0.3rem' }}>
              Customer Details
            </strong>
            <div style={{ fontWeight: 500, color: 'var(--deep)' }}>{customer.name}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--brown)' }}>{customer.phone}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{customer.email}</div>
          </div>
          <div>
            <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: '0.3rem' }}>
              Delivery Destination
            </strong>
            <div style={{ fontSize: '0.85rem', color: 'var(--deep)', lineHeight: 1.4 }}>{customer.address}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 500, marginTop: '0.25rem' }}>
              Speed: {summary.delivery}
            </div>
          </div>
        </div>

        <table className="invoice-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Specification</th>
              <th className="tar">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>{summary.collection}</strong> Silhouette</td>
              <td>{summary.design}</td>
              <td className="tar">₹{breakdown.base.toLocaleString('en-IN')}</td>
            </tr>
            {(summary.neckline || summary.sleeves) && (
              <tr>
                <td>Styling & Cut</td>
                <td>{summary.neckline || 'Classic'} / {summary.sleeves || 'Standard'} {summary.hem ? `(${summary.hem})` : ''}</td>
                <td className="tar">Included</td>
              </tr>
            )}
            <tr>
              <td>Fabric Selection</td>
              <td>{summary.fabric} {summary.colour ? `· ${summary.colour}` : ''}</td>
              <td className="tar">{breakdown.fabricCost > 0 ? `+₹${breakdown.fabricCost.toLocaleString('en-IN')}` : 'Included'}</td>
            </tr>
            <tr>
              <td>Embellishment & Detailing</td>
              <td>{summary.embellishment || 'None'}</td>
              <td className="tar">{breakdown.embellishmentCost > 0 ? `+₹${breakdown.embellishmentCost.toLocaleString('en-IN')}` : 'Included'}</td>
            </tr>
            {Boolean(breakdown.topSizeCharge && breakdown.topSizeCharge > 0) && (
              <tr>
                <td>Size Surcharge</td>
                <td>{breakdown.topSizeLabel || 'Top Size'}</td>
                <td className="tar">+₹{(breakdown.topSizeCharge || 0).toLocaleString('en-IN')}</td>
              </tr>
            )}
            {Boolean(breakdown.designCharge && breakdown.designCharge > 0) && (
              <tr>
                <td>Custom Atelier Cut Fee</td>
                <td>Personalized pattern adaptation (+16.7%)</td>
                <td className="tar">+₹{(breakdown.designCharge || 0).toLocaleString('en-IN')}</td>
              </tr>
            )}
            {Boolean(breakdown.finishingCharge && breakdown.finishingCharge > 0) && (
              <tr>
                <td>Artisanal Finishing Surcharge</td>
                <td>Handcrafted lining & trim work (+25%)</td>
                <td className="tar">+₹{(breakdown.finishingCharge || 0).toLocaleString('en-IN')}</td>
              </tr>
            )}
            {Boolean(breakdown.dupattaCharge && breakdown.dupattaCharge > 0) && (
              <tr>
                <td>Dupatta & Accessory</td>
                <td>Custom matched dupatta</td>
                <td className="tar">+₹{(breakdown.dupattaCharge || 0).toLocaleString('en-IN')}</td>
              </tr>
            )}
            {Boolean(breakdown.deliveryCharge && breakdown.deliveryCharge > 0) && (
              <tr>
                <td>Priority Atelier Delivery</td>
                <td>{summary.delivery}</td>
                <td className="tar">+₹{(breakdown.deliveryCharge || 0).toLocaleString('en-IN')}</td>
              </tr>
            )}
            <tr className="total-row">
              <td colSpan={2}>Final Net Amount (All Taxes & Atelier Fees Included)</td>
              <td className="tar">₹{breakdown.total.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', background: 'var(--pale)', padding: '0.8rem 1rem', borderRadius: '8px', borderLeft: '3px solid var(--gold)', lineHeight: 1.5, marginBottom: '1.2rem' }}>
          <strong>Payment Mode:</strong> {summary.payment}. Handcrafted bespoke garment created to your exact measurements.
        </div>

        <div className="invoice-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
          <button type="button" className="btn alt" onClick={onClose}>Close</button>
          <button type="button" className="btn" onClick={() => window.print()}>🖨️ Print / Save as PDF</button>
        </div>
      </div>
    </div>
  )
}
