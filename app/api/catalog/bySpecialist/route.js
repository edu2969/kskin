import { connectMongoDB } from '@/lib/mongodb';
import Catalog from '@/models/catalog';
import Specialty from '@/models/specialty';
import Specialist from '@/models/specialist';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await connectMongoDB();
    const { id } = await req.json();
    const specialist = await Specialist.findOne({ userId: id }).lean();
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
