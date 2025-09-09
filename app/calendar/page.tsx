import { Navigation } from "@/components/Navigation";
import { EventListView } from "@/components/CalendarPanel/EventListView";

export default async function Agenda() {
    return (        
        <main>
            <Navigation/>
            <EventListView height={Math.floor(11 * 1024 / 12)}/>
        </main>        
    );
}