"use client"
import { useState } from 'react';
import dayjs from 'dayjs';
import { Dialog, DialogTitle, Description } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const events = [
  {
    id: 1,
    name: 'Masaje de Relax',
    time: '09:00 - 10:30',
    description: 'Un masaje relajante de 1 hora y 30 minutos',
    color: 'green',
    price: '$50.00',
    sessions: null,
    day: dayjs().startOf('week').add(1, 'day').toDate(), // Lunes de la semana actual
  },
  {
    id: 2,
    name: 'Terapia de Piel',
    time: '11:00 - 12:00',
    description: 'Una terapia de piel de 1 hora',
    color: 'red',
    price: '$30.00',
    sessions: 5,
    day: dayjs().startOf('week').add(2, 'day').toDate(), // Martes de la semana actual
  },
  // Agrega más eventos según sea necesario
];

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

const hours = Array.from({ length: 12 }, (_, i) => `${i + 8}:00`);

export const Calendar = ({ session, height }) => {
  const [currentWeek, setCurrentWeek] = useState(dayjs().startOf('week').add(1, 'day'));
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 1,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 1,
    }),
  };

  const nextWeek = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(1);
    setTimeout(() => {
      setCurrentWeek(currentWeek.add(1, 'week'));
      setIsAnimating(false);
    }, 500); // Match this duration with your transition duration
  };

  const prevWeek = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(-1);
    setTimeout(() => {
      setCurrentWeek(currentWeek.subtract(1, 'week'));
      setIsAnimating(false);
    }, 500); // Match this duration with your transition duration
  };

  const getRandomColor = () => {
    const colors = ['bg-red-200', 'bg-green-200', 'bg-blue-200', 'bg-yellow-200', 'bg-purple-200'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const getTimePosition = (time) => {
    const [startHour, startMinute] = time.split(' - ')[0].split(':').map(Number);
    return ((startHour - 8) * 60 + startMinute) * 1.5; // Adjust for taller rows
  };

  const getEventHeight = (time) => {
    const [startTime, endTime] = time.split(' - ');
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    const duration = (endHour - startHour) * 60 + (endMinute - startMinute);
    return duration * 1.2; // Adjust for taller rows
  };

  const accentColorBorder = (color) => {
    return "border-t-" + color + "-500";
  }

  const eventTextColor = (color) => {
    return "text-" + color + "-600";
  }

  return (
    <div className="w-8/12 mx-auto p-4" style={{height: height + "px"}}>
      <div className="flex justify-center mb-4 h-[${Math.round(height/2) + 'px'}]">
        <button onClick={prevWeek} className="p-2 text-slate-400 bg-pink-200 hover:bg-primary hover:text-white rounded">
          <FaChevronLeft className="h-6 w-6" />
        </button>
        <div className="text-xl font-bold mx-6 mt-1">
          {currentWeek.format('MMMM YYYY').toUpperCase()}
        </div>
        <button onClick={nextWeek} className="p-2 text-slate-400 bg-pink-200 hover:bg-primary hover:text-white rounded">
          <FaChevronRight className="h-6 w-6" />
        </button>
      </div>
      <div className="flex">
        <div className="w-16 flex-shrink-0">
          {hours.map(hour => (
            <div key={hour} className="h-20 flex items-center justify-center">
              {hour}
            </div>
          ))}
        </div>
        <div className="overflow-hidden flex-grow relative">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={currentWeek.toString()}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              className="absolute top-0 left-0 w-full flex"
              style={{ width: '200%' }}
            >
              {[0, 1].map(offset => (
                <div key={offset} className="flex" style={{ width: '50%' }}>
                  {daysOfWeek.map((day, index) => (
                    <div key={index} className="border-l p-2 flex-shrink-0" style={{ width: 'calc(100% / 5)', position: 'relative' }}>
                      <div className="text-center">
                        <div className="font-bold">{day}</div>
                        <div className="text-2xl">{currentWeek.add(index + offset * 7, 'day').date()}</div>
                      </div>
                      <div className="relative mt-4" style={{ minHeight: '600px' }}>
                        {events.filter(event => dayjs(event.day).isSame(currentWeek.add(index + offset * 7, 'day'), 'day')).map(event => (
                          <div
                            key={event.id}
                            className={`${'bg-' + event.color + '-200 border-t-' + event.color + '-500'} border-t-2 p-2 rounded cursor-pointer absolute w-full`}
                            style={{
                              top: `${getTimePosition(event.time)}px`,
                              height: `${getEventHeight(event.time)}px`
                            }}
                            onClick={() => handleEventClick(event)}
                          >
                            <div className={`${'text-' + event.color + '-600'} font-bold`}>{event.name}</div>
                            <div className={`${'text-' + event.color + '-600'} text-xs`}>{event.time}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      {selectedEvent && (
        <Dialog open={selectedEvent !== null} onClose={() => setSelectedEvent(null)} className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white rounded p-6 max-w-md mx-auto">
            <DialogTitle className="font-bold text-lg">{selectedEvent.name}</DialogTitle>
            <Description className="mt-2">
              <img src="/avatars/avatar1.jpg" alt="Reserva" className="w-full h-40 object-cover rounded mb-4" />
              <p>{selectedEvent.description}</p>
              <p className="mt-2 font-bold">Precio: {selectedEvent.price}</p>
              {selectedEvent.sessions && <p>Sesiones: {selectedEvent.sessions}</p>}
            </Description>
            <button onClick={() => setSelectedEvent(null)} className="mt-4 px-4 py-2 bg-gray-300 rounded">Cerrar</button>
          </div>
        </Dialog>
      )}
    </div>
  );
};

