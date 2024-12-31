'use client'
import axios from 'axios';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import numberFormat from '@/app/utils/currency';
import { Loader } from "@/components/Loader"
import { BsChevronLeft } from 'react-icons/bs';

export const CatalogList = ({ session }) => {
    const [catalogs, setCatalogs] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [specialties, setSpecialties] = useState([]);
    const [selectedCatalog, setSelectedCatalog] = useState(null);
    const [loadingSpcialties, setLoadingSpecialties] = useState(true);
    const [selectedSpecialty, setSelectedSpecialty] = useState(null);
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchSpecialtiesAndCatalogs = async () => {
            try {
                const [specialtiesResponse, catalogsResponse] = await Promise.all([
                    axios.get('/api/specialties'),
                    axios.get('/api/catalog')
                ]);

                setSpecialties(specialtiesResponse.data);
                setCatalogs(catalogsResponse.data.catalogs);
                console.log("catalogs", catalogsResponse.data.catalogs);
                console.log("specialties", specialtiesResponse.data);
                setLoadingSpecialties(false);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchSpecialtiesAndCatalogs();
    }, []);

    const handleAgendarClick = () => {
        setIsLoading(true);
    };

    const handleSpecialtyClick = (specialty) => {
        console.log("----handleSpecialtyClick");
        const igual = specialty === selectedSpecialty;
        setSelectedSpecialty(igual ? null : specialty);
        if (igual) {
            setSelectedCategory(null);
            setSelectedService(null);
        };
        setServices(catalogs.filter(catalog => catalog.specialtyId === specialty._id));
    };

    const handleCategoryClick = (category) => {
        console.log(">>>handleCategoryClick", category);
        setSelectedCategory(category === selectedCategory ? null : category);
    };

    const handleBackClick = () => {
        console.log("handleBackClick");

        if (selectedCategory != null) {
            setSelectedCategory(null);
        } else {
            setSelectedSpecialty(null);
            setServices([]);
        }
    };

    return (<>
        <div id="seccion-catalogo" className="w-full h-80">
            <p className="ml-12 text-2xl text-[#EE64C5] mb-4 uppercase tracking-widest">Nuestro catálogo</p>
            <div className="absolute w-full h-80">
                <div className="relative letf-72 flex text-[#5A5A5A]">
                    {selectedCategory == null && selectedSpecialty && (<div className={`relative ${selectedCategory == null ? 'fadeIn' : 'fadeOut'} ml-8 left-72 z-20 mb-4 w-[560px] -top-10`}>
                        <div className="flex items-center mb-4 cursor-pointer justify-end" onClick={handleBackClick}>
                            <BsChevronLeft className="text-[#EE64C5] mr-2" />
                            <span className="text-lg text-[#EE64C5]">VOLVER</span>
                        </div>
                        <div className="w-full flex flex-wrap">
                            {services.map(service => (
                                <div key={service._id} className="hover:scale-110 mb-4">
                                    <span className="uppercase text-xs bg-slate-700 text-white rounded-md mr-4 mb-2 hover:bg-pink-700 p-2 cursor-pointer"
                                        onClick={() => {
                                            if (selectedSpecialty != null) {
                                                handleCategoryClick(service);
                                            }
                                        }}>{service.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>)}
                    {selectedCategory && (<div className={`relative fadeIn ml-8 left-72 z-20 mb-4 w-[560px] -top-10`}>
                        <div className="flex items-center mb-4 cursor-pointer justify-end" onClick={handleBackClick}>
                            <BsChevronLeft className="text-[#EE64C5] mr-2" />
                            <span className="text-lg text-[#EE64C5] uppercase">VOLVER</span>
                        </div>
                        <p className="text-[#EE64C5] mb-4 uppercase tracking-widest">
                            {selectedSpecialty.name || '??'}
                        </p>
                        <p className="mb-4 uppercase tracking-widest">
                            {selectedCategory.name}
                        </p>
                        <p>
                            {selectedCategory.description}
                        </p>
                        <div className="flex mt-4">
                            {isLoading ? (
                                <Loader />
                            ) : (
                                <Link className="p-0" href={`/checkout/${selectedCategory._id}`}>
                                    <button className="btn border-solid border-2 border-[#ea86cc] rounded-full overflow-hidden bg-[#EE64C5] font-extrabold text-xl py-1 px-9" id="btnReservar" onClick={handleAgendarClick}>
                                        <span>AGENDA</span>
                                    </button>
                                </Link>
                            )}
                        </div>
                    </div>)}
                </div>
                <div className="absolute top-0 flex">
                    <div className="w-1/2">
                        <div className="flex flex-wrap gap-4 relative ml-12">
                            {specialties.map((specialty, index) => (
                                <div key={specialty._id}
                                    className={`relative cursor-pointer w-32 h-20 transition-all duration-500 -mr-2 mt-6 mb-10 opacity-70 hover:opacity-100`}
                                    style={selectedSpecialty ? (selectedSpecialty === specialty ?
                                        { zIndex: 20, transform: `scale(2) translate(${32 - (index % 4) * 68}px, ${16 - Math.floor(index / 4) * 64}px)`, opacity: 1 } :
                                        { zIndex: index + 5, transform: `scale(1) translate(${32 - (index % 4) * 68}px, ${16 - Math.floor(index / 4) * 64}px)`, opacity: 0 }) : {}}
                                    onClick={() => handleSpecialtyClick(specialty)}>
                                    <img src={`/catalogo/${specialty.imgUrl}`} alt={specialty.name} className="w-full h-full object-cover rounded-tr-full" />
                                    <div className="bg-black bg-opacity-75 text-white text-center py-1 rounded-bl-full uppercase text-xs">
                                        {specialty.shortName}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative w-3/12">
                        <div className="relative left-12 mt-2">
                            <Image src="/hoja_03.png" width={180} height={180} alt="Decoración 3" className="float-right" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>)
}