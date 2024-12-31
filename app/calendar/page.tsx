import { Navigation } from "@/components/Navigation";
import { EventListView } from "@/components/CalendarPanel/EventListView";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export default async function Agenda() {
    const session = await getServerSession(authOptions);
    return (        
        <main>
            <Navigation session={session} />
            <EventListView height={Math.floor(11 * 1024 / 12)} session={session} />
        </main>        
    );
}