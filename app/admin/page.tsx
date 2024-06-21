import { ImportCatalog } from "@/components/AdminPanel/ImportCatalog"
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { Navigation } from "@/components/Navigation";

export default async function Agenda({ params } : { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    return (        
        <main>
            <Navigation session={session}/>
            <ImportCatalog session={session}></ImportCatalog>
        </main>        
    );
}