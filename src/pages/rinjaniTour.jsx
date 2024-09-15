import React, { useState } from 'react'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import { DataTour } from '@/data/DataTour'
import { CardTracking } from '@/components/fragments/Cards/CardTracking'

export const Tour = () => {

  const [dataTours, setDataTours] = useState(DataTour)
  return (
    <div className="App bg-hitam-0 ">
      <AuthLayout
        title={'Rinjani Tour'}
        desc={'Nikmati perjalanan eksklusif ke Gunung Rinjani, dirancang untuk memberikan pengalaman mendaki yang memadukan petualangan dan keindahan alam Lombok.'}
        children={
          <div className="grid w-full grid-cols-1 mx-auto mb-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-7 lg:gap-y-7 gap-x-7">
            {dataTours.map((item, index) => (
              <div key={index}>
                <CardTracking
                  id={item.id}
                  image={item.image}
                  title={item.title}
                  days={item.days}
                  desc={item.desc}
                  rating={item.rating}
                  price={item.price}
                  aspect='aspect-[7/8]'
                  classname={'w-full'}
                />
              </div>
            ))}
          </div>
        }
      />
    </div>
  )
}
