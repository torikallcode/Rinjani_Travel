import React from 'react'

export const SideGalery = () => {
  return (
    <div className="w-full rounded-md">
      <header className="w-full bg-biru-0 h-full">
        <h1 className="text-white font-tomorrow text-lg py-3 px-3 text-start">Support</h1>
      </header>
      <div className="w-full grid grid-cols-2 gap-3 content-stretch py-3">
        <div
          style={{ backgroundImage: `url(/img/mandalika.webp)` }}
          className='h-32 w-full bg-cover bg-center'
        >
        </div>
        <div
          style={{ backgroundImage: `url(/img/DesaSade.jpg)` }}
          className='h-32 w-full bg-cover bg-center'
        >
        </div>
        <div
          style={{ backgroundImage: `url(/img/Rinjani.jpg)` }}
          className='h-32 w-full bg-cover bg-center'
        >
        </div>
        <div
          style={{ backgroundImage: `url(/img/trawangan.jpg)` }}
          className='h-32 w-full bg-cover bg-center'
        >
        </div>
      </div>
    </div >
  )
}
