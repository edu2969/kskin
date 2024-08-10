import { connectMongoDB } from '@/lib/mongodb'
import { NextResponse } from 'next/server'
import Catalog from '@/models/Catalog'
import Schedule from '@/models/Schedule'
import User from '@/models/user';

export async function POST(req) {
  try {
    await connectMongoDB();
    const { id, specialistId, 
      clientId, clientName, email, phone, catalogId, startDate, 
      durationMins, cleanUpMins, allDay, fromDate, toDate, noAvailables 
    } = await req.json();
    console.log("POSTING", { id, specialistId, 
      clientId, clientName, email, phone, catalogId, startDate, 
      durationMins, cleanUpMins, allDay, fromDate, toDate, noAvailables 
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
    let reg = clientId != undefined ? {
      specialistId, clientId, catalogId, startDate, duration: durationMins 
    } : {
      specialistId, startDate
    }
    if(allDay != undefined) {
      reg.allDay = true;
    }
    if(fromDate != undefined) {
      reg.fromDate = fromDate;
      reg.toDate = toDate;
      reg.noAvailables = noAvailables;
    }
    if (id) {  
      console.log("UPDATING", reg);    
      schedule = await Schedule.findByIdAndUpdate(
        id,
        reg,
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).lean();
    } else {
      console.log("CREATING", reg);
      schedule = await Schedule.create(reg);
    }
    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error saving schedule:', error);
    return NextResponse.status(500).json({ ok: false, error: error.message });
  }
}
