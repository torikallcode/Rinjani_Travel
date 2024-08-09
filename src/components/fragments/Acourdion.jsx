import React from 'react'

export const Acourdion = ({ children, judulHari }) => {
  return (
    <>
      <div className="collapse collapse-arrow bg-abu-0 bg-opacity-50 my-3">
        <input type="radio" name="my-accordion-2" />
        <div className="collapse-title text-base font-medium text-putih-0">
          <p>{judulHari}</p>
        </div>
        <div className="collapse-content">
          {children}
        </div>
      </div>
    </>
  )
}
