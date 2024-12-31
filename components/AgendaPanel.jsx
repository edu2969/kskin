'use client'
import { IoCalendar } from "react-icons/io5";
import { FaTasks } from "react-icons/fa";
import { useState } from "react"
import { Calendar } from "./CalendarPanel/CalendarView"
import { EventListView } from "./CalendarPanel/EventListView"
import { useWindowDimensions } from "@/app/utils/useWindowDimensions"
import { Loader } from "@/components/Loader"

export const AgendaPanel = ({ session }) => {    

    // TODO: un método async que llame a todas las schedule (GET) con el id de usuario
    // y devuelva un array de eventos
    const getEvents = async () => {
        return [];
    }

    return (
        <div className="absolute top-0 left-0 w-full h-full bg-white overflow-hidden">
            {height ? <div>
                HOLA!
            </div> : <Loader />}
        </div>
    )
}