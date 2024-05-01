import React, { useState, useEffect } from 'react';

export const Navbar = () => {
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

  return (
    <nav
      className={`w-full z-50 py-5  px-32 ${scrolled ? ' bg-hitam-0 shadow-md' : 'bg-transparent'
        } fixed top-0 transition-all duration-300 ease-out`}
      style={{
        backdropFilter: scrolled ? 'blur(7px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(7px)' : 'none',
      }}
    >
      <div className="container mx-auto">
        {/* Your Navbar content goes here */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* <a href="#" className={`text-4xl font-semibold font-tomorrow text-secondary tracking-wide text-white uppercase`}>
              logo.
            </a> */}
          </div>

          <div className="hidden md:flex items-center space-x-10">
            <a href="#" className="font-tomorrow text-putih-0 text-lg">
              Home
            </a>
            <a href="#" className="font-tomorrow text-putih-0 text-lg">
              About
            </a>
            <a href="#" className="font-tomorrow text-putih-0 text-lg">
              Galery
            </a>
            <a href="#" className={`px-3 py-2 rounded-lg text-putih-0 font-tomorrow transition-all ease-in-out duration-300 hover:bg-[#009ba0] hover:text-slate-100 ${scrolled ? 'bg-[#009ba0] text-hitam-0 font-medium' : 'bg-[#009ba0] font-medium'}`}>
              contact us
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

