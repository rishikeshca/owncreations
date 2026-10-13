'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import InvoiceModal, { OrderInvoiceData } from './InvoiceModal'

const steps = ['Style', 'Design', 'Fabric', 'Measurements', 'Embellishments', 'Checkout']

const defaultCollections = [
  { key: 'trending', name: 'Trending', subtitle: "The season's most-loved silhouettes", image: '/sample-trending.jpg', basePrice: 2400 },
  { key: 'casuals', name: 'Casuals', subtitle: 'Effortless pieces for every day', image: '/casuals.jpg', basePrice: 1800 },
  { key: 'modern', name: 'Modern', subtitle: 'Clean lines, considered details', image: '/modern.jpg', basePrice: 3200 },
  { key: 'croptop', name: 'Crop Tops', subtitle: 'Playful separates, made yours', image: '/casuals.jpg', basePrice: 1600 },
]

const defaultDesignOptions: Record<string, { neckline: string[]; sleeves: string[]; hem: string[] }> = {
  trending: {
    neckline: ['Round Neck', 'Square Neck', 'V-Neck', 'Mandarin Collar', 'Tie Neck', 'Boat Neck'],
    sleeves: ['Sleeveless', '3/4 Sleeve', 'Bell Sleeve', 'Full Sleeve', 'Puff Sleeve'],
    hem: ['Straight Cut', 'A-Line Flare', 'Front Slit', 'Palazzo Set', 'Dupatta Set']
  },
  casuals: {
    neckline: ['V-Neck', 'Round Neck', 'Collar Neck', 'Square Neck', 'Keyhole'],
    sleeves: ['Sleeveless', 'Cap Sleeve', 'Short Sleeve', 'Half Sleeve', 'Puff Sleeve'],
    hem: ['A-Line', 'Straight', 'Midi Length', 'Pocket Friendly', 'Side Slit']
  },
  modern: {
    neckline: ['V-Neck', 'Square Neck', 'Collared', 'Boat Neck', 'Overlay Style'],
    sleeves: ['Sleeveless', 'Puff Sleeve', 'Sheer Sleeve', 'Cape Sleeve', 'Flared Sleeve'],
    hem: ['Layered', 'Front Open', 'High-Low', 'Layered Set', 'Wide-Leg Set']
  },
  croptop: {
    neckline: ['Square Neck', 'Sweetheart Neck', 'Tie Front', 'Halter Neck', 'V-Neck'],
    sleeves: ['Sleeveless', 'Puff Sleeve', 'Ruffle Sleeve', 'Bell Sleeve', 'Half Sleeve'],
    hem: ['Peplum', 'Layered Ruffle', 'Front Tie', 'Smocked Waist', 'Straight Crop']
  }
}

const fabricOptions = [
  { name: 'Cotton', price: 0, class: 'cotton' },
  { name: 'Linen', price: 200, class: 'linen' },
  { name: 'Crepe', price: 500, class: 'silk' },
  { name: 'Chiffon', price: 600, class: 'organza' },
  { name: 'Georgette', price: 800, class: 'organza' },
  { name: 'Organza', price: 900, class: 'organza' },
  { name: 'Silk', price: 1200, class: 'silk' },
  { name: 'Velvet', price: 1500, class: 'velvet' },
]

const colourSwatches = [
  { name: 'Ivory White', hex: '#FDFBF7' },
  { name: 'Rose Pink', hex: '#C97B84' },
  { name: 'Sage Green', hex: '#9BA885' },
  { name: 'Midnight Navy', hex: '#1C2833' },
  { name: 'Maroon', hex: '#6B1D2F' },
  { name: 'Golden Honey', hex: '#D4AF37' },
]

const topSizes = [
  { label: 'XS (32")', value: 'XS', surcharge: 0 },
  { label: 'S (34")', value: 'S', surcharge: 0 },
  { label: 'M (36")', value: 'M', surcharge: 0 },
  { label: 'L (38")', value: 'L', surcharge: 0 },
  { label: 'XL (40")', value: 'XL', surcharge: 0.10 },
  { label: '2XL (42")', value: '2XL', surcharge: 0.15 },
  { label: 'Custom Tailored', value: 'Custom', surcharge: 0.20 },
]

const embellishments = [
  { name: 'None', desc: 'Minimalist & sleek', price: 0 },
  { name: 'Thread Work', desc: 'Subtle tone-on-tone embroidery', price: 400 },
  { name: 'Sequins', desc: 'Delicate light-catching shimmer', price: 500 },
  { name: 'Beadwork', desc: 'Hand-sewn micro pearls & beads', price: 700 },
  { name: 'Mirror Work', desc: 'Traditional artisan mirrors', price: 800 },
  { name: 'Zari / Zardosi', desc: 'Opulent gold metallic handwork', price: 1200 },
]

export default function Configurator() {
  const [step, setStep] = useState(0)
  const [collectionKey, setCollectionKey] = useState('trending')
  const [neckline, setNeckline] = useState('Round Neck')
  const [sleeves, setSleeves] = useState('3/4 Sleeve')
  const [hem, setHem] = useState('Straight Cut')
  const [fabric, setFabric] = useState('Cotton')
  const [colour, setColour] = useState('Rose Pink')
  const [topSize, setTopSize] = useState('M')
  const [bust, setBust] = useState('36')
  const [waist, setWaist] = useState('30')
  const [hip, setHip] = useState('40')
  const [length, setLength] = useState('44')
  const [embellishment, setEmbellishment] = useState('None')
  const [customPatternCut, setCustomPatternCut] = useState(false)
  const [finishingTrim, setFinishingTrim] = useState(false)
  const [dupatta, setDupatta] = useState('Not Required')

  // Checkout info
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [altPhone, setAltPhone] = useState('')
  const [email, setEmail] = useState('')
  const [street, setStreet] = useState('')
  const [landmark, setLandmark] = useState('')
  const [city, setCity] = useState('')
  const [stateName, setStateName] = useState('Kerala')
  const [pincode, setPincode] = useState('')
  const [notes, setNotes] = useState('')
  const [deliverySpeed, setDeliverySpeed] = useState('Standard (10–14 days)')
  const [paymentMethod, setPaymentMethod] = useState('UPI / GPay')

  const [activeInvoice, setActiveInvoice] = useState<OrderInvoiceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Pre-load user profile if logged in
  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await createClient().auth.getUser()
        if (user) {
          if (user.email) setEmail(user.email)
          const res = await fetch('/api/profile')
          if (res.ok) {
            const prof = await res.json()
            if (prof.full_name) setName(prof.full_name)
            if (prof.phone) setPhone(prof.phone)
            if (prof.address) setStreet(prof.address)
          }
        }
      } catch (e) {}
    }
    loadProfile()
  }, [])

  const currentCollection = defaultCollections.find(c => c.key === collectionKey) || defaultCollections[0]
  const currentOptions = defaultDesignOptions[collectionKey] || defaultDesignOptions.trending
  const selectedFabricObj = fabricOptions.find(f => f.name === fabric) || fabricOptions[0]
  const selectedEmbelObj = embellishments.find(e => e.name === embellishment) || embellishments[0]
  const selectedSizeObj = topSizes.find(s => s.value === topSize) || topSizes[2]

  // Pricing Calculation Engine
  const basePrice = currentCollection.basePrice
  const fabricCost = selectedFabricObj.price
  const embellishmentCost = selectedEmbelObj.price
  const topSizeCharge = Math.round(basePrice * selectedSizeObj.surcharge)
  const designCharge = customPatternCut ? Math.round(basePrice / 6) : 0
  const finishingCharge = finishingTrim ? Math.round(basePrice / 4) : 0
  const dupattaCharge = dupatta === 'Matching (+₹400)' ? 400 : dupatta === 'Embellished (+₹800)' ? 800 : 0
  const deliveryCharge = deliverySpeed.includes('Rush') ? 800 : deliverySpeed.includes('Express') ? 400 : 0
  const totalAmount = basePrice + fabricCost + embellishmentCost + topSizeCharge + designCharge + finishingCharge + dupattaCharge + deliveryCharge

  function next() {
    setError('')
    if (step === 3 && topSize === 'Custom' && (!bust || !waist || !hip || !length)) {
      return setError('Please provide Bust, Waist, Hip, and Length for custom tailoring.')
    }
    if (step < 5) return setStep(step + 1)
    void handlePlaceOrder()
  }

  async function handlePlaceOrder() {
    setError('')
    if (!name.trim()) return setError('Please enter your full name.')
    if (!phone.trim() || phone.trim().length < 10) return setError('Please enter a valid 10-digit mobile number.')
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email address.')
    if (!street.trim()) return setError('Please enter your street address / apartment details.')
    if (!city.trim()) return setError('Please enter your city.')
    if (!pincode.trim() || pincode.trim().length < 6) return setError('Please enter a valid 6-digit PIN code.')

    const code = 'OC-' + Math.floor(100000 + Math.random() * 900000)
    const fullAddress = `${street}, Landmark: ${landmark || 'N/A'}, ${city}, ${stateName} - ${pincode}`
    const dateStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

    const invoiceData: OrderInvoiceData = {
      orderCode: code,
      date: dateStr,
      customer: {
        name,
        phone,
        altPhone,
        email,
        address: fullAddress,
        notes
      },
      summary: {
        collection: currentCollection.name,
        design: `${neckline} · ${sleeves}`,
        neckline,
        sleeves,
        hem,
        fabric,
        colour,
        embellishment,
        topSize: selectedSizeObj.label,
        delivery: deliverySpeed,
        payment: paymentMethod
      },
      breakdown: {
        base: basePrice,
        fabricCost,
        embellishmentCost,
        topSizeCharge,
        topSizeLabel: selectedSizeObj.label,
        designCharge,
        finishingCharge,
        dupattaCharge,
        deliveryCharge,
        total: totalAmount
      }
    }

    setLoading(true)
    try {
      const { data: { user } } = await createClient().auth.getUser()
      if (user) {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            design: {
              Collection: currentCollection.name,
              Neckline: neckline,
              Sleeves: sleeves,
              Hem: hem,
              Fabric: fabric,
              Colour: colour,
              Size: selectedSizeObj.label,
              Measurements: `${bust}/${waist}/${hip}/${length}`,
              Embellishment: embellishment,
              Delivery: deliverySpeed,
              Payment: paymentMethod
            },
            customer: {
              name,
              phone,
              altPhone,
              email,
              address: fullAddress,
              notes
            },
            orderCode: code,
            total: totalAmount
          })
        })
      }
    } catch (e) {
      console.warn('Order sync to backend notice:', e)
    }

    setLoading(false)
    setActiveInvoice(invoiceData)
  }

  return (
    <section className="atelier" id="atelier">
      <div className="steps">
        {steps.map((label, index) => (
          <button
            type="button"
            key={label}
            className={`step ${index === step ? 'active' : ''} ${index < step ? 'done' : ''}`}
            onClick={() => index <= step && setStep(index)}
          >
            {index + 1} <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="panel">
        <span className="tag">Step {step + 1} of 6 · Bespoke Atelier</span>
        <h2>
          {step === 0 && 'Choose your collection silhouette'}
          {step === 1 && 'Personalize necklines, sleeves & hem'}
          {step === 2 && 'Select luxury fabrics & artisanal palette'}
          {step === 3 && 'Tailoring size & body measurements'}
          {step === 4 && 'Embellishments, detailing & trims'}
          {step === 5 && 'Customer delivery & checkout'}
        </h2>
        <p className="sub">
          {step === 0 && 'Select a base aesthetic. Every piece is handcrafted in our atelier.'}
          {step === 1 && 'Customise every cut and proportion to complement your individual style.'}
          {step === 2 && 'Handpicked silks, linens, and organzas dyed in our atelier colors.'}
          {step === 3 && 'Standard preset sizes or enter exact inches for a sculpted fit.'}
          {step === 4 && 'Hand embroidery, zari, and custom finishing details.'}
          {step === 5 && 'Confirm shipping destination, delivery timeline, and generate your itemized invoice.'}
        </p>

        {/* STEP 0: COLLECTION */}
        {step === 0 && (
          <div className="collection-grid">
            {defaultCollections.map(col => (
              <button
                type="button"
                className={`collection-card ${collectionKey === col.key ? 'selected' : ''}`}
                key={col.key}
                onClick={() => setCollectionKey(col.key)}
              >
                <img src={col.image} alt={col.name} />
                <span className="collection-copy">
                  <strong>{col.name}</strong>
                  <small>{col.subtitle}</small>
                  <span className="price-tag-badge">From ₹{col.basePrice.toLocaleString('en-IN')}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {/* STEP 1: DESIGN OPTIONS */}
        {step === 1 && (
          <div style={{ display: 'grid', gap: '1.5rem', margin: '1.5rem 0' }}>
            <div>
              <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Neckline Cut
              </strong>
              <div className="radio-chips">
                {currentOptions.neckline.map(item => (
                  <button
                    type="button"
                    key={item}
                    className={`radio-chip ${neckline === item ? 'selected' : ''}`}
                    onClick={() => setNeckline(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Sleeve Styling
              </strong>
              <div className="radio-chips">
                {currentOptions.sleeves.map(item => (
                  <button
                    type="button"
                    key={item}
                    className={`radio-chip ${sleeves === item ? 'selected' : ''}`}
                    onClick={() => setSleeves(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Hemline & Flare
              </strong>
              <div className="radio-chips">
                {currentOptions.hem.map(item => (
                  <button
                    type="button"
                    key={item}
                    className={`radio-chip ${hem === item ? 'selected' : ''}`}
                    onClick={() => setHem(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--pale)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--gold)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--deep)' }}>
                <input
                  type="checkbox"
                  checked={customPatternCut}
                  onChange={e => setCustomPatternCut(e.target.checked)}
                />
                <span>Specialized custom pattern cutting surcharge (+16.7%, ₹{Math.round(basePrice / 6)})</span>
              </label>
            </div>
          </div>
        )}

        {/* STEP 2: FABRIC & COLOUR */}
        {step === 2 && (
          <div style={{ margin: '1.5rem 0' }}>
            <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.8rem' }}>
              Atelier Fabric
            </strong>
            <div className="swatch-grid">
              {fabricOptions.map(f => (
                <button
                  type="button"
                  key={f.name}
                  className={`swatch ${fabric === f.name ? 'selected' : ''}`}
                  onClick={() => setFabric(f.name)}
                >
                  <span className={`swatch-colour ${f.class}`} />
                  <strong>{f.name}</strong>
                  <small>{f.price > 0 ? `+₹${f.price}` : 'Included'}</small>
                </button>
              ))}
            </div>

            <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '1.8rem 0 0.8rem' }}>
              Palette Shade
            </strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {colourSwatches.map(c => (
                <button
                  type="button"
                  key={c.name}
                  onClick={() => setColour(c.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.5rem 0.9rem',
                    borderRadius: '24px',
                    border: colour === c.name ? '2px solid var(--gold)' : '1px solid var(--border)',
                    background: colour === c.name ? 'var(--pale)' : 'var(--white)',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ width: 20, height: 20, borderRadius: '50%', background: c.hex, border: '1px solid #ccc' }} />
                  <span style={{ fontSize: '0.82rem', color: 'var(--deep)' }}>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: MEASUREMENTS & SIZING */}
        {step === 3 && (
          <div style={{ margin: '1.5rem 0' }}>
            <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.8rem' }}>
              Select Size
            </strong>
            <div className="radio-chips">
              {topSizes.map(s => (
                <button
                  type="button"
                  key={s.value}
                  className={`radio-chip ${topSize === s.value ? 'selected' : ''}`}
                  onClick={() => setTopSize(s.value)}
                >
                  {s.label} {s.surcharge > 0 ? `(+${s.surcharge * 100}%)` : ''}
                </button>
              ))}
            </div>

            <div style={{ marginTop: '1.8rem' }}>
              <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.8rem' }}>
                Bespoke Measurements (Inches)
              </strong>
              <div className="fields">
                <label className="field">
                  Bust (inches)
                  <input type="number" min="20" max="60" value={bust} onChange={e => setBust(e.target.value)} />
                </label>
                <label className="field">
                  Waist (inches)
                  <input type="number" min="20" max="60" value={waist} onChange={e => setWaist(e.target.value)} />
                </label>
                <label className="field">
                  Hip (inches)
                  <input type="number" min="20" max="65" value={hip} onChange={e => setHip(e.target.value)} />
                </label>
                <label className="field">
                  Dress Length (inches)
                  <input type="number" min="20" max="70" value={length} onChange={e => setLength(e.target.value)} />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: EMBELLISHMENTS & FINISHING */}
        {step === 4 && (
          <div style={{ margin: '1.5rem 0' }}>
            <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.8rem' }}>
              Artisanal Embellishments
            </strong>
            <div className="embellishment-grid">
              {embellishments.map(emb => (
                <button
                  type="button"
                  key={emb.name}
                  className={`embellishment ${embellishment === emb.name ? 'selected' : ''}`}
                  onClick={() => setEmbellishment(emb.name)}
                >
                  <strong>{emb.name}</strong>
                  <small>{emb.desc}</small>
                  <span className="price-tag-badge">{emb.price > 0 ? `+₹${emb.price}` : 'Included'}</span>
                </button>
              ))}
            </div>

            <div style={{ marginTop: '1.8rem', display: 'grid', gap: '1rem' }}>
              <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Dupatta & Atelier Finishes
              </strong>
              <div className="radio-chips">
                {['Not Required', 'Matching (+₹400)', 'Embellished (+₹800)'].map(d => (
                  <button
                    type="button"
                    key={d}
                    className={`radio-chip ${dupatta === d ? 'selected' : ''}`}
                    onClick={() => setDupatta(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div style={{ background: 'var(--pale)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--gold)', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--deep)' }}>
                  <input
                    type="checkbox"
                    checked={finishingTrim}
                    onChange={e => setFinishingTrim(e.target.checked)}
                  />
                  <span>Handcrafted premium lining & edge finish (+25%, ₹{Math.round(basePrice / 4)})</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: CHECKOUT & DELIVERY DETAILS */}
        {step === 5 && (
          <div style={{ margin: '1.5rem 0' }}>
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.2rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.8rem', marginBottom: '0.8rem' }}>
                <strong>Creation Summary</strong>
                <span className="price-tag-badge">{currentCollection.name} Silhouette</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--brown)' }}>
                <div>Styling: {neckline} / {sleeves} ({hem})</div>
                <div>Fabric & Colour: {fabric} · {colour}</div>
                <div>Size: {selectedSizeObj.label} ({bust}/{waist}/{hip}/{length})</div>
                <div>Embellishment: {embellishment}</div>
              </div>
            </div>

            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.4rem', marginBottom: '1.5rem' }}>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--deep)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.6rem' }}>
                📦 Delivery Destination & Contact Details
              </strong>

              <div className="checkout-grid">
                <label className="field">
                  Full Name <span style={{ color: 'red' }}>*</span>
                  <input type="text" placeholder="Priya Sharma" value={name} onChange={e => setName(e.target.value)} required />
                </label>
                <label className="field">
                  Mobile Number (+91) <span style={{ color: 'red' }}>*</span>
                  <input type="tel" placeholder="98765 43210" value={phone} onChange={e => setPhone(e.target.value)} required />
                </label>
                <label className="field">
                  Alternate Phone (Optional)
                  <input type="tel" placeholder="Optional backup contact" value={altPhone} onChange={e => setAltPhone(e.target.value)} />
                </label>
                <label className="field">
                  Email Address <span style={{ color: 'red' }}>*</span>
                  <input type="email" placeholder="priya@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </label>
                <label className="field checkout-full">
                  House / Flat / Building No. & Street <span style={{ color: 'red' }}>*</span>
                  <input type="text" placeholder="Flat 402, Royal Palms, MG Road" value={street} onChange={e => setStreet(e.target.value)} required />
                </label>
                <label className="field">
                  Landmark (Optional)
                  <input type="text" placeholder="Near Lotus Temple" value={landmark} onChange={e => setLandmark(e.target.value)} />
                </label>
                <label className="field">
                  City <span style={{ color: 'red' }}>*</span>
                  <input type="text" placeholder="Kochi / Bengaluru / Mumbai" value={city} onChange={e => setCity(e.target.value)} required />
                </label>
                <label className="field">
                  State <span style={{ color: 'red' }}>*</span>
                  <select value={stateName} onChange={e => setStateName(e.target.value)} style={{ padding: '0.7rem', border: '1px solid var(--border)', borderRadius: '5px' }}>
                    <option value="Kerala">Kerala</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Other">Other State</option>
                  </select>
                </label>
                <label className="field">
                  PIN Code <span style={{ color: 'red' }}>*</span>
                  <input type="text" maxLength={6} placeholder="682001" value={pincode} onChange={e => setPincode(e.target.value)} required />
                </label>
                <label className="field checkout-full">
                  Special Tailoring Notes / Delivery Instructions
                  <textarea rows={2} placeholder="e.g. Extra seam margin inside, call before delivery" value={notes} onChange={e => setNotes(e.target.value)} />
                </label>
              </div>
            </div>

            {/* DELIVERY SPEED */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.2rem', marginBottom: '1.5rem' }}>
              <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.8rem' }}>
                🚀 Delivery Speed
              </strong>
              <div className="radio-chips">
                {['Standard (10–14 days)', 'Express (7 days) +₹400', 'Rush (3–5 days) +₹800'].map(speed => (
                  <button
                    type="button"
                    key={speed}
                    className={`radio-chip ${deliverySpeed === speed ? 'selected' : ''}`}
                    onClick={() => setDeliverySpeed(speed)}
                  >
                    {speed}
                  </button>
                ))}
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '8px', padding: '1.2rem' }}>
              <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.8rem' }}>
                💳 Payment Method
              </strong>
              <div className="radio-chips">
                {['UPI / GPay', 'Cash on Delivery (+₹100 COD Fee)'].map(pay => (
                  <button
                    type="button"
                    key={pay}
                    className={`radio-chip ${paymentMethod === pay ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod(pay)}
                  >
                    {pay}
                  </button>
                ))}
              </div>

              {paymentMethod === 'UPI / GPay' && (
                <div className="gpay-qr-box">
                  <img src="/sample-trending.jpg" alt="UPI QR Code" />
                  <div>
                    <div className="tag">Instant UPI Settlement</div>
                    <strong style={{ display: 'block', fontSize: '1.1rem', margin: '0.2rem 0' }}>Scan QR to Pay via Google Pay / PhonePe</strong>
                    <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: 0 }}>
                      After scanning, click Place Order below to generate and print your official atelier invoice.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* REAL-TIME PRICE SUMMARY BAR */}
        <div className="live-total-bar">
          <div>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', display: 'block' }}>
              Total Payable (Inclusive of All Taxes)
            </span>
            <div className="amount">₹{totalAmount.toLocaleString('en-IN')}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--muted)' }}>
            Base ₹{basePrice} · Fabric {fabricCost > 0 ? `+₹${fabricCost}` : '₹0'} · Embel {embellishmentCost > 0 ? `+₹${embellishmentCost}` : '₹0'}
          </div>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="actions">
          {step > 0 ? (
            <button type="button" className="btn alt" onClick={() => setStep(step - 1)}>
              Back
            </button>
          ) : (
            <span />
          )}
          <button type="button" className="btn" onClick={next} disabled={loading}>
            {loading ? 'Processing…' : step === 5 ? '✓ Place Order & Generate Bill' : 'Continue'}
          </button>
        </div>
      </div>

      {/* ITEMISED BILL / INVOICE MODAL */}
      <InvoiceModal
        order={activeInvoice}
        onClose={() => {
          setActiveInvoice(null)
          router.push('/orders')
        }}
      />
    </section>
  )
}
