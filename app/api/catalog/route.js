import { connectMongoDB } from '@/lib/mongodb';
import Catalog from '@/models/Catalog';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    await connectMongoDB();
    const catalogs = await Catalog.find({});
    return NextResponse.json(catalogs);
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return NextResponse.status(500).json({ ok: false, error: error.message });
  }
}