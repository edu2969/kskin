import { connectMongoDB } from '@/lib/mongodb';
import User from '@/models/user';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await connectMongoDB();
    const clients = await User.find({ role: "client" }, "email name phone").lean();
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.status(500).json({ ok: false, error: error.message });
  }
}