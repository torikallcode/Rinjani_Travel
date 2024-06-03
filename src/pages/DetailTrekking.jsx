import React, { useEffect, useState } from 'react';
import { TrekkingLayout } from '@/components/layouts/TrekkingLayout';

export const DetailTrekking = () => {
  return (
    <div className='bg-hitam-0 w-full min-h-screen'>
      <TrekkingLayout></TrekkingLayout>
    </div>
  );
};


{/* {trekking ? (
        <>
          <p>Title: {trekking.title}</p>
          <p>Days: {trekking.days}</p>
          <p>Description: {trekking.desc}</p>
          <img src={`/${trekking.image}`} />
          <p>Rating: {trekking.rating}</p>
          <p>Price: ${trekking.price}</p>
        </>
      ) : (
        <p>Trekking details not found.</p>
      )} */}