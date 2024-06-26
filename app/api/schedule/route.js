import { connectMongoDB } from '@/lib/mongodb'
import { NextResponse } from 'next/server'
import Catalog from '@/models/Catalog'
import Schedule from '@/models/Schedule'
import User from '@/models/user';

export async function POST(req) {
  try {
    await connectMongoDB();
    const { id, specialistId, 
      clientId, clientName, email, phone, catalogId, serviceId, startDate, 
      durationMins, cleanUpMins, noAvailables 
    } = await req.json();
    console.log("POSTING", { id, specialistId, 
      clientId, clientName, email, phone, catalogId, serviceId, startDate, 
      durationMins, cleanUpMins, noAvailables 
    })
    const catalog = await Catalog.findOne({ _id: catalogId }).lean();
    if(catalog) {
      await Catalog.findByIdAndUpdate(catalogId, {
        durationMins, cleanUpMins
      })
    }
    let client = clientId ? await User.findOne({ _id: clientId }).lean() : false;
    if(clientId) {
      await User.findByIdAndUpdate(clientId, {
        name: clientName,
        phone: phone,
      })
    }
    if(!clientId && clientName) {
      client = await User.create({
        email, clientName, phone, role: "client", password: "test",
      })
    }
    let schedule;    
    if (id) {
      schedule = await Schedule.findByIdAndUpdate(
        id,
        !client
        ? { specialistId, startDate, durationMins, noAvailables }
        : { specialistId, clientId, catalogId, serviceId, startDate, durationMins, cleanUpMins },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).lean();
    } else {
      schedule = await Schedule.create(!client ? {
        specialistId, startDate, durationMins, cleanUpMins, noAvailables
      } : {
        specialistId, clientId, catalogId, serviceId, startDate, durationMins, cleanUpMins
      });
    }
    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error saving schedule:', error);
    return NextResponse.status(500).json({ ok: false, error: error.message });
  }
}
