'use client'

import { useEffect, useRef } from 'react'

export default function Home() {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    // Listen for order messages from the atelier page
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'OWN_CREATIONS_ORDER_PLACED') {
        try {
          await fetch('/api/orders', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(event.data.payload)
          })
        } catch (e) {
          console.warn('Backend order sync error:', e)
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', zIndex: 10 }}>
      <iframe
        ref={iframeRef}
        src="/atelier.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
        title="Own Creations — Custom Dress Atelier"
      />
    </div>
  )
}
