import { connectMongoDB } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import Schedule from '@/models/schedule';

export async function POST(req, { params }) {
    try {
        await connectMongoDB();
        const { date } = await req.json();
        const { id } = params;
        console.log("ID", id);

        if (!id || !date) {
            return NextResponse.json({ ok: false, error: "Missing id or date" }, { status: 400 });
        }

        const updatedSchedule = await Schedule.findByIdAndUpdate(id, { startDate: new Date(date) }, { new: true }).lean();
        if (!updatedSchedule) {
            return NextResponse.json({ ok: false, error: "Schedule not found" }, { status: 404 });
        }

        return NextResponse.json(updatedSchedule);
    } catch (error) {
        console.error('Error updating schedule:', error);
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
}