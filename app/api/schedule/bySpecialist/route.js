import { connectMongoDB } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import Schedule from '@/models/Schedule';
import User from '@/models/user';
import Specialist from '@/models/Specialist';

export async function POST(req) {
    try {
      console.log("POST /api/schedule/bySpecialist");
      const { id } = await req.json();
      await connectMongoDB();
      const user = await User.findById(id).lean();
      const specialist = await Specialist.findOne({ userId: id }).lean();
      const schedule = await Schedule.find({ specialistIds: specialist._id }).lean();
      return NextResponse.json(schedule);
    } catch (error) {
      console.error('Error fetching catalog:', error);
      return NextResponse.status(500).json({ ok: false, error: error.message });
    }
  }