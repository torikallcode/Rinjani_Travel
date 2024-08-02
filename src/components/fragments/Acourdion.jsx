import React from 'react'

export const Acourdion = ({ children }) => {
  return (
    <>
      <div className="collapse collapse-arrow bg-base-200">
        <input type="radio" name="my-accordion-2" defaultChecked />
        <div className="collapse-title text-xl font-medium">Click to open this one and close others</div>
        <div className="collapse-content">
          {children}
        </div>
      </div>
    </>
  )
}
