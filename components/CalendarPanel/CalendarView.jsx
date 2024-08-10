"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogTitle } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import { FiTrash2, FiSave, FiX } from "react-icons/fi"
import axios from "axios";
import { Loader } from "../Loader";
import dayjs from "dayjs";
import 'dayjs/locale/es'
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);
dayjs.locale("es")
const COLORS = ["green", "blue", "red", "purple", "yellow", "orange", "indigo"]

const daysOfWeek = Array.from({ length: 7 }, (_, i) => dayjs().day((i + 1) % 7).format("dddd"));
const hours = Array.from({ length: 6 }, (_, i) => `${i * 2 + 8}:00`);

export const Calendar = ({ session, height }) => {
  const [currentWeek, setCurrentWeek] = useState(dayjs().startOf("week"));
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
    noAvailables: [],
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
    //console.log("Click DAY", day, day.format())
    const containerTop = e.currentTarget.getBoundingClientRect().top;
    const minY = (e.clientY - containerTop - 96);
    const clickY = minY < 0 ? 0 : minY;
    const hoursInDay = 13;
    const hourHeight = e.currentTarget.offsetHeight / hoursInDay;
    const clickedHour = Math.floor(clickY / hourHeight);
    const clickedMinutes = Math.round((clickY % hourHeight) / (hourHeight / 4)) * 15;
    const startTime = dayjs(day).hour(8 + clickedHour).minute(clickedMinutes);    
    setSelectedCategory(null);
    setSelectedEvent({
      ...selectedEvent, day, startTime,      
      type: "schedule",
      clientId: null,
      clientName: "",
      phone: 56,
      email: "",
      specialistId: session.user?.id,
      time: `${startTime.format("HH:mm")}`,
      title: "",
      catalogId: "",
      specialtyId: "",
      serviceName: "",
      color: "",
      isValid: false,
    });
    setQuery("");
    setIsDialogOpen(true);
  };

  const handleCheckboxChange = (day) => {
    let newRule = [...selectedEvent.noAvailables];
    if (day === "Se repite") {
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
    setSelectedEvent({ 
      ...selectedEvent, 
      noAvailables: newRule, 
      isValid: validateEvent({
        ...selectedEvent, 
        noAvailables: newRule, 
      }) 
    });
  };

  const toggleAllDayCheckbox = () => {
    setIsAllDay(!isAllDay);    
    setSelectedEvent({
      ...selectedEvent,
      allDay: !isAllDay,
      isValid: validateEvent({
        ...selectedEvent,
        allDay: !isAllDay,
      })
    })
  }

  const handleSaveEvent = async () => {
    console.log("SELECTED_EVENT", selectedEvent);
    let reg = {
      specialistId: selectedEvent.specialistId,
      startDate: selectedEvent.startTime,      
    }
    if(selectedEvent.type == "schedule") {
      reg.catalogId = selectedEvent.catalogId;
      reg.durationMins = selectedEvent.durationMins;
      if(reg.cleanUpMins) {
        reg.cleanUpMins = selectedEvent.cleanUpMins;
      }
    }
    if(selectedEvent.clientId) {
      reg.clientId = selectedEvent.clientId;
      if(selectedEvent.clientName) {
        reg.clientName = selectedEvent.clientName;
      }
      if(selectedEvent.phone) {
        reg.phone = selectedEvent.phone;
      }
    }
    if(selectedEvent.allDay) {
      reg.startDate = selectedEvent.day
        .startOf("day").toDate();
      reg.allDay = true;
    }
    if(selectedEvent.isRepeating) {
      reg.fromDate = selectedEvent.fromDate;
      reg.toDate = selectedEvent.toDate;
    }
    if(selectedEvent.id) {
      reg.id = selectedEvent._id;
    }
    console.log("POSTING", reg);
    const schedule = await axios.post('/api/schedule', reg)
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
    const start = dayjs(startTime, "HH:mm");
    const end = start.add(durationMins, "minutes");    
    const [startHour, startMinute] = start.format("HH:mm").split(":").map(Number);
    const [endHour, endMinute] = end.format("HH:mm").split(":").map(Number);    
    const duration = (endHour - startHour) * EVENT_HEIGHT_FACTOR + (endMinute - startMinute);
    return duration * ROW_HEIGHT_FACTOR;
  };

  const calculateEndTime = (startTime, durationMins) => {
    return dayjs(startTime, "HH:mm").add(durationMins, "minute").format("HH:mm");
  };

  const validateEvent = (evnt) => {
    var isValid;
    console.log("VALIDANDO", evnt)
    if(evnt.type === "schedule") {
      isValid = (evnt.clientId != null 
      || (evnt.clientId == null 
        && evnt.clientName != ""
        && evnt.email != ""))
        && evnt.catalogId != ""
        && evnt.specialtyId != "";
    } else if(evnt.type === "unavailable") {
      isValid = (evnt.isRepeating && evnt.fromDate
        && evnt.toDate && evnt.noAvailables?.length > 0)
        || evnt.allDay;
    }
    console.log("ISVALID", isValid)
    return isValid ? true : false;
  }

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
        setSelectedCategory(null)
        setSelectedService(null)

        console.log("response1.data", response.data)

        const resp2 = await axios.post(`/api/schedule/bySpecialist/`, { id: session?.user?.id });
        const decoratedEvents = resp2?.data.map(s => {
          const catalog = response.data.find(c => {
            return c._id == s.catalogId
          })
          return s.clientId ? {
            id: s._id,
            type: "schedule",
            title: catalog.specialty.name,
            specialistId: session.user?._id,
            startTime: s.startDate,
            day: dayjs(s.startDate),
            time: dayjs(s.startDate).format("HH:mm"),
            clientId: s.clientId,            
            catalogId: catalog._id,
            serviceName: catalog.name,
            specialtyId: catalog.specialtyId,
            durationMins: s.duration,
            cleanUpMins: catalog.cleanUpMins,
            color: COLORS[categories.indexOf(catalog.specialty.name)]
          } : {
            id: s.id,
            type: "unavailable",
            time: dayjs(s.startDate).format("HH:mm"),
            startDate: dayjs(s.startDate).toDate(),
            endTime: s.endDate,
            allDay: s.allDay,
            durationMins: s.durationMins,
            noAvailables: s.noAvailables
          };
        })
        console.log("DecoratedEvents", decoratedEvents)
        setEvents(decoratedEvents)
        setLoadingEvents(false);
        fetchClients();
      } catch (error) {
        console.error('Error fetching catalog:', error);
      }
    };

    const fetchClients = async () => {
      try {
        const response = await axios.get('/api/client');        
        setSuggestions(response.data);        
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
                      key={`block_${index}`}
                      className="border-l p-2 flex-shrink-0 relative cursor-crosshair"
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
                        {!loadingEvents && events
                          .filter((event) =>
                            dayjs(event.day).isSame(currentWeek.add(index + offset * 7, "day"), "day")
                          )
                          .map((event, indiceEvento) => (
                            <div                            
                              key={`_calendarObj_${indiceEvento}`}
                              className={`absolute z-10 left-0 right-0 px-2 py-0.5 text-sm rounded shadow-md cursor-pointer ${event.type === "unavailable"
                                ? "bg-pink-200"
                                : `bg-${event.color}-200 border-t-2 border-t-${event.color}-500`}`}
                              style={{
                                top: `${getTimePosition(event.allDay ? "08:00" : event.time)}px`,
                                height: `${getEventHeight(event.allDay ? "08:00" : event.time, 
                                  event.allDay ? 636 : (event.durationMins + (event.cleanUpMins || 0)))}px`,
                                backgroundImage:
                                  event.type === "unavailable"
                                    ? "linear-gradient(135deg, pink 25%, white 25%, white 50%, pink 50%, pink 75%, white 75%, white 100%)"
                                    : "none",
                                backgroundSize: event.type === "unavailable" ? "20px 20px" : "none",
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                console.log("SUG", suggestions)
                                console.log("EVENT", event)
                                const user = suggestions.find(u => u._id == event.clientId);
                                setSelectedEvent({
                                  ...event,
                                  clientName: user.name,
                                  phone: user.phone,
                                  email: user.email,
                                  isValid: true,
                                });                                
                                setQuery(user.name);
                                setIsDialogOpen(true);
                              }}
                            >
                              {event.type === "schedule" && <div className={`font-bold text-xs text-${event.color}-500`}>{event.title}</div>}
                              {!event.allDay && <div className={`text-xs text-${event.type === "schedule" ? event.color : 'black'}-500 ${event.type === "unavailable" ? "font-bold" : ""}`}>{event.time} - {calculateEndTime(event.time, event.durationMins + (event.cleanUpMins || 0))}</div>}
                            </div>
                          ))}



                        <div className="absolute inset-0" />
                        <div className={`absolute left-0 right-0 px-2 py-0.5 text-sm rounded shadow-md cursor-not-allowed bg-pink-200`}
                          style={{
                            top: `${getTimePosition(index < 5 ? "13:00" : "8:00")}px`,
                            height: `${getEventHeight(index < 5 ? "13:00" : "8:00", index < 5 ? 60 : 636)}px`,
                            backgroundImage: "linear-gradient(135deg, pink 25%, white 25%, white 50%, pink 50%, pink 75%, white 75%, white 100%)",
                            backgroundSize: "20px 20px"
                          }}
                        >
                          <span className={`text-xs text-white bg-pink-500 rounded px-1 font-bold`}>{index < 5 ? "13:00 - 14:00" : "08:00 - 19:00"}</span>
                        </div>


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
          className="fixed z-20 inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50"
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
            <DialogTitle className="font-bold text-lg">Evento de calendario</DialogTitle>
            <div className="flex flex-wrap w-full">

              <div className="mt-4 w-1/2">
                <label className="block text-sm font-bold text-gray-700">Tipo</label>
                <div className="mb-2">
                  <select
                    value={selectedEvent.type}
                    onChange={(e) => {
                      setIsRepeating(false);
                      setIsAllDay(false);
                      setSelectedEvent({ 
                        ...selectedEvent, 
                        type: e.target.value, 
                        isValid: validateEvent({ ...selectedEvent, type: e.target.value }) })
                    }}
                    className="form-select mt-1 w-full border-2 pl-2 border-gray-200 rounded-md pt-2.5 pb-2.5  max-w-xs"
                  >
                    <option value="schedule">Nueva reserva</option>
                    <option value="unavailable">Día no disponible</option>
                  </select>
                </div>
              </div>

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
                              phone: "",
                              isValid: false,
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
                                    phone: user.phone || 56,
                                    isValid: validateEvent({ ...selectedEvent,  
                                      clientId: user._id,
                                      clientName: user.name || '',
                                      email: user.email || '',
                                      phone: user.phone || 56,                                      
                                    }),
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
                      onChange={(e) => {
                        setSelectedEvent({ 
                          ...selectedEvent, 
                          email: e.target.value, 
                          isValid: validateEvent({ 
                            ...selectedEvent,  
                            email: e.target.value
                          }) 
                        })
                      }} />
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
                        value={selectedEvent.title}
                        onChange={(e) => {
                          if(e.target.value != "") {
                            setSelectedCategory(catalogs[e.target.value]);
                            setSelectedEvent({
                              ...selectedEvent,
                              title: e.target.value,
                              catalogId: "",
                              specialtyId: "",
                              serviceName: "",
                              color: COLORS[Object.keys(catalogs).indexOf(e.target.value)],
                              isValid: false,
                            })
                          } else {
                            setSelectedCategory(null);
                            setSelectedEvent({
                              ...selectedEvent,
                              title: "",
                              catalogId: "",
                              specialtyId: "",
                              serviceName: "",
                              color: null,
                              isValid: false,
                            })
                          }                          
                        }}
                        className="form-select mt-1 w-full border-2 border-gray-200 rounded-md pl-2 py-2.5 max-w-xs"
                      >
                        <option value="">Seleccione una</option>
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
                        value={selectedEvent.specialtyId}
                        onChange={(e) => {
                          const selectedOption = e.target.options[e.target.selectedIndex];
                          const specialtyId = selectedOption.getAttribute('id');
                          console.log("OPTION", selectedOption)
                          console.log("TITLE", selectedEvent.title)
                          if (selectedOption.value !== "") {
                            console.log("BUSCANDO", selectedEvent.title, "EN", catalogs[selectedEvent.title])
                            setSelectedEvent({
                              ...selectedEvent,
                              serviceName: selectedOption.value,
                              catalogId: catalogs[selectedEvent.title].find(c => c._id == specialtyId)._id,
                              specialtyId,
                              isValid: validateEvent({
                                ...selectedEvent,
                                serviceName: selectedOption.value,
                                catalogId: catalogs[selectedEvent.title].find(c => c._id == specialtyId)._id,
                                specialtyId
                              }),
                            });
                          } else {
                            setSelectedEvent({
                              ...selectedEvent,
                              title: "",
                              serviceName: "",
                              catalogId: "",
                              specialtyId: "",
                              isValid: false,
                            });
                          }
                        }}
                        className="form-select mt-1 border-2 border-gray-200 rounded-md pl-2 py-2.5 w-full"
                      >
                        <option value="">Seleccione uno</option>
                        {selectedCategory && selectedCategory.length > 0 && selectedCategory.map(c => (
                          <option key={c._id} value={c.name} id={c._id}>
                            {c.name.substring(0, 35) + (c.name.length > 35 ? '…' : '')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}              

              {selectedEvent.type === "unavailable" && (
                <div className="w-1/4 mt-14 ml-6">
                  <input
                    type="checkbox"
                    checked={isRepeating}
                    onChange={() => {
                      setIsRepeating(!isRepeating)
                    }}
                    className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2">Se repite</span>
                </div>
              )}

              {selectedEvent.type === "unavailable" && <div className="mt-14">
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={() => {
                    toggleAllDayCheckbox();
                  }}
                  className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                />
                <span className="ml-2">Todo el día</span>
                </div>}

              {!isAllDay && <div className="w-1/3 mt-4">
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
              </div>}

              {!isAllDay && <div className="w-1/3 mt-4 pl-4">
                <label className="block text-sm font-bold text-gray-700">Duración mins.</label>
                <input
                  type="number"
                  value={selectedEvent.durationMins}
                  onChange={(e) => 
                    setSelectedEvent({
                      ...selectedEvent,
                      durationMins: Number(e.target.value),
                    })}
                  className="form-input mt-1 block w-full border-2 border-gray-200 rounded-md p-2 pb-2.5"                  
                />
              </div>}

              {selectedEvent.type === "schedule" && <div className="w-1/3 mt-4 pl-4">
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
              </div>}              

              {(selectedEvent.type === "unavailable" && isRepeating) && <div className="flex w-full"><div className="w-1/2 mt-4 mr-4">
                <label className="block text-sm font-bold text-gray-700">Fecha de inicio</label>
                <input
                  type="date"
                  value={dayjs(selectedEvent.day).format("YYYY-MM-DD")}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      fromDate: dayjs(e.target.value).toDate(),
                    })
                  }
                  className="form-input mt-1 block w-full border-2 border-gray-200 rounded-md p-2"
                />
              </div>
                <div className="w-1/2 mt-4">
                  <label className="block text-sm font-bold text-gray-700">Fecha de fin</label>
                  <input
                    type="date"
                    value={dayjs(selectedEvent.endDate).format("YYYY-MM-DD")}
                    onChange={(e) =>
                      setSelectedEvent({
                        ...selectedEvent,
                        toDate: dayjs(e.target.value).toDate(),
                      })
                    }
                    className="form-input mt-1 block w-full border-2 border-gray-200 rounded-md p-2"
                  />
                </div></div>}

              {isRepeating && (
                <div className="mt-4">
                  <label className="block text-sm font-bold text-gray-700">Días</label>
                  <div className="columns-3 mb-2">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={
                            selectedEvent.noAvailables.includes(day) ||
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
                disabled={!selectedEvent.isValid && 'disabled'}
                className={`flex items-center px-4 py-2 bg-${!selectedEvent.isValid ? 'slate-300' : 'green-500'} text-white rounded`}
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
