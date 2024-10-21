'use client'
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { Navigation } from "@/components/Navigation";
import { ImportCatalog } from "@/components/AdminPanel/ImportCatalog"

export default async function UpdateCatalog() {
    const session = await getServerSession(authOptions);    
    return (        
        <main>
            <Navigation session={session}/>
            <ImportCatalog session={session}></ImportCatalog>
        </main>        
    );
}