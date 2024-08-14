import React from 'react'
import { Link, animateScroll as ScrollLink } from 'react-scroll';
import { useState, useEffect, useRef } from 'react';
import { Dropdowndsy } from './Dropdowndsy';
export const NavbarDsy = ({ className }) => {

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
      <div className="drawer-content flex flex-col">
        {/* Navbar */}
        <div className={`w-full navbar md:px-8 xl:px-20 transition-all ease-linear ${scrolled ? ' bg-hitam-0 shadow-md' : 'bg-transparent'}`}>
          <div className='w-full mx-auto xl:max-w-[100rem]'>
            <div className="flex-1 px-2 font-tomorrow text-2xl xl:text-3xl font-bold text-white z-50">
              <Link
                activeClass="active"
                to="home"
                spy={true}
                smooth={true}
                duration={500}
              >
                TRVL.
              </Link>
            </div>
            <div className="flex-none justify-center items-center flex gap-x-5 lg:hidden z-10">
              <label className="swap swap-rotate">
                {/* this hidden checkbox controls the state */}
                <input type="checkbox" className="theme-controller" value="synthwave" />
                {/* sun icon */}
                <svg className="swap-off fill-white w-7 h-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" /></svg>
                {/* moon icon */}
                <svg className="swap-on fill-white w-7 h-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" /></svg>
              </label>
              <label onClick={handleClick} htmlFor="my-drawer-3" aria-label="open sidebar" className="btn btn-square btn-ghost">
                {aktif ? <svg xmlns="http://www.w3.org/2000/svg" fill='#ffffff' width="44" height="44" viewBox="0 0 24 24"><path d="m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414L10.535 12l-4.242 4.242 1.414 1.414 4.242-4.242 4.243 4.242 1.414-1.414L13.364 12l4.242-4.242z"></path></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" fill='#ffffff' width="44" height="44" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm4 5h12v2H8zm5 5h7v2h-7z"></path></svg>
                }
              </label>

            </div>
            <div className="flex-none hidden lg:block">
              <ul className="flex justify-center items-center gap-x-14">
                {/* Navbar menu content here */}
                <li className='text-white cursor-pointer text-base font-secondary'>
                  <Link
                    activeClass="active"
                    to="home"
                    spy={true}
                    smooth={true}
                    duration={500}
                    onClick={() => handleClick('home')}
                  >
                    Home
                  </Link>
                </li>
                <li className='text-white cursor-pointer text-base font-secondary'>
                  <Dropdowndsy></Dropdowndsy>
                </li>
                <li className='text-white cursor-pointer text-base font-secondary'>
                  <Link
                    activeClass="active"
                    to="service"
                    spy={true}
                    smooth={true}
                    offset={-300}
                    duration={500}
                    onClick={() => handleLinkClick('service')}
                  >
                    About
                  </Link>
                </li>
                <li className='text-white cursor-pointer text-base font-secondary'>
                  <Link
                    activeClass="active"
                    to="about"
                    spy={true}
                    smooth={true}
                    offset={-200}
                    duration={500}
                    onClick={() => handleLinkClick('about')}
                  >
                    Galery
                  </Link>
                </li>
                <li className='text-white cursor-pointer text-base font-secondary bg-biru-0 px-4 py-2 rounded-lg hover:bg-[#008e93]'>
                  <Link
                    activeClass="active"
                    to="contact"
                    spy={true}
                    smooth={true}
                    duration={500}
                    onClick={() => handleLinkClick('Contact')}
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
        <ul className="menu w-full min-h-full bg-hitam-0 flex justify-start py-32">
          {/* Sidebar content here */}
          <li onClick={closeSidebar} className='text-white cursor-pointer font-tomorrow text-3xl font-medium rounded-none hover:text-biru-0 '>
            <Link
              activeClass="active"
              to="home"
              spy={true}
              smooth={true}
              duration={500}
              onClick={closeSidebar}
            >
              Home
            </Link>
          </li>
          <li onClick={closeSidebar} className='text-white cursor-pointer font-tomorrow text-3xl font-medium rounded-none hover:text-biru-0 '>
            <Link
              activeClass="active"
              to="service"
              spy={true}
              smooth={true}
              offset={-80}
              duration={500}
              onClick={closeSidebar}
            >
              service
            </Link>
          </li>
          <li onClick={closeSidebar} className='text-white cursor-pointer font-tomorrow text-3xl font-medium rounded-none hover:text-biru-0 '>
            <Link
              activeClass="active"
              to="about"
              spy={true}
              smooth={true}
              offset={-80}
              duration={500}
              onClick={closeSidebar}
            >
              About
            </Link>
          </li>
          <li onClick={closeSidebar} className='text-white cursor-pointer font-tomorrow text-3xl font-medium rounded-none hover:text-biru-0 '>
            <Link
              activeClass="active"
              to="contact"
              spy={true}
              smooth={true}
              offset={-80}
              duration={500}
              onClick={closeSidebar}
            >
              Contact us
            </Link>
          </li>
        </ul>
        <footer className="footer footer-center p-10 bg-transparent text-base-content rounded absolute bottom-0">
          <nav>
            <div className="grid grid-flow-col gap-4 opacity-50">
              <a><svg xmlns="http://www.w3.org/2000/svg" fill='#ffffff' width="18" height="18" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg></a>
              <a><svg xmlns="http://www.w3.org/2000/svg" fill='#ffffff' width="18" height="18" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path></svg></a>
              <a><svg xmlns="http://www.w3.org/2000/svg" fill='#ffffff' width="18" height="18" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg></a>
            </div>
          </nav>
          <aside>
            <p className='text-white font-secondary font-light text-xs opacity-50'>Copyright © 2024 - All right reserved by ACME Industries Ltd</p>
          </aside>
        </footer>
      </div>
    </div >
  )
}
