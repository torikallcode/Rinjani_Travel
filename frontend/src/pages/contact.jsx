import React from 'react'
import { AuthLayout } from '@/components/layouts/AuthLayout'
import { ContactMe } from '@/components/sections/ContactMe'

export const Contact = () => {
  return (
    <div className="App bg-hitam-0 ">
      <AuthLayout
        title={'Trekking Summit'}
        desc={'Nikmati perjalanan eksklusif ke Gunung Rinjani, dirancang untuk memberikan pengalaman mendaki yang memadukan petualangan dan keindahan alam Lombok.'}
        children={
          <ContactMe />
        }
        gmp={
          <div className='flex items-center justify-center w-full h-full '>
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14457.123557722494!2d116.54109658007094!3d-8.656765165859417!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dcc4f40a1f4bfcf%3A0xd7eaf20dbfcd8711!2sTaman%20Rinjani%20Selong!5e0!3m2!1sid!2sid!4v1714786329714!5m2!1sid!2sid"
              className='w-full h-72 xl:h-80'
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        }
      />

    </div>

  )
}
