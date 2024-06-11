"use client";

import { FaInstagram, FaFacebook, FaWhatsapp } from 'react-icons/fa';

export const Contact = () => {
    return (
        <div id="seccion-contacto" className="mx-8 flex items-center justify-center">
            <div className="w-full flex items-center overflow-hidden">
                <div className="w-1/2 p-4">
                    <img src="/mapa_01.png" alt="Mapa" className="w-full rounded-xl" />
                </div>
                <div className="w-1/2 p-4 rounded-r-lg">
                    <div className="text-[#EE64C5] text-lg mb-4 uppercase tracking-widest">Concepción</div>
                    <div className="text-gray-600 mb-4">Cocharne 1298, oficina 102, 1er piso.</div>
                    <div className="text-[#EE64C5] text-lg mb-4 uppercase tracking-widest">Teléfono e email</div>
                    <div className="text-gray-600 mb-4">+56 9 9999 9999</div>
                    <div className="text-gray-600 mb-8">contacto@kskin.cl</div>
                    <div className="text-[#EE64C5] text-lg mb-2 uppercase tracking-widest">Redes sociales</div>
                    <div className="flex space-x-4">
                        <FaInstagram className="text-[#EE64C5] text-2xl" />
                        <FaFacebook className="text-[#EE64C5] text-2xl" />
                        <FaWhatsapp className="text-[#EE64C5] text-2xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}