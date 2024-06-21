"use client";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Dialog, DialogTitle } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import { FiTrash2, FiSave } from "react-icons/fi";
import axios from "axios";
import { Loader } from "../Loader";

const COLORS = ["green", "blue", "red", "purple", "yellow", "orange", "indigo"]

const initialEvents = [
  {
    id: 1,
    name: "Masaje de Relax",
    time: "09:00 - 10:30",
    description: "Un masaje relajante de 1 hora y 30 minutos",
    type: "schedule",
    color: "green",
    price: "$50.00",
    sessions: null,
    day: dayjs().startOf("week").add(1, "day").toDate(),
  },
  {
    id: 2,
    name: "Terapia de Piel",
    time: "11:00 - 12:00",
    description: "Una terapia de piel de 1 hora",
    type: "schedule",
    color: "red",
    price: "$30.000",
    sessions: 5,
    day: dayjs().startOf("week").add(2, "day").toDate(),
  },
  {
    id: 3,
    name: "Cámara Hiperbálica",
    time: "11:00 - 13:00",
    description: "Una terapia de piel de 1 hora",
    type: "schedule",
    color: "blue",
    price: "$25.000",
    sessions: 1,
    day: dayjs().startOf("week").add(1, "day").toDate(),
  },
  {
    id: 4,
    name: "Masaje de cabello",
    time: "9:00 - 13:00",
    description: "Korean Tech para el cabello. Una experiencia única",
    type: "schedule",
    color: "purple",
    price: "$75.000",
    sessions: 1,
    day: dayjs().startOf("week").add(4, "day").toDate(),
  },
];

const daysOfWeek = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const hours = Array.from({ length: 6 }, (_, i) => `${i * 2 + 8}:00`);

export const Calendar = ({ session, height }) => {
  const [currentWeek, setCurrentWeek] = useState(dayjs().startOf("week").add(1, "day"));
  const [events, setEvents] = useState(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRepeating, setIsRepeating] = useState(false);
  const [newEvent, setNewEvent] = useState({
    type: "schedule",
    day: new Date(),
    endDate: new Date(new Date().getTime() + 60 * 60 * 1000),
    time: "08:00 - 09:00",
    rule: [],
  });

  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAllDay, setIsAllDay] = useState(false);

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
    console.log("CATALOGS", catalogs);
    const name = Object.keys(catalogs)[0];
    const containerTop = e.currentTarget.getBoundingClientRect().top;
    console.log(">>", e.clientY, containerTop)
    const minY = (e.clientY - containerTop - 96);
    const clickY = minY < 0 ? 0 : minY;    
    const hoursInDay = 13; 
    const hourHeight = e.currentTarget.offsetHeight / hoursInDay;
    const clickedHour = Math.floor(clickY / hourHeight);
    const clickedMinutes = Math.round((clickY % hourHeight) / (hourHeight / 4)) * 15;
    const startTime = dayjs(day).hour(8 + clickedHour).minute(clickedMinutes);
    const endTime = startTime.add(1, "hour");
    setNewEvent({ ...newEvent, day,  
      type: "schedule",
      time: `${startTime.format("HH:mm")} - ${endTime.format("HH:mm")}`, 
      serviceId: catalogs[name][0].serviceId, 
      category: name,
      name: catalogs[name][0].specialty.name,
      color: COLORS[Object.keys(catalogs).indexOf(name)],
    });
    setIsDialogOpen(true);
  };

  const handleCheckboxChange = (day) => {
    let newRule = [...newEvent.rule];
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
    console.log("NEW_RULE", { ...newEvent, rule: newRule });
    setNewEvent({ ...newEvent, rule: newRule });
  };

  const toggleAllDayCheckbox = () => {
    setIsAllDay(!isAllDay);
    if (!isAllDay) {
      setNewEvent({
        ...newEvent,
        time: "08:00 - 19:00",
        rule: [],
      });
    } else {
      setNewEvent({
        ...newEvent,
        time: "09:00 - 10:00", // Ajusta esto según tus necesidades
        rule: [],
      });
    }
  };

  const handleSaveEvent = () => {
    console.log("EVENT", newEvent);
    console.log("Catalog", catalogs)
    setEvents((prevEvents) => [...prevEvents, newEvent]);
    handleCloseDialog();
  };


  const handleDeleteEvent = () => {
    setEvents(events.filter((event) => event.id !== selectedEvent.id));
    setSelectedEvent(null);
  };

  const ROW_HEIGHT_FACTOR = 1.25;
  const EVENT_HEIGHT_FACTOR = 40;
  const ROW_OFFSET = 0;

  const getTimePosition = (time) => {
    const [startHour, startMinute] = time.split(" - ")[0].split(":").map(Number);
    return ((startHour - 8) * EVENT_HEIGHT_FACTOR + startMinute) * ROW_HEIGHT_FACTOR + ROW_OFFSET;
  };

  const getEventHeight = (time) => {
    const [startTime, endTime] = time.split(" - ");
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const duration = (endHour - startHour) * EVENT_HEIGHT_FACTOR + (endMinute - startMinute);
    return duration * ROW_HEIGHT_FACTOR; // Adjust for taller rows
  };


  const [catalogs, setCatalogs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
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
        setSelectedService({ _id: fullCatalog[Object.keys(fullCatalog)[0]][0].specialty._id, name: fullCatalog[Object.keys(fullCatalog)[0]][0].specialty.name })
        setLoadingData(false);
      } catch (error) {
        console.error('Error fetching catalog:', error);
      }
    };

    fetchCatalogs();
  }, [])

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
                      <div className="relative mt-4" style={{ minHeight: "300px" }}>
                        <div className="absolute inset-0" />
                        {!loadingData && events
                          .filter((event) =>
                            dayjs(event.day).isSame(currentWeek.add(index + offset * 7, "day"), "day")
                          )
                          .map((event) => (
                            <div
                              key={event.id}
                              className={`absolute left-0 right-0 px-2 py-0.5 m-1 text-sm rounded shadow-md cursor-pointer ${event.type === "unavailable" 
                                ? "bg-pink-200"
                                : `bg-${event.color}-200 border-t-2 border-t-${event.color}-500`}`}
                              style={{
                                top: `${getTimePosition(event.time)}px`,
                                height: `${getEventHeight(event.time)}px`,
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
                              <div className={`font-bold text-xs text-${event.color}-500`}>{event.name}</div>
                              <div className={`text-xs text-${event.color}-500`}>{event.time}</div>
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

      {loadingData &&
        <div className="flex items-center justify-center fixed inset-0 bg-gray-200">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <Loader/>
          </div>
        </div>
      }

      {isDialogOpen && (
        <Dialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50"
        >
          <div className="bg-white rounded p-6 max-w-xl mx-auto">
            <div className="flex justify-end">
              <button
                onClick={handleCloseDialog}
                className="text-gray-500 hover:text-gray-800"
              >
                <FaTimes className="h-6 w-6" />
              </button>
            </div>
            <DialogTitle className="font-bold text-lg">Nuevo evento</DialogTitle>
            <div className="mt-4">
              <label className="block text-sm font-bold text-gray-700">Tipo</label>
              <div className="mb-2">
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  className="form-select mt-1 block w-full border-2 border-gray-200 rounded-md p-2 max-w-xs"
                >
                  <option value="schedule">Nueva reserva</option>
                  <option value="unavailable">Día no disponible</option>
                </select>
              </div>
              {newEvent.type === "unavailable" && (
                <div className="mt-4">
                  <input
                    type="checkbox"
                    checked={isRepeating}
                    onChange={() => setIsRepeating(!isRepeating)}
                    className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2">Se repite</span>
                </div>
              )}
              {newEvent.type === "schedule" && (
                <>
                  <div className="mt-4">
                    <label className="block text-sm font-bold text-gray-700">Categoría</label>
                    <div className="mb-2">
                      <select
                        value={newEvent.category}
                        onChange={(e) => {
                          setSelectedCategory(catalogs[e.target.value]);
                          setNewEvent({ 
                            ...newEvent, 
                            category: e.target.value,
                            serviceId: catalogs[e.target.value][0].specialtyId,
                            name: catalogs[e.target.value][0].specialty.name,
                            color: COLORS[Object.keys(catalogs).indexOf(e.target.value)],
                          })}
                        }
                        className="form-select mt-1 block w-full border-2 border-gray-200 rounded-md p-2 max-w-xs"
                      >
                        {Object.keys(catalogs).length > 0 &&
                          Object.keys(catalogs)
                            .map(c => (<option key={catalogs[c]._id} value={catalogs[c]._id}>{c}</option>)
                            )}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-bold text-gray-700">Tratamiento</label>
                    <div className="mb-2">
                      <select
                        value={newEvent.serviceId}
                        onChange={(e) => {
                          setNewEvent({ 
                            ...newEvent, 
                            name: e.target.value,
                            serviceId: e.target.id,
                          })
                        }}
                        className="form-select mt-1 block w-full border-2 border-gray-200 rounded-md p-2 max-w-xs"
                      >
                        {selectedCategory && selectedCategory?.length > 0 && selectedCategory
                          .map(c => (<option key={c._id} id={c._id}>{c.name.substring(0, 35) + (c.name.length > 35 ? '…' : '')}</option>)
                          )}
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4">
              <div className="flex mb-2 space-x-4">
                <div className="w-1/2">
                  <label className="block text-sm font-bold text-gray-700">Hora de inicio</label>
                  <input
                    type="time"
                    value={newEvent.time.split(" - ")[0]}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        time: `${e.target.value} - ${newEvent.time.split(" - ")[1]}`,
                      })
                    }
                    className="form-input mt-1 block w-full border-2 border-gray-200 rounded-md p-2"
                    disabled={isAllDay}
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-bold text-gray-700">Hora de fin</label>
                  <input
                    type="time"
                    value={newEvent.time.split(" - ")[1]}
                    onChange={(e) =>
                      setNewEvent({
                        ...newEvent,
                        time: `${newEvent.time.split(" - ")[0]} - ${e.target.value}`,
                      })
                    }
                    className="form-input mt-1 block w-full border-2 border-gray-200 rounded-md p-2"
                    disabled={isAllDay}
                  />
                </div>
              </div>
              {newEvent.type === "unavailable" && <div>
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={toggleAllDayCheckbox}
                  className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                />
                <span className="ml-2">Todo el día</span>
              </div>}              
            </div>

            {newEvent.type === "unavailable" && <><div className="mt-4">
              <label className="block text-sm font-bold text-gray-700">Fecha de inicio</label>
              <input
                type="datetime-local"
                value={dayjs(newEvent.day).format("YYYY-MM-DDTHH:mm")}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
                    day: dayjs(e.target.value).toDate(),
                  })
                }
                className="form-input mt-1 block w-full border-2 border-gray-200 rounded-md p-2"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-bold text-gray-700">Fecha de fin</label>
              <input
                type="datetime-local"
                value={dayjs(newEvent.endDate).format("YYYY-MM-DDTHH:mm")}
                onChange={(e) =>
                  setNewEvent({
                    ...newEvent,
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
                          newEvent.rule.includes(day) ||
                          day === dayjs(newEvent.day).format("dddd")
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


      {selectedEvent && (
        <Dialog
          open={selectedEvent !== null}
          onClose={() => setSelectedEvent(null)}
          className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50"
        >
          <div className="bg-white rounded p-6 max-w-md mx-auto relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setSelectedEvent(null)}
              style={{ fontSize: "1.5rem" }}
            >
              <FaTimes />
            </button>
            <DialogTitle className="font-bold text-lg">{selectedEvent.name}</DialogTitle>
            <div className="mt-2">
              <p>{selectedEvent.description}</p>
              <p className="mt-2 font-bold">Precio: {selectedEvent.price}</p>
              {selectedEvent.sessions && <p>Sesiones: {selectedEvent.sessions}</p>}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={handleDeleteEvent}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded"
              >
                <FiTrash2 className="mr-2" /> Eliminar
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded"
              >
                <FiSave className="mr-2" /> Cerrar
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
