'use client'
import { useEffect, useState } from 'react';

export const Header = () => {
    const [scrolled, setScrolled] = useState(false);

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


    return (<nav
        className={`z-40 fixed top-0 w-full transition-all duration-300 ${scrolled ? 'bg-transparent shadow-md scale-90 -mt-1' : 'bg-transparent'
            }`}
        style={{ backdropFilter: scrolled ? 'blur(10px)' : 'none' }}
    >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="w-full mx-auto mb-4">
                <div className="w-full flex justify-center">
                    <div className="flex mr-20">
                        <img width={42} height={60} className="mr-2 mt-2" src="/simple-logo-transparent.png" alt="logo KSkin" />
                    </div>
                    <div className="flex space-x-6 mt-4 text-[#A4A5A1] text-lg">
                        <p className="hover:text-black hover:underline cursor-pointer uppercase tracking-widest">Inicio</p>
                        <p className="hover:text-black hover:underline cursor-pointer uppercase tracking-widest">Servicios</p>
                        <p className="hover:text-black hover:underline cursor-pointer uppercase tracking-widest">Profesionales</p>
                        <p className="hover:text-black hover:underline cursor-pointer uppercase tracking-widest">Historia</p>
                        <p className="hover:text-black hover:underline cursor-pointer uppercase tracking-widest">Contacto</p>
                    </div>
                </div>
            </div>
        </div>
    </nav>)
}
