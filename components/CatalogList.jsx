'use client'
import axios from 'axios';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import numberFormat from '@/app/utils/currency';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';

export const CatalogList = ({ session }) => {
    const [catalogs, setCatalogs] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedService, setSelectedService] = useState(null);

    useEffect(() => {
        const fetchCatalogs = async () => {
            try {
                const response = await axios.get('/api/catalog');
                console.log("DATA", response.data);

                var categories = []
                var fullCatalog = {}
                response.data.forEach(d => {
                    if (categories.indexOf(d.specialty.name) == -1) {
                        categories.push(d.specialty.name);
                        fullCatalog[d.specialty.name] = [d];
                    } else {
                        fullCatalog[d.specialty.name].push(d);
                    }
                })
                setCatalogs(fullCatalog);
                setSelectedCategory(categories[0])
                setSelectedService(null)
            } catch (error) {
                console.error('Error fetching catalog:', error);
            }
        };

        fetchCatalogs();
    }, []);

    const handleCategoryClick = (category) => {
        setSelectedCategory(category === selectedCategory ? null : category);
        setSelectedService(null);
    };

    const handleServiceClick = (service) => {
        setSelectedService(service === selectedService ? null : service);
    };

    return (<>
        <div id="seccion-catalogo" className="w-full">
            <p className="ml-12 text-2xl text-[#EE64C5] mb-4 uppercase tracking-widest">Nuestro catálogo</p>
            <div className="flex text-[#5A5A5A]">
                <div className="w-1/2 px-4 border-r-2 border-[#d3d3d3]">
                    <div className="ml-8 mt-6 w-[420px] text-ellipsis text-nowrap overflow-x-hidden">
                        {Object.keys(catalogs).map((category) => (
                            <div key={category}>
                                <p
                                    className="flex text-lg uppercase cursor-pointer text-[#5A5A5A] mb-4 hover:text-black"
                                    onClick={() => handleCategoryClick(category)}
                                >
                                    {selectedCategory === category ? <IoIosArrowDown className="mt-1 mr-2"/> : <IoIosArrowUp className="mt-1 mr-2"/>} {category}
                                </p>
                                {selectedCategory === category && (
                                    <div className="text-sm pl-4">
                                        {catalogs[category].map((service) => (
                                            <p
                                                key={service.id}
                                                className={`cursor-pointer mb-2 ${selectedService === service ? 'text-[#EE64C5]' : 'text-[#5A5A5A]'} hover:text-[#EE64C5]`}
                                                onClick={() => handleServiceClick(service)}
                                            >
                                                {service.name}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="w-full pl-4">
                    {selectedService && (
                        <div className="fadeIn ml-8 mt-6 w-[420px]">
                            <p className="text-[#EE64C5] mb-4 uppercase tracking-widest">
                                {selectedService.specialty?.name || '??'}
                            </p>
                            <p className="mb-4">
                                {selectedService.name}
                            </p>
                            <p>
                                {selectedService.description}
                            </p>
                            <div className="flex mt-4">
                                <Link href={`/checkout/${selectedService.id}`}>
                                    <button className="btn border-solid border-2 border-[#ea86cc] rounded-full overflow-hidden bg-[#EE64C5] font-extrabold text-xl py-1 px-9"
                                        id="btnReservar"
                                    >
                                        <span>AGENDA</span>
                                    </button>
                                </Link>
                                <p className="text-nowrap mt-8 ml-4">
                                    <span className="font-bold text-[#EE64C5] text-xl">${numberFormat(selectedService?.price || 0)}</span>{selectedService.sesions && `selectedService.sessionCount /sesiones`} 
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="relative w-1/2 -right-80 -bottom-12">
                        <img src="/hoja_03.png" width="250" alt="Decoración" />
                    </div>
                </div>

            </div>
        </div>
    </>)
}