import { connectMongoDB } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Catalog from '@/models/Catalog';
import Schedule from '@/models/Schedule';
import Specialist from '@/models/Specialist';
import { image } from 'd3';

export async function POST(req) {
  try {
    await connectMongoDB();
    const { id, specialistId, clientId, clientName, email, phone, catalogId, startDate, durationMins, cleanUpMins, allDay, fromDate, toDate, noAvailables } = await req.json();
    console.log("POSTING", { id, specialistId, clientId, clientName, email, phone, catalogId, startDate, durationMins, cleanUpMins, allDay, fromDate, toDate, noAvailables });

    let schedule;
    if (id) {
      schedule = await Schedule.findByIdAndUpdate(id, { specialistId, clientId, clientName, email, phone, catalogId, startDate, durationMins, cleanUpMins, allDay, fromDate, toDate, noAvailables }, { new: true });
    } else {
      const reg = { specialistId, clientId, clientName, email, phone, catalogId, startDate, durationMins, cleanUpMins, allDay, fromDate, toDate, noAvailables };
      console.log("CREATING", reg);
      schedule = await Schedule.create(reg);
    }
    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error saving schedule:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    console.log("REQ!");
    await connectMongoDB();
    
    const url = new URL(req.url);
    const date = url.searchParams.get('date');
    const catalogId = url.searchParams.get('catalogId');

    if (!date || !catalogId) {
      return NextResponse.json({ ok: false, error: "Missing date or catalogId" }, { status: 400 });
    }

    const catalog = await Catalog.findOne({ id: catalogId }).lean();
    if (!catalog) {
      return NextResponse.json({ ok: false, error: "Catalog not found" }, { status: 404 });
    }

    const { durationMins, cleanUpMins } = catalog;
    const totalServiceTime = durationMins + (cleanUpMins ?? 0);
    console.log("Duration", durationMins, cleanUpMins, totalServiceTime);

    const startOfDay = new Date(date);
    startOfDay.setHours(9, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(19, 0, 0, 0);

    const specialists = await Specialist.find({
      active: true,
      startDate: { $lte: startOfDay },
      endDate: { $gte: endOfDay }
    }).lean();

    const schedules = await Schedule.find({
      startDate: { $gte: startOfDay, $lt: endOfDay }
    }).lean();

    const lunchBreakStart = new Date(date);
    lunchBreakStart.setHours(13, 0, 0, 0);
    const lunchBreakEnd = new Date(date);
    lunchBreakEnd.setHours(14, 0, 0, 0);

    const availableSlots = [];

    let currentTime = new Date(startOfDay);

    while (currentTime < endOfDay) {
      const slotStart = new Date(currentTime);
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + totalServiceTime);

      if (slotStart >= lunchBreakStart && slotStart < lunchBreakEnd) {
        currentTime.setHours(14, 0, 0, 0); // Skip lunch break
        continue;
      }

      const isSlotAvailable = specialists.some(specialist => {
        const specialistSchedules = schedules.filter(schedule => schedule.specialistId.toString() === specialist._id.toString());
        return !specialistSchedules.some(schedule => {
          const scheduleStart = new Date(schedule.startDate);
          const scheduleEnd = new Date(scheduleStart);
          scheduleEnd.setMinutes(scheduleEnd.getMinutes() + schedule.duration);
          return (slotStart < scheduleEnd && slotEnd > scheduleStart);
        });
      });

      if (isSlotAvailable) {
        availableSlots.push(slotStart);
      }

      currentTime.setMinutes(currentTime.getMinutes() + totalServiceTime);

      const minutes = currentTime.getMinutes();
      if (minutes % 30 !== 0) {
        currentTime.setMinutes(minutes + (30 - (minutes % 30)));
      }
    }

    return NextResponse.json(availableSlots);
  } catch (error) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}