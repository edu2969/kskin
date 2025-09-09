"use client"
import { useState } from "react"
import axios from 'axios';
import * as XLSX from 'xlsx';
import { useSession } from 'next-auth/react';

export const ImportCatalog = () => {
    const [file, setFile] = useState(null);
    const { data: session } = useSession();

    useEffect(() => {
        if(status === 'loading') return;
        if(session && session.user && session.user?.role) {
            setRole(session.user.role);
        }
    }, [session, setRole, status]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            // Rename keys to more suitable MongoDB attribute names in English
            const formattedData = jsonData.map((item) => ({
                id: item.ID,
                name: item.Nombre,
                price: item.Precio,
                durationMins: Number(item.Duración),
                serviceCategory: item['Categoría de servicio'],
                description: item.Descripción,
                reserveOnline: item['Reservar online'] == 'Sí',
                priceVisibleOnMiniSite: item['Precio Visible mini sitio'] == 'Sí',
                vat: item.IVA == 'Sí',
                salesCommission: item['Comisión de Venta'],
                commissionType: item['Tipo de comisión'],
                sessions: item.Sesiones == 'Sí',
                sessionCount: item['Cantidad de sesiones'],
                groupService: item['Servicio Grupal'] == 'Sí',
                groupCapacity: item['Capacidad de grupo'],
                homeService: item['Servicio a domicilio'] == 'Sí',
            }));
            await axios.post('/api/upload-catalog', { services: formattedData });
            alert('File uploaded successfully');
        };
        reader.readAsBinaryString(file);
    };

    return (<div className="max-w-screen-lg m-auto bg-white overflow-x-hidden pb-24">
        <div className="mt-6 ml-24 space-x-4">            
            <p className="text-primary text-xl uppercase tracking-widest">Subir catálogo</p>
            <div className="flex justify-start mt-6">
                <div className="w-2/3">
                <input className="relative m-0 w-full min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary"
                    type="file" onChange={handleFileChange} />
                </div>
                <button
                    className="btn ml-6 border-solid border-2 border-[#ea86cc] rounded-full overflow-hidden bg-[#EE64C5] font-extrabold text-xl py-1 px-9"
                    onClick={handleUpload}>
                    <span>SUBIR</span>
                </button>
            </div>
        </div>
    </div>)
}