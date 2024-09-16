import React from 'react'
import { animateScroll as ScrollLink } from 'react-scroll';
import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react';
import { Dropdowndsy } from './Dropdowndsy';
export const NavbarDsy = ({ className, labelDarkMode }) => {

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);


  // sidebar
  const [aktif, setAktif] = useState(false)
  const handleClick = () => {
    setAktif(!aktif)
  }


  function closeSidebar() {
    document.getElementById("my-drawer-3").checked = false;
    setAktif(!aktif)
    window.scrollTo({ top: 0 });
  }

  // goto
  const [activeLink, setActiveLink] = useState(null);
  const navRef = useRef(null);

  const handleLinkClick = (section) => {
    setActiveLink(section);
  };

  const scrollToSection = (section) => {
    const element = navRef.current.querySelector(`[id="${section}"]`);
    element.scrollIntoView({ behavior: 'smooth' });
  };


  return (
    <div className={`drawer ${className} drawer-end`}>
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
      <div className="flex flex-col drawer-content">
        {/* Navbar */}
        <div className={`w-full navbar md:px-8 xl:px-20 transition-all ease-linear ${scrolled ? ' bg-hitam-0 shadow-md' : 'bg-transparent'}`}>
          <div className='w-full mx-auto xl:max-w-[90rem]'>
            <div className="z-50 flex-1 px-1 text-2xl font-bold text-white font-tomorrow xl:text-3xl">
              <Link
                activeclass="active"
                to="/"

                yyy
                duration={500}
                onClick={() => window.scrollTo({ top: 0 })}

              >
                TRVL.
              </Link>
            </div>
            <div className="z-10 flex items-center justify-center flex-none gap-x-5 lg:hidden">
              {labelDarkMode}
              <label onClick={handleClick} htmlFor="my-drawer-3" aria-label="open sidebar" className="btn btn-square btn-ghost">
                {aktif ? <svg xmlns="http://www.w3.org/2000/svg" fill='#ffffff' width="44" height="44" viewBox="0 0 24 24"><path d="m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414L10.535 12l-4.242 4.242 1.414 1.414 4.242-4.242 4.243 4.242 1.414-1.414L13.364 12l4.242-4.242z"></path></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" fill='#ffffff' width="44" height="44" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm4 5h12v2H8zm5 5h7v2h-7z"></path></svg>
                }
              </label>

            </div>
            <div className="flex-none hidden lg:block">
              <ul className="flex items-center justify-center gap-x-14">
                {/* Navbar menu content here */}
                <li className='text-base text-white cursor-pointer font-secondary'>
                  <Link
                    activeclass="active"
                    to="/"

                    yyy
                    duration={500}
                    onClick={() => window.scrollTo({ top: 0 })}
                  >
                    Home
                  </Link>
                </li>
                <li className='text-base text-white cursor-pointer font-secondary'>
                  <Dropdowndsy></Dropdowndsy>
                </li>
                <li className='text-base text-white cursor-pointer font-secondary'>
                  <Link
                    activeclass="active"
                    to="/galery"

                    yyy
                    offset={-200}
                    duration={500}
                    onClick={() => window.scrollTo({ top: 0 })}
                  >
                    Galery
                  </Link>
                </li>
                <li className='text-base text-white cursor-pointer font-secondary'>
                  <Link
                    activeclass="active"
                    to="/about"

                    yyy
                    offset={-200}
                    duration={500}
                    onClick={() => window.scrollTo({ top: 0 })}
                  >
                    About
                  </Link>
                </li>
                <li className={`text-white cursor-pointer text-base font-secondary overflow-hidden rounded-lg ${scrolled ? 'bg-biru-0' : 'bg-hitam-0'}`}>
                  <Link
                    to="/contact"
                    onClick={() => window.scrollTo({ top: 0 })}
                    className='flex w-full h-full px-4 py-2'
                  >
                    Contact us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* Page content here */}
      </div>
      <div className="drawer-side ">
        <label htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="flex justify-start w-full min-h-full py-32 menu bg-hitam-0">
          {/* Sidebar content here */}
          <li onClick={closeSidebar} className='text-3xl font-medium text-white rounded-none cursor-pointer font-tomorrow hover:text-biru-0 '>
            <Link
              activeclass="active"
              to="/" yyy
              duration={500}
              onClick={closeSidebar}
            >
              Home
            </Link>
          </li>
          <li onClick={closeSidebar} className='text-3xl font-medium text-white rounded-none cursor-pointer font-tomorrow hover:text-biru-0 '>
            <Link
              activeclass="active"
              to="/rinjaniTour" yyy
              offset={-80}
              duration={500}
              onClick={closeSidebar}
            >
              Rinjani Tour
            </Link>
          </li>
          <li onClick={closeSidebar} className='text-3xl font-medium text-white rounded-none cursor-pointer font-tomorrow hover:text-biru-0 '>
            <Link
              activeclass="active"
              to="/trekkingSummit" yyy
              offset={-80}
              duration={500}
              onClick={closeSidebar}
            >
              Trekking Summit
            </Link>
          </li>
          <li onClick={closeSidebar} className='text-3xl font-medium text-white rounded-none cursor-pointer font-tomorrow hover:text-biru-0 '>
            <Link
              activeclass="active"
              to="/galery" yyy
              offset={-80}
              duration={500}
              onClick={closeSidebar}
            >
              Galery
            </Link>
          </li>
          <li onClick={closeSidebar} className='text-3xl font-medium text-white rounded-none cursor-pointer font-tomorrow hover:text-biru-0 '>
            <Link
              activeclass="active"
              to="/about" yyy
              offset={-80}
              duration={500}
              onClick={closeSidebar}
            >
              About
            </Link>
          </li>
          <li onClick={closeSidebar} className='text-3xl font-medium text-white rounded-none cursor-pointer font-tomorrow hover:text-biru-0 '>
            <Link
              activeclass="active"
              to="/contact" yyy
              offset={-80}
              duration={500}
              onClick={closeSidebar}
            >
              Contact us
            </Link>
          </li>
        </ul>
        <footer className="absolute bottom-0 p-10 bg-transparent rounded footer footer-center text-base-content">
          <nav>
            <div className="grid grid-flow-col gap-4 opacity-50">
              <a><svg xmlns="http://www.w3.org/2000/svg" fill='#ffffff' width="18" height="18" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg></a>
              <a><svg xmlns="http://www.w3.org/2000/svg" fill='#ffffff' width="18" height="18" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg></a>
              <a><svg xmlns="http://www.w3.org/2000/svg" fill='#ffffff' width="18" height="18" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg></a>
            </div>
          </nav>
          <aside>
            <p className='text-xs font-light text-white opacity-50 font-secondary'>Copyright © 2024 - All right reserved by ACME Industries Ltd</p>
          </aside>
        </footer>
      </div>
    </div >
  )
}
