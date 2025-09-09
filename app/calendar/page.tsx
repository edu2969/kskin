import Navigation from "@/components/Navigation";
import { EventListView } from "@/components/CalendarPanel/EventListView";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/utils/authOptions";

export default async function Agenda() {
    const session = await getServerSession(authOptions);
    return (        
        <main>
            <Navigation session={session}/>
            <EventListView height={Math.floor(11 * 1024 / 12)} session={session}/>
        </main>
    );
}