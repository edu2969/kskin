import { connectMongoDB } from '@/lib/mongodb';
import Catalog from '@/models/Catalog';
import { NextResponse } from 'next/server';

export async function POST(req) {
  console.log("POST...")
  try {
    const { services } = await req.json();
    await connectMongoDB();

    const result = await Catalog.insertMany(services);
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error saving catalog:', error);
    return NextResponse.status(500).json({ ok: false, error: error.message });
  }
}