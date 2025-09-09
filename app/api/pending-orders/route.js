import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Catalog from "@/models/catalog";
import Order from "@/models/order";
import Schedule from "@/models/schedule";
import Specialist from "@/models/specialist";
import Specialty from "@/models/specialty";
import User from "@/models/user";
import dayjs from 'dayjs';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/utils/authOptions";

export async function GET(req) {
  try {
    await connectMongoDB();
    
    const session = await getServerSession(authOptions);
    console.log("REQ!", session);
    if (!session) {
      return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
    }

    const clientId = session.user.id;

    const schedules = await Schedule.find({ clientId }).lean();

    const enrichedSchedules = await Promise.all(schedules.map(async (item) => {
      console.log("ITEM >>>>", item);
      const catalog = await Catalog.findById(item.catalogId).lean();
      const specialty = await Specialty.findById(catalog.specialtyId).lean();
      const specialists = await Specialist.find({ _id: { $in: item.specialistIds }}).lean();
      const users = await User.find({ _id: { $in: specialists.map(s => s.userId) }}).lean();
      const order = await Order.findById(item.orderId).lean();
      console.log("---", catalog, specialty, specialists, users, order);
      return {
        id: item._id,
        catalogId: catalog._id,
        specialtyName: specialty.shortName,
        serviceImage: specialty.urlImg,
        serviceName: catalog.name,
        startTime: dayjs(item.startDate).format('HH:mm'),
        endTime: dayjs(item.startDate).add(item.duration, 'minutes').format('HH:mm'),
        date: dayjs(item.startDate).format('YYYY-MM-DD'),
        specialistNames: users.map(s => s.name),
        specialistAvatars: users.map(s => s.avatarImg),
        price: order.amount,
        paid: order.amount - order.remainingBalance,
        description: catalog.description,
        durationMins: catalog.durationMins + (catalog.cleanUpMins ?? 0),
      };
    }));
    console.log("Enriched schedules:", enrichedSchedules);
    return NextResponse.json(enrichedSchedules);
  } catch {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}