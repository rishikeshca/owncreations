'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Profile = { full_name: string; phone: string; address: string }

export default function Onboarding() {
  const [form, setForm] = useState<Profile>({ full_name: '', phone: '', address: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let active = true
    async function loadProfile() {
      const { data: { user } } = await createClient().auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }
      const response = await fetch('/api/profile')
      if (!response.ok) {
        if (active) {
          setError('Could not load your profile. Please try again.')
          setLoading(false)
        }
        return
      }
      const profile = await response.json() as Profile
      if (profile.full_name && profile.phone && profile.address) {
        router.replace('/')
        return
      }
      if (active) {
        setForm(profile)
        setLoading(false)
      }
    }
    void loadProfile()
    return () => { active = false }
  }, [router])

  function change(key: keyof Profile, value: string) {
    setForm(current => ({ ...current, [key]: value }))
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')
    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (!response.ok) {
      const body = await response.json()
      setError(body.error || 'Could not save your details')
      setSaving(false)
      return
    }
    router.push('/')
  }

  if (loading) return <main className="auth panel"><p className="sub">Loading your profile…</p></main>

  return <main className="auth panel"><span className="tag">Before we begin</span><h2>Your details</h2><p className="sub">A little information helps us deliver your creation beautifully.</p><form onSubmit={save}><label className="field">Full name<input required value={form.full_name} onChange={event => change('full_name', event.target.value)} /></label><label className="field">Phone number<input required value={form.phone} onChange={event => change('phone', event.target.value)} /></label><label className="field">Delivery address<textarea required rows={4} value={form.address} onChange={event => change('address', event.target.value)} /></label><button className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save and continue'}</button></form>{error && <p className="error">{error}</p>}</main>
}
