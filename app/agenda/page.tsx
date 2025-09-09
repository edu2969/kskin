import Navigation from "@/components/Navigation";
import { Agenda } from "@/components/Agenda";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/utils/authOptions";

export default async function AgendaPage() {
    const session = await getServerSession(authOptions);
    const height = 2080;
    return (
        <>
            <Navigation session={session}/>
            <Agenda height={height}/>
        </>
    );
}