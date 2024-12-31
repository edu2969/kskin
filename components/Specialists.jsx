"use client";

const PROFESIONALES = [{
    id: 1,
    imagen: 'profesionales/cata.png',
    nombre: 'Catalina Troncoso',
    titulo: 'Estilista Profesional',
}, {
    id: 2,
    imagen: 'profesionales/alexa.png',
    nombre: 'Alexa Meya',
    titulo: 'Estética facial',
}, {
    id: 3,
    imagen: 'profesionales/karen.png',
    nombre: 'Karen Troncoso',
    titulo: 'Kinesióloga',
}, {
    id: 4,
    imagen: 'profesionales/marcela.png',
    nombre: 'Marcela Guzmán',
    titulo: 'Estética facial',
}]

export const Specialists = () => {
    return (
        <div id="seccion-profesionales">
            <p className="ml-12 my-12 text-2xl text-[#EE64C5] mb-4 uppercase tracking-widest">Nuestros especialistas</p>
            <div className="w-full flex justify-center items-center flex-col mt-12">
                <div className="flex justify-center space-x-12">
                    {PROFESIONALES.map((profesional) => (
                        <div key={profesional.id} className="text-center">
                            <div className="w-40 h-40 rounded-full overflow-hidden mx-auto mb-4">
                                <img src={profesional.imagen} alt={profesional.nombre} className="w-full h-full object-cover" />
                            </div>
                            <p className="text-[#EE64C5] text-xl uppercase">{profesional.nombre}</p>
                            <p className="text-[#5A5A5A] text-base uppercase tracking-widest">{profesional.titulo}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}