"use client"
import { useState } from "react"
import axios from 'axios';
import * as XLSX from 'xlsx';

export const AdminPanel = ({ session }) => {
    const [file, setFile] = useState(null);

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
                duration: item.Duración,
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

    return (<div className="nav fixed top-0 left-0 z-10">
        <h1>Upload Catalog</h1>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload</button>
    </div>)
}