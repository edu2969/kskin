"use client"

import Image from "next/image";
import { LoginForm } from "./AdminPanel/LoginForm";
import { SpecialistPanel } from "./AdminPanel/SpecialistPanel";
import Navigation from "./Navigation";

export const Admin = ({ session }) => {
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

