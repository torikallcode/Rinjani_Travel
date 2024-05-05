import React, { useState, useRef } from 'react'
import { Instagram } from '../elements/icons/Instagram'
import { Facebook } from '../elements/icons/Facebook'
import { WhatsApp } from '../elements/icons/WhatsApp'
import { Email } from '../elements/icons/Email'
import { Link } from 'react-scroll'

export const Footer = () => {

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
    <footer className="footer bg-abu-0 text-base-content w-full px-5 md:px-11 xl:px-28 py-10 xl:max-w-[100rem] mx-auto">
      <nav>
        <h6 className="text-gray-300 footer-title">Layanan</h6>
        <h2 className="text-gray-300">Akomodasi</h2>
        <h2 className="text-gray-300">Transportasi</h2>
        <h2 className="text-gray-300">Paket wisata</h2>
        <h2 className="text-gray-300">Asuransi</h2>
      </nav>
      <nav>
        <h6 className="text-gray-300 footer-title">Company</h6>
        <h2 className="text-gray-300 link link-hover">
          <Link
            activeClass="active"
            to="home"
            spy={true}
            smooth={true}
            duration={500}
          >
            Home
          </Link>
        </h2>
        <h2 className="text-gray-300 link link-hover">
          <Link
            activeClass="active"
            to="about"
            spy={true}
            smooth={true}
            offset={-200}
            duration={500}
            onClick={() => handleLinkClick('about')}
          >
            About
          </Link>
        </h2>
        <h2 className="text-gray-300 link link-hover">
          <Link
            to="galery"
          >
            Galery
          </Link>
        </h2>
        <h2 className="text-gray-300 link link-hover">
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
        </h2>
      </nav>
      <nav>
        <h6 className="text-gray-300 footer-title">Social</h6>
        <div className="grid grid-flow-col gap-4">
          <Instagram size={24} warna={'#d1d5db'}></Instagram>
          <Facebook size={24} warna={'#d1d5db'}></Facebook>
          <WhatsApp size={24} warna={'#d1d5db'}></WhatsApp>
          <Email size={24} warna={'#d1d5db'}></Email>
        </div>
      </nav>
    </footer>
  )
}
