'use client'
import { IoCalendar } from "react-icons/io5";
import { FaTasks } from "react-icons/fa";
import { useState } from "react"
import { Calendar } from "./CalendarPanel/CalendarView"
import { EventListView } from "./CalendarPanel/EventListView"
import { useWindowDimensions } from "@/app/utils/useWindowDimensions"
import { Loader } from "@/components/Loader"

export const EventsPanel = ({ session }) => {
    const [mode, setMode] = useState(1);
    const { width, height } = useWindowDimensions();

    return (
        <div className="absolute top-0 left-0 w-full h-full bg-white overflow-hidden">
            {height ? <div>
                <div className={`top-0 left-0 h-[${Math.round(height / 12)}px] flex justify-center`}>
                    <IoCalendar size="3.5rem" className="fill-white bg-primary rounded-md p-2 m-2" onClick={() => { setMode(mode == 0 ? 1 : 0) }} />
                    <FaTasks size="3.5rem" className="fill-white bg-primary rounded-md p-2 m-2" onClick={() => { setMode(mode == 0 ? 1 : 0) }} />
                    <p className="w-[300px] text-primary uppercase tracking-widest ml-4 mt-6">{mode == 0 ? 'vista calendario' : 'listado de eventos'}</p>
                </div>
                <div className={`w-full overflow-y-scroll`} style={{ height: Math.floor(11 * height / 12) + "px" }}>
                    {mode == 0 ? 
                        <Calendar height={Math.floor(11 * height / 12)} session={session} /> : 
                        <EventListView height={Math.floor(11 * height / 12)} session={session} />}
                </div>
            </div> : <Loader />}
        </div>
    )
}