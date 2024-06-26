import { connectMongoDB } from '@/lib/mongodb';
import User from '@/models/user';
import { NextResponse } from 'next/server';

export async function GET(req, res) {
  try {
    await connectMongoDB();
    const users = await User.find({}, 'name email').lean();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.status(500).json({ ok: false, error: error.message });
  }
}