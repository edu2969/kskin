import { Navigation } from "@/components/Navigation";
import { Agenda } from "@/components/Agenda";

export default async function AgendaPage() {
    const height = 2080;
    return (
        <>
            <Navigation/>
            <Agenda height={height}/>
        </>
    );
}