import React, { useEffect, useState } from 'react'
import { ItemStatistik } from '../fragments/ItemStatistik'
import { useSpring, animated } from 'react-spring'
import AOS from 'aos'
import 'aos/dist/aos.css'


export const Statistik = ({ className }) => {
  function Number({ n }) {
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
      AOS.init({ duration: 1000 }); // Inisialisasi AOS
      const handleScroll = () => {
        const scrollY = window.scrollY;
        const elementOffset = document.getElementById('statistik').offsetTop;

        if (scrollY + window.innerHeight > elementOffset) {
          setIsVisible(true);
        }
      };
      window.addEventListener('scroll', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }, []);

    const { number } = useSpring({
      from: { number: 0 },
      number: isVisible ? n : 0,
      delay: 100,
      config: { duration: 5000 },
    })
    const formatter = new Intl.NumberFormat('id-ID', {
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return <animated.div>{number.to((n) => formatter.format(n))}</animated.div>;
  }

  return (
    <div className={`w-full ${className}`}>
      <div data-aos="fade-up" data-aos-once="true" className='max-w-xs xl:max-w-sm mb-14'>
        <h1 className='text-4xl text-white font-tomorrow xl:text-5xl'>Statistik Wisata</h1>
        <p className='text-base text-gray-400 font-secondary'>Data terkini pariwisata Lombok berdasarkan sumber terpercaya</p>
      </div>
      <div
        data-aos="fade"
        data-aos-once="true"
        id='statistik' className='flex flex-col w-full lg:flex-row space-y-11 lg:space-y-0 gap-x-11'>
        {/* Jumlah wisatawan */}
        <ItemStatistik className={``} >
          <ItemStatistik.Header header={'Jumlah Wisatawan'} />
          <ItemStatistik.Body
            Dom={
              <Number className={`text-putih-0`} n={15548} />
            }
            DomChild={`Domestik`}
            Man={<Number className={`text-putih-0`} n={6324} />}
            ManChild={`Mancanegara`}
          />
          <ItemStatistik.Footer footer={'Maret 2024'} />
        </ItemStatistik>
        {/* Pantai */}
        <ItemStatistik className={``}>
          <ItemStatistik.Header header={'Pantai & Gunung'} />
          <ItemStatistik.Body
            Dom={<Number className={`text-putih-0`} n={70} />}
            DomChild={`Pantai`}
            Man={<Number className={`text-putih-0`} n={1} />}
            ManChild={'Gunung'} />
          <ItemStatistik.Footer footer={`Mengingat lombok sama dengan mengingat alamnya, mempunyai 70 pantai dan 1 gunung terbesar selalu menjadi daya tarik bagi para wisatawan`} />
        </ItemStatistik>
        {/* Desa wisata */}
        <ItemStatistik className={``}>
          <ItemStatistik.Header header={'Desa wisata'} />
          <ItemStatistik.Body Man={<Number className={`text-putih-0`} n={63} />} />
          <ItemStatistik.Footer footer={`Keindahan tidak hanya tentang alam, karena selain alam, lombok juga memiliki 63 desa wisata yang selalu dapat dikunjungi para wisatawan`} />
        </ItemStatistik>
      </div>
    </div>
  )
}
