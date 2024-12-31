import { authOptions } from "../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { EventListView } from "@/components/CalendarPanel/EventListView";
import { CalendarView } from "@/components/CalendarPanel/CalendarView";
import { Loader } from "@/components/Loader";

export default async function AgendaPage() {
    const session = await getServerSession(authOptions);
    return (        
        <div className="absolute top-0 left-0 w-full h-full bg-white overflow-hidden">
            <div>
                <div className={`w-full overflow-y-scroll`} style={{ height: Math.floor(11 * 1024 / 12) + "px" }}>
                    {session?.user && session.user.role === "specialist" ? 
                    <CalendarView session={session} height={Math.floor(11 * 1024 / 12)}/> :
                    <EventListView height={Math.floor(11 * 1024 / 12)} session={session} />
                }
                </div>
            </div> : <Loader text="Cargando" />
        </div>
    );
}