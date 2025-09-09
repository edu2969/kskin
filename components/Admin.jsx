"use client"

import { useSession } from "next-auth/react";
import Image from "next/image";
import { LoginForm } from "./LoginForm";
import { Navigation } from "./Navigation";
import { SpecialistPanel } from "./SpecialistPanel";

export const AdminPage = () => {
    const { data: session } = useSession();

    useEffect(() => {
        if(status === 'loading') return;
        if(session && session.user && session.user?.role) {
            setRole(session.user.role);
        }
    }, [session, setRole, status]);
    
    return (<main className="bg-[#EDF3FB] min-h-screen">
        <Navigation />
        {!session?.user && <div className="bg-[#EDF3FB] p-4">
            <Image src="/logo.png" alt="logo" width={200} height={200} className="m-auto my-8 rounded-lg" />
        </div>}
        {!session?.user ? <LoginForm session={session} /> : <>{session.user.role == "specialist" ?
            <SpecialistPanel /> :
            <>Cliente</>}</>}
    </main>);
}

