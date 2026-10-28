import React, { useState, useEffect } from 'react'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import { CardTracking } from '@/components/fragments/Cards/CardTracking'
import { fetchPackages } from '@/services/api'

export const TrekkingSummit = () => {
  const [dataTrekking, setDataTrekking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPackages = async () => {
      setLoading(true)
      const allPackages = await fetchPackages()
      const trekking = allPackages.filter(pkg => pkg.category === 'trekking')
      setDataTrekking(trekking)
      setLoading(false)
    }
    loadPackages()
  }, [])

  return (
    <div className="App bg-hitam-0 ">
      <AuthLayout
        title={'Trekking Summit'}
        desc={'Nikmati perjalanan eksklusif ke Gunung Rinjani, dirancang untuk memberikan pengalaman mendaki yang memadukan petualangan dan keindahan alam Lombok.'}
        children={
          loading ? (
            <p className='text-white py-10'>Loading packages...</p>
          ) : (
            <div className="grid w-full grid-cols-1 mx-auto mb-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-7 lg:gap-y-7 gap-x-7">
              {dataTrekking.map((item, index) => (
                <div key={index}>
                  <CardTracking
                    id={item.slug}
                    image={item.image}
                    title={item.title}
                    days={item.days}
                    desc={item.description}
                    rating={item.rating}
                    price={item.base_price}
                    aspect='aspect-[7/8]'
                    classname={'w-full'}
                  />
                </div>
              ))}
            </div>
          )
        }
      />
    </div>
  )
}
