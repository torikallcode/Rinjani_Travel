import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DataTracking } from '@/data/DataTracking'; // Ensure this is the correct path

export const DetailTrekking = () => {
  const { id } = useParams();
  const [trekking, setTrekking] = useState({});

  useEffect(() => {
    const trekkingData = DataTracking.find(item => item.id.toString() === id);
    //mengembalikan elemen pertama dalam array kemudian  memeriksa apakah id yang sudah diubah menjadi string dari item tersebut sama dengan id dari parameter DataTracking
    setTrekking(trekkingData || {});
  }, [id]);

  console.log(trekking);

  return (
    <div>
      <h1>Detail: {id}</h1>
      {trekking ? (
        <>
          <p>Title: {trekking.title}</p>
          <p>Days: {trekking.days}</p>
          <p>Description: {trekking.desc}</p>
          <img src={trekking.image} alt={trekking.title} />
          <p>Rating: {trekking.rating}</p>
          <p>Price: ${trekking.price}</p>
        </>
      ) : (
        <p>Trekking details not found.</p>
      )}
    </div>
  );
};
