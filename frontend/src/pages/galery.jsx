import { AuthLayout } from '@/components/layouts/AuthLayout'
import React from 'react'
import { FocusCardsDemo } from '@/FocusCardsDemo';

export const Galery = () => {
  return (
    <div className='w-full min-h-screen bg-hitam-0'>
      <AuthLayout
        title={'Galery'}
        desc={'Jelajahi koleksi foto-foto menakjubkan dari berbagai sudut Gunung Rinjani dan sekitarnya, menangkap momen-momen indah yang mungkin Anda alami dalam perjalanan Anda.'}
        children={
          <FocusCardsDemo />
        }
      />
    </div>
  )
}
