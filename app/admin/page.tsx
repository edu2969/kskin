import { Navigation } from "@/components/Navigation"
import { AdminPanel } from "@/components/AdminPanel"
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export default async function Agenda({ params } : { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    return (        
        <main>
            <AdminPanel session={session}></AdminPanel>
        </main>        
    );
}