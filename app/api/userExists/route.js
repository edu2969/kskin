import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    console.log("HASTA ACA BIEN...");
    await connectMongoDB();
    console.log("POR ACA PASA");
    const { email } = await req.json();
    const user = await User.findOne({ email }).select("_id");
    return NextResponse.json({ user });
  } catch (error) {
    console.log(error);
  }
}