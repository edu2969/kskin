import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import dayjs from 'dayjs';
import Specialist from '@/models/specialist';
import Catalog from '@/models/catalog';
import Schedule from '@/models/schedule';

const WORK_HOURS_START = 8; // 8 AM
const WORK_HOURS_END = 19; // 7 PM

const getAvailableTimes = (schedules, durationMins, cleanUpMins) => {
  const availableTimes = [];
  let currentTime = dayjs().hour(WORK_HOURS_START).minute(0).second(0);

  while (currentTime.hour() < WORK_HOURS_END) {
    const endTime = currentTime.add(durationMins, 'minute');
    const nextSlotTime = endTime.add(cleanUpMins, 'minute');

    if (endTime.hour() > WORK_HOURS_END) break;

    const isSlotAvailable = !schedules.some(schedule => {
      const scheduleStart = dayjs(schedule.startDate);
      const scheduleEnd = scheduleStart.add(schedule.duration, 'minute');
      return (
        currentTime.isBetween(scheduleStart, scheduleEnd, null, '[)') ||
        endTime.isBetween(scheduleStart, scheduleEnd, null, '(]') ||
        scheduleStart.isBetween(currentTime, endTime, null, '[)')
      );
    });

    if (isSlotAvailable) {
      availableTimes.push(currentTime.format('HH:mm'));
    }

    currentTime = nextSlotTime;
  }

  return availableTimes;
};

export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const catalogId = searchParams.get('catalogId');

    // Obtener el servicio del catálogo
    const catalog = await Catalog.findById(catalogId);
    if (!catalog) {
      return NextResponse.json({ message: 'Catalog item not found' }, { status: 404 });
    }

    // Obtener especialistas con la especialidad requerida
    const specialists = await Specialist.find({ specialtyIds: catalog.specialtyId, active: true });

    if (specialists.length === 0) {
      return NextResponse.json({ message: 'No specialists found for this specialty' }, { status: 404 });
    }

    // Obtener agendas de los especialistas para los próximos 5 días
    const now = dayjs();
    const end = now.add(5, 'day');

    const schedules = await Schedule.find({
      specialistId: { $in: specialists.map(s => s._id) },
      startDate: { $gte: now.toDate(), $lte: end.toDate() }
    });

    // Crear el arreglo de disponibilidad para los próximos 5 días
    const availability = [];
    for (let i = 0; i < 5; i++) {
      const day = now.add(i, 'day');
      const daySchedules = schedules.filter(schedule =>
        dayjs(schedule.startDate).isSame(day, 'day')
      );

      const availableTimes = getAvailableTimes(daySchedules, catalog.durationMins, catalog.cleanUpMins);
      availability.push({
        day: day.format('YYYY-MM-DD'),
        availableTimes
      });
    }

    return NextResponse.json(availability);
  } catch (error) {
    return NextResponse.json({ message: 'An error occurred', error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
}