"use client"
import { useState, useEffect, useRef, use } from "react"
import { FaUserCircle, FaEdit } from 'react-icons/fa';
import { Navigation } from '../Navigation';
import { SPECIALTY_PALETTE, SPECIALTY_NAMES } from '@/app/utils/colorsPalette';
import dayjs from 'dayjs';
import numberFormat from '@/app/utils/currency';
import "dayjs/locale/es";
import axios from "axios";
import { Loader } from "../Loader";
dayjs.locale("es");
import { toast, ToastContainer } from 'react-toastify';
import { useSession } from "next-auth/react";

export const EventListView = ({ height }) => {
  const [events, setEvents] = useState(null);
  const [editing, setEditing] = useState(false);
  const [horarios, setHorarios] = useState([]);
  const [fecha, setFecha] = useState(null);
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [scheduleSelected, setScheduleSelected] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const { data: session } = useSession();

  useEffect(() => {
      if(status === 'loading') return;
      if(session && session.user && session.user?.role) {
          setRole(session.user.role);
      }
  }, [session, setRole, status]);

  const color = (name) => {
    const index = SPECIALTY_NAMES.indexOf(name);
    return SPECIALTY_PALETTE[index];
  }

  const loadPendings = async () => {
    const pendings = await fetch(`/api/pending-orders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });
    const result = await pendings.json();
    console.log("RESULT", result);
    setEvents(result);
  }

  const editar = (id, fecha) => {
    const schedule = events.find(e => e.id === id);
    console.log("EDITANDO SCHEDULE", schedule);
    setScheduleSelected(schedule);    
    cargarHorarios(schedule.catalogId, fecha, schedule);
    setEditing(true);
  }

  const isPastEvent = (date) => dayjs(date).isBefore(dayjs(), 'day');

  const handleDateChange = async (event) => {
    const selectedDate = event.target.value + "T12:00:00";
    console.log("SELECTED DATE", selectedDate);
    setSelectedDate(selectedDate);
    setFecha(dayjs(selectedDate).toDate());
    cargarHorarios(scheduleSelected.catalogId, selectedDate, scheduleSelected);
  };

  const handleSelectPlace = (indice) => {
    const selectedTime = dayjs(horarios[indice].fecha).format('HH:mm');
    setSelectedTime(selectedTime);
    setFecha(dayjs(fecha).hour(selectedTime.split(":")[0]).minute(selectedTime.split(":")[1]).toDate());
    axios.post(`/api/schedule/reschedule/${scheduleSelected.id}`, JSON.stringify({ date: dayjs(fecha).hour(selectedTime.split(":")[0]).minute(selectedTime.split(":")[1]).toDate() }))
      .then((response) => {
        console.log("RESPONSE", response.data);
        const resp = response.data;
        if(resp !== null) {
          setEvents(events.map(e => {
            if(e.id === scheduleSelected.id) {
              console.log(">>", e);
              return {
                ...e,
                date: dayjs(fecha).hour(selectedTime.split(":")[0]).minute(selectedTime.split(":")[1]).toDate(),
                startTime: selectedTime,
                endTime: dayjs(fecha).hour(selectedTime.split(":")[0]).minute(selectedTime.split(":")[1]).add(e.durationMins, 'minute').format('HH:mm'),
              }
            }
            return e;
          }));
          toast.success("Horario actualizado exitosamente", {
            autoClose: 5000,
          });
        }
      });
    setEditing(false);
  }

  const cargarHorarios = (id, selectedDate, schedule) => {
    setLoadingCalendar(true);
    axios.get(`/api/schedule?date=${dayjs(selectedDate).format('YYYY-MM-DD')}&catalogId=${id}`)
      .then((response) => {
        console.log("RESPONSE", response.data);
        setHorarios(response.data.map(slot => {
          return {
            ocupado: false,
            desde: { hrs: dayjs(slot).hour(), min: dayjs(slot).minute() },
            hasta: { hrs: dayjs(slot).add(schedule.durationMins, 'minute').hour(), min: dayjs(slot).add(schedule.durationMins, 'minute').minute() },
            fecha: dayjs(slot).toDate(),
            pasado: dayjs(slot).isBefore(new Date()),
          }
        }));
        setLoadingCalendar(false);
      })
      .catch((error) => {
        console.error('Error fetching available slots:', error);
      });
  }

  const initData = useRef(false);
  useEffect(() => {
    if (!initData.current) {
      initData.current = true
      loadPendings();
    }
  }, []);

  return (
    <>
      <div className={`${editing ? 'w-1/2 float-right' : 'w-8/12 mx-auto'} p-4 max-w-4xl mb-40 transition-all`} style={{ height: height + "px" }}>
        <Navigation session={session} />
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 bg-white border-l border-r border-b border-gray-300 shadow-md px-8 py-2 text-3xl text-[#EE64C5] z-10">
          MI AGENDA
        </div>
        <div className="p-4 border border-gray-200 rounded">
          {events && events.map((event, index) => (
            <div key={index} className={`mb-8 flex items-start relative ${isPastEvent(event.date) ? 'opacity-40' : ''}`}>
              <div className="w-1/5 text-sm text-gray-500">
                {dayjs(event.date).format('ddd D/MM/YYYY')}
                <hr className="border-gray-300 mt-1 mb-2 absolute w-full top-3" />
              </div>
              <div className={`w-2/3 relative p-4 rounded-md shadow-md ml-4 mt-8 border-t-2 ${'bg-' + color(event.specialtyName) + '-200'} ${'border-t-' + color(event.specialtyName) + '-500'}`}>
                <div className="absolute right-0 top-0">
                  <p className="text-xs text-gray-600 mr-2 mt-1">{event.startTime} a {event.endTime}</p>
                </div>
                {!dayjs(event.date).add(24, "hour").isBefore(new Date()) && <div className="absolute right-0 top-10">
                  <div className="flex items-center cursor-pointer text-gray-600  hover:text-sky-600 hover:scale-105" onClick={() => {
                    setFecha(dayjs(event.date).toDate());
                    editar(event.id, event.date);
                  }}>
                    <span className="text-xs mr-4 mt-2">CAMBIAR FECHA</span>
                    <FaEdit className="w-8 h-8 mr-3" />
                  </div>
                </div>}
                <div className="flex items-center">
                  {event.specialistNames.map((name, index) => (
                    <div key={index} className="relative">
                      {event.specialistAvatars[index] ? (
                        <img
                          src={event.specialistAvatars[index]}
                          alt={name}
                          className="w-12 h-12 rounded-full mr-4"
                          style={{ marginLeft: index === 0 ? 0 : '-20%' }}
                        />
                      ) : (
                        <FaUserCircle
                          className="w-12 h-12 ${event.color} mr-4"
                          style={{ marginLeft: index === 0 ? 0 : '-20%' }}
                        />
                      )}
                      <span className="sr-only">{name}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 uppercase">
                  <div className={`text-sm ${'text-' + color(event.specialtyName) + '-800'}`}>{event.specialtyName}</div>
                  <div className="text-md font-bold text-gray-800">{event.serviceName}</div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <div className="flex">
                    <div className="text-lg font-bold text-gray-800">$ {numberFormat(event.price)}</div>
                    {event.paid == event.price && <p className="text-xs ml-4 mt-2">PAGADO</p>}
                  </div>
                  {(event.paid > 0 && event.paid < event.price) && (
                    <div className="text-sm text-gray-600">Abonado: $ {numberFormat(event.paid)}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={`h-full ${editing ? 'w-1/2 float-left opacity-100' : 'opacity-0'} p-4 max-w-4xl mb-40 transition-all`} style={{ height: height + "px" }}>
        <div className="h-screen flex items-center justify-center">
          <div className="w-[480px]">
            <div className="mb-4">
              <label htmlFor="fecha" className="block text-gray-700 text-sm font-bold mb-2">Selecciona una fecha:</label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                min={dayjs().format('YYYY-MM-DD')} 
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                onChange={handleDateChange}
                value={fecha ? dayjs(fecha).format('YYYY-MM-DD') : ''}
              />
            </div>
            {loadingCalendar ? <div className="w-full flex justify-center">
              <div className="w-full h-9"><Loader /></div>
            </div>
              : <div className="w-full flex flex-wrap justify-center">
                {horarios.length > 0 && horarios.map((h, indice) => <div onClick={() => handleSelectPlace(indice)}
                  key={`_${h.numeroDia}_${indice}`}
                  className={`border-brown-800 hover:bg-white hover:text-slate-500 cursor-pointer text-md font-bold border-2 rounded-md text-center mr-2 py-1 mb-2 zeyada w-[96px]`}>
                  <span>{h.desde.hrs < 10 && '0'}{h.desde.hrs}</span> : <span>{h.desde.min == 0 && '0'}{h.desde.min}</span>
                </div>)}
              </div>}
            <button className="btn border-solid border-2 border-[#ea86cc] rounded-full overflow-hidden bg-[#EE64C5] font-extrabold text-xl py-1 px-9 mt-4 float-right"
              onClick={() => setEditing(false)}>CANCELAR</button>
          </div>
        </div>
      </div>
      <ToastContainer position="bottom-right"/>
    </>);
};