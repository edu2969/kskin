import { ImportCatalog } from "@/components/AdminPanel/ImportCatalog"
import Navigation from '@/components/Navigation';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/utils/authOptions";

export default async function UpdateCatalog() {
    const session = await getServerSession(authOptions);
    return (        
        <main>
            <Navigation session={session}/>
            <ImportCatalog session={session}/>
        </main>        
    );
}