import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Specialty from "@/models/specialty";

export async function GET(req) {
  try {
    await connectMongoDB();    
    const specialties = await Specialty.find({ active: true }).lean();    
    return NextResponse.json(specialties);
  } catch (error) {
    console.error('Error fetching specialties:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}