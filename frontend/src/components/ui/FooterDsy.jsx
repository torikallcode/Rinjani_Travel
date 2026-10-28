import React from 'react'
import { Link } from 'react-router-dom'

export const FooterDsy = () => {
  return (
    <div className='flex flex-col items-center justify-center px-5 pt-10 pb-3 font-secondary md:px-11 xl:px-20 bg-abu-0'>
      <footer className="footer text-putih-0 p-5 lg:p-10 bg-abu-0 xl:max-w-[100rem] mx-auto">
        <aside>
          <Link
            className="text-2xl font-bold text-putih-0 font-tomorrow xl:text-3xl"
            activeClass="active"
            to="home"
            spy={true}
            smooth={true}
            duration={500}
          >
            TRVL.
          </Link>          <p>
            TRVL Industries Ltd.
            <br />
            Providing reliable tech since 2024
          </p>
        </aside>
        <nav>
          <h6 className="footer-title">Services</h6>
          <a className="">Trasportasi</a>
          <a className="">Akomodasi</a>
          <a className="">Paket wisata</a>
          <a className="">Asuransi</a>
        </nav>
        <nav>
          <h6 className="footer-title">Company</h6>
          <a className="link link-hover">Home</a>
          <a className="link link-hover">About us</a>
          <a className="link link-hover">Contact</a>
          <a className="link link-hover">Galery</a>
        </nav>
        <nav>
          <h6 className="footer-title">Legal</h6>
          <a className="link link-hover">Terms of use</a>
          <a className="link link-hover">Privacy policy</a>
          <a className="link link-hover">Cookie policy</a>
        </nav>
      </footer>
      <footer className="footer footer-center bg-abu-0 text-putih-0 p-4 border-t border-t-gray-400 xl:max-w-[100rem] mx-auto">
        <aside>
          <p>Copyright © {new Date().getFullYear()} - All right reserved by TRVL Industries Ltd</p>
        </aside>
      </footer>
    </div>
  )
}
