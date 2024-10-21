import { connectMongoDB } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import Catalog from '@/models/Catalog';
import Specialty from '@/models/Specialty';

export async function GET(req, { params }) {
  try {
    await connectMongoDB();
    
    const { catalogId } = params;
    console.log("GET /api/catalog/[catalogId]/route.js", catalogId, params);
    
    if (!catalogId) {
      return NextResponse.json({ ok: false, error: "Missing catalogId" }, { status: 400 });
    }

    const catalog = await Catalog.findOne({ id: catalogId }).lean();
    if (!catalog) {
      return NextResponse.json({ ok: false, error: "Catalog not found" }, { status: 404 });
    }

    const specialty = await Specialty.findOne({ _id: catalog.specialtyId }).lean();
    catalog.specialtyName = specialty.name;

    return NextResponse.json({ ok: true, catalog });
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}