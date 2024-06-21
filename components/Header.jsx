'use client'
import Link from 'next/link';
import { useEffect, useState } from 'react';

export const Header = ({ session }) => {
    const [scrolled, setScrolled] = useState(false);   

    console.log("SESSION", session);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    function scrollToSection(id) {
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -80; // Ajusta esto para cambiar el margen superior
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }

    return (<nav
        className={`z-40 fixed top-0 w-full transition-all duration-300 ${scrolled ? 'bg-transparent shadow-md scale-90 -mt-1' : 'bg-transparent'
            }`}
        style={{ backdropFilter: scrolled ? 'blur(10px)' : 'none' }}
    >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="w-full mx-auto mb-4">
                <div className="w-full flex justify-center">
                    <div className="flex mr-20">
                        {session?.user ? <Link className="p-0 m-0" href="/admin">
                            <img width={42} height={60} className="mr-2 mt-2" src="/simple-logo-transparent.png" alt="logo KSkin" />
                        </Link> 
                        : <img width={42} height={60} className="mr-2 mt-2" src="/simple-logo-transparent.png" alt="logo KSkin" />}                        
                    </div>
                    <div className="flex space-x-6 mt-4 text-[#A4A5A1] text-lg">
                        <p className="hover:text-black hover:underline cursor-pointer uppercase tracking-widest">Inicio</p>
                        <p className="hover:text-black hover:underline cursor-pointer uppercase tracking-widest"
                            onClick={() => { scrollToSection('seccion-catalogo')}}>Catálogo</p>
                        <p className="hover:text-black hover:underline cursor-pointer uppercase tracking-widest"
                        onClick={() => { scrollToSection('seccion-profesionales')}}>Profesionales</p>
                        {/*<Link className='text-lg p-0 text-[#A4A5A1]' href="/historia">
                            <p className="hover:text-black hover:underline cursor-pointer uppercase tracking-widest">Historia</p>
                        </Link>*/}
                        <p className="hover:text-black hover:underline cursor-pointer uppercase tracking-widest"
                            onClick={() => { scrollToSection('seccion-contacto')}}>Contacto</p>
                    </div>
                </div>
            </div>
        </div>
    </nav>)
}
