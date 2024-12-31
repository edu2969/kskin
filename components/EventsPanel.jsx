'use client'
import { Calendar } from "./CalendarPanel/CalendarView"
import { EventListView } from "./CalendarPanel/EventListView"
import { Loader } from "@/components/Loader"

export const EventsPanel = ({ session }) => {
    const height = 1024;

    return (
        <div className="absolute top-0 left-0 w-full h-full bg-white overflow-hidden">
            {height ? <div>
                <div className={`w-full overflow-y-scroll`} style={{ height: Math.floor(11 * height / 12) + "px" }}>
                    {session?.user?.role === "user" ? 
                        <EventListView height={Math.floor(11 * height / 12)} session={session} /> :
                        <Calendar height={Math.floor(11 * height / 12)} session={session} />}
                </div>
            </div> : <Loader />}
        </div>
    )
}