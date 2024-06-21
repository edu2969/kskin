import { connectMongoDB } from '@/lib/mongodb';
import Catalog from '@/models/Catalog';
import Specialty from '@/models/Specialty';
import Specialist from '@/models/Specialist';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await connectMongoDB();
    const { id } = await req.json();
    console.log("ID", id);
    const specialist = await Specialist.findOne({ userId: id }).lean();
    console.log("IDS", specialist.specialtyIds);
    const catalogs = await Catalog.find({ specialtyId: { $in: specialist.specialtyIds }}).lean();      
    const catalogsDecorated = await Promise.all(
      catalogs.map(async (catalog) => {
        const specialty = await Specialty.findById(catalog.specialtyId).lean();
        return {
          ...catalog,
          specialty,
        };
      })
    );
    return NextResponse.json(catalogsDecorated);
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
