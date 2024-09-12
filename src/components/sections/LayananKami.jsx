import React from 'react'
import { CardLayananKami } from '../fragments/Cards/CardLayananKami'
import { Akomodasi } from '../elements/icons/Akomodasi'
import { Transportasi } from '../elements/icons/Transportasi'
import { Paketwisata } from '../elements/icons/Paketwisata'
import { Ansuransi } from '../elements/icons/Ansuransi'

export const LayananKami = ({ classname }) => {

  const items = [{
    icon: <Akomodasi size={40} />,
    title: 'Akomodasi',
    desc: 'Temukan hotel impian Anda di destinasi wisata favorit!'
  }, {
    icon: <Transportasi size={40} />,
    title: 'Transportasi',
    desc: 'Jelajahi destinasi wisata dengan mudah dan nyaman'
  }, {
    icon: <Paketwisata size={40} />,
    title: 'Paket Wisata',
    desc: 'Dapatkan pengalaman wisata yang tak terlupakan'
  }, {
    icon: <Ansuransi size={40} />,
    title: 'Asuransi',
    desc: 'Lindungi diri Anda dan keluarga Anda dengan asuransi'
  }

  ]

  return (
    <section
      id='service'
      className={`flex flex-col mx-auto ${classname}`}>
      <div className='grid grid-cols-1 gap-2 mx-auto sm:grid-cols-2 lg:grid-cols-4'>
        {items.map((item, index) => (
          <CardLayananKami key={index} icon={item.icon} title={item.title} desc={item.desc} />
        ))}
      </div>
    </section>
  )
}
