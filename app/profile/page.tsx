'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Profile = { full_name: string; phone: string; address: string }

export default function ProfilePage() {
  const [form, setForm] = useState<Profile>({ full_name: '', phone: '', address: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetch('/api/profile').then(async response => {
      if (response.status === 401) return router.replace('/login')
      if (!response.ok) throw new Error('Could not load profile')
      setForm(await response.json())
      setLoading(false)
    }).catch(() => { setError('Could not load your profile.'); setLoading(false) })
  }, [router])

  async function save(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true); setMessage(''); setError('')
    const response = await fetch('/api/profile', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) })
    if (!response.ok) setError((await response.json()).error || 'Could not save your profile')
    else setMessage('Profile updated successfully.')
    setSaving(false)
  }

  if (loading) return <main className="auth panel"><p className="sub">Loading your profile…</p></main>
  return <main className="auth panel"><span className="tag">Your account</span><h2>Profile</h2><p className="sub">Keep your delivery details up to date.</p><form onSubmit={save}><label className="field">Full name<input required value={form.full_name} onChange={event => setForm({ ...form, full_name: event.target.value })} /></label><label className="field">Phone number<input required value={form.phone} onChange={event => setForm({ ...form, phone: event.target.value })} /></label><label className="field">Delivery address<textarea required rows={4} value={form.address} onChange={event => setForm({ ...form, address: event.target.value })} /></label><button className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button></form>{message && <p className="notice">{message}</p>}{error && <p className="error">{error}</p>}</main>
}
