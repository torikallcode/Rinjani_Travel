import { ContactLayout } from '@/components/layouts/ContactLayout'
import React from 'react'

export const Contact = () => {
  return (
    <div className="App bg-hitam-0">
      <ContactLayout />
      {/* Content di bawah section */}
      <div className="h-screen bg-hitam-0">
        <p className="p-10">
          Scroll down to see more content...
        </p>
      </div>
    </div>

  )
}
