"use client";

import { useSession } from "next-auth/react";
import { CalendarView } from "./CalendarPanel/CalendarView";
import { EventListView } from "./CalendarPanel/EventListView";
import { Loader } from "./Loader";

export const Agenda = ({ height }) => {
    const { data: session } = useSession();

    useEffect(() => {
        if(status === 'loading') return;
        if(session && session.user && session.user?.role) {
            setRole(session.user.role);
        }
    }, [session, setRole, status]);

    return (<div className="absolute top-0 left-0 w-full h-full bg-white overflow-hidden">
        <div>
            <div className={`w-full overflow-y-scroll`} style={{ height: Math.floor(11 * height / 12) + "px" }}>
                {session?.user && session.user.role === "specialist" ?
                    <CalendarView session={session} height={Math.floor(11 * height / 12)} /> :
                    <EventListView height={Math.floor(11 * height / 12)} session={session} />
                }
            </div>
        </div> : <Loader text="Cargando" />
    </div>);
}