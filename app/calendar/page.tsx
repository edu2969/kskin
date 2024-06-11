import { Navigation } from "@/components/Navigation"
import { EventsPanel } from "@/components/EventsPanel"
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export default async function Agenda() {
    const session = await getServerSession(authOptions);
    return (        
        <main>
            <Navigation session={session} />
            <EventsPanel session={session}/>
        </main>        
    );
}