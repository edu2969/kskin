export const Promotions = () => {
    return (
        <div className="relative w-full flex justify-center items-center py-12 mt-12">
            <div className="relative w-full mx-24 bg-[#F2F2F2] rounded-xl p-8 shadow-md flex items-center">
                <div className="absolute top-[-35px] left-[-35px] w-32 h-32">
                    <img src="/hoja_05.png" alt="hoja decorativa 1" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-[-35px] right-[-35px] w-32 h-32">
                    <img src="/hoja_04.png" alt="hoja decorativa 2" className="w-full h-full object-cover" />
                </div>
                <div className="w-2/5 h-full flex">
                    <img src="/masaje_oferta.png" alt="Masaje con piedras" className="w-full h-full object-cover relative top-8 -left-8 rounded-xl" />
                </div>
                <div className="flex flex-col items-start text-left ml-8 w-3/5">
                    <div className="flex space-x-4">
                        <p className="text-[#EE64C5] text-xl font-bold uppercase mb-2">Rostro</p>
                        <p className="text-gray-700 text-lg font-medium">ahorrate un 20%</p>
                    </div>
                    <p className="text-gray-600 mt-4 mb-6">
                        Ingresa tu email y recibe un cupón de un 20% de descuento en tu siguiente sesión de masaje con piedras.
                    </p>
                    <div className="relative w-full">
                        <input
                            type="email"
                            placeholder="Ingresa tu email"
                            className="w-full pl-4 pr-20 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-[#EE64C5]"
                        />
                        <button className="absolute right-0 top-0 bottom-0 bg-[#EE64C5] text-white px-6 py-2 rounded-full hover:bg-[#d953a9] focus:outline-none">
                            LO QUIERO
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};