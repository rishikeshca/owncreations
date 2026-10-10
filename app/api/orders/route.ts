import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/admin'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

  const body = await request.json()
  if (!body || typeof body.design !== 'object' || Array.isArray(body.design)) {
    return NextResponse.json({ error: 'A valid design is required' }, { status: 400 })
  }

  // Update profile with customer & delivery details if provided
  const customer = body.customer || {}
  const fullName = (typeof customer.name === 'string' && customer.name.trim()) || ''
  const phone = (typeof customer.phone === 'string' && customer.phone.trim()) || ''
  const address = (typeof customer.address === 'string' && customer.address.trim()) || ''

  if (fullName || phone || address) {
    await supabase.from('profiles').upsert({
      id: user.id,
      full_name: fullName,
      phone: phone,
      address: address,
      updated_at: new Date().toISOString()
    })
  }

  // Check profile
  const { data: profile } = await supabase.from('profiles').select('full_name,phone,address').eq('id', user.id).maybeSingle()
  if (!profile?.full_name || !profile?.phone || !profile?.address) {
    return NextResponse.json({ error: 'Please provide full name, contact phone, and delivery address to complete your order' }, { status: 400 })
  }

  // Store enriched order design payload (includes customer, delivery, breakdown, invoice details)
  const orderPayload = {
    ...body.design,
    orderCode: body.orderCode || ('OC-' + Math.floor(100000 + Math.random() * 900000)),
    total: body.total || body.design.total || 2400,
    customer: {
      name: profile.full_name,
      phone: profile.phone,
      altPhone: customer.altPhone || '',
      email: customer.email || user.email || '',
      address: profile.address,
      notes: customer.notes || ''
    },
    deliverySpeed: body.deliverySpeed || body.design.delivery || 'Standard (10–14 days)',
    paymentMethod: body.paymentMethod || body.design.payment || 'UPI / GPay'
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      design: orderPayload,
      status: 'submitted'
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}

export async function GET() {
  if (!await getAdminUser()) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  const s = await createClient()
  const { data, error } = await s.from('orders').select('*').order('created_at', { ascending: false })
  return NextResponse.json(data || [], { status: error ? 400 : 200 })
}
