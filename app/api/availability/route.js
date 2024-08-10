import { connectMongoDB } from "@/lib/mongodb";
import dayjs from 'dayjs';
import Catalog from '../../models/catalog';
import Specialist from '../../models/specialist';
import Schedule from '../../models/schedule';

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
        return (currentTime.isBetween(scheduleStart, scheduleEnd, null, '[)') ||
                endTime.isBetween(scheduleStart, scheduleEnd, null, '(]') ||
                scheduleStart.isBetween(currentTime, endTime, null, '[)'));
      });
  
      if (isSlotAvailable) {
        availableTimes.push(currentTime.format('HH:mm'));
      }
  
      currentTime = nextSlotTime;
    }
  
    return availableTimes;
  };
  
  export default async function handler(req, res) {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  
    const { catalogId, clientId } = req.query;
  
    try {
      await connectMongoDB();
  
      // Obtener el servicio del catálogo
      const catalog = await Catalog.findById(catalogId);
      if (!catalog) {
        return res.status(404).json({ message: 'Catalog item not found' });
      }
  
      // Obtener especialistas con la especialidad requerida
      const specialists = await Specialist.find({ specialtyIds: catalog.specialtyId, active: true });
  
      if (specialists.length === 0) {
        return res.status(404).json({ message: 'No specialists found for this specialty' });
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
  
      res.status(200).json(availability);
    } catch (error) {
      res.status(500).json({ message: 'An error occurred', error });
    }
  }