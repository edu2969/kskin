import { connectMongoDB } from '@/lib/mongodb';
import Catalog from '@/models/Catalog';
import Specialty from '@/models/Specialty';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { services } = await req.json();
    console.log("POST...", services);
    await connectMongoDB();

    // Crear un hash de especialidades para acceso rápido
    const hash = {};
    const specialties = await Specialty.find();
    specialties.forEach(s => {
      hash[s.name] = s;
    });

    // Crear especialidades que no existen y actualizar el hash
    for (const service of services) {
      if (!hash[service.serviceCategory]) {
        const newSpec = await Specialty.create({
          name: service.serviceCategory,
          startDate: new Date(),
          endDate: new Date("12-31-2099"),
          active: true,
        });
        hash[service.serviceCategory] = newSpec;
      }
    }

    // Preparar operaciones de bulkWrite
    const operations = services.map(service => {
      const specialtyId = hash[service.serviceCategory]._id;

      return {
        updateOne: {
          filter: { id: service.id },
          update: {
            $set: {
              name: service.name.trim(),
              description: service.description?.trim(),
              price: service.price,
              duration: service.duration,
              specialtyId,
              reserveOnline: service.reserveOnline || true,
              priceVisibleOnMiniSite: service.priceVisibleOnMiniSite,
              vat: service.vat,
              salesCommission: service.salesCommission || 0,
              commissionType: service.commissionType || 'VALUE',
              sessionCount: service.session ? service.sessionCount : 0,
              groupCapacity: service.groupService ? service.groupCapacity : 0,
              homeService: service.homeService
            },
          },
          upsert: true, // Esto inserta el documento si no existe
        }
      };
    });

    // Ejecutar operaciones de bulkWrite
    const result = await Catalog.bulkWrite(operations);
    console.log("bulkWrite result:", result);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error saving catalog:', error);
    return NextResponse.status(500).json({ ok: false, error: error.message });
  }
}
