import { connectMongoDB } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import Schedule from '@/models/Schedule';

export async function POST(req) {
    try {
      const { id } = await req.json();
      await connectMongoDB();
      const schedule = await Schedule.find({ specialistId: id }).lean()
      return NextResponse.json(schedule);
    } catch (error) {
      console.error('Error fetching catalog:', error);
      return NextResponse.status(500).json({ ok: false, error: error.message });
    }
  }