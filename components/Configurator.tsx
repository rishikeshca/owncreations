'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const steps = ['Style', 'Design', 'Fabric', 'Measurements', 'Embellishments', 'Order']
const collections = [
  { key: 'Trending', subtitle: 'The season&apos;s most-loved silhouettes', image: '/sample-trending.jpg', options: ['Draped saree dress', 'Statement midi', 'Gathered maxi'] },
  { key: 'Casuals', subtitle: 'Effortless pieces for every day', image: '/casuals.jpg', options: ['Relaxed shirt dress', 'Cotton A-line', 'Easy wrap dress'] },
  { key: 'Modern', subtitle: 'Clean lines, considered details', image: '/modern.jpg', options: ['Structured bodycon', 'Minimal column', 'Modern co-ord'] },
  { key: 'Crop Tops', subtitle: 'Playful separates, made yours', image: '/casuals.jpg', options: ['Square neck crop', 'Peplum top', 'Corset crop'] },
]
const fabrics = ['Silk', 'Linen', 'Cotton', 'Velvet', 'Organza']
const embellishments = ['Hand embroidery', 'Pearls', 'Lace trim', 'Sequins', 'No embellishment']
const imageUrl = (name: string) => name.startsWith('/') ? name : '/sample-trending.jpg'

type Design = Record<string, string>

export default function Configurator() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<Design>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const update = (key: string, value: string) => setData(current => ({ ...current, [key]: value }))
  const selectedCollection = collections.find(item => item.key === data.Collection)

  function next() {
    setError('')
    if (step === 0 && !data.Collection) return setError('Choose a collection to continue.')
    if (step === 1 && !data.Design) return setError('Choose a design to continue.')
    if (step === 2 && !data.Fabric) return setError('Choose a fabric to continue.')
    if (step === 3 && ['Bust', 'Waist', 'Hip', 'Length'].some(field => !data[field])) return setError('Add all four measurements to continue.')
    if (step === 4 && !data.Embellishments) return setError('Choose a finishing detail to continue.')
    if (step < 5) return setStep(step + 1)
    void placeOrder()
  }

  async function placeOrder() {
    setLoading(true)
    const { data: { user } } = await createClient().auth.getUser()
    if (!user) return router.push('/login?next=/')
    const response = await fetch('/api/orders', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ design: data }) })
    if (!response.ok) {
      const result = await response.json()
      setError(result.error || 'Could not save order')
      setLoading(false)
    } else router.push('/orders')
  }

  return (
    <section className="atelier" id="atelier">
      <div className="steps">{steps.map((label, index) => <button type="button" key={label} className={`step ${index === step ? 'active' : ''} ${index < step ? 'done' : ''}`} onClick={() => index <= step && setStep(index)}>{index + 1} <span>{label}</span></button>)}</div>
      <div className="panel">
        <span className="tag">Step {step + 1} of 6</span>
        <h2>{steps[step] === 'Embellishments' ? 'Embellishments & finishing' : steps[step] === 'Order' ? 'Review & place order' : steps[step] === 'Style' ? 'Choose your dress style' : steps[step] === 'Design' ? 'Choose your design' : `Choose your ${steps[step].toLowerCase()}`}</h2>
        <p className="sub">{step === 0 ? 'Begin with a collection. Every piece is then tailored to your measurements.' : 'Thoughtfully chosen details make the final piece entirely yours.'}</p>

        {step === 0 && <div className="collection-grid">{collections.map(collection => <button type="button" className={`collection-card ${data.Collection === collection.key ? 'selected' : ''}`} key={collection.key} onClick={() => update('Collection', collection.key)}><img src={imageUrl(collection.image)} alt={`${collection.key} collection`} /><span className="collection-copy"><strong>{collection.key}</strong><small>{collection.subtitle}</small></span></button>)}</div>}
        {step === 1 && <div className="design-grid">{(selectedCollection?.options || collections[0].options).map((option, index) => <button type="button" className={`design-card ${data.Design === option ? 'selected' : ''}`} key={option} onClick={() => update('Design', option)}><img src={imageUrl(index === 0 ? (selectedCollection?.image || '/sample-trending.jpg') : index === 1 ? '/modern.jpg' : '/casuals.jpg')} alt={option} /><strong>{option}</strong><small>Made to your measurements</small></button>)}</div>}
        {step === 2 && <div className="swatch-grid">{fabrics.map(fabric => <button type="button" className={`swatch ${data.Fabric === fabric ? 'selected' : ''}`} key={fabric} onClick={() => update('Fabric', fabric)}><span className={`swatch-colour ${fabric.toLowerCase()}`} /><strong>{fabric}</strong><small>Beautifully considered texture</small></button>)}</div>}
        {step === 3 && <div className="fields">{['Bust', 'Waist', 'Hip', 'Length'].map(field => <label className="field" key={field}>{field} (inches)<input type="number" min="1" value={data[field] || ''} onChange={event => update(field, event.target.value)} /></label>)}</div>}
        {step === 4 && <div className="embellishment-grid">{embellishments.map(item => <button type="button" className={`embellishment ${data.Embellishments === item ? 'selected' : ''}`} key={item} onClick={() => update('Embellishments', item)}><strong>{item}</strong><small>{item === 'No embellishment' ? 'Quietly beautiful' : 'Finished by hand in our atelier'}</small></button>)}</div>}
        {step === 5 && <div className="notice review"><strong>Your custom creation</strong>{Object.entries(data).map(([key, value]) => <div key={key}><span>{key}</span>{value}</div>)}<p>Estimated delivery: 7–14 working days after your order is confirmed.</p></div>}
        {error && <p className="error">{error}</p>}
        <div className="actions">{step > 0 ? <button type="button" className="btn alt" onClick={() => setStep(step - 1)}>Back</button> : <span />}{<button type="button" className="btn" onClick={next} disabled={loading}>{loading ? 'Saving…' : step === 5 ? 'Place order' : 'Continue'}</button>}</div>
      </div>
    </section>
  )
}
