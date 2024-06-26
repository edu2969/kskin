"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogTitle } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import { FiTrash2, FiSave, FiX } from "react-icons/fi"
import axios from "axios";
import { Loader } from "../Loader";
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);
const COLORS = ["green", "blue", "red", "purple", "yellow", "orange", "indigo"]

const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const hours = Array.from({ length: 6 }, (_, i) => `${i * 2 + 8}:00`);

export const Calendar = ({ session, height }) => {
  const [currentWeek, setCurrentWeek] = useState(dayjs().startOf("week").add(1, "day"));
  const [events, setEvents] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState({
    type: "schedule",
    serviceName: "",
    clientId: false,
    clientName: "",
    phone: "",
    email: "",
    startDate: new Date(),
    time: "09:00",
    durationMins: 45,
    cleanUpMins: 15,
    noAlvailable: [],
  });

  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAllDay, setIsAllDay] = useState(false);
  const [focus, setFocus] = useState(false)

  const variants = {
    enter: (direction) => ({ x: direction > 0 ? "100%" : "-100%", opacity: 1 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction > 0 ? "-100%" : "100%", opacity: 1 }),
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsRepeating(false);
    setIsAllDay(false);
  };

  const nextWeek = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(1);
    setTimeout(() => {
      setCurrentWeek(currentWeek.add(1, "week"));
      setIsAnimating(false);
    }, 500);
  };

  const prevWeek = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDirection(-1);
    setTimeout(() => {
      setCurrentWeek(currentWeek.subtract(1, "week"));
      setIsAnimating(false);
    }, 500);
  };

  const handleTimeSlotClick = (day, e) => {
    const serviceName = Object.keys(catalogs)[0];
    const containerTop = e.currentTarget.getBoundingClientRect().top;
    const minY = (e.clientY - containerTop - 96);
    const clickY = minY < 0 ? 0 : minY;
    const hoursInDay = 13;
    const hourHeight = e.currentTarget.offsetHeight / hoursInDay;
    const clickedHour = Math.floor(clickY / hourHeight);
    const clickedMinutes = Math.round((clickY % hourHeight) / (hourHeight / 4)) * 15;
    const startTime = dayjs(day).hour(8 + clickedHour).minute(clickedMinutes);
    const endTime = startTime.add(1, "hour");
    setSelectedEvent({
      ...selectedEvent, day,      
      type: "schedule",
      specialistId: session.user?.id,
      time: `${startTime.format("HH:mm")}`,
      serviceId: catalogs[serviceName][0]._id,
      category: serviceName,
      serviceName: catalogs[serviceName][0].specialty.name,
      color: COLORS[Object.keys(catalogs).indexOf(serviceName)],
    });
    setIsDialogOpen(true);
  };

  const handleCheckboxChange = (day) => {
    let newRule = [...selectedEvent.noAlvailable];
    if (day === "Días hábiles") {
      newRule = newRule.includes(day)
        ? newRule.filter((d) => d !== day)
        : ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
    } else if (day === "Todos los días") {
      newRule = newRule.includes(day)
        ? newRule.filter((d) => d !== day)
        : ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    } else {
      if (newRule.includes(day)) {
        newRule = newRule.filter((d) => d !== day);
      } else {
        newRule.push(day);
      }
      if (newRule.includes("Días hábiles") || newRule.includes("Todos los días")) {
        newRule = newRule.filter((d) => d !== "Días hábiles" && d !== "Todos los días");
      }
    }
    setSelectedEvent({ ...selectedEvent, noAlvailable: newRule });
  };

  const toggleAllDayCheckbox = () => {
    setIsAllDay(!isAllDay);
    if (!isAllDay) {
      setSelectedEvent({
        ...selectedEvent,
        time: "08:00",
        noAlvailable: [],
      });
    } else {
      setSelectedEvent({
        ...selectedEvent,
        time: "09:00", // Ajusta esto según tus necesidades
        noAlvailable: [],
      });
    }
  };

  const handleSaveEvent = async () => {
    console.log("SELECTED_EVENT", selectedEvent);
    const schedule = await axios.post('/api/schedule', selectedEvent.type === 'unavailable' ? {
      id: selectedEvent._id,
      specialistId: selectedEvent.specialistId,
      startDate: selectedEvent.startDate,
      durationMins: selectedEvent.durationMins,
      cleanUpMins: selectedEvent.cleanUpMins,
      noAlvailable: selectedEvent.noAlvailable,
    } : {
      id: selectedEvent._id,
      specialistId: selectedEvent.specialistId,
      clientId: selectedEvent.clientId,
      phone: selectedEvent.phone,
      email: selectedEvent.email,
      catalogId: selectedEvent.catalogId,
      serviceId: selectedEvent.serviceId,
      startDate: selectedEvent.startDate,
      durationMins: selectedEvent.durationMins,
      cleanUpMins: selectedEvent.cleanUpMins,
    })
    if (!selectedEvent._id) {
      setSelectedEvent({ ...selectedEvent, _id: schedule._id });
      setEvents((prevEvents) => [...prevEvents,])
    }
    setEvents((prevEvents) => [...prevEvents, selectedEvent]);
    handleCloseDialog();
  };

  const handleDeleteEvent = () => {
    setEvents(events.filter((event) => event.id !== selectedEvent.id));
    setSelectedEvent(null);
  };

  const ROW_HEIGHT_FACTOR = 1.25;
  const EVENT_HEIGHT_FACTOR = 38.5;
  const ROW_OFFSET = 16;

  const getTimePosition = (startTime) => {
    const [startHour, startMinute] = startTime.split(":").map(Number);
    return ((startHour - 8) * EVENT_HEIGHT_FACTOR + startMinute) * ROW_HEIGHT_FACTOR + ROW_OFFSET;
  };

  const getEventHeight = (startTime, durationMins) => {
    console.log("TEST_rapido", dayjs("12:00", "HH:mm").format())

    console.log("START_TIME|" + startTime + "|DURATION_MINS", durationMins);
    
    const start = dayjs(startTime, "HH:mm");
    const end = start.add(durationMins, "minutes");
    
    const [startHour, startMinute] = start.format("HH:mm").split(":").map(Number);
    const [endHour, endMinute] = end.format("HH:mm").split(":").map(Number);
    
    const duration = (endHour - startHour) * EVENT_HEIGHT_FACTOR + (endMinute - startMinute);
    return duration * ROW_HEIGHT_FACTOR;
  };

  const calculateEndTime = (startTime, durationMins) => {
    console.log(">>>", startTime, durationMins)
    return dayjs(startTime, "HH:mm").add(durationMins, "minute").format("HH:mm");
  };

  const [catalogs, setCatalogs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const response = await axios.post(`/api/catalog/bySpecialist/`, { id: session?.user?.id });
        var categories = []
        var fullCatalog = {}
        response.data.forEach(d => {
          if (categories.indexOf(d.specialty.name) == -1) {
            categories.push(d.specialty.name);
            fullCatalog[d.specialty.name] = [d];
          } else {
            fullCatalog[d.specialty.name].push(d);
          }
        })
        setCatalogs(fullCatalog);
        setSelectedCategory(fullCatalog[Object.keys(fullCatalog)[0]])
        setSelectedService({ 
          _id: fullCatalog[Object.keys(fullCatalog)[0]][0].specialty._id, 
          serviceName: fullCatalog[Object.keys(fullCatalog)[0]][0].specialty.name 
        })
        setSelectedEvent({
          ...selectedEvent, 
          catalogId: fullCatalog[Object.keys(fullCatalog)[0]][0].specialty._id, 
          serviceName: fullCatalog[Object.keys(fullCatalog)[0]][0].specialty.name 
        })
        fetchClients();
      } catch (error) {
        console.error('Error fetching catalog:', error);
      }
    };

    const fetchSchedule = async () => {
      try {
        console.log("CALLING", `/api/schedule/bySpecialist/`, { id: session?.user?.id });
        const response = await axios.post(`/api/schedule/bySpecialist/`, { id: session?.user?.id });
        console.log("RESPONSE SCHEDULE", response?.data)
        const eventSet = response?.data.map(d => {
          const index = catalogs[d.category].findIndex(s => s._id === d.catalogId);
          const specialty = catalogs[d.category][index].specialty;
          return d.clientId ? {
            id: d.id,
            type: "schedule",
            serviceName: catalogs[d.category][index].name,
            clientId: d.clientId,
            category: specialty.name,
            catalogId: catalogs[d.category][index]._id,
            serviceId: d.serviceId,
            startDate: d.startDate,
            durationsMins: d.durationMins,
            cleanUpMins: d.cleanUpMins,
          } : {
            id: d.id,
            type: "unavailable",
            startDate: d.startDate,
            durationMins: d.durationMins,
            noAvailable: d.noAvailable,
          }
        })
        setEvents(eventSet)
        setLoadingEvents(false);
      } catch (error) {
        console.error('Error fetching catalog:', error);
      }
    }

    const fetchClients = async () => {
      try {
        const response = await axios.get('/api/client');
        setSuggestions(response.data);
        fetchSchedule();
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchCatalogs();
  }, [])

  const filteredSuggestions = suggestions.filter(
    (user) =>
      user.name?.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="w-full mx-auto p-2" style={{ height: height + "px" }}>
      <div className={`flex justify-center mb-4 h-[${Math.round(height / 2) + "px"}]`}>
        <button
          onClick={prevWeek}
          className="p-2 text-slate-400 bg-pink-200 hover:bg-primary hover:text-white rounded"
        >
          <FaChevronLeft className="h-6 w-6" />
        </button>
        <div className="text-xl font-bold mx-6 mt-1">
          {currentWeek.format("MMMM YYYY").toUpperCase()}
        </div>
        <button
          onClick={nextWeek}
          className="p-2 text-slate-400 bg-pink-200 hover:bg-primary hover:text-white rounded"
        >
          <FaChevronRight className="h-6 w-6" />
        </button>
      </div>
      <div className="flex">
        <div className="w-16 flex-shrink-0 mt-12">
          {hours.map((hour) => (
            <div key={hour} className="h-24 flex items-center justify-center text-xs text-pink-500">
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
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="absolute top-0 left-0 w-full flex h-full"
              style={{ width: "200%" }}
            >
              {[0, 1].map((offset) => (
                <div key={offset} className="flex" style={{ width: "50%" }}>
                  {daysOfWeek.map((day, index) => (
                    <div
                      key={index}
                      className="border-l p-2 flex-shrink-0 relative"
                      style={{ width: "calc(100% / 7)" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTimeSlotClick(
                          currentWeek.add(index + offset * 7, "day"),
                          e
                        );
                      }}
                    >
                      <div className="text-center">
                        <div className="font-bold">{day}</div>
                        <div className="text-2xl">
                          {currentWeek.add(index + offset * 7, "day").date()}
                        </div>
                      </div>
                      <div key={`div_${index}`} className="relative mt-4" style={{ minHeight: "300px" }}>
                        <div className="absolute inset-0" />
                        {!loadingEvents && events
                          .filter((event) =>
                            dayjs(event.day).isSame(currentWeek.add(index + offset * 7, "day"), "day")
                          )
                          .map((event) => (
                            <div
                              key={event._id}
                              className={`absolute left-0 right-0 px-2 py-0.5 text-sm rounded shadow-md cursor-pointer ${event.type === "unavailable"
                                ? "bg-pink-200"
                                : `bg-${event.color}-200 border-t-2 border-t-${event.color}-500`}`}
                              style={{
                                top: `${getTimePosition(event.time)}px`,
                                height: `${getEventHeight(event.time, event.durationMins + event.cleanUpMins)}px`,
                                backgroundImage:
                                  event.type === "unavailable"
                                    ? "linear-gradient(135deg, pink 25%, white 25%, white 50%, pink 50%, pink 75%, white 75%, white 100%)"
                                    : "none",
                                backgroundSize: event.type === "unavailable" ? "20px 20px" : "none",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(event);
                              }}
                            >
                              <div className={`font-bold text-xs text-${event.color}-500`}>{event.category}</div>
                              <div className={`text-xs text-${event.color}-500`}>{event.time} - {calculateEndTime(event.time, event.durationMins + event.cleanUpMins)}</div>
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

      {loadingEvents &&
        <div className="flex items-center justify-center fixed inset-0 bg-gray-200">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <Loader />
          </div>
        </div>
      }

      {isDialogOpen && (
        <Dialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50"
        >
          <div className="bg-white rounded p-6 mx-auto max-w-xl">
            <div className="relative h-0 flex justify-end">
              <button
                onClick={handleCloseDialog}
                className="text-gray-500 hover:text-gray-800"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <DialogTitle className="font-bold text-lg">Nueva cita</DialogTitle>
            <div className="flex flex-wrap">
              <div className="mt-4 w-1/2">
                <label className="block text-sm font-bold text-gray-700">Tipo</label>
                <div className="mb-2">
                  <select
                    value={selectedEvent.type}
                    onChange={(e) => {
                      setIsRepeating(false);
                      setIsAllDay(false);
                      setSelectedEvent({ ...selectedEvent, type: e.target.value })
                    }}
                    className="form-select mt-1 w-full border-2 pl-2 border-gray-200 rounded-md pt-2.5 pb-2.5  max-w-xs"
                  >
                    <option value="schedule">Nueva reserva</option>
                    <option value="unavailable">Día no disponible</option>
                  </select>
                </div>
              </div>

              {selectedEvent.type === "unavailable" && (
                <div className="mt-14 ml-6">
                  <input
                    type="checkbox"
                    checked={isRepeating}
                    onChange={() => setIsRepeating(!isRepeating)}
                    className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2">Se repite</span>
                </div>
              )}
              {selectedEvent.type === "schedule" && (
                <>
                  <div className="w-1/2 mt-4">
                    <label className="ml-4 block text-sm font-bold text-gray-700">Nombre</label>
                    <div className="relative ml-4">
                      <input
                        type="text"
                        placeholder="Buscar..."
                        value={query}
                        onChange={(e) => {
                          if(e.target.value == "") {
                            setSelectedEvent({...selectedEvent, 
                              clientId: null,
                              email: "",
                              phone: ""
                            });
                          } 
                          setQuery(e.target.value)
                        }}
                        onFocus={() => setFocus(true)}
                        className="form-input w-full pl-4 pr-10 py-2 mt-1 border-2 border-gray-200 rounded-md"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <FaSearch className="text-gray-400" />
                      </div>
                      {(focus && query && filteredSuggestions.length > 0) && (
                        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1">
                          {filteredSuggestions.map((user) => (
                              <div
                                key={user._id}
                                className="py-0 px-2 cursor-pointer hover:bg-gray-200"
                                onClick={() => {
                                  setSelectedEvent({ ...selectedEvent,  
                                    clientId: user._id,
                                    clientName: user.name || '',
                                    email: user.email || '',
                                    phone: user.phone || 56
                                  })
                                  setQuery(user.name)
                                  setFocus(false)                     
                                }}
                              >
                                <span className="text-sm mt-0"><b>{user.name}</b></span><br/><span className="relative text-xs -top-2">{user.email}</span>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 w-1/2">
                    <label className="block text-sm font-bold text-gray-700">e-mail</label>
                    <input type="email" value={selectedEvent.email}
                      placeholder="correo@dominio.cc"
                      className="form-select mt-1 block w-full border-2 border-gray-200 rounded-md p-2 max-w-xs"
                      onChange={(e) =>
                        setSelectedEvent({ ...selectedEvent, email: e.target.value })
                      } />
                  </div>
                  <div className="mt-4 w-1/2">
                    <label className="pl-10 block text-sm font-bold text-gray-700">Teléfono</label>
                    <div className="flex">
                      <span className="pl-6 mt-4">+&nbsp;</span><input type="number" value={selectedEvent.phone}
                        placeholder="56900009999"
                        className="form-select mt-1 block w-full border-2 border-gray-200 rounded-md p-2 max-w-xs"
                        onChange={(e) =>
                          setSelectedEvent({ ...selectedEvent, phone: e.target.value })
                        } />
                    </div>
                  </div>
                  <div className="mt-4 w-5/12">
                    <label className="block mb-1 text-sm font-bold text-gray-700">Categoría</label>
                    <div className="mb-2 mr-4">
                      <select
                        value={selectedEvent.category}
                        onChange={(e) => {
                          setSelectedCategory(catalogs[e.target.value]);
                          setSelectedEvent({
                            ...selectedEvent,
                            category: e.target.value,
                            catalogId: catalogs[e.target.value][0].specialtyId,
                            serviceId: catalogs[e.target.value][0].specialty._id,
                            serviceName: catalogs[e.target.value][0].specialty.name,
                            color: COLORS[Object.keys(catalogs).indexOf(e.target.value)],
                          })
                        }
                        }
                        className="form-select mt-1 w-full border-2 border-gray-200 rounded-md pl-2 py-2.5 max-w-xs"
                      >
                        {Object.keys(catalogs).length > 0 &&
                          Object.keys(catalogs)
                            .map(c => (<option key={c} value={c}>{c}</option>)
                            )}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 w-7/12">
                    <label className="text-sm font-bold text-gray-700">Tratamiento</label>
                    <div className="mb-2">
                      <select
                        value={selectedEvent.serviceId}
                        onChange={(e) => {
                          setSelectedEvent({
                            ...selectedEvent,
                            serviceName: e.target.value,
                            serviceId: e.target.id,
                          })
                        }}
                        className="form-select mt-1 border-2 border-gray-200 rounded-md pl-2 py-2.5 w-full"
                      >
                        {selectedCategory && selectedCategory?.length > 0 && selectedCategory
                          .map(c => (<option key={c._id} id={c._id}>{c.name.substring(0, 35) + (c.name.length > 35 ? '…' : '')}</option>)
                          )}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="w-1/3 mt-4">
                <label className="block text-sm font-bold text-gray-700">Hora de inicio</label>
                <input
                  type="time"
                  value={selectedEvent.time}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      time: `${e.target.value}`,
                    })
                  }
                  className="form-input mt-1 block w-full border-2 border-gray-200 rounded-md p-2"
                  disabled={isAllDay}
                />

              </div>
              <div className="w-1/3 mt-4 pl-4">
                <label className="block text-sm font-bold text-gray-700">Duración mins.</label>
                <input
                  type="number"
                  value={selectedEvent.durationMins}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      durationMins: Number(e.target.value),
                    })
                  }
                  className="form-input mt-1 block w-full border-2 border-gray-200 rounded-md p-2 pb-2.5"                  
                />
              </div>
              <div className="w-1/3 mt-4 pl-4">
                <label className="block text-sm font-bold text-gray-700">Limpieza mins.</label>
                <input
                  type="number"
                  value={selectedEvent.cleanUpMins}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      cleanUpMins: Number(e.target.value),
                    })
                  }
                  className="form-input mt-1 block w-full border-2 border-gray-200 rounded-md p-2 pb-2.5"                  
                />
              </div>
              
              {selectedEvent.type === "unavailable" && <div>
                <div className="mt-14 ml-6">
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={toggleAllDayCheckbox}
                  className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                />
                <span className="ml-2">Todo el día</span>
                </div>
              </div>}

              {(selectedEvent.type === "unavailable" && isRepeating) && <><div className="mt-4">
                <label className="block text-sm font-bold text-gray-700">Fecha de inicio</label>
                <input
                  type="date"
                  value={dayjs(selectedEvent.day).format("YYYY-MM-DD")}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      day: dayjs(e.target.value).toDate(),
                    })
                  }
                  className="form-input mt-1 block w-full border-2 border-gray-200 rounded-md p-2"
                />
              </div>
                <div className="mt-4">
                  <label className="block text-sm font-bold text-gray-700">Fecha de fin</label>
                  <input
                    type="date"
                    value={dayjs(selectedEvent.endDate).format("YYYY-MM-DD")}
                    onChange={(e) =>
                      setSelectedEvent({
                        ...selectedEvent,
                        endDate: dayjs(e.target.value).toDate(),
                      })
                    }
                    className="form-input mt-1 block w-full border-2 border-gray-200 rounded-md p-2"
                  />
                </div></>}

              {isRepeating && (
                <div className="mt-4">
                  <label className="block text-sm font-bold text-gray-700">Días</label>
                  <div className="columns-3 mb-2">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedEvent.noAlvailable.includes(day) ||
                            day === dayjs(selectedEvent.day).format("dddd")
                          }
                          onChange={() => handleCheckboxChange(day)}
                          className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                        />
                        <span className="ml-2">{day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={handleCloseDialog}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded"
              >
                <FiTrash2 className="mr-2" /> Eliminar
              </button>
              <button
                onClick={handleSaveEvent}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded"
              >
                <FiSave className="mr-2" /> Guardar
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
